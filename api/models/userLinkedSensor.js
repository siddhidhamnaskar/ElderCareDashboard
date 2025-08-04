module.exports = (sequelize, DataTypes) => {
  const UserLinkedSensor = sequelize.define('UserLinkedSensor', {
    serial: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    client_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'UnlinkedSensorClients',
        key: 'uid'
      }
    },
    status: {
      type: DataTypes.STRING
    },
    since: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SensorUsers',
        key: 'id'
      }
    }
  }, {
    tableName: 'UserLinkedSensors',
    timestamps: true
  });

  return UserLinkedSensor;
}; 