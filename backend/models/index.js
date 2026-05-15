const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};
db.sequelize = sequelize;

db.User = require('./User')(sequelize, DataTypes);
db.Role = require('./Role')(sequelize, DataTypes);
db.Lead = require('./Lead')(sequelize, DataTypes);
db.LeadNote = require('./LeadNote')(sequelize, DataTypes);
db.LeadSource = require('./LeadSource')(sequelize, DataTypes);
db.Property = require('./Property')(sequelize, DataTypes);
db.PropertyImage = require('./PropertyImage')(sequelize, DataTypes);
db.Deal = require('./Deal')(sequelize, DataTypes);
db.Payment = require('./Payment')(sequelize, DataTypes);
db.Document = require('./Document')(sequelize, DataTypes);
db.AuditLog = require('./AuditLog')(sequelize, DataTypes);

// ========== RELATIONSHIPS ==========

// User - Role
db.User.belongsTo(db.Role, { foreignKey: 'role_id' });
db.Role.hasMany(db.User, { foreignKey: 'role_id' });

// User - Leads (assigned)
db.User.hasMany(db.Lead, { foreignKey: 'assigned_to', as: 'assignedLeads' });
db.Lead.belongsTo(db.User, { foreignKey: 'assigned_to', as: 'assignee' });

// User - Leads (created)
db.User.hasMany(db.Lead, { foreignKey: 'created_by', as: 'createdLeads' });
db.Lead.belongsTo(db.User, { foreignKey: 'created_by', as: 'creator' });

// Lead - LeadSource
db.LeadSource.hasMany(db.Lead, { foreignKey: 'source_id' });
db.Lead.belongsTo(db.LeadSource, { foreignKey: 'source_id' });

// Lead - LeadNotes
db.Lead.hasMany(db.LeadNote, { foreignKey: 'lead_id' });
db.LeadNote.belongsTo(db.Lead, { foreignKey: 'lead_id' });
db.User.hasMany(db.LeadNote, { foreignKey: 'user_id' });
db.LeadNote.belongsTo(db.User, { foreignKey: 'user_id' });

// Property - PropertyImages
db.Property.hasMany(db.PropertyImage, { foreignKey: 'property_id' });
db.PropertyImage.belongsTo(db.Property, { foreignKey: 'property_id' });

// Property - User (assigned)
db.User.hasMany(db.Property, { foreignKey: 'assigned_to', as: 'assignedProperties' });
db.Property.belongsTo(db.User, { foreignKey: 'assigned_to', as: 'propertyAgent' });
db.Property.belongsTo(db.User, { foreignKey: 'created_by', as: 'propertyCreator' });

// Deals
db.Lead.hasMany(db.Deal, { foreignKey: 'lead_id' });
db.Deal.belongsTo(db.Lead, { foreignKey: 'lead_id' });
db.Property.hasMany(db.Deal, { foreignKey: 'property_id' });
db.Deal.belongsTo(db.Property, { foreignKey: 'property_id' });
db.User.hasMany(db.Deal, { foreignKey: 'agent_id', as: 'agentDeals' });
db.Deal.belongsTo(db.User, { foreignKey: 'agent_id', as: 'agent' });

// Payments
db.Deal.hasMany(db.Payment, { foreignKey: 'deal_id' });
db.Payment.belongsTo(db.Deal, { foreignKey: 'deal_id' });
db.User.hasMany(db.Payment, { foreignKey: 'recorded_by' });
db.Payment.belongsTo(db.User, { foreignKey: 'recorded_by' });

// Documents
db.Property.hasMany(db.Document, { foreignKey: 'property_id' });
db.Document.belongsTo(db.Property, { foreignKey: 'property_id' });
db.User.hasMany(db.Document, { foreignKey: 'uploaded_by', as: 'uploadedDocs' });
db.Document.belongsTo(db.User, { foreignKey: 'uploaded_by', as: 'uploader' });

// AuditLog
db.User.hasMany(db.AuditLog, { foreignKey: 'user_id' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'user_id' });

module.exports = db;
