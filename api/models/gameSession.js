module.exports = (sequelize, DataTypes) => {
  const GameSession = sequelize.define('GameSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique session identifier'
    },
    gameTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Game duration in seconds'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Session status'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the game started'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the game ended'
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User who created the session'
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
    tableName: 'GameSessions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['sessionId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdBy']
      }
    ]
  });

  GameSession.associate = (models) => {
    // One-to-Many relationship with GameSessionPlayer
    GameSession.hasMany(models.GameSessionPlayer, {
      foreignKey: 'sessionId',
      sourceKey: 'sessionId',
      as: 'players'
    });
  };

  return GameSession;
}; 