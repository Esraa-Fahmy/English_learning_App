const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');

// @desc    Add story to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
exports.addStoryToWishlist = asyncHandler(async (req, res, next) => {
  const { storyId } = req.body;

  // ✅ التحقق من أن القصة موجودة في قاعدة البيانات
  const story = await StoryModel.findById(storyId);
  if (!story) {
    return res.status(404).json({
      status: "fail",
      message: "Story not found. It may have been deleted.",
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  // ❌ منع الـ Admin من إضافة قصص إلى الـ wishlist
  if (user.role === "admin") {
    return res.status(400).json({
      status: "fail",
      message: "Admin cannot add stories to wishlist.",
    });
  }

  // ✅ إضافة القصة إذا كانت موجودة
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: storyId } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Story added successfully to your wishlist.",
    data: updatedUser.wishlist,
  });
});



// @desc    Remove story from wishlist
// @route   DELETE /api/v1/wishlist/:storyId
// @access  Protected/User
exports.removeStoryFromWishlist = asyncHandler(async (req, res, next) => {
  const { storyId } = req.params;

  // ✅ التحقق من أن القصة موجودة في قاعدة البيانات
  const story = await StoryModel.findById(storyId);
  if (!story) {
    return res.status(404).json({
      status: "fail",
      message: "Story not found. It may have been deleted.",
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  // ❌ منع الـ Admin من حذف القصص من الـ wishlist
  if (user.role === "admin") {
    return res.status(400).json({
      status: "fail",
      message: "Admin cannot remove stories from wishlist.",
    });
  }

  // ✅ إزالة القصة إذا كانت موجودة
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: storyId } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Story removed successfully from your wishlist.",
    data: updatedUser.wishlist,
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
      path: "wishlist",
      match: searchQuery,
    });

  // ✅ إزالة القصص غير الموجودة في قاعدة البيانات
  const validWishlist = user.wishlist.filter(story => story !== null);

  res.status(200).json({
    status: "success",
    results: validWishlist.length,
    data: validWishlist,
  });
});
