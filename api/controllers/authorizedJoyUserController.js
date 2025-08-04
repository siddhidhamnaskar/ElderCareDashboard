const { AuthorizedJoyUser } = require('../models');

// Get all authorized users
const getAllAuthorizedJoyUsers = async (req, res) => {
  try {
    const users = await AuthorizedJoyUser.findAll({ order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (error) {
    console.error('Error fetching authorized users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get authorized user by id
const getAuthorizedJoyUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AuthorizedJoyUser.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching authorized user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new authorized user
const createAuthorizedJoyUser = async (req, res) => {
  try {
    const { email, userType } = req.body;
    if (!email || !userType) return res.status(400).json({ error: 'Email and userType are required' });
    const existing = await AuthorizedJoyUser.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const user = await AuthorizedJoyUser.create({ email, userType });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating authorized user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update authorized user
const updateAuthorizedJoyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userType } = req.body;
    const user = await AuthorizedJoyUser.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (email) user.email = email;
    if (userType) user.userType = userType;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating authorized user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete authorized user
const deleteAuthorizedJoyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AuthorizedJoyUser.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting authorized user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllAuthorizedJoyUsers,
  getAuthorizedJoyUserById,
  createAuthorizedJoyUser,
  updateAuthorizedJoyUser,
  deleteAuthorizedJoyUser
}; 