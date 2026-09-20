import { NextResponse } from 'next/server';
import { isCategoryId, resolveCategory } from '@/lib/categories';
import { renderPitchEmail } from '@/app/api/email/render';

export const dynamic = 'force-dynamic';

/**
 * Look at the pitch email without sending one.
 *
 * Renders through the same function the send path uses, so what shows
 * here is what lands in the inbox. Nothing is read from or written to
 * the database and no mail leaves the building.
 *
 * /admin/preview/email/interior
 * /admin/preview/email/clinic?name=Aashu%20Dental&person=Dr.%20K.%20K.%20Shah
 */
const SAMPLE = {
  clinic: {
    clinicname: 'Aashu Dental and Multispeciality Clinic',
    doctorname: 'Dr. K. K. Shah',
    address: 'Shop 4, Ankur Road, Naranpura, Ahmedabad, Gujarat 380013',
  },
  interior: {
    clinicname: 'Aarav Interiors',
    doctorname: 'Aarav Shah',
    address: 'Studio 12, Bopal, Ahmedabad, Gujarat 380058',
  },
};

export async function GET(request, { params }) {
  const { category: id } = await params;

  if (!isCategoryId(id)) {
    return new NextResponse(`Unknown category "${id}"`, { status: 404 });
  }

  try {
    const q = request.nextUrl.searchParams;
    const base = SAMPLE[id] || SAMPLE.clinic;
    const lead = {
      slug: 'preview',
      email: 'preview@example.com',
      category: id,
      ...base,
      clinicname: q.get('name') || base.clinicname,
      doctorname: q.has('person') ? q.get('person') : base.doctorname,
    };

    // The send path refuses a localhost APP_URL, because a dead link in a
    // cold email cannot be taken back. A preview has no such problem.
    const appUrl = process.env.APP_URL || 'https://example.com';
    const { subject, html } = renderPitchEmail({ lead, appUrl });

    const label = resolveCategory(id).label;
    const banner = `<div style="font:12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#6b7280;background:#fff;border-bottom:1px solid #e5e7eb;padding:10px 16px;">
      <b style="color:#111827">${label} pitch</b> &nbsp;·&nbsp; Subject: ${subject}
      &nbsp;·&nbsp; preview only, nothing is sent
    </div>`;

    return new NextResponse(html.replace('<body>', '<body>' + banner), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Email preview failed:', error);
    return new NextResponse('Email preview failed', { status: 500 });
  }
}
