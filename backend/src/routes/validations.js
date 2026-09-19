const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { runValidation } = require('../scoring');
const { asyncHandler } = require('../asyncHandler');

const router = express.Router();
router.use(requireAuth);

const PLAN_LIMITS = { explorer: 3, founder: 40, scale: Infinity };

router.post('/', asyncHandler(async (req, res) => {
  const { idea } = req.body || {};
  if (!idea || !idea.trim()) {
    return res.status(400).json({ error: 'idea is required' });
  }

  const plan = req.user.plan || 'explorer';
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.explorer;
  if (Number.isFinite(limit)) {
    const { rows } = await pool.query(
      `SELECT count(*)::int AS count FROM validations
       WHERE user_id = $1 AND created_at >= date_trunc('month', now())`,
      [req.user.sub]
    );
    if (rows[0].count >= limit) {
      return res.status(403).json({ error: `Monthly limit of ${limit} scans reached for the ${plan} plan` });
    }
  }

  const result = runValidation(idea);
  const { rows } = await pool.query(
    `INSERT INTO validations (user_id, idea, overall, verdict, pillars, pros, risks, sources)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, idea, overall, verdict, pillars, pros, risks, sources, created_at`,
    [
      req.user.sub,
      result.idea,
      result.overall,
      result.verdict,
      JSON.stringify(result.pillars),
      JSON.stringify(result.pros),
      JSON.stringify(result.risks),
      JSON.stringify(result.sources),
    ]
  );
  res.status(201).json({ validation: rows[0] });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, idea, overall, verdict, pillars, pros, risks, sources, created_at
     FROM validations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [req.user.sub]
  );
  res.json({ validations: rows });
}));

module.exports = router;
