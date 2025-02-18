const express = require('express');
const { addRating, getAllRatings } = require('../controllers/ratingAppController');
const Auth = require('../controllers/authController'); 
const { createRatingValidator } = require('../validators/ratingValidator');

const router = express.Router();

// Protect the route to ensure only logged-in users can rate
router.use(Auth.protect);

// Route to add a new rating
router.post('/', Auth.allowedTo('user'), createRatingValidator, addRating);

// Route to get all ratings
router.get('/', Auth.allowedTo('admin'), getAllRatings);

module.exports = router;
