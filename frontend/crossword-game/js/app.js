const API_BASE_URL = '/api/crossword';
let currentLevelId = 1;
let currentLevelData = null;
let currentActiveWord = null;
let currentWordDirection = null;
let currentCellIndex = 0;
let levelHistory = [];
let completedLevels = new Set();

const elements = {
    board: document.getElementById('board'),
    acrossClues: document.getElementById('across-clues'),
    downClues: document.getElementById('down-clues'),
    verifyBtn: document.getElementById('verify-btn'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    prevLevelBtn: document.getElementById('prev-level-btn'),
    backToDirectoryBtn: document.getElementById('back-to-directory-btn'),
    currentLevel: document.getElementById('current-level'),
    levelTheme: document.getElementById('level-theme'),
    levelDifficulty: document.getElementById('level-difficulty'),
    successModal: document.getElementById('success-modal'),
    successLevel: document.getElementById('success-level'),
    successScore: document.getElementById('success-score'),
    modalNextBtn: document.getElementById('modal-next-btn')
};

async function init() {
    console.log('🎮 Initializing Crossword Game...');
    console.log('Current URL:', window.location.href);
    console.log('API Base URL:', API_BASE_URL);
    await loadLevel(currentLevelId);
    bindEvents();
}

async function loadLevel(levelId) {
    try {
        console.log(`📥 Attempting to load level ${levelId}...`);
        elements.levelTheme.textContent = 'Loading...';
        
        const apiUrl = `${API_BASE_URL}/level/${levelId}`;
        console.log(`Fetching from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Level ${levelId} not found (404)`);
                showAllLevelsComplete();
                return;
            }
            
            if (response.status === 500) {
                const errorText = await response.text();
                console.error(`Server error (500): ${errorText}`);
                throw new Error(`Server error: ${errorText.substring(0, 100)}`);
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (!result.success) {
            console.error('API returned failure:', result);
            throw new Error(result.message || 'Unknown error loading level');
        }
        
        console.log(`✅ Successfully loaded level ${levelId}: ${result.theme}`);
        currentLevelData = result;
        currentLevelId = levelId;
        
        updateUI();
        resetGameState();
        
    } catch (error) {
        console.error('❌ Error loading level:', error);
        console.error('Error stack:', error.stack);
        
        elements.levelTheme.textContent = 'Error loading level';
        elements.levelDifficulty.textContent = '?';
        
        setTimeout(() => {
            if (error.message.includes('404') || error.message.includes('not found')) {
                showAllLevelsComplete();
            } else if (error.message.includes('500')) {
                alert(`Server error loading level ${levelId}.\n\nPlease check the server logs.\nError: ${error.message}`);
            } else {
                alert(`Failed to load level ${levelId}:\n\n${error.message}\n\nPlease make sure the server is running.`);
            }
        }, 500);
    }
}

function showAllLevelsComplete() {
    console.log('🎉 Showing "all levels complete" modal');
    
    elements.successModal.style.display = 'none';
    
    const completeModal = document.createElement('div');
    completeModal.className = 'modal';
    completeModal.style.display = 'flex';
    completeModal.innerHTML = `
        <div class="modal-content">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You have completed all available levels!</p>
            <p>More levels coming soon...</p>
            <button id="return-home-btn" class="pixel-button" style="margin-top: 20px;">🏠 Return to Home</button>
        </div>
    `;
    
    document.body.appendChild(completeModal);
    
    document.getElementById('return-home-btn').addEventListener('click', () => {
        console.log('Returning to home directory');
        window.location.href = '/';
    });
}

function updateUI() {
    if (!currentLevelData) {
        console.error('No currentLevelData available for updateUI');
        return;
    }
    
    console.log('Updating UI for level', currentLevelId);
    
    elements.currentLevel.textContent = currentLevelId;
    elements.levelTheme.textContent = currentLevelData.theme;
    elements.levelDifficulty.textContent = currentLevelData.difficulty;
    
    renderBoard();
    renderClues();
    
    elements.successModal.style.display = 'none';
    elements.nextLevelBtn.disabled = !completedLevels.has(currentLevelId);
    elements.prevLevelBtn.style.display = currentLevelId > 1 ? 'inline-block' : 'none';
    
    console.log(`Next Level Button disabled: ${elements.nextLevelBtn.disabled}`);
    console.log(`Completed levels:`, Array.from(completedLevels));
    
    setTimeout(() => {
        const firstCell = document.querySelector('.cell:not([disabled])');
        if (firstCell) {
            firstCell.focus();
            console.log('Focused first cell');
        }
    }, 100);
}

function renderBoard() {
    const { board, words } = currentLevelData;
    
    console.log(`Rendering board: ${board.width}x${board.height}`);
    console.log(`Board cells:`, board.cells.length);
    console.log(`Words:`, words.length);
    
    elements.board.innerHTML = '';
    
    const offsetX = -board.bounds.minX;
    const offsetY = -board.bounds.minY;
    
    elements.board.style.gridTemplateRows = `repeat(${board.height}, 40px)`;
    elements.board.style.gridTemplateColumns = `repeat(${board.width}, 40px)`;
    
    for (let y = board.bounds.minY; y <= board.bounds.maxY; y++) {
        for (let x = board.bounds.minX; x <= board.bounds.maxX; x++) {
            const cellKey = `${x},${y}`;
            const cellData = board.cells.find(cell => cell.x === x && cell.y === y);
            
            const cellContainer = document.createElement('div');
            cellContainer.className = 'cell-container';
            
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.className = 'cell';
            
            if (cellData) {
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.dataset.cellKey = cellKey;
                cell.dataset.wordIds = cellData.wordIds.join(',');
                cell.dataset.isCross = cellData.isCross;
                
                const startWordIds = [];
                words.forEach(word => {
                    if (word.startPos.x === x && word.startPos.y === y) {
                        startWordIds.push(word.id);
                    }
                });
                
                if (startWordIds.length > 0) {
                    cell.dataset.startWordIds = startWordIds.join(',');
                    
                    const numberLabel = document.createElement('div');
                    numberLabel.className = 'word-number';
                    numberLabel.textContent = startWordIds.join('/');
                    cellContainer.appendChild(numberLabel);
                }
            } else {
                cell.disabled = true;
                cell.style.visibility = 'hidden';
            }
            
            const gridRow = y + offsetY + 1;
            const gridCol = x + offsetX + 1;
            cellContainer.style.gridRow = gridRow;
            cellContainer.style.gridColumn = gridCol;
            
            cellContainer.appendChild(cell);
            elements.board.appendChild(cellContainer);
        }
    }
    
    console.log(`Board rendered with ${elements.board.children.length} cells`);
}

function renderClues() {
    const { words } = currentLevelData;
    
    console.log(`Rendering clues for ${words.length} words`);
    
    elements.acrossClues.innerHTML = '';
    elements.downClues.innerHTML = '';
    
    const acrossWords = words.filter(word => word.direction === 'Across');
    const downWords = words.filter(word => word.direction === 'Down');
    
    acrossWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = `Across ${word.id}. ${word.clue}`;
        li.dataset.wordId = word.id;
        li.dataset.direction = word.direction;
        
        li.addEventListener('click', () => {
            console.log(`Clicked clue for word ${word.id}`);
            highlightWordCells(word.id);
            activateWordInput(word.id, word.direction);
        });
        
        elements.acrossClues.appendChild(li);
    });
    
    downWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = `Down ${word.id}. ${word.clue}`;
        li.dataset.wordId = word.id;
        li.dataset.direction = word.direction;
        
        li.addEventListener('click', () => {
            console.log(`Clicked clue for word ${word.id}`);
            highlightWordCells(word.id);
            activateWordInput(word.id, word.direction);
        });
        
        elements.downClues.appendChild(li);
    });
}

function highlightWordCells(wordId) {
    console.log(`Highlighting cells for word ${wordId}`);
    
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('highlighted'));
    document.querySelectorAll('.clues-section li').forEach(li => li.classList.remove('active'));
    
    let highlightedCount = 0;
    document.querySelectorAll('.cell').forEach(cell => {
        const wordIds = cell.dataset.wordIds;
        if (wordIds && wordIds.split(',').includes(wordId.toString())) {
            cell.classList.add('highlighted');
            highlightedCount++;
        }
    });
    
    console.log(`Highlighted ${highlightedCount} cells`);
    
    const clueItem = document.querySelector(`.clues-section li[data-word-id="${wordId}"]`);
    if (clueItem) {
        clueItem.classList.add('active');
    }
}

function activateWordInput(wordId, direction) {
    console.log(`Activating word ${wordId} (${direction})`);
    
    const { words } = currentLevelData;
    const word = words.find(w => w.id === wordId);
    
    if (!word) {
        console.error(`Word ${wordId} not found`);
        return;
    }
    
    currentActiveWord = wordId;
    currentWordDirection = direction;
    currentCellIndex = 0;
    
    console.log(`Current active word set to: ${currentActiveWord}, direction: ${currentWordDirection}`);
    
    const wordCells = [];
    for (let i = 0; i < word.length; i++) {
        const x = direction === 'Across' ? word.startPos.x + i : word.startPos.x;
        const y = direction === 'Down' ? word.startPos.y + i : word.startPos.y;
        const cellKey = `${x},${y}`;
        const cell = document.querySelector(`[data-cell-key="${cellKey}"]`);
        if (cell) {
            wordCells.push(cell);
        }
    }
    
    if (wordCells.length > 0) {
        wordCells[0].focus();
        wordCells.forEach((cell, index) => {
            cell.dataset.wordIndex = index;
        });
        console.log(`Activated ${wordCells.length} cells for word ${wordId}`);
    }
}

function collectUserAnswers() {
    const userAnswers = {};
    let filledCells = 0;
    
    document.querySelectorAll('.cell:not([disabled])').forEach(cell => {
        const cellKey = cell.dataset.cellKey;
        const value = cell.value.trim().toUpperCase();
        if (value && cellKey) {
            userAnswers[cellKey] = value;
            filledCells++;
        }
    });
    
    console.log(`Collected ${filledCells} filled cells out of ${document.querySelectorAll('.cell:not([disabled])').length}`);
    return userAnswers;
}

async function verifyAnswer() {
    try {
        console.log('Verifying answer for level', currentLevelId);
        
        const userAnswers = collectUserAnswers();
        
        if (Object.keys(userAnswers).length === 0) {
            alert('Please fill in some answers first!');
            return;
        }
        
        console.log('Sending verification request with answers:', userAnswers);
        
        elements.verifyBtn.disabled = true;
        elements.verifyBtn.textContent = 'Checking...';
        
        const response = await fetch(`${API_BASE_URL}/level/${currentLevelId}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userAnswers)
        });
        
        console.log(`Verification response status: ${response.status}`);
        
        const result = await response.json();
        console.log('Verification result:', result);
        
        elements.verifyBtn.disabled = false;
        elements.verifyBtn.textContent = '✓ Verify Answer';
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('correct', 'incorrect');
        });
        
        if (!result.success) {
            console.error('Verification failed:', result.message);
            alert(result.message || 'Verification failed');
            return;
        }
        
        if (result.details) {
            Object.entries(result.details).forEach(([cellKey, detail]) => {
                const cell = document.querySelector(`[data-cell-key="${cellKey}"]`);
                if (cell) {
                    cell.classList.add(detail.correct ? 'correct' : 'incorrect');
                }
            });
        }
        
        if (result.correct) {
            console.log(`✅ Level ${currentLevelId} completed successfully!`);
            completedLevels.add(currentLevelId);
            elements.successLevel.textContent = currentLevelId;
            elements.successScore.textContent = result.score || '100';
            elements.successModal.style.display = 'flex';
            elements.nextLevelBtn.disabled = false;
            
            console.log(`Added level ${currentLevelId} to completed levels`);
            console.log('Completed levels:', Array.from(completedLevels));
            
            playSuccessSound();
        } else {
            alert(`${result.message}\n\nScore: ${result.score}%\nCorrect: ${result.correctCount}/${result.totalCount}`);
        }
        
    } catch (error) {
        console.error('Error verifying answer:', error);
        elements.verifyBtn.disabled = false;
        elements.verifyBtn.textContent = '✓ Verify Answer';
        alert('Failed to verify answer. Please check your connection and try again.');
    }
}

function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
        console.log('Audio not available');
    }
}

function handleCellInput(event) {
    const cell = event.target;
    const value = cell.value.toUpperCase();
    const cellKey = cell.dataset.cellKey;
    
    console.log(`Input in cell ${cellKey}: "${value}"`);
    
    if (value && /^[A-Z]$/.test(value)) {
        cell.value = value;
        
        setTimeout(() => {
            if (currentActiveWord && currentWordDirection) {
                const nextCell = findNextCellInCurrentWord();
                if (nextCell && nextCell !== cell) {
                    console.log(`Moving to next cell: ${nextCell.dataset.cellKey}`);
                    nextCell.focus();
                } else {
                    console.log('No next cell found or already at last cell');
                }
            }
        }, 10);
    } else if (value) {
        cell.value = '';
    }
}

function findNextCellInCurrentWord() {
    if (!currentActiveWord || !currentWordDirection) {
        console.log('No active word or direction');
        return null;
    }
    
    const word = currentLevelData.words.find(w => w.id === currentActiveWord);
    if (!word) {
        console.log(`Word ${currentActiveWord} not found`);
        return null;
    }
    
    const nextIndex = currentCellIndex + 1;
    console.log(`Current index: ${currentCellIndex}, Next index: ${nextIndex}, Word length: ${word.length}`);
    
    if (nextIndex >= word.length) {
        console.log('Already at last cell of word');
        return null;
    }
    
    const x = currentWordDirection === 'Across' ? word.startPos.x + nextIndex : word.startPos.x;
    const y = currentWordDirection === 'Down' ? word.startPos.y + nextIndex : word.startPos.y;
    const cellKey = `${x},${y}`;
    
    console.log(`Looking for next cell at (${x},${y}) - key: ${cellKey}`);
    
    return document.querySelector(`[data-cell-key="${cellKey}"]`);
}

function handleCellKeyDown(event) {
    const cell = event.target;
    const cellKey = cell.dataset.cellKey;
    
    console.log(`Key down in cell ${cellKey}: "${event.key}"`);
    
    if (event.key === 'Backspace' && !cell.value) {
        event.preventDefault();
        
        setTimeout(() => {
            if (currentActiveWord && currentWordDirection) {
                const prevCell = findPreviousCellInCurrentWord();
                if (prevCell && prevCell !== cell) {
                    console.log(`Moving to previous cell: ${prevCell.dataset.cellKey}`);
                    prevCell.focus();
                    prevCell.select();
                }
            }
        }, 10);
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        navigateWithArrows(event.key);
    }
}

function findPreviousCellInCurrentWord() {
    if (!currentActiveWord || !currentWordDirection) return null;
    
    const word = currentLevelData.words.find(w => w.id === currentActiveWord);
    if (!word) return null;
    
    const prevIndex = currentCellIndex - 1;
    if (prevIndex < 0) return null;
    
    const x = currentWordDirection === 'Across' ? word.startPos.x + prevIndex : word.startPos.x;
    const y = currentWordDirection === 'Down' ? word.startPos.y + prevIndex : word.startPos.y;
    const cellKey = `${x},${y}`;
    
    return document.querySelector(`[data-cell-key="${cellKey}"]`);
}

function navigateWithArrows(key) {
    const cell = document.activeElement;
    if (!cell.classList.contains('cell')) return;
    
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    
    console.log(`Navigating from cell (${x},${y}) with ${key}`);
    
    let targetX = x, targetY = y;
    
    switch (key) {
        case 'ArrowRight': targetX++; break;
        case 'ArrowLeft': targetX--; break;
        case 'ArrowDown': targetY++; break;
        case 'ArrowUp': targetY--; break;
    }
    
    const targetCell = document.querySelector(`[data-x="${targetX}"][data-y="${targetY}"]`);
    if (targetCell && !targetCell.disabled) {
        console.log(`Moving to cell (${targetX},${targetY})`);
        targetCell.focus();
        
        const wordIds = targetCell.dataset.wordIds;
        if (wordIds) {
            const firstWordId = wordIds.split(',')[0];
            const word = currentLevelData.words.find(w => w.id == firstWordId);
            if (word) {
                currentActiveWord = word.id;
                currentWordDirection = word.direction;
                
                if (word.direction === 'Across') {
                    currentCellIndex = targetX - word.startPos.x;
                } else {
                    currentCellIndex = targetY - word.startPos.y;
                }
                
                console.log(`Updated active word to ${currentActiveWord}, index ${currentCellIndex}`);
            }
        }
    }
}

function bindEvents() {
    console.log('Binding events...');
    
    elements.verifyBtn.addEventListener('click', verifyAnswer);
    
    elements.nextLevelBtn.addEventListener('click', () => {
        console.log(`Next Level button clicked. Current level: ${currentLevelId}`);
        console.log(`Completed levels includes ${currentLevelId}: ${completedLevels.has(currentLevelId)}`);
        
        if (!completedLevels.has(currentLevelId)) {
            alert('Please complete the current level first!');
            return;
        }
        
        console.log(`Loading next level: ${currentLevelId + 1}`);
        loadLevel(currentLevelId + 1);
    });
    
    elements.prevLevelBtn.addEventListener('click', () => {
        console.log('Previous Level button clicked');
        
        if (levelHistory.length > 0) {
            const prevLevel = levelHistory.pop();
            console.log(`Loading previous level from history: ${prevLevel}`);
            loadLevel(prevLevel);
        } else if (currentLevelId > 1) {
            console.log(`Loading level ${currentLevelId - 1}`);
            loadLevel(currentLevelId - 1);
        }
    });
    
    elements.modalNextBtn.addEventListener('click', () => {
        console.log('Modal Next button clicked');
        elements.successModal.style.display = 'none';
        loadLevel(currentLevelId + 1);
    });
    
    elements.backToDirectoryBtn.addEventListener('click', backToDirectory);
    
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('cell')) {
            const cell = event.target;
            const wordIds = cell.dataset.wordIds;
            
            console.log(`Cell clicked: ${cell.dataset.cellKey}, wordIds: ${wordIds}`);
            
            if (wordIds) {
                const firstWordId = wordIds.split(',')[0];
                const word = currentLevelData.words.find(w => w.id == firstWordId);
                if (word) {
                    console.log(`Found word ${word.id} for clicked cell`);
                    highlightWordCells(word.id);
                    
                    let index = 0;
                    if (word.direction === 'Across') {
                        index = parseInt(cell.dataset.x) - word.startPos.x;
                    } else {
                        index = parseInt(cell.dataset.y) - word.startPos.y;
                    }
                    
                    currentActiveWord = word.id;
                    currentWordDirection = word.direction;
                    currentCellIndex = index;
                    
                    console.log(`Set active word to ${currentActiveWord}, index ${currentCellIndex}`);
                }
            }
        }
    });
    
    document.addEventListener('input', (event) => {
        if (event.target.classList.contains('cell')) {
            handleCellInput(event);
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.target.classList.contains('cell')) {
            handleCellKeyDown(event);
        }
        
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            console.log('Ctrl+Enter pressed, verifying answer');
            verifyAnswer();
        }
    });
}

function resetGameState() {
    console.log('Resetting game state');
    currentActiveWord = null;
    currentWordDirection = null;
    currentCellIndex = 0;
}

function backToDirectory() {
    console.log('Returning to directory');
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', init);

window.debugGameState = function() {
    console.log('=== DEBUG GAME STATE ===');
    console.log('Current Level ID:', currentLevelId);
    console.log('Current Level Data:', currentLevelData);
    console.log('Current Active Word:', currentActiveWord);
    console.log('Current Word Direction:', currentWordDirection);
    console.log('Current Cell Index:', currentCellIndex);
    console.log('Level History:', levelHistory);
    console.log('Completed Levels:', Array.from(completedLevels));
    console.log('Next Level Button disabled:', elements.nextLevelBtn.disabled);
    console.log('=== END DEBUG ===');
};

console.log('Crossword game script loaded');