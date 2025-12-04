const express = require('express');
const router = express.Router();
const classificationController = require('../controllers/classification-controller');

router.get('/words', classificationController.getWords);

router.post('/verify', classificationController.verifyClassification);

router.get('/levels', classificationController.getLevels);

router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Word Classification API',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;