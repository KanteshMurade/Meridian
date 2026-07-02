const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendLoginCodeEmail } = require('../utils/emailService');

const ALLOWED_AVATARS = User.ALLOWED_AVATARS || ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_CODE_EXPIRY_MINUTES = 10;
const MAX_LOGIN_CODE_ATTEMPTS = 5;

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const getAccountType = (user) => (user.githubId ? 'github' : 'email');

const cleanString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) {
    return email || '';
  }

  const [name, domain] = email.split('@');
  const visibleName = name.length <= 2 ? name[0] || '*' : `${name[0]}${'*'.repeat(Math.min(name.length - 2, 5))}${name[name.length - 1]}`;
  return `${visibleName}@${domain}`;
};

const generateLoginCode = () => crypto.randomInt(100000, 1000000).toString();

const clearLoginCode = (user) => {
  user.loginCodeHash = undefined;
  user.loginCodeExpiresAt = undefined;
  user.loginCodeAttempts = 0;
};

const buildUserResponse = (user, includeToken = false) => {
  const response = {
    _id: user._id,
    username: user.username,
    displayName: user.displayName || user.username || user.githubUsername || 'User',
    email: user.email,
    avatar: user.avatar,
    selectedAvatar: user.githubId ? null : (user.selectedAvatar || 'avatar-1'),
    bio: user.bio || '',
    githubUsername: user.githubUsername,
    accountType: getAccountType(user),
    githubConnected: Boolean(user.githubId),
    createdAt: user.createdAt,
  };

  if (includeToken) {
    response.token = generateToken(user._id);
  }

  return response;
};

const handleAuthError = (error, res, fallbackMessage = 'Authentication request failed.') => {
  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    if (duplicateField === 'email') {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    if (duplicateField === 'username') {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    return res.status(400).json({ message: 'User already exists.' });
  }

  if (error.name === 'ValidationError') {
    const firstMessage = Object.values(error.errors || {})[0]?.message;
    return res.status(400).json({ message: firstMessage || 'Invalid user data.' });
  }

  console.error('Auth error:', error.message);
  return res.status(500).json({ message: fallbackMessage });
};

const validateRegisterInput = ({ username, email, password }) => {
  const cleanUsername = cleanString(username);
  const cleanEmail = cleanString(email).toLowerCase();

  if (!cleanUsername || !cleanEmail || typeof password !== 'string') {
    return 'Username, email, and password are required.';
  }

  if (cleanUsername.length < 3 || cleanUsername.length > 40) {
    return 'Username must be between 3 and 40 characters.';
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return 'Please enter a valid email address.';
  }

  if (password.length < 6 || password.length > 72) {
    return 'Password must be between 6 and 72 characters.';
  }

  return null;
};

// REGISTER
const register = async (req, res) => {
  const { username, email, password } = req.body;
  const validationError = validateRegisterInput({ username, email, password });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const cleanUsername = cleanString(username);
  const cleanEmail = cleanString(email).toLowerCase();

  try {
    const userExists = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (userExists) {
      return res.status(400).json({
        message: userExists.email === cleanEmail ? 'Email is already registered.' : 'Username is already taken.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: cleanUsername,
      displayName: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      selectedAvatar: 'avatar-1',
      bio: '',
    });

    return res.status(201).json(buildUserResponse(user, true));
  } catch (error) {
    return handleAuthError(error, res, 'Failed to register user.');
  }
};

// LOGIN STEP 1: verify email/password and send authentication code
const login = async (req, res) => {
  const cleanEmail = cleanString(req.body.email).toLowerCase();
  const { password } = req.body;

  if (!cleanEmail || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const loginCode = generateLoginCode();
    const salt = await bcrypt.genSalt(10);

    user.loginCodeHash = await bcrypt.hash(loginCode, salt);
    user.loginCodeExpiresAt = new Date(Date.now() + LOGIN_CODE_EXPIRY_MINUTES * 60 * 1000);
    user.loginCodeAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendLoginCodeEmail({
      to: user.email,
      username: user.displayName || user.username,
      code: loginCode,
    });

    return res.json({
      requiresEmailCode: true,
      message: emailResult.devFallback
        ? 'Authentication code generated. SMTP is not configured, so check the backend console for the code.'
        : 'Authentication code sent to your email.',
      email: maskEmail(user.email),
    });
  } catch (error) {
    return handleAuthError(error, res, 'Failed to send authentication code.');
  }
};

// LOGIN STEP 2: verify authentication code and issue JWT token
const verifyLoginCode = async (req, res) => {
  const cleanEmail = cleanString(req.body.email).toLowerCase();
  const code = cleanString(req.body.code);

  if (!cleanEmail || !code) {
    return res.status(400).json({ message: 'Email and authentication code are required.' });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Authentication code must be 6 digits.' });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.loginCodeHash || !user.loginCodeExpiresAt) {
      return res.status(400).json({ message: 'Authentication code is invalid or expired. Please login again.' });
    }

    if (user.loginCodeExpiresAt.getTime() < Date.now()) {
      clearLoginCode(user);
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Authentication code expired. Please login again.' });
    }

    if (user.loginCodeAttempts >= MAX_LOGIN_CODE_ATTEMPTS) {
      clearLoginCode(user);
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({ message: 'Too many wrong code attempts. Please login again.' });
    }

    const isCodeValid = await bcrypt.compare(code, user.loginCodeHash);

    if (!isCodeValid) {
      user.loginCodeAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        message: `Invalid authentication code. ${Math.max(MAX_LOGIN_CODE_ATTEMPTS - user.loginCodeAttempts, 0)} attempt(s) left.`,
      });
    }

    clearLoginCode(user);
    await user.save({ validateBeforeSave: false });

    return res.json(buildUserResponse(user, true));
  } catch (error) {
    return handleAuthError(error, res, 'Failed to verify authentication code.');
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -githubToken -loginCodeHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(buildUserResponse(user));
  } catch (error) {
    return handleAuthError(error, res, 'Failed to fetch profile.');
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { displayName, bio, selectedAvatar } = req.body;

    if (displayName !== undefined) {
      if (typeof displayName !== 'string') {
        return res.status(400).json({ message: 'Display name must be text.' });
      }

      const cleanDisplayName = displayName.trim();

      if (!cleanDisplayName) {
        return res.status(400).json({ message: 'Display name cannot be empty.' });
      }

      if (cleanDisplayName.length > 60) {
        return res.status(400).json({ message: 'Display name must be 60 characters or less.' });
      }

      user.displayName = cleanDisplayName;
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ message: 'Bio must be text.' });
      }

      const cleanBio = bio.trim();

      if (cleanBio.length > 180) {
        return res.status(400).json({ message: 'Bio must be 180 characters or less.' });
      }

      user.bio = cleanBio;
    }

    // GitHub users keep their GitHub profile picture only.
    // Email/password users can choose from preset Meridian avatars.
    if (!user.githubId && selectedAvatar !== undefined) {
      if (typeof selectedAvatar !== 'string' || !ALLOWED_AVATARS.includes(selectedAvatar)) {
        return res.status(400).json({ message: 'Invalid avatar selection.' });
      }

      user.selectedAvatar = selectedAvatar;
    }

    await user.save();

    return res.json(buildUserResponse(user));
  } catch (error) {
    return handleAuthError(error, res, 'Failed to update profile.');
  }
};

module.exports = { register, login, verifyLoginCode, getProfile, updateProfile };
