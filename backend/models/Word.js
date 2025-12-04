class Word {
    constructor(word, category) {
        this.word = word;
        this.category = category;
        this.difficulty = this.calculateDifficulty();
        this.createdAt = new Date();
    }

    calculateDifficulty() {
        const wordStr = this.word.toLowerCase();
        const length = wordStr.length;
        
        let difficulty = 1;
        
        if (length <= 4) difficulty = 1;
        else if (length <= 6) difficulty = 2;
        else if (length <= 8) difficulty = 3;
        else if (length <= 10) difficulty = 4;
        else difficulty = 5;
        
        const complexPatterns = [
            /[^a-z]/,
            /(.)\1/,
            /[aeiou]{3,}/,
            /[^aeiou]{3,}/,
            /(ing|tion|ment|ness|able|ible)$/,
            /(un|dis|mis|re|pre)/
        ];
        
        complexPatterns.forEach(pattern => {
            if (pattern.test(wordStr)) {
                difficulty = Math.min(difficulty + 1, 5);
            }
        });
        
        const hardWords = ['elephant', 'watermelon', 'pineapple', 'helicopter', 'firefighter', 'astronaut', 'submarine', 'kangaroo', 'giraffe', 'engineer', 'scientist', 'avocado', 'coconut', 'papaya', 'motorcycle'];
        if (hardWords.includes(wordStr)) {
            difficulty = Math.max(difficulty, 4);
        }
        
        return difficulty;
    }

    getCategoryInfo() {
        const categories = {
            fruit: { name: 'Fruits', color: '#FF6B6B' },
            animal: { name: 'Animals', color: '#4ECDC4' },
            color: { name: 'Colors', color: '#FFD166' },
            vehicle: { name: 'Vehicles', color: '#06D6A0' },
            profession: { name: 'Professions', color: '#118AB2' }
        };
        
        return categories[this.category] || { name: 'Unknown', color: '#999' };
    }

    toJSON() {
        return {
            word: this.word,
            category: this.category,
            difficulty: this.difficulty,
            categoryInfo: this.getCategoryInfo(),
            createdAt: this.createdAt
        };
    }
}

module.exports = Word;