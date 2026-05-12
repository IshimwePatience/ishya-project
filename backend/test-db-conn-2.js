const { Sequelize } = require('sequelize');

const test = async () => {
  const passwords = ['admin', '123456', '12345678', 'root123'];
  for (const pwd of passwords) {
    console.log(`Testing password: "${pwd}"`);
    const sequelize = new Sequelize('ishya_db', 'postgres', pwd, {
      host: 'localhost',
      dialect: 'postgres',
      logging: false
    });

    try {
      await sequelize.authenticate();
      console.log(`SUCCESS! Password is: "${pwd}"`);
      return;
    } catch (err) {
      console.log(`FAILED for "${pwd}": ${err.message}`);
    }
  }
};

test();
