const { sequelize } = require('./models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB Connection successful!');

    const models = Object.keys(sequelize.models);
    console.log('\n--- Model Counts ---');
    for (const modelName of models) {
      const count = await sequelize.models[modelName].count();
      console.log(`${modelName}: ${count} rows`);
    }

    console.log('\n--- Buyer Requests Table Details ---');
    const requests = await sequelize.models.BuyerRequest.findAll();
    console.log(`BuyerRequest count: ${requests.length}`);
    requests.forEach(r => {
      console.log(JSON.stringify(r.toJSON(), null, 2));
    });

    console.log('\n--- Buyers Table Details ---');
    const buyers = await sequelize.models.Buyer.findAll();
    buyers.forEach(b => {
      console.log(JSON.stringify(b.toJSON(), null, 2));
    });

    console.log('\n--- Users Table Details ---');
    const users = await sequelize.models.User.findAll({ include: ['role'] });
    users.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role?.name} | BuyerID: ${u.buyerId}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
