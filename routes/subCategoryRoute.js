const express = require('express');
const { getAllsubCategories, createsubCategory, getSingleSubCategory, updatesubCategory, deletesubCategory, setCategoryIdToBody } = require('../controllers/subCategoryControler');
const { createSubCategoryValidation, getSubCategoryValidator, updateSubCategoryValidation, deleteSubCategoryValidation } = require('../validators/subCategoryValidator');

const Auth = require('../controllers/authController')


const router = express.Router({mergeParams: true});


router.route('/')
// subCategoryRoute.js
router.route('/')
  .get(getAllsubCategories)
  .post(
    Auth.protect,
    Auth.allowedTo('admin'),
    setCategoryIdToBody,
    createSubCategoryValidation,
    createsubCategory
  );

router.route('/:id')
.get(getSubCategoryValidator, getSingleSubCategory)
.put(Auth.protect,  Auth.allowedTo('admin'), updateSubCategoryValidation, updatesubCategory)
.delete(Auth.protect, Auth.allowedTo('admin'), deleteSubCategoryValidation, deletesubCategory);

module.exports = router;