module.exports = (sequelize, DataTypes) => {
  const ClientUserRelation = sequelize.define('ClientUserRelation', {
    client_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'UnlinkedSensorClients',
        key: 'uid'
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
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'ClientUserRelations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['client_uid', 'user_google_id']
      }
    ]
  });

  ClientUserRelation.associate = (models) => {
    ClientUserRelation.belongsTo(models.UnlinkedSensorClient, {
      foreignKey: 'client_uid',
      targetKey: 'uid',
      as: 'UnlinkedSensorClient'
    });
    ClientUserRelation.belongsTo(models.SensorUser, {
      foreignKey: 'user_google_id',
      targetKey: 'google_id',
      as: 'SensorUser'
    });
  };

  return ClientUserRelation;
}; 