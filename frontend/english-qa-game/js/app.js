import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createPinia } from 'pinia';
import axios from 'axios';

axios.defaults.baseURL = '/api/conversation';

const app = createApp({
    template: `
        <div id="app">
            <header class="game-header">
                <button @click="goBack" class="pixel-button back-button">← Back</button>
                <h1>🎮 English QA Game</h1>
                <p>Practice English conversations in real-life scenarios</p>
            </header>
            <main>
                <router-view></router-view>
            </main>
        </div>
    `,
    methods: {
        goBack() {
            if (this.$route.path !== '/') {
                this.$router.push('/');
            } else {
                window.location.href = '/';
            }
        }
    }
});

const routes = [
    {
        path: '/',
        name: 'home',
        component: {
            template: `
                <div class="scene-selection">
                    <div class="game-card">
                        <h2>Choose a Scene</h2>
                        <p>Select a scenario to practice English conversations</p>
                        
                        <div class="scenes-grid">
                            <div class="scene-card" @click="selectScene('restaurant')">
                                <div class="scene-icon">🍽️</div>
                                <h3>Restaurant Dining</h3>
                                <p>Practice English conversations in a restaurant setting</p>
                                <button class="pixel-button">Start Practice</button>
                            </div>
                            <div class="scene-card" @click="selectScene('hotel')">
                                <div class="scene-icon">🏨</div>
                                <h3>Hotel Check-in</h3>
                                <p>Practice English conversations for hotel stays</p>
                                <button class="pixel-button">Start Practice</button>
                            </div>
                            <div class="scene-card" @click="selectScene('zoo')">
                                <div class="scene-icon">🐘</div>
                                <h3>Zoo Visit</h3>
                                <p>Practice English conversations at the zoo</p>
                                <button class="pixel-button">Start Practice</button>
                            </div>
                        </div>
                        
                        <div class="game-info">
                            <p><strong>How to play:</strong></p>
                            <ol>
                                <li>Choose a conversation scenario</li>
                                <li>Read the speaker's question</li>
                                <li>Select the most appropriate response</li>
                                <li>Earn points for correct answers</li>
                                <li>Complete all 10 questions to get your score</li>
                            </ol>
                        </div>
                    </div>
                </div>
            `,
            methods: {
                selectScene(scene) {
                    this.$router.push(`/game/${scene}`);
                }
            }
        }
    },
    {
        path: '/game/:scene',
        name: 'game',
        component: {
            template: `
                <div class="game-container">
                    <div v-if="loading" class="loading">Loading game data</div>
                    <div v-else-if="!sceneData" class="loading">Failed to load game data</div>
                    <div v-else class="game-content">
                        <div class="game-card">
                            <h2>{{ sceneTitle }}</h2>
                            <p>{{ sceneDescription }}</p>
                            
                            <div class="score-display">
                                Score: {{ score }}/100
                            </div>
                            
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                                </div>
                                <div class="progress-text">
                                    Question {{ currentQuestion + 1 }} of {{ totalQuestions }}
                                </div>
                            </div>
                            
                            <div v-if="currentQuestionData" class="question-container">
                                <div class="speaker">{{ currentQuestionData.speaker }}</div>
                                <div class="question">{{ currentQuestionData.text }}</div>
                                
                                <div class="options">
                                    <div v-for="option in currentQuestionData.options" 
                                         :key="option.id"
                                         class="option"
                                         :class="{ 
                                             'selected': selectedOption === option.id,
                                             'correct': showResult && option.correct,
                                             'wrong': showResult && selectedOption === option.id && !option.correct
                                         }"
                                         @click="selectOption(option.id)">
                                        <span class="option-letter">{{ option.id }}</span>
                                        <span class="option-text">{{ option.text }}</span>
                                    </div>
                                </div>
                                
                                <div v-if="showResult" class="feedback">
                                    <div v-if="isCorrect" class="correct">✅ Correct! Well done!</div>
                                    <div v-else class="incorrect">❌ Not quite right. Try again!</div>
                                    <button @click="nextQuestion" class="pixel-button">
                                        {{ isLastQuestion ? 'View Results' : 'Next Question' }}
                                    </button>
                                </div>
                                <div v-else class="submit-container">
                                    <button @click="submitAnswer" 
                                            :disabled="!selectedOption"
                                            class="pixel-button submit-btn">
                                        Submit Answer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            data() {
                return {
                    loading: true,
                    sceneData: null,
                    currentQuestion: 0,
                    selectedOption: null,
                    showResult: false,
                    isCorrect: false,
                    score: 0,
                    sceneTitle: '',
                    sceneDescription: ''
                };
            },
            computed: {
                totalQuestions() {
                    return this.sceneData ? this.sceneData.questions.length : 0;
                },
                currentQuestionData() {
                    return this.sceneData ? this.sceneData.questions[this.currentQuestion] : null;
                },
                isLastQuestion() {
                    return this.currentQuestion === this.totalQuestions - 1;
                },
                progress() {
                    return ((this.currentQuestion + 1) / this.totalQuestions) * 100;
                }
            },
            async mounted() {
                const scene = this.$route.params.scene;
                await this.loadSceneData(scene);
            },
            methods: {
                async loadSceneData(scene) {
                    this.loading = true;
                    try {
                        console.log(`Loading scene data for: ${scene}`);
                        const response = await axios.get(`/scenes/${scene}`);
                        this.sceneData = response.data.data;
                        this.sceneTitle = this.sceneData.title;
                        this.sceneDescription = this.sceneData.description;
                        console.log('Scene data loaded successfully');
                    } catch (error) {
                        console.error('Error loading scene:', error);
                        alert('Failed to load scene data. Please try again.');
                    } finally {
                        this.loading = false;
                    }
                },
                selectOption(optionId) {
                    if (!this.showResult) {
                        this.selectedOption = optionId;
                    }
                },
                async submitAnswer() {
                    if (!this.selectedOption) {
                        alert('Please select an answer first!');
                        return;
                    }
                    
                    try {
                        console.log('Submitting answer:', {
                            sceneId: this.$route.params.scene,
                            questionId: this.currentQuestionData.id,
                            selectedOption: this.selectedOption
                        });
                        
                        const response = await axios.post('/submit-answer', {
                            sceneId: this.$route.params.scene,
                            questionId: this.currentQuestionData.id,
                            selectedOptionId: this.selectedOption
                        });
                        
                        this.showResult = true;
                        this.isCorrect = response.data.data.isCorrect;
                        
                        if (this.isCorrect) {
                            this.score += 10;
                            console.log('Answer correct! Score:', this.score);
                        } else {
                            console.log('Answer incorrect');
                        }
                    } catch (error) {
                        console.error('Error submitting answer:', error);
                        alert('Failed to submit answer. Please try again.');
                    }
                },
                nextQuestion() {
                    if (this.isLastQuestion) {
                        this.showResults();
                    } else {
                        this.currentQuestion++;
                        this.selectedOption = null;
                        this.showResult = false;
                        this.isCorrect = false;
                    }
                },
                async showResults() {
                    try {
                        console.log('Calculating final results...');
                        const response = await axios.post('/calculate-result', {
                            score: this.score,
                            totalQuestions: this.totalQuestions
                        });
                        
                        const result = response.data.data;
                        console.log('Results:', result);
                        
                        this.showResultModal(result);
                    } catch (error) {
                        console.error('Error calculating results:', error);
                        const result = {
                            score: this.score,
                            totalScore: 100,
                            correctAnswers: Math.floor(this.score / 10),
                            totalQuestions: this.totalQuestions,
                            stars: Math.floor(this.score / 100 * 3),
                            message: 'Game completed!'
                        };
                        this.showResultModal(result);
                    }
                },
                showResultModal(result) {
                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay';
                    modal.innerHTML = `
                        <div class="results-modal">
                            <h2>Game Completed! 🎉</h2>
                            <p>Here are your results</p>
                            
                            <div class="final-score">
                                <div class="score-circle">${result.score}/100</div>
                                <p><strong>${result.message}</strong></p>
                            </div>
                            
                            <div class="star-rating">
                                ${[1, 2, 3].map(star => 
                                    `<div class="star ${star <= result.stars ? 'active' : 'inactive'}">⭐</div>`
                                ).join('')}
                            </div>
                            
                            <div class="results-stats">
                                <p>Correct Answers: ${result.correctAnswers}/${result.totalQuestions}</p>
                                <p>Score: ${result.score}/${result.totalScore}</p>
                            </div>
                            
                            <div class="results-actions">
                                <button onclick="this.closest('.modal-overlay').remove(); this.$router.push('/');" class="pixel-button">
                                    Back to Scenes
                                </button>
                                <button onclick="window.location.reload();" class="pixel-button">
                                    Play Again
                                </button>
                            </div>
                        </div>
                    `;
                    
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.remove();
                            this.$router.push('/');
                        }
                    });
                    
                    document.body.appendChild(modal);
                    
                    setTimeout(() => {
                        const buttons = modal.querySelectorAll('.pixel-button');
                        buttons[0].onclick = () => {
                            modal.remove();
                            this.$router.push('/');
                        };
                        buttons[1].onclick = () => {
                            window.location.reload();
                        };
                    }, 100);
                }
            }
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

const pinia = createPinia();

app.use(router);
app.use(pinia);
app.mount('#app');