import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { resolveTemplate } from '@/lib/templates';
import { renderClassic } from '@/lib/render/classic';
import { renderMicare } from '@/lib/render/micare';
import { loadTemplateHtml } from '@/lib/render/load';

export const dynamic = 'force-dynamic';

const RENDERERS = {
  classic: renderClassic,
  micare: renderMicare,
};

const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

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

    // A row written before the template column existed has no value at
    // all; resolveTemplate turns anything unrecognised into the classic
    // template, which is what keeps every already-sent link working.
    const template = resolveTemplate(lead.template);
    const render = RENDERERS[template.id] || renderClassic;

    const html = render(loadTemplateHtml(template.id), lead);

    return new NextResponse(html, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('Error serving template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
