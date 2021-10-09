const express = require('express');
const publicControllers = require('../controllers/publiccontrollers');
const router = express.Router();

router.get('/info', publicControllers.getInfo);

module.exports = router;
