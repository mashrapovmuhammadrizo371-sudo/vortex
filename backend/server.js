require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const apkRoutes = require('./routes/apk');
const promoRoutes = require('./routes/promo');
const kuponRoutes = require('./routes/kupon');
const settingsRoutes = require('./routes/settings');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/apk', apkRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/kupon', kuponRoutes);
app.use('/api/settings', settingsRoutes);

// Frontend (welcome + asosiy sahifa) va Admin Panel statik fayllari
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Umumiy xatolik ushlagich
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server xatoligi.' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`VORTEX server ${PORT}-portda ishga tushdi.`);
  });
});
