const { GameSession, GameSessionPlayer, GameDevice } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const mqttHelper = require('../helpers/mqttHelper');
const mqttHandler = require('../mqtt/handler'); // use the instance, not mqttHelper


// 1. Get only online devices
const getOnlineDevices = async (req, res) => {
  try {
    const onlineDevices = await GameDevice.findAll({
      where: {
        status: 'active',
        lastHeartBeatTime: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000)
        }
      },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: onlineDevices });
  } catch (error) {
    console.error('Error fetching online devices:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 2. Validate session setup
const validateSessionSetup = (devices, playerNames, gameTime) => {
  if (!gameTime || !devices || !playerNames || devices.length !== playerNames.length) {
    return { valid: false, message: 'Invalid input: gameTime, devices, and playerNames are required' };
  }
  if (devices.length < 1 || devices.length > 6) {
    return { valid: false, message: 'Number of devices must be between 2 and 6' };
  }
  const names = playerNames.map(n => n.trim().toLowerCase());
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    return { valid: false, message: 'Player names must be unique' };
  }
  if (gameTime < 30 || gameTime > 600) {
    return { valid: false, message: 'Game time must be between 30 seconds and 10 minutes' };
  }
  return { valid: true };
};

// 3. Update game session (before game starts)
const updateGameSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { gameTime, devices, playerNames } = req.body;
    
    // Find the session
    const session = await GameSession.findOne({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    // Only allow updates if session is pending
    if (session.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot update session that has already started' });
    }
    
    // Validate input
    const validation = validateSessionSetup(devices, playerNames, gameTime);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }
    
    // Check if all devices are online
    const onlineDevices = await GameDevice.findAll({
      where: {
        DeviceNumber: devices,
        lastHeartBeatTime: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000)
        }
      }
    });
    if (onlineDevices.length !== devices.length) {
      const offlineDevices = devices.filter(device =>
        !onlineDevices.find(online => online.DeviceNumber === device)
      );
      return res.status(400).json({
        success: false,
        message: `Some devices are offline: ${offlineDevices.join(', ')}`
      });
    }
    
    // Update session
    await session.update({ gameTime });
    
    // Delete existing players and create new ones
    await GameSessionPlayer.destroy({ where: { sessionId } });
    
    // Create new player entries
    const players = await Promise.all(
      devices.map((device, index) =>
        GameSessionPlayer.create({
          sessionId,
          deviceNumber: device,
          playerName: playerNames[index],
          status: 'ready'
        })
      )
    );
    
    res.json({ success: true, data: { session, players } });
  } catch (error) {
    console.error('Error updating game session:', error);
    res.status(500).json({ success: false, message: 'Failed to update game session' });
  }
};

// 5. Create session with validation
const createGameSession = async (req, res) => {
  try {
    console.log('createGameSession', req.body);
    const { gameTime, devices, playerNames } = req.body;
    const createdBy = req.params.userGoogleId || 'system';
    // Validate input
    const validation = validateSessionSetup(devices, playerNames, gameTime);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }
    // Check if all devices are online
    const onlineDevices = await GameDevice.findAll({
      where: {
        DeviceNumber: devices,
        lastHeartBeatTime: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000)
        }
      }
    });
    if (onlineDevices.length !== devices.length) {
      const offlineDevices = devices.filter(device =>
        !onlineDevices.find(online => online.DeviceNumber === device)
      );
      return res.status(400).json({
        success: false,
        message: `Some devices are offline: ${offlineDevices.join(', ')}`
      });
    }
    // Create session
    const sessionId = uuidv4();
    const session = await GameSession.create({
      sessionId,
      gameTime,
      status: 'pending',
      createdBy
    });
    // Create player entries
    const players = await Promise.all(
      devices.map((device, index) =>
        GameSessionPlayer.create({
          sessionId,
          deviceNumber: device,
          playerName: playerNames[index],
          status: 'ready'
        })
      )
    );
    res.status(201).json({ success: true, data: { session, players } });
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ success: false, message: 'Failed to create game session' });
  }
};

// 6. Start game session
const startGameSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findOne({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Session cannot be started' });
    }
    await session.update({ status: 'active', startTime: new Date() });
    await GameSessionPlayer.update({ status: 'playing' }, { where: { sessionId } });
    // Start auto-end timer
    autoEndSession(sessionId, session.gameTime);
    const players = await GameSessionPlayer.findAll({ where: { sessionId } });
  
      for (const player of players) {
        const topic = `GVC/KP/${player.deviceNumber}`;
        // Send PTime first
        mqttHandler.mqttClient.publish(topic, `*PTime:${session.gameTime/60}#`);
        // Then send START
        mqttHandler.mqttClient.publish(topic, '*START#');
      }
    
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error starting game session:', error);
    res.status(500).json({ success: false, message: 'Failed to start game session' });
  }
};

// 7. End game session (manual or auto)
const endGameSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.body.sessionId;
    const session = await GameSession.findOne({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }
    await session.update({ status: 'completed', endTime: new Date() });
    await GameSessionPlayer.update({ status: 'completed' }, { where: { sessionId } });
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error ending game session:', error);
    res.status(500).json({ success: false, message: 'Failed to end game session' });
  }
};

// 8. Auto-end session after gameTime seconds
const timers = {};
const autoEndSession = (sessionId, gameTime) => {
  if (timers[sessionId]) clearTimeout(timers[sessionId]);
  timers[sessionId] = setTimeout(async () => {
    try {
      const session = await GameSession.findOne({ where: { sessionId } });
      if (session && session.status === 'active') {
        await session.update({ status: 'completed', endTime: new Date() });
        await GameSessionPlayer.update({ status: 'completed' }, { where: { sessionId } });
        // TODO: WebSocket/MQTT notification for session end
        console.log(`Session ${sessionId} auto-ended.`);
      }
    } catch (error) {
      console.error('Auto-end session error:', error);
    }
  }, gameTime * 1000);
};

// 9. Get real-time session progress
const getSessionProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findOne({
      where: { sessionId },
      include: [{ model: GameSessionPlayer, as: 'players' }]
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    let timeRemaining = 0;
    if (session.status === 'active' && session.startTime) {
      const elapsed = Math.floor((new Date() - new Date(session.startTime)) / 1000);
      timeRemaining = Math.max(0, session.gameTime - elapsed);
    }
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        gameTime: session.gameTime,
        timeRemaining,
        startTime: session.startTime,
        endTime: session.endTime,
        players: session.players
      }
    });
  } catch (error) {
    console.error('Error getting session progress:', error);
    res.status(500).json({ success: false, message: 'Failed to get session progress' });
  }
};

// 10. Get all sessions (with optional status filter)
const getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;
    const sessions = await GameSession.findAndCountAll({
      where: whereClause,
      include: [{ model: GameSessionPlayer, as: 'players' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({
      success: true,
      data: sessions.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sessions.count / parseInt(limit)),
        totalItems: sessions.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
};

// 11. Get session results
const getSessionResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findOne({
      where: { sessionId },
      include: [{ model: GameSessionPlayer, as: 'players', order: [['finalScore', 'DESC']] }]
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching session results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session results' });
  }
};

// 12. Update player score (stub)
const updatePlayerScore = async (req, res) => {
  try {
    const { sessionId, deviceNumber } = req.params;
    const { okPressed, wrongPressed, noPressed, avgResponseTime } = req.body;
    const player = await GameSessionPlayer.findOne({ where: { sessionId, deviceNumber } });
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found in session' });
    }
    const finalScore = (okPressed || 0) - (wrongPressed || 0);
    await player.update({
      okPressed: okPressed || 0,
      wrongPressed: wrongPressed || 0,
      noPressed: noPressed || 0,
      avgResponseTime: avgResponseTime || 0,
      finalScore
    });
    res.json({ success: true, data: player });
  } catch (error) {
    console.error('Error updating player score:', error);
    res.status(500).json({ success: false, message: 'Failed to update player score' });
  }
};

module.exports = {
  getOnlineDevices,
  createGameSession,
  updateGameSession,
  startGameSession,
  endGameSession,
  autoEndSession,
  getSessionProgress,
  getAllSessions,
  getSessionResults,
  updatePlayerScore
}; 