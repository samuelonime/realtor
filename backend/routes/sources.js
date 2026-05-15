const router = require('express').Router();
const db = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const sources = await db.LeadSource.findAll();
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
