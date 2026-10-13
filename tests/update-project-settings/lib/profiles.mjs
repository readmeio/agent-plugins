import { getProject } from './client.mjs';

const DEFINITIONS = [
  {
    id: 'non-paying',
    envVar: 'NON_PAYING_PROJECT_API_KEY',
    expect: project => {
      const issues = [];
      if (!['free', 'freelaunch', 'freelaunch2026'].includes(project.plan.type)) {
        issues.push(`plan.type is "${project.plan.type}", expected a free plan`);
      }
      if (project.plan.trial.active) issues.push('trial is still active');
      if (project.ai.owlbot.is_paying) issues.push('has the AI Booster Pack');
      return issues;
    },
  },
  {
    id: 'pro-no-booster',
    envVar: 'PRO_NO_BOOSTER_PROJECT_API_KEY',
    expect: project => {
      const issues = [];
      if (!project.plan.type.startsWith('pro')) issues.push(`plan.type is "${project.plan.type}", expected Pro`);
      if (project.ai.owlbot.is_paying) issues.push('has the AI Booster Pack');
      return issues;
    },
  },
  {
    id: 'pro-with-booster',
    envVar: 'PRO_WITH_BOOSTER_PROJECT_API_KEY',
    expect: project => {
      const issues = [];
      if (!project.plan.type.startsWith('pro')) issues.push(`plan.type is "${project.plan.type}", expected Pro`);
      if (!project.ai.owlbot.is_paying) issues.push('ai.owlbot.is_paying is false, expected the AI Booster Pack');
      return issues;
    },
  },
  {
    id: 'enterprise-parent',
    envVar: 'ENTERPRISE_PARENT_PROJECT_API_KEY',
    expect: project => (project.plan.type === 'enterprise' ? [] : [`plan.type is "${project.plan.type}"`]),
  },
  {
    id: 'enterprise-child',
    envVar: 'ENTERPRISE_CHILD_PROJECT_API_KEY',
    expect: project => (project.parent ? [] : ['parent is null, expected an enterprise child']),
  },
];

let cached;

export async function loadProfiles() {
  if (cached) return cached;

  const profiles = [];
  for (const definition of DEFINITIONS) {
    const key = process.env[definition.envVar];
    if (!key) continue;

    const project = await getProject(key);
    const issues = definition.expect(project);
    if (issues.length > 0) {
      const message = `${definition.id} (${project.subdomain}) does not match its profile: ${issues.join('; ')}`;
      if (process.env.STRICT_PROFILES === 'true') throw new Error(message);
      // Expectations come from the project's actual plan, so a mislabelled project still tests correctly.
      console.warn(`[profiles] ${message}`);
    }
    profiles.push({ id: definition.id, key, project });
  }

  const subdomains = profiles.map(profile => profile.project.subdomain);
  const duplicate = subdomains.find((subdomain, index) => subdomains.indexOf(subdomain) !== index);
  if (duplicate) {
    throw new Error(`Two profiles point at the same project (${duplicate}); check the API keys in .env`);
  }

  const parent = profiles.find(profile => profile.id === 'enterprise-parent');
  const child = profiles.find(profile => profile.id === 'enterprise-child');
  if (parent && parent.project.parent) {
    throw new Error(`enterprise-parent (${parent.project.subdomain}) is itself a child of ${parent.project.parent}`);
  }
  if (parent && child && child.project.parent !== parent.project.subdomain) {
    throw new Error(
      `enterprise-child's parent is "${child.project.parent}", but enterprise-parent is "${parent.project.subdomain}"`,
    );
  }

  cached = profiles;
  return profiles;
}

export function findProfile(profiles, id) {
  return profiles.find(profile => profile.id === id);
}

export const DESTRUCTIVE_SKIP =
  process.env.RUN_DESTRUCTIVE === 'true' ? false : 'destructive: set RUN_DESTRUCTIVE=true to run';
