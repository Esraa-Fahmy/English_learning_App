const AppRating = require('../models/ratingAppModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');

// @desc    Add a rating for the app
// @route   POST /api/v1/appRatings
// @access  Protected/User
exports.addRating = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  // Ensure that rating and comment are provided
  if (!rating || !comment) {
    return next(new ApiError('Please provide rating and comment', 400));
  }

  // Create a new rating for the app
  const newRating = await AppRating.create({
    rating,
    comment,
    user: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: newRating,
  });
});



// @desc    Get all ratings for the app
// @route   GET /api/v1/appRatings
// @access  Public
exports.getAllRatings = asyncHandler(async (req, res, next) => {
    const ratings = await AppRating.find().populate('user', 'userName'); 
  
    res.status(200).json({
      status: 'success',
      results: ratings.length,
      data: ratings,
    });
  });