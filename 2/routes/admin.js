var express = require('express');
var router = express.Router();
var adminController = require('../controllers/admin');
var utility = require('../lib/utility');
var acl = require('../authorization').getAcl();

// protected URLs
router.get('/users', acl.middleware(2, utility.getUserId), adminController.list.get);
router.get('/users/upgrade', acl.middleware(2, utility.getUserId), adminController.upgrade.get);

module.exports = router;
