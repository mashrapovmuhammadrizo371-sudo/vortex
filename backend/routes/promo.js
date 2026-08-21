const express = require('express');
const Promo = require('../models/Promo');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/promo - public
router.get('/', async (req, res) => {
  const promos = await Promo.find().sort({ order: 1, createdAt: 1 });
  res.json(promos);
});

// POST /api/promo - admin only
router.post('/', requireAuth, async (req, res) => {
  const { apkName, promoCode, order } = req.body;

  if (!apkName || !promoCode) {
    return res.status(400).json({ message: 'APK nomi va promokod shart.' });
  }

  const promo = await Promo.create({ apkName, promoCode, order });
  res.status(201).json(promo);
});

// PUT /api/promo/:id - admin only
router.put('/:id', requireAuth, async (req, res) => {
  const { apkName, promoCode, order } = req.body;

  const promo = await Promo.findByIdAndUpdate(
    req.params.id,
    { apkName, promoCode, order },
    { new: true, runValidators: true }
  );

  if (!promo) {
    return res.status(404).json({ message: 'Promo topilmadi.' });
  }

  res.json(promo);
});

// DELETE /api/promo/:id - admin only
router.delete('/:id', requireAuth, async (req, res) => {
  const promo = await Promo.findByIdAndDelete(req.params.id);

  if (!promo) {
    return res.status(404).json({ message: 'Promo topilmadi.' });
  }

  res.json({ message: 'Promo o‘chirildi.' });
});

module.exports = router;
