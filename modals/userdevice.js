const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserDeviceSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'users', require: true },
    user_device: { type: String, require: false },
    user_device_type: { type: String, require: false },
    token: { type: String },
    isLogin: { type: Boolean, default: false }
}, { timestamps: true })

const userDevice = mongoose.models.userdevices || mongoose.model('userdevices', UserDeviceSchema);

module.exports = userDevice;