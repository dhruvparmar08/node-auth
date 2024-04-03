const siteConfig = require('../modals/siteConfig');
const middlewares = require('../helper/middlewares');

const logger = require('../helper/logger');

module.exports.addsiteconfig = async (req, res) => {
    try {
        const data = req.body;

        logger.info("Request received on /api/addsiteconfig");
        
        if (!data || !data.config_key || !data.config_value) {
            res.status(405).send(await middlewares.responseMiddleWares('fields_required', false, null, 405));
        } else {
            const siteconfig = new siteConfig({
                config_key: data.config_key,
                config_value: data.config_value
            });

            const result = await siteconfig.save();

            if (result) {
                res.status(200).send(await middlewares.responseMiddleWares('add_siteConfig', true, null, 200));
            } else {
                res.status(405).send(await middlewares.responseMiddleWares('add_not_siteConfig', false, null, 405));
            }
        }
    } catch (err) {
        console.log("err", err);
        logger.error("Something went to wrong ::", err);
        if (err.code === 11000) {
            res.status(405).send(await middlewares.responseMiddleWares('unique_error', false, null, 405));
        } else {
            res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
        }
    }
}

module.exports.getsiteconfig = async (req, res) => {
    try {
        const result = await siteConfig.find({});

        logger.info("Request received on /api/getsiteconfig");

        if (result.length > 0) {
            res.status(200).send(await middlewares.responseMiddleWares('get_data', true, result, 200));
        } else {
            res.status(200).send(await middlewares.responseMiddleWares('data_not_exits', false, null, 200));
        }
    } catch (err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}
