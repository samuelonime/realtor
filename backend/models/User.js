module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER, defaultValue: 3 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    avatar_url: { type: DataTypes.STRING },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { exclude: ['password_hash'] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },
  });
};
