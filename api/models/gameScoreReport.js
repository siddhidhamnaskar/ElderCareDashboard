module.exports = (sequelize, DataTypes) => {
  const GameScoreReport = sequelize.define('GameScoreReport', {
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
    ReportDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of the report'
    },
    TotalGames: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of games played'
    },
    TotalOkPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of times OK button was pressed'
    },
    TotalWrongPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of times Wrong button was pressed'
    },
    TotalNoPressed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total number of times No button was pressed'
    },
    AverageResponseTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average response time in seconds'
    },
    FastestResponseTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Fastest response time in seconds'
    },
    SlowestResponseTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Slowest response time in seconds'
    },
    SuccessRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Success rate percentage (0-100)'
    },
    TotalPlayTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Total time spent playing in minutes'
    },
    PeakHour: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Hour with most activity (0-23)'
    },
    ReportType: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'game_completion'),
      allowNull: false,
      defaultValue: 'daily',
      comment: 'Type of report'
    },
    Status: {
      type: DataTypes.ENUM('active', 'archived', 'pending', 'completed'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Report status'
    },
    Notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes or comments'
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
    tableName: 'GameScoreReports',
    timestamps: true,
    indexes: [
      {
        fields: ['DeviceNumber']
      },
      {
        fields: ['ReportDate']
      },
      {
        fields: ['ReportType']
      },
      {
        fields: ['Status']
      },
      {
        fields: ['DeviceNumber', 'ReportDate', 'ReportType'],
        name: 'game_score_report_device_date_type'
      }
    ]
  });

  GameScoreReport.associate = (models) => {
    // Many-to-One relationship with GameDevice
    GameScoreReport.belongsTo(models.GameDevice, {
      foreignKey: 'DeviceNumber',
      targetKey: 'DeviceNumber',
      as: 'gameDevice'
    });
  };

  return GameScoreReport;
}; 