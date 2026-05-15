module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Document', {
    property_id: { type: DataTypes.INTEGER, allowNull: false },
    document_type: {
      type: DataTypes.ENUM('certificate_of_occupancy','survey_plan','deed_of_assignment','other'),
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending','verified','flagged'),
      defaultValue: 'pending',
    },
    notes: { type: DataTypes.TEXT },
    uploaded_by: { type: DataTypes.INTEGER },
    verified_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
