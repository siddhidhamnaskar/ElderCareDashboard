module.exports = (sequelize, DataTypes) => {
  const GameDeviceUserRelation = sequelize.define('GameDeviceUserRelation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    game_device_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'GameDevices',
        key: 'id'
      }
    },
    user_google_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'SensorUsers',
        key: 'google_id'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'user',
      comment: 'Role of user for this game device (owner, user, admin)'
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'GameDeviceUserRelations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['game_device_id', 'user_google_id']
      },
      {
        fields: ['user_google_id']
      },
      {
        fields: ['game_device_id']
      }
    ]
  });

  return GameDeviceUserRelation;
}; 