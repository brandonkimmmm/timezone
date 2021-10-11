const express = require('express');
const userControllers = require('../controllers/user.controllers');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validator = require('../middleware/validator');

router.get('/user', authenticate.validateJwtToken, userControllers.get);
router.get('/user/timezones', authenticate.validateJwtToken, userControllers.getTimezones);
router.post('/user/timezone', [ authenticate.validateJwtToken, validator.postTimezone ], userControllers.postTimezone);

module.exports = router;
