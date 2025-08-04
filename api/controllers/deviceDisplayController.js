const { GameSession, GameSessionPlayer, GameDevice } = require('../models');
const { Op } = require('sequelize');

// Get current game status/progress for a specific device
const getSessionProgress = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    // Find active or pending session for this device
    const player = await GameSessionPlayer.findOne({
      where: {
        deviceNumber,
        status: { [Op.in]: ['ready', 'playing'] }
      },
      include: [{
        model: GameSession,
        as: 'session',
        where: { status: { [Op.in]: ['pending', 'active'] } }
      }]
    });
    if (!player) {
      return res.json({
        success: true,
        data: {
          deviceNumber,
          status: 'idle',
          message: 'No active game session'
        }
      });
    }
    // Get all players in the session
    const allPlayers = await GameSessionPlayer.findAll({
      where: { sessionId: player.sessionId },
      order: [['playerName', 'ASC']]
    });
    // Calculate time remaining if game is active
    let timeRemaining = 0;
    if (player.session.status === 'active' && player.session.startTime) {
      const elapsed = Math.floor((new Date() - new Date(player.session.startTime)) / 1000);
      timeRemaining = Math.max(0, player.session.gameTime - elapsed);
    }
    res.json({
      success: true,
      data: {
        deviceNumber,
        status: player.session.status,
        playerName: player.playerName,
        sessionId: player.sessionId,
        gameTime: player.session.gameTime,
        timeRemaining,
        startTime: player.session.startTime,
        players: allPlayers.map(p => ({
          deviceNumber: p.deviceNumber,
          playerName: p.playerName,
          status: p.status,
          currentScore: p.finalScore || 0,
          okPressed: p.okPressed || 0,
          wrongPressed: p.wrongPressed || 0,
          noPressed: p.noPressed || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error getting device session progress:', error);
    res.status(500).json({ success: false, message: 'Failed to get device session progress' });
  }
};

// Update player score during game
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

// Get final game results for a device
const getFinalResults = async (req, res) => {
  try {
    const { deviceNumber } = req.params;
    // Find completed session for this device
    const player = await GameSessionPlayer.findOne({
      where: { deviceNumber },
      include: [{
        model: GameSession,
        as: 'session',
        where: { status: 'completed' },
        order: [['endTime', 'DESC']]
      }]
    });
    if (!player) {
      return res.json({
        success: true,
        data: {
          deviceNumber,
          status: 'no_results',
          message: 'No completed games found'
        }
      });
    }
    // Get all players in the session with final scores
    const allPlayers = await GameSessionPlayer.findAll({
      where: { sessionId: player.sessionId },
      order: [['finalScore', 'DESC'], ['playerName', 'ASC']]
    });
    res.json({
      success: true,
      data: {
        deviceNumber,
        sessionId: player.sessionId,
        gameTime: player.session.gameTime,
        startTime: player.session.startTime,
        endTime: player.session.endTime,
        players: allPlayers.map((p, index) => ({
          rank: index + 1,
          deviceNumber: p.deviceNumber,
          playerName: p.playerName,
          finalScore: p.finalScore || 0,
          okPressed: p.okPressed || 0,
          wrongPressed: p.wrongPressed || 0,
          noPressed: p.noPressed || 0,
          avgResponseTime: p.avgResponseTime || 0,
          isWinner: index === 0
        }))
      }
    });
  } catch (error) {
    console.error('Error getting device game results:', error);
    res.status(500).json({ success: false, message: 'Failed to get device game results' });
  }
};

module.exports = {
  getSessionProgress,
  updatePlayerScore,
  getFinalResults
}; 