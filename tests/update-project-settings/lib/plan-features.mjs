// Plan features behind project settings, per resolved `plan.type`.
// Mirrors the plan definitions behind ReadMe's dashboard plan page.
const PAID_SITE = ['password', 'custom_domain', 'changelogs', 'landing_page', 'glossary'];
const PRO = ['usability', 'guides', 'stylesheet', 'extra_html', 'errors', 'healthCheck', ...PAID_SITE];

const PLAN_FEATURES = {
  free: [],
  freelaunch: ['guides', 'custom_domain'],
  freelaunch2026: ['guides', 'custom_domain'],
  startup: ['usability', 'guides', 'stylesheet', 'extra_html', ...PAID_SITE],
  startup2018: ['usability', 'guides', ...PAID_SITE],
  'startup-annual-2024': ['usability', 'guides', ...PAID_SITE],
  opensource: ['usability', 'guides', 'stylesheet', 'changelogs', 'landing_page', 'glossary'],
  pro2026: PRO,
  'pro2026-annual': PRO,
  business: [...PRO, 'javascript', 'whitelabel'],
  business2018: [...PRO, 'whitelabel'],
  'business-annual-2024': [...PRO, 'whitelabel'],
  enterprise: [...PRO, 'javascript', 'whitelabel'],
};

export function hasPlanFeature(profile, feature) {
  const features = PLAN_FEATURES[profile.project.plan.type];
  if (!features) {
    throw new Error(`Unknown plan "${profile.project.plan.type}" on ${profile.id}; add it to plan-features.mjs`);
  }
  return features.includes(feature);
}

// A `skip` option for operations documented as needing a plan feature.
export function planSkip(profile, feature) {
  if (hasPlanFeature(profile, feature)) return false;
  return `requires the ${feature} plan feature`;
}

export function enterpriseSkip(profile) {
  if (profile.project.plan.type === 'enterprise') return false;
  return 'requires Enterprise';
}
