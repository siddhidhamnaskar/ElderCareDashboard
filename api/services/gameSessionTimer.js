const { GameSession, GameSessionPlayer } = require('../models');

// In-memory timers (for demo; use Redis or DB for production)
const timers = {};

// Start a timer for a session
function startSessionTimer(sessionId, gameTime, onEnd) {
  if (timers[sessionId]) clearTimeout(timers[sessionId]);
  timers[sessionId] = setTimeout(async () => {
    try {
      const session = await GameSession.findOne({ where: { sessionId } });
      if (session && session.status === 'active') {
        await session.update({ status: 'completed', endTime: new Date() });
        await GameSessionPlayer.update({ status: 'completed' }, { where: { sessionId } });
        // TODO: WebSocket/MQTT notification for session end
        if (onEnd) onEnd(sessionId);
        console.log(`Session ${sessionId} auto-ended by timer.`);
      }
    } catch (error) {
      console.error('Session timer error:', error);
    }
  }, gameTime * 1000);
}

// Stop a timer for a session
function stopSessionTimer(sessionId) {
  if (timers[sessionId]) {
    clearTimeout(timers[sessionId]);
    delete timers[sessionId];
  }
}

// Get time remaining for a session
function getTimeRemaining(session) {
  if (!session.startTime || session.status !== 'active') return 0;
  const elapsed = Math.floor((new Date() - new Date(session.startTime)) / 1000);
  return Math.max(0, session.gameTime - elapsed);
}

// (Stub) WebSocket/MQTT integration for live updates
function notifySessionUpdate(sessionId, data) {
  // TODO: Implement real-time updates via WebSocket/MQTT
  // Example: mqttHelper.publish(`game/session/${sessionId}/update`, data);
}

module.exports = {
  startSessionTimer,
  stopSessionTimer,
  getTimeRemaining,
  notifySessionUpdate
}; 