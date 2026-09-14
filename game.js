// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// ===== GAME STATE/STATS =====
const gameStats = {
    kills: 0,
    highScore: 0,
    gamesPlayed: 0
};

const SAVE_INTERVAL = 10000; // Save every 10 seconds (in milliseconds)
let lastSaveTime = 0;

// Load saved data on startup
function loadGameData() {
    const savedData = localStorage.getItem('gameStats');
    if (savedData) {
        const loaded = JSON.parse(savedData);
        gameStats.kills = loaded.kills || 0;
        gameStats.highScore = loaded.highScore || 0;
        gameStats.gamesPlayed = loaded.gamesPlayed || 0;
    }
}

// Save game data to localStorage (time-based)
function saveGameData() {
    const currentTime = Date.now();
    
    // Only save if enough time has passed since last save
    if (currentTime - lastSaveTime >= SAVE_INTERVAL) {
        localStorage.setItem('gameStats', JSON.stringify(gameStats));
        lastSaveTime = currentTime;
    }
}

// ===== PLAYER OBJECT =====
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    speed: 5,
    vx: 0,
    vy: 0,
    health: 100,                    // Player health
    maxHealth: 100,
    attackCooldown: 0,              // Frames until next attack
    attackRange: 80,                // Distance to hit enemies
    attackDamage: 25                // Damage dealt per attack
};

// ===== ENEMIES ARRAY =====
const enemies = [];

// Function to create an enemy
function createEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 30),
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30,
        speed: 2,
        health: 30,                 // Enemy health
        maxHealth: 30,
        attackCooldown: 0,          // Frames until next attack
        attackRange: 40,            // Distance to hit player
        attackDamage: 5             // Damage dealt to player
    };
    return enemy;
}

// Spawn 5 enemies at the start
for (let i = 0; i < 5; i++) {
    enemies.push(createEnemy());
}

// ===== COLLISION DETECTION =====
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Calculate distance between two objects
function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ===== PLAYER ATTACKS =====
function playerAttack() {
    // Check if player can attack (cooldown finished)
    if (player.attackCooldown > 0) return;

    // Loop through enemies and damage those in range
    for (let i = 0; i < enemies.length; i++) {
        const distance = getDistance(player, enemies[i]);
        
        if (distance < player.attackRange) {
            // Enemy is in range, deal damage
            enemies[i].health -= player.attackDamage;
            
            // If enemy died, remove it and spawn a new one
            if (enemies[i].health <= 0) {
                gameStats.kills++;  // Increment kill counter
                enemies.splice(i, 1);
                enemies.push(createEnemy());
            }
        }
    }

    // Set cooldown so player can't attack every frame
    player.attackCooldown = 20;  // 20 frames between attacks (~0.3 seconds at 60 FPS)
}

// ===== ENEMY ATTACKS =====
function enemyAttack(enemy) {
    // Check if enemy can attack (cooldown finished)
    if (enemy.attackCooldown > 0) return;

    const distance = getDistance(enemy, player);
    
    // If player is in range, deal damage
    if (distance < enemy.attackRange) {
        player.health -= enemy.attackDamage;
        
        // Set cooldown
        enemy.attackCooldown = 30;  // 30 frames between attacks
    }
}

// ===== ENEMY AI: CHASE THE PLAYER =====
function updateEnemyAI(enemy) {
    // Calculate the direction from enemy to player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    
    // Calculate distance using Pythagorean theorem
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize the direction
    if (distance > 0) {
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Move enemy toward player
        enemy.x += dirX * enemy.speed;
        enemy.y += dirY * enemy.speed;
    }

    // Try to attack the player
    enemyAttack(enemy);
}

// ===== KEYBOARD INPUT =====
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Spacebar to attack
    if (e.key === ' ') {
        playerAttack();
        e.preventDefault();  // Prevent page scroll
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ===== UPDATE FUNCTION =====
function update() {
    // === UPDATE PLAYER ===
    player.vx = 0;
    player.vy = 0;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.vy = -player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.vy = player.speed;
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.vx = -player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.vx = player.speed;
    }

    player.x += player.vx;
    player.y += player.vy;

    // Keep player inside canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Decrease player attack cooldown
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }

    // === UPDATE ENEMIES ===
    for (let enemy of enemies) {
        // Use AI to chase the player
        updateEnemyAI(enemy);

        // Decrease enemy attack cooldown
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
    }

    // Time-based save check
    saveGameData();
}

// ===== DRAW FUNCTION =====
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // === DRAW PLAYER ===
    // Health bar background (red)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x - 5, player.y - 15, player.width + 10, 8);
    
    // Health bar foreground (green)
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(player.x - 5, player.y - 15, (player.width + 10) * healthPercent, 8);

    // Player body
    ctx.fillStyle = '#0080FF';  // Blue
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // Draw attack range (faint circle)
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.attackRange, 0, Math.PI * 2);
    ctx.stroke();

    // === DRAW ENEMIES ===
    ctx.fillStyle = '#FF0000';  // Red
    for (let enemy of enemies) {
        // Health bar background
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x - 5, enemy.y - 15, enemy.width + 10, 8);
        
        // Health bar foreground
        const enemyHealthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(enemy.x - 5, enemy.y - 15, (enemy.width + 10) * enemyHealthPercent, 8);

        // Enemy body
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Draw attack range
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.attackRange, 0, Math.PI * 2);
        ctx.stroke();
    }

    // === DRAW UI ===
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Player HP: ${Math.max(0, player.health)}/${player.maxHealth}`, 10, 25);
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 50);
    ctx.fillText(`Kills this session: ${gameStats.kills}`, 10, 75);
    ctx.fillText(`High Score: ${gameStats.highScore}`, 10, 100);
    ctx.fillText(`Games Played: ${gameStats.gamesPlayed}`, 10, 125);
    ctx.fillText(`Press SPACEBAR to attack`, 10, 150);

    // Game over text
    if (player.health <= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Final Kills: ${gameStats.kills}`, canvas.width / 2, canvas.height / 2 + 20);
        
        // Update high score if current kills exceed it
        if (gameStats.kills > gameStats.highScore) {
            gameStats.highScore = gameStats.kills;
        }
        gameStats.gamesPlayed++;
        
        // Force save when game ends
        lastSaveTime = 0;
        saveGameData();
        
        ctx.fillText('Refresh the page to play again', canvas.width / 2, canvas.height / 2 + 80);
    }
}

// ===== GAME LOOP =====
function gameLoop() {
    if (player.health > 0) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Load saved data before starting the game
loadGameData();

// Start the game
gameLoop();
