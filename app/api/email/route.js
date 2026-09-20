import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import pool from '@/lib/db';
import { COOKIE_NAME, verifySession } from '@/lib/auth';
import { renderPitchEmail } from './render';

export async function POST(request) {
  try {
    // Checked here as well as in the proxy. This endpoint sends real mail on
    // real SMTP credentials, so it should not depend on a matcher pattern in
    // another file staying correct.
    const jar = await cookies();
    if (!(await verifySession(jar.get(COOKIE_NAME)?.value))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, subjectTemplate, bodyTemplate } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // A demo link pointing at localhost is dead on arrival for every
    // recipient, and a cold email cannot be unsent. Refuse rather than
    // burn the lead.
    const appUrl = process.env.APP_URL || '';
    if (!appUrl || /localhost|127\.0\.0\.1/i.test(appUrl)) {
      return NextResponse.json({
        error: 'APP_URL is missing or points at localhost, so the demo link would be dead for the recipient. Set APP_URL to the public site URL before sending.'
      }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    const lead = result.rows[0];

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const { subject, text, html } = renderPitchEmail({
      lead,
      appUrl,
      subjectTemplate,
      bodyTemplate,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: lead.email,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);

    // Update DB
    await pool.query('UPDATE leads SET "emailsent" = true, "emailsentat" = CURRENT_TIMESTAMP WHERE id = $1', [leadId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    // Surface the real reason. A generic string here is why bulk failures
    // were invisible.
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
