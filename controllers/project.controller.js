const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');
const mongoose = require('mongoose');
const APIError = require('../helpers/APIError');
const models = require('../models');
const ProjectModel = models.ProjectModel;

const addProject = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.name) {data.name = er.name.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    } 
    let project = new ProjectModel({
        name: req.body.name
    });
    
    project.labelName =  req.body.name;
    project.labelName = project.labelName.split(" ").join("").toLowerCase();
    project.ownerId = mongoose.Types.ObjectId(req.body.ownerId);//res.locals.user._id; => get user object from token
    
    project.save().then(project => {
        return res.status(httpStatus.OK).json({
            name: project.name,
            name: project.labelName,
            ownerId: project.ownerId
        });
    })
    .catch(e => {
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

module.exports = {
    addProject
};