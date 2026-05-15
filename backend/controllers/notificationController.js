'use strict';

const { Op } = require('sequelize');
const db = require('../models');

// Get upcoming follow-ups (next 7 days) and overdue ones
exports.getNotifications = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const where = {
      next_follow_up: { [Op.not]: null, [Op.lte]: nextWeek },
      stage: { [Op.notIn]: ['closed_won', 'closed_lost'] },
    };
    if (req.user.role === 'agent') where.assigned_to = req.user.id;

    const followUps = await db.Lead.findAll({
      where,
      include: [{ model: db.User, as: 'assignee', attributes: ['id', 'full_name'] }],
      order: [['next_follow_up', 'ASC']],
      limit: 20,
    });

    const notifications = followUps.map(lead => {
      const dueDate = new Date(lead.next_follow_up);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return {
        id: lead.id,
        type: diffDays < 0 ? 'overdue' : diffDays === 0 ? 'due_today' : 'upcoming',
        lead_id: lead.id,
        lead_name: lead.full_name,
        lead_phone: lead.phone,
        assignee: lead.assignee?.full_name,
        due_date: lead.next_follow_up,
        days_diff: diffDays,
        stage: lead.stage,
      };
    });

    // Pending documents needing verification (admin/manager only)
    let pendingDocs = [];
    if (req.user.role !== 'agent') {
      pendingDocs = await db.Document.findAll({
        where: { status: 'pending' },
        include: [{ model: db.Property, attributes: ['id', 'title'] }],
        limit: 10,
        order: [['created_at', 'ASC']],
      });
    }

    res.json({
      follow_ups: notifications,
      pending_documents: pendingDocs.map(d => ({
        id: d.id,
        property: d.Property?.title,
        document_type: d.document_type,
        title: d.title,
        created_at: d.created_at,
      })),
      counts: {
        overdue: notifications.filter(n => n.type === 'overdue').length,
        due_today: notifications.filter(n => n.type === 'due_today').length,
        upcoming: notifications.filter(n => n.type === 'upcoming').length,
        pending_docs: pendingDocs.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
