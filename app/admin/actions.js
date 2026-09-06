'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { normaliseTemplate, DEFAULT_TEMPLATE } from '@/lib/templates';

/**
 * Change which demo template a lead is pitched with.
 *
 * normaliseTemplate turns anything we do not serve into 'classic', so a
 * stale form value can never write a template that would 404.
 */
export async function setLeadTemplate(leadId, template) {
  await pool.query('UPDATE leads SET template = $1 WHERE id = $2', [
    normaliseTemplate(template),
    leadId,
  ]);
  revalidatePath('/admin');
}

/** Same, for everything currently selected in the table. */
export async function setTemplateForLeads(leadIds, template) {
  const ids = (leadIds || []).filter(Boolean);
  if (!ids.length) return { updated: 0 };

  // id::text so this works whether the column is text, uuid or an int -
  // the schema file in this repo does not match the live table.
  const result = await pool.query(
    'UPDATE leads SET template = $1 WHERE id::text = ANY($2::text[])',
    [normaliseTemplate(template), ids.map(String)]
  );
  revalidatePath('/admin');
  return { updated: result.rowCount };
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

export async function bulkImportLeads(leads, batchTemplate = DEFAULT_TEMPLATE) {
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

    // A Template column in the sheet wins for that row; otherwise the
    // whole batch gets whatever was picked on the import screen.
    const template = normaliseTemplate(
      cleanStr(lead['Template'] || lead['Theme']).toLowerCase() || batchTemplate
    );

    await pool.query(
      `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address, template)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [slug, clinicName, doctorName, phone, '', email, address, template]
    );
  }
  revalidatePath('/admin');
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('outreach_auth');
  redirect('/login');
}
