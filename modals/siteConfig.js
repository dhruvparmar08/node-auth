const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const siteConfigSchema = new Schema({
    config_key: { type: String, require: true, unique: true },
    config_value: { type: String, require: true }
}, { timestamps: true, versionKey: false})

const siteConfig = mongoose.models.siteconfigs || mongoose.model('siteconfigs', siteConfigSchema);

module.exports = siteConfig;