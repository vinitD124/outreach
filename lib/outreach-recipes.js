import { CATEGORY_LIST, resolveCategory } from './categories';

const SPECIALISATION = {
  clinic: 'independent medical clinics and doctor-led practices',
  interior: 'interior design studios with strong work but weak portfolio presentation',
  dentist: 'independent dental practices and owner-led dentists',
  hospital: 'small privately owned hospitals with an accessible local decision-maker',
  physiotherapy: 'independent physiotherapy and rehabilitation practices',
  dermatologist: 'doctor-led dermatology, skin, hair and aesthetic practices',
  diagnostics: 'independent diagnostic and imaging centres, excluding national chains',
  lawyer: 'independent law firms and specialist lawyers',
  accountant: 'independent chartered-accountancy and accounting firms',
  real_estate: 'independent real-estate agencies and locally owned brokerages',
  architect: 'architecture studios with visible completed work',
  builder: 'local builders and contractors with credible completed projects',
  hotel: 'independent hotels, boutique stays and resorts',
  restaurant: 'independent restaurants with an active local reputation',
  cafe: 'independent cafes and bakeries with active customer demand',
  salon: 'independent salons with an established local clientele',
  spa: 'independent spas and wellness businesses',
  gym: 'independent gyms, fitness studios and personal-training businesses',
  yoga: 'independent yoga studios and instructors with an active practice',
  school: 'independent private schools with a local admissions decision-maker',
  preschool: 'independent preschools and early-learning centres',
  coaching: 'independent coaching and training institutes',
  event_planner: 'event and wedding-planning businesses with visible past work',
  photographer: 'independent commercial and wedding photography studios',
  travel: 'independent travel agencies and tour operators',
  car_dealer: 'independent vehicle dealerships, excluding national dealer groups',
  auto_service: 'independent garages and specialist auto-service businesses',
  solar: 'local solar installers serving residential or commercial customers',
  hvac: 'local HVAC and air-conditioning service companies',
  plumber: 'established local plumbing businesses',
  electrician: 'established local electrical contractors and service businesses',
  pest_control: 'local pest-control companies with a defined service area',
  cleaning: 'local residential or commercial cleaning companies',
  pet_clinic: 'independent veterinary and pet-care clinics',
};

export const RESEARCH_RECIPES = Object.fromEntries(CATEGORY_LIST.map((category) => [
  category.id,
  {
    category: category.id,
    code: category.code,
    label: category.label,
    target: SPECIALISATION[category.id],
    decisionMakerLabel: category.personLabel,
    emailSubject: `A website idea for {{clinicname}}`,
    emailBody: `Hi {{doctorname}},\n\nI came across {{clinicname}} while researching ${category.label.toLowerCase()} businesses in {{area}}. I noticed a specific opportunity to present the business more clearly online.\n\nI prepared a private website concept for {{clinicname}}:\n\n[VIEW THE WEBSITE I BUILT →]\n{{link}}\n\nIf you like the direction, we can talk. If not, no problem at all.`,
  },
]));

export function researchRecipe(id) {
  return RESEARCH_RECIPES[resolveCategory(id).id] || RESEARCH_RECIPES.clinic;
}
