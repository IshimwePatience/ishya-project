const { MediaFile, Production, Contract, Buyer } = require('../models');
const { Op } = require('sequelize');

exports.getPartnerCatalog = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await req.user.constructor.findByPk(userId);
    
    if (user && !user.buyerId) {
      const matchingBuyer = await Buyer.findOne({ where: { email: user.email } });
      if (matchingBuyer) {
        user.buyerId = matchingBuyer.id;
        await user.save();
      }
    }
    
    const buyerId = user?.buyerId;

    const productions = await Production.findAll({
      include: [
        {
          model: MediaFile,
          as: 'mediaFiles',
          required: false
        },
        {
          model: Contract,
          where: { buyerId: buyerId || 0 }, // Filter by this partner's contracts if they have a buyerId
          required: false, // Include all productions, even those without a contract
          attributes: ['id', 'status', 'expiryDate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map productions to include a simple 'isLicensed' boolean for the frontend
    const results = productions.map(p => {
      const activeContract = p.Contracts?.find(c => c.status === 'Active' && new Date(c.expiryDate) > new Date());
      const prodJson = p.toJSON();
      delete prodJson.Contracts; // Remove raw contracts for cleaner API
      return {
        ...prodJson,
        isLicensed: !!activeContract
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPartnerLibrary = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await req.user.constructor.findByPk(userId); // Get fresh user with buyerId

    if (!user.buyerId) {
      // Self-healing: Try to link user to buyer by email if not already linked
      const matchingBuyer = await Buyer.findOne({ where: { email: user.email } });
      if (matchingBuyer) {
        user.buyerId = matchingBuyer.id;
        await user.save();
      } else {
        // If still no buyerId, return empty list instead of 403 for better UX
        return res.json([]);
      }
    }

    // Find all active contracts for this buyer
    const contracts = await Contract.findAll({
      where: {
        buyerId: user.buyerId,
        status: 'Active',
        expiryDate: { [Op.gt]: new Date() } // Not expired
      },
      include: [
        {
          model: Production,
          include: [{ model: MediaFile, as: 'mediaFiles' }] // Full access to all media files for these productions
        }
      ]
    });

    // Extract productions from contracts
    const productions = contracts.map(c => c.Production);
    res.json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const media = await MediaFile.findAll({
      include: [{ model: Production, as: 'production' }]
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id, {
      include: [{ model: Production, as: 'production' }]
    });
    if (!media) return res.status(404).json({ message: 'Media not found' });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const media = await MediaFile.bulkCreate(req.body);
      return res.status(201).json(media);
    }
    const media = await MediaFile.create(req.body);
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media asset not found' });
    
    await media.update(req.body);

    // If description is updated, sync it across all assets AND the Production itself
    if (req.body.description && media.productionId) {
      // Update all associated media assets
      await MediaFile.update(
        { description: req.body.description },
        { where: { productionId: media.productionId } }
      );
      // Update the parent Production record
      await Production.update(
        { description: req.body.description },
        { where: { id: media.productionId } }
      );
    }

    res.json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await MediaFile.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media asset not found' });
    await media.destroy();
    res.json({ message: 'Media asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
