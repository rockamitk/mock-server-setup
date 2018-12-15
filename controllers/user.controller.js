const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');

const config = require('../config');
const APIError = require('../helpers/APIError');
const models = require('../models');
const UserModel = models.UserModel;

const addUser = (req, res, next) => {
    const errors = validationResult(req);
    //returns if invalid request body format
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let message = "Bad request occured", data={};
        if(er.email) {data.email = er.email.msg;}
        if(er.name) {data.name = er.name.msg;}
        if(er.password) {data.password = er.password.msg;}
        if(er.phoneNo) {data.phoneNo = er.phoneNo.msg;}
        if(er.type) {data.type = er.type.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message, data });
    }
    //Validate user's type
    if(!config.USER_TYPE.includes(req.body.type)){
        return res.status(httpStatus.BAD_REQUEST)
        .json({ 
            status:httpStatus.BAD_REQUEST, 
            message:"Bad reuqest occured.", 
            data: {type: "Invalid user's type,must be owner or admin. "} 
        });
    }

    let phoneNo = req.body.phoneNo;
    phoneNo = phoneNo.split(" ").join("");

    //Check whether user exists or not, for input email & phone
    let query;
    if(req.body.email){
        req.body.email = req.body.email.toLowerCase();
        query = { $or: [ { email: req.body.email }, { phoneNo: phoneNo } ] };
    }else{
        query = { phoneNo: phoneNo };
    }
    UserModel.findOne(query).then(user => {
        if(user){
            //status
            return res.status(httpStatus.CONFLICT).json({ 
                status:httpStatus.CONFLICT,
                message:"Email or Phone number has existing." 
            });
        }else{
            //Encrypt password
            let hashedPassword = bcrypt.hashSync(req.body.password, config.HASH_LEVEL);
            let user = new UserModel({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                phoneNo: phoneNo,
                type: req.body.type
            });
            user.save()
                .then(user => {
                    let obj = {};
                    obj.email = user.email;
                    obj.name = user.name;
                    obj.phoneNo = user.phoneNo;
                    obj.type = user.type;
                    return res.json({ 
                        status: httpStatus.OK, 
                        message:'User has registered', 
                        data: obj
                    });
                })
                .catch(e => {
                    const err = new APIError(e.message, e.status, true);
                    next(err);
                });        
        }
    })
    .catch(e => {
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

module.exports = {
    addUser
};