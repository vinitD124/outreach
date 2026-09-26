/**
 * The set of demo templates a lead can be pitched with.
 *
 * `classic` must stay first and must stay the default. Every lead that
 * existed before the `template` column was added has that value, and
 * every link already sitting in someone's inbox resolves through it.
 */

export const DEFAULT_TEMPLATE = 'classic';

/**
 * `category` is what a template is FOR, and it is the only place that
 * pairing is written down. Which templates a category may use is derived
 * from this (see templatesFor in categories.js), so the two can never
 * disagree: declaring a template here is what wires it up.
 *
 * Order matters. The first template of a category is what a lead of that
 * category gets when nothing else is chosen.
 */
export const TEMPLATES = {
  classic: {
    id: 'classic',
    category: 'clinic',
    label: 'Classic',
    blurb: 'The original single-page demo. Dark navy, editorial layout.',
    // read from the repo root
    file: 'index.html',
    // assets live in public/, so relative paths resolve from the site root
    base: '/',
  },
  micare: {
    id: 'micare',
    category: 'clinic',
    label: 'Micare',
    blurb: 'Blue, image-led, animated. Built from the Micare template.',
    file: 'public/micare/index.html',
    // its css/, js/ and image/ are relative, so the base has to point
    // inside the template folder
    base: '/micare/',
  },
  interior: {
    id: 'interior',
    category: 'interior',
    label: 'Interior',
    blurb: 'Cream, editorial, scroll-led. For interior design studios.',
    file: 'public/interior/index.html',
    base: '/interior/',
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

/**
 * Never throws and never returns undefined. An unknown id, an empty
 * string, a null from a row written before the column existed - all of
 * them come back as the classic template, which is what keeps old links
 * working no matter what is in the database.
 */
export function resolveTemplate(id) {
  return TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE];
}

/** True only for ids we actually serve. Used to validate writes. */
export function isTemplateId(id) {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, id);
}

/** Coerces anything into a storable template id. */
export function normaliseTemplate(id) {
  return isTemplateId(id) ? id : DEFAULT_TEMPLATE;
}

/**
 * Serialise a value into a <script> block safely.
 *
 * JSON.stringify escapes quotes but not "</script>", so a clinic named
 * `Foo</script><script>...` would otherwise close the tag and run.
 * Escaping "<" as < is inert inside a JS string literal and leaves
 * every ordinary name byte-identical.
 */
export function toScriptJSON(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}
