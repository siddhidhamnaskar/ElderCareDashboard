const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const queries = require('../db/queries');
const db = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid token');
  }
};

const generateJWT = (user) => {
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: user.isAdmin || false
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use findOrCreate to prevent duplicate users
    const [user, created] = await db.SensorUser.findOrCreate({
      where: { google_id: decoded.sub },
      defaults: {
        google_id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        isAdmin: false // Default to false for new users
      }
    });

    // Add isAdmin to the request user object
    req.user = {
      ...user.toJSON(),
      isAdmin: user.isAdmin || false
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  verifyGoogleToken,
  generateJWT,
  authMiddleware
}; 