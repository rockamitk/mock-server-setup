const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const PermissionSchema = new Schema({
    apiId: Schema.ObjectId,
    ownerId: Schema.ObjectId,
    projectId: Schema.ObjectId,
    others: [Schema.Types.Mixed],//{userId:Permission._id, CRUD: “PUT,POST,GET,DELETE”}
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

/**
 * Statics
 */
PermissionSchema.statics = {
    get(id) {
        return this.findById(id)
            .then((object) => {
                if (object) {return object;}
                const err = new APIError("API permission does not exist.", httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },
    select(query, fields) {
        return this.find(query).select(fields).then(data => data);
    }
};

module.exports = mongoose.model('Permission', PermissionSchema);