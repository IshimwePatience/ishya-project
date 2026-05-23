require('dotenv').config({ path: './backend/.env' });
const { Buyer, BuyerRequest, User } = require('./backend/models');

async function inspect() {
  try {
    const buyers = await Buyer.findAll();
    console.log('--- BUYERS ---');
    console.log(JSON.stringify(buyers, null, 2));

    const requests = await BuyerRequest.findAll();
    console.log('--- BUYER REQUESTS ---');
    console.log(JSON.stringify(requests, null, 2));

    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'roleId', 'buyerId']
    });
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error inspecting:', err);
    process.exit(1);
  }
}

inspect();
