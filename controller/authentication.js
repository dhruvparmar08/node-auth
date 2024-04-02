const User = require('../modals/user');
const middlewares = require('../helper/middlewares');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const logger = require('../helper/logger');

module.exports.register = async (req, res) => {
    try {
        const data = req.body;
        logger.info("Request received on /api/register");
        logger.info("Request details --->", data);

        if (!data || !data.name || !data.mobile || !data.email || !data.password) {
            res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
        } else {
            const user = new User({
                name: data.name,
                mobile: data.mobile,
                email: data.email,
                password: data.password
            });

            const result = await user.save();

            if (result) {
                res.status(200).send(await middlewares.responseMiddleWares('user_register', true, null, 200));
            } else {
                res.status(400).send(await middlewares.responseMiddleWares('user_not_register', false, null, 400));
            }
        }
    } catch (err) {
        console.log("err --->", err);
        logger.error("Something went to wrong ::", err);

        if (err.errors) {
            if (err.errors.name) {
                res.status(400).send(await middlewares.responseMiddleWares('register_name_validation', false, null, 400));
            } else if (err.errors.mobile) {
                res.status(400).send(await middlewares.responseMiddleWares('register_mobile_validation', false, null, 400));
            } else if (err.errors.email) {
                res.status(400).send(await middlewares.responseMiddleWares('register_email_validation', false, null, 400));
            } else if (err.errors.password) {
                res.status(400).send(await middlewares.responseMiddleWares('register_password_validation', false, null, 400));
            }
        } else {
            if (err.code === 11000) {
                res.status(400).send(await middlewares.responseMiddleWares('unique_register_error', false, null, 400));
            } else {
                res.status(400).send(await middlewares.responseMiddleWares('internal_error', false, null, 400));
            }
        }
    }
}

module.exports.login = async (req, res) => {
    try {
        const authData = req.body;

        logger.info("Request received on /api/login");
        logger.info("Request details --->", authData);

        if (!authData && !authData.email && !authData.password) {
            res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
        } else {
            const result = await User.find({ email: authData.email });
            if (result) {
                const validPassword = await bcrypt.compare(authData.password, result[0].password);

                if (validPassword) {
                    const secret_key = process.env.secret_key;
                    const token = jwt.sign({ email: result[0].email, mobile: result[0].mobile }, secret_key, { expiresIn: '7d' });

                    const data = {
                        name: result[0].name,
                        email: result[0].email,
                        mobile: result[0].mobile,
                        token: token
                    }
                    res.status(200).send(await middlewares.responseMiddleWares('user_login', true, data, 200));
                } else {
                    res.status(400).send(await middlewares.responseMiddleWares('user_login_fail', false, null, 400));
                }
            } else {
                res.status(400).send(await middlewares.responseMiddleWares('user_not', false, null, 400));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(400).send(await middlewares.responseMiddleWares('internal_error', false, null, 400));
    }
}

module.exports.forgotpassword = async (req, res) => {
    try {
        const forgotpwdData = req.body;

        logger.info("Request received on /api/forgotpassword");
        logger.info("Request details --->", forgotpwdData);

        if (!forgotpwdData && !forgotpwdData.forgotpwdData && !forgotpwdData.forgotpwdData) {
            res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
        } else {
            const result = await User.find({ email: forgotpwdData.email });
            
            if(result) {
                const validPassword = await bcrypt.compare(forgotpwdData.password, result[0].password);

                if(validPassword) {
                    res.status(400).send(await middlewares.responseMiddleWares('forgotpwd_same_as', false, null, 400));    
                } else {
                    result[0].password = forgotpwdData.password;

                    const updatedresult = await result[0].save();

                    if (updatedresult) {
                        res.status(200).send(await middlewares.responseMiddleWares('forgotpwd_updated', true, null, 200));
                    } else {
                        res.status(400).send(await middlewares.responseMiddleWares('user_not', false, null, 400));
                    }
                }
            } else {
                res.status(400).send(await middlewares.responseMiddleWares('user_not', false, null, 400));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(400).send(await middlewares.responseMiddleWares('internal_error', false, null, 400));
    }
}