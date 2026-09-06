/**
 * The set of demo templates a lead can be pitched with.
 *
 * `classic` must stay first and must stay the default. Every lead that
 * existed before the `template` column was added has that value, and
 * every link already sitting in someone's inbox resolves through it.
 */

export const DEFAULT_TEMPLATE = 'classic';

export const TEMPLATES = {
  classic: {
    id: 'classic',
    label: 'Classic',
    blurb: 'The original single-page demo. Dark navy, editorial layout.',
    // read from the repo root
    file: 'index.html',
    // assets live in public/, so relative paths resolve from the site root
    base: '/',
  },
  micare: {
    id: 'micare',
    label: 'Micare',
    blurb: 'Blue, image-led, animated. Built from the Micare template.',
    file: 'public/micare/index.html',
    // its css/, js/ and image/ are relative, so the base has to point
    // inside the template folder
    base: '/micare/',
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
