const jwt = require('jsonwebtoken');
const { User, Citizen, Lawyer } = require('../models');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
    });

    // If citizen, create citizen profile
    if (role === 'citizen') {
      await Citizen.create({
        userId: user.userId,
        phone,
        address,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      token,
      user: { userId: user.userId, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: { userId: user.userId, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

// Get current user (extended with citizen profile)
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const result = { userId: user.userId, name: user.name, email: user.email, role: user.role };

    // Include citizen profile data if applicable
    if (user.role === 'citizen') {
      const citizen = await Citizen.findOne({ where: { userId: user.userId } });
      if (citizen) {
        result.phone = citizen.phone;
        result.address = citizen.address;
      }
    }

    res.json({ success: true, user: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: err.message });
  }
};

// Update citizen profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (name && name.trim()) {
      await user.update({ name: name.trim() });
    }

    if (user.role === 'citizen') {
      const citizen = await Citizen.findOne({ where: { userId: user.userId } });
      if (citizen) {
        const updates = {};
        if (phone !== undefined) updates.phone = phone.trim();
        if (address !== undefined) updates.address = address.trim();
        if (Object.keys(updates).length > 0) await citizen.update(updates);
      }
    }

    // Return updated data
    const updatedUser = await User.findByPk(req.user.userId);
    const result = { userId: updatedUser.userId, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role };
    if (updatedUser.role === 'citizen') {
      const citizen = await Citizen.findOne({ where: { userId: updatedUser.userId } });
      if (citizen) {
        result.phone = citizen.phone;
        result.address = citizen.address;
      }
    }

    res.json({ success: true, message: 'Profile updated successfully.', user: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
