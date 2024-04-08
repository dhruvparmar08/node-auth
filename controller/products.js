const axios = require('axios');
const middlewares = require('../helper/middlewares');
const logger = require('../helper/logger');

require('dotenv').config();

const dummyapiURL = process.env.dummyapiURL;

module.exports.getcategory = async (req, res) => {
    try {
        logger.info("Request received on /api/getcategory");
        logger.info("Request details --->", null);

        const apiURL = `${dummyapiURL}/products/categories`;
        const response = await axios.get(apiURL);
        const data = await response.data;

        res.status(200).send(await middlewares.responseMiddleWares('products_data', true, {categories : data}, 200));
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.getproducts = async (req, res) => {
    try {
        const {limit, skip} = req.params;

        const searchquery = req.query.searchquery || '';

        logger.info("Request received on /api/getproducts");
        logger.info("Request details --->", req.params);
        logger.info("Request details --->", req.query);

        const apiURL = `${dummyapiURL}/products/search?q=${searchquery}&skip=${skip}&limit=${limit}`;
        console.log("apiURL -->", apiURL);

        const response = await axios.get(apiURL);
        const data = await response.data;

        res.status(200).send(await middlewares.responseMiddleWares('products_data', true, {products: data['products']}, 200));
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}

module.exports.getproductdetail = async (req, res) => {
    try {
        const product_id = req.params.id;

        logger.info("Request received on /api/getproductdetail");
        logger.info("Request details --->", req.params);

        const apiURL = `${dummyapiURL}/products/${product_id}`;
        console.log("apiURL -->", apiURL);

        const response = await axios.get(apiURL);
        const data = await response.data;

        res.status(200).send(await middlewares.responseMiddleWares('products_data', true, {product: data}, 200));
    } catch(err) {
        logger.error("Something went to wrong ::", err);
        res.status(500).send(await middlewares.responseMiddleWares('internal_error', false, null, 500));
    }
}