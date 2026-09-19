// Deterministic placeholder scoring, ported from the frontend mockup's exact
// algorithm so a validation scores the same whether run client-side or here.
// This is the seam to replace with real AI-assisted research later — see
// README "Next steps".

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const PILLARS = ['demand', 'innovation', 'execution', 'monetization'];

const PROS_POOL = [
  'Clear, underserved audience with a recurring need',
  'Low-cost distribution channel already exists (communities, SEO)',
  'Simple enough MVP to ship in under 4 weeks',
  'Recurring-revenue model fits the use case naturally',
  'Founder-market fit: easy to reach the first 50 users directly',
  'Wedge into a market with high switching costs for incumbents',
  'Strong word-of-mouth potential once value is felt once',
  'Data/workflow already exists that this idea can plug into',
];

const RISKS_POOL = [
  'Crowded category — differentiation will need to be sharp',
  'Willingness to pay is unproven above a free tier',
  'Requires trust in an AI-generated or automated output',
  'Regulatory or compliance overhead in this space',
  'Customer acquisition cost may be high early on',
  'Feature is easy for a larger incumbent to copy quickly',
  'Retention risk if the core job is only needed occasionally',
  'Supply-side (suppliers, partners, data) may be hard to secure',
];

function pick(rand, pool, n) {
  const copy = pool.slice();
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

function verdictFor(score) {
  if (score >= 8) return 'Strong signal';
  if (score >= 6.5) return 'Promising signal';
  if (score >= 5) return 'Mixed signal';
  return 'Weak signal';
}

function runValidation(ideaRaw) {
  const idea = String(ideaRaw || '').trim();
  const seed = idea.toLowerCase() || 'idea';
  const rand = xmur3(seed);

  const pillars = {};
  PILLARS.forEach((key, i) => {
    const v = 3 + rand() * 6.7 + (i === 0 ? rand() * 0.6 : 0);
    pillars[key] = Math.min(10, Math.round(v * 10) / 10);
  });

  const overall = Math.round(
    (pillars.demand * 0.3 + pillars.innovation * 0.2 + pillars.execution * 0.25 + pillars.monetization * 0.25) * 10
  ) / 10;

  const pros = pick(rand, PROS_POOL, 3);
  const risks = pick(rand, RISKS_POOL, 2);
  const sources = {
    reddit: 5 + Math.floor(rand() * 35),
    x: 4 + Math.floor(rand() * 28),
    web: 3 + Math.floor(rand() * 15),
  };

  return { idea, pillars, overall, verdict: verdictFor(overall), pros, risks, sources };
}

module.exports = { runValidation };
