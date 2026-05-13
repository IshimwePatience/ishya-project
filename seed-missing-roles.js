require('dotenv').config({ path: './backend/.env' });
const { Role } = require('./backend/models');

async function seedRoles() {
  try {
    const rolesToAdd = [
      { name: 'Partner', description: 'Business partner or external collaborator' },
      { name: 'Buyer', description: 'Interested buyer of productions' }
    ];

    for (const roleData of rolesToAdd) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      if (created) {
        console.log(`✅ Role created: ${roleData.name}`);
      } else {
        console.log(`ℹ️ Role already exists: ${roleData.name}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding roles:', err);
    process.exit(1);
  }
}

seedRoles();
