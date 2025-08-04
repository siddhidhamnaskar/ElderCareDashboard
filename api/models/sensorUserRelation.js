module.exports = (sequelize, DataTypes) => {
  const SensorUserRelation = sequelize.define('SensorUserRelation', {
    sensor_serial: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Sensors',
        key: 'serial'
      }
    },
    user_google_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'SensorUsers',
        key: 'google_id'
      }
    },
    client_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'UnlinkedSensorClients',
        key: 'uid'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    }
  }, {
    tableName: 'SensorUserRelations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['sensor_serial', 'user_google_id']
      }
    ]
  });

  return SensorUserRelation;
}; 