const { Event, Production } = require('../models');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Production, as: 'Production' }]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.update(req.body);
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
