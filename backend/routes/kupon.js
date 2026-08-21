const express = require('express');
const Kupon = require('../models/Kupon');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/kupon - public
router.get('/', async (req, res) => {
  const kuponlar = await Kupon.find().sort({ order: 1, createdAt: 1 });
  res.json(kuponlar);
});

// POST /api/kupon - admin only
router.post('/', requireAuth, async (req, res) => {
  const { name, code, startTime, order } = req.body;

  if (!name || !code || !startTime) {
    return res.status(400).json({ message: 'Kupon nomi, kodi va start vaqti shart.' });
  }

  const kupon = await Kupon.create({ name, code, startTime, order });
  res.status(201).json(kupon);
});

// PUT /api/kupon/:id - admin only
router.put('/:id', requireAuth, async (req, res) => {
  const { name, code, startTime, order } = req.body;

  const kupon = await Kupon.findByIdAndUpdate(
    req.params.id,
    { name, code, startTime, order },
    { new: true, runValidators: true }
  );

  if (!kupon) {
    return res.status(404).json({ message: 'Kupon topilmadi.' });
  }

  res.json(kupon);
});

// DELETE /api/kupon/:id - admin only
router.delete('/:id', requireAuth, async (req, res) => {
  const kupon = await Kupon.findByIdAndDelete(req.params.id);

  if (!kupon) {
    return res.status(404).json({ message: 'Kupon topilmadi.' });
  }

  res.json({ message: 'Kupon o‘chirildi.' });
});

module.exports = router;
