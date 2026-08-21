const mongoose = require('mongoose');

// Singleton document - there is only ever one Settings row (singletonId: 'main').
const settingsSchema = new mongoose.Schema(
  {
    singletonId: { type: String, default: 'main', unique: true },
    telegram: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    support: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
