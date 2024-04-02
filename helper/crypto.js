const CryptoJS = require("crypto-js");
const { Buffer } = require('buffer');

require('dotenv').config();

const secret_key = process.env.secret_key;

const encrypt = (value) => {
    if (value) {
        return CryptoJS.AES.encrypt(JSON.stringify(value), secret_key).toString();
    }
}

const decrypt = (value) => {
    if (value) {
        return JSON.parse(CryptoJS.AES.decrypt(value, secret_key).toString(CryptoJS.enc.Utf8));
    }
}

module.exports = { encrypt, decrypt };