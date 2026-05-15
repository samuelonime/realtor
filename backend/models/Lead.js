module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Lead', {
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    source_id: { type: DataTypes.INTEGER },
    stage: {
      type: DataTypes.ENUM('new_lead','contacted','interested','inspection_scheduled','negotiation','closed_won','closed_lost'),
      defaultValue: 'new_lead',
    },
    assigned_to: { type: DataTypes.INTEGER },
    notes: { type: DataTypes.TEXT },
    budget_range: { type: DataTypes.DECIMAL(15,2) },
    property_type: { type: DataTypes.STRING },
    next_follow_up: { type: DataTypes.DATEONLY },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 'leads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
