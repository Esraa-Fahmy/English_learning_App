const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const StoryModel = require("../models/storyModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { uploadMixOfImages } = require('../midlewares/uploadImageMiddleWare');
const fs = require('fs');

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
                    .resize(2000, 1333)
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

 
    const lastStory = await StoryModel.findOne({ subCategory })
        .sort({ createdAt: -1 }); 

    const order = lastStory ? lastStory.order + 1 : 1; 

    const story = await StoryModel.create({ ...req.body, order });

    res.status(201).json({ data: story });
});



exports.getAllStories = asyncHandler(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 6;
    const skip = (page - 1) * limit;

    
    const searchQuery = req.query.search
        ? { title: { $regex: req.query.search, $options: "i" } }
        : {};

        const sortOption = req.query.sort === 'oldest' ? "createdAt" : "-createdAt";


    const stories = await StoryModel.find(searchQuery)
        .sort(sortOption)
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




//حذف قصة
exports.deleteStory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const story = await StoryModel.findByIdAndDelete(id);
    if (!story) return next(new ApiError(`No story found for ID ${id}`, 404));
    res.status(200).json({message: 'story deleted successfully'});
});



/*exports.getNextStory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const story = await StoryModel.findById(id);

    if (!story) {
        return next(new ApiError(`No story found for ID ${id}`, 404));
    }

  
    let nextStory = await StoryModel.findOne({ 
        subCategory: story.subCategory, 
        createdAt: { $gt: story.createdAt } // القصة اللي تم إنشاؤها بعد القصة الحالية
    }).sort({ createdAt: 1 }); // تصاعديًا، بحيث يجيب أول قصة بعدها مباشرة

    //لو مفيش قصة بعدها، يرجع لأول قصة في نفس التصنيف الفرعي
    if (!nextStory) {
        nextStory = await StoryModel.findOne({ 
            subCategory: story.subCategory 
        }).sort({ createdAt: 1 }); 
    }

    res.status(200).json({ next: nextStory });
});





exports.getPreviousStory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const story = await StoryModel.findById(id);

    if (!story) {
        return next(new ApiError(`No story found for ID ${id}`, 404));
    }

 
    let prevStory = await StoryModel.findOne({ 
        subCategory: story.subCategory, 
        createdAt: { $lt: story.createdAt } // القصة اللي تم إنشاؤها قبل القصة الحالية
    }).sort({ createdAt: -1 }); // تنازليًا، بحيث يجيب آخر قصة قبلها مباشرة

    //  لو مفيش قصة قبلها، يرجع لآخر قصة 
    if (!prevStory) {
        prevStory = await StoryModel.findOne({ 
            subCategory: story.subCategory 
        }).sort({ createdAt: -1 });
    }

    res.status(200).json({ previous: prevStory });
});*/

exports.markStoryAsRead = asyncHandler(async (req, res, next) => {
    const { storyId } = req.params;
    const userId = req.user._id;
  
   
    const story = await StoryModel.findByIdAndUpdate(
      storyId,
      { isRead: true },
      { new: true }

    );
  
    if (!story) {
      return next(new ApiError(`No story found for ID ${storyId}`, 404));
    }
  
    // إضافة القصة في مصفوفة readStories عند المستخدم
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
  
 
    const story = await StoryModel.findByIdAndUpdate(
      storyId,
      { isRead: false },
      { new: true }
    );
  
    if (!story) {
      return next(new ApiError(`No story found for ID ${storyId}`, 404));
    }
  
 
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
  