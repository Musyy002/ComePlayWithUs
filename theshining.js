const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 40;
const rows = 12;
const cols = 12;

const mazes = [
  // Easy
  [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,1],
    [1,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Medium (Tricky but fair)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,1],
    [1,1,1,0,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Hard (Brutal but solvable)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,1,0,1,0,1,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1],
    [1,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,2,1], // '2' is for the gate
  ]
  
];

const gatePositions = [
  { x: 10, y: 1 },   // Easy
  { x: 9, y: 9 },    // Medium (was 11,9)
  { x: 9, y: 9 }     // Hard (was 10,10)
];


let currentLevel = 0;
let player = { x: 1, y: 1 };
let enemy = { x: 10, y: 10 };
let timer = 60;
let gameOver = false;
let lives = 3;

// Images
const playerImg = new Image(); playerImg.src = "boy.png";
const jackImg = new Image(); jackImg.src = "jack.png";
const hedge = new Image(); hedge.src = "hedge.png";
const snow = new Image(); snow.src = "snow.png";
const gateImg = new Image(); gateImg.src = "gate.png";
const heart = new Image(); heart.src = "heart.png";

// Drawing
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maze = mazes[currentLevel];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.drawImage(hedge, x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        ctx.drawImage(snow, x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  const gate = gatePositions[currentLevel];
  ctx.drawImage(gateImg, gate.x * tileSize, gate.y * tileSize, tileSize, tileSize);
  ctx.drawImage(playerImg, player.x * tileSize, player.y * tileSize, tileSize, tileSize);
  ctx.drawImage(jackImg, enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);

  for (let i = 0; i < lives; i++) {
    ctx.drawImage(heart, 10 + i * 30, 10, 24, 24);
  }
}

// Movement
document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  let dx = 0, dy = 0;
  if (e.key === "ArrowUp" || e.key === "w") dy = -1;
  if (e.key === "ArrowDown" || e.key === "s") dy = 1;
  if (e.key === "ArrowLeft" || e.key === "a") dx = -1;
  if (e.key === "ArrowRight" || e.key === "d") dx = 1;

  const maze = mazes[currentLevel];
  const newX = player.x + dx;
  const newY = player.y + dy;

  if (maze[newY][newX] === 0) {
    player.x = newX;
    player.y = newY;
  }

  const gate = gatePositions[currentLevel];
  if (player.x === gate.x && player.y === gate.y) {
    if (currentLevel === 2) {
      gameOver = true;
      alert("YOU ESCAPED ALL LEVELS!");
      showGameOverScreen();
    } else {
      currentLevel++;
      nextLevel();
    }
  }

  draw();
});

// Jack AI
function jackMove() {
  if (gameOver) return;
  const maze = mazes[currentLevel];

  const dirs = [
    { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: 0 }, { x: 1, y: 0 }
  ];

  const options = dirs
    .map(d => ({ x: enemy.x + d.x, y: enemy.y + d.y }))
    .filter(pos => maze[pos.y][pos.x] === 0);

  options.sort((a, b) => {
    const da = Math.abs(a.x - player.x) + Math.abs(a.y - player.y);
    const db = Math.abs(b.x - player.x) + Math.abs(b.y - player.y);
    return da - db;
  });

  if (options.length > 0) {
    enemy.x = options[0].x;
    enemy.y = options[0].y;
  }

  if (enemy.x === player.x && enemy.y === player.y) {
    lives--;
    if (lives > 0) {
      alert(`Caught! Lives left: ${lives}`);
      player = { x: 1, y: 1 };
      enemy = { x: 10, y: 10 };
    } else {
      gameOver = true;
      showGameOverScreen();
    }
  }

  draw();
}

// Timer
setInterval(() => {
  if (!gameOver) {
    timer--;
    document.getElementById("timer").textContent = timer;
    if (timer === 0) {
      gameOver = true;
      showGameOverScreen();
    }
  }
}, 1000);

// Jack speed
let jackInterval = setInterval(jackMove, 500);

function nextLevel() {
  clearInterval(jackInterval);

  if (currentLevel === 1) {
    jackInterval = setInterval(jackMove, 300);
  } else if (currentLevel === 2) {
    jackInterval = setInterval(jackMove, 200);
  }

  player = { x: 1, y: 1 };
  enemy = { x: 10, y: 10 };
  timer = 60;
  draw();
}

// Game Over
function showGameOverScreen() {
  document.getElementById("game-over-screen").classList.remove("hidden");
}

playerImg.onload = () => draw();
