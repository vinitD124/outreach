import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { leadId, subjectTemplate, bodyTemplate } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    const lead = result.rows[0];

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Extract area for the template
    const address = lead.address || "your city";
    const area = address.split(',').pop().trim() || "your city";

    // Replace placeholders
    const replacePlaceholders = (text) => {
      if (!text) return '';
      return text
        .replace(/{{clinicname}}/gi, lead.clinicname || 'your clinic')
        .replace(/{{doctorname}}/gi, lead.doctorname ? `Dr. ${lead.doctorname}` : 'Team')
        .replace(/{{area}}/gi, area)
        .replace(/{{slug}}/gi, lead.slug);
    };

    const finalSubject = replacePlaceholders(subjectTemplate || `I built this for {{clinicname}}`);
    
    // Default high-converting plain-text template if none provided
    const defaultBody = `Hi {{doctorname}},

I came across {{clinicname}} while looking at practices in {{area}} and had an idea for how you could be presented online.

Rather than sending you a proposal, I actually built a private website concept specifically for your practice.

[VIEW THE WEBSITE I BUILT →]
${process.env.APP_URL || 'http://localhost:3000'}/{{slug}}

It takes about 30 seconds to look through, and it was made specifically for {{clinicname}} — not a generic template.

If you like the direction, we can talk. If not, no problem at all.

Vinit Dharaiya
Independent Web Developer
WhatsApp: +91 6356 182 998`;

    const finalBody = replacePlaceholders(bodyTemplate || defaultBody);

    // Create a plain-text style HTML wrapper for maximum deliverability
    // We convert the [VIEW THE WEBSITE I BUILT] block into a clean hyperlink
    
    // Extract the URL
    const urlMatch = finalBody.match(/https?:\/\/[^\s<]+/);
    const url = urlMatch ? urlMatch[0] : '';
    
    // Format the text to match the screenshot (bolding specific parts)
    let formattedHtmlText = finalBody
      .replace(/<[^>]*>?/gm, '') // Strip any accidental HTML
      .replace(/\n/g, '<br/>') // Convert newlines
      .replace(new RegExp(lead.clinicname, 'gi'), `<strong>${lead.clinicname}</strong>`)
      .replace(/private website concept/i, '<strong>private website concept</strong>')
      .replace(new RegExp(`Hi Dr. ${lead.doctorname}`, 'gi'), `<strong>Hi Dr. ${lead.doctorname}</strong>`);

    if (url) {
      // Replace the raw URL with the large full-width black button with monitor icon
      const buttonHtml = `
        <div style="margin: 32px 0;">
          <a href="${url}" style="display: block; width: 100%; box-sizing: border-box; text-align: center; padding: 18px 24px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
            <svg style="vertical-align: middle; margin-right: 8px; margin-bottom: 2px;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            VIEW THE WEBSITE I BUILT &rarr;
          </a>
        </div>
      `;
      formattedHtmlText = formattedHtmlText
        .replace(/\[VIEW THE WEBSITE I BUILT \u2192\]<br\/>https?:\/\/[^\s<]+/, buttonHtml)
        .replace(/\[VIEW THE WEBSITE I BUILT →\]<br\/>https?:\/\/[^\s<]+/, buttonHtml);
    }
    
    // Remove the Vinit Dharaiya signature from the raw text because we are building a custom footer
    formattedHtmlText = formattedHtmlText.replace(/Vinit Dharaiya<br\/>Independent Web Developer<br\/>WhatsApp: \+91 6356 182 998/gi, '');

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            font-size: 15px;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 40px 20px;
            background-color: #f9fafb;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 48px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          strong {
            color: #111827;
            font-weight: 600;
          }
          .footer {
            margin-top: 48px;
            padding-top: 32px;
            border-top: 1px solid #f3f4f6;
          }
          .profile {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
          }
          .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: #991b1b;
            margin-right: 16px;
            display: inline-block;
            vertical-align: middle;
          }
          .profile-info {
            display: inline-block;
            vertical-align: middle;
          }
          .name {
            font-weight: 600;
            color: #111827;
            font-size: 15px;
            margin: 0 0 4px 0;
          }
          .title {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
          }
          .contact {
            display: flex;
            align-items: center;
            color: #6b7280;
            font-size: 13px;
          }
          .contact-item {
            display: inline-block;
            margin-right: 16px;
          }
          .divider {
            color: #d1d5db;
            margin: 0 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${formattedHtmlText}
          
          <div class="footer">
            <div style="margin-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <!-- Simple SVG Avatar placeholder -->
                    <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #7f1d1d; overflow: hidden; margin-right: 16px; text-align: center; line-height: 56px;">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                  </td>
                  <td>
                    <p class="name">Vinit Dharaiya</p>
                    <p class="title">Independent Web Developer</p>
                  </td>
                </tr>
              </table>
            </div>
            
            <div class="contact">
              <span class="contact-item">
                <svg style="vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +91 6356 182 998
              </span>
              <span class="divider">|</span>
              <span class="contact-item">
                <svg style="vertical-align: middle; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                vinitdharaiya124@gmail.com
              </span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: lead.email,
      subject: finalSubject,
      text: finalBody,
      html: htmlBody
    };

    await transporter.sendMail(mailOptions);

    // Update DB
    await pool.query('UPDATE leads SET "emailsent" = true, "emailsentat" = CURRENT_TIMESTAMP WHERE id = $1', [leadId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
