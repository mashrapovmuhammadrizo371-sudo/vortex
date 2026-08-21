const express = require('express');
const Apk = require('../models/Apk');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/apk - public, list all apks
router.get('/', async (req, res) => {
  const apks = await Apk.find().sort({ order: 1, createdAt: 1 });
  res.json(apks);
});

// POST /api/apk - admin only, create
router.post('/', requireAuth, async (req, res) => {
  const { name, description, downloadUrl, order } = req.body;

  if (!name || !downloadUrl) {
    return res.status(400).json({ message: 'APK nomi va yuklab olish havolasi shart.' });
  }

  const apk = await Apk.create({ name, description, downloadUrl, order });
  res.status(201).json(apk);
});

// PUT /api/apk/:id - admin only, update
router.put('/:id', requireAuth, async (req, res) => {
  const { name, description, downloadUrl, order } = req.body;

  const apk = await Apk.findByIdAndUpdate(
    req.params.id,
    { name, description, downloadUrl, order },
    { new: true, runValidators: true }
  );

  if (!apk) {
    return res.status(404).json({ message: 'APK topilmadi.' });
  }

  res.json(apk);
});

// DELETE /api/apk/:id - admin only
router.delete('/:id', requireAuth, async (req, res) => {
  const apk = await Apk.findByIdAndDelete(req.params.id);

  if (!apk) {
    return res.status(404).json({ message: 'APK topilmadi.' });
  }

  res.json({ message: 'APK o‘chirildi.' });
});

module.exports = router;
      
