module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Property', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(15,2), allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    property_type: { type: DataTypes.STRING },
    bedrooms: { type: DataTypes.INTEGER },
    bathrooms: { type: DataTypes.INTEGER },
    land_size: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM('available','reserved','sold'),
      defaultValue: 'available',
    },
    assigned_to: { type: DataTypes.INTEGER },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 'properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
