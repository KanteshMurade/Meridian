const Review = require('../models/Review');
const crypto = require('crypto');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const MAX_CODE_LINES = 500;
const AI_TIMEOUT_MS = 130000;

const normalizeLineEndings = (value) => {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

const getLineCount = (code) => {
  return normalizeLineEndings(code).split('\n').length;
};

const cleanText = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim() || fallback;
};

const validateCodeInput = (code) => {
  if (typeof code !== 'string') {
    return 'Code must be provided as text.';
  }

  if (!code.trim()) {
    return 'Please enter some code before analyzing.';
  }

  const lineCount = getLineCount(code);

  if (lineCount > MAX_CODE_LINES) {
    return `Only code up to ${MAX_CODE_LINES} lines is allowed.`;
  }

  return null;
};

const normalizeSeverity = (severity) => {
  const value = typeof severity === 'string' ? severity.toLowerCase().trim() : 'low';

  if (['high', 'medium', 'low'].includes(value)) {
    return value;
  }

  return 'low';
};

const normalizeSuggestions = (suggestions) => {
  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.map((item) => ({
    line: Number.isFinite(Number(item?.line)) ? Number(item.line) : 1,
    severity: normalizeSeverity(item?.severity),
    issue: cleanText(item?.issue, 'Issue detected.'),
    suggestion: cleanText(item?.suggestion, 'Please review and improve this section.'),
    refactoredCode: typeof item?.refactoredCode === 'string' ? item.refactoredCode : '',
  }));
};

const normalizeScore = (score) => {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericScore)));
};

const normalizeAiReviewData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('AI service returned an invalid response.');
  }

  return {
    suggestions: normalizeSuggestions(data.suggestions),
    overallScore: normalizeScore(data.overallScore),
    summary: cleanText(data.summary, 'AI review completed.'),
  };
};

const handleAiServiceError = (error, res) => {
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      message: 'AI service is not running. Please start the AI service and try again.',
    });
  }

  if (error.code === 'ECONNABORTED') {
    return res.status(504).json({
      message: 'AI service took too long to respond. Please try again with shorter code.',
    });
  }

  if (error.response) {
    const aiMessage = error.response.data?.message || error.response.data?.detail;

    return res.status(502).json({
      message: aiMessage || 'AI service returned an error. Please try again later.',
    });
  }

  if (error.request) {
    return res.status(503).json({
      message: 'Unable to reach AI service. Please check if it is running on localhost:8000.',
    });
  }

  return res.status(500).json({
    message: 'Something went wrong while analyzing the code.',
  });
};

const handleDatabaseError = (error, res, fallbackMessage = 'Database operation failed.') => {
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid review id.' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid review data received.' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate review data found. Please try again.' });
  }

  return res.status(500).json({ message: fallbackMessage });
};

const analyzeCode = async (req, res) => {
  const { code, language, title, sourceType, githubRepo } = req.body;

  const validationError = validateCodeInput(code);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    console.log('Sending code to AI service...');

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/analyze`,
      {
        code,
        language: cleanText(language, 'unknown'),
      },
      {
        timeout: AI_TIMEOUT_MS,
      }
    );

    const reviewData = normalizeAiReviewData(aiResponse.data);
    console.log('AI response received. Score:', reviewData.overallScore);

    const review = await Review.create({
      user: req.user._id,
      title: cleanText(title, 'Untitled Review'),
      originalCode: code,
      language: cleanText(language, 'unknown'),
      suggestions: reviewData.suggestions,
      overallScore: reviewData.overallScore,
      summary: reviewData.summary,
      sourceType: cleanText(sourceType, 'paste'),
      githubRepo: githubRepo || null,
      shareableLink: crypto.randomBytes(16).toString('hex'),
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Review error:', error.message);

    if (axios.isAxiosError(error)) {
      return handleAiServiceError(error, res);
    }

    return handleDatabaseError(error, res, 'Failed to save the review. Please try again.');
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.message);
    return handleDatabaseError(error, res, 'Failed to fetch review history.');
  }
};

const getReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.json(review);
  } catch (error) {
    console.error('Get review error:', error.message);
    return handleDatabaseError(error, res, 'Failed to fetch the review.');
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.deleteOne();
    return res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    return handleDatabaseError(error, res, 'Failed to delete the review.');
  }
};

const shareReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isPublic = true;

    if (!review.shareableLink) {
      review.shareableLink = crypto.randomBytes(16).toString('hex');
    }

    await review.save();
    return res.json({ shareableLink: review.shareableLink });
  } catch (error) {
    console.error('Share review error:', error.message);
    return handleDatabaseError(error, res, 'Failed to share the review.');
  }
};

module.exports = {
  analyzeCode,
  getReviews,
  getReview,
  deleteReview,
  shareReview,
};
