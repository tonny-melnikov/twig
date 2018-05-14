const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const utility = require('../lib/utility');
const authentication = require('../authentication');
const acl = require('../authorization').getAcl();

router.get('/register', userController.register.get);
router.post('/register', utility.regValidation, userController.register.post);
router.get('/login', userController.login.get);
router.post('/login', utility.loginValidation, userController.login.post);
// router.get('/verify/:verificationToken', userController.verify.get);
// router.get('/verify-resend/:email?', userController.verifyResend.get);
// router.post('/verify-resend', userController.verifyResend.post);
// router.get('/forgot-password', userController.forgotPassword.get);
// router.post('/forgot-password', userController.forgotPassword.post);
// router.get('/reset-password/:passwordResetToken', userController.resetPassword.get);
// router.post('/reset-password/:passwordResetToken', userController.resetPassword.post);
//
// // protected URLs
router.get('/change-password', authentication.isAuthenticated, userController.changePassword.get);
router.post('/change-password', authentication.isAuthenticated, utility.changePasswordValidation, userController.changePassword.post);
router.get('/logout', authentication.isAuthenticated, userController.logout.get);
router.get('/dashboard', acl.middleware(2, utility.getUserId), userController.dashboard.get);

module.exports = router;
