const express = require('express');
const router = express.Router();
const crosswordController = require('../controllers/crossword-controller');

router.get('/levels', crosswordController.getLevelsList);

router.get('/level/:levelId', crosswordController.getLevelDetail);

router.post('/level/:levelId/verify', crosswordController.verifyAnswer);

router.get('/test', (req, res) => {
    res.json({
        message: 'Crossword API is working',
        endpoints: {
            'GET /levels': 'Get all levels list',
            'GET /level/:id': 'Get level details',
            'POST /level/:id/verify': 'Verify answers'
        }
    });
});

module.exports = router;