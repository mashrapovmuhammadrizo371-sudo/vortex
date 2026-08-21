const express = require('express');
const Settings = require('../models/Settings');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Always returns the single settings document, creating it on first use.
async function getOrCreateSettings() {
  let settings = await Settings.findOne({ singletonId: 'main' });
  if (!settings) {
    settings = await Settings.create({ singletonId: 'main' });
  }
  return settings;
}

// GET /api/settings - public (tarmoqlar + support links)
router.get('/', async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

// PUT /api/settings - admin only
router.put('/', requireAuth, async (req, res) => {
  const { telegram, instagram, youtube, support } = req.body;

  const settings = await Settings.findOneAndUpdate(
    { singletonId: 'main' },
    { telegram, instagram, youtube, support },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(settings);
});

module.exports = router;
