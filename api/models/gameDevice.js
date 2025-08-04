module.exports = (sequelize, DataTypes) => {
  const GameDevice = sequelize.define('GameDevice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique device identifier'
    },
    LTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Light time value'
    },
    PTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Play time value'
    },
    GTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Game time value'
    },
    NL: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of levels or game level'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'active',
      comment: 'Device status (active, inactive, maintenance)'
    },
    lastHeartBeatTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last heartbeat from device'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'GameDevices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['DeviceNumber']
      }
    ]
  });

  GameDevice.associate = (models) => {
    // One-to-Many relationship with GameDeviceScore
    GameDevice.hasMany(models.GameDeviceScore, {
      foreignKey: 'DeviceNumber',
      sourceKey: 'DeviceNumber',
      as: 'scores'
    });

    // One-to-Many relationship with GameScoreReport
    GameDevice.hasMany(models.GameScoreReport, {
      foreignKey: 'DeviceNumber',
      sourceKey: 'DeviceNumber',
      as: 'reports'
    });

    // One-to-Many relationship with GameDeviceUserRelation
    GameDevice.hasMany(models.GameDeviceUserRelation, {
      foreignKey: 'deviceId',
      as: 'userRelations'
    });
  };

  return GameDevice;
}; 