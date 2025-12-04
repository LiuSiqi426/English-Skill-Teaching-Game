class WordClassificationGame {
    constructor() {
        this.words = [];
        this.categories = [];
        this.level = 1;
        this.maxLevel = 5;
        this.lives = 3;
        this.maxLives = 3;
        this.usedWords = new Set();
        this.currentLevelWords = [];
        this.apiBaseUrl = 'http://localhost:3000/api/classification';
        
        console.log('Game constructor called');
        this.init();
    }

    async init() {
        console.log('Initializing game...');
        console.log('Current URL:', window.location.href);
        
        this.checkDOMElements();
        
        await this.loadGameData();
        this.setupEventListeners();
        this.startGame();
    }

    checkDOMElements() {
        console.log('=== Checking DOM Elements ===');
        const elements = {
            'level-circles': document.getElementById('level-circles'),
            'words-list': document.getElementById('words-list'),
            'categories': document.getElementById('categories'),
            'message': document.getElementById('message'),
            'lives': document.getElementById('lives'),
            'hearts': document.getElementById('hearts'),
            'reset-btn': document.getElementById('reset-btn'),
            'home-btn': document.getElementById('home-btn')
        };
        
        for (const [id, element] of Object.entries(elements)) {
            console.log(`${id}:`, element ? 'FOUND' : 'NOT FOUND');
        }
    }

    async loadGameData() {
        try {
            console.log('=== Loading game data ===');
            console.log('API Base URL:', this.apiBaseUrl);
            
            console.log('Loading words from:', `${this.apiBaseUrl}/words`);
            const response = await fetch(`${this.apiBaseUrl}/words`);
            
            if (!response.ok) {
                console.error('API response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Response text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('=== API Response Data ===');
            console.log('Has categories:', !!data.categories, 'Count:', data.categories?.length);
            console.log('Has words:', !!data.words, 'Count:', data.words?.length);
            
            this.words = data.words || [];
            this.categories = data.categories || [];
            
            console.log(`Loaded ${this.words.length} words and ${this.categories.length} categories`);
            
            if (this.words.length === 0 || this.categories.length === 0) {
                console.error('No words or categories loaded');
                this.useFallbackData();
                return;
            }
            
            this.renderLevelCircles();
            
        } catch (error) {
            console.error('Failed to load game data:', error);
            this.useFallbackData();
        }
    }

    useFallbackData() {
        console.log('Using fallback data...');
        
        this.categories = [
            { id: "fruit", name: "Fruits" },
            { id: "animal", name: "Animals" },
            { id: "color", name: "Colors" },
            { id: "vehicle", name: "Vehicles" },
            { id: "profession", name: "Professions" }
        ];
        
        this.words = [
            { word: "apple", category: "fruit" },
            { word: "banana", category: "fruit" },
            { word: "dog", category: "animal" },
            { word: "cat", category: "animal" },
            { word: "red", category: "color" },
            { word: "blue", category: "color" },
            { word: "car", category: "vehicle" },
            { word: "bus", category: "vehicle" },
            { word: "doctor", category: "profession" },
            { word: "teacher", category: "profession" },
            { word: "orange", category: "fruit" },
            { word: "tiger", category: "animal" },
            { word: "green", category: "color" },
            { word: "bike", category: "vehicle" },
            { word: "nurse", category: "profession" },
            { word: "grape", category: "fruit" },
            { word: "lion", category: "animal" },
            { word: "yellow", category: "color" },
            { word: "train", category: "vehicle" },
            { word: "engineer", category: "profession" }
        ];
        
        console.log('Fallback data loaded:', {
            categories: this.categories.length,
            words: this.words.length
        });
        
        this.renderLevelCircles();
        this.showMessage('Using demo data. Server data unavailable.', 'warning');
    }

    renderLevelCircles() {
        console.log('=== renderLevelCircles called ===');
        const levelCirclesContainer = document.getElementById('level-circles');
        
        if (!levelCirclesContainer) {
            console.error('Level circles container not found');
            return;
        }
        
        console.log('Level circles container found, rendering...');
        levelCirclesContainer.innerHTML = '';
        
        for (let i = 1; i <= this.maxLevel; i++) {
            const circle = document.createElement('div');
            circle.className = 'level-circle';
            
            if (i < this.level) {
                circle.classList.add('completed');
            } else if (i === this.level) {
                circle.classList.add('current');
                circle.textContent = i;
            } else {
                circle.classList.add('upcoming');
                circle.textContent = i;
            }
            
            levelCirclesContainer.appendChild(circle);
        }
        
        console.log(`Rendered ${this.maxLevel} level circles, current level: ${this.level}`);
    }

    renderCategories() {
        console.log('=== renderCategories called ===');
        const categoriesContainer = document.getElementById('categories');
        
        if (!categoriesContainer) {
            console.error('Categories container not found');
            return;
        }
        
        console.log('Categories container found');
        categoriesContainer.innerHTML = '';
        
        const availableCategories = this.categories;
        console.log('Showing ALL categories:', availableCategories);
        
        availableCategories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            categoryElement.setAttribute('data-category-id', category.id);
            categoryElement.setAttribute('droppable', 'true');
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.name;
            
            const wordsContainer = document.createElement('div');
            wordsContainer.className = 'classified-words';
            wordsContainer.setAttribute('data-category-words', category.id);
            
            categoryElement.appendChild(categoryTitle);
            categoryElement.appendChild(wordsContainer);
            categoriesContainer.appendChild(categoryElement);
        });
        
        console.log(`Rendered ${availableCategories.length} categories for level ${this.level}`);
    }

    startGame() {
        console.log('=== startGame called ===');
        this.resetGame();
        this.loadWordsForLevel();
    }

    resetGame() {
        console.log('Resetting game...');
        this.level = 1;
        this.lives = this.maxLives;
        this.usedWords.clear();
        this.currentLevelWords = [];
        this.updateLevelCircles();
        this.updateLives();
        this.clearMessage();
        this.hideVictoryScreen();
        
        this.clearAllClassifiedWords();
    }

    resetLevel() {
        console.log(`Resetting level ${this.level}`);
        this.lives = this.maxLives;
        
        this.currentLevelWords.forEach(word => {
            this.usedWords.delete(word);
        });
        this.currentLevelWords = [];
        
        this.updateLives();
        this.updateLevelCircles();
        this.clearMessage();
        
        this.clearAllClassifiedWords();
        this.loadWordsForLevel();
        
        this.showMessage(`Level ${this.level} restarted! You have ${this.lives} lives.`, 'error');
    }

    loadWordsForLevel() {
        console.log('=== loadWordsForLevel called ===');
        console.log('Current level:', this.level);
        console.log('Available words:', this.words.length);
        
        const wordsList = document.getElementById('words-list');
        
        if (!wordsList) {
            console.error('Words list container not found!');
            return;
        }
        
        console.log('Clearing words list...');
        wordsList.innerHTML = '';
        
        if (this.words.length === 0) {
            console.error('No words available to load');
            this.showMessage('No words available. Please check server connection.', 'error');
            return;
        }
        
        const levelConfig = this.getLevelConfig(this.level);
        console.log('Level config:', levelConfig);
        
        if (this.words.length < levelConfig.wordCount) {
            console.warn(`Not enough words in database for level ${this.level}. Need ${levelConfig.wordCount}, have ${this.words.length}`);
            this.showMessage(`Warning: Limited word database. Some words may repeat.`, 'error');
        }
        
        const levelWords = this.getRandomWordsForLevel(levelConfig.wordCount);
        console.log('Randomly selected words for level:', levelWords);
        
        this.currentLevelWords = levelWords.map(word => word.word);
        
        this.currentLevelWords.forEach(word => {
            this.usedWords.add(word);
        });
        
        console.log(`Level ${this.level} words:`, this.currentLevelWords);
        console.log(`Total used words: ${this.usedWords.size}`);
        console.log(`Total available words: ${this.words.length}`);
        
        this.renderCategories();
        
        console.log('Creating word elements...');
        levelWords.forEach(wordData => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word';
            wordElement.textContent = wordData.word;
            wordElement.setAttribute('draggable', 'true');
            wordElement.setAttribute('data-word', wordData.word);
            
            wordsList.appendChild(wordElement);
        });
        
        console.log(`Loaded ${levelWords.length} words for level ${this.level}`);
        
        this.showMessage(`${levelConfig.description}`, 'success');
    }

    getRandomWordsForLevel(count) {
        const availableWords = [...this.words];
        
        for (let i = availableWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
        }
        
        return availableWords.slice(0, count);
    }

    getLevelConfig(level) {
        const configs = {
            1: { wordCount: 8, description: "Level 1 - Easy Words (Random Selection)" },
            2: { wordCount: 10, description: "Level 2 - Easy-Medium Words (Random Selection)" },
            3: { wordCount: 12, description: "Level 3 - Medium Words (Random Selection)" },
            4: { wordCount: 15, description: "Level 4 - Medium-Hard Words (Random Selection)" },
            5: { wordCount: 20, description: "Level 5 - Hard Words (Random Selection)" }
        };
        return configs[level] || configs[1];
    }

    async verifyClassification(word, categoryId, wordElement) {
        try {
            console.log(`Verifying: ${word} in category: ${categoryId}`);
            const response = await fetch(`${this.apiBaseUrl}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word, category: categoryId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Verification result:', result);
            
            if (result.isCorrect) {
                this.handleCorrectAnswer(word, categoryId, wordElement);
            } else {
                this.handleWrongAnswer(wordElement);
            }
            
            this.checkGameProgress();
            
        } catch (error) {
            console.error('Failed to verify classification:', error);
            this.showMessage('Failed to verify classification. Please try again.', 'error');
        }
    }

    handleCorrectAnswer(word, categoryId, wordElement) {
        this.showMessage('Correct! Well done!', 'success');
        this.moveWordToCategory(word, categoryId, wordElement);
    }

    handleWrongAnswer(wordElement) {
        this.lives--;
        this.updateLives();
        
        if (this.lives <= 0) {
            this.showMessage(`Game Over! Level ${this.level} failed. Restarting level...`, 'error');
            setTimeout(() => {
                this.resetLevel();
            }, 2000);
        } else {
            this.showMessage(`Incorrect! ${this.lives} ${this.lives === 1 ? 'life' : 'lives'} remaining.`, 'error');
            
            wordElement.classList.add('error');
            
            setTimeout(() => {
                this.resetWordElement(wordElement);
            }, 500);
        }
    }

    moveWordToCategory(word, categoryId, originalWordElement) {
        const classifiedContainer = document.querySelector(`[data-category-words="${categoryId}"]`);
        
        if (classifiedContainer) {
            const classifiedWord = document.createElement('div');
            classifiedWord.className = 'classified-word correct';
            classifiedWord.textContent = word;
            
            classifiedContainer.appendChild(classifiedWord);
            originalWordElement.remove();
        }
    }

    resetWordElement(wordElement) {
        wordElement.style.opacity = '1';
        wordElement.style.transform = 'none';
        wordElement.classList.remove('dragging');
        wordElement.classList.remove('error');
    }

    clearAllClassifiedWords() {
        const classifiedContainers = document.querySelectorAll('.classified-words');
        classifiedContainers.forEach(container => {
            container.innerHTML = '';
        });
        console.log('Cleared all classified words from categories');
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
            
            const displayTime = type === 'success' ? 3000 : 2000;
            setTimeout(() => {
                this.clearMessage();
            }, displayTime);
        }
    }

    clearMessage() {
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.className = 'message';
            messageElement.style.display = 'none';
        }
    }

    updateLevelCircles() {
        this.renderLevelCircles();
    }

    updateLives() {
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            livesElement.textContent = this.lives;
            
            const heartsContainer = document.getElementById('hearts');
            if (heartsContainer) {
                heartsContainer.innerHTML = '';
                for (let i = 0; i < this.maxLives; i++) {
                    const heart = document.createElement('span');
                    heart.className = `heart ${i < this.lives ? 'active' : 'inactive'}`;
                    heart.innerHTML = '❤️';
                    heartsContainer.appendChild(heart);
                }
            }
        }
    }

    checkGameProgress() {
        const wordsLeft = document.querySelectorAll('.word').length;
        console.log(`Words left: ${wordsLeft}`);
        
        if (wordsLeft === 0) {
            this.levelUp();
        }
    }

    levelUp() {
        this.clearAllClassifiedWords();
        
        this.level++;
        this.lives = this.maxLives;
        this.currentLevelWords = [];
        this.updateLevelCircles();
        this.updateLives();
        
        if (this.level <= this.maxLevel) {
            this.showMessage(`Level ${this.level-1} completed! Starting level ${this.level}`, 'success');
            setTimeout(() => {
                this.loadWordsForLevel();
            }, 2000);
        } else {
            this.showVictoryScreen();
        }
    }

    showVictoryScreen() {
        const victoryScreen = document.getElementById('victory-screen');
        
        if (victoryScreen) {
            victoryScreen.classList.add('active');
            this.createClouds();
        }
    }

    hideVictoryScreen() {
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
            victoryScreen.classList.remove('active');
            this.clearClouds();
        }
    }

    createClouds() {
        const container = document.getElementById('clouds-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const cloudConfigs = [
            { size: 'small', position: 'top', delay: 0 },
            { size: 'medium', position: 'middle', delay: 8 },
            { size: 'large', position: 'bottom', delay: 15 },
            { size: 'small', position: 'middle', delay: 22 },
            { size: 'medium', position: 'top', delay: 30 }
        ];
        
        cloudConfigs.forEach(config => {
            const cloud = document.createElement('div');
            cloud.className = `cloud ${config.size} ${config.position}`;
            cloud.style.animationDelay = `${config.delay}s`;
            container.appendChild(cloud);
        });
    }

    clearClouds() {
        const container = document.getElementById('clouds-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset button clicked');
                this.startGame();
            });
        }

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                console.log('Home button clicked');
                this.returnToHome();
            });
        }

        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                console.log('Play again button clicked');
                this.startGame();
            });
        }

        const victoryHomeBtn = document.getElementById('victory-home-btn');
        if (victoryHomeBtn) {
            victoryHomeBtn.addEventListener('click', () => {
                console.log('Victory home button clicked');
                this.returnToHome();
            });
        }
    }

    returnToHome() {
        window.location.href = 'http://localhost:3000';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    console.log('Creating WordClassificationGame instance...');
    window.app = new WordClassificationGame();
});

if (typeof DragDropManager !== 'undefined') {
    console.log('DragDropManager already loaded');
} else {
    console.log('Creating basic drag and drop functionality...');
    
    class SimpleDragDrop {
        constructor() {
            this.draggedWord = null;
            this.init();
        }
        
        init() {
            document.addEventListener('dragstart', this.handleDragStart.bind(this));
            document.addEventListener('dragover', this.handleDragOver.bind(this));
            document.addEventListener('dragenter', this.handleDragEnter.bind(this));
            document.addEventListener('dragleave', this.handleDragLeave.bind(this));
            document.addEventListener('drop', this.handleDrop.bind(this));
            document.addEventListener('dragend', this.handleDragEnd.bind(this));
            console.log('Simple drag and drop initialized');
        }
        
        handleDragStart(e) {
            if (e.target.classList.contains('word')) {
                this.draggedWord = e.target;
                e.dataTransfer.setData('text/plain', e.target.textContent);
                e.target.classList.add('dragging');
                console.log('Dragging word:', e.target.textContent);
            }
        }
        
        handleDragOver(e) {
            if (e.target.closest('.category')) {
                e.preventDefault();
            }
        }
        
        handleDragEnter(e) {
            const categoryElement = e.target.closest('.category');
            if (categoryElement) {
                e.preventDefault();
                categoryElement.classList.add('drag-over');
            }
        }
        
        handleDragLeave(e) {
            const categoryElement = e.target.closest('.category');
            if (categoryElement && !categoryElement.contains(e.relatedTarget)) {
                categoryElement.classList.remove('drag-over');
            }
        }
        
        handleDrop(e) {
            const categoryElement = e.target.closest('.category');
            if (categoryElement && this.draggedWord) {
                e.preventDefault();
                categoryElement.classList.remove('drag-over');
                
                const word = this.draggedWord.textContent;
                const categoryId = categoryElement.getAttribute('data-category-id');
                
                console.log('Dropped word:', word, 'into category:', categoryId);
                
                if (window.app && categoryId) {
                    window.app.verifyClassification(word, categoryId, this.draggedWord);
                }
                
                this.draggedWord = null;
            }
        }
        
        handleDragEnd(e) {
            const words = document.querySelectorAll('.word');
            words.forEach(word => {
                word.classList.remove('dragging');
            });
            
            const categories = document.querySelectorAll('.category');
            categories.forEach(category => {
                category.classList.remove('drag-over');
            });
            
            this.draggedWord = null;
        }
    }
    
    window.dragDropManager = new SimpleDragDrop();
}