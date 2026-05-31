const { Talent, Production, User, Role } = require('../models');

exports.getAllTalents = async (req, res) => {
  try {
    const talents = await Talent.findAll({
      include: [
        { model: Production, as: 'productions' },
        { model: User, as: 'user', attributes: ['email', 'status', 'isVerified'] }
      ]
    });
    res.json(talents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTalentById = async (req, res) => {
  try {
    const talent = await Talent.findByPk(req.params.id, {
      include: [
        { model: Movie, as: 'productions' },
        { model: User, as: 'user' }
      ]
    });
    if (!talent) return res.status(404).json({ message: 'Talent not found' });
    res.json(talent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTalent = async (req, res) => {
  try {
    const { createAccount, password, ...talentData } = req.body;

    const existingUser = await User.findOne({ where: { email: talentData.email } });
    const existingTalent = await Talent.findOne({ where: { email: talentData.email } });

    if (existingUser || existingTalent) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    let userId = null;
    if (createAccount && password) {
      const role = await Role.findOne({ where: { name: 'Actor/Talent' } });
      const user = await User.create({
        firstName: talentData.firstName,
        lastName: talentData.lastName,
        email: talentData.email,
        password: password,
        roleId: role ? role.id : null,
        status: 'active',
        isVerified: false
      });
      userId = user.id;
    }

    const talent = await Talent.create({ ...talentData, userId });

    if (talentData.productions && Array.isArray(talentData.productions)) {
      await talent.setProductions(talentData.productions);
    }

    res.status(201).json(talent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTalent = async (req, res) => {
  try {
    const { createAccount, password, ...talentData } = req.body;
    const talent = await Talent.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!talent) return res.status(404).json({ message: 'Talent not found' });

    // Handle User Account Creation or Password Update
    if (createAccount && password) {
      if (talent.userId) {
        // RESET PASSWORD for existing user
        const user = await User.findByPk(talent.userId);
        if (user) {
          user.password = password;
          await user.save();
        }
      } else {
        // CREATE NEW ACCOUNT for existing talent
        const role = await Role.findOne({ where: { name: 'Actor/Talent' } });
        const user = await User.create({
          firstName: talentData.firstName,
          lastName: talentData.lastName,
          email: talentData.email,
          password: password,
          roleId: role ? role.id : null,
          status: 'active',
          isVerified: false
        });
        talentData.userId = user.id;
      }
    }
    
    await talent.update(talentData);

    if (talentData.productions && Array.isArray(talentData.productions)) {
      await talent.setProductions(talentData.productions);
    }

    res.json(talent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTalent = async (req, res) => {
  try {
    const talent = await Talent.findByPk(req.params.id);
    if (!talent) return res.status(404).json({ message: 'Talent not found' });
    if (talent.userId) await User.destroy({ where: { id: talent.userId } });
    await talent.destroy();
    res.json({ message: 'Talent deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
