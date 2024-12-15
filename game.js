const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let arrowsLeft = 50;
let level = 1;
let gameOver = false;

const balloons = [];
const arrows = [];
const particles = [];
const bow = { x: 100, y: canvas.height / 2, angle: 0 };

// Draw the bow
function drawBow() {
  ctx.save();
  ctx.translate(bow.x, bow.y);
  ctx.rotate(-bow.angle);
  ctx.beginPath();
  ctx.arc(0, 0, 50, Math.PI / 2, (3 * Math.PI) / 2); // Bow curve
  ctx.lineWidth = 4;
  ctx.strokeStyle = "brown";
  ctx.stroke();
  ctx.closePath();
  ctx.restore();

  // Draw bowstring
  ctx.beginPath();
  ctx.moveTo(bow.x - Math.cos(bow.angle) * 50, bow.y + Math.sin(bow.angle) * 50);
  ctx.lineTo(bow.x + Math.cos(bow.angle) * 50, bow.y - Math.sin(bow.angle) * 50);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

// Draw an arrow on the bow (pre-shot)
function drawLoadedArrow() {
  ctx.save();
  ctx.translate(bow.x, bow.y);
  ctx.rotate(-bow.angle);
  ctx.fillStyle = "gray";
  ctx.fillRect(0, -2, 50, 4); // Arrow shaft
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(50, -4);
  ctx.lineTo(60, 0);
  ctx.lineTo(50, 4); // Arrowhead
  ctx.fill();
  ctx.restore();
}

// Create dark balloons
function createBalloon() {
  if (gameOver) return;
  const x = canvas.width + Math.random() * 200;
  const y = Math.random() * (canvas.height - 150) + 50;
  const speed = Math.random() * (1 + level * 0.5) + 1; // Speed increases with level
  const radius = Math.random() * 20 + 30;
  const color = `hsl(${Math.random() * 360}, 80%, 30%)`; // Darker colors
  const type = Math.random() > 0.8 ? "special" : "normal";
  balloons.push({ x, y, speed, radius, color, type, popped: false });
}

// Create particle effects
function createPopEffect(x, y, color) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 4 + 2,
      color,
      life: 1,
    });
  }
}

// Shoot arrow
function shootArrow() {
  if (arrowsLeft > 0 && !gameOver) {
    arrows.push({
      x: bow.x,
      y: bow.y,
      angle: bow.angle,
      vx: Math.cos(bow.angle) * 15,
      vy: -Math.sin(bow.angle) * 15,
      trail: [],
    });
    arrowsLeft--;
    document.getElementById("arrows-left").textContent = `Arrows: ${arrowsLeft}`;
  }
  if (arrowsLeft === 0) {
    setTimeout(endGame, 1000); // Short delay before ending the game
  }
}

// End game
function endGame() {
  gameOver = true;
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
  
}

// Update balloons
function updateBalloons() {
  balloons.forEach((balloon, index) => {
    if (!balloon.popped) {
      balloon.x -= balloon.speed;
      if (balloon.x < -50) {
        balloons.splice(index, 1);
      }
    }
  });
}

// Update arrows
function updateArrows() {
  arrows.forEach((arrow, arrowIndex) => {
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;
    arrow.trail.push({ x: arrow.x, y: arrow.y });
    if (arrow.trail.length > 10) arrow.trail.shift();

    // Check for collisions
    balloons.forEach((balloon, balloonIndex) => {
      if (!balloon.popped) {
        const dist = Math.hypot(arrow.x - balloon.x, arrow.y - balloon.y);
        if (dist < balloon.radius) {
          balloon.popped = true;
          score += balloon.type === "special" ? 10 : 1;
          createPopEffect(balloon.x, balloon.y, balloon.color);
          document.getElementById("score").textContent = `Score: ${score}`;
          balloons.splice(balloonIndex, 1);
          arrows.splice(arrowIndex, 1);
        }
      }
    });
  });
}

// Draw balloons
function drawBalloons() {
  balloons.forEach((balloon) => {
    if (!balloon.popped) {
      ctx.beginPath();
      ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
      ctx.fillStyle = balloon.color;
      ctx.fill();
      ctx.closePath();
    }
  });
}

// Draw arrows and trails
function drawArrows() {
  arrows.forEach((arrow) => {
    // Draw arrow
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(-arrow.angle);
    ctx.fillStyle = "gray";
    ctx.fillRect(0, -2, 40, 4);
    ctx.restore();

    // Draw trail
    arrow.trail.forEach((point, index) => {
      ctx.globalAlpha = index / arrow.trail.length;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "gray";
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  });
}

// Game loop
function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBow();
  drawLoadedArrow();
  updateBalloons();
  drawBalloons();
  updateArrows();
  drawArrows();
  requestAnimationFrame(gameLoop);
}

// Spawn balloons and start game
setInterval(() => {
  if (!gameOver) createBalloon();
}, 2000);

gameLoop();

// Mouse controls
canvas.addEventListener("mousemove", (e) => {
  const dx = e.clientX - bow.x;
  const dy = bow.y - e.clientY;
  bow.angle = Math.atan2(dy, dx);
});
canvas.addEventListener("click", shootArrow);
