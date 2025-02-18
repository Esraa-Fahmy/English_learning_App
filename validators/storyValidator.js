const { check } = require("express-validator");
const validatorMiddleware = require("../midlewares/validatorMiddleware");
const subCategoryModel = require("../models/subCategoryModel");
const StoryModel = require("../models/storyModel");

exports.getStoryValidator = [
  check("id").isMongoId().withMessage("Invalid story ID format"),
  validatorMiddleware,
];

exports.createStoryValidator = [
  check("title")
    .notEmpty()
    .withMessage("Story title is required")
    .isLength({ min: 3 })
    .withMessage("Story title is too short")
    .isLength({ max: 100 })
    .withMessage("Story title is too long").custom(async (title) => {
      
            const existingStory = await StoryModel.findOne({ title });
            if (existingStory) {
              throw new Error("there is a story with this title"); 
            }
            return true;
          }),

    check("imageCover")
    .optional()
    .notEmpty()
    .withMessage("Story Image cover is required"),

  check("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),

    check("subCategory")
    .notEmpty()
    .withMessage("SubCategory ID is required")
    .isMongoId()
    .withMessage("Invalid subCategory ID format")
    .custom(async (subCategoryId, { req }) => {
            const subCategory = await subCategoryModel.findById(subCategoryId);
            if (!subCategory) {
              throw new Error("SubCategory not found in the database"); 
            }
        
            if (req.body.category && req.body.category !== subCategory.category.toString()) {
              throw new Error("The provided category does not match the subCategory's category"); 
            }
        

     
      req.body.category = subCategory.category;

      return true;
    }),
];

exports.updateStoryValidator = [
  check("id").isMongoId().withMessage("Invalid story ID"),
  check('title').optional(),
  validatorMiddleware,
];

exports.deleteStoryValidator = [
  check("id").isMongoId().withMessage("Invalid story ID"),
  validatorMiddleware,
];


