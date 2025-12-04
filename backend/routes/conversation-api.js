const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation-controller');

router.post('/submit-answer', conversationController.submitAnswer);

router.post('/calculate-result', conversationController.calculateResult);

router.get('/scenes', conversationController.getAllScenes);

router.get('/scenes/:sceneId', conversationController.getSceneById);

module.exports = router;