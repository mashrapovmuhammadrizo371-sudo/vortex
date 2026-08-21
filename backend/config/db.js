const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI .env faylida topilmadi.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB ulanish muvaffaqiyatli.');
  } catch (err) {
    console.error('MongoDB ulanishda xatolik:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
