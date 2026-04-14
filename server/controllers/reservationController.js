const Reservation = require('../models/Reservation');
const ActivityLog = require('../models/ActivityLog');

exports.getReservations = async (req, res) => {
  try { res.json(await Reservation.find().sort({ date: -1, time: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createReservation = async (req, res) => {
  try {
    const { customer_name, date, time } = req.body;
    if (!customer_name || !date || !time)
      return res.status(400).json({ error: 'Guest name, date and time are required' });
    const res_ = await Reservation.create(req.body);
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Reservation Created', details: `Booking for ${customer_name} on ${date}` });
    res.status(201).json({ success: true, reservation: res_ });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
