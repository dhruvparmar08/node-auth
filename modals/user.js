const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validate = require('mongoose-validator');
const logger = require('../helper/logger');

require('dotenv').config();

const saltRounds = process.env.saltRounds;
const Schema = mongoose.Schema;

const emailValidator = [
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/,
        message: 'Email must be at least 3 characters, max 40, no special characters or numbers, must have space in between name.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 100],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

const passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{6,50}$/,
        message: 'Password needs to have at least one lower case, one uppercase, one number, one special character, and must be at least 6 characters but no more than 50.'
    }),
    validate({
        validator: 'isLength',
        arguments: [6, 50],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

const mobileValidator = [
    validate({
        validator: 'matches',
        arguments: /^((\+)?(\d{2}[-]))?(\d{10}){1}?$/,
        message: 'Mobile number must be 10 digits.'
    }),
    validate({
        validator: 'isLength',
        arguments: [10, 15],
        message: 'Mobile number should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

const UserSchema = new Schema({
    name : { type: String, required: true, minlength:3},
    mobile : { type: String, required: true, validate: mobileValidator, unique: true},
    email : { type: String, required: true, validate: emailValidator, unique: true},
    pincode : { type: String, required: false, minlength:6, maxlength: 6},
    password : { type: String, required: true, validate: passwordValidator}, // select: false
    active: { type: Boolean, default: true },
}, { timestamps: true});


UserSchema.pre('save', async function(next) {
    const user = this;

    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSaltSync(parseInt(saltRounds));
        const hash = await bcrypt.hashSync(user.password, salt);
        user.password = hash;
        next();
      } catch (error) {
        console.log("error ::: ----->", error);
        logger.error("Something went to wrong ::", error);
        return next(error);
      }
});

const User = mongoose.models.users || mongoose.model('users', UserSchema);

module.exports = User;