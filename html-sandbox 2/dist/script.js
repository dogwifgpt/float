const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const startMessage = document.getElementById('start-message');

const obstacleImages = [
    'https://cdn.discordapp.com/attachments/895233277114351627/1251404888563257415/Untitled_design_32.png?ex=666e751f&is=666d239f&hm=d34567f02f892b0cc213650eb55d7228f796c499c82cf106cb14239c5b2b65fe&',
    'https://cdn.discordapp.com/attachments/895233277114351627/1251404888856854708/Untitled_design_33.png?ex=666e751f&is=666d239f&hm=bb54fa5ec247e2cc93e89304cfe471a60c82464973b08c4f7862dacc9571b533&',
    'https://cdn.discordapp.com/attachments/895233277114351627/1251404889179820053/Untitled_design_34.png?ex=666e751f&is=666d239f&hm=d627fd5bee6ee7d77957103ffe58d59f36027058a875bbbfb173c7dbdd599dc2&'
];

const backgrounds = [
    'https://cdn.discordapp.com/attachments/895233277114351627/1251409352166867105/Untitled_design_37.png?ex=666e7947&is=666d27c7&hm=b8a78d15f38563a2d0673a0293f37d324de03b1add4c30d2eb4d895ba86ab469&',
    'https://cdn.discordapp.com/attachments/895233277114351627/1251409352166867105/Untitled_design_37.png?ex=666e7947&is=666d27c7&hm=b8a78d15f38563a2d0673a0293f37d324de03b1add4c30d2eb4d895ba86ab469&'
];

let currentBackgroundIndex = 0;
let backgroundYPosition = 0;

let playerX = 375 / 2 - 25; // Adjusted for smaller screen
let playerY = 667 / 2; // Adjusted for smaller screen
let score = 0;
let obstacles = [];
let gameInterval;
let obstacleInterval;
let gameSpeed = 5;
let isGameRunning = false;
let keys = {};
let obstacleSpawnRate = 2000;

document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

function handleKeydown(event) {
    keys[event.key] = true;
    if (!isGameRunning) {
        startGame();
    }
}

function handleKeyup(event) {
    keys[event.key] = false;
}

function movePlayer() {
    if (keys['ArrowLeft'] || keys['a']) {
        playerX -= 10; // Increased movement speed
        if (playerX < 0) playerX = 0;
    }
    if (keys['ArrowRight'] || keys['d']) {
        playerX += 10; // Increased movement speed
        if (playerX > 375 - 50) playerX = 375 - 50; // Adjusted for smaller screen
    }
    player.style.left = `${playerX}px`;
}

function startGame() {
    resetGame();
    isGameRunning = true;
    startMessage.style.display = 'none';
    gameInterval = setInterval(updateGame, 20);
    obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
}

function resetGame() {
    playerX = 375 / 2 - 25; // Adjusted for smaller screen
    playerY = 667 / 2; // Adjusted for smaller screen
    player.style.left = `${playerX}px`;
    player.style.bottom = `50%`;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    obstacles.forEach(obstacle => gameContainer.removeChild(obstacle));
    obstacles = [];
    clearInterval(obstacleInterval);
    clearInterval(gameInterval);
    obstacleSpawnRate = 2000;
    gameSpeed = 5;
    gameContainer.style.backgroundImage = `url('${backgrounds[0]}')`;
    backgroundYPosition = 0;
}

function updateGame() {
    movePlayer();
    playerY += gameSpeed;

    // Update the position of each obstacle and remove if necessary
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const obstacleTop = parseFloat(obstacle.style.top);
        obstacle.style.top = `${obstacleTop + gameSpeed}px`;
        if (obstacleTop > 667) { // Adjusted for smaller screen
            gameContainer.removeChild(obstacle);
            obstacles.splice(i, 1); // Remove the obstacle from the array
            i--; // Adjust the index after removal
        }
        if (checkCollision(player, obstacle)) {
            resetGame();
            isGameRunning = false;
            startMessage.style.display = 'block';
        }
    }

    score += 1;
    scoreDisplay.textContent = `Score: ${score}`;

    // Scroll background upwards
    backgroundYPosition -= gameSpeed;
    if (backgroundYPosition <= -667) {
        backgroundYPosition = 0;
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
        gameContainer.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;
    }
    gameContainer.style.backgroundPositionY = `${backgroundYPosition}px`;

    // Increase difficulty as the score increases
    if (score % 1000 === 0) {
        gameSpeed += 0.5;
        clearInterval(obstacleInterval);
        obstacleSpawnRate -= 100;
        if (obstacleSpawnRate < 500) {
            obstacleSpawnRate = 500;
        }
        obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
    }
}

function createObstacle() {
    if (score < 1000) {
        // Spawn a single obstacle
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        obstacle.style.backgroundImage = `url('${getRandomObstacleImage()}')`;
        obstacle.style.left = `${Math.random() * (375 - 50)}px`; // Adjusted for smaller screen
        obstacle.style.top = `-${Math.random() * 200}px`; // Randomize starting position
        gameContainer.appendChild(obstacle);
        obstacles.push(obstacle);
    } else {
        // Spawn two obstacles at non-overlapping positions
        const positions = generateObstaclePositions();
        positions.forEach(pos => {
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle');
            obstacle.style.backgroundImage = `url('${getRandomObstacleImage()}')`;
            obstacle.style.left = `${pos}px`;
            obstacle.style.top = `-${Math.random() * 200}px`; // Randomize starting position
            gameContainer.appendChild(obstacle);
            obstacles.push(obstacle);
        });
    }
}

function generateObstaclePositions() {
    const obstacleWidth = 50;
    const maxWidth = 375 - obstacleWidth; // Adjusted for smaller screen
    let positions = [];

    while (positions.length < 2) {
        let pos = Math.random() * maxWidth;
        if (positions.every(p => Math.abs(p - pos) > obstacleWidth)) {
            positions.push(pos);
        }
    }

    return positions;
}

function getRandomObstacleImage() {
    return obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
}

function checkCollision(player, obstacle) {
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    return !(
        playerRect.top > obstacleRect.bottom ||
        playerRect.bottom < obstacleRect.top ||
        playerRect.left > obstacleRect.right ||
        playerRect.right < obstacleRect.left
    );
}

// Display the start message initially
startMessage.style.display = 'block';