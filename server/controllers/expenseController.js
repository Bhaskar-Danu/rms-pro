const Expense = require('../models/Expense');
const ActivityLog = require('../models/ActivityLog');

exports.getExpenses = async (req, res) => {
  try { res.json(await Expense.find().sort({ date: -1, createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getReport = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const [byCategory, totalResult] = await Promise.all([
      Expense.aggregate([
        { $match: { date: { $gte: sinceStr } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $project: { category: '$_id', total: 1, _id: 0 } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: sinceStr } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({ byCategory, totalExpenses: Math.round((totalResult[0]?.total || 0) * 100) / 100 });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addExpense = async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || !amount || amount <= 0)
      return res.status(400).json({ error: 'Valid category and amount are required' });
    const exp = await Expense.create(req.body);
    await ActivityLog.create({ user: req.user.id, username: req.user.username, action: 'Expense Added', details: `₹${amount} - ${category}` });
    res.status(201).json({ success: true, expense: exp });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
