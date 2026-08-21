const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST /api/auth/login  { username, password } -> { token }
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Login va parol kiritilishi shart.' });
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword =
    process.env.ADMIN_PASSWORD_HASH &&
    bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);

  if (!validUsername || !validPassword) {
    return res.status(401).json({ message: 'Login yoki parol noto‘g‘ri.' });
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({ token });
});

module.exports = router;
