const GameConfig = {
    LANE_CONFIG: {
        count: 4,
        width: 140,
        totalWidth: 560,
        startX: 220
    },
    
    GAME_CONFIG: {
        noteSpeed: 0.5,
        spawnInterval: 1000,
        spawnChance: 0.8,
        judgmentLineY: 330,
        hitZoneRange: 40,
        perfectRange: 20,
        goodRange: 40,
        correctWordChance: 0.4
    },
    
    WORD_PAIRS: [
        ["apple", "🍎"], ["banana", "🍌"], ["cat", "🐱"], ["dog", "🐶"],
        ["red", "🔴"], ["blue", "🔵"], ["green", "🟢"], ["yellow", "🟡"],
        ["run", "🏃"], ["jump", "🤸"], ["swim", "🏊"], ["read", "📖"],
        ["music", "🎵"], ["game", "🎮"], ["star", "⭐"], ["heart", "❤️"],
        ["sun", "☀️"], ["moon", "🌙"], ["cloud", "☁️"], ["flower", "🌹"]
    ],
    
    KEY_BINDINGS: {
        "KeyA": 0,
        "KeyS": 1, 
        "KeyD": 2,
        "KeyF": 3
    },
    
    LANE_COLORS: ["#ff6b6b", "#ffce6b", "#48db97", "#4da6ff"],
    
    JUDGMENT_COLORS: {
        perfect: "#00ff00",
        good: "#ffeb3b",
        ok: "#ff9800",
        wrong: "#ff0000",
        miss: "#ff0000"
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}