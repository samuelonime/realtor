'use strict';

const { Op, fn, col, literal } = require('sequelize');
const db = require('../models');

// Monthly revenue report
exports.monthlyRevenue = async (req, res) => {
  try {
    const months = parseInt(req.query.months || '12', 10);
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const payments = await db.Payment.findAll({
      where: { payment_date: { [Op.gte]: since }, status: { [Op.in]: ['completed', 'partial'] } },
      attributes: ['payment_date', 'amount'],
      raw: true,
    });

    // Group by month
    const byMonth = {};
    payments.forEach(p => {
      const key = p.payment_date.toString().slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] || 0) + parseFloat(p.amount);
    });

    const result = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lead conversion funnel
exports.leadFunnel = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'agent') where.assigned_to = req.user.id;

    const stages = ['new_lead', 'contacted', 'interested', 'inspection_scheduled', 'negotiation', 'closed_won', 'closed_lost'];
    const counts = await db.Lead.findAll({
      where,
      attributes: ['stage', [fn('COUNT', col('id')), 'count']],
      group: ['stage'],
      raw: true,
    });

    const countMap = {};
    counts.forEach(c => { countMap[c.stage] = parseInt(c.count); });

    res.json(stages.map(stage => ({ stage, count: countMap[stage] || 0 })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Agent leaderboard
exports.agentLeaderboard = async (req, res) => {
  try {
    if (req.user.role === 'agent') return res.status(403).json({ error: 'Insufficient permissions.' });

    const agents = await db.User.findAll({
      include: [{ model: db.Role, attributes: [], where: { name: ['agent', 'manager'] } }],
      attributes: ['id', 'full_name', 'avatar_url'],
    });

    const leaderboard = await Promise.all(agents.map(async (agent) => {
      const [leads, deals, closedValue] = await Promise.all([
        db.Lead.count({ where: { assigned_to: agent.id } }),
        db.Deal.count({ where: { agent_id: agent.id } }),
        db.Deal.sum('deal_value', { where: { agent_id: agent.id, stage: 'closed' } }),
      ]);
      return {
        id: agent.id,
        name: agent.full_name,
        avatar_url: agent.avatar_url,
        leads,
        deals,
        closed_value: parseFloat(closedValue || 0),
      };
    }));

    leaderboard.sort((a, b) => b.closed_value - a.closed_value);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Property performance report
exports.propertyPerformance = async (req, res) => {
  try {
    const properties = await db.Property.findAll({
      include: [
        { model: db.Deal, attributes: ['id', 'deal_value', 'stage'] },
        { model: db.PropertyImage, attributes: ['image_url', 'is_primary'], limit: 1 },
      ],
    });

    const data = properties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      status: p.status,
      property_type: p.property_type,
      location: p.city || p.location,
      deals_count: p.Deals.length,
      closed_deals: p.Deals.filter(d => d.stage === 'closed').length,
      total_revenue: p.Deals.filter(d => d.stage === 'closed').reduce((s, d) => s + parseFloat(d.deal_value || 0), 0),
      primary_image: p.PropertyImages?.[0]?.image_url || null,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
