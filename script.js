const canvas = document.getElementById('stars');
const context = canvas.getContext('2d');

let stars = [];
let animationFrame = null;

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const starCount = Math.min(200, Math.max(120, Math.floor(width / 8)));
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2.2 + 0.5,
    speed: Math.random() * 0.8 + 0.35,
    alpha: Math.random() * 0.8 + 0.2,
  }));
}

function drawStars() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);

  context.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.speed;
    if (star.y > height) {
      star.y = -10;
      star.x = Math.random() * width;
    }

    context.beginPath();
    context.fillStyle = `rgba(255,255,255,${star.alpha})`;
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  }

  animationFrame = requestAnimationFrame(drawStars);
}

setupCanvas();
drawStars();
window.addEventListener('resize', () => {
  cancelAnimationFrame(animationFrame);
  setupCanvas();
  drawStars();
});
