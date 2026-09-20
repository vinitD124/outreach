/**
 * The Interior template.
 *
 * Unlike Micare there is no single data object to swap - the studio name,
 * phone, email and address are written through the markup - so this does
 * ordered string substitution against the placeholders the template ships
 * with. Order matters: the long forms go first so a short one cannot eat
 * part of a longer match.
 *
 * Nothing is invented. A field we do not have is blanked and the elements
 * that carry it are hidden through their data-req hook, so a lead with no
 * email never shows our address or a made-up one.
 */

const PLACEHOLDER = {
  brand: 'Aarav Interiors',
  brandFirst: 'Aarav',
  brandLast: 'Interiors',
  phoneDigits: '919876543210',
  phonePretty: '+91 98765 43210',
  email: 'hello@aaravinteriors.in',
  addressLong: 'Bopal, Ahmedabad, Gujarat',
  addressCity: 'Bopal, Ahmedabad',
  addressPin: 'Gujarat 380058',
};

/** Digits only, with the country code, for a wa.me or tel: link. */
function waDigits(raw) {
  let n = String(raw || '').replace(/\D/g, '');
  if (!n) return '';
  if (n.startsWith('0')) n = n.replace(/^0+/, '');
  if (n.length === 10) n = '91' + n;
  return n;
}

/** +91 98765 43210 from anything that looks like an Indian mobile. */
function prettyPhone(raw) {
  const n = waDigits(raw);
  if (n.length === 12 && n.startsWith('91')) {
    const local = n.slice(2);
    return '+91 ' + local.slice(0, 5) + ' ' + local.slice(5);
  }
  return String(raw || '').trim();
}

/**
 * Split a studio name for the big scrolling band: the last word parks in
 * the corner, everything before it fades out. A single-word name puts the
 * whole thing in the parking half so the band never reads as a fragment.
 */
function splitBrand(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: '', last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceAll(html, from, to) {
  return html.split(from).join(to);
}

export function renderInterior(html, lead) {
  // css/, js/ and assets/ are relative inside the template folder
  if (!html.includes('<base href="/interior/"')) {
    html = html.replace('<head>', '<head>\n  <base href="/interior/" />');
  }

  const brand = String(lead.clinicname || '').trim();
  const phoneDigits = waDigits(lead.phone || lead.whatsapp);
  const phonePretty = phoneDigits ? prettyPhone(lead.phone || lead.whatsapp) : '';
  const email = String(lead.email || '').trim();
  const address = String(lead.address || '').trim();
  const { first, last } = splitBrand(brand);

  // 1. the split band, before the whole-name pass can touch its halves
  html = replaceAll(
    html,
    '<span class="first-text">' + PLACEHOLDER.brandFirst + '</span>',
    '<span class="first-text">' + escapeHtml(first) + '</span>'
  );
  html = replaceAll(
    html,
    '<span class="last-text">' + PLACEHOLDER.brandLast + '</span>',
    '<span class="last-text">' + escapeHtml(last) + '</span>'
  );

  // 2. address, longest form first
  html = replaceAll(html, PLACEHOLDER.addressLong, escapeHtml(address));
  html = replaceAll(html, PLACEHOLDER.addressPin, '');
  html = replaceAll(html, PLACEHOLDER.addressCity, escapeHtml(address));

  // 3. identity and contact. The wa.me prefill carries the name
  // percent-encoded, so it needs its own pass before the plain one.
  html = replaceAll(
    html,
    encodeURIComponent(PLACEHOLDER.brand),
    encodeURIComponent(brand)
  );
  html = replaceAll(html, PLACEHOLDER.brand, escapeHtml(brand));
  html = replaceAll(html, PLACEHOLDER.email, escapeHtml(email));
  html = replaceAll(html, PLACEHOLDER.phonePretty, escapeHtml(phonePretty));
  html = replaceAll(html, PLACEHOLDER.phoneDigits, phoneDigits);

  // 4. hide whatever we have no value for
  const missing = [];
  if (!phoneDigits) missing.push('phone');
  if (!email) missing.push('email');
  if (!address) missing.push('address');
  if (missing.length) {
    const rule = missing.map((k) => `[data-req="${k}"]`).join(',') + '{display:none !important}';
    html = html.replace('</head>', `  <style>${rule}</style>\n</head>`);
  }

  return html;
}
