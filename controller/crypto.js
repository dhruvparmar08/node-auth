const crypto = require('../helper/crypto');
const middlewares = require('../helper/middlewares');

const logger = require('../helper/logger');

module.exports.encrypt = async (req, res) => {
    try {
        const data = req.body;
        if(data) {
            const encryptData = crypto.encrypt(data);

            logger.info("Request received on /api/encrypt");

            let response = {
                message: "Encrypted data!",
                success: true,
                success_code: 200,
                data: encryptData
            }
    
            res.status(200).send(response);
        } else {
            let response = {
                message: "Encrypted data not found",
                success: false,
                data: null,
                success_code: 405
            }
    
            res.status(405).send(response);
        }
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.decrypt = async (req, res) => {
    try {
        const data = req.body.info;
        
        logger.info("Request received on /api/decrypt");

        if(data) {
            const decryptData = crypto.decrypt(data);
            let response = {
                message: "Decrypted data!",
                success: true,
                success_code: 200,
                data: decryptData
            }
    
            res.status(200).send(response);
        } else {
            let response = {
                message: "Dencrypted data not found",
                success: false,
                data: null,
                success_code: 405
            }
    
            res.status(405).send(response);
        }
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}