const gameScenes = {
    restaurant: {
        title: "Restaurant Dining",
        questions: [
            {
                id: 1,
                speaker: "Waiter",
                text: "Good evening! Are you ready to order?",
                options: [
                    { id: "A", text: "Yes, I'd like the steak please.", correct: true },
                    { id: "B", text: "No, I'm not hungry.", correct: false },
                    { id: "C", text: "What time is it?", correct: false }
                ]
            },
            {
                id: 2,
                speaker: "Waiter",
                text: "How would you like your steak cooked?",
                options: [
                    { id: "A", text: "Medium rare, please.", correct: true },
                    { id: "B", text: "I don't like steak.", correct: false },
                    { id: "C", text: "Just give me anything.", correct: false }
                ]
            },
            {
                id: 3,
                speaker: "Waiter",
                text: "Would you like anything to drink with your meal?",
                options: [
                    { id: "A", text: "Just water is fine, thank you.", correct: true },
                    { id: "B", text: "I want everything.", correct: false },
                    { id: "C", text: "Where is the bathroom?", correct: false }
                ]
            }
        ]
    },
    hotel: {
        title: "Hotel Check-in",
        questions: [
            {
                id: 1,
                speaker: "Receptionist",
                text: "Welcome to our hotel! Do you have a reservation?",
                options: [
                    { id: "A", text: "Yes, I booked a room under Smith.", correct: true },
                    { id: "B", text: "No, I'm just visiting.", correct: false },
                    { id: "C", text: "Where is the bathroom?", correct: false }
                ]
            },
            {
                id: 2,
                speaker: "Receptionist",
                text: "How many nights will you be staying?",
                options: [
                    { id: "A", text: "Three nights, please.", correct: true },
                    { id: "B", text: "I don't know.", correct: false },
                    { id: "C", text: "What's your name?", correct: false }
                ]
            },
            {
                id: 3,
                speaker: "Receptionist",
                text: "Would you like a room with a view?",
                options: [
                    { id: "A", text: "Yes, a room with ocean view would be great.", correct: true },
                    { id: "B", text: "I want the cheapest room.", correct: false },
                    { id: "C", text: "Give me any room.", correct: false }
                ]
            }
        ]
    },
    zoo: {
        title: "Zoo Visit",
        questions: [
            {
                id: 1,
                speaker: "Ticket Seller",
                text: "How many tickets would you like?",
                options: [
                    { id: "A", text: "Two adult tickets, please.", correct: true },
                    { id: "B", text: "I don't have money.", correct: false },
                    { id: "C", text: "What animals do you have?", correct: false }
                ]
            },
            {
                id: 2,
                speaker: "Zoo Guide",
                text: "The lions are very active this morning. Would you like to see them first?",
                options: [
                    { id: "A", text: "Yes, that sounds exciting!", correct: true },
                    { id: "B", text: "I'm afraid of lions.", correct: false },
                    { id: "C", text: "Where can I buy food?", correct: false }
                ]
            },
            {
                id: 3,
                speaker: "Zoo Staff",
                text: "The elephant show starts in 10 minutes. Do you want to go?",
                options: [
                    { id: "A", text: "Yes, we don't want to miss it!", correct: true },
                    { id: "B", text: "I don't like elephants.", correct: false },
                    { id: "C", text: "What time is lunch?", correct: false }
                ]
            }
        ]
    }
};

function getGameData(scene) {
    return {
        success: true,
        data: gameScenes[scene] || gameScenes.restaurant
    };
}

function submitAnswerLocal(sceneId, questionId, selectedOptionId) {
    console.log(`Scene: ${sceneId}, Question: ${questionId}, Selected: ${selectedOptionId}`);
    return Promise.resolve({ success: true });
}

function calculateResultLocal(score, totalQuestions) {
    let message = "Good job!";
    let stars = 1;
    
    if (score >= 80) {
        message = "Excellent! You're a conversation master!";
        stars = 3;
    } else if (score >= 60) {
        message = "Well done! Keep practicing!";
        stars = 2;
    }
    
    return Promise.resolve({
        success: true,
        data: { message, stars }
    });
}