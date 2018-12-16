/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:49:08
 * @modify date 2018-12-16 20:18:33
 * @desc [description]
*/

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Controllers = require('../controllers');
const UserModel = require('../models').UserModel;
const jwt = require('jsonwebtoken');

/**
 * Middleware to validate active users 
 */
router.use('*', (req, res, next) => {
    if(req.headers.authorization){
        let decrypt = jwt.decode(req.headers.authorization.split(' ')[1]);
        //Can replace by any cache scheme
        UserModel.get(decrypt._id).then(user => {
            if(user){
                /**
                 * assign user to global res.locals obj
                 * accesible from any controller, routes
                 */
                res.locals.user = {
                    _id: user._id,
                    type: user.type
                }
                next();
            }else{
                return res.status(httpStatus.FORBIDDEN).json({ status:httpStatus.FORBIDDEN, 
                    message:"Unauthorized access. " 
                });
            }
        });
    }else{
        return res.status(httpStatus.FORBIDDEN).json({ status:httpStatus.FORBIDDEN, 
            message:"Unauthorized access. " 
        });
    }
});

/**
 * Create project by login -ed users
 * @param project name
 * URL: `/api/v1/settings/project/create`
 */
router.route('/project/create').post([
    check('name', 'Project name has required.').exists()
    .matches(/^([0-9A-z\ \_\-]+)$/, 'g').withMessage("Project name has invalid characters")
], Controllers.SettingsController.createProject);

/**
 * Create mock services CRUD
 * URL: `/api/v1/settings/mock/create`
 *  "projectIdName": "biodata",
    "mocks": [
    	{
    		"servicePath": "/get_number",
    		"method": "GET",
    		"input": null,
    		"output": {
    			"phoneNo": 989930920
    		}
        }
    ]
 */
router.route('/mock/create').post([
    check('projectIdName', 'Project id name has required.').exists()
    .matches(/^([0-9A-z\ \_\-]+)$/, 'g').withMessage("Project name has invalid characters"),
    check('mocks', 'Set of API details has required.').exists().isArray()
], Controllers.SettingsController.createMockServices);

/**
 * Returns list of mock services
 * Filter by login ed user & access
 * @param projectIdName : optional
 * @param user._id : Auto include from login token(res.local.user._id)
 * API: /api/v1/settings/mock/list?projectIdName=`projectIdName`
 */
router.route('/mock/list').get([
    check('projectIdName', 'Project id name has required.').optional()
    .matches(/^([0-9A-z\ \_\-]+)$/, 'g').withMessage("Project id name has invalid characters")
], Controllers.SettingsController.getMockeServiceList);

/**
 * Allow api access permissions to others
 * Can be triggered by only admin user's credentials
 * At least one recipient user._id has required
 * Avaialabel mathod will be POST, PUT, GET, DELETE
 * API: /api/v1/settings/mock/permission
 */
router.route('/mock/permission').put([
    check('projectIdName', 'Project id name has required.').exists(),
    check('users', 'List of recipient user\'s id has required.').exists().isArray(),
    check('methods', 'Allowed method has required.').exists().isArray()
], Controllers.SettingsController.permitOtherUsersAccess);

//print available API on terminal
require('../helpers/api.stack')('/api/v1/settings', router.stack, "Setting router");

module.exports = router;