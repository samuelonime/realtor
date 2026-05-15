module.exports = (sequelize, DataTypes) => {
  return sequelize.define('LeadSource', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, {
    tableName: 'lead_sources',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
};
