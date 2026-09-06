import { NextResponse } from 'next/server';
import { resolveTemplate, isTemplateId } from '@/lib/templates';
import { renderClassic } from '@/lib/render/classic';
import { renderMicare } from '@/lib/render/micare';
import { loadTemplateHtml } from '@/lib/render/load';

export const dynamic = 'force-dynamic';

const RENDERERS = { classic: renderClassic, micare: renderMicare };

/**
 * Look at a template without spending a lead on it.
 *
 * Sits under /admin so the existing auth matcher covers it. Renders from
 * a made-up row, so nothing is read from or written to the database and
 * no demovisited flag gets tripped.
 *
 * /admin/preview/micare
 * /admin/preview/micare?clinic=Aashu%20Dental&doctor=Dr.%20K.K.%20Shah
 */
const SAMPLE = {
  id: 'preview',
  slug: 'preview',
  clinicname: 'Aashu Dental and Multispeciality Clinic',
  doctorname: 'Dr. K. K. Shah',
  phone: '+91 98251 47293',
  whatsapp: '',
  email: 'reception@example.com',
  address: 'Shop 4, Ankur Road, Naranpura, Ahmedabad, Gujarat 380013',
  demovisited: true,
};

export async function GET(request, { params }) {
  const { template: id } = await params;

  if (!isTemplateId(id)) {
    return new NextResponse(`Unknown template "${id}"`, { status: 404 });
  }

  try {
    // let the caller try their own clinic against the layout
    const q = request.nextUrl.searchParams;
    const lead = {
      ...SAMPLE,
      clinicname: q.get('clinic') || SAMPLE.clinicname,
      doctorname: q.get('doctor') || SAMPLE.doctorname,
    };

    const template = resolveTemplate(id);
    const render = RENDERERS[template.id] || renderClassic;
    const html = render(loadTemplateHtml(template.id), lead);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Preview failed:', error);
    return new NextResponse('Preview failed', { status: 500 });
  }
}
