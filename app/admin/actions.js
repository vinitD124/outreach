'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateLead(leadId, data) {
  await pool.query(
    `UPDATE leads 
     SET clinicname = $1, doctorname = $2, email = $3, phone = $4 
     WHERE id = $5`,
    [data.clinicname, data.doctorname, data.email, data.phone, leadId]
  );
  
  revalidatePath('/admin');
}

export async function bulkImportLeads(leads) {
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
    
    await pool.query(
      `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [slug, clinicName, doctorName, phone, '', email, address]
    );
  }
  revalidatePath('/admin');
}
