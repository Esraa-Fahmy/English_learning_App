const asyncHandler = require('express-async-handler');
const ApiError = require("../utils/apiError");
const subCategoryModel = require('../models/subCategoryModel')
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs');



const {uploadSingleImage} = require('../midlewares/uploadImageMiddleWare')

// Upload single image
exports.uploadsubCategoryImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `subCategory-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {

  const path = "uploads/subCategories/";
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`uploads/subCategories/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});






















exports.setCategoryIdToBody = (req, res , next) => {
    if(!req.body.category) req.body.category = req.params.categoryId;
    next();
};




exports.getAllsubCategories = asyncHandler(async (req, res) => {
    const page = req.query.page * 1  || 1;
    const limit = req.query.limit * 1 || 6;
    const skip = (page - 1) * limit;

    let filterObject = {};
    if (req.params.categoryId) filterObject = { category: req.params.categoryId };

    if (req.query.search) {
        filterObject.name = { $regex: req.query.search, $options: "i" };
    }

    // ✅ حساب العدد الإجمالي للتصنيفات الفرعية بعد الفلترة
    const totalSubCategories = await subCategoryModel.countDocuments(filterObject);

    // ✅ حساب عدد الصفحات تلقائيًا
    const totalPages = Math.ceil(totalSubCategories / limit);

    const subCategories = await subCategoryModel.find(filterObject)
        .skip(skip)
        .limit(limit)
        .populate({ path: 'category', select: 'name -_id' });

    res.status(200).json({
        results: subCategories.length,
        totalSubCategories,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        data: subCategories
    });
});




// subCategoryControler.js
exports.createsubCategory = asyncHandler(async (req, res) => {
    const subCategory = await subCategoryModel.create(req.body);
    res.status(201).json({ data: subCategory });
  });



exports.getSingleSubCategory = asyncHandler(async (req, res, next) => {
    const { id } =req.params;
    const subCategory = await subCategoryModel.findById(id).populate({path: 'category', select:'name -_id'});

    if(!subCategory) {
       return next(new ApiError(`No subCategory for this id ${id}`, 404));
    }
    res.status(200).json({ data: subCategory })
});



exports.updatesubCategory = asyncHandler( async (req, res, next) => {
const { id } = req.params;

const subCategory = await subCategoryModel.findByIdAndUpdate(
    {_id: id},
       req.body,
    { new: true}
);

if (!subCategory){
    return next(new ApiError(`No subCategory for this id ${id}`, 404));
}
res.status(200).json({ data: subCategory })});




exports.deletesubCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const subCategory = await subCategoryModel.findByIdAndDelete(id);


if (!subCategory){
    return next(new ApiError(`No subCategory for this id ${id}`, 404));
}
res.status(200).json({ message : 'subCategory deleted successfully' })});
