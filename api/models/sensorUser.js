module.exports = (sequelize, DataTypes) => {
  const SensorUser = sequelize.define('SensorUser', {
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
    user_google_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'SensorUsers',
        key: 'google_id'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'  // Can be 'admin', 'user', etc.
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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

  return SensorUser;
}; 