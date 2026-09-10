// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// ===== PLAYER OBJECT =====
const player = {
    x: canvas.width / 2,      // Starting X position (middle of screen)
    y: canvas.height / 2,     // Starting Y position (middle of screen)
    width: 30,                // Player width
    height: 30,               // Player height
    speed: 5,                 // How fast the player moves
    vx: 0,                    // Velocity in X direction
    vy: 0                     // Velocity in Y direction
};

// ===== KEYBOARD INPUT =====
const keys = {};

// When a key is pressed, record it
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

// When a key is released, forget it
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ===== UPDATE FUNCTION (called every frame) =====
function update() {
    // Reset velocity each frame
    player.vx = 0;
    player.vy = 0;

    // Check which keys are pressed and update velocity
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.vy = -player.speed;  // Move up
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.vy = player.speed;   // Move down
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.vx = -player.speed;  // Move left
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.vx = player.speed;   // Move right
    }

    // Update player position based on velocity
    player.x += player.vx;
    player.y += player.vy;

    // Keep player inside canvas (prevent going off-screen)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// ===== DRAW FUNCTION (renders everything) =====
function draw() {
    // Clear the canvas (erase everything)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the player as a blue square
    ctx.fillStyle = '#0080FF';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Optional: Draw a border around the player
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

// ===== GAME LOOP (runs continuously) =====
function gameLoop() {
    update();  // Update player position
    draw();    // Draw everything
    requestAnimationFrame(gameLoop);  // Run this function again next frame
}

// Start the game
gameLoop();