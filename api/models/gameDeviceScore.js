module.exports = (sequelize, DataTypes) => {
  const GameDeviceScore = sequelize.define('GameDeviceScore', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Device number reference'
    },
    OkPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of times OK button was pressed'
    },
    WrongPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of times Wrong button was pressed'
    },
    NoPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of times No button was pressed'
    },
    last_time: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Last time the game was played (timestamp)'
    },
    avg_time: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average time taken for games'
    },
    game_status: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Current status of the game'
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
    tableName: 'GameDeviceScores',
    timestamps: true,
    indexes: [
      {
        fields: ['DeviceNumber']
      },
      {
        unique: true,
        fields: ['DeviceNumber'],
        name: 'game_device_score_device_unique'
      }
    ]
  });

  return GameDeviceScore;
}; 