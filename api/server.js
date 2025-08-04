const express = require('express');
const cors = require('cors');
const mqttHandler = require('./mqtt/handler');
const queries = require('./db/queries');
const { verifyGoogleToken, generateJWT, authMiddleware } = require('./middleware/auth');
const db = require('./models');
const { Sensor, SensorUser } = require('./models');
const clientUserRelationRouter = require('./routes/clientUserRelationRoutes');
const sensorTxnRouter = require('./routes/sensorTxnRoutes');
const gameDeviceRouter = require('./routes/gameDeviceRoutes');
const gameDeviceScoreRouter = require('./routes/gameDeviceScoreRoutes');
const gameScoreReportRouter = require('./routes/gameScoreReportRoutes');
const gameSessionRouter = require('./routes/gameSessionRoutes');

require('dotenv').config();

const app = express();
// const mqttClient=new mqttHandler();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());



// Database initialization
db.sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync error:', err));

// Auth routes
app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const payload = await verifyGoogleToken(credential);
    console.log('Google payload:', payload);
    
    // Use findOrCreate to prevent duplicate users
    const [user, created] = await db.SensorUser.findOrCreate({
      where: { google_id: payload.sub },
      defaults: {
        google_id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isAdmin: false // Default to false for new users
      }
    });
    
    console.log('User found/created:', { 
      google_id: user.google_id, 
      name: user.name, 
      isAdmin: user.isAdmin, 
      created 
    });
    
    // Include isAdmin in the payload
    const userWithAdminStatus = {
      ...payload,
      isAdmin: user.isAdmin || false,
      isSuperAdmin: user.isSuperAdmin || false
    };
    
    console.log('Final userWithAdminStatus:', userWithAdminStatus);
    
    const token = generateJWT(userWithAdminStatus);
    res.json({ token, user: userWithAdminStatus });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Protected routes
app.use(authMiddleware);

// Test endpoint to check authentication
app.get('/api/test-auth', (req, res) => {
  console.log('Test auth endpoint - User:', {
    google_id: req.user.google_id,
    isAdmin: req.user.isAdmin,
    email: req.user.email
  });
  res.json({ 
    message: 'Authentication working',
    user: {
      google_id: req.user.google_id,
      isAdmin: req.user.isAdmin,
      email: req.user.email
    }
  });
});

// Client-user-relations routes (now protected by auth)
app.use('/api/client-user-relations', clientUserRelationRouter);

// Game device routes
app.use('/api/game-devices', gameDeviceRouter);

// Game device score routes
app.use('/api/game-device-scores', gameDeviceScoreRouter);
app.use('/api/game-score-reports', gameScoreReportRouter);
app.use('/api/game-sessions', gameSessionRouter);

// Client routes
app.get('/clients', async (req, res) => {
  try {
    const clients = await queries.getSensorClientsByUserId(req.user.id);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.post('/clients', async (req, res) => {
  try {
    const clientData = { ...req.body, user_id: req.user.id };
    const result = await queries.createSensorClient(clientData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Room routes
app.post('/rooms', async (req, res) => {
  try {
    const result = await queries.createRoom(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/rooms/:clientUid', async (req, res) => {
  try {
    const rooms = await queries.getRoomsByClientUid(req.params.clientUid);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Sensor routes
app.post('/sensors', async (req, res) => {
  try {
    const result = await queries.createSensor(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating sensor:', error);
    res.status(500).json({ error: 'Failed to create sensor' });
  }
});

app.get('/sensors/', async (req, res) => {
  try {
    const { user_id} = req.query;

    // Find all sensors associated with the user through SensorUserRelations
    const sensors = await db.Sensor.findAll({
      include: [{
        model: db.SensorUser,
        as: 'users',
        where: { google_id: user_id },
        through: { attributes: ['role', 'client_uid'] }
      }]
    });

    res.json(sensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

app.get('/sensors/:client_uid', async (req, res) => {
  try {
    const { user_id } = req.query;
    const { client_uid } = req.params;

    // Find all sensors associated with the user through SensorUserRelations
    const sensors = await db.Sensor.findAll({
      where: {
        client_uid: client_uid
      },
      include: [{
        model: db.SensorUser,
        as: 'users',
        where: { google_id: user_id },
        through: { 
          attributes: ['role', 'client_uid'],
          where: { client_uid: client_uid }
        }
      }]
    });

    res.json(sensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// Update sensor type
app.put('/sensors', async (req, res) => {
  try {
    const { client_uid, serial, type, desc } = req.body;
    
    // Find the sensor by client_uid and serial
    const sensor = await db.Sensor.findOne({
      where: { client_uid, serial }
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Update the sensor type
    await queries.updateSensorType(serial, type);
    await queries.updateSensorDesc(serial, desc);
    // Fetch and return the updated sensor
    const updatedSensor = await db.Sensor.findByPk(serial);
    res.json(updatedSensor);
  } catch (error) {
    console.error('Error updating sensor type:', error);
    res.status(500).json({ error: 'Failed to update sensor type' });
  }
});

// Sensor transaction routes
app.get('/sensor-txns/:sensorSerial', async (req, res) => {
  try {
    const txns = await queries.getSensorTxns(req.params.sensorSerial);
    res.json(txns);
  } catch (error) {
    console.error('Error fetching sensor transactions:', error);
    res.status(500).json({ error: 'Failed to fetch sensor transactions' });
  }
});

app.post('/devices', async (req, res) => {
  try {
    const { client_uid, serial, user_google_id, role, desc, type } = req.body;

    // Find the sensor (don't create if it doesn't exist)
    const sensor = await db.Sensor.findOne({
      where: { serial }
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // If user_google_id is provided, add the user to the sensor
    if (user_google_id) {
      // Use findOrCreate to prevent duplicate users
      const [user, userCreated] = await db.SensorUser.findOrCreate({
        where: { google_id: user_google_id },
        defaults: {
          google_id: user_google_id,
          name: 'Unknown User', // Will be updated when user logs in
          email: 'unknown@example.com', // Will be updated when user logs in
          isAdmin: false
        }
      });

      if (userCreated) {
        console.log('Created new user during device assignment:', user.google_id);
      }

      // Add the user to the sensor using the junction table, including client_uid
      await sensor.addUser(user, {
        through: { role: role || 'user', client_uid }
      });
    }

    // Fetch the sensor with its associated users
    const sensorWithUsers = await db.Sensor.findByPk(sensor.serial, {
      include: [{
        model: db.SensorUser,
        as: 'users',
        through: { attributes: ['role', 'client_uid'] }
      }]
    });

    res.json(sensorWithUsers);
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email, google_id } = req.body;
    
    // Use findOrCreate to prevent duplicate users
    const [user, created] = await db.SensorUser.findOrCreate({
      where: { google_id },
      defaults: {
        name,
        email,
        google_id,
        isAdmin: false
      }
    });
    
    console.log('User endpoint - found/created:', { 
      google_id: user.google_id, 
      name: user.name, 
      created 
    });
    
    res.status(created ? 201 : 200).json({
      user,
      message: created ? 'User created successfully' : 'User already exists'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users with their sensors
app.get('/users/sensors', authMiddleware, async (req, res) => {
  try {
    const users = await db.SensorUser.findAll({
      include: [{
        model: db.Sensor,
        as: 'sensors',
        through: { attributes: ['role'] }
      }]
    });

    console.log('Raw users from database:', users.map(u => ({
      google_id: u.google_id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin
    })));

    // Transform the data to include sensor count and role
    const transformedUsers = users.map(user => ({
      google_id: user.google_id,
      name: user.name,
      email: user.email,
      sensors: user.sensors,
      role: user.sensors[0]?.SensorUserRelation?.role || 'user',
      isAdmin: user.isAdmin
    }));

    console.log('Transformed users:', transformedUsers.map(u => ({
      google_id: u.google_id,
      name: u.name,
      isAdmin: u.isAdmin
    })));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users and sensors:', error);
    res.status(500).json({ error: 'Failed to fetch users and sensors' });
  }
});

// Update user admin status
app.put('/users/:googleId/admin', authMiddleware, async (req, res) => {
  try {
    const { googleId } = req.params;
    const { isAdmin } = req.body;
    
    // Check if the current user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Only admins can modify admin status' });
    }
    
    // Prevent admin from removing their own admin status
    if (googleId === req.user.google_id && !isAdmin) {
      return res.status(400).json({ error: 'Cannot remove your own admin status' });
    }
    
    const user = await db.SensorUser.findOne({
      where: { google_id: googleId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({ isAdmin });
    
    res.json({ 
      message: 'Admin status updated successfully',
      user: {
        google_id: user.google_id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// Delete sensor from user's list
app.delete('/sensors/:serial', async (req, res) => {
  try {
    const { serial } = req.params;
    const userId = req.query.user_id;
    const clientUid = req.query.client_uid;

    // Find the sensor
    const sensor = await db.Sensor.findOne({
      where: { serial }
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Find or create the user
    const [user, userCreated] = await db.SensorUser.findOrCreate({
      where: { google_id: userId },
      defaults: {
        google_id: userId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        isAdmin: false
      }
    });

    if (userCreated) {
      console.log('Created new user during sensor deletion:', user.google_id);
    }

    // Remove the relationship from SensorUserRelation
    await db.SensorUserRelation.destroy({
      where: {
        sensor_serial: serial,
        user_google_id: userId,
        client_uid: clientUid
      }
    });

    res.json({ message: 'Sensor removed successfully' });
  } catch (error) {
    console.error('Error removing sensor:', error);
    res.status(500).json({ error: 'Failed to remove sensor' });
  }
});

// Register sensor transaction routes
app.use('/api/sensor-txns', sensorTxnRouter);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mqttHandler.connect();
})

