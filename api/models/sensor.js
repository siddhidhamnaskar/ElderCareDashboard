module.exports = (sequelize, DataTypes) => {
  const Sensor = sequelize.define('Sensor', {
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
    desc: {
      type: DataTypes.STRING,
      allowNull:true,
      defaultValue: 'No description'
    },
    type: {
      type: DataTypes.STRING,
      allowNull:true,
      defaultValue: 'Sensor'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Sensors',
    timestamps: true
  });

  return Sensor;
}; 