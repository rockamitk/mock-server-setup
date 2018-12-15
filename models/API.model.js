const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const APISchema = new Schema({
    methodName: {type: String, required: true, trim: true},
    path: {type: String, required: true, trim: true},
    servicePath: {type: String, required: true, trim: true},
    input: {type: String, trim: true},
    output: {type: String, trim: true},
    ownerId: Schema.ObjectId,//ref UserModel._id
    projectId: Schema.ObjectId,//ref ProjectModel._id
    accessUsers:[Schema.Types.ObjectId],//ref Other UserModel._id
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

/**
 * Statics
 */
APISchema.statics = {
    get(id) {
        return this.findById(id)
            .then((object) => {
                if (object) {return object;}
                const err = new APIError("API does not exist.", httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },
    select(query, fields) {
        return this.find(query).select(fields).then(data => data);
    }
};

module.exports = mongoose.model('API', APISchema);