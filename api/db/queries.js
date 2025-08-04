const db = require('../models');

const queries = {
  // User queries
  createSensorUser: async (userData) => {
    return await db.SensorUser.create(userData);
  },

  getUserByGoogleId: async (googleId) => {
    return await db.SensorUser.findOne({ where: { google_id: googleId } });
  },

  // Sensor Client queries
  createSensorClient: async (clientData) => {
    return await db.SensorClient.create(clientData);
  },

  getSensorClientsByUserId: async (userId) => {
    return await db.SensorClient.findAll({ 
      where: { user_id: userId },
      include: [db.Room, db.Sensor]
    });
  },

  // Room queries
  createRoom: async (roomData) => {
    return await db.Room.create(roomData);
  },

  getRoomsByClientUid: async (clientUid) => {
    return await db.Room.findAll({ where: { client_uid: clientUid } });
  },

  // Sensor queries
  createSensor: async (sensorData) => {
    return await db.Sensor.create(sensorData);
  },

  getSensorsByClientUid: async (clientUid) => {
    return await db.Sensor.findAll({ 
      where: { client_uid: clientUid },
      include: [db.SensorTxn]
    });
  },

  getSensorsByClientUidAndUserId: async (userId) => {
    return await db.Sensor.findAll({
      include: [{
        model: db.SensorUser,
        as: 'users',
        where: { google_id: userId },
        through: { attributes: ['role', 'client_uid'] }
      }, {
        model: db.SensorTxn
      }]
    });
  },

  updateSensorStatus: async (serial, status) => {
    return await db.Sensor.update(
      { status },
      { where: { serial } }
    );
  },

  // Sensor Transaction queries
  createSensorTxn: async (txnData) => {
    return await db.SensorTxn.create(txnData);
  },

  getSensorTxns: async (sensorSerial) => {
    return await db.SensorTxn.findAll({
      where: { sensor_serial: sensorSerial },
      order: [['timestamp', 'DESC']],
      limit: 100
    });
  },

  findSensorByClientAndSerial: async (clientUid, serial) => {
    return await db.Sensor.findOne({ where: { client_uid: clientUid, serial } });
  },

  updateSensorType: async (serial, type) => {
    return await db.Sensor.update(
      { type },
      { where: { serial } }
    );
  },
  updateSensorDesc: async (serial, desc) => {
    return await db.Sensor.update(
      { desc },
      { where: { serial } }
    );
  },

};

module.exports = queries; 