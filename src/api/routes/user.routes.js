const express = require('express');
const userControllers = require('../controllers/user.controllers');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.get('/user', authenticate.validateJwtToken, userControllers.get);
router.get('/user/timezones', authenticate.validateJwtToken, userControllers.getTimezones);

module.exports = router;
