require('dotenv').config();
const { sequelize } = require('./models');

async function check() {
  try {
    const [roles] = await sequelize.query('SELECT * FROM "Roles"');
    console.log('--- Roles ---');
    roles.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.name}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
