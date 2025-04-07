const express = require('express');
const router = express.Router();

const StepController = require('../../controller/admin/instruction.controlller');
const { AdminauthMiddleware } = require('../../utils/auth.middleware');


router.get('/', AdminauthMiddleware, StepController.getSteps);

router.post('/update', AdminauthMiddleware, StepController.updateSteps);

module.exports = router;