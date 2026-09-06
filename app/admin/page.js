import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import LeadTable from './LeadTable';
import AddLeadDialog from './AddLeadDialog';
import { normaliseTemplate } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const result = await pool.query('SELECT * FROM leads ORDER BY "createdat" DESC');
  const leads = result.rows;

  async function addLead(formData) {
    'use server';
    const slug = formData.get('clinicName').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);

    await pool.query(
      `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address, template)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        slug,
        formData.get('clinicName'),
        formData.get('doctorName'),
        formData.get('phone'),
        formData.get('whatsapp'),
        formData.get('email'),
        formData.get('address'),
        normaliseTemplate(formData.get('template'))
      ]
    );
    revalidatePath('/admin');
  }

  const ready = leads.filter((l) => l.email && !l.emailsent).length;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {ready > 0
              ? <>You have <b className="nums font-semibold text-foreground">{ready}</b> {ready === 1 ? 'clinic' : 'clinics'} ready to pitch.</>
              : <>Nothing waiting to be pitched. Import a list to add more.</>}
          </p>
        </div>
        <AddLeadDialog action={addLead} />
      </header>

      <LeadTable leads={leads} />
    </div>
  );
}
