require('dotenv').config({ path: './backend/.env' });
const { Sale } = require('./backend/models');

async function checkSales() {
  try {
    const sales = await Sale.findAll();
    console.log('--- SALES ---');
    console.log(JSON.stringify(sales, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSales();
