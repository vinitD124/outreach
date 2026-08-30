import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import LeadTable from './LeadTable';
import AddLeadDialog from './AddLeadDialog';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const result = await pool.query('SELECT * FROM leads ORDER BY "createdat" DESC');
  const leads = result.rows;

  async function addLead(formData) {
    'use server';
    const slug = formData.get('clinicName').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);
    
    await pool.query(
      `INSERT INTO leads (slug, clinicname, doctorname, phone, whatsapp, email, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        slug,
        formData.get('clinicName'),
        formData.get('doctorName'),
        formData.get('phone'),
        formData.get('whatsapp'),
        formData.get('email'),
        formData.get('address')
      ]
    );
    revalidatePath('/admin');
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">My Leads</h1>
            <p className="text-slate-500 font-medium">Bulk generate clinic demos, manage leads, and automate your entire pitch sequence.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
             <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-widest shadow-sm">
               {leads.length} Active Leads
             </div>
             <AddLeadDialog action={addLead} />
          </div>
        </header>

        <div className="w-full">
          <LeadTable leads={leads} />
        </div>
      </div>
    </div>
  );
}
