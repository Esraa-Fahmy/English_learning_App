const { check } = require('express-validator');
const validatorMiddleware = require('../midlewares/validatorMiddleware');

exports.getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware,
];



exports.createCategoryValidation = [
  check('name')
  .notEmpty()
  .withMessage('Category Required')
  .isLength({ min : 3})
  .withMessage('very short category name')
  .isLength({max: 40})
  .withMessage(' very long category name'),
 ]


exports.updateCategoryValidation = [
  check('id').isMongoId().withMessage('Invalid category Id'),
  check('name').optional(),
  validatorMiddleware
]

exports.deleteCategoryValidation = [
  check('id').isMongoId().withMessage('Invalid category Id'),
  validatorMiddleware
]