const express = require('express');
const router = express.Router();

const classificationRoutes = require('./classification-api');

let crosswordRoutes;
try {
    crosswordRoutes = require('./crossword-api');
} catch (error) {
    console.warn('Crossword API routes not found, skipping...');
}

let puzzleRoutes;
try {
    puzzleRoutes = require('./puzzle-api');
} catch (error) {
    console.warn('Puzzle API routes not found, skipping...');
}

let conversationRoutes;
try {
    conversationRoutes = require('./conversation-api');
} catch (error) {
    console.warn('Conversation API routes not found, skipping...');
}

router.use('/classification', classificationRoutes);

if (crosswordRoutes) {
    router.use('/crossword', crosswordRoutes);
}

if (puzzleRoutes) {
    router.use('/puzzle', puzzleRoutes);
}

if (conversationRoutes) {
    router.use('/conversation', conversationRoutes);
}

router.get('/health', (req, res) => {
    const services = ['classification'];
    
    if (crosswordRoutes) {
        services.push('crossword');
    }
    
    if (puzzleRoutes) {
        services.push('puzzle');
    }
    
    if (conversationRoutes) { 
        services.push('conversation');
    }
    
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        services: services,
        message: 'API services running'
    });
});

router.get('/version', (req, res) => {
    const availableGames = ['Word Classification'];
    
    if (crosswordRoutes) {
        availableGames.push('Crossword');
    }
    
    if (puzzleRoutes) {
        availableGames.push('Puzzle');
    }
    
    if (conversationRoutes) { 
        availableGames.push('Conversation');
    }
    
    res.json({
        version: '1.0.0',
        name: 'English Skill Teaching Game API',
        description: 'API for English teaching mini-games',
        availableGames: availableGames
    });
});

router.use('/vocabulary', (req, res, next) => {
    res.json({ 
        message: 'Vocabulary Game API - Coming soon',
        status: 'under development'
    });
});

router.use('/sentence', (req, res, next) => {
    res.json({ 
        message: 'Sentence Game API - Coming soon',
        status: 'under development'
    });
});

router.use('/spelling', (req, res, next) => {
    res.json({ 
        message: 'Spelling Game API - Coming soon',
        status: 'under development'
    });
});

router.use('/grammar', (req, res, next) => {
    res.json({ 
        message: 'Grammar Game API - Coming soon',
        status: 'under development'
    });
});

router.use('/listening', (req, res, next) => {
    res.json({ 
        message: 'Listening Game API - Coming soon',
        status: 'under development'
    });
});

router.use('/general', (req, res, next) => {
    res.json({ 
        message: 'General API - Coming soon',
        status: 'under development'
    });
});

router.get('/test-crossword', (req, res) => {
    if (crosswordRoutes) {
        res.json({
            success: true,
            message: 'Crossword API is available',
            endpoints: ['/api/crossword/levels', '/api/crossword/level/:id', '/api/crossword/level/:id/verify']
        });
    } else {
        res.json({
            success: false,
            message: 'Crossword API not found',
            help: 'Make sure crossword-api.js exists in backend/routes/'
        });
    }
});

router.get('/test-puzzle', (req, res) => {
    if (puzzleRoutes) {
        res.json({
            success: true,
            message: 'Puzzle API is available',
            endpoints: ['/api/puzzle/categories', '/api/puzzle/words/:category']
        });
    } else {
        res.json({
            success: false,
            message: 'Puzzle API not found',
            help: 'Make sure puzzle-api.js exists in backend/routes/ and data files are in backend/data/puzzle/'
        });
    }
});

router.get('/test-conversation', (req, res) => {
    if (conversationRoutes) {
        res.json({
            success: true,
            message: 'Conversation API is available',
            endpoints: [
                '/api/conversation/scenes',
                '/api/conversation/scenes/:sceneId',
                '/api/conversation/submit-answer',
                '/api/conversation/calculate-result'
            ]
        });
    } else {
        res.json({
            success: false,
            message: 'Conversation API not found',
            help: 'Make sure conversation-api.js exists in backend/routes/'
        });
    }
});

router.get('/conversation-test', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        const conversationDir = path.join(__dirname, '../data/conversation');
        
        try {
            await fs.access(conversationDir);
        } catch (error) {
            return res.json({
                success: false,
                message: 'Conversation data directory not found',
                path: conversationDir,
                error: error.message
            });
        }
        
        const files = await fs.readdir(conversationDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        let sampleData = null;
        if (jsonFiles.length > 0) {
            const sampleFile = path.join(conversationDir, jsonFiles[0]);
            const data = await fs.readFile(sampleFile, 'utf8');
            const parsed = JSON.parse(data);
            sampleData = {
                scene: parsed.scene,
                title: parsed.title,
                questionCount: parsed.questions ? parsed.questions.length : 0
            };
        }
        
        res.json({
            success: true,
            message: 'Conversation data check successful',
            directory: conversationDir,
            availableScenes: jsonFiles.map(f => f.replace('.json', '')),
            sampleScene: sampleData,
            status: 'ready'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking conversation data',
            error: error.message
        });
    }
});

router.get('/', (req, res) => {
    const endpoints = {
        health: '/api/health',
        version: '/api/version',
        games: {
            classification: '/api/classification',
            crossword: crosswordRoutes ? '/api/crossword' : null,
            puzzle: puzzleRoutes ? '/api/puzzle' : null,
            conversation: conversationRoutes ? '/api/conversation' : null,
            vocabulary: '/api/vocabulary',
            sentence: '/api/sentence',
            spelling: '/api/spelling',
            grammar: '/api/grammar',
            listening: '/api/listening',
            general: '/api/general'
        },
        tests: {
            crossword: '/api/test-crossword',
            puzzle: '/api/test-puzzle',
            conversation: '/api/test-conversation',
            conversationData: '/api/conversation-test'
        }
    };
    
    res.json({
        message: 'Welcome to English Skill Teaching Game API',
        description: 'API for various English teaching mini-games',
        endpoints: endpoints,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;