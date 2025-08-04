const db = require('./models');

const findSensorByClientAndSerial = async (client_uid, serial) => {
  try {
    if (!client_uid || !serial) {
      throw new Error('client_uid and serial are required');
    }
    return await db.Sensor.findOne({
      where: { client_uid, serial }
    });
  } catch (error) {
    console.error('Error finding sensor:', error);
    throw error;
  }
};

const findSensorUserByGoogleId = async (google_id) => {
  try {
    if (!google_id) {
      throw new Error('google_id is required');
    }
    const user = await db.SensorUser.findOne({
      where: { google_id }
    });
    return user;
  } catch (error) {
    console.error('Error finding sensor user:', error);
    throw error;
  }
};

const findSensorUser = async (criteria) => {
  try {
    if (!criteria || Object.keys(criteria).length === 0) {
      throw new Error('Search criteria is required');
    }
    const user = await db.SensorUser.findOne({
      where: criteria
    });
    return user;
  } catch (error) {
    console.error('Error finding sensor user:', error);
    throw error;
  }
};

const findSensorUsers = async ({ name, email }) => {
  try {
    const user = await db.SensorUser.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { name },
          { email }
        ]
      }
    });
    return user;
  } catch (error) {
    console.error('Error finding sensor users:', error);
    throw error;
  }
};

const createSensorUser = async ({ name, email, google_id }) => {
  try {
    if (!name || !email || !google_id) {
      throw new Error('name, email, and google_id are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    return await db.SensorUser.create({
      name,
      email,
      google_id
    });
  } catch (error) {
    console.error('Error creating sensor user:', error);
    throw error;
  }
};

module.exports = {
  findSensorByClientAndSerial,
  findSensorUserByGoogleId,
  findSensorUser,
  findSensorUsers,
  createSensorUser
}; 