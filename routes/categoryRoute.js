const express = require('express');

const { getAllCategories, createCategory, getSingleCategory, updateCategory, deleteCategory, uploadCategoryImage, resizeImage } = require('../controllers/categoryController');
const { getCategoryValidator, createCategoryValidation, updateCategoryValidation, deleteCategoryValidation } = require('../validators/categoryValidator');


const Auth = require('../controllers/authController')

const subCategoriesRoute = require('./subCategoryRoute')
const router = express.Router();

  
router.use('/:categoryId/subcategories', subCategoriesRoute)


router.route('/')
.get(getAllCategories)
.post(Auth.protect, 
    Auth.allowedTo('admin'),
    uploadCategoryImage, 
    resizeImage, 
    createCategoryValidation, 
    createCategory);
router.route('/:id')
.get(getCategoryValidator, getSingleCategory)
.put(Auth.protect, Auth.allowedTo('admin'), uploadCategoryImage, resizeImage, updateCategoryValidation, updateCategory)
.delete(Auth.protect, Auth.allowedTo('admin'), deleteCategoryValidation, deleteCategory);

module.exports = router;