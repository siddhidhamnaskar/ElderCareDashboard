module.exports = (sequelize, DataTypes) => {
  const GameSessionPlayer = sequelize.define('GameSessionPlayer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Session identifier'
    },
    deviceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Game device number'
    },
    playerName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Player name'
    },
    finalScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Final score after game completion'
    },
    okPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of correct presses'
    },
    wrongPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of wrong presses'
    },
    noPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of missed presses'
    },
    avgResponseTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average response time'
    },
    status: {
      type: DataTypes.ENUM('ready', 'playing', 'completed'),
      allowNull: false,
      defaultValue: 'ready',
      comment: 'Player status in session'
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
    tableName: 'GameSessionPlayers',
    timestamps: true,
    indexes: [
      {
        fields: ['sessionId']
      },
      {
        fields: ['deviceNumber']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sessionId', 'deviceNumber'],
        unique: true,
        name: 'game_session_player_unique'
      }
    ]
  });

  GameSessionPlayer.associate = (models) => {
    // Many-to-One relationship with GameSession
    GameSessionPlayer.belongsTo(models.GameSession, {
      foreignKey: 'sessionId',
      targetKey: 'sessionId',
      as: 'session'
    });
    // Many-to-One relationship with GameDevice
    GameSessionPlayer.belongsTo(models.GameDevice, {
      foreignKey: 'deviceNumber',
      targetKey: 'DeviceNumber',
      as: 'device'
    });
  };

  return GameSessionPlayer;
}; 