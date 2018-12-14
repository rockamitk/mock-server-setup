const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const ProjectSchema = new Schema({
    name: {type: String,required: true},
    labelName: {type: String, trim: true},
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