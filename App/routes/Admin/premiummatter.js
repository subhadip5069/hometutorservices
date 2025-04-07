const express = require('express');
const router = express.Router();
const premiumMatterController = require('../../controller/admin/premiumMatter.controller');
const { AdminauthMiddleware } = require("../../utils/auth.middleware");


router.get('/all', AdminauthMiddleware, premiumMatterController.getAllPremiumMatter);
router.post('/create', AdminauthMiddleware, premiumMatterController.createPremiumMatter);

module.exports = router;
