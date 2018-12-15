const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');
const APIError = require('../helpers/APIError');
const models = require('../models');
const ProjectModel = models.ProjectModel;
const APIModel = models.APIModel;
const config = require('../config');

const isValidPath = (str)=> {
    //write regex
    return true;
}

/** Create project having valid user */
const createProject = (req, res, next) => {
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
    
    project.projectIdName =  req.body.name;
    project.projectIdName = project.projectIdName.split(" ").join("").toLowerCase();
    project.ownerId = res.locals.user._id;// extract user(owner of project) object from token
    
    project.save().then(project => {
        return res.status(httpStatus.OK).json({
            name: project.name,
            name: project.projectIdName,
            ownerId: project.ownerId
        });
    })
    .catch(e => {
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

/**
 * Create mock services(APIs)
 * These dummy apis can be integrate with front end app. 
 */
const createMockServices = (req, res, next) => {
    //Using Package Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.projectIdName) {data.projectIdName = er.projectIdName.msg;}
        if(er.mocks) {data.mocks = er.mocks.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    }

    let projectIdName = req.body.projectIdName.split(" ").join("").toLowerCase();

    /**
     * Manual validation Validation
     * servicePath: {userId}/{projectId}/[validate remaining paths along with query params]
     * method:["GET","PUT","POST","DELETE"]
     * output: The response on success api call.
     * input: Will be optional in case of GET, DELETE
     */
    let errorsResp = [];
    for(let i in req.body.mocks){
        let mock = req.body.mocks[i];
        let error = {};

        if(!(mock.method && config.CRUD.includes(mock.method.toUpperCase()))){
           error.method = "Method is not valid";
        }
        if(!(mock.servicePath && isValidPath(mock.servicePath))){
            error.servicePath = "API path is not valid";
        }
        if(!mock.output){
            error.output = "output response has required";
        }
        if(Object.keys(error).length)
        errorsResp.push(error);
    }

    if(errorsResp.length){
        return res.status(httpStatus.BAD_REQUEST)
        .json({ status: httpStatus.BAD_REQUEST, 
            message:"Bad Request occured.", 
            data : errorsResp 
        });
    }
    console.log("projectIdName & mocks array has valid data.");
    /** Sequential Query from various collections using promise chain */
    ProjectModel.findOne({projectIdName: projectIdName, isActive:true})
    .then(project =>{
        let path;//buildAPIpath => multiple times has used
        if(!project){
            //return to client
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message:"Bad Request occured.", data });
            //Early break promise chain
            throw new Error("Project does not is exists.");
        }
        //Check newAPIs exists or not
        let pathsWithMethod = [];
        req.body.mocks.forEach(mock => {
            mock.servicePath = mock.servicePath.trim();
            //Check servicespath has forward slash
            if(mock.servicePath[0] !== "/"){
                mock.servicePath = `/${mock.servicePath}`;
            }
            path = `/mock/${res.locals.user._id.toString()}/${project.projectIdName}${mock.servicePath}`; 
            pathsWithMethod.push({path, methodName: mock.method.toUpperCase()});
        });
        let query = {isActive:true};
        query["$or"] = pathsWithMethod;
        return APIModel.find(query).then(apis => [apis, project]);
    })
    .then(([apis, project]) =>{
        if(apis.length){
            apis = apis.map(api => {
                return {servicePath: api.servicePath, path: api.path, method: api.methodName};
            });
            //Throw conflict Error
            res.status(httpStatus.CONFLICT).json({ status: httpStatus.CONFLICT, 
                message: "APIs path already exists.", 
                data: apis
            });
            //Early break promise chain
            throw new Error("APIs path already exists.");
        }
        /**Every service has validated, now can be insert */

        let docArray = [], input, output;
        req.body.mocks.forEach(mock => {
            path = `/mock/${res.locals.user._id.toString()}/${project.projectIdName}${mock.servicePath}`; 

            input = mock.input ? mock.input : null;
            if(input && (typeof input === "object" || Array.isArray(input))){
                input = JSON.stringify(input);
            }            

            //doc.output is string
            //Stringify object or array of obj
            //In case of html or text file must be convert to string utf-8 on client side
            output= mock.output ? mock.output : null;
            if(output && (typeof output === "object" || Array.isArray(output))){
                output = JSON.stringify(output);
            }

            docArray.push({
                methodName: mock.method.toUpperCase(),
                path,
                servicePath: `${mock.servicePath}`,
                input,//either null, string, or utf string
                output,//either JSON.stringify(obj or arrObj) or utf-8(html or text)
                ownerId: res.locals.user._id,
                projectId: project._id,
                accessUsers: [],//later update by admin to allow others,
                isActive: true//Flag used to represent active/delete doc
            });           
        });
        return APIModel.insertMany(docArray).then(apis => apis);
    })
    .then(apis =>{
        console.log(apis.length + " mock services has created successfully." );
        //Everything has executed successfully, now response full url paths
        apis = apis.map(api => {
            return {path: api.path, method: api.methodName, servicePath: api.servicePath};
        });
        return res.status(httpStatus.OK).json({ status: httpStatus.OK, 
            message: "APIs path already exists.", 
            data: apis
        });
        /* -----------------DONE --------------------*/
    })
    .catch(e =>{
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

module.exports = {
    createProject, createMockServices
};