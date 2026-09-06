import { toScriptJSON } from '../templates.js';

/**
 * The original demo template.
 *
 * This is the logic that used to live inline in app/[slug]/route.js,
 * moved here unchanged. Links that went out months ago resolve through
 * this function, so its output must stay the same as it was.
 *
 * Two safety fixes are applied that cannot alter the output for any
 * ordinary clinic or doctor name:
 *
 *   - the injected object escapes "<", so a name containing "</script>"
 *     cannot break out of the script block
 *   - the name substitutions use a replacer function, so "$&" or "$1"
 *     inside a name is treated as text rather than a backreference
 *
 * Known defects are deliberately left in place: the tel: link drops its
 * leading "+", and og:title still says "Rowan Grove". Fixing either
 * would change what an already-sent link renders, which is not
 * something to do as a side effect of adding a second template.
 */
export function renderClassic(html, lead) {
  // relative assets resolve from the site root
  if (!html.includes('<base href="/"/>')) {
    html = html.replace('<head>', '<head>\n  <base href="/" />');
  }

  const doctorName = lead.doctorname || 'Dr. Rajesh Kumar';
  const lastName = doctorName.split(' ').pop();

  // a replacer function, so $-patterns in a name stay literal
  const put = (value) => () => value;
  html = html.replace(/Dr\. Elena Marsh/g, put(doctorName));
  html = html.replace(/Dr\. Eleanor Marsh/g, put(doctorName));
  html = html.replace(/Dr\. Marsh/g, put(`Dr. ${lastName}`));

  const defaultPhone = '+91 6356 182 998';
  const phoneToUse = lead.phone || defaultPhone;
  const whatsappToUse = lead.whatsapp || lead.phone || defaultPhone;
  const addressToUse = lead.address || 'SG Highway, Ahmedabad, Gujarat';

  const clinicObj = {
    name: lead.clinicname,
    suffix: '',
    tagline: 'A modern clinic caring for you.',
    phone: phoneToUse,
    phoneRaw: phoneToUse.replace(/\D/g, ''),
    whatsapp: whatsappToUse.replace(/\D/g, ''),
    email: lead.email,
    address: addressToUse,
    // pop() gave "Gujarat" for every lead. The locality sits just before
    // "Ahmedabad" in the address.
    area: (() => {
      const p = addressToUse.split(',').map((s) => s.trim()).filter(Boolean);
      const i = p.findIndex((s) => /ahmedabad/i.test(s));
      return (i > 0 ? p[i - 1] : p[0]) || 'Ahmedabad';
    })(),
    hours: {
      mon: ['08:00', '19:00'],
      tue: ['08:00', '19:00'],
      wed: ['08:00', '19:00'],
      thu: ['08:00', '19:00'],
      fri: ['08:00', '18:00'],
      sat: ['09:00', '14:00'],
      sun: null,
    },
  };

  return html.replace(
    /const CLINIC = {[\s\S]*?};/m,
    put(`const CLINIC = ${toScriptJSON(clinicObj)};`)
  );
}
