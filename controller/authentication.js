const User = require('../modals/user');
const userDevice = require('../modals/userdevice');
const middlewares = require('../helper/middlewares');
const mailservice = require('../helper/mailservice');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const handlebars = require('handlebars');
const { Buffer } = require('buffer');
const mongoose = require('mongoose');

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
                res.status(404).send(await middlewares.responseMiddleWares('user_not_register', false, null, 404));
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
                res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
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
            if (result.length > 0) {
                const validPassword = await bcrypt.compare(authData.password, result[0].password);

                if (validPassword) {
                    const secret_key = process.env.secret_key;
                    const token = jwt.sign({ email: result[0].email, mobile: result[0].mobile, _id: result[0]._id }, secret_key, { expiresIn: '7d' });

                    const userdeviceresult = await userDevice.find({ user_id: result[0]._id });

                    if (userdeviceresult.length > 0) {
                        await userDevice.findByIdAndUpdate({ _id: userdeviceresult[0]._id }, {
                            user_device: authData.user_device,
                            user_device_type: authData.user_device_type,
                            token: token,
                            isLogin: true
                        });
                    } else {
                        const userdevice = new userDevice({
                            user_id: result[0]._id,
                            user_device: authData.user_device,
                            user_device_type: authData.user_device_type,
                            token: token,
                            isLogin: true
                        });

                        await userdevice.save();
                    }

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
                res.status(404).send(await middlewares.responseMiddleWares('user_not', false, null, 404));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.forgotpassword = async (req, res) => {
    try {
        const forgotpwdData = req.body;

        logger.info("Request received on /api/forgotpassword");
        logger.info("Request details --->", forgotpwdData);

        if (!forgotpwdData && !forgotpwdData.email) {
            res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
        } else {
            const result = await User.find({ email: forgotpwdData.email, active: true });

            if (result.length > 0) {
                const token = await middlewares.GenerateID(100);

                const resetToken = new Buffer.from(JSON.stringify({ _id: result[0]._id, token: token, generateTime: new Date() })).toString('base64');

                let mail_host = await middlewares.config_details('mail_host');
                let mail_port = await middlewares.config_details('mail_port');
                let mail_auth_email = await middlewares.config_details('smtp_mail');
                let mail_auth_password = await middlewares.config_details('smtp_password');
                let from_mail = await middlewares.config_details('from_mail');
                let to_mail = result[0].email;

                let forgot_password_subject = await middlewares.config_details('forgot_password_subject');

                /** Header details */
                let email_template_head = await middlewares.config_details('email_template_head');
                let email_template_header_img = await middlewares.config_details('email_template_header_img');

                /** Main content */
                let email_template_resetpwd_body = await middlewares.config_details('email_template_resetpwd_body');

                /** Footer details */
                let email_template_footer = await middlewares.config_details('email_template_footer');

                /** Site-URL */
                let reset_password_url = await middlewares.config_details('reset_password_url');
                let email_template_resetpwd_lable = await middlewares.config_details('email_template_resetpwd_lable');
                let email_template_resetpwd_btn = await middlewares.config_details('email_template_resetpwd_btn');

                const passObje = {
                    name: result[0].name,
                    email_template_header_img: email_template_header_img,
                    login_link: reset_password_url + '' + resetToken,
                    text_lable_1: email_template_resetpwd_lable,
                    btn_Name: email_template_resetpwd_btn,
                    currentYear: new Date().getFullYear()
                }

                logger.info("Request details for mail --->", passObje);

                let source = email_template_head + email_template_resetpwd_body + email_template_footer;

                const template = await handlebars.compile(source)(passObje);

                const mailData = {
                    mail_host: mail_host,
                    mail_port: parseInt(mail_port),
                    mail_auth_email: mail_auth_email,
                    mail_auth_password: mail_auth_password,
                    from_mail: from_mail,
                    to_mail: to_mail,
                    subject: forgot_password_subject,
                    template: template
                }

                await mailservice.sendMail(mailData);

                const forgotpwdUser = await userDevice.find({user_id: new mongoose.Types.ObjectId(result[0]._id)});

                if(forgotpwdUser.length > 0) {
                    await userDevice.updateOne({ user_id: new mongoose.Types.ObjectId(result[0]._id) }, { $set: { resetpwdToken: token, reset_token: true } });
                } else {
                    const userdevice = new userDevice({
                        user_id: result[0]._id,
                        resetpwdToken: token, 
                        reset_token: true
                    })

                    await userdevice.save();
                }


                res.status(200).send(await middlewares.responseMiddleWares('resetpwd_link_sent', true, null, 200));
            } else {
                res.status(404).send(await middlewares.responseMiddleWares('user_not', false, null, 404));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.resetpassword = async (req, res) => {
    try {
        const forgotpwdData = req.body;

        logger.info("Request received on /api/resetpassword");
        logger.info("Request details --->", forgotpwdData);

        if (!forgotpwdData && !forgotpwdData.password && !forgotpwdData.confirmpassword && !forgotpwdData.resetpwdToken && !forgotpwdData.id) {
            res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
        } else {
            const deviceResult = await userDevice.find({ resetpwdToken: forgotpwdData.resetpwdToken, reset_token: true });

            if (deviceResult.length > 0) {
                const result = await User.find({ _id: forgotpwdData.id });

                if (result.length > 0) {
                    const validPassword = await bcrypt.compare(forgotpwdData.password, result[0].password);

                    if (validPassword) {
                        res.status(400).send(await middlewares.responseMiddleWares('forgotpwd_same_as', false, null, 400));
                    } else {
                        result[0].password = forgotpwdData.password;
                        result[0].updated_at = new Date();
                        const updatedresult = await result[0].save();

                        if (updatedresult) {
                            await userDevice.updateOne({user_id: new mongoose.Types.ObjectId(forgotpwdData.id)}, { resetpwdToken: '', reset_token: false });
                            res.status(200).send(await middlewares.responseMiddleWares('forgotpwd_updated', true, null, 200));
                        } else {
                            res.status(404).send(await middlewares.responseMiddleWares('user_not', false, null, 404));
                        }
                    }
                } else {
                    res.status(404).send(await middlewares.responseMiddleWares('user_not', false, null, 404));
                }
            } else {
                res.status(400).send(await middlewares.responseMiddleWares('resetpwd_link_expired', false, null, 400));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}