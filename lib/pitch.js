import { resolveCategory } from './categories';

/* The line the route turns into the big button. It has to survive
   editing in the composer, so both copies below spell it identically. */
export const CTA_MARKER = '[VIEW THE WEBSITE I BUILT →]';

const SIGNATURE = `Vinit Dharaiya
Independent Web Developer
WhatsApp: +91 6356 182 998`;

const COPY = {
  clinic: {
    nameFallback: 'your clinic',
    /* Names arrive already carrying the title, e.g. "Dr. Harsh Amin",
       so the caller strips it and this puts back exactly one. */
    salutation: (bare) => (bare ? `Dr. ${bare}` : ''),
    subject: 'I built this for {{clinicname}}',
    body: (url) => `Hi {{doctorname}},

I came across {{clinicname}} while looking at practices in {{area}} and had an idea for how you could be presented online.

Rather than sending you a proposal, I actually built a private website concept specifically for your practice.

${CTA_MARKER}
${url}/{{slug}}

It takes about 30 seconds to look through, and it was made specifically for {{clinicname}} — not a generic template.

If you like the direction, we can talk. If not, no problem at all.

${SIGNATURE}`,
    wa: `Hello, this is Vinit Dharaiya.

I had emailed you a sample website I made for {{clinicname}}. Sharing the link here again:
{{link}}

If you are up for a quick chat about it, just let me know. If not, no problem at all.`,
  },

  interior: {
    nameFallback: 'your studio',
    // A designer is not a doctor. No title goes in front of the name.
    salutation: (bare) => bare,
    subject: 'A website I designed for {{clinicname}}',
    body: (url) => `Hi {{doctorname}},

I came across {{clinicname}} while looking at interior studios in {{area}} and had an idea for how the work could be presented online.

Rather than sending you a proposal, I actually built a private website concept specifically for your studio — the projects, the process, the enquiry form, all of it.

${CTA_MARKER}
${url}/{{slug}}

It takes about 30 seconds to look through, and it was designed specifically for {{clinicname}} — not a generic template.

If you like the direction, we can talk. If not, no problem at all.

${SIGNATURE}`,
    wa: `Hello, this is Vinit Dharaiya.

I had emailed you a website I designed for {{clinicname}}. Sharing the link here again:
{{link}}

If you are up for a quick chat about it, just let me know. If not, no problem at all.`,
  },
};

/** Never throws. An unknown or missing category reads as clinic. */
export function pitchCopy(category) {
  return COPY[resolveCategory(category).id] || COPY.clinic;
}

export function subjectFor(category) {
  return pitchCopy(category).subject;
}

export function bodyFor(category, appUrl) {
  return pitchCopy(category).body(appUrl);
}

export function waFor(category) {
  return pitchCopy(category).wa;
}

/**
 * How we address the person, given whatever is in `doctorname`.
 * `fallback` is what to say when the column is empty - "Team" in an
 * email, "there" in a WhatsApp message.
 */
export function salutationFor(category, doctorname, fallback) {
  return pitchCopy(category).salutation(bareName(doctorname)) || fallback;
}

/** The name with any title stripped, so nothing ever reads "Dr. Dr. Harsh". */
export function bareName(doctorname) {
  return String(doctorname || '')
    .replace(/^\s*(dr\.?|doctor)\s+/i, '')
    .trim();
}

/**
 * Fill the tags in a pitch, for previewing in the composer or for the
 * WhatsApp handoff. The email route does its own pass server-side, off
 * the row it just read, so the two never rely on each other.
 *
 * No doctor name in a WhatsApp greeting on purpose: a business number is
 * usually answered by whoever is on the desk, and greeting the wrong
 * person reads worse than greeting nobody.
 */
export function fillPitch(text, lead, baseUrl) {
  const category = lead.category;
  return String(text || '')
    .replace(/{{clinicname}}/gi, lead.clinicname || pitchCopy(category).nameFallback)
    .replace(/{{doctorname}}/gi, salutationFor(category, lead.doctorname, 'there'))
    .replace(/{{area}}/gi, areaOf(lead.address))
    .replace(/{{link}}/gi, `${baseUrl}/${lead.slug}`)
    .replace(/{{slug}}/gi, lead.slug || '');
}

/** The locality: the segment before the city, because the last one is always the state. */
export function areaOf(address) {
  const parts = String(address || '').split(',').map((s) => s.trim()).filter(Boolean);
  const i = parts.findIndex((p) => /ahmedabad|gandhinagar|surat|vadodara|rajkot/i.test(p));
  return (i > 0 ? parts[i - 1] : parts[0]) || 'your area';
}
