// Generates a bcrypt hash for the admin password.
// Usage: node scripts/hash-password.js "MyStrongPassword123"
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Foydalanish: node scripts/hash-password.js "parolingiz"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nBu qatorni .env fayliga ADMIN_PASSWORD_HASH sifatida joylashtiring:\n');
console.log(hash);
console.log('');
