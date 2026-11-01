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
const onlinePlayerListEl = document.getElementById('online-player-list');
const onlinePlayerCountEl = document.getElementById('online-player-count');
const playerPopupEl = document.getElementById('player-popup');
const playerPopupNameEl = document.getElementById('player-popup-name');
const playerPopupAvatarEl = document.getElementById('player-popup-avatar');

const avatarMap = {
  '.lizziebear9331': 'Lizzie.jpeg',
  'lizziebear9331': 'Lizzie.jpeg',
  'thewardened': 'Steve.jpeg',
  '.fsal2062': 'Pumpkin.jpeg',
  'fsal2062': 'Pumpkin.jpeg',
  'u1ven_': 'TechnoBlade.jpeg',
  '.u1ven_': 'TechnoBlade.jpeg',
};

function normalizeName(value) {
  return String(value ?? '').trim();
}

function normalizePlayerKey(value) {
  return normalizeName(value)
    .replace(/§[0-9A-FK-ORa-fk-or]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .toLowerCase();
}

function getPlayerName(player) {
  return normalizeName(
    player?.name_clean ?? player?.name_raw ?? player?.name ?? player?.username ?? player
  );
}

function showPlayerPopup(name) {
  if (!playerPopupEl || !playerPopupNameEl || !playerPopupAvatarEl) return;

  const avatar = avatarMap[normalizePlayerKey(name)] || 'BedrockSteve.jpeg';
  playerPopupNameEl.textContent = name;
  playerPopupAvatarEl.src = avatar;
  playerPopupAvatarEl.alt = `${name} avatar`;
  playerPopupEl.classList.add('is-visible');
}

function hidePlayerPopup() {
  if (!playerPopupEl) return;
  playerPopupEl.classList.remove('is-visible');
}

function renderPlayers(players) {
  const visiblePlayers = players
    .map((player) => {
      const name = getPlayerName(player);
      if (!name) return null;

      const normalizedKey = normalizePlayerKey(name);
      const avatar = avatarMap[normalizedKey] || 'BedrockSteve.jpeg';
      return { name, avatar };
    })
    .filter(Boolean);

  if (!visiblePlayers.length) {
    onlinePlayerListEl.innerHTML = '<li class="empty-state">No players online</li>';
    onlinePlayerCountEl.textContent = '0';
    hidePlayerPopup();
    return;
  }

  onlinePlayerListEl.innerHTML = visiblePlayers
    .map(
      (player) => `
        <li>
          <img class="online-player-avatar" src="${player.avatar}" alt="${player.name} avatar" />
          <span class="online-player-name">${player.name}</span>
        </li>
      `
    )
    .join('');

  onlinePlayerCountEl.textContent = String(visiblePlayers.length);

  const warden = visiblePlayers.find((player) => normalizePlayerKey(player.name) === 'thewardened');
  if (warden) {
    showPlayerPopup(warden.name);
  } else {
    hidePlayerPopup();
  }
}

async function fetchServerStatus() {
  try {
    const response = await fetch('https://api.mcstatus.io/v2/status/java/islandsmp.apexmc.co', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error('Status API unavailable');

    const data = await response.json();
    const online = Number(data?.players?.online ?? 0);
    const max = Number(data?.players?.max ?? 100);

    if (onlineEl) onlineEl.textContent = String(online);
    if (maxEl) maxEl.textContent = String(max);

    const playersList = Array.isArray(data?.players?.list) ? data.players.list : [];
    renderPlayers(playersList);
    return;
  } catch (error) {
    if (onlineEl) onlineEl.textContent = '?';
    if (maxEl) maxEl.textContent = '100';
    onlinePlayerListEl.innerHTML = '<li class="empty-state">No players online</li>';
    onlinePlayerCountEl.textContent = '0';
    hidePlayerPopup();
  }
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
