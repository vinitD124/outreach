/**
 * Which kind of business a lead is.
 *
 * `clinic` must stay first and must stay the default. Every row that
 * existed before the category column was added has that value, and the
 * whole clinic pipeline - templates, copy, WhatsApp text - assumes it.
 */

import { TEMPLATE_LIST, DEFAULT_TEMPLATE } from './templates';

export const DEFAULT_CATEGORY = 'clinic';

export const CATEGORIES = {
  clinic: {
    id: 'clinic',
    code: 'CLI',
    label: 'Clinic',
    // what the business is called on its own demo page
    nameLabel: 'Clinic name',
    personLabel: 'Doctor',
  },
  interior: {
    id: 'interior',
    code: 'INT',
    label: 'Interior',
    nameLabel: 'Studio name',
    personLabel: 'Principal designer',
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

/**
 * The templates this category may be pitched with, in registry order.
 *
 * Derived from the templates themselves rather than listed here, so a
 * new template is available the moment it declares its category and the
 * two lists cannot drift apart.
 */
export function templatesFor(id) {
  const cat = resolveCategory(id).id;
  return TEMPLATE_LIST.filter((t) => t.category === cat);
}

/** The template a category ships with, for imports that do not name one. */
export function templateForCategory(id) {
  const first = templatesFor(id)[0];
  return first ? first.id : DEFAULT_TEMPLATE;
}

/**
 * The one place a lead's template is decided.
 *
 * Every write path goes through this, so a clinic on the interior demo
 * is not discouraged - it is unrepresentable. `wanted` is honoured only
 * if it belongs to this category; anything else falls back to whatever
 * the category ships with, which is always something we can serve.
 */
export function templateFor(category, wanted) {
  const allowed = templatesFor(category);
  const pick = String(wanted || '').trim().toLowerCase();
  return allowed.some((t) => t.id === pick) ? pick : templateForCategory(category);
}

/** True when `wanted` is a real template that this category cannot use. */
export function isTemplateMismatch(category, wanted) {
  const pick = String(wanted || '').trim().toLowerCase();
  if (!pick) return false;
  if (!TEMPLATE_LIST.some((t) => t.id === pick)) return false;
  return !templatesFor(category).some((t) => t.id === pick);
}
