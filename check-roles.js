require('dotenv').config({ path: './backend/.env' });
const { Role } = require('./backend/models');

async function checkRoles() {
  try {
    const roles = await Role.findAll();
    console.log('--- CURRENT ROLES ---');
    roles.forEach(r => console.log(`- ${r.name}`));
    console.log('---------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error checking roles:', err);
    process.exit(1);
  }
}

checkRoles();
