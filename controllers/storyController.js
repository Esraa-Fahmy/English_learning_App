const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const fs = require('fs');
const StoryModel = require("../models/storyModel");
const User = require("../models/userModel");
const sendFirebaseNotification = require("./notifiations");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { uploadMixOfImages } = require('../midlewares/uploadImageMiddleWare');
const subCategoryModel = require("../models/subCategoryModel");



exports.uploadStoryImages = uploadMixOfImages([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);


exports.resizeStoryImages = asyncHandler(async (req, res, next) => {
    if (req.files.imageCover) {
        const imageCoverFileName = `story-${uuidv4()}-${Date.now()}-cover.jpeg`;

        const path = "uploads/stories/";
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 95 })
            .toFile(`uploads/stories/${imageCoverFileName}`);
        req.body.imageCover = imageCoverFileName;
    }
    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (img, index) => {
                const imageName = `story-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
                const path = "uploads/stories/";
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }
                await sharp(img.buffer)
                .resize({
                  width: 400,
                  height: 400,
                  fit: 'inside',  // يحافظ على الأبعاد الأصلية دون تمدد أو تشويه
               })
                    .toFormat('jpeg')
                    .jpeg({ quality: 95 })
                    .toFile(`uploads/stories/${imageName}`);
                req.body.images.push(imageName);
            })
        );
    }
    next();
});


exports.createStory = asyncHandler(async (req, res, next) => {
    const { subCategory } = req.body;
  
    const lastStory = await StoryModel.findOne({ subCategory }).sort({
      createdAt: 1,
    });
    const order = lastStory ? lastStory.order + 1 : 1;
  
    // إنشاء القصة
    const story = await StoryModel.create({ ...req.body, order });
  
    const subCategoryData = await subCategoryModel
      .findById(subCategory)
      .populate("category");
  
    if (!subCategoryData || !subCategoryData.category) {
      return res
        .status(400)
        .json({ message: "Invalid subCategory ID or category not found" });
    }
  
    const categoryName = subCategoryData.category.name;
  
    let notificationMessage =`محتوى جديد مميز متاح الاّن في ${categoryName} !يساعد طفلك في تعلم كلمات جديدة بطريقة ممتعة`;
  
    io.emit("contentAdded", {
      message: notificationMessage,
      story,
    });
  
    sendFirebaseNotification({
      title: "احترف الانجليزية",
      body: notificationMessage,
    });
  
    res.status(201).json({ data: story });
  });





  exports.getAllStories = asyncHandler(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 6;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search
        ? { title: { $regex: req.query.search, $options: "i" } }
        : {};

    // **التأكد من ترتيب البيانات حسب المطلوب**
    const sortOption = req.query.sort === 'latest' ? { createdAt: -1 } : { createdAt: 1 };

    const stories = await StoryModel.find(searchQuery)
        .sort(sortOption)  // 🔹 ترتيب حسب الطلب
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .populate("subCategory", "name");

    res.status(200).json({ results: stories.length, data: stories });
});





exports.getStory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const story = await StoryModel.findById(id);
    if (!story) return next(new ApiError(`No story found for ID ${id}`, 404));
    res.status(200).json({ data: story });
});



//تحديث قصة
exports.updateStory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const story = await StoryModel.findByIdAndUpdate({_id: id}, req.body, { new: true });
    if (!story) return next(new ApiError(`No story found for ID ${id}`, 404));
    res.status(200).json({ data: story });
});



exports.deleteStory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // ✅ البحث عن القصة أولًا قبل الحذف
  const story = await StoryModel.findById(id);
  if (!story) {
      return next(new ApiError(`No story found for ID ${id}`, 404));
  }

  // ✅ حذف القصة
  await StoryModel.findByIdAndDelete(id);

  // ✅ إزالة القصة من `wishlist` و `readStories` لكل المستخدمين
  await User.updateMany(
      { $or: [{ wishlist: id }, { readStories: id }] },
      { $pull: { wishlist: id, readStories: id } }
  );

  res.status(200).json({ message: "Story deleted successfully and removed from all users' wishlist and read stories." });
});



exports.markStoryAsRead = asyncHandler(async (req, res, next) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  // ✅ التحقق من أن القصة موجودة
  const story = await StoryModel.findById(storyId);
  if (!story) {
      return next(new ApiError(`No story found for ID ${storyId}`, 404));
  }

  // تحديث الحالة إلى "مقروءة"
  story.isRead = true;
  await story.save();

  // ✅ تحديث المستخدم وإضافة القصة إلى readStories
  const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { readStories: storyId } },
      { new: true }
  );

  if (!user) {
      return next(new ApiError(`No user found for ID ${userId}`, 404));
  }

  res.status(200).json({
      message: "Story marked as read successfully",
      readStories: user.readStories
  });
});


exports.unmarkStoryAsRead = asyncHandler(async (req, res, next) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  // ✅ التحقق من أن القصة موجودة
  const story = await StoryModel.findById(storyId);
  if (!story) {
      return next(new ApiError(`No story found for ID ${storyId}`, 404));
  }

  // تحديث الحالة إلى "غير مقروءة"
  story.isRead = false;
  await story.save();

  // ✅ تحديث المستخدم وإزالة القصة من readStories
  const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { readStories: storyId } },
      { new: true }
  );

  if (!user) {
      return next(new ApiError(`No user found for ID ${userId}`, 404));
  }

  res.status(200).json({
      message: "Story unmarked as read successfully",
      readStories: user.readStories
  });
});
