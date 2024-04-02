const multer = require('multer');
const jwt = require('jsonwebtoken');
const cryptojs = require('./crypto');

const siteConfig = require('../modals/siteConfig');

const routeMiddleWares = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        // console.log(token);
        if (token !== 'null') {
            return jwt.verify(token, config.secret_key, async (err, userData) => {
                if (err) {
                    res.status(401).json({ success: false, message: "User is not authenticated" });
                }
                else {
                    let type = userData.user_role_id;
                    if (type == 1) {
                        await knex('Users')
                            .where({
                                id: userData.id,
                                is_active: 'Y',
                                is_delete: 'N'
                            })
                            .then((userdetails) => {
                                if (userdetails.length > 0) {
                                    req.user = userData;
                                    next();
                                }
                                else {
                                    res.status(401).json({ success: false, message: "User is not authenticated" });
                                }
                            });
                    } else if (type == 2) {
                        await knex('Users')
                            .where({
                                id: userData.id,
                                is_active: 'Y',
                                is_delete: 'N',
                                Is_artist_approve: 'Y'
                            })
                            .then((userdetails) => {
                                if (userdetails.length > 0) {
                                    req.user = userData;
                                    next();
                                }
                                else {
                                    res.status(401).json({ success: false, message: "User is not authenticated" });
                                }
                            });
                    } else {
                        await knex('Users')
                            .where({
                                id: userData.id,
                                is_active: 'Y',
                                is_delete: 'N'
                            })
                            .then(async (userdetails) => {
                                if (userdetails.length > 0) {
                                    await knex('User device')
                                        .where({ 'user_id': userData.id })
                                        .count('*')
                                        .then(async (countdata) => {
                                            let device_limit = countdata[0]['count(*)'];
                                            if (userData.device_limit >= device_limit) {
                                                await knex('User device')
                                                    .where({ user_id: userData.id, user_to_user_id: userData.user_to_user_id, is_login: 'Y' })
                                                    .then(async (userdetails) => {
                                                        if (userdetails.length > 0) {
                                                            await knex('User device')
                                                                .where({ user_id: userData.id, user_to_user_id: userData.user_to_user_id, user_device_token: token, is_login: 'Y' })
                                                                .then(async (userdetails) => {
                                                                    if (userdetails.length > 0) {
                                                                        req.user = userData;
                                                                        next();
                                                                    } else {
                                                                        res.status(401).json({ success: false, message: "User is not authenticated" });
                                                                    }
                                                                })
                                                        } else {
                                                            res.status(401).json({ success: false, message: "User is not authenticated" });
                                                        }
                                                    })
                                            } else {
                                                res.status(401).json({ success: false, message: "User is not authenticated" });
                                            }
                                        })
                                }
                                else {
                                    res.status(401).json({ success: false, message: "User is not authenticated" });
                                }
                            });
                    }
                }
            })
        } else {
            console.log("hi");
            req.user;
            next();
        }
    }
    else {
        res.status(401).json({ success: false, message: "token missing" })
    }
}

const routeDecryptMiddleWares = (req, res, next) => {
    req.body = cryptojs.decrypt(req.body.info);
    next();
}

const responseMiddleWares = async (key, status, data, code) => {
    /* console.log(key, status, data, code, type); */
    const result = await siteConfig.find({ config_key: key }, { _id: 0, config_value: 1 });

    if (result && result.length > 0) {
        let return_obj = {
            message: result[0].config_value,
            success: status,
            success_code: code,
            data: data ? cryptojs.encrypt(data) : null
        }

        return return_obj;
    } else {
        let return_obj = {
            message: "config key not get pls contact admin",
            success: status,
            success_code: code,
            data: data ? cryptojs.encrypt(data) : null
        }

        return return_obj;
    }
}

const config_details = async (key) => {
    const result = await siteConfig.find({ config_key: key }, { _id: 0, config_value: 1 });

    console.log("result ::", result);
    return result[0];
    // return await knex('Site Configuration')
    //     .select('config_value')
    //     .where({ 'config_key': key })
    //     .then(async (configDetails) => {

    //         configDetails = await configDetails[0].config_value

    //         return await configDetails;
    //     });
}

const GenerateID = (length) => {
    let id = "";
    const characters = 'AaBb0CcDd1EeFf2GgHh3IiJj4KkLl5MmNn6OoPp7QqRr8SsTt9UuVvWwXxYyZz';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return id;
}

module.exports = { routeMiddleWares, responseMiddleWares, GenerateID, routeDecryptMiddleWares, config_details }