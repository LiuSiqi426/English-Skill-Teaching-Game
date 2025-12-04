const crosswordLevels = [
    {
        level: 1,
        theme: "Animals",
        difficulty: 1,
        gridSize: 5,
        across: [
            { number: 1, clue: "A furry pet that says 'meow'", answer: "CAT", length: 3, row: 0, col: 1 },
            { number: 3, clue: "Man's best friend", answer: "DOG", length: 3, row: 2, col: 1 },
            { number: 5, clue: "Large animal with a trunk", answer: "ELEPHANT", length: 8, row: 4, col: 0 }
        ],
        down: [
            { number: 1, clue: "Fast-running animal with spots", answer: "CHEETAH", length: 7, row: 0, col: 1 },
            { number: 2, clue: "Animal that hops and has long ears", answer: "RABBIT", length: 6, row: 0, col: 3 },
            { number: 4, clue: "King of the jungle", answer: "LION", length: 4, row: 2, col: 4 }
        ]
    },
    {
        level: 2,
        theme: "Fruits",
        difficulty: 2,
        gridSize: 6,
        across: [
            { number: 1, clue: "Red fruit often used in pies", answer: "APPLE", length: 5, row: 0, col: 0 },
            { number: 4, clue: "Yellow curved fruit", answer: "BANANA", length: 6, row: 2, col: 0 },
            { number: 7, clue: "Small red fruit with seeds on outside", answer: "STRAWBERRY", length: 10, row: 4, col: 0 }
        ],
        down: [
            { number: 1, clue: "Round citrus fruit", answer: "ORANGE", length: 6, row: 0, col: 0 },
            { number: 2, clue: "Green fruit with brown fuzzy skin", answer: "KIWI", length: 4, row: 0, col: 2 },
            { number: 3, clue: "Small purple fruit", answer: "GRAPE", length: 5, row: 0, col: 4 },
            { number: 5, clue: "Large green melon", answer: "WATERMELON", length: 10, row: 2, col: 5 }
        ]
    }
];

function getCrosswordLevel(levelNum) {
    const level = crosswordLevels.find(l => l.level === levelNum);
    if (!level) return null;
    
    return {
        success: true,
        data: level
    };
}

function verifyAnswerLocal(levelNum, userAnswers) {
    const level = crosswordLevels.find(l => l.level === levelNum);
    if (!level) return { success: false, message: "Level not found" };
    
    let correct = 0;
    let total = level.across.length + level.down.length;
    
    return {
        success: true,
        data: {
            correct: correct,
            total: total,
            percentage: Math.round((correct / total) * 100),
            completed: correct === total
        }
    };
}