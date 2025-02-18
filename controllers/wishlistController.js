const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');

// @desc    Add story to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
exports.addStoryToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add storyId to wishlist array if storyId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.storyId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Story added successfully to your wishlist.',
    data: user.wishlist,
  });
});


// @desc    Remove story from wishlist
// @route   DELETE /api/v1/wishlist/:storyId
// @access  Protected/User
exports.removeStoryFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull => remove storyId from wishlist array if storyId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.storyId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Story removed successfully from your wishlist.',
    data: user.wishlist,
  });
});

// @desc    Get logged user wishlist with search feature
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.search
    ? { title: { $regex: req.query.search, $options: "i" } } 
    : {};

  const user = await User.findById(req.user._id)
    .populate({
      path: 'wishlist',
      match: searchQuery,
    });

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
