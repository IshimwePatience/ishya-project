require('dotenv').config({ path: './backend/.env' });
const { User, PendingUser } = require('./backend/models');

async function checkEmail() {
  const email = 'ishimweaugstin12@gmail.com';
  try {
    const user = await User.findOne({ where: { email } });
    const pending = await PendingUser.findOne({ where: { email } });
    
    console.log('--- EMAIL CHECK ---');
    console.log(`User Table: ${user ? 'EXISTS' : 'Not found'}`);
    console.log(`Pending Table: ${pending ? 'EXISTS' : 'Not found'}`);
    console.log('-------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkEmail();
