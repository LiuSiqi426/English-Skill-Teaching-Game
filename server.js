const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const staticOptions = {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (filePath.endsWith('.html')) {
            res.set('Content-Type', 'text/html');
        }
    }
};

try {
    const apiRoutes = require('./backend/routes/api');
    app.use('/api', apiRoutes);
    console.log('API routes loaded');
} catch (error) {
    console.error('Error loading API routes:', error.message);
}

app.use('/frontend/words-classification', express.static(path.join(__dirname, 'frontend/words-classification'), staticOptions));
app.use('/frontend/game2048', express.static(path.join(__dirname, 'frontend/game2048'), staticOptions));
app.use('/frontend/crossword-game', express.static(path.join(__dirname, 'frontend/crossword-game'), staticOptions));
app.use('/frontend/puzzle-game', express.static(path.join(__dirname, 'frontend/puzzle-game'), staticOptions));
app.use('/frontend/english-qa-game', express.static(path.join(__dirname, 'frontend/english-qa-game'), staticOptions));
app.use('/frontend/rhythm-word-game', express.static(path.join(__dirname, 'frontend/rhythm-word-game'), staticOptions));

app.get('/words-classification', (req, res) => {
    res.redirect('/frontend/words-classification/index.html');
});

app.get('/game2048', (req, res) => {
    res.redirect('/frontend/game2048/index.html');
});

app.get('/crossword', (req, res) => {
    res.redirect('/frontend/crossword-game/index.html');
});

app.get('/puzzle-game', (req, res) => {
    res.redirect('/frontend/puzzle-game/index.html');
});

app.get('/english-qa-game', (req, res) => {
    res.redirect('/frontend/english-qa-game/index.html');
});

app.get('/rhythm-word-game', (req, res) => {
    res.redirect('/frontend/rhythm-word-game/index.html');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*.js', (req, res, next) => {
    const filePath = path.join(__dirname, req.path);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return next(); 
        }
        
        res.set('Content-Type', 'application/javascript');
        res.sendFile(filePath);
    });
});

app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            error: 'Not Found',
            message: `API endpoint ${req.path} not found`
        });
    }
    
    res.redirect('/');
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log('ENGLISH SKILL TEACHING GAME SERVER');
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log('AVAILABLE GAMES:');
    console.log('   Word Classification    → /words-classification');
    console.log('   Word Fusion 2048       → /game2048');
    console.log('   Crossword Game         → /crossword');
    console.log('   Puzzle Game            → /puzzle-game');
    console.log('   English Conversation   → /english-qa-game');
    console.log('   Rhythm Word Game       → /rhythm-word-game');
    console.log('API ENDPOINTS:');
    console.log('   Health Check           → /api/health');
    console.log('   Test Crossword         → /api/test-crossword');
    console.log('   Test Puzzle            → /api/test-puzzle');
    console.log('\nFRONTEND FILES:');
    console.log('   Word Classification    → /frontend/words-classification/');
    console.log('   Word Fusion 2048       → /frontend/game2048/');
    console.log('   Crossword Game         → /frontend/crossword-game/');
    console.log('   Puzzle Game            → /frontend/puzzle-game/');
    console.log('   English Conversation   → /frontend/english-qa-game/');
    console.log('   Rhythm Word Game       → /frontend/rhythm-word-game/');
});