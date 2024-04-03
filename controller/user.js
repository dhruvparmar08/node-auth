const mongoose = require('mongoose');
const User = require('../modals/user');
const userDevice = require('../modals/userdevice');
const middlewares = require('../helper/middlewares');
const logger = require('../helper/logger');


module.exports.getProfile = async (req, res) => {
    try {
        logger.info("Request received on /api/getProfile");
        logger.info("Request details --->", null);

        const user_id = req.user._id;
        const result = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $lookup: {
                    from: 'userdevices',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'UserDevice'
                }
            },
            {
                $project: {
                    password: 0,
                    UserDevice: {
                        _id: 0
                    }
                }
            }
        ]);

        if(result.length > 0) {
            res.status(200).send(await middlewares.responseMiddleWares('get_user_profile', true, result[0], 200));
        } else {
            res.status(405).send(await middlewares.responseMiddleWares('user_not', false, null, 405));
        }
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.updateProfile = async (req, res) => {
    try {
        const forgotpwdData = req.body;

        logger.info("Request received on /api/forgotpassword");
        logger.info("Request details --->", forgotpwdData);

        if (!forgotpwdData && !forgotpwdData.forgotpwdData && !forgotpwdData.forgotpwdData) {
            res.status(405).send(await middlewares.responseMiddleWares('fields_required', false, null, 405));
        } else {
            const result = await User.find({ email: forgotpwdData.email });

            if (result.length > 0) {
                const validPassword = await bcrypt.compare(forgotpwdData.password, result[0].password);

                if (validPassword) {
                    res.status(405).send(await middlewares.responseMiddleWares('forgotpwd_same_as', false, null, 405));
                } else {
                    result[0].password = forgotpwdData.password;

                    const updatedresult = await result[0].save();

                    if (updatedresult) {
                        res.status(200).send(await middlewares.responseMiddleWares('forgotpwd_updated', true, null, 200));
                    } else {
                        res.status(405).send(await middlewares.responseMiddleWares('user_not', false, null, 405));
                    }
                }
            } else {
                res.status(405).send(await middlewares.responseMiddleWares('user_not', false, null, 405));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}