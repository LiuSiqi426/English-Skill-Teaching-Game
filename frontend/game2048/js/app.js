document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 4;
    
    const englishLevels = [
        { name: "BASIC LETTERS", level: 1, color: "#FF6B6B", textColor: "#FFF", borderColor: "#CC5555" },
        { name: "SIMPLE WORDS", level: 2, color: "#4ECDC4", textColor: "#FFF", borderColor: "#3AA69F" },
        { name: "BASIC SENTENCES", level: 3, color: "#FFD166", textColor: "#333", borderColor: "#CCAA55" },
        { name: "DAILY CONVERSATION", level: 4, color: "#06D6A0", textColor: "#FFF", borderColor: "#05B585" },
        { name: "GRAMMAR MASTERY", level: 5, color: "#118AB2", textColor: "#FFF", borderColor: "#0E6F8F" },
        { name: "READING COMPREHENSION", level: 6, color: "#073B4C", textColor: "#FFF", borderColor: "#052A36" },
        { name: "WRITING SKILLS", level: 7, color: "#7209B7", textColor: "#FFF", borderColor: "#5A0792" },
        { name: "FLUENT ENGLISH", level: 8, color: "#F72585", textColor: "#FFF", borderColor: "#C61C6A" }
    ];
    
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let previousGrid = [];
    let previousScore = 0;
    let isMoving = false;
    
    const gridDisplay = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('.score');
    const bestDisplay = document.querySelector('.best');
    const gameMessage = document.querySelector('.game-message');
    const gameMessageText = gameMessage.querySelector('p');
    const restartButtons = document.querySelectorAll('.restart-button');
    const undoButton = document.querySelector('.undo-button');
    
    function initGame() {
        createGrid();
        createTile();
        createTile();
        updateDisplay();
        
        bestDisplay.textContent = bestScore;
        
        document.addEventListener('keyup', control);
        setupTouchControls();
        
        restartButtons.forEach(button => {
            button.addEventListener('click', restartGame);
        });
        
        undoButton.addEventListener('click', undoMove);
        
        setTimeout(() => {
            document.querySelector('h1').classList.add('pixel-glow');
        }, 1000);
    }
    
    function createGrid() {
        grid = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            grid.push(0);
        }
    }
    
    function createTile() {
        if (gameOver) return;
        
        const emptyCells = [];
        grid.forEach((cell, index) => {
            if (cell === 0) emptyCells.push(index);
        });
        
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const level = Math.random() > 0.9 ? 2 : 1;
            grid[randomIndex] = level;
            
            const tile = document.createElement('div');
            tile.classList.add('english-tile');
            const english = englishLevels[level - 1];
            tile.innerHTML = `
                <div class="skill-name">${english.name}</div>
                <div class="skill-level">LV.${english.level}</div>
            `;
            tile.style.backgroundColor = english.color;
            tile.style.color = english.textColor;
            tile.style.borderColor = english.borderColor;
            
            const x = randomIndex % gridSize;
            const y = Math.floor(randomIndex / gridSize);
            
            const cellWidth = (100 - (gridSize - 1) * 2) / gridSize;
            
            const left = x * (cellWidth + 2);
            const top = y * (cellWidth + 2);
            
            tile.style.left = `${left}%`;
            tile.style.top = `${top}%`;
            
            tile.style.width = `${cellWidth}%`;
            tile.style.height = `${cellWidth}%`;
            
            tile.style.transform = 'scale(0)';
            tile.style.opacity = '0';
            
            gridDisplay.appendChild(tile);
            
            setTimeout(() => {
                tile.style.transition = 'all 0.2s ease';
                tile.style.transform = 'scale(1)';
                tile.style.opacity = '1';
                tile.classList.add('pixel-pop');
            }, 10);
        }
    }
    
    function updateDisplay() {
        document.querySelectorAll('.english-tile').forEach(tile => {
            tile.remove();
        });
        
        grid.forEach((cell, index) => {
            if (cell !== 0) {
                const english = englishLevels[cell - 1];
                const tile = document.createElement('div');
                tile.classList.add('english-tile');
                tile.innerHTML = `
                    <div class="skill-name">${english.name}</div>
                    <div class="skill-level">LV.${english.level}</div>
                `;
                tile.style.backgroundColor = english.color;
                tile.style.color = english.textColor;
                tile.style.borderColor = english.borderColor;
                
                const x = index % gridSize;
                const y = Math.floor(index / gridSize);
                
                const cellWidth = (100 - (gridSize - 1) * 2) / gridSize;
                
                const left = x * (cellWidth + 2);
                const top = y * (cellWidth + 2);
                
                tile.style.left = `${left}%`;
                tile.style.top = `${top}%`;
                
                tile.style.width = `${cellWidth}%`;
                tile.style.height = `${cellWidth}%`;
                
                gridDisplay.appendChild(tile);
            }
        });
        
        scoreDisplay.textContent = score;
        bestDisplay.textContent = bestScore;
        
        checkGameOver();
    }
    
    function control(e) {
        if (gameOver || isMoving) return;
        
        saveState();
        
        switch(e.key) {
            case 'ArrowUp':
                moveTiles('up');
                break;
            case 'ArrowDown':
                moveTiles('down');
                break;
            case 'ArrowLeft':
                moveTiles('left');
                break;
            case 'ArrowRight':
                moveTiles('right');
                break;
        }
    }
    
    function moveTiles(direction) {
        if (isMoving) return;
        
        isMoving = true;
        let moved = false;
        
        switch(direction) {
            case 'up':
                for (let x = 0; x < gridSize; x++) {
                    for (let y = 1; y < gridSize; y++) {
                        const index = y * gridSize + x;
                        if (grid[index] !== 0) {
                            moved = moveTile(index, x, y, 0, -1) || moved;
                        }
                    }
                }
                break;
            case 'down':
                for (let x = 0; x < gridSize; x++) {
                    for (let y = gridSize - 2; y >= 0; y--) {
                        const index = y * gridSize + x;
                        if (grid[index] !== 0) {
                            moved = moveTile(index, x, y, 0, 1) || moved;
                        }
                    }
                }
                break;
            case 'left':
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 1; x < gridSize; x++) {
                        const index = y * gridSize + x;
                        if (grid[index] !== 0) {
                            moved = moveTile(index, x, y, -1, 0) || moved;
                        }
                    }
                }
                break;
            case 'right':
                for (let y = 0; y < gridSize; y++) {
                    for (let x = gridSize - 2; x >= 0; x--) {
                        const index = y * gridSize + x;
                        if (grid[index] !== 0) {
                            moved = moveTile(index, x, y, 1, 0) || moved;
                        }
                    }
                }
                break;
        }
        
        if (moved) {
            setTimeout(() => {
                createTile();
                updateDisplay();
                isMoving = false;
                
                if (grid.includes(8)) {
                    setTimeout(() => {
                        gameOver = true;
                        gameMessage.style.display = 'flex';
                        gameMessageText.textContent = 'YOU WIN!\nENGLISH MASTER!';
                    }, 300);
                }
            }, 150);
        } else {
            isMoving = false;
        }
    }
    
    function moveTile(index, x, y, dx, dy) {
        let moved = false;
        let currentX = x;
        let currentY = y;
        let nextX = x + dx;
        let nextY = y + dy;
        
        while (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
            const currentIndex = currentY * gridSize + currentX;
            const nextIndex = nextY * gridSize + nextX;
            
            if (grid[nextIndex] === 0) {
                grid[nextIndex] = grid[currentIndex];
                grid[currentIndex] = 0;
                currentX = nextX;
                currentY = nextY;
                nextX += dx;
                nextY += dy;
                moved = true;
            } else if (grid[nextIndex] === grid[currentIndex]) {
                grid[nextIndex] = grid[currentIndex] + 1;
                grid[currentIndex] = 0;
                score += grid[nextIndex] * 10;
                if (score > bestScore) {
                    bestScore = score;
                    localStorage.setItem('bestScore', bestScore);
                }
                moved = true;
                break;
            } else {
                break;
            }
        }
        
        return moved;
    }
    
    function checkGameOver() {
        if (grid.includes(0)) return;
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const index = y * gridSize + x;
                const current = grid[index];
                
                if (x < gridSize - 1 && grid[index + 1] === current) return;
                
                if (y < gridSize - 1 && grid[index + gridSize] === current) return;
            }
        }
        
        gameOver = true;
        gameMessage.style.display = 'flex';
        gameMessageText.textContent = 'GAME OVER!\nTRY AGAIN!';
    }
    
    function saveState() {
        previousGrid = [...grid];
        previousScore = score;
    }
    
    function undoMove() {
        if (previousGrid.length > 0 && !isMoving) {
            grid = [...previousGrid];
            score = previousScore;
            updateDisplay();
            gameOver = false;
            gameMessage.style.display = 'none';
        }
    }
    
    function restartGame() {
        grid = [];
        score = 0;
        gameOver = false;
        isMoving = false;
        createGrid();
        createTile();
        createTile();
        updateDisplay();
        gameMessage.style.display = 'none';
    }
    
    function setupTouchControls() {
        let touchStartX, touchStartY;
        
        gridDisplay.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        gridDisplay.addEventListener('touchend', e => {
            if (!touchStartX || !touchStartY || isMoving) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            saveState();
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    moveTiles('right');
                } else {
                    moveTiles('left');
                }
            } else {
                if (dy > 0) {
                    moveTiles('down');
                } else {
                    moveTiles('up');
                }
            }
            
            touchStartX = null;
            touchStartY = null;
            e.preventDefault();
        }, { passive: false });
    }
    
    initGame();
});