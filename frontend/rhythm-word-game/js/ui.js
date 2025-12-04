class UIManager {
    constructor(game) {
        this.game = game;
        this.keyStates = {
            "KeyA": false,
            "KeyS": false,
            "KeyD": false,
            "KeyF": false
        };
    }
    
    setupStartScreen() {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => this.game.startGame());
        }
        
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => window.location.href = '../../index.html');
        }
        
        const menuButton = document.getElementById('menuButton');
        if (menuButton) {
            menuButton.addEventListener('click', () => window.location.href = '../../index.html');
        }
    }
    
    cacheLaneElements() {
        this.laneElements = [];
        for (let i = 0; i < this.game.config.LANE_CONFIG.count; i++) {
            const laneElement = document.getElementById(`lane${i}`);
            if (laneElement) {
                this.laneElements[i] = laneElement;
                laneElement.style.overflow = 'visible';
                laneElement.style.position = 'relative';
            }
        }
    }
    
    createNoteElement(note) {
        try {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            
            if (note.isCorrect) {
                noteElement.classList.add('note-correct-visible');
            } else {
                noteElement.classList.add('note-incorrect-visible');
            }
            
            noteElement.textContent = note.word;
            noteElement.id = `note-${note.id}`;
            
            Object.assign(noteElement.style, {
                position: 'absolute',
                width: '100px',
                height: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                top: `${note.y}px`,
                zIndex: '20'
            });
            
            if (this.laneElements[note.lane]) {
                this.laneElements[note.lane].appendChild(noteElement);
                note.element = noteElement;
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    showKeyPressEffect(lane) {
        const keyLabel = document.querySelector(`.lane[data-lane="${lane}"] .key-label`);
        const laneElement = document.querySelector(`.lane[data-lane="${lane}"]`);
        
        if (keyLabel && laneElement) {
            keyLabel.style.transform = 'scale(1.3)';
            keyLabel.style.color = '#ffeb3b';
            keyLabel.style.textShadow = '0 0 10px gold';
            laneElement.style.boxShadow = '0 0 20px gold';
            
            setTimeout(() => {
                keyLabel.style.transform = 'scale(1)';
                keyLabel.style.color = 'white';
                keyLabel.style.textShadow = 'none';
                laneElement.style.boxShadow = 'none';
            }, 150);
        }
    }
    
    showHitEffect(lane, note, distance, wasCorrect) {
        const laneCenterX = this.getLaneCenterX(lane);
        const judgmentY = this.game.config.GAME_CONFIG.judgmentLineY;
        
        let judgmentText = 'GOOD';
        let judgmentColor = this.game.config.JUDGMENT_COLORS.good;
        
        if (distance <= this.game.config.GAME_CONFIG.perfectRange) {
            judgmentText = 'PERFECT';
            judgmentColor = this.game.config.JUDGMENT_COLORS.perfect;
        } else if (distance <= this.game.config.GAME_CONFIG.goodRange) {
            judgmentText = 'GOOD';
            judgmentColor = this.game.config.JUDGMENT_COLORS.good;
        } else {
            judgmentText = 'OK';
            judgmentColor = this.game.config.JUDGMENT_COLORS.ok;
        }
        
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            left: ${laneCenterX - 80}px;
            top: ${judgmentY - 40}px;
            width: 160px;
            height: 80px;
            background: ${wasCorrect ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'};
            border: 4px solid ${wasCorrect ? '#00ff00' : '#ff0000'};
            border-radius: 4px;
            z-index: 100;
            animation: hitFlash 0.8s ease-out;
            box-shadow: 0 0 30px ${wasCorrect ? '#00ff00' : '#ff0000'};
        `;
        
        document.getElementById('gameContainer').appendChild(effect);
        
        const hitText = document.createElement('div');
        hitText.textContent = wasCorrect ? judgmentText : 'WRONG';
        hitText.style.cssText = `
            position: absolute;
            left: ${laneCenterX}px;
            top: ${judgmentY - 60}px;
            transform: translateX(-50%);
            color: ${wasCorrect ? judgmentColor : '#ff0000'};
            font-size: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 0 #000;
            z-index: 101;
            animation: textFloat 1.2s ease-out;
            font-family: 'Press Start 2P', cursive;
        `;
        
        document.getElementById('gameContainer').appendChild(hitText);
        
        if (wasCorrect) {
            const scoreText = document.createElement('div');
            const scorePoints = 100 + (this.game.combo * 10);
            scoreText.textContent = `+${scorePoints}`;
            scoreText.style.cssText = `
                position: absolute;
                left: ${laneCenterX + 100}px;
                top: ${judgmentY - 40}px;
                transform: translateX(-50%);
                color: #ffff00;
                font-size: 14px;
                font-weight: bold;
                text-shadow: 1px 1px 0 #000;
                z-index: 101;
                animation: textFloat 1s ease-out;
                font-family: 'Press Start 2P', cursive;
            `;
            
            document.getElementById('gameContainer').appendChild(scoreText);
            
            setTimeout(() => {
                if (scoreText.parentNode) {
                    scoreText.parentNode.removeChild(scoreText);
                }
            }, 1000);
        }
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
            if (hitText.parentNode) {
                hitText.parentNode.removeChild(hitText);
            }
        }, 1200);
    }
    
    showMissEffect(lane) {
        const laneCenterX = this.getLaneCenterX(lane);
        const judgmentY = this.game.config.GAME_CONFIG.judgmentLineY;
        
        const missEffect = document.createElement('div');
        missEffect.style.cssText = `
            position: absolute;
            left: ${laneCenterX - 60}px;
            top: ${judgmentY - 30}px;
            width: 120px;
            height: 60px;
            background: rgba(255, 0, 0, 0.6);
            border: 4px solid #ff0000;
            border-radius: 4px;
            z-index: 100;
            animation: hitFlash 0.5s ease-out;
            box-shadow: 0 0 20px #ff0000;
        `;
        
        document.getElementById('gameContainer').appendChild(missEffect);
        
        const missText = document.createElement('div');
        missText.textContent = 'MISS';
        missText.style.cssText = `
            position: absolute;
            left: ${laneCenterX}px;
            top: ${judgmentY - 50}px;
            transform: translateX(-50%);
            color: #ff0000;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 2px 2px 0 #000;
            z-index: 101;
            animation: textFloat 0.8s ease-out;
            font-family: 'Press Start 2P', cursive;
        `;
        
        document.getElementById('gameContainer').appendChild(missText);
        
        setTimeout(() => {
            if (missEffect.parentNode) {
                missEffect.parentNode.removeChild(missEffect);
            }
            if (missText.parentNode) {
                missText.parentNode.removeChild(missText);
            }
        }, 800);
    }
    
    getLaneCenterX(lane) {
        const config = this.game.config.LANE_CONFIG;
        return config.startX + (lane * config.width) + (config.width / 2);
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const comboElement = document.getElementById('combo');
        const maxComboElement = document.getElementById('maxCombo');
        
        if (scoreElement) scoreElement.textContent = this.game.score;
        if (comboElement) comboElement.textContent = this.game.combo;
        if (maxComboElement) maxComboElement.textContent = this.game.maxCombo;
        
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            heart.style.opacity = index < this.game.lives ? '1' : '0.3';
        });
        
        const comboEffect = document.getElementById('comboEffect');
        if (comboEffect) {
            if (this.game.combo >= 5) {
                comboEffect.textContent = `${this.game.combo} COMBO!`;
                comboEffect.style.opacity = '1';
            } else {
                comboEffect.style.opacity = '0';
            }
        }
    }
    
    showGameOver() {
        const finalScore = document.getElementById('finalScore');
        const finalMaxCombo = document.getElementById('finalMaxCombo');
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        if (finalScore) finalScore.textContent = this.game.score;
        if (finalMaxCombo) finalMaxCombo.textContent = this.game.maxCombo;
        if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    }
    
    hideGameOver() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }
}