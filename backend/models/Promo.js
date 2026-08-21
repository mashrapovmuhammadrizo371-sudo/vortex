const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema(
  {
    apkName: { type: String, required: true, trim: true },
    promoCode: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promo', promoSchema);
