const tabs = document.querySelectorAll('.menu-tab');
const panels = document.querySelectorAll('.tab-panel');

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

function activateTab(targetId) {
  tabs.forEach((button) => {
    const active = button.dataset.tabTarget === targetId;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });

  panels.forEach((panel) => {
    const active = panel.id === targetId;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
    panel.style.animation = active ? 'panelFade 0.5s ease' : '';
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tabTarget;
    activateTab(targetId);

    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const onlineEl = document.getElementById('server-online');
const maxEl = document.getElementById('server-max');

async function fetchServerStatus() {
  const endpoints = [
    'https://api.mcstatus.io/v2/status/java/islandsmp.apexmc.co',
    'https://mcstatus.io/status/java/islandsmp.apexmc.co'
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const online = Number(data?.players?.online ?? data?.players?.current ?? 0);
      const max = Number(data?.players?.max ?? 100);

      onlineEl.textContent = String(online);
      maxEl.textContent = String(max);
      return;
    } catch (error) {
      continue;
    }
  }

  onlineEl.textContent = '0';
  maxEl.textContent = '100';
}

fetchServerStatus();
setInterval(fetchServerStatus, 30000);

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
