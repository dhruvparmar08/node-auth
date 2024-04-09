const mongoose = require('mongoose');
const User = require('../modals/user');
const userProfile = require('../modals/profile');

const fs = require('fs').promises;
const path = require('path');

const bcrypt = require('bcrypt');
const middlewares = require('../helper/middlewares');
const logger = require('../helper/logger');

require('dotenv').config();

module.exports.getProfile = async (req, res) => {
    try {
        logger.info("Request received on /api/getProfile");
        logger.info("Request details --->", null);

        const user_id = req.user._id;
        const profileURL = process.env.profileURL;

        const result = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $lookup: {
                    from: 'userprofiles',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'ProfileImage'
                }
            },
            {
                $addFields: {
                    profile_id: { $arrayElemAt: ['$ProfileImage._id', 0] },
                    profileUrl: {
                        $concat: [profileURL, { $arrayElemAt: [{ $split: [{ $arrayElemAt: ['$ProfileImage.path', 0] }, "uploads/"] }, 1] }]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    password: 0,
                    ProfileImage: 0
                }
            },
        ]);

        if (result.length > 0) {
            res.status(200).send(await middlewares.responseMiddleWares('get_user_profile', true, result[0], 200));
        } else {
            res.status(404).send(await middlewares.responseMiddleWares('user_not', false, null, 404));
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.updateProfile = async (req, res) => {
    try {
        const profileData = req.body;

        logger.info("Request received on /api/forgotpassword");
        logger.info("Request details --->", profileData);

        if (!profileData && !profileData.name && !profileData.mobile && !profileData.email) {
            res.status(404).send(await middlewares.responseMiddleWares('fields_required', false, null, 404));
        } else {
            const result = await User.find({ _id: req.user._id });

            if (result.length > 0) {
                const validationresult = await User.find({ _id: { $ne: req.user._id }, $or: [{ email: profileData.email }, { mobile: profileData.mobile }] });

                if (validationresult.length > 0) {
                    res.status(400).send(await middlewares.responseMiddleWares('unique_register_error', false, null, 400));
                } else {
                    const updatedresult = await User.updateOne({ _id: req.user._id }, { name: profileData.name, email: profileData.email, mobile: profileData.mobile });
                    console.log("updatedresult -->", updatedresult);
                    if (updatedresult) {
                        res.status(200).send(await middlewares.responseMiddleWares('profile_updated', true, null, 200));
                    } else {
                        res.status(400).send(await middlewares.responseMiddleWares('profile_not_updated', false, null, 400));
                    }
                }
            } else {
                res.status(400).send(await middlewares.responseMiddleWares('user_not', false, null, 400));
            }
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        const changepwdData = req.body;
        const user_id = req.user._id;
        logger.info("Request received on /api/resetpassword");
        logger.info("Request details --->", changepwdData);

        if (!changepwdData && !changepwdData.oldpassword && !changepwdData.newpassword) {
            res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
        } else {
            const result = await User.find({_id: user_id});
            console.log("result", result);
            if(result.length > 0) {
                const validOldPassword = await bcrypt.compare(changepwdData.oldpassword, result[0].password);
                const validPassword = await bcrypt.compare(changepwdData.newpassword, result[0].password);

                if(validOldPassword) {
                    if (validPassword) {
                        res.status(400).send(await middlewares.responseMiddleWares('forgotpwd_same_as', false, null, 400));
                    } else {
                        result[0].password = changepwdData.newpassword;
                        
                        await result[0].save();
    
                        res.status(200).send(await middlewares.responseMiddleWares('password_changed', true, null, 200));
                    }
                } else {
                    res.status(400).send(await middlewares.responseMiddleWares('old_pwd_not_match', false, null, 400));
                }
            } else {
                res.status(404).send(await middlewares.responseMiddleWares('user_not', false, null, 404));
            }
        }
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.uploadprofile = async (req, res) => {
    try {
        middlewares.uploadProfile(req, res, async (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_TYPES') {
                    logger.error("LIMIT_FILE_TYPES ::", err);
                    res.status(400).send(await middlewares.responseMiddleWares('LIMIT_FILE_TYPES', false, null, 400));
                } else if (err.code === 'LIMIT_FILE_SIZE') {
                    logger.error("LIMIT_FILE_SIZE ::", err);
                    res.status(400).send(await middlewares.responseMiddleWares('LIMIT_FILE_SIZE', false, null, 400));
                } else {
                    logger.error("Something went to wrong ::", err);
                    res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
                }
            } else {
                if (!req.file) {
                    res.status(400).send(await middlewares.responseMiddleWares('fields_required', false, null, 400));
                } else {
                    const user_id = req.user._id;
                    const { filename, path, mimetype, size } = req.file;

                    const getimage = await userProfile.find({user_id: req.user._id});

                    if(getimage.length > 0) {
                        await deleteFile(getimage[0].path);

                        getimage[0].filename = filename;
                        getimage[0].path = path;
                        getimage[0].mimetype = mimetype;
                        getimage[0].size = size;

                        const result = await getimage[0].save();
    
                        if (result) {
                            res.status(200).send(await middlewares.responseMiddleWares('profile_pic_uploaded', false, null, 200));
                        } else {
                            res.status(400).send(await middlewares.responseMiddleWares('profile_pic_not_uploaded', false, null, 400));
                        }
                    } else {
                        const userprofile = new userProfile({
                            user_id: user_id,
                            filename: filename,
                            path: path,
                            mimetype: mimetype,
                            size: size
                        });
    
                        const result = await userprofile.save();
    
                        if (result) {
                            res.status(200).send(await middlewares.responseMiddleWares('profile_pic_uploaded', false, null, 200));
                        } else {
                            res.status(400).send(await middlewares.responseMiddleWares('profile_pic_not_uploaded', false, null, 400));
                        }
                    }
                }
            }
        })
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

const deleteFile = async (fileURL) => {
    const filePath = path.join(__dirname, '../', fileURL);
    try {
        const stats = await fs.stat(filePath);

        if (stats.isFile()) {
            await fs.unlink(filePath);
            logger.info("File has been deleted successfully");            
        } else {
            logger.error("Error: Not a regular file");
        }
    } catch (error) {
        if(error.code == 'ENOENT') {
            logger.error("File not found");
        } else {
            logger.error("Something went to wrong on delete file ::", err);
        }
    }
}
