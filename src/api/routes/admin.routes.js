const express = require('express');
const adminControllers = require('../controllers/admin.controllers');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validator = require('../middleware/validator');

router.get('/admin/user/timezones', [ authenticate.validateJwtToken, validator.adminGetTimezones ], adminControllers.getTimezones);
router.post('/admin/user/timezone', [ authenticate.validateJwtToken, validator.adminPostTimezone ], adminControllers.postTimezone);
router.put('/admin/user/timezone', [ authenticate.validateJwtToken, validator.adminPutTimezone ], adminControllers.putTimezone);
router.delete('/admin/user/timezone', [ authenticate.validateJwtToken, validator.adminDeleteTimezone ], adminControllers.deleteTimezone);
router.put('/admin/user/role', [ authenticate.validateJwtToken, validator.adminPutUserRole ], adminControllers.putUserRole);
router.get('/admin/user', [ authenticate.validateJwtToken, validator.adminGetUser ], adminControllers.getUser);
router.delete('/admin/user', [ authenticate.validateJwtToken, validator.adminDeleteUser ], adminControllers.deleteUser);

module.exports = router;
