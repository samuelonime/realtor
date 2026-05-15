const { Op } = require('sequelize');
const db = require('../models');

exports.list = async (req, res) => {
  try {
    const { stage, source_id, assigned_to, search } = req.query;
    const where = {};

    if (stage) where.stage = stage;
    if (source_id) where.source_id = source_id;
    if (assigned_to) where.assigned_to = assigned_to;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Agents see only their own leads
    if (req.user.role === 'agent') {
      where.assigned_to = req.user.id;
    }

    const leads = await db.Lead.findAll({
      where,
      include: [
        { model: db.LeadSource, attributes: ['name'] },
        { model: db.User, as: 'assignee', attributes: ['id', 'full_name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'full_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const stats = {
      total: leads.length,
      stages: {
        new_lead: leads.filter(l => l.stage === 'new_lead').length,
        contacted: leads.filter(l => l.stage === 'contacted').length,
        interested: leads.filter(l => l.stage === 'interested').length,
        inspection_scheduled: leads.filter(l => l.stage === 'inspection_scheduled').length,
        negotiation: leads.filter(l => l.stage === 'negotiation').length,
        closed_won: leads.filter(l => l.stage === 'closed_won').length,
        closed_lost: leads.filter(l => l.stage === 'closed_lost').length,
      },
    };

    res.json({ leads, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const lead = await db.Lead.findByPk(req.params.id, {
      include: [
        { model: db.LeadSource, attributes: ['name'] },
        { model: db.User, as: 'assignee', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: db.User, as: 'creator', attributes: ['id', 'full_name'] },
        {
          model: db.LeadNote,
          include: [{ model: db.User, attributes: ['id', 'full_name'] }],
          order: [['created_at', 'DESC']],
        },
      ],
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { full_name, phone, email, source_id, notes, budget_range, property_type, assigned_to } = req.body;

    // Auto-assign: round-robin to agents with fewest leads
    let assignTo = assigned_to;
    if (!assignTo) {
      const agents = await db.User.findAll({
        include: [{ model: db.Role, attributes: [], where: { name: ['agent', 'manager'] } }],
        attributes: ['id'],
      });
      if (agents.length > 0) {
        const counts = await Promise.all(
          agents.map(a => db.Lead.count({ where: { assigned_to: a.id, stage: { [Op.not]: 'closed_won' } } }))
        );
        const minCount = Math.min(...counts);
        const candidates = agents.filter((_, i) => counts[i] === minCount);
        assignTo = candidates[0].id;
      }
    }

    const lead = await db.Lead.create({
      full_name,
      phone,
      email,
      source_id,
      notes,
      budget_range,
      property_type,
      assigned_to: assignTo,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Lead created.', id: lead.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await db.Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    const { full_name, phone, email, source_id, stage, assigned_to, notes, budget_range, property_type, next_follow_up } = req.body;
    await lead.update({
      full_name, phone, email, source_id, stage, assigned_to, notes,
      budget_range, property_type, next_follow_up,
    });

    res.json({ message: 'Lead updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const lead = await db.Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    await lead.destroy();
    res.json({ message: 'Lead deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { content } = req.body;
    const note = await db.LeadNote.create({
      lead_id: req.params.id,
      user_id: req.user.id,
      content,
    });
    res.status(201).json({ message: 'Note added.', id: note.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkAssign = async (req, res) => {
  try {
    const { lead_ids, assigned_to } = req.body;
    await db.Lead.update({ assigned_to }, { where: { id: lead_ids } });
    res.json({ message: `${lead_ids.length} leads assigned.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.followUps = async (req, res) => {
  try {
    const where = { next_follow_up: { [Op.not]: null } };
    if (req.user.role === 'agent') where.assigned_to = req.user.id;

    const leads = await db.Lead.findAll({
      where,
      include: [{ model: db.User, as: 'assignee', attributes: ['id', 'full_name'] }],
      order: [['next_follow_up', 'ASC']],
    });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
