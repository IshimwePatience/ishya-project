const { Production, ProductionCategory, Talent, User, MediaFile } = require('../models');
const { sendNotification } = require('../socket');

exports.getCategories = async (req, res) => {
  try {
    const db = require('../models');
    // Log all models to debug 500 error
    console.log('Available models:', Object.keys(db));
    
    const ProductionCategory = db.ProductionCategory;
    if (!ProductionCategory) {
      throw new Error('ProductionCategory model not found in DB object');
    }

    const categories = await ProductionCategory.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Detailed Error in getCategories:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProductions = async (req, res) => {
  try {
    const productions = await Production.findAll({
      include: [
        { model: ProductionCategory, as: 'category' },
        { model: Talent, as: 'talents' },
        { model: MediaFile, as: 'mediaFiles' }
      ]
    });
    res.json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductionById = async (req, res) => {
  try {
    const production = await Production.findByPk(req.params.id, {
      include: [
        { model: ProductionCategory, as: 'category' },
        { model: Talent, as: 'talents' },
        { model: MediaFile, as: 'mediaFiles' }
      ]
    });
    if (!production) return res.status(404).json({ message: 'Production not found' });
    res.json(production);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduction = async (req, res) => {
  try {
    console.log('Creating production with data:', req.body);
    const production = await Production.create(req.body);

    // Notify all Partner users in real-time
    await sendNotification({
      role: 'Partner',
      title: 'New Movie Available',
      message: `"${production.title}" is now available in the catalog for distribution licensing!`,
      type: 'new_movie'
    });

    res.status(201).json(production);
  } catch (error) {
    console.error('Error in createProduction:', error);
    res.status(400).json({ 
      message: 'Validation failed', 
      errors: error.errors?.map(e => e.message) || [error.message]
    });
  }
};

exports.updateProduction = async (req, res) => {
  try {
    const production = await Production.findByPk(req.params.id);
    if (!production) return res.status(404).json({ message: 'Production not found' });
    await production.update(req.body);
    res.json(production);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduction = async (req, res) => {
  try {
    const production = await Production.findByPk(req.params.id);
    if (!production) return res.status(404).json({ message: 'Production not found' });
    await production.destroy();
    res.json({ message: 'Production deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
