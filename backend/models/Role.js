module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Role', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
};
