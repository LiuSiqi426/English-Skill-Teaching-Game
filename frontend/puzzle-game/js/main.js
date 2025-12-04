let currentCategory = '';
let currentWords = [];
let currentWordIndex = 0;
let fragments = [];
let correctOrder = [];
let wordCount = 2;

const categorySelection = document.getElementById('categorySelection');
const categoryButtons = document.querySelectorAll('.category-btn');
const wordCountSelector = document.getElementById('wordCountSelector');
const wordCountInput = document.getElementById('wordCount');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const gameArea = document.getElementById('gameArea');
const currentWordElement = document.getElementById('currentWord');
const phoneticDisplay = document.getElementById('phoneticDisplay');
const targetSlots = document.getElementById('targetSlots');
const fragmentsContainer = document.getElementById('fragmentsContainer');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const newGameBtn = document.getElementById('newGameBtn');
const menuBtn = document.getElementById('menuBtn');
const messageElement = document.getElementById('message');

decreaseBtn.addEventListener('click', () => {
    if (wordCount > 1) {
        wordCount--;
        wordCountInput.value = wordCount;
    }
});

increaseBtn.addEventListener('click', () => {
    if (wordCount < 10) {
        wordCount++;
        wordCountInput.value = wordCount;
    }
});

async function loadData(category) {
    try {
        const response = await fetch(`/api/puzzle/words/${category}`);
        if (!response.ok) {
          console.warn('API failed, trying local file...');
          const localResponse = await fetch(`/backend/data/puzzle/${category}.json`);
          if (!localResponse.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await localResponse.json();
          return data;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading puzzle data:', error);
        showMessage('Failed to load data. Please try again.', 'error');
        return [];
    }
}

function getRandomWords(data, count) {
    const actualCount = Math.min(count, data.length);
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, actualCount);
}

function startGame() {
    if (currentWordIndex >= currentWords.length) {
        currentWordIndex = 0;
        currentWords = getRandomWords(currentWords, wordCount);
    }
    
    if (newprocess) {
        initProgressBar();
        newprocess = false;
    }
    
    const currentWord = currentWords[currentWordIndex];
    currentWordElement.classList.add('hidden');
    wordCountSelector.classList.add('hidden');
    if (pronunciationBtn) pronunciationBtn.classList.remove('hidden');
    currentWordElement.textContent = `${currentWord.word}`;
    phoneticDisplay.textContent = `${currentWord.phonetic}`;
    
    fragments = [...currentWord.fragments];
    correctOrder = [...currentWord.fragments];
    
    randomOrder(fragments);
    
    gameloading();
    
    messageElement.textContent = '';
    messageElement.className = 'message';
}

function randomOrder(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function gameloading() {
    targetSlots.innerHTML = '';
    fragmentsContainer.innerHTML = '';
    
    for (let i = 0; i < correctOrder.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        targetSlots.appendChild(slot);
    }
    
    fragments.forEach((fragment, index) => {
        const fragmentElement = document.createElement('div');
        fragmentElement.className = 'fragment';
        fragmentElement.textContent = fragment;
        fragmentElement.draggable = true;
        fragmentElement.dataset.fragment = fragment;
        fragmentElement.dataset.index = index;
        
        addDragEvents(fragmentElement);
        
        fragmentsContainer.appendChild(fragmentElement);
    });
    
    addDropEvents(targetSlots);
}

function checkAnswer() {
    const slots = targetSlots.querySelectorAll('.slot');
    let userAnswer = [];
    
    slots.forEach(slot => {
        if (slot.children.length > 0) {
            userAnswer.push(slot.children[0].dataset.fragment);
        } else {
            userAnswer.push('');
        }
    });
    
    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctOrder);
    
    if (isCorrect) {
        currentWordElement.classList.remove('hidden');
        showMessage('Perfect!', 'success');
        incrementProgress();
        
        if (totalWords > 0 && completedWords === totalWords) {
            setTimeout(() => {
                checkBtn.classList.add('hidden');
                resetBtn.classList.add('hidden');
            }, 100);
        } else {
            setTimeout(() => {
                currentWordIndex++;
                startGame();
            }, 1500);
        }
    } else {
        showMessage('Spelling error, please try again!', 'error');
        highlightErrors(userAnswer);
    }
}

function highlightErrors(userAnswer) {
    const slots = targetSlots.querySelectorAll('.slot');
    
    slots.forEach((slot, index) => {
        if (slot.children.length > 0) {
            const fragment = slot.children[0];
            if (userAnswer[index] === correctOrder[index]) {
                fragment.classList.add('correct');
            } else {
                fragment.classList.add('incorrect');
            }
        }
    });
}

function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
}

function resetGame() {
    startGame();
}

function newGame() {
    newprocess = true;
    gameArea.classList.add('hidden');
    wordCountSelector.classList.remove('hidden');
    categorySelection.classList.remove('hidden');
    checkBtn.classList.remove('hidden');
    resetBtn.classList.remove('hidden');
}

function returnToMenu() {
    window.location.href = '/';
}

function initGameEvents() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', async () => {
            currentCategory = button.getAttribute('data-category');
            const data = await loadData(currentCategory);
            
            if (data.length === 0) {
                alert('Error, please refresh.');
                return;
            }
            
            currentWords = getRandomWords(data, wordCount);
            currentWordIndex = 0;
            
            categorySelection.classList.add('hidden');
            gameArea.classList.remove('hidden');
            
            startGame();
        });
    });

    checkBtn.addEventListener('click', checkAnswer);
    resetBtn.addEventListener('click', resetGame);
    newGameBtn.addEventListener('click', newGame);
    if (menuBtn) menuBtn.addEventListener('click', returnToMenu);
}

document.addEventListener('DOMContentLoaded', () => {
    initGameEvents();
});