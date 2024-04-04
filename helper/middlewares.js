const multer = require('multer');
const jwt = require('jsonwebtoken');
const cryptojs = require('./crypto');
const logger = require('./logger');
const siteConfig = require('../modals/siteConfig');
const User = require('../modals/user');
const userDevice = require('../modals/userdevice');

const routeMiddleWares = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if(bearerHeader && (bearerHeader.includes('Bearer') || bearerHeader.includes('bearer'))) {
        const token = bearerHeader.split(' ')[1];

        if(token) {
            const secret_key = process.env.secret_key;

            try {
                const userresult = await userDevice.find({token: token, isLogin: true});
                if(userresult.length > 0) {
                    try {
                        const userData = await jwt.verify(token, secret_key);

                        const result = await User.find({_id: userData._id, active: true});

                        if(result.length > 0) {
                            req.user = userData;
                            next();
                        } else {
                            await userDevice.findByIdAndUpdate({_id: userresult[0]._id}, {token: '', isLogin: false});
                            res.status(401).send(await responseMiddleWares('unauthorization', false, null, 401));                            
                        }
                    } catch(err) {
                        await userDevice.findByIdAndUpdate({_id: userresult[0]._id}, {token: '', isLogin: false});
                        logger.error("Something went to wrong ::", err);
                        res.status(401).send(await responseMiddleWares('unauthorization', false, null, 401));
                    }
                } else {
                    res.status(401).send(await responseMiddleWares('unauthorization', false, null, 401));
                }
            } catch(err) {
                logger.error("Something went to wrong ::", err);
                res.status(401).send(await responseMiddleWares('unauthorization', false, null, 401));
            }
        } else {
            res.status(401).send(await responseMiddleWares('unauthorization', false, null, 401));
        }
    } else {
        res.status(401).send(await responseMiddleWares('unauthorization', false, null, 401));
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
    return result[0].config_value;
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