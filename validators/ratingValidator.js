const { check } = require('express-validator');
const validatorMiddleware = require('../midlewares/validatorMiddleware');

exports.createRatingValidator = [
  // Rating field validation
  check('rating')
    .notEmpty()
    .withMessage('Rating value is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating value must be between 1 and 5'),

  // Comment field validation
  check('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 5 })
    .withMessage('Comment must be at least 5 characters long'),

  validatorMiddleware, 
];
