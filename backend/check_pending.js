require('dotenv').config();
const { PendingUser } = require('./models');

async function check() {
  try {
    const users = await PendingUser.findAll();
    console.log('--- Pending Users ---');
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`Password (start): ${u.password?.substring(0, 10)}`);
      console.log(`Is Hash: ${u.password?.startsWith('$2b$') || u.password?.startsWith('$2a$')}`);
      console.log('---');
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
