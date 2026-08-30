import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const result = await pool.query('SELECT * FROM leads WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return new NextResponse('Demo not found', { status: 404 });
    }
    const lead = result.rows[0];

    // Track visit - async update DB
    if (!lead.demovisited) {
      pool.query('UPDATE leads SET "demovisited" = true WHERE id = $1', [lead.id]).catch(console.error);
    }

    // Read index.html
    const templatePath = path.join(process.cwd(), 'index.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Make sure relative assets load from root
    if (!html.includes('<base href="/"/>')) {
      html = html.replace('<head>', '<head>\n  <base href="/" />');
    }

    // Replace hardcoded doctor name
    const doctorName = lead.doctorname || "Dr. Rajesh Kumar";
    html = html.replace(/Dr\. Elena Marsh/g, doctorName);
    html = html.replace(/Dr\. Eleanor Marsh/g, doctorName);
    // Be careful with Dr. Marsh, replace it with just the last name or full name
    const lastName = doctorName.split(' ').pop();
    html = html.replace(/Dr\. Marsh/g, `Dr. ${lastName}`);

    // Setup fallback data for missing fields
    const defaultPhone = "+91 6356 182 998";
    const phoneToUse = lead.phone || defaultPhone;
    const whatsappToUse = lead.whatsapp || lead.phone || defaultPhone;
    const addressToUse = lead.address || "SG Highway, Ahmedabad, Gujarat";

    // Generate the clinic object to inject
    const clinicObj = {
      name: lead.clinicname,
      suffix: "",
      tagline: `A modern clinic caring for you.`,
      phone: phoneToUse,
      phoneRaw: phoneToUse.replace(/\D/g, ''),
      whatsapp: whatsappToUse.replace(/\D/g, ''),
      email: lead.email,
      address: addressToUse,
      area: addressToUse.split(',').pop().trim() || 'Ahmedabad',
      hours: {
        mon: ["08:00", "19:00"],
        tue: ["08:00", "19:00"],
        wed: ["08:00", "19:00"],
        thu: ["08:00", "19:00"],
        fri: ["08:00", "18:00"],
        sat: ["09:00", "14:00"],
        sun: null
      }
    };

    // Replace the CLINIC object in the template
    const clinicRegex = /const CLINIC = {[\s\S]*?};/m;
    html = html.replace(clinicRegex, `const CLINIC = ${JSON.stringify(clinicObj, null, 2)};`);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error serving template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
