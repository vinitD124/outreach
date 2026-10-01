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
  dentist: {
    id: 'dentist',
    code: 'DEN',
    label: 'Dentist',
    nameLabel: 'Practice name',
    personLabel: 'Dentist',
  },
  hospital: {
    id: 'hospital',
    code: 'HSP',
    label: 'Hospital',
    nameLabel: 'Hospital name',
    personLabel: 'Contact person',
  },
  physiotherapy: {
    id: 'physiotherapy',
    code: 'PHY',
    label: 'Physiotherapy',
    nameLabel: 'Practice name',
    personLabel: 'Physiotherapist',
  },
  dermatologist: {
    id: 'dermatologist',
    code: 'DER',
    label: 'Dermatologist',
    nameLabel: 'Practice name',
    personLabel: 'Dermatologist',
  },
  diagnostics: {
    id: 'diagnostics',
    code: 'DIA',
    label: 'Diagnostics',
    nameLabel: 'Centre name',
    personLabel: 'Contact person',
  },
  lawyer: {
    id: 'lawyer',
    code: 'LAW',
    label: 'Law firm',
    nameLabel: 'Firm name',
    personLabel: 'Lead lawyer',
  },
  accountant: {
    id: 'accountant',
    code: 'ACC',
    label: 'Accountant / CA',
    nameLabel: 'Firm name',
    personLabel: 'Contact person',
  },
  real_estate: {
    id: 'real_estate',
    code: 'REA',
    label: 'Real estate',
    nameLabel: 'Agency name',
    personLabel: 'Agent / owner',
  },
  architect: {
    id: 'architect',
    code: 'ARC',
    label: 'Architect',
    nameLabel: 'Studio name',
    personLabel: 'Principal architect',
  },
  builder: {
    id: 'builder',
    code: 'BLD',
    label: 'Builder / contractor',
    nameLabel: 'Company name',
    personLabel: 'Contact person',
  },
  hotel: {
    id: 'hotel',
    code: 'HOT',
    label: 'Hotel / resort',
    nameLabel: 'Property name',
    personLabel: 'Manager / owner',
  },
  restaurant: {
    id: 'restaurant',
    code: 'RST',
    label: 'Restaurant',
    nameLabel: 'Restaurant name',
    personLabel: 'Manager / owner',
  },
  cafe: {
    id: 'cafe',
    code: 'CAF',
    label: 'Cafe / bakery',
    nameLabel: 'Business name',
    personLabel: 'Manager / owner',
  },
  salon: {
    id: 'salon',
    code: 'SAL',
    label: 'Salon',
    nameLabel: 'Salon name',
    personLabel: 'Manager / owner',
  },
  spa: {
    id: 'spa',
    code: 'SPA',
    label: 'Spa / wellness',
    nameLabel: 'Business name',
    personLabel: 'Manager / owner',
  },
  gym: {
    id: 'gym',
    code: 'GYM',
    label: 'Gym / fitness',
    nameLabel: 'Business name',
    personLabel: 'Manager / owner',
  },
  yoga: {
    id: 'yoga',
    code: 'YOG',
    label: 'Yoga studio',
    nameLabel: 'Studio name',
    personLabel: 'Instructor / owner',
  },
  school: {
    id: 'school',
    code: 'SCH',
    label: 'School',
    nameLabel: 'School name',
    personLabel: 'Principal / administrator',
  },
  preschool: {
    id: 'preschool',
    code: 'PRE',
    label: 'Preschool',
    nameLabel: 'School name',
    personLabel: 'Principal / owner',
  },
  coaching: {
    id: 'coaching',
    code: 'COA',
    label: 'Coaching institute',
    nameLabel: 'Institute name',
    personLabel: 'Director / owner',
  },
  event_planner: {
    id: 'event_planner',
    code: 'EVT',
    label: 'Event planner',
    nameLabel: 'Company name',
    personLabel: 'Planner / owner',
  },
  photographer: {
    id: 'photographer',
    code: 'PHO',
    label: 'Photographer',
    nameLabel: 'Studio name',
    personLabel: 'Photographer',
  },
  travel: {
    id: 'travel',
    code: 'TRV',
    label: 'Travel agency',
    nameLabel: 'Agency name',
    personLabel: 'Manager / owner',
  },
  car_dealer: {
    id: 'car_dealer',
    code: 'CAR',
    label: 'Car dealer',
    nameLabel: 'Dealership name',
    personLabel: 'Manager / owner',
  },
  auto_service: {
    id: 'auto_service',
    code: 'AUT',
    label: 'Auto service',
    nameLabel: 'Garage name',
    personLabel: 'Manager / owner',
  },
  solar: {
    id: 'solar',
    code: 'SOL',
    label: 'Solar installer',
    nameLabel: 'Company name',
    personLabel: 'Contact person',
  },
  hvac: {
    id: 'hvac',
    code: 'HVC',
    label: 'HVAC / AC service',
    nameLabel: 'Company name',
    personLabel: 'Manager / owner',
  },
  plumber: {
    id: 'plumber',
    code: 'PLM',
    label: 'Plumber',
    nameLabel: 'Business name',
    personLabel: 'Owner',
  },
  electrician: {
    id: 'electrician',
    code: 'ELC',
    label: 'Electrician',
    nameLabel: 'Business name',
    personLabel: 'Owner',
  },
  pest_control: {
    id: 'pest_control',
    code: 'PST',
    label: 'Pest control',
    nameLabel: 'Company name',
    personLabel: 'Manager / owner',
  },
  cleaning: {
    id: 'cleaning',
    code: 'CLN',
    label: 'Cleaning service',
    nameLabel: 'Company name',
    personLabel: 'Manager / owner',
  },
  pet_clinic: {
    id: 'pet_clinic',
    code: 'PET',
    label: 'Pet clinic',
    nameLabel: 'Clinic name',
    personLabel: 'Veterinarian / owner',
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
  // Accept short codes too, so imports do not depend on internal ids.
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

export function categoryHasTemplate(id) {
  return templatesFor(id).length > 0;
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
