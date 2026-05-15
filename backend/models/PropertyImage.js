module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PropertyImage', {
    property_id: { type: DataTypes.INTEGER, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'property_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
};
