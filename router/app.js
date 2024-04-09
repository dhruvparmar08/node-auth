const router = require('express').Router();

const middlewares = require('../helper/middlewares');
const crypto = require('../controller/crypto');

const authentication = require("../controller/authentication");
const siteconfig = require("../controller/siteconfig");
const user = require("../controller/user");
const products = require("../controller/products");

// Authentication
router.post('/register', middlewares.routeDecryptMiddleWares, authentication.register);
router.post('/login', middlewares.routeDecryptMiddleWares, authentication.login);
router.post('/forgotpassword', middlewares.routeDecryptMiddleWares, authentication.forgotpassword);
router.post('/resetpassword', middlewares.routeDecryptMiddleWares, authentication.resetpassword);

// Site config
router.get('/siteconfig', siteconfig.getsiteconfig);
router.post('/siteconfig', middlewares.routeDecryptMiddleWares, siteconfig.addsiteconfig);

router.post('/encrypt', crypto.encrypt);
router.post('/decrypt', crypto.decrypt);

// Authorization
// Profile
router.get('/getprofile', middlewares.routeMiddleWares, user.getProfile);
router.post('/updateprofile', middlewares.routeMiddleWares, middlewares.routeDecryptMiddleWares, user.updateProfile);
router.post('/uploadprofile', middlewares.routeMiddleWares, middlewares.routeDecryptMiddleWares, user.uploadprofile);
router.post('/changepassword', middlewares.routeMiddleWares, middlewares.routeDecryptMiddleWares, user.changePassword);

// Products
router.get('/getcategory', middlewares.routeMiddleWares, products.getcategory);
router.get('/getproducts/:skip/:limit', middlewares.routeMiddleWares, products.getproducts);
router.get('/getproductdetail/:id', middlewares.routeMiddleWares, products.getproductdetail);

// logout
router.get('/logout', middlewares.routeMiddleWares, authentication.logout);

module.exports = router;