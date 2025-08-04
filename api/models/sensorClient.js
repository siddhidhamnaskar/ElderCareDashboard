module.exports = (sequelize, DataTypes) => {
  const SensorClient = sequelize.define('SensorClient', {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    building: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING
    },
    client: {
      type: DataTypes.STRING
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SensorUsers',
        key: 'id'
      }
    }
  }, {
    tableName: 'SensorClients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return SensorClient;
}; 