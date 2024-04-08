const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'users', require: true },
    filename: { type: String, require: false },
    path: { type: String, require: false },
    mimetype: { type: String, require: false },
    size: { type: String, require: false },
}, { timestamps: true, versionKey: false })

const userProfile = mongoose.models.userprofiles || mongoose.model('userprofiles', UserProfileSchema);

module.exports = userProfile;