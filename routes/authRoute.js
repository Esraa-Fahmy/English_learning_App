const express = require('express');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const { signup, login, forgotPassword, verifyPassResetCode, resetPassword, googleLogin } = require('../controllers/authController');



const router = express.Router();


router.route('/signup').post(signupValidator, signup);
router.route('/login').post(loginValidator, login);
router.route('/forgetPassword').post(forgotPassword);
router.route('/verifyResetCode').post(verifyPassResetCode);
router.route('/resetPassword').put(resetPassword);

//router.post('/google-login', googleLogin);







module.exports = router;