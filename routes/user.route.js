const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Controllers = require('../controllers');

/**
 * Login api
 */
router.route('/add').post([
    check('email','Invalid email.').optional().isEmail(),
    check('name', 'Name has required with min 3 and max 30 chars').exists().isLength({min: 3, max: 30 })
    .matches(/^([0-9A-z\ \_\.\/\-]+)$/, 'g').withMessage("Name has invalid characters"),
    check('password', 'Passwords has required with 6-10 chars.').exists().isLength({ min: 6, max: 10 }),
    check('phoneNo', 'Phone number has required with min 10 digits.').exists().isLength({ min: 10, max:13 }),
    check('type', 'User type has required.').exists()
], Controllers.UserController.addUser);

/*
router.route('/').get([
    check('', '.').exists(),
    check('', '.').exists()
], MController.method);
*/
module.exports = router;