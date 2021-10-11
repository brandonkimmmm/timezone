const express = require('express');
const publicControllers = require('../controllers/public.controllers');
const router = express.Router();
const validator = require('../middleware/validator');

router.get('/info', publicControllers.getInfo);
router.post('/signup', validator.signup, publicControllers.signup);
router.post('/login', validator.login, publicControllers.login);

module.exports = router;
