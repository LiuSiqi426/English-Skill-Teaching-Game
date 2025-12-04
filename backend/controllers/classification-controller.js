const fs = require('fs');
const path = require('path');

module.exports = {
    getWords: (req, res) => {
        try {
            console.log('=== DEBUG INFO ===');
            console.log('Current directory:', __dirname);
            
            const possiblePaths = [
                path.join(__dirname, '../data/words.json'),
                path.join(__dirname, 'data/words.json'),
                path.join(__dirname, '../backend/data/words.json'),
                path.join(__dirname, '../../data/words.json'),
                path.join(process.cwd(), 'backend/data/words.json'),
                path.join(process.cwd(), 'data/words.json')
            ];
            
            let wordsDataPath = null;
            let fileFound = false;
            
            for (const possiblePath of possiblePaths) {
                console.log(`Checking path: ${possiblePath}`);
                if (fs.existsSync(possiblePath)) {
                    wordsDataPath = possiblePath;
                    fileFound = true;
                    console.log(`Found words.json at: ${wordsDataPath}`);
                    break;
                }
            }
            
            if (!fileFound) {
                console.error('words.json not found in any path');
                return res.status(500).json({ 
                    error: 'Words data file not found',
                    searchedPaths: possiblePaths
                });
            }
            
            console.log('Loading words from:', wordsDataPath);
            
            const data = fs.readFileSync(wordsDataPath, 'utf8');
            const wordsData = JSON.parse(data);
            
            console.log(`Loaded ${wordsData.words.length} words and ${wordsData.categories.length} categories`);
            
            res.json({
                categories: wordsData.categories,
                words: wordsData.words,
                totalWords: wordsData.words.length
            });
        } catch (error) {
            console.error('Error loading words data:', error);
            res.status(500).json({ 
                error: 'Failed to load words data',
                message: error.message,
                stack: error.stack
            });
        }
    },

    verifyClassification: (req, res) => {
        try {
            const { word, category } = req.body;
            
            const possiblePaths = [
                path.join(__dirname, '../data/words.json'),
                path.join(__dirname, 'data/words.json'),
                path.join(__dirname, '../backend/data/words.json'),
                path.join(process.cwd(), 'backend/data/words.json')
            ];
            
            let wordsDataPath = null;
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    wordsDataPath = possiblePath;
                    break;
                }
            }
            
            if (!wordsDataPath) {
                return res.status(500).json({ error: 'Words data file not found' });
            }
            
            const data = fs.readFileSync(wordsDataPath, 'utf8');
            const wordsData = JSON.parse(data);
            const wordData = wordsData.words.find(w => w.word === word);
            
            if (!wordData) {
                return res.status(404).json({ error: 'Word not found' });
            }
            
            const isCorrect = wordData.category === category;
            
            res.json({
                word,
                selectedCategory: category,
                correctCategory: wordData.category,
                isCorrect
            });
        } catch (error) {
            console.error('Error in verification:', error);
            res.status(500).json({ error: 'Failed to verify classification' });
        }
    },

    getLevels: (req, res) => {
        try {
            const levels = {
                maxLevels: 5,
                configs: {
                    1: { 
                        wordCount: 4, 
                        description: "Level 1 - Easy Words"
                    },
                    2: { 
                        wordCount: 5, 
                        description: "Level 2 - Easy-Medium Words"
                    },
                    3: { 
                        wordCount: 6, 
                        description: "Level 3 - Medium Words"
                    },
                    4: { 
                        wordCount: 7, 
                        description: "Level 4 - Medium-Hard Words"
                    },
                    5: { 
                        wordCount: 8, 
                        description: "Level 5 - Hard Words"
                    }
                }
            };
            res.json(levels);
        } catch (error) {
            console.error('Error getting levels:', error);
            res.status(500).json({ error: 'Failed to load level config' });
        }
    },

    getWordDetails: (req, res) => {
        try {
            const { word } = req.params;
            
            const possiblePaths = [
                path.join(__dirname, '../data/words.json'),
                path.join(__dirname, 'data/words.json'),
                path.join(__dirname, '../backend/data/words.json'),
                path.join(process.cwd(), 'backend/data/words.json')
            ];
            
            let wordsDataPath = null;
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    wordsDataPath = possiblePath;
                    break;
                }
            }
            
            if (!wordsDataPath) {
                return res.status(500).json({ error: 'Words data file not found' });
            }
            
            const data = fs.readFileSync(wordsDataPath, 'utf8');
            const wordsData = JSON.parse(data);
            const wordData = wordsData.words.find(w => w.word === word);
            
            if (!wordData) {
                return res.status(404).json({ error: 'Word not found' });
            }
            
            res.json({
                word: wordData.word,
                category: wordData.category
            });
        } catch (error) {
            console.error('Error getting word details:', error);
            res.status(500).json({ error: 'Failed to get word details' });
        }
    },

    getCategoriesStats: (req, res) => {
        try {
            const possiblePaths = [
                path.join(__dirname, '../data/words.json'),
                path.join(__dirname, 'data/words.json'),
                path.join(__dirname, '../backend/data/words.json'),
                path.join(process.cwd(), 'backend/data/words.json')
            ];
            
            let wordsDataPath = null;
            for (const possiblePath of possiblePaths) {
                if (fs.existsSync(possiblePath)) {
                    wordsDataPath = possiblePath;
                    break;
                }
            }
            
            if (!wordsDataPath) {
                return res.status(500).json({ error: 'Words data file not found' });
            }
            
            const data = fs.readFileSync(wordsDataPath, 'utf8');
            const wordsData = JSON.parse(data);
            
            res.json({
                categories: wordsData.categories,
                totalWords: wordsData.words.length,
                totalCategories: wordsData.categories.length
            });
        } catch (error) {
            console.error('Error getting categories stats:', error);
            res.status(500).json({ error: 'Failed to get categories statistics' });
        }
    }
};