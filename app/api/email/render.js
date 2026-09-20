import { resolveCategory } from '@/lib/categories';
import { subjectFor, bodyFor, salutationFor, areaOf, bareName, pitchCopy } from '@/lib/pitch';
import { emailTheme } from './theme';

/**
 * Build the pitch email for one lead.
 *
 * Lifted out of the route verbatim so the same bytes that go to a
 * recipient are what the preview screen shows. The route does auth, the
 * lookup and the send; everything about what the mail says and how it
 * looks is here.
 */
export function renderPitchEmail({ lead, appUrl, subjectTemplate, bodyTemplate }) {
  const category = resolveCategory(lead.category).id;
  const copy = pitchCopy(category);
  const theme = emailTheme(category);

  const area = areaOf(lead.address);

  // What goes in front of the name depends on the category: a designer
  // is not a doctor. Both go through the same stripper first, so a name
  // stored as "Dr. Harsh Amin" never comes out "Dr. Dr. Harsh Amin".
  const bareDoctor = bareName(lead.doctorname);
  const doctorSalutation = salutationFor(category, lead.doctorname, 'Team');

  // Replace placeholders
  const replacePlaceholders = (text) => {
    if (!text) return '';
    return text
      .replace(/{{clinicname}}/gi, lead.clinicname || copy.nameFallback)
      .replace(/{{doctorname}}/gi, doctorSalutation)
      .replace(/{{area}}/gi, area)
      .replace(/{{slug}}/gi, lead.slug);
  };

  const finalSubject = replacePlaceholders(subjectTemplate || subjectFor(category));

  // The composer sends its own copy on every send. This is the fallback
  // for anything that posts here without one.
  const finalBody = replacePlaceholders(bodyTemplate || bodyFor(category, appUrl));

  // Create a plain-text style HTML wrapper for maximum deliverability
  // We convert the [VIEW THE WEBSITE I BUILT] block into a clean hyperlink
  
  // Extract the URL
  const urlMatch = finalBody.match(/https?:\/\/[^\s<]+/);
  const url = urlMatch ? urlMatch[0] : '';
  
  // Format the text to match the screenshot (bolding specific parts)
  // Clinic names carry regex metacharacters - brackets, parens, plus signs.
  // Fed raw to RegExp these either mis-match or throw, and a throw here
  // loses the send with no clue why.
  const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let formattedHtmlText = finalBody
    .replace(/<[^>]*>?/gm, '') // Strip any accidental HTML
    .replace(/\n/g, '<br/>') // Convert newlines
    .replace(/private website concept/i, '<strong>private website concept</strong>');

  // Guarded: an empty name would compile to //gi and match every character.
  if (lead.clinicname) {
    formattedHtmlText = formattedHtmlText.replace(
      new RegExp(escapeRegex(lead.clinicname), 'gi'), `<strong>${lead.clinicname}</strong>`);
  }
  if (bareDoctor) {
    formattedHtmlText = formattedHtmlText.replace(
      new RegExp(escapeRegex(`Hi ${doctorSalutation}`), 'gi'), `<strong>Hi ${doctorSalutation}</strong>`);
  }

  if (url) {
    // Replace the raw URL with the large full-width black button with monitor icon
    const buttonHtml = `
      <div style="margin: 32px 0;">
        <a href="${url}" style="display: block; width: 100%; box-sizing: border-box; text-align: center; padding: 18px 24px; background-color: ${theme.buttonBg}; color: ${theme.buttonText}; text-decoration: none; border-radius: ${theme.buttonRadius}; font-weight: 600; font-size: 15px; letter-spacing: ${theme.buttonTracking};">
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
          font-family: ${theme.font};
          font-size: 15px;
          line-height: 1.6;
          color: ${theme.text};
          margin: 0;
          padding: 40px 20px;
          background-color: ${theme.pageBg};
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${theme.cardBg};
          border: 1px solid ${theme.cardBorder};
          border-radius: ${theme.cardRadius};
          padding: 48px;
          box-shadow: ${theme.cardShadow};
        }
        strong {
          color: ${theme.strong};
          font-weight: 600;
        }
        .footer {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid ${theme.rule};
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
          background-color: ${theme.avatarBg};
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
          color: ${theme.strong};
          font-size: 15px;
          margin: 0 0 4px 0;
        }
        .title {
          color: ${theme.muted};
          font-size: 14px;
          margin: 0;
        }
        .contact {
          display: flex;
          align-items: center;
          color: ${theme.muted};
          font-size: 13px;
        }
        .contact-item {
          display: inline-block;
          margin-right: 16px;
        }
        .divider {
          color: ${theme.divider};
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
                  <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${theme.avatarBg}; overflow: hidden; margin-right: 16px; text-align: center; line-height: 56px;">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${theme.avatarInk}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
  return { subject: finalSubject, text: finalBody, html: htmlBody };
}
