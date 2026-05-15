const { Op, fn, col, literal } = require('sequelize');
const db = require('../models');

exports.getStats = async (req, res) => {
  try {
    const roleWhere = {};
    if (req.user.role === 'agent') {
      roleWhere.assigned_to = req.user.id;
    }

    const [
      totalLeads, stageCounts, leadSources,
      totalProperties, statusCounts,
      totalDeals, dealStageCounts,
      totalRevenue,
      pendingPayments,
      agentPerformance,
    ] = await Promise.all([
      db.Lead.count({ where: roleWhere }),
      db.Lead.findAll({
        attributes: ['stage', [fn('COUNT', col('id')), 'count']],
        where: roleWhere,
        group: ['stage'],
      }),
      db.Lead.findAll({
        attributes: ['source_id', [fn('COUNT', col('id')), 'count']],
        where: roleWhere,
        group: ['source_id'],
        include: [{ model: db.LeadSource, attributes: ['name'] }],
      }),
      db.Property.count(),
      db.Property.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
      }),
      req.user.role === 'agent'
        ? db.Deal.findAll({ where: { agent_id: req.user.id }, include: ['agent'] })
        : db.Deal.findAll({ include: ['agent'] }),
      req.user.role === 'agent'
        ? db.Deal.findAll({ attributes: ['stage', [fn('COUNT', col('id')), 'count']], where: { agent_id: req.user.id }, group: ['stage'] })
        : db.Deal.findAll({ attributes: ['stage', [fn('COUNT', col('id')), 'count']], group: ['stage'] }),
      db.Deal.sum('deal_value', { where: { stage: 'closed' } }),
      req.user.role !== 'agent' ? db.Payment.findAll({ where: { status: { [Op.in]: ['pending', 'partial'] } }, limit: 10, include: [{ model: db.Deal, attributes: ['id'], include: [{ model: db.Lead, attributes: ['full_name'] }] }] }) : [],
      req.user.role !== 'agent'
        ? db.User.findAll({
            attributes: ['id', 'full_name'],
            include: [
              { model: db.Role, attributes: [], where: { name: ['agent', 'manager'] } },
              { model: db.Deal, as: 'agentDeals', attributes: [] },
            ],
          })
        : [],
    ]);

    // Compute agent performance manually
    let performance = [];
    if (req.user.role !== 'agent') {
      performance = await Promise.all(
        agentPerformance.map(async (agent) => {
          const totalDealsCount = await db.Deal.count({ where: { agent_id: agent.id } });
          const closedDealsCount = await db.Deal.count({ where: { agent_id: agent.id, stage: 'closed' } });
          const closedValue = await db.Deal.sum('deal_value', { where: { agent_id: agent.id, stage: 'closed' } });
          const leadsCount = await db.Lead.count({ where: { assigned_to: agent.id } });
          return {
            id: agent.id,
            name: agent.full_name,
            total_deals: totalDealsCount,
            closed_deals: closedDealsCount,
            closed_value: parseFloat(closedValue || 0),
            leads: leadsCount,
          };
        })
      );
    }

    const formatCounts = (rows, field) => {
      const obj = {};
      rows.forEach(r => { obj[r[field] || r.stage || r.status] = parseInt(r.get('count')); });
      return obj;
    };

    const revenue = parseFloat(totalRevenue || 0);
    const activeDeals = totalDeals.filter(d => d.stage !== 'closed');
    const activeDealsValue = activeDeals.reduce((s, d) => s + parseFloat(d.deal_value || 0), 0);

    res.json({
      leads: {
        total: totalLeads,
        by_stage: formatCounts(stageCounts, 'stage'),
        by_source: leadSources.map(s => ({
          source: s.LeadSource?.name || 'Unknown',
          count: parseInt(s.get('count')),
        })),
      },
      properties: {
        total: totalProperties,
        by_status: formatCounts(statusCounts, 'status'),
      },
      deals: {
        total: totalDeals.length,
        active: activeDeals.length,
        active_value: activeDealsValue,
        closed: totalDeals.filter(d => d.stage === 'closed').length,
        closed_value: revenue,
        by_stage: formatCounts(dealStageCounts, 'stage'),
      },
      revenue,
      pending_payments: pendingPayments,
      agent_performance: performance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
