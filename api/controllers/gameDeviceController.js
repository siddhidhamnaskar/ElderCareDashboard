const { GameDevice, SensorUser, GameDeviceUserRelation } = require('../models');

// Get all game devices
const getAllGameDevices = async (req, res) => {
  try {
    const userGoogleId = req.query.userGoogleId;  
    
    // First, find all game_device_id from GameDeviceUserRelations for this user
    const userRelations = await GameDeviceUserRelation.findAll({
      where: { user_google_id: userGoogleId },
      attributes: ['game_device_id']
    });
    
    // Extract the game_device_id values
    const gameDeviceIds = userRelations.map(relation => relation.game_device_id);
    
    // If no relations found, return empty array
    if (gameDeviceIds.length === 0) {
      return res.json([]);
    }
    
    // Then find all GameDevice records by these IDs
    const gameDevices = await GameDevice.findAll({
      where: { id: gameDeviceIds },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(gameDevices);
  } catch (error) {
    console.error('Error fetching game devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get game device by ID
const getGameDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const gameDevice = await GameDevice.findByPk(id);
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    res.json(gameDevice);
  } catch (error) {
    console.error('Error fetching game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get game device by device number
const getGameDeviceByNumber = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const gameDevice = await GameDevice.findOne({
      where: { DeviceNumber: deviceNumber }
    });
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    res.json(gameDevice);
  } catch (error) {
    console.error('Error fetching game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new game device
const createGameDevice = async (req, res) => {
  try {
    const { DeviceNumber, LTime, PTime, GTime, NL, status ,userGoogleId} = req.body;
    console.log(userGoogleId);
    console.log(req.body);
    
    // Check if device number already exists
    const existingDevice = await GameDevice.findOne({
      where: { DeviceNumber }
    });
    
    if (existingDevice) {
      if(userGoogleId){
        const existingRelation = await GameDeviceUserRelation.findOne({
          where: {
            game_device_id: existingDevice.id,
            user_google_id: userGoogleId
          }
        });
        if(existingRelation){
          res.status(400).json({ error: 'User is already assigned to this game device' });
        }
        else{
        const gameDevice = await GameDeviceUserRelation.create({
          game_device_id:existingDevice.id,
          user_google_id: userGoogleId
        });
        res.status(201).json(gameDevice);
        }
      }
      else{
        res.status(400).json({ error: 'User Google ID is required' });
      }
    }
    
  
    
   
  } catch (error) {
    console.error('Error creating game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update game device
const updateGameDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { DeviceNumber, LTime, PTime, GTime, NL, status } = req.body;
    
    const gameDevice = await GameDevice.findByPk(id);
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    // If DeviceNumber is being updated, check for uniqueness
    if (DeviceNumber && DeviceNumber !== gameDevice.DeviceNumber) {
      const existingDevice = await GameDevice.findOne({
        where: { DeviceNumber }
      });
      
      if (existingDevice) {
        return res.status(400).json({ error: 'Device number already exists' });
      }
    }
    
    await gameDevice.update({
      DeviceNumber: DeviceNumber || gameDevice.DeviceNumber,
      LTime: LTime || gameDevice.LTime,
      PTime: PTime || gameDevice.PTime,
      GTime: GTime || gameDevice.GTime,
      NL: NL !== undefined ? NL : gameDevice.NL,
      status: status || gameDevice.status
    });
    
    res.json(gameDevice);
  } catch (error) {
    console.error('Error updating game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update game device by device number
const updateGameDeviceByNumber = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const { LTime, PTime, GTime, NL, status } = req.body;
    
    const gameDevice = await GameDevice.findOne({
      where: { DeviceNumber: deviceNumber }
    });
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    await gameDevice.update({
      LTime: LTime || gameDevice.LTime,
      PTime: PTime || gameDevice.PTime,
      GTime: GTime || gameDevice.GTime,
      NL: NL !== undefined ? NL : gameDevice.NL,
      status: status || gameDevice.status
    });
    
    res.json(gameDevice);
  } catch (error) {
    console.error('Error updating game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete game device
const deleteGameDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const gameDevice = await GameDevice.findByPk(id);
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    await gameDevice.destroy();
    
    res.json({ message: 'Game device deleted successfully' });
  } catch (error) {
    console.error('Error deleting game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get active game devices
const getActiveGameDevices = async (req, res) => {
  try {
    const activeDevices = await GameDevice.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(activeDevices);
  } catch (error) {
    console.error('Error fetching active game devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update device times (LTime, PTime, GTime)
const updateDeviceTimes = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const { LTime, PTime, GTime } = req.body;
    
    const gameDevice = await GameDevice.findOne({
      where: { DeviceNumber: deviceNumber }
    });
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    await gameDevice.update({
      LTime: LTime || gameDevice.LTime,
      PTime: PTime || gameDevice.PTime,
      GTime: GTime || gameDevice.GTime
    });
    
    res.json(gameDevice);
  } catch (error) {
    console.error('Error updating device times:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update device level (NL)
const updateDeviceLevel = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    const { NL } = req.body;
    
    if (NL === undefined) {
      return res.status(400).json({ error: 'NL parameter is required' });
    }
    
    const gameDevice = await GameDevice.findOne({
      where: { DeviceNumber: deviceNumber }
    });
    
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    await gameDevice.update({ NL });
    
    res.json(gameDevice);
  } catch (error) {
    console.error('Error updating device level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Assign user to game device
const assignUserToGameDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { userGoogleId, role = 'user' } = req.body;
    
    if (!userGoogleId) {
      return res.status(400).json({ error: 'User Google ID is required' });
    }
    
    // Check if game device exists
    const gameDevice = await GameDevice.findByPk(deviceId);
    if (!gameDevice) {
      return res.status(404).json({ error: 'Game device not found' });
    }
    
    // Check if user exists
    const user = await SensorUser.findOne({
      where: { google_id: userGoogleId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if relationship already exists
    const existingRelation = await GameDeviceUserRelation.findOne({
      where: {
        game_device_id: deviceId,
        user_google_id: userGoogleId
      }
    });
    
    if (existingRelation) {
      return res.status(400).json({ error: 'User is already assigned to this game device' });
    }
    
    // Create the relationship using GameDeviceUserRelation table
    const relation = await GameDeviceUserRelation.create({
      game_device_id: deviceId,
      user_google_id: userGoogleId,
      role: role,
      assigned_at: new Date()
    });
    
    // Fetch the created relationship with user details
    const relationWithUser = await GameDeviceUserRelation.findByPk(relation.id, {
      include: [{
        model: SensorUser,
        as: 'user',
        attributes: ['google_id', 'name', 'email', 'picture']
      }, {
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['id', 'DeviceNumber', 'status']
      }]
    });
    
    res.json(relationWithUser);
  } catch (error) {
    console.error('Error assigning user to game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove user from game device
const removeUserFromGameDevice = async (req, res) => {
  try {
    const { deviceId, userGoogleId } = req.params;
    
    const deleted = await GameDeviceUserRelation.destroy({
      where: {
        game_device_id: deviceId,
        user_google_id: userGoogleId
      }
    });
    
    if (!deleted) {
      return res.status(404).json({ error: 'User assignment not found' });
    }
    
    res.json({ message: 'User removed from game device successfully' });
  } catch (error) {
    console.error('Error removing user from game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get game devices by user
const getGameDevicesByUser = async (req, res) => {
  try {
    const { userGoogleId } = req.params;
    
    const relations = await GameDeviceUserRelation.findAll({
      where: { user_google_id: userGoogleId },
      include: [{
        model: GameDevice,
        as: 'gameDevice',
        attributes: ['id', 'DeviceNumber', 'LTime', 'PTime', 'GTime', 'NL', 'status', 'createdAt']
      }],
      order: [['assigned_at', 'DESC']]
    });
    
    res.json(relations);
  } catch (error) {
    console.error('Error fetching game devices by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get users by game device
const getUsersByGameDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const relations = await GameDeviceUserRelation.findAll({
      where: { game_device_id: deviceId },
      include: [{
        model: SensorUser,
        as: 'user',
        attributes: ['google_id', 'name', 'email', 'picture', 'isAdmin']
      }],
      order: [['assigned_at', 'DESC']]
    });
    
    res.json(relations);
  } catch (error) {
    console.error('Error fetching users by game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all game device user relations
const getAllGameDeviceUserRelations = async (req, res) => {
  try {
    const relations = await GameDeviceUserRelation.findAll({
      include: [
        {
          model: GameDevice,
          as: 'gameDevice',
          attributes: ['id', 'DeviceNumber', 'status']
        },
        {
          model: SensorUser,
          as: 'user',
          attributes: ['google_id', 'name', 'email', 'picture']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });
    
    res.json(relations);
  } catch (error) {
    console.error('Error fetching all game device user relations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user role for game device
const updateUserRoleForGameDevice = async (req, res) => {
  try {
    const { deviceId, userGoogleId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const relation = await GameDeviceUserRelation.findOne({
      where: {
        game_device_id: deviceId,
        user_google_id: userGoogleId
      }
    });
    
    if (!relation) {
      return res.status(404).json({ error: 'User assignment not found' });
    }
    
    await relation.update({ role });
    
    const updatedRelation = await GameDeviceUserRelation.findByPk(relation.id, {
      include: [
        {
          model: GameDevice,
          as: 'gameDevice',
          attributes: ['id', 'DeviceNumber', 'status']
        },
        {
          model: SensorUser,
          as: 'user',
          attributes: ['google_id', 'name', 'email', 'picture']
        }
      ]
    });
    
    res.json(updatedRelation);
  } catch (error) {
    console.error('Error updating user role for game device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllGameDevices,
  getGameDeviceById,
  getGameDeviceByNumber,
  createGameDevice,
  updateGameDevice,
  updateGameDeviceByNumber,
  deleteGameDevice,
  getActiveGameDevices,
  updateDeviceTimes,
  updateDeviceLevel,
  assignUserToGameDevice,
  removeUserFromGameDevice,
  getGameDevicesByUser,
  getUsersByGameDevice,
  getAllGameDeviceUserRelations,
  updateUserRoleForGameDevice
}; 