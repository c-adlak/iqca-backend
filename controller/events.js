const Event = require("../models/Event");
const cloudinary = require("cloudinary").v2;



module.exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, image, pdf } = req.body;
    const event = new Event({ name, description, date, image, pdf });
    await event.save();
    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error("Error creating event:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, image, pdf } = req.body;
    const update = { name, description, date, image, pdf };

    const event = await Event.findByIdAndUpdate(id, update, { new: true });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event updated", event });
  } catch (err) {
    console.error("Error updating event:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    console.error("Error deleting event:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


