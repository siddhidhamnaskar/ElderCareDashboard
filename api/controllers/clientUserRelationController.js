const { ClientUserRelation, SensorUser, UnlinkedSensorClient, Sensor, SensorUserRelation } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');

// Test endpoint
exports.test = async (req, res) => {
  console.log('ClientUserRelation test endpoint hit');
  console.log('Request user:', req.user);
  
  // Test sensor linking functionality
  try {
    const testClientUid = 'test_client_123';
    const testUserGoogleId = req.user.google_id;
    
    // Check if there are any sensors for this test client
    const sensors = await Sensor.findAll({
      where: { client_uid: testClientUid }
    });
    
    res.json({ 
      message: 'ClientUserRelation controller working',
      user: req.user,
      testClientUid,
      sensorsFound: sensors.length,
      sensors: sensors.map(s => ({ serial: s.serial, client_uid: s.client_uid }))
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      message: 'Test endpoint error',
      error: error.message 
    });
  }
};

// Create a new client-user relation
exports.create = async (req, res) => {
  try {
  
    // Authorization check: users can only create relations for themselves, admins can create for anyone
    if (!req.user.isAdmin && req.user.google_id !== req.body.user_google_id) {
      return res.status(403).json({ message: 'Access denied. You can only create relations for yourself.' });
    }
    
    const { client_uid, user_google_id } = req.body;

    // Check if the client exists in UnlinkedSensorClients table
    const client = await UnlinkedSensorClient.findOne({
      where: { uid: client_uid }
    });

    // If client doesn't exist in UnlinkedSensorClients, return error
    if (!client) {
   
      return res.status(404).json({ 
        message: `Client with UID '${client_uid}' not found.` 
      });
    }

    // Check if relation already exists
    const existingRelation = await ClientUserRelation.findOne({
      where: {
        client_uid,
        user_google_id
      }
    });

    if (existingRelation) {
      return res.status(400).json({ message: 'Relation already exists' });
    }

    // Create the relation only if client exists
    const relation = await ClientUserRelation.create({
      client_uid,
      user_google_id,
      role: 'user',
      status: 'active'
    });

    // Find all sensors linked to this client_uid
    const sensors = await Sensor.findAll({
      where: { client_uid }
    });

    console.log(`Found ${sensors.length} sensors for client_uid: ${client_uid}`);

    // Create SensorUserRelation entries for all sensors linked to this client
    const sensorUserRelations = [];
    const errors = [];
    
    for (const sensor of sensors) {
      try {
        // Check if SensorUserRelation already exists
        const existingSensorUserRelation = await SensorUserRelation.findOne({
          where: {
            sensor_serial: sensor.serial,
            user_google_id: user_google_id
          }
        });

        if (!existingSensorUserRelation) {
          const sensorUserRelation = await SensorUserRelation.create({
            sensor_serial: sensor.serial,
            user_google_id: user_google_id,
            client_uid: client_uid,
            role: 'user'
          });
          sensorUserRelations.push(sensorUserRelation);
          console.log(`Created SensorUserRelation for sensor ${sensor.serial}`);
        } else {
          console.log(`SensorUserRelation already exists for sensor ${sensor.serial}`);
        }
      } catch (error) {
        console.error(`Error creating SensorUserRelation for sensor ${sensor.serial}:`, error);
        errors.push({
          sensor_serial: sensor.serial,
          error: error.message
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`Some SensorUserRelations failed to create:`, errors);
    }

    // Fetch the created relation with its associations
    const createdRelation = await ClientUserRelation.findOne({
      where: {
        client_uid,
        user_google_id
      },
      include: [
        {
          model: UnlinkedSensorClient,
          as: 'UnlinkedSensorClient',
          attributes: ['uid', 'name', 'building', 'city', 'client']
        },
        {
          model: SensorUser,
          as: 'SensorUser',
          attributes: ['name', 'email']
        }
      ]
    });

    res.status(201).json({
      ...createdRelation.toJSON(),
      sensorsLinked: sensorUserRelations.length,
      totalSensors: sensors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error creating relation:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.original?.sqlMessage || 'Unknown error'
    });
  }
};

// Get all relations
exports.getAll = async (req, res) => {
  try {
    // Authorization check: only admins can access all relations
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can view all relations.' });
    }
    
    const relations = await ClientUserRelation.findAll({
      include: [
        {
          model: SensorUser,
          as: 'SensorUser',
          attributes: ['name', 'email']
        },
        {
          model: UnlinkedSensorClient,
          as: 'UnlinkedSensorClient',
          attributes: ['name', 'building', 'city', 'client']
        }
      ]
    });
    res.json(relations);
  } catch (error) {
    console.error('Error fetching relations:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get relation by ID
exports.getById = async (req, res) => {
  try {
    const { clientUid, userGoogleId } = req.params;
    
    // Authorization check: users can only access their own relations, admins can access any
    if (!req.user.isAdmin && req.user.google_id !== userGoogleId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own relations.' });
    }
    
    const relation = await ClientUserRelation.findOne({
      where: {
        client_uid: clientUid,
        user_google_id: userGoogleId
      },
      include: [
        {
          model: SensorUser,
          as: 'SensorUser',
          attributes: ['name', 'email']
        },
        {
          model: UnlinkedSensorClient,
          as: 'UnlinkedSensorClient',
          attributes: ['name', 'building', 'city', 'client']
        }
      ]
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relation not found' });
    }

    res.json(relation);
  } catch (error) {
    console.error('Error fetching relation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update relation
exports.update = async (req, res) => {
  try {
    // Authorization check: only admins can update relations
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can update relations.' });
    }
    
    const { building, city, name } = req.body;
    const { clientUid,userGoogleId} = req.params;

    // First find the UnlinkedSensorClient
    const client = await UnlinkedSensorClient.findOne({
      where: {
        uid: clientUid
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update the UnlinkedSensorClient
    await client.update({
      name: name || client.name,
      building: building || client.building,
      city: city || client.city
    });

    // Fetch the updated client with its relations
    const updatedClient = await UnlinkedSensorClient.findOne({
      where: {
        uid: clientUid
      },
      include: [
        {
          model: ClientUserRelation,
          as: 'ClientUserRelations',
          where: {
            user_google_id: userGoogleId
          },
          attributes: ['user_google_id', 'role', 'status']
        }
      ]
    });

    // if (!updatedClient) {
    //   return res.status(404).json({ message: 'Client or relation not found' });
    // }

    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.original?.sqlMessage || 'Unknown error'
    });
  }
};

// Delete relation
exports.delete = async (req, res) => {
  try {
    // Authorization check: only admins can delete relations
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can delete relations.' });
    }
    
    const { clientUid, userGoogleId } = req.params;
    
    const relation = await ClientUserRelation.findOne({
      where: {
        client_uid: clientUid,
        user_google_id: userGoogleId
      }
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relation not found' });
    }

    // Find all sensors linked to this client_uid
    const sensors = await Sensor.findAll({
      where: { client_uid: clientUid }
    });

    console.log(`Found ${sensors.length} sensors for client_uid: ${clientUid}`);

    // Remove SensorUserRelation entries for all sensors linked to this client
    let removedSensorRelations = 0;
    for (const sensor of sensors) {
      try {
        const deletedCount = await SensorUserRelation.destroy({
          where: {
            sensor_serial: sensor.serial,
            user_google_id: userGoogleId
          }
        });
        if (deletedCount > 0) {
          removedSensorRelations++;
          console.log(`Removed SensorUserRelation for sensor ${sensor.serial}`);
        }
      } catch (error) {
        console.error(`Error removing SensorUserRelation for sensor ${sensor.serial}:`, error);
      }
    }

    // Delete the client-user relation
    await relation.destroy();
    
    res.json({ 
      message: 'Relation deleted successfully',
      sensorsUnlinked: removedSensorRelations,
      totalSensors: sensors.length
    });
  } catch (error) {
    console.error('Error deleting relation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get relations by client
exports.getByClient = async (req, res) => {
  try {
    // Authorization check: only admins can access client relations
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can view client relations.' });
    }
    
    const relations = await ClientUserRelation.findAll({
      where: {
        client_uid: req.params.clientUid
      },
      include: [
        {
          model: SensorUser,
          attributes: ['name', 'email']
        }
      ]
    });
    res.json(relations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get relations by user
exports.getByUser = async (req, res) => {
  try {
    const { userGoogleId } = req.params;
    
    // Authorization check: users can only access their own relations, admins can access any
    if (!req.user.isAdmin && req.user.google_id !== userGoogleId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own relations.' });
    }
 
    const relations = await ClientUserRelation.findAll({
      where: {
        user_google_id: userGoogleId
      },
      include: [
        {
          model: UnlinkedSensorClient,
          attributes: ['name', 'email']
        }
      ]
    });
    res.json(relations);
  } catch (error) {
  
    res.status(500).json({ message: error.message });
  }
};

// Get relations by user ID
exports.getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('getByUserId - Request user:', {
      google_id: req.user.google_id,
      isAdmin: req.user.isAdmin,
      requestedUserId: userId
    });
    
    // Authorization check: users can only access their own relations, admins can access any
    if (!req.user.isAdmin && req.user.google_id !== userId) {
      console.log('Authorization failed - User is not admin and not requesting their own data');
      return res.status(403).json({ message: 'Access denied. You can only view your own relations.' });
    }
    
    console.log('Authorization passed - proceeding with query');
    
    // First get all relations for the user
    const relations = await ClientUserRelation.findAll({
      where: {
        user_google_id: userId
      },
      attributes: ['client_uid', 'role', 'status', 'createdAt']
    });

    console.log('Found relations:', relations.length);

    // Return empty array if no relations found (instead of 404)
    if (!relations || relations.length === 0) {
      return res.json([]);
    }

    // Get all client_uids
    const clientUids = relations.map(relation => relation.client_uid);

    // Fetch all corresponding UnlinkedSensorClients
    const clients = await UnlinkedSensorClient.findAll({
      where: {
        uid: {
          [Op.in]: clientUids
        }
      },
      attributes: ['uid', 'name', 'building', 'city', 'client', 'created_at']
    });

    // Get sensor counts for each client
    const sensorCounts = await Sensor.findAll({
      where: {
        client_uid: {
          [Op.in]: clientUids
        }
      },
      attributes: [
        'client_uid',
        [db.sequelize.fn('COUNT', db.sequelize.col('serial')), 'sensorCount']
      ],
      group: ['client_uid']
    });

    // Create a map of client_uid to sensor count
    const sensorCountMap = {};
    sensorCounts.forEach(count => {
      sensorCountMap[count.client_uid] = parseInt(count.dataValues.sensorCount);
    });

    // Combine the data
    const result = relations.map(relation => {
      const client = clients.find(c => c.uid === relation.client_uid);
      return {
        ...relation.toJSON(),
        UnlinkedSensorClient: client || null,
        sensorsLinked: sensorCountMap[relation.client_uid] || 0
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching user relations:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.original?.sqlMessage || 'Unknown error'
    });
  }
}; 