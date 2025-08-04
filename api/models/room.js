module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'SensorClients',
        key: 'uid'
      }
    },
    room_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'Rooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Room;
}; 