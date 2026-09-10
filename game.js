// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// ===== PLAYER OBJECT =====
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    speed: 5,
    vx: 0,
    vy: 0
};

// ===== ENEMIES ARRAY =====
const enemies = [];

// Function to create an enemy
function createEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 30),   // Random X position
        y: Math.random() * (canvas.height - 30),  // Random Y position
        width: 30,
        height: 30,
        speed: 2  // How fast they chase the player
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

// Check if player collides with any enemy
function checkPlayerCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        if (checkCollision(player, enemies[i])) {
            handleCollision(i);
        }
    }
}

// What happens when player touches an enemy
function handleCollision(enemyIndex) {
    // Remove the enemy
    enemies.splice(enemyIndex, 1);
    
    // Spawn a new enemy to replace it
    enemies.push(createEnemy());
}

// ===== ENEMY AI: CHASE THE PLAYER =====
function updateEnemyAI(enemy) {
    // Calculate the direction from enemy to player
    const dx = player.x - enemy.x;  // Difference in X
    const dy = player.y - enemy.y;  // Difference in Y
    
    // Calculate distance using Pythagorean theorem
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize the direction (make it a unit vector)
    // This prevents the enemy from moving faster diagonally
    if (distance > 0) {
        const dirX = dx / distance;  // X component of direction (-1 to 1)
        const dirY = dy / distance;  // Y component of direction (-1 to 1)
        
        // Move enemy toward player
        enemy.x += dirX * enemy.speed;
        enemy.y += dirY * enemy.speed;
    }
}

// ===== KEYBOARD INPUT =====
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
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

    // === UPDATE ENEMIES ===
    for (let enemy of enemies) {
        // Use AI to chase the player
        updateEnemyAI(enemy);
    }

    // === CHECK COLLISIONS ===
    checkPlayerCollisions();
}

// ===== DRAW FUNCTION =====
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // === DRAW PLAYER ===
    ctx.fillStyle = '#0080FF';  // Blue
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // === DRAW ENEMIES ===
    ctx.fillStyle = '#FF0000';  // Red
    for (let enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // === DRAW INFO ===
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 20);
}

// ===== GAME LOOP =====
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
