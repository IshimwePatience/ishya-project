const { Op } = require('sequelize');
const { Production, Script, Talent, Buyer, BuyerRequest, Event, MediaFile, Expense, Sale, User } = require('../models');

exports.globalSearch = async (req, res) => {
  try {
    const q = req.query.q || '';
    const query = q.trim();
    if (!query) {
      return res.json({
        productions: [],
        scripts: [],
        talents: [],
        buyers: [],
        buyerRequests: [],
        events: [],
        expenses: [],
        sales: [],
        users: []
      });
    }

    const searchLike = `%${query}%`;
    const userRole = req.user?.role?.name;
    const userId = req.user?.id;
    const buyerId = req.user?.buyerId;

    // Define response container
    const results = {
      productions: [],
      scripts: [],
      talents: [],
      buyers: [],
      buyerRequests: [],
      events: [],
      expenses: [],
      sales: [],
      users: [],
      mediaFiles: []
    };

    // 1. ADMIN / STAFF / PRODUCTION MANAGER / FINANCE OFFICER (Administrative Roles)
    if (['Admin', 'Production Manager', 'Finance Officer'].includes(userRole)) {
      results.productions = await Production.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { description: { [Op.iLike]: searchLike } },
            { genre: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.scripts = await Script.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { copyrightInfo: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.talents = await Talent.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: searchLike } },
            { lastName: { [Op.iLike]: searchLike } },
            { specialty: { [Op.iLike]: searchLike } },
            { bio: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.buyers = await Buyer.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: searchLike } },
            { contactPerson: { [Op.iLike]: searchLike } },
            { email: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.buyerRequests = await BuyerRequest.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: searchLike } },
            { contactPerson: { [Op.iLike]: searchLike } },
            { email: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.events = await Event.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { description: { [Op.iLike]: searchLike } },
            { venue: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.expenses = await Expense.findAll({
        where: {
          description: { [Op.iLike]: searchLike }
        },
        limit: 10
      });

      results.sales = await Sale.findAll({
        include: [
          { model: Production, as: 'production' },
          { model: Buyer, as: 'buyer' }
        ],
        where: {
          [Op.or]: [
            { '$production.title$': { [Op.iLike]: searchLike } },
            { '$buyer.name$': { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.users = await User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: searchLike } },
            { lastName: { [Op.iLike]: searchLike } },
            { email: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.mediaFiles = await MediaFile.findAll({
        where: {
          fileName: { [Op.iLike]: searchLike }
        },
        limit: 10
      });
    }

    // 2. WRITER / DIRECTOR
    else if (userRole === 'Writer/Director') {
      results.productions = await Production.findAll({
        where: {
          directorId: userId,
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { description: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.scripts = await Script.findAll({
        where: {
          authorId: userId,
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { copyrightInfo: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });
    }

    // 3. ACTOR / TALENT
    else if (userRole === 'Actor/Talent') {
      const talent = await Talent.findOne({ where: { userId } });
      if (talent) {
        results.scripts = await Script.findAll({
          where: {
            [Op.or]: [
              { title: { [Op.iLike]: searchLike } },
              { copyrightInfo: { [Op.iLike]: searchLike } }
            ]
          },
          include: [{
            model: Talent,
            as: 'assignedActors',
            where: { id: talent.id },
            attributes: [],
            through: { attributes: [] }
          }],
          limit: 10
        });

        results.productions = await Production.findAll({
          where: {
            [Op.or]: [
              { title: { [Op.iLike]: searchLike } },
              { description: { [Op.iLike]: searchLike } }
            ]
          },
          include: [{
            model: Talent,
            as: 'talents',
            where: { id: talent.id },
            attributes: [],
            through: { attributes: [] }
          }],
          limit: 10
        });
      }
    }

    // 4. PARTNER / BUYER
    else if (userRole === 'Partner' || userRole === 'Buyer') {
      if (buyerId) {
        const sales = await Sale.findAll({
          where: { buyerId }
        });
        const licensedProdIds = sales.map(s => s.productionId);

        results.productions = await Production.findAll({
          where: {
            id: { [Op.in]: licensedProdIds },
            [Op.or]: [
              { title: { [Op.iLike]: searchLike } },
              { description: { [Op.iLike]: searchLike } }
            ]
          },
          limit: 10
        });

        // Also let partners search media files in their active catalog/licenses
        results.mediaFiles = await MediaFile.findAll({
          where: {
            productionId: { [Op.in]: licensedProdIds },
            fileName: { [Op.iLike]: searchLike }
          },
          limit: 10
        });
      }

      // Also let them search their own Buyer Requests matching their email
      results.buyerRequests = await BuyerRequest.findAll({
        where: {
          email: req.user.email,
          [Op.or]: [
            { name: { [Op.iLike]: searchLike } },
            { contactPerson: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });
    }

    // 5. PUBLIC VISITOR
    else if (userRole === 'Public Visitor') {
      results.productions = await Production.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { description: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });

      results.events = await Event.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: searchLike } },
            { description: { [Op.iLike]: searchLike } },
            { venue: { [Op.iLike]: searchLike } }
          ]
        },
        limit: 10
      });
    }

    return res.json(results);
  } catch (error) {
    console.error('Error in globalSearch controller:', error);
    return res.status(500).json({ message: error.message });
  }
};
