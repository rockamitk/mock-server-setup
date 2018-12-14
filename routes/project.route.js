const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Controllers = require('../controllers');

router.route('/create').post([
    check('name', 'Project name has required.').exists()
    .matches(/^([0-9A-z\ \_\-]+)$/, 'g').withMessage("Project name has invalid characters")
], Controllers.ProjectController.addProject);

/*
router.route('/').get([
    check('', '.').exists(),
    check('', '.').exists()
], MController.method);
*/

module.exports = router;