const mongoose = require('mongoose');

const ALLOWED_AVATARS = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 40,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 60,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
  },
  password: {
    type: String,
    // Not required because GitHub login users do not have a password.
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true,
  },
  githubUsername: {
    type: String,
    trim: true,
  },
  githubToken: {
    type: String,
    // Used for GitHub repository access after OAuth login.
  },
  avatar: {
    type: String,
    // GitHub profile picture URL for GitHub users.
  },
  selectedAvatar: {
    type: String,
    enum: ALLOWED_AVATARS,
    default: 'avatar-1',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 180,
    default: '',
  },
  loginCodeHash: {
    type: String,
    // Temporary hashed email authentication code for email/password login.
  },
  loginCodeExpiresAt: {
    type: Date,
  },
  loginCodeAttempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
module.exports.ALLOWED_AVATARS = ALLOWED_AVATARS;
