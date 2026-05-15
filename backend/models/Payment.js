module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    deal_id: { type: DataTypes.INTEGER, allowNull: false },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15,2), allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    payment_method: { type: DataTypes.STRING },
    receipt_number: { type: DataTypes.STRING },
    installment_number: { type: DataTypes.INTEGER, defaultValue: 1 },
    total_installments: { type: DataTypes.INTEGER, defaultValue: 1 },
    notes: { type: DataTypes.TEXT },
    recorded_by: { type: DataTypes.INTEGER },
    status: {
      type: DataTypes.ENUM('pending','partial','completed'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
