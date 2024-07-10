// Déplacement vaisseau + border
let gamePaused = false;
let gameOver = false;
let shipMovementPaused;
let enemyMovementPaused;
let HerosMissileLaunchedPaused;
let EnnemyMissileLaunchedPaused;
const heroShip = document.getElementsByClassName("spaceship")[0];
const boundary = document.querySelector(".border");
const keysPressed = {};
let shipX = 880;
let shipY = 815;

let isGameActive = false;

let score = 0;

let startTime = 0;
let timeInGame = 0;
let timeInGameBackup = 0;
let timerInterval = null;
// let elapsedTime = 0;

let missileIndex = 0;
let enemyIndex = 0;

let allEnemiesSpawned = false;

window.addEventListener("load", () => {
  const playButton = document.getElementById("play-button");
  playButton.addEventListener("click", function () {
    const numEnemies = document.getElementById("num-enemies").value;
    startGame(parseInt(numEnemies, 10));
  });
});

function startGame(numEnemies) {
  document.getElementById("start-menu").style.display = "none";
  isGameActive = true;
  createRandomEnemies(numEnemies);
  moveEnemies();
  startTimer();
}

//TIMER

//Called for setting time when gameplay is unpaused or started
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000); //create a mini runtime

  console.log("Set time as stating");
}

function setTimeInGame() {
  timeInGame = Date.now() - startTime + timeInGameBackup;
}

function updateTimer() {
  if (gamePaused || !isGameActive) {
    clearInterval(timerInterval);
    timerInterval = null;
    return;
  }
  setTimeInGame();
  document.getElementsByClassName("timer")[0].textContent =
    getFormattedTimeByMilliseconds(timeInGame);
}

//Return an formatted time as text like 15:03:24 (hh:mm:ss) from seconds
function getFormattedTimeBySeconds(seconds) {
  // let seconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return formattedTime;
}

//Return an formatted time as text like 15:03:24 (hh:mm:ss) from milliseconds
function getFormattedTimeByMilliseconds(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return formattedTime;
}

startTimer();

// Vaisseau heros mouvement

function keyDownHandler(e) {
  keysPressed[e.key] = true;
}

function keyUpHandler(e) {
  delete keysPressed[e.key];
}

function moveShip() {
  if (!gamePaused && !shipMovementPaused) {
    let moveBy = 12;

    if (keysPressed.ArrowLeft && shipX > 0) {
      shipX = Math.max(shipX - moveBy, 0);
    }
    if (
      keysPressed.ArrowRight &&
      shipX < boundary.offsetWidth - heroShip.offsetWidth
    ) {
      shipX = Math.min(
        shipX + moveBy,
        boundary.offsetWidth - heroShip.offsetWidth
      );
    }
    if (keysPressed.ArrowUp && shipY > 0) {
      shipY = Math.max(shipY - moveBy, 0);
    }
    if (
      keysPressed.ArrowDown &&
      shipY < boundary.offsetHeight - heroShip.offsetHeight
    ) {
      shipY = Math.min(
        shipY + moveBy,
        boundary.offsetHeight - heroShip.offsetHeight
      );
    }
  }

  /* var key_code = e.which || e.keyCode;
    moveShip(key_code, moveBy) */
  heroShip.style.left = shipX + "px";
  heroShip.style.top = shipY + "px";
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

moveShip();

// Menu Pause

const pauseKey = "Escape";

document.addEventListener("keydown", function (event) {
  if (event.key === pauseKey) {
    togglePause();
    console.log("key press :", event.key);
  }
});

function togglePause() {
  if (!isGameActive) {
    console.log("Game has not started yet.");
    return;
  }

  gamePaused = !gamePaused;
  if (gamePaused) {
    shipMovementPaused = true;
    enemyMovementPaused = true;
    HerosMissileLaunchedPaused = true;
    EnnemyMissileLaunchedPaused = true;

    const pauseOverlay = document.getElementsByClassName("pause-menu")[0];
    pauseOverlay.style.display = "block";
  } else {
    shipMovementPaused = false;
    enemyMovementPaused = false;
    HerosMissileLaunchedPaused = false;
    EnnemyMissileLaunchedPaused = false;

    timeInGameBackup = timeInGame; //save the time elapsed in milliseconds
    console.log("unpause");

    startTimer();

    const pauseOverlay = document.getElementsByClassName("pause-menu")[0];
    pauseOverlay.style.display = "none";
  }
}

const restartButton = document.getElementsByClassName("restart")[0];
restartButton.addEventListener("click", function () {
  togglePause();
  location.reload();
});

const resumeButton = document.getElementsByClassName("resume")[0];
resumeButton.addEventListener("click", function () {
  togglePause();
});

// Ennemy
const enemyShip = document.querySelector(".enemy");

/* let enemies = []; */

function createRandomEnemies(numEnemies) {
  const enemySpawnDelay = 100;
  let enemyCount = 0;
  const enemyWidth = 50; // Width of enemy ship (adjust as needed)
  const enemyHeight = 50; // Height of enemy ship (adjust as needed)
  const minDistanceBetweenEnemies = 100; // Minimum distance between enemy ships

  const spawnEnemyInterval = setInterval(() => {
    if (enemyCount >= numEnemies) {
      clearInterval(spawnEnemyInterval);
      allEnemiesSpawned = true;
      return;
    }

    const enemy = document.createElement("div");
    enemy.id = "enemy" + enemyIndex.toString();
    enemy.classList.add("enemy");
    document.getElementById("enemies").appendChild(enemy);

    // Calculate initial horizontal position within the page bounds
    const minX = 70; // Minimum distance from the left side
    const maxX = window.innerWidth - 70; // Maximum distance from the right side
    let initialX = Math.random() * (maxX - minX) + minX;

    // Calculate initial vertical position
    let initialY = -Math.random() * boundary.offsetHeight - enemyHeight;

    // Check for collision with existing enemies
    const existingEnemies = document.querySelectorAll(".enemy");
    let collisionDetected = false;
    existingEnemies.forEach((existingEnemy) => {
      const existingX = parseInt(existingEnemy.style.left);
      const existingY = parseInt(existingEnemy.style.top);
      const distance = Math.sqrt(
        Math.pow(existingX - initialX, 2) + Math.pow(existingY - initialY, 2)
      );
      if (distance < minDistanceBetweenEnemies) {
        collisionDetected = true;
      }
    });

    // If collision detected, adjust initialX
    if (collisionDetected) {
      initialX += minDistanceBetweenEnemies; // Move to the right by the minimum distance
      if (initialX > maxX) {
        initialX = maxX - enemyWidth; // Ensure enemy does not exceed the right boundary
      }
    }

    enemy.style.left = initialX + "px";
    enemy.style.top = initialY + "px";

    moveEnemyForward(enemy);

    enemyCount++;
    console.log("enemy created");
  }, enemySpawnDelay);
}

function moveEnemyForward(enemy) {
  if (!document.body.contains(enemy) || gamePaused || enemyMovementPaused) {
    return;
  }
  const speed = 1;

  const currentTop = parseInt(enemy.style.top) || 0;
  const newY = currentTop + speed;

  enemy.style.top = newY + "px";

  if (newY > window.innerHeight) {
    console.log("touch down");
    decreaseHeroHealth();

    if (enemy.parentNode) {
      enemy.parentNode.removeChild(enemy);
    }
  }
}

function moveEnemies() {
  document.querySelectorAll(".enemy").forEach((enemy) => {
    moveEnemyForward(enemy);
  });
}

window.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;

  if (e.key === " ") {
    shootMissile();
  }
});

function shootMissile() {
  if (!gamePaused && !HerosMissileLaunchedPaused) {
    const missile = document.createElement("div");
    missileIndex++;
    missile.id = "missile" + missileIndex.toString();
    missile.classList.add("missile");
    document.getElementById("missiles").appendChild(missile);

    missile.style.left = shipX + "px";
    missile.style.top = shipY + "px";

    moveMissile(missile);
  }
}


 function moveMissile(missile, enemies) {
  function animateMissile() {
      if (!document.body.contains(missile)) {
          return;
      }
      const speed = 4;
      const moveMissile = () => {
          if (!gamePaused && !HerosMissileLaunchedPaused) {
              const currentTop = parseInt(missile.style.top) || 0;
              const newY = currentTop - speed;
              missile.style.top = newY + 'px';
              if (enemies && enemies.length > 0) {
                  enemies.forEach(enemy => {
                      if (document.body.contains(enemy) && // Ensure enemy is still in the DOM
                          newY < enemy.offsetTop + enemy.offsetHeight &&
                          newY + missile.offsetHeight > enemy.offsetTop &&
                          parseInt(missile.style.left, 10) < enemy.offsetLeft + enemy.offsetWidth &&
                          parseInt(missile.style.left, 10) + missile.offsetWidth > enemy.offsetLeft) {
                          if (missile.parentNode) {
                              missile.parentNode.removeChild(missile);
                              return;
                          }
                      }
                  });
              }
              if (newY + missile.offsetHeight < 0 || newY > window.innerHeight) {
                  if (missile.parentNode) {
                      missile.parentNode.removeChild(missile);
                      return;
                  }
              }
          }
          if (document.body.contains(missile)) {
              requestAnimationFrame(moveMissile);
          }
      };
      requestAnimationFrame(moveMissile);
  }
  animateMissile();
}

function checkCollisions() {
  const enemies = document.querySelectorAll(".enemy");
  const missiles = document.querySelectorAll(".missile");
  

   enemies.forEach((enemy) => {
    if (
      shipX < enemy.offsetLeft + enemy.offsetWidth &&
      shipX + heroShip.offsetWidth > enemy.offsetLeft &&
      shipY < enemy.offsetTop + enemy.offsetHeight &&
      shipY + heroShip.offsetHeight > enemy.offsetTop
      ) {
        handleEnemyCollision();
      }
  });
  
 
  missiles.forEach((missile) => {
    enemies.forEach((enemy) => {  
      if ( 
        missile.offsetLeft < enemy.offsetLeft + enemy.offsetWidth &&
        missile.offsetLeft + missile.offsetWidth > enemy.offsetLeft &&
        missile.offsetTop < enemy.offsetTop + enemy.offsetHeight &&
        missile.offsetTop + missile.offsetHeight > enemy.offsetTop 
        ) {
        console.log("checking collisions");
        handleMissileCollision(missile, enemy);
      }
    });
  }); 

}

// function qui sert a supprimer le missile et le vaisseau enemi toucher

function handleMissileCollision(missile, enemy) {
  console.log("missile collapase enemy");
  if (document.body.contains(missile) && document.body.contains(enemy)) {
    document.getElementById("missiles").removeChild(missile);
    document.getElementById("enemies").removeChild(enemy);
    score += 20;
    updateScoreDisplay();
  }
}

function updateScoreDisplay() {
  const scoreElement = document.getElementById("score-display");
  if (scoreElement) {
    scoreElement.textContent = `Score: ${score}`;
  }
}

let heroLives = 3;

console.log("lives", heroLives);

function decreaseHeroHealth() {
  heroLives--;
  updateHeartDisplay();

  if (heroLives <= 0) {
    gameOver = true;
    GameOver();
  }
}

function updateHeartDisplay() {
  const heartsContainer = document.querySelector(".hearts");
  heartsContainer.innerHTML = "";

  for (let i = 0; i < heroLives; i++) {
    const heart = document.createElement("div");
    heart.classList.add("heart");

    heartsContainer.appendChild(heart);
  }
}

let invulnerable = false;
const invulnerabilityDuration = 3000;

function handleEnemyCollision() {
  if (invulnerable) {
    return;
  }

  heroLives--;
  updateHeartDisplay();

  invulnerable = true;
  setTimeout(() => {
    invulnerable = false;
  }, invulnerabilityDuration);

  if (heroLives <= 0) {
    gameOver = true;
    GameOver();
  }
}

function GameOver() {
  // clearInterval(timerInterval);
  const gameOverOverlay = document.getElementById("game-over-overlay");
  const gameOverMessage = document.getElementById("game-over-message");
  gameOverMessage.textContent = `Score: ${score}`;
  gameOverOverlay.style.display = "block";

  const restartButton = document.getElementsByClassName("restart-gamOve")[0];
  restartButton.addEventListener("click", function () {
    togglePause();
    location.reload();
  });
  gamePaused = true;
}

function checkVictory() {
  const enemies = document.querySelectorAll(".enemy");
  if (allEnemiesSpawned && !gameOver && enemies.length === 0) {
    console.log(`Checking victory: ${enemies.length} enemies left`);
    victory();
  }
}

function victory() {
  clearInterval(timerInterval); // Assuming you have a game timer that should be stopped
  const victoryOverlay = document.getElementById("victoryOverlay");
  const victoryMessage = document.getElementById("victory-message");

  victoryMessage.textContent = `Score: ${score}`;

  victoryOverlay.style.display = "block"; // Show the victory overlay

  const restartButton = document.getElementsByClassName("restart-victory")[0];
  restartButton.addEventListener("click", function () {
    togglePause();
    location.reload();
  });

  gamePaused = true; // Pause the game
}

var fps = document.getElementById("fps");
var startTimeFps = Date.now();
var frame = 0;

function tick() {
  var time = Date.now();
  frame++;
  if (time - startTimeFps > 1000) {
    fps.innerHTML = (frame / ((time - startTimeFps) / 1000)).toFixed(1);
    startTimeFps = time;
    frame = 0;
  }
}

tick();

function gameLoop() {
  if (!gamePaused && !gameOver) {
    moveEnemies();
    moveShip();
    tick();
    updateHeartDisplay();
    checkCollisions();
    checkVictory();
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();