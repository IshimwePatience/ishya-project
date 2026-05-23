const { sequelize, Buyer, BuyerRequest, User } = require('./models');

async function run() {
  try {
    console.log('--- Database Connection check ---');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 1. Get all BuyerRequests
    const requests = await BuyerRequest.findAll();
    console.log('\n--- Buyer Requests ---');
    requests.forEach(r => {
      console.log(`ID: ${r.id} | Name: "${r.name}" | Email: ${r.email} | Status: ${r.status}`);
    });

    // 2. Get all Buyers
    const buyers = await Buyer.findAll();
    console.log('\n--- Buyers ---');
    buyers.forEach(b => {
      console.log(`ID: ${b.id} | Name: "${b.name}" | Email: ${b.email}`);
    });

    // 3. Get all Users with Partner role
    const users = await User.findAll({
      include: ['role']
    });
    console.log('\n--- Partner/Linked Users ---');
    users.forEach(u => {
      if (u.role?.name === 'Partner' || u.buyerId) {
        console.log(`ID: ${u.id} | Name: ${u.firstName} ${u.lastName} | Email: ${u.email} | BuyerID: ${u.buyerId} | Role: ${u.role?.name}`);
      }
    });

    // 4. Identify orphaned buyers
    console.log('\n--- Identifying Orphaned/Duplicate Buyers ---');
    const orphanedBuyers = [];
    for (const buyer of buyers) {
      // Find a corresponding request that was approved
      const correspondingReq = requests.find(r => r.email.toLowerCase() === buyer.email.toLowerCase() && r.status === 'Approved');
      const linkedUser = users.find(u => u.buyerId === buyer.id);
      
      // If there is no corresponding request that is approved OR there is no active user linked to this buyer
      // OR if this buyer's request is still pending
      const pendingReq = requests.find(r => r.email.toLowerCase() === buyer.email.toLowerCase() && r.status === 'Pending');
      
      if (pendingReq) {
        console.log(`⚠️ Buyer "${buyer.name}" (ID: ${buyer.id}) is linked to a PENDING request. (Logical error: showed up before approval!)`);
        orphanedBuyers.push(buyer);
      } else if (!linkedUser && !correspondingReq) {
        console.log(`⚠️ Buyer "${buyer.name}" (ID: ${buyer.id}) has no associated active user account and no approved request.`);
        orphanedBuyers.push(buyer);
      }
    }

    if (orphanedBuyers.length > 0) {
      console.log(`\nFound ${orphanedBuyers.length} orphaned/duplicate buyers.`);
      console.log('--- Cleaning them up ---');
      for (const ob of orphanedBuyers) {
        console.log(`Deleting Buyer "${ob.name}" (ID: ${ob.id})...`);
        await ob.destroy();
      }
      console.log('Cleanup complete!');
    } else {
      console.log('\nNo orphaned buyers found.');
    }

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await sequelize.close();
  }
}

run();
