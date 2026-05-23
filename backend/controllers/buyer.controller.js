const { Buyer, Contract } = require('../models');

exports.getBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.findAll({
      include: [
        {
          model: Contract,
          required: true
        }
      ],
      order: [['name', 'ASC']]
    });
    res.json(buyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.create(req.body);
    res.status(201).json(buyer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findByPk(req.params.id);
    if (!buyer) return res.status(404).json({ message: 'Partner not found' });
    await buyer.destroy();
    res.json({ message: 'Partner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findByPk(req.params.id);
    if (!buyer) return res.status(404).json({ message: 'Partner not found' });
    await buyer.update(req.body);
    res.json(buyer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
