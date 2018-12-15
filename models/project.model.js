/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:47:54
 * @modify date 2018-12-15 18:47:54
 * @desc [description]
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const ProjectSchema = new Schema({
    name: {type: String,required: true},
    projectIdName: {type: String, required: true, trim: true},
    ownerId: Schema.ObjectId,//ref UserModel._id
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

/**
 * Statics
 */
ProjectSchema.statics = {
    get(id) {
        return this.findById(id)
            .then((object) => {
                if (object) {return object;}
                const err = new APIError("Project does not exist.", httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },
    select(query, fields) {
        return this.find(query).select(fields).then(data => data);
    }
};

module.exports = mongoose.model('Project', ProjectSchema);