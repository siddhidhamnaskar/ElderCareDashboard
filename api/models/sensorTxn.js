module.exports = (sequelize, DataTypes) => {
  const SensorTxn = sequelize.define('SensorTxn', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sensor_serial: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Sensors',
        key: 'serial'
      }
    },
    type: {
      type: DataTypes.ENUM('OPEN', 'CLOSE'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'SensorsTxns',
    timestamps: false
  });

  return SensorTxn;
}; 