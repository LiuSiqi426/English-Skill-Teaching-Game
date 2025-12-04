class RhythmWordGame {
    constructor() {
        this.config = GameConfig;
        this.uiManager = new UIManager(this);
        this.particleManager = new ParticleManager(this);
        
        this.notes = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isGameStarted = false;
        this.gameLoopRunning = false;
        this.noteCount = 0;
        
        this.currentTarget = {};
        this.lastSpawnTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupStartScreen();
        this.uiManager.cacheLaneElements();
        this.generateNewTarget();
        
        document.addEventListener('keydown', (e) => {
            if (!this.isGameStarted && e.code !== 'Tab') {
                e.preventDefault();
                this.startGame();
                return;
            }
            this.handleKeyPress(e);
        });
    }
    
    setupStartScreen() {
        const startScreen = document.getElementById('startScreen');
        const gameContainer = document.getElementById('gameContainer');
        
        if (startScreen && gameContainer) {
            gameContainer.classList.add('hidden');
        }
        
        this.uiManager.setupStartScreen();
    }
    
    startGame() {
        if (this.isGameStarted) return;
        
        this.isGameStarted = true;
        
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
        }
        
        this.setupEventListeners();
        this.focusGame();
        this.startGameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.addEventListener('keyup', (e) => this.handleKeyRelease(e));
        document.addEventListener('click', () => this.focusGame());
        
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartGame());
        }
    }
    
    focusGame() {
        document.body.focus();
    }
    
    generateNewTarget() {
        const index = Math.floor(Math.random() * this.config.WORD_PAIRS.length);
        this.currentTarget = {
            english: this.config.WORD_PAIRS[index][0],
            emoji: this.config.WORD_PAIRS[index][1]
        };
        
        this.updateAllNotesCorrectStatus();
        
        const targetEmoji = document.getElementById('targetEmoji');
        const englishHint = document.querySelector('.english-hint');
        
        if (targetEmoji) targetEmoji.textContent = this.currentTarget.emoji;
        if (englishHint) englishHint.textContent = this.currentTarget.english;
    }
    
    updateAllNotesCorrectStatus() {
        for (const note of this.notes) {
            const newIsCorrect = (note.word === this.currentTarget.english);
            
            if (note.isCorrect !== newIsCorrect) {
                note.isCorrect = newIsCorrect;
                
                if (note.element) {
                    note.element.classList.remove('note-correct-visible');
                    note.element.classList.remove('note-incorrect-visible');
                    
                    if (note.isCorrect) {
                        note.element.classList.add('note-correct-visible');
                    } else {
                        note.element.classList.add('note-incorrect-visible');
                    }
                }
            }
        }
    }
    
    startGameLoop() {
        if (this.gameLoopRunning) return;
        
        this.gameLoopRunning = true;
        
        const gameLoop = () => {
            if (this.isGameOver || !this.isGameStarted) {
                this.gameLoopRunning = false;
                return;
            }
            
            const currentTime = Date.now();
            
            if (currentTime - this.lastSpawnTime > this.config.GAME_CONFIG.spawnInterval) {
                if (Math.random() < this.config.GAME_CONFIG.spawnChance) {
                    this.spawnNote();
                }
                this.lastSpawnTime = currentTime;
            }
            
            this.updateNotes();
            this.particleManager.updateParticles();
            this.uiManager.updateUI();
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    spawnNote() {
        const lane = Math.floor(Math.random() * this.config.LANE_CONFIG.count);
        let wordPair;
        
        if (Math.random() < this.config.GAME_CONFIG.correctWordChance) {
            wordPair = this.config.WORD_PAIRS.find(pair => pair[0] === this.currentTarget.english);
            if (!wordPair) {
                wordPair = this.config.WORD_PAIRS[Math.floor(Math.random() * this.config.WORD_PAIRS.length)];
            }
        } else {
            do {
                wordPair = this.config.WORD_PAIRS[Math.floor(Math.random() * this.config.WORD_PAIRS.length)];
            } while (wordPair[0] === this.currentTarget.english);
        }
        
        const isCorrect = wordPair[0] === this.currentTarget.english;
        
        const note = {
            id: ++this.noteCount,
            lane: lane,
            word: wordPair[0],
            emoji: wordPair[1],
            isCorrect: isCorrect,
            element: null,
            y: -50,
            isHit: false,
            speed: this.config.GAME_CONFIG.noteSpeed,
            inHitZone: false,
            createdAt: Date.now()
        };
        
        if (this.uiManager.createNoteElement(note)) {
            this.notes.push(note);
        }
    }
    
    updateNotes() {
        if (this.notes.length === 0) {
            return;
        }
        
        const hitZoneTop = this.config.GAME_CONFIG.judgmentLineY - this.config.GAME_CONFIG.hitZoneRange;
        const hitZoneBottom = this.config.GAME_CONFIG.judgmentLineY + this.config.GAME_CONFIG.hitZoneRange;
        
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            
            note.y += note.speed;
            
            if (note.element) {
                note.element.style.top = `${note.y}px`;
            }
            
            if (note.y > hitZoneTop && note.y < hitZoneBottom && !note.isHit) {
                note.inHitZone = true;
            }
            
            if (note.y > hitZoneBottom - 30 && !note.isHit && note.isCorrect) {
                this.handleMiss(note);
                this.removeNote(i);
                continue;
            }
            
            if (note.y > 350) {
                this.removeNote(i);
            }
        }
    }
    
    handleKeyPress(event) {
        if (!this.isGameStarted || this.isGameOver) {
            if (event.code === 'KeyR' && this.isGameOver) {
                this.restartGame();
            }
            return;
        }
        
        const lane = this.config.KEY_BINDINGS[event.code];
        if (lane !== undefined && !this.uiManager.keyStates[event.code]) {
            event.preventDefault();
            this.uiManager.keyStates[event.code] = true;
            
            this.uiManager.showKeyPressEffect(lane);
            this.checkNoteHit(lane);
        }
        
        if (this.isGameOver && event.code === 'KeyR') {
            this.restartGame();
        }
        
        if (event.code === 'Escape') {
            window.location.href = '../../index.html';
        }
    }
    
    handleKeyRelease(event) {
        const lane = this.config.KEY_BINDINGS[event.code];
        if (lane !== undefined) {
            this.uiManager.keyStates[event.code] = false;
        }
    }
    
    checkNoteHit(lane) {
        const judgmentY = this.config.GAME_CONFIG.judgmentLineY;
        const hitZoneTop = judgmentY - this.config.GAME_CONFIG.hitZoneRange;
        const hitZoneBottom = judgmentY + this.config.GAME_CONFIG.hitZoneRange;
        
        let hitNote = null;
        let hitIndex = -1;
        let bestMatchDistance = Infinity;
        
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            if (note.lane === lane && !note.isHit) {
                const distance = Math.abs(note.y - judgmentY);
                
                if (note.y >= hitZoneTop - 20 && note.y <= hitZoneBottom + 20) {
                    if (distance < bestMatchDistance) {
                        bestMatchDistance = distance;
                        hitNote = note;
                        hitIndex = i;
                    }
                }
            }
        }
        
        if (hitNote) {
            hitNote.isHit = true;
            const hitWasCorrect = hitNote.isCorrect;
            this.handleHit(hitNote, hitWasCorrect);
            this.removeNote(hitIndex);
            this.uiManager.showHitEffect(lane, hitNote, bestMatchDistance, hitWasCorrect);
        } else {
            this.uiManager.showMissEffect(lane);
        }
    }
    
    handleHit(note, wasCorrect) {
        if (wasCorrect) {
            this.particleManager.createHitParticles(note);
            this.score += 100 + (this.combo * 10);
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.generateNewTarget();
        } else {
            this.handleMistake();
        }
    }
    
    handleMiss(note) {
        if (note.isCorrect && !note.isHit) {
            this.lives--;
            this.combo = 0;
            this.particleManager.createMissParticles(note);
            this.checkGameOver();
        }
    }
    
    handleMistake() {
        this.lives--;
        this.combo = 0;
        this.particleManager.createMistakeParticles();
        this.checkGameOver();
    }
    
    checkGameOver() {
        if (this.lives <= 0) {
            this.isGameOver = true;
            this.gameLoopRunning = false;
            this.uiManager.showGameOver();
        }
    }
    
    removeNote(index) {
        const note = this.notes[index];
        if (note && note.element && note.element.parentNode) {
            note.element.parentNode.removeChild(note.element);
        }
        this.notes.splice(index, 1);
    }
    
    restartGame() {
        this.notes.forEach(note => {
            if (note.element && note.element.parentNode) {
                note.element.parentNode.removeChild(note.element);
            }
        });
        
        this.particleManager.clearParticles();
        
        document.querySelectorAll('[style*="animation: hitFlash"]').forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        
        document.querySelectorAll('[style*="animation: textFloat"]').forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        
        this.notes = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isGameStarted = true;
        this.gameLoopRunning = false;
        this.noteCount = 0;
        this.lastSpawnTime = Date.now();
        
        this.generateNewTarget();
        this.uiManager.hideGameOver();
        this.uiManager.updateUI();
        
        this.uiManager.keyStates = {
            "KeyA": false,
            "KeyS": false,
            "KeyD": false,
            "KeyF": false
        };
        
        this.focusGame();
        
        this.startGameLoop();
        
        console.log("Game restarted!");
    }
}

window.addEventListener('load', () => {
    try {
        window.game = new RhythmWordGame();
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && window.game.isGameStarted && !window.game.isGameOver) {
                if (confirm('Return to main menu? Current progress will be lost.')) {
                    window.location.href = '../../index.html';
                }
            }
        });
        
    } catch (error) {
        console.error("Game failed to start:", error);
        alert("Failed to start game. Please check console for errors.");
    }
});