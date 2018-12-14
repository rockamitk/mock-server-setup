const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Controllers = require('../controllers');

/*
router.route('/').get([
    check('', '.').exists(),
    check('', '.').exists()
], MController.method);
*/
module.exports = router;