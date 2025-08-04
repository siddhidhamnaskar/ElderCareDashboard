module.exports = (sequelize, DataTypes) => {
  const SensorUser = sequelize.define('SensorUser', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    google_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    picture: {
      type: DataTypes.STRING
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'SensorUsers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return SensorUser;
}; 