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
        //Introduce any cache scheme
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