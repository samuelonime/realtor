module.exports = (sequelize, DataTypes) => {
  return sequelize.define('LeadNote', {
    lead_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName: 'lead_notes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
};
