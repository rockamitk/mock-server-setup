const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const APISchema = new Schema({
    name: {type: String,required: true},
    labelName: {type: String, trim: true},
    method: String,
    version: {type: String, default: "v1"},
    staticPath: {type: String, trim: true},
    response: [Schema.Types.Mixed],
    queryParams: Schema.Types.Mixed,
    ownerId: Schema.ObjectId,//ref UserModel._id
    projectId: Schema.ObjectId,//ref ProjectModel._id
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