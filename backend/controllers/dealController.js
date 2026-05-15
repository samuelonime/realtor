const { Op } = require('sequelize');
const db = require('../models');

exports.list = async (req, res) => {
  try {
    const { stage, agent_id } = req.query;
    const where = {};
    if (stage) where.stage = stage;
    if (agent_id) where.agent_id = agent_id;
    if (req.user.role === 'agent') where.agent_id = req.user.id;

    const deals = await db.Deal.findAll({
      where,
      include: [
        { model: db.Lead, attributes: ['id', 'full_name', 'phone', 'email'] },
        { model: db.Property, attributes: ['id', 'title', 'price'] },
        { model: db.User, as: 'agent', attributes: ['id', 'full_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.deal_value || 0), 0);
    const closedDeals = deals.filter(d => d.stage === 'closed');
    const closedValue = closedDeals.reduce((sum, d) => sum + parseFloat(d.deal_value || 0), 0);

    res.json({
      deals,
      stats: {
        total: deals.length,
        inspection: deals.filter(d => d.stage === 'inspection').length,
        offer_made: deals.filter(d => d.stage === 'offer_made').length,
        payment_ongoing: deals.filter(d => d.stage === 'payment_ongoing').length,
        closed: closedDeals.length,
        total_value: totalValue,
        closed_value: closedValue,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const deal = await db.Deal.findByPk(req.params.id, {
      include: [
        { model: db.Lead, attributes: ['id', 'full_name', 'phone', 'email'] },
        { model: db.Property, attributes: ['id', 'title', 'price', 'location'] },
        { model: db.User, as: 'agent', attributes: ['id', 'full_name', 'email'] },
        { model: db.Payment, include: [{ model: db.User, attributes: ['id', 'full_name'] }] },
      ],
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const totalPaid = deal.Payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    res.json({ ...deal.toJSON(), total_paid: totalPaid, balance: parseFloat(deal.deal_value) - totalPaid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { lead_id, property_id, agent_id, deal_value, notes, expected_close_date } = req.body;

    const deal = await db.Deal.create({
      lead_id, property_id, agent_id, deal_value,
      notes, expected_close_date, created_by: req.user.id,
    });

    // Update lead stage to negotiation when a deal is created
    await db.Lead.update({ stage: 'negotiation' }, { where: { id: lead_id } });
    // Update property status to reserved
    if (property_id) {
      await db.Property.update({ status: 'reserved' }, { where: { id: property_id } });
    }

    res.status(201).json({ message: 'Deal created.', id: deal.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const deal = await db.Deal.findByPk(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const { stage, deal_value, notes, expected_close_date, closed_date } = req.body;
    await deal.update({ stage, deal_value, notes, expected_close_date, closed_date });

    if (stage === 'closed') {
      await db.Lead.update({ stage: 'closed_won' }, { where: { id: deal.lead_id } });
      if (deal.property_id) {
        await db.Property.update({ status: 'sold' }, { where: { id: deal.property_id } });
      }
    }

    res.json({ message: 'Deal updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deal = await db.Deal.findByPk(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });
    await deal.destroy();
    res.json({ message: 'Deal removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
