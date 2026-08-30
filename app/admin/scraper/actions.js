'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addScrapedLead(data) {
  const slug = data.clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);
  
  await pool.query(
    `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      slug,
      data.clinicName,
      data.doctorName || '',
      data.phone || '',
      data.whatsapp || '',
      data.email || '',
      data.address || ''
    ]
  );
  
  revalidatePath('/admin');
}
