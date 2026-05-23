require('dotenv').config({ path: './backend/.env' });
const { Role } = require('./backend/models');

async function checkRoles() {
  try {
    const roles = await Role.findAll();
    console.log('--- ROLES ---');
    console.log(JSON.stringify(roles, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRoles();
