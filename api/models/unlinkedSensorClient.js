module.exports = (sequelize, DataTypes) => {
  const UnlinkedSensorClient = sequelize.define('UnlinkedSensorClient', {
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
    }
  }, {
    tableName: 'UnlinkedSensorClients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return UnlinkedSensorClient;
}; 