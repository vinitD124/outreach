/**
 * Which kind of business a lead is.
 *
 * `clinic` must stay first and must stay the default. Every row that
 * existed before the category column was added has that value, and the
 * whole clinic pipeline - templates, copy, WhatsApp text - assumes it.
 */

export const DEFAULT_CATEGORY = 'clinic';

export const CATEGORIES = {
  clinic: {
    id: 'clinic',
    code: 'CLI',
    label: 'Clinic',
    // what the business is called on its own demo page
    nameLabel: 'Clinic name',
    personLabel: 'Doctor',
    // template a lead of this category gets when nothing else is chosen
    template: 'classic',
  },
  interior: {
    id: 'interior',
    code: 'INT',
    label: 'Interior',
    nameLabel: 'Studio name',
    personLabel: 'Principal designer',
    template: 'interior',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

/** Never throws, never returns undefined. */
export function resolveCategory(id) {
  return CATEGORIES[id] || CATEGORIES[DEFAULT_CATEGORY];
}

export function isCategoryId(id) {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, id);
}

/** Coerces anything into a storable category id. */
export function normaliseCategory(id) {
  const key = String(id || '').trim().toLowerCase();
  if (isCategoryId(key)) return key;
  // accept the short codes too, so a CSV can say CLI / INT
  const byCode = CATEGORY_LIST.find((c) => c.code.toLowerCase() === key);
  return byCode ? byCode.id : DEFAULT_CATEGORY;
}

/** The template a category ships with, for imports that do not name one. */
export function templateForCategory(id) {
  return resolveCategory(id).template;
}
