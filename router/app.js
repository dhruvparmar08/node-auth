const router = require('express').Router();

const middlewares = require('../helper/middlewares');
const crypto = require('../controller/crypto');

const authentication = require("../controller/authentication");
const siteconfig = require("../controller/siteconfig");

// Authentication
router.post('/register', middlewares.routeDecryptMiddleWares, authentication.register);
router.post('/login', middlewares.routeDecryptMiddleWares, authentication.login);
router.post('/forgotpassword', middlewares.routeDecryptMiddleWares, authentication.forgotpassword);

// Site config
router.get('/siteconfig', siteconfig.getsiteconfig);
router.post('/siteconfig', middlewares.routeDecryptMiddleWares, siteconfig.addsiteconfig);

router.post('/encrypt', crypto.encrypt);
router.post('/decrypt', crypto.decrypt);

module.exports = router;