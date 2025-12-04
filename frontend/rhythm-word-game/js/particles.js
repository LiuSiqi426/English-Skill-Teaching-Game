class ParticleManager {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }
    
    createParticle(x, y, color) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30 + Math.floor(Math.random() * 20),
            element: null
        };
        
        const particleElement = document.createElement('div');
        particleElement.className = 'particle';
        particleElement.style.backgroundColor = color;
        particleElement.style.left = `${x}px`;
        particleElement.style.top = `${y}px`;
        
        document.getElementById('gameContainer').appendChild(particleElement);
        particle.element = particleElement;
        this.particles.push(particle);
    }
    
    createHitParticles(note) {
        const baseX = this.game.uiManager.getLaneCenterX(note.lane);
        const baseY = this.game.config.GAME_CONFIG.judgmentLineY;
        
        for (let i = 0; i < 20; i++) {
            const color = this.game.config.LANE_COLORS[note.lane] || "#cccccc";
            this.createParticle(baseX, baseY, color);
        }
    }
    
    createMissParticles(note) {
        const baseX = this.game.uiManager.getLaneCenterX(note.lane);
        const baseY = this.game.config.GAME_CONFIG.judgmentLineY;
        
        for (let i = 0; i < 12; i++) {
            this.createParticle(baseX, baseY, "#ff6464");
        }
    }
    
    createMistakeParticles() {
        const baseX = 500;
        const baseY = 350;
        
        for (let i = 0; i < 15; i++) {
            this.createParticle(baseX, baseY, "#ff0000");
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life--;
            
            if (particle.element) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1;
                
                particle.element.style.left = `${particle.x}px`;
                particle.element.style.top = `${particle.y}px`;
                particle.element.style.opacity = particle.life / 30;
            }
            
            if (particle.life <= 0) {
                this.removeParticle(i);
            }
        }
    }
    
    removeParticle(index) {
        const particle = this.particles[index];
        if (particle && particle.element && particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
        }
        this.particles.splice(index, 1);
    }
    
    clearParticles() {
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particles = [];
    }
}