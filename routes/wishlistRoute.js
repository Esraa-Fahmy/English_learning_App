const express = require('express');

const Auth = require('../controllers/authController');
const { addStoryToWishlist, removeStoryFromWishlist, getLoggedUserWishlist } = require('../controllers/wishlistController');



const router = express.Router();

router.use(Auth.protect, Auth.allowedTo('user'));

router.route('/').post(addStoryToWishlist).get(getLoggedUserWishlist);
router.delete('/:storyId', removeStoryFromWishlist);


module.exports = router;