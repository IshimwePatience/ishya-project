require('dotenv').config({ path: './backend/.env' });
const { Contract } = require('./backend/models');

async function checkContracts() {
  try {
    const contracts = await Contract.findAll();
    console.log('--- CONTRACTS ---');
    console.log(JSON.stringify(contracts, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkContracts();
