/**
 * The Forma template.
 *
 * Same approach as the Interior renderer: the studio name, phone and email
 * are written through the markup rather than sitting in one data object, so
 * this does ordered string substitution against the
 * placeholders the template ships with. Longest forms first, so a short
 * one cannot eat part of a longer match.
 *
 * The template's own JavaScript reads the name off the header mark rather
 * than carrying its own copy, so substituting the HTML is enough - the
 * page curtain, the index dialog, the footer signature and the inquiry
 * file all follow from it.
 *
 * Nothing is invented. A field we do not have is blanked and the elements
 * carrying it are hidden through their data-req hook, so a studio with no
 * email never shows a made-up one. No address is shown at all - a scraped
 * one is often imprecise, and a wrong street is worse than no street.
 */

const PLACEHOLDER = {
  brand: 'FORMA',
  phoneDigits: '919876543210',
  phonePretty: '+91 98765 43210',
  email: 'studio@forma.design',
  // the display marks scale off this; 5 is FORMA's own length
  length: '--len:5',
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

export function renderForma(html, lead) {
  // css, js and assets are relative inside the template folder
  if (!html.includes('<base href="/forma/"')) {
    html = html.replace('<head>', '<head>\n  <base href="/forma/" />');
  }

  const brand = String(lead.clinicname || '').trim();
  const phoneDigits = waDigits(lead.phone || lead.whatsapp);
  const phonePretty = phoneDigits ? prettyPhone(lead.phone || lead.whatsapp) : '';
  const email = String(lead.email || '').trim();

  // identity first. The template's scripts read the name back off the
  // header mark, so this one pass reaches them too.
  html = replaceAll(html, PLACEHOLDER.brand, escapeHtml(brand));

  // contact, longest form first
  html = replaceAll(html, PLACEHOLDER.email, escapeHtml(email));
  html = replaceAll(html, PLACEHOLDER.phonePretty, escapeHtml(phonePretty));
  html = replaceAll(html, PLACEHOLDER.phoneDigits, phoneDigits);
  // the wordmarks are set for a five-letter name; this is what lets a
  // long studio name scale down instead of running off the page
  html = replaceAll(html, PLACEHOLDER.length, '--len:' + Math.max(1, brand.length));

  // hide whatever we have no value for
  const missing = [];
  if (!phoneDigits) missing.push('phone');
  if (!email) missing.push('email');
  if (missing.length) {
    const rule =
      missing.map((k) => `[data-req="${k}"]`).join(',') + '{display:none !important}';
    html = html.replace('</head>', `  <style>${rule}</style>\n</head>`);
  }

  return html;
}
