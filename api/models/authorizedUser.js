module.exports = (sequelize, DataTypes) => {
  const AuthorizedJoyUser = sequelize.define('AuthorizedJoyUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false
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
    tableName: 'AuthorizedUsers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
        name: 'idx_authorized_users_email_unique'
      }
    ]
  });

  return AuthorizedJoyUser;
}; 