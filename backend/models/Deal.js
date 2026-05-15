module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Deal', {
    lead_id: { type: DataTypes.INTEGER, allowNull: false },
    property_id: { type: DataTypes.INTEGER },
    agent_id: { type: DataTypes.INTEGER, allowNull: false },
    deal_value: { type: DataTypes.DECIMAL(15,2), allowNull: false },
    stage: {
      type: DataTypes.ENUM('inspection','offer_made','payment_ongoing','closed'),
      defaultValue: 'inspection',
    },
    notes: { type: DataTypes.TEXT },
    expected_close_date: { type: DataTypes.DATEONLY },
    closed_date: { type: DataTypes.DATEONLY },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 'deals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
