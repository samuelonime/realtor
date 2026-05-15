const { Op } = require('sequelize');
const db = require('../models');

exports.list = async (req, res) => {
  try {
    const { status, deal_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (deal_id) where.deal_id = deal_id;

    const payments = await db.Payment.findAll({
      where,
      include: [
        { model: db.Deal, attributes: ['id', 'deal_value'] },
        { model: db.User, attributes: ['id', 'full_name'] },
      ],
      order: [['payment_date', 'DESC']],
    });

    const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const partialCount = payments.filter(p => p.status === 'partial').length;
    const completedCount = payments.filter(p => p.status === 'completed').length;

    res.json({
      payments,
      stats: {
        total: payments.length,
        total_collected: totalCollected,
        pending: pendingCount,
        partial: partialCount,
        completed: completedCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const payment = await db.Payment.findByPk(req.params.id, {
      include: [
        { model: db.Deal, attributes: ['id', 'deal_value'], include: [{ model: db.Lead, attributes: ['full_name'] }] },
        { model: db.User, attributes: ['id', 'full_name'] },
      ],
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { deal_id, customer_name, amount, payment_date, payment_method, receipt_number, installment_number, total_installments, notes } = req.body;

    const payment = await db.Payment.create({
      deal_id, customer_name, amount, payment_date, payment_method,
      receipt_number, installment_number, total_installments: total_installments || 1,
      notes, recorded_by: req.user.id, status: 'completed',
    });

    // Check if deal is fully paid
    const deal = await db.Deal.findByPk(deal_id);
    const allPayments = await db.Payment.findAll({ where: { deal_id } });
    const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    if (totalPaid >= parseFloat(deal.deal_value)) {
      await deal.update({ stage: 'closed' });
      await db.Lead.update({ stage: 'closed_won' }, { where: { id: deal.lead_id } });
      if (deal.property_id) {
        await db.Property.update({ status: 'sold' }, { where: { id: deal.property_id } });
      }
      await payment.update({ status: 'completed' });
    } else if (totalPaid > 0) {
      await payment.update({ status: 'partial' });
    }

    res.status(201).json({ message: 'Payment recorded.', id: payment.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const payment = await db.Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    await payment.destroy();
    res.json({ message: 'Payment removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
