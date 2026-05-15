const db = require('../models');

const auditLog = async (userId, action, entityType, entityId, details = {}, ipAddress = null) => {
  try {
    await db.AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: JSON.stringify(details),
      ip_address: ipAddress,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

const auditMiddleware = (action, entityType) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        const entityId = req.params.id || body?.id || null;
        auditLog(
          req.user.id,
          action,
          entityType,
          entityId,
          { method: req.method, path: req.originalUrl },
          req.ip
        );
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = { auditLog, auditMiddleware };
