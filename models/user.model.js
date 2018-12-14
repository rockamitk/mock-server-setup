const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

const UserSchema = new Schema({
    phoneNo: {type: String,unique: true,required: true, trim: true},
    name: {type: String, required: true, trim: true},
    email: {type: String, trim: true},
    password: {type: String,required: true,trim: true},
    type: {type: String, default: "owner"},
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

/**
 * Statics
 */
UserSchema.statics = {
    get(id) {
        return this.findOne({_id: id, isActive: true})
        .then((object) => {
            if (object) {return object;}
            const err = new APIError("User does not exist.", httpStatus.NOT_FOUND);
            return Promise.reject(err);
        });
    },
    select(query, fields) {
        query.isActive = true;
        return this.find(query).select(fields).then(data => data);
    }
};

module.exports = mongoose.model('User', UserSchema);