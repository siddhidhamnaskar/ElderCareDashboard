const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'mysql',
    logging: false
  }
);

const db = {
  sequelize,
  Sequelize,
  SensorUser: require('./user')(sequelize, Sequelize),
  SensorClient: require('./sensorClient')(sequelize, Sequelize),
  UnlinkedSensorClient: require('./unlinkedSensorClient')(sequelize, Sequelize),
  Room: require('./room')(sequelize, Sequelize),
  Sensor: require('./sensor')(sequelize, Sequelize),
  UserLinkedSensor: require('./userLinkedSensor')(sequelize, Sequelize),
  SensorTxn: require('./sensorTxn')(sequelize, Sequelize),
  SensorUserRelation: require('./sensorUserRelation')(sequelize, Sequelize),
  ClientUserRelation: require('./clientUserRelation')(sequelize, Sequelize),
  GameDevice: require('./gameDevice')(sequelize, Sequelize),
  GameDeviceUserRelation: require('./gameDeviceUserRelation')(sequelize, Sequelize),
  GameDeviceScore: require('./gameDeviceScore')(sequelize, Sequelize),
  GameScoreReport: require('./gameScoreReport')(sequelize, Sequelize),
  GameSession: require('./gameSession')(sequelize, Sequelize),
  GameSessionPlayer: require('./gameSessionPlayer')(sequelize, Sequelize),
  AuthorizedUser: require('./authorizedUser')(sequelize, Sequelize)
};

// Initialize associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations
db.SensorUser.hasMany(db.SensorClient);
db.SensorClient.belongsTo(db.SensorUser);

db.SensorClient.hasMany(db.Room);
db.Room.belongsTo(db.SensorClient);

db.SensorClient.hasMany(db.Sensor);
db.Sensor.belongsTo(db.SensorClient);

// Add association between Sensor and UnlinkedSensorClient
db.UnlinkedSensorClient.hasMany(db.Sensor, { foreignKey: 'client_uid' });
db.Sensor.belongsTo(db.UnlinkedSensorClient, { foreignKey: 'client_uid' });

db.Sensor.hasMany(db.SensorTxn);
db.SensorTxn.belongsTo(db.Sensor);

// Define many-to-many relationship between Sensor and SensorUser
db.Sensor.belongsToMany(db.SensorUser, {
  through: db.SensorUserRelation,
  foreignKey: 'sensor_serial',
  otherKey: 'user_google_id',
  as: 'users'
});

db.SensorUser.belongsToMany(db.Sensor, {
  through: db.SensorUserRelation,
  foreignKey: 'user_google_id',
  otherKey: 'sensor_serial',
  as: 'sensors'
});

db.UnlinkedSensorClient.hasMany(db.ClientUserRelation);
db.ClientUserRelation.belongsTo(db.UnlinkedSensorClient);

db.SensorUser.hasMany(db.ClientUserRelation);
db.ClientUserRelation.belongsTo(db.SensorUser);

// Define many-to-many relationship between GameDevice and SensorUser
db.GameDevice.belongsToMany(db.SensorUser, {
  through: db.GameDeviceUserRelation,
  foreignKey: 'game_device_id',
  otherKey: 'user_google_id',
  as: 'users'
});

db.SensorUser.belongsToMany(db.GameDevice, {
  through: db.GameDeviceUserRelation,
  foreignKey: 'user_google_id',
  otherKey: 'game_device_id',
  as: 'gameDevices'
});

// Direct associations for GameDeviceUserRelation
db.GameDeviceUserRelation.belongsTo(db.GameDevice, {
  foreignKey: 'game_device_id',
  as: 'gameDevice'
});

db.GameDeviceUserRelation.belongsTo(db.SensorUser, {
  foreignKey: 'user_google_id',
  as: 'user'
});

// GameDeviceScore associations
db.GameDevice.hasOne(db.GameDeviceScore, {
  foreignKey: 'DeviceNumber',
  sourceKey: 'DeviceNumber',
  as: 'score'
});

db.GameDeviceScore.belongsTo(db.GameDevice, {
  foreignKey: 'DeviceNumber',
  targetKey: 'DeviceNumber',
  as: 'gameDevice'
});

module.exports = db; 