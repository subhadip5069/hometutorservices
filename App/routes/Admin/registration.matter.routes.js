const express = require('express');
const router = express.Router();

const registrationMatterController = require('../../controller/admin/registrationMatter.controller');
const { AdminauthMiddleware } = require("../../utils/auth.middleware");

// Route to fetch all registration matters (first record)
router.get('/all', AdminauthMiddleware, registrationMatterController.getAllRegistrationMatter);
router.post('/student', AdminauthMiddleware, registrationMatterController.createStudentMatter);
router.post('/tutor', AdminauthMiddleware, registrationMatterController.createTutorMatter);

module.exports = router;
