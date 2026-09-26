'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEFAULT_TEMPLATE } from '@/lib/templates';
import {
  normaliseCategory, templateFor, DEFAULT_CATEGORY,
} from '@/lib/categories';

/**
 * Read the categories of some leads.
 *
 * Falls back to the default if the column is not there yet - 42703 is
 * "column does not exist" - so a deploy that lands before the migration
 * degrades to the old single-vertical behaviour instead of throwing.
 */
async function categoriesOf(ids) {
  try {
    const { rows } = await pool.query(
      'SELECT id, category FROM leads WHERE id::text = ANY($1::text[])',
      [ids.map(String)]
    );
    return new Map(rows.map((r) => [String(r.id), r.category || DEFAULT_CATEGORY]));
  } catch (err) {
    if (!err || err.code !== '42703') throw err;
    return new Map(ids.map((id) => [String(id), DEFAULT_CATEGORY]));
  }
}

/**
 * Change which demo template a lead is pitched with.
 *
 * The lead's own category decides what it is allowed to be, so a stale
 * form value cannot put a clinic on the interior demo. Anything the
 * category does not serve falls back to what that category ships with.
 */
export async function setLeadTemplate(leadId, wanted) {
  const category = (await categoriesOf([leadId])).get(String(leadId)) || DEFAULT_CATEGORY;
  const template = templateFor(category, wanted);

  await pool.query('UPDATE leads SET template = $1 WHERE id = $2', [template, leadId]);
  revalidatePath('/admin');
  return { template, corrected: template !== String(wanted || '').toLowerCase() };
}

/**
 * Same, for everything currently selected in the table.
 *
 * Applied per row against that row's category rather than as one blanket
 * UPDATE. A selection spanning categories used to write the chosen
 * template to all of them; now the rows whose category cannot use it are
 * left alone and counted, so the toast reports what really happened.
 */
export async function setTemplateForLeads(leadIds, wanted) {
  const ids = (leadIds || []).filter(Boolean);
  if (!ids.length) return { updated: 0, skipped: 0 };

  const cats = await categoriesOf(ids);
  const eligible = ids.filter(
    (id) => templateFor(cats.get(String(id)) || DEFAULT_CATEGORY, wanted)
      === String(wanted || '').toLowerCase()
  );
  const skipped = ids.length - eligible.length;
  if (!eligible.length) return { updated: 0, skipped };

  // id::text so this works whether the column is text, uuid or an int -
  // the schema file in this repo does not match the live table.
  const result = await pool.query(
    'UPDATE leads SET template = $1 WHERE id::text = ANY($2::text[])',
    [String(wanted).toLowerCase(), eligible.map(String)]
  );
  revalidatePath('/admin');
  return { updated: result.rowCount, skipped };
}

/**
 * Record that a WhatsApp message was opened for this lead.
 *
 * WhatsApp is handed off to the phone, so there is no delivery receipt to
 * wait for - the honest thing this records is "I opened the chat for them",
 * which is what stops the same clinic being messaged twice.
 *
 * Written defensively: if the columns have not been added yet the action
 * returns instead of throwing, so the button still opens WhatsApp and the
 * table keeps working.
 */
export async function markWhatsappSent(leadId) {
  try {
    await pool.query(
      'UPDATE leads SET whatsappsent = true, whatsappsentat = NOW() WHERE id = $1',
      [leadId]
    );
  } catch (err) {
    // 42703 is "column does not exist"
    if (err && err.code === '42703') return { ok: false, reason: 'columns-missing' };
    throw err;
  }
  revalidatePath('/admin');
  return { ok: true };
}

export async function updateLead(leadId, data) {
  await pool.query(
    `UPDATE leads 
     SET clinicname = $1, doctorname = $2, email = $3, phone = $4 
     WHERE id = $5`,
    [data.clinicname, data.doctorname, data.email, data.phone, leadId]
  );
  
  revalidatePath('/admin');
}

export async function bulkImportLeads(leads, batchTemplate = DEFAULT_TEMPLATE, batchCategory = DEFAULT_CATEGORY) {
  for (const lead of leads) {
    const cleanStr = (str) => {
      if (!str) return '';
      const s = String(str).trim();
      return (s.toLowerCase() === 'none listed' || s === '-' || s.toLowerCase() === 'n/a') ? '' : s;
    };

    const clinicName = cleanStr(lead['Clinic Name']);
    if (!clinicName) continue; // Skip rows without a clinic name

    const doctorName = cleanStr(lead['Doctor Name']);
    const email = cleanStr(lead['Email'] || lead['Public Email'] || lead['Email Address']);
    const phone = cleanStr(lead['Phone'] || lead['Phone Number'] || lead['Contact']);
    const address = cleanStr(lead['Address'] || lead['Location']);

    const slug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

    // A Category column in the sheet wins for that row; otherwise the
    // whole batch gets whatever was picked on the import screen.
    const category = normaliseCategory(
      cleanStr(lead['Category'] || lead['Type']) || batchCategory
    );

    // The category decides what the row is allowed to be. A Template
    // column it cannot use is corrected to whatever the category ships
    // with rather than stored, so a sheet cannot put a clinic on the
    // interior demo. The import preview shows the corrections first.
    const rawTemplate = cleanStr(lead['Template'] || lead['Theme']).toLowerCase();
    const template = templateFor(category, rawTemplate || batchTemplate);

    // Falls back to the pre-category shape if the column has not been
    // added yet, so deploying before running the migration cannot break
    // importing. 42703 is "column does not exist".
    try {
      await pool.query(
        `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address, template, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [slug, clinicName, doctorName, phone, '', email, address, template, category]
      );
    } catch (err) {
      if (!err || err.code !== '42703') throw err;
      await pool.query(
        `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address, template)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [slug, clinicName, doctorName, phone, '', email, address, template]
      );
    }
  }
  revalidatePath('/admin');
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('outreach_auth');
  redirect('/login');
}
