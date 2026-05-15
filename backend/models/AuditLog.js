module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AuditLog', {
    user_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING, allowNull: false },
    entity_type: { type: DataTypes.STRING },
    entity_id: { type: DataTypes.INTEGER },
    details: { type: DataTypes.TEXT }, -- JSON string
    ip_address: { type: DataTypes.STRING },
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
};
