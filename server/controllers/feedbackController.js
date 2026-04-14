const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');

exports.getFeedback = async (req, res) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const [avg, dist] = await Promise.all([
      Feedback.aggregate([{ $group: { _id: null, avg_rating: { $avg: '$rating' }, total: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }, { $sort: { _id: -1 } }]),
    ]);
    res.json({
      avgRating: Math.round((avg[0]?.avg_rating || 0) * 10) / 10,
      totalReviews: avg[0]?.total || 0,
      distribution: dist.map(d => ({ rating: d._id, count: d.count })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addFeedback = async (req, res) => {
  try {
    const { customer_name, rating } = req.body;
    if (!customer_name || !rating) return res.status(400).json({ error: 'Name and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' });
    const fb = await Feedback.create(req.body);
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Feedback Received', details: `${rating}★ from ${customer_name}` });
    res.status(201).json({ success: true, feedback: fb });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
