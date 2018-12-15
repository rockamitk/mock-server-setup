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


router.route('/:userId/:projectIdName/:servicePath*?').get([
    check('userId', 'userId has required.').exists(),
    check('projectName', 'projectName has required.').exists(),
    check('servicePath', 'servicePath has required.').exists()
], (req, res, next)=>{
    console.log("Hello");
    return res.json({status: 200, data:""});
});

router.route('/:userId/:projectIdName/:servicePath*?').post([
    check('phoneNo', 'Register phone no. has required.').exists(),
    check('projectName', 'projectName has required.').exists(),
    check('servicePath', 'servicePath has required.').exists()
], (req, res, next)=>{
    console.log("POST ");
    return res.json({status: 200, data:"POST"});
});

router.route('/:userId/:projectIdName/:servicePath*?').put([
    check('phoneNo', 'Register phone no. has required.').exists(),
    check('projectName', 'projectName has required.').exists(),
    check('servicePath', 'servicePath has required.').exists()
], (req, res, next)=>{
    console.log("PUT");
    return res.json({status: 200, data:"PUT"});
});

router.route('/:userId/:projectIdName/:servicePath*?').delete([
    check('phoneNo', 'Register phone no. has required.').exists(),
    check('projectName', 'projectName has required.').exists(),
    check('servicePath', 'servicePath has required.').exists()
], (req, res, next)=>{
    console.log("DELETE");
    return res.json({status: 200, data:"DELETE"});
});

module.exports = router;