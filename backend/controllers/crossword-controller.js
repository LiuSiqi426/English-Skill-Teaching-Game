const fs = require('fs');
const path = require('path');

const getLevelsData = () => {
    try {
        const filePath = path.join(__dirname, '../data/levels.json');
        
        if (!fs.existsSync(filePath)) {
            console.log('levels.json not found, creating simple sample data');
            return [
                {
                    levelId: 1,
                    theme: "Animals",
                    difficulty: 1,
                    words: [
                        {
                            id: 1,
                            direction: "Across",
                            length: 5,
                            clue: "A big cat with stripes",
                            answer: "tiger",
                            startPos: { x: 1, y: 2 }
                        },
                        {
                            id: 2,
                            direction: "Down",
                            length: 3,
                            clue: "Man's best friend",
                            answer: "dog",
                            startPos: { x: 3, y: 0 }
                        },
                        {
                            id: 3,
                            direction: "Across",
                            length: 4,
                            clue: "Likes to fly and sing",
                            answer: "bird",
                            startPos: { x: 0, y: 0 }
                        }
                    ]
                },
                {
                    levelId: 2,
                    theme: "Food",
                    difficulty: 2,
                    words: [
                        {
                            id: 1,
                            direction: "Across",
                            length: 5,
                            clue: "Red fruit",
                            answer: "apple",
                            startPos: { x: 0, y: 0 }
                        },
                        {
                            id: 2,
                            direction: "Down",
                            length: 5,
                            clue: "Yellow fruit",
                            answer: "lemon",
                            startPos: { x: 2, y: 0 }
                        }
                    ]
                }
            ];
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);
        
        if (!parsedData.levels || !Array.isArray(parsedData.levels)) {
            console.error('Invalid levels.json format');
            return [];
        }
        
        console.log(`Loaded ${parsedData.levels.length} levels from file`);
        
        // 验证每个关卡的数据
        parsedData.levels.forEach((level, index) => {
            console.log(`Level ${level.levelId}: ${level.theme}, ${level.words?.length || 0} words`);
            if (level.words) {
                level.words.forEach((word, wordIndex) => {
                    if (!word.answer) {
                        console.error(`  ERROR: Level ${level.levelId}, word ${word.id || wordIndex + 1}: answer is missing!`);
                    }
                });
            }
        });
        
        return parsedData.levels;
    } catch (error) {
        console.error('Error reading levels data:', error);
        return [];
    }
};

function calculateBoard(level) {
    console.log(`Calculating board for level ${level.levelId}: ${level.theme}`);
    
    // 验证level数据
    if (!level.words || !Array.isArray(level.words)) {
        throw new Error(`Level ${level.levelId} has no words array`);
    }
    
    const cells = new Map();
    
    level.words.forEach((word, wordIndex) => {
        const wordNum = wordIndex + 1;
        
        // 验证word数据
        if (!word.answer) {
            console.error(`Level ${level.levelId}, word ${word.id || wordNum}: answer is missing!`, word);
            throw new Error(`Level ${level.levelId}, word ${word.id || wordNum}: answer is required`);
        }
        
        if (!word.direction || (word.direction !== 'Across' && word.direction !== 'Down')) {
            console.error(`Level ${level.levelId}, word ${word.id || wordNum}: invalid direction`, word);
            throw new Error(`Level ${level.levelId}, word ${word.id || wordNum}: direction must be 'Across' or 'Down'`);
        }
        
        const { startPos, direction, length, answer, id } = word;
        const letters = answer.split('');
        
        console.log(`  Processing word ${id || wordNum}: "${answer}" (${letters.length} letters) direction: ${direction}`);
        
        // 检查answer长度是否匹配
        if (letters.length !== length) {
            console.warn(`  WARNING: Level ${level.levelId}, word ${id || wordNum}: answer length ${letters.length} doesn't match declared length ${length}`);
        }
        
        // 处理startPos
        let startX = 0;
        let startY = 0;
        
        if (startPos && typeof startPos === 'object') {
            startX = startPos.x || 0;
            startY = startPos.y || 0;
        }
        
        console.log(`    Start position: (${startX}, ${startY})`);
        
        // 处理每个字母
        for (let i = 0; i < letters.length; i++) {
            const x = direction === 'Across' ? startX + i : startX;
            const y = direction === 'Down' ? startY + i : startY;
            const cellKey = `${x},${y}`;
            
            if (!cells.has(cellKey)) {
                cells.set(cellKey, {
                    x, y,
                    letters: [],
                    wordIds: [],
                    isCross: false
                });
            }
            
            const cell = cells.get(cellKey);
            const letter = letters[i];
            
            if (!letter) {
                console.error(`    ERROR: Letter at index ${i} is undefined or empty`);
                throw new Error(`Level ${level.levelId}, word ${id || wordNum}: missing letter at position ${i}`);
            }
            
            cell.letters.push(letter.toUpperCase());
            cell.wordIds.push(id || wordNum);
            
            // 检查交叉点冲突
            if (cell.letters.length > 1) {
                const allSame = cell.letters.every(l => l === cell.letters[0]);
                if (!allSame) {
                    console.error(`    CONFLICT at (${x},${y}): ${cell.letters.join(' vs ')}`);
                    throw new Error(`Letter conflict at (${x},${y}): ${cell.letters.join(' vs ')}`);
                }
                cell.isCross = true;
            }
        }
    });
    
    if (cells.size === 0) {
        throw new Error('No cells found in level');
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cells.forEach((cell) => {
        minX = Math.min(minX, cell.x);
        minY = Math.min(minY, cell.y);
        maxX = Math.max(maxX, cell.x);
        maxY = Math.max(maxY, cell.y);
    });
    
    const board = {
        cells: Array.from(cells.values()),
        words: level.words,
        bounds: { minX, minY, maxX, maxY },
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
    
    console.log(`  Board calculated: ${board.width}x${board.height}, ${board.cells.length} cells`);
    return board;
}

exports.getLevelsList = (req, res) => {
    try {
        const levels = getLevelsData();
        const simplifiedLevels = levels.map(level => ({
            levelId: level.levelId,
            theme: level.theme,
            difficulty: level.difficulty || 1,
            wordCount: level.words ? level.words.length : 0
        }));
        
        res.json({
            success: true,
            count: simplifiedLevels.length,
            levels: simplifiedLevels
        });
    } catch (error) {
        console.error('Error getting levels list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load levels list',
            error: error.message
        });
    }
};

exports.getLevelDetail = (req, res) => {
    try {
        const levelId = parseInt(req.params.levelId);
        console.log(`=== REQUEST: Level ${levelId} details ===`);
        
        const levels = getLevelsData();
        console.log(`Total levels available: ${levels.length}`);
        
        const level = levels.find(l => l.levelId === levelId);
        
        if (!level) {
            console.log(`❌ Level ${levelId} not found in levels array`);
            return res.status(404).json({
                success: false,
                message: `Level ${levelId} not found`
            });
        }
        
        console.log(`✅ Found level ${levelId}: "${level.theme}"`);
        
        if (!level.words || !Array.isArray(level.words)) {
            console.error(`❌ Level ${levelId} has no words array`);
            throw new Error('Level has no words array');
        }
        
        console.log(`  Total words: ${level.words.length}`);
        
        // 详细打印每个单词的信息
        level.words.forEach((word, index) => {
            console.log(`  Word ${index + 1}:`, {
                id: word.id,
                answer: word.answer || 'MISSING!',
                length: word.length,
                direction: word.direction,
                startPos: word.startPos || 'missing'
            });
        });
        
        const boardData = calculateBoard(level);
        
        const levelDetail = {
            success: true,
            levelId: level.levelId,
            theme: level.theme,
            difficulty: level.difficulty || 1,
            board: boardData,
            words: level.words.map(word => ({
                id: word.id,
                direction: word.direction,
                length: word.length,
                clue: word.clue,
                startPos: word.startPos || { x: 0, y: 0 }
            }))
        };
        
        console.log(`✅ Level ${levelId} successfully loaded`);
        res.json(levelDetail);
        
    } catch (error) {
        console.error(`❌ ERROR loading level ${req.params.levelId}:`, error.message);
        console.error(error.stack);
        res.status(500).json({
            success: false,
            message: `Failed to load level ${req.params.levelId}`,
            error: error.message
        });
    }
};

exports.verifyAnswer = (req, res) => {
    try {
        const levelId = parseInt(req.params.levelId);
        const userAnswers = req.body;
        
        console.log(`Verifying answers for level ${levelId}`);
        
        if (!userAnswers || typeof userAnswers !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid answers format'
            });
        }
        
        const levels = getLevelsData();
        const level = levels.find(l => l.levelId === levelId);
        
        if (!level) {
            return res.status(404).json({
                success: false,
                message: `Level ${levelId} not found`
            });
        }
        
        const boardData = calculateBoard(level);
        const correctAnswers = {};
        
        boardData.cells.forEach(cell => {
            const cellKey = `${cell.x},${cell.y}`;
            correctAnswers[cellKey] = cell.letters[0].toUpperCase();
        });
        
        let allCorrect = true;
        const details = {};
        let correctCount = 0;
        let totalCount = Object.keys(correctAnswers).length;
        
        Object.entries(correctAnswers).forEach(([cellKey, correctChar]) => {
            const userChar = (userAnswers[cellKey] || '').toUpperCase().trim();
            const isCorrect = userChar === correctChar;
            
            details[cellKey] = {
                correct: isCorrect,
                userAnswer: userChar,
                correctAnswer: correctChar
            };
            
            if (isCorrect) {
                correctCount++;
            } else {
                allCorrect = false;
            }
        });
        
        const score = Math.round((correctCount / totalCount) * 100);
        
        res.json({
            success: true,
            correct: allCorrect,
            score: score,
            correctCount: correctCount,
            totalCount: totalCount,
            details: details,
            message: allCorrect ? 'Perfect! All answers are correct!' : `You got ${score}% correct!`
        });
        
    } catch (error) {
        console.error('Error verifying answer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify answers',
            error: error.message
        });
    }
};

// 添加修复数据的端点
exports.fixLevelsData = (req, res) => {
    try {
        const filePath = path.join(__dirname, '../data/levels.json');
        
        if (!fs.existsSync(filePath)) {
            return res.json({
                success: false,
                message: 'levels.json not found'
            });
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);
        
        let fixedCount = 0;
        
        // 修复每个单词的数据
        parsedData.levels.forEach(level => {
            if (level.words && Array.isArray(level.words)) {
                level.words.forEach(word => {
                    // 确保每个单词都有必要的字段
                    if (!word.answer && word.clue) {
                        // 尝试从clue推断答案（简化版）
                        if (word.clue.includes('fruit')) word.answer = 'apple';
                        else if (word.clue.includes('animal')) word.answer = 'dog';
                        else word.answer = 'test';
                        fixedCount++;
                    }
                    
                    if (!word.startPos) {
                        word.startPos = { x: 0, y: 0 };
                        fixedCount++;
                    }
                });
            }
        });
        
        // 保存修复后的数据
        fs.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
        
        res.json({
            success: true,
            message: `Fixed ${fixedCount} issues in levels data`,
            levels: parsedData.levels.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};