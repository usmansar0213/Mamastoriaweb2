// ========== TAPAS.IO-STYLE MAMASTORIA FRONTEND ==========
// Production-ready content discovery UI with personalization, role-based UX, and performance

const API_BASE = window.API_BASE || "https://nanobanana-backend-1089713441636.us-central1.run.app/api/v1/";

// ========== STATE ==========
let allComics = [];
let genresMap = {};
let carouselIndex = 0;
let carouselData = [];
let readingHistory = [];
let userRole = localStorage.getItem('userRole') || 'reader'; // 'reader' or 'creator'
let countdownIntervals = new Map(); // Track countdown badge updates

// ========== HELPERS ==========
const el = (sel) => document.querySelector(sel);
const els = (sel) => document.querySelectorAll(sel);

const formatViews = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const mapComic = (d) => {
  let gName = "Unknown";
  if (d.genre && d.genre.length > 0) {
    const gID = d.genre[0];
    gName = genresMap[gID] || "General";
  }
  return {
    id: d.id,
    title: d.title,
    author: d.user ? (d.user.full_name || d.user.username) : "Unknown",
    cover: d.cover_url || "https://via.placeholder.com/400x600?text=No+Image",
    views: formatViews(d.total_views || 0),
    likes: formatViews(d.total_likes || 0),
    genre: gName,
    isNew: (new Date() - new Date(d.created_at)) < (7 * 24 * 60 * 60 * 1000),
  };
};

// ========== API FUNCTIONS ==========
async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}genres`);
    const json = await res.json();
    if (json.ok && json.data) {
      json.data.forEach(g => {
        genresMap[g.id] = g.name;
      });
      return json.data;
    }
  } catch (e) {
    console.error("Failed to fetch genres:", e);
  }
  return [];
}

async function fetchComics() {
  try {
    const response = await fetch(`${API_BASE}public/comics?per_page=100&sort_by=popularity`);
    const data = await response.json();
    let rawData = [];
    if (data.data && Array.isArray(data.data)) rawData = data.data;
    else if (Array.isArray(data)) rawData = data;
    return rawData.map(mapComic);
  } catch (error) {
    console.error("Error fetching comics:", error);
    return [];
  }
}

async function fetchNewComics(limit = 12) {
  try {
    const res = await fetch(`${API_BASE}public/comics/new?limit=${limit}`);
    const json = await res.json();
    if (json.ok && json.data) {
      return json.data.map(mapComic);
    }
  } catch (e) {
    console.error("Failed to fetch new comics:", e);
  }
  return [];
}

async function fetchTrendingComics(limit = 12) {
  try {
    const res = await fetch(`${API_BASE}public/comics/trending?limit=${limit}`);
    const json = await res.json();
    if (json.ok && json.data) {
      return json.data.map(mapComic);
    }
  } catch (e) {
    console.error("Failed to fetch trending:", e);
  }
  return [];
}

// ========== CAROUSEL FUNCTIONS ==========
function initCarousel(comics) {
  carouselData = comics.slice(0, 5);
  if (carouselData.length === 0) return;

  renderCarouselSlide(0);
  renderCarouselIndicators();

  // Auto-rotate every 7 seconds
  setInterval(() => {
    carouselIndex = (carouselIndex + 1) % carouselData.length;
    renderCarouselSlide(carouselIndex);
  }, 7000);
}

function renderCarouselSlide(index) {
  const container = el('#carouselContainer');
  const item = carouselData[index];
  if (!item) return;

  container.innerHTML = `
    <img src="${item.cover}" class="w-full h-full object-cover" alt="${item.title}" />
    <div class="carousel-overlay">
      <h2 class="carousel-title">${item.title}</h2>
      <p class="carousel-author">by ${item.author}</p>
      <a href="detail.html?id=${item.id}" class="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-[#00D564] text-white font-semibold rounded-lg hover:bg-[#00c255] transition">
        <i class="fas fa-play"></i>Read Now
      </a>
    </div>
  `;

  // Update indicators
  els('.carousel-indicator').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  carouselIndex = index;
}

function renderCarouselIndicators() {
  const container = el('#carouselIndicators');
  container.innerHTML = '';
  carouselData.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => renderCarouselSlide(i);
    container.appendChild(dot);
  });
}

// ========== CONTENT CARD RENDERING ==========
function createContentCard(comic) {
  const div = document.createElement('div');
  div.className = 'content-card';
  div.onclick = () => window.location.href = `detail.html?id=${comic.id}`;

  const statusBadge = comic.isNew 
    ? '<div class="badge badge-new">NEW</div>'
    : '';

  div.innerHTML = `
    <div class="content-card-image">
      <img src="${comic.cover}" alt="${comic.title}" loading="lazy" />
      <div class="badge-container">
        ${statusBadge}
      </div>
    </div>
    <h3 class="content-card-title">${comic.title}</h3>
    <p class="content-card-author">${comic.author}</p>
  `;

  return div;
}

// ========== HORIZONTAL SCROLL RAIL RENDERING ==========
function renderHorizontalRail(railId, comics) {
  const container = el(`#${railId}`);
  if (!container) return;

  container.innerHTML = '';
  comics.forEach(comic => {
    container.appendChild(createContentCard(comic));
  });
}

// ========== DISCOVERY TABS ==========
function setupDiscoveryTabs() {
  const tabs = els('.discovery-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.getAttribute('data-tab');
      console.log('Switched to tab:', tabName);
      // Additional tab logic can be added here
    });
  });
}

// ========== SEARCH FUNCTIONALITY ==========
function setupSearch() {
  const toggleBtn = el('#searchToggle');
  const searchBar = el('#searchBar');
  const searchInput = el('#searchInput');

  if (!toggleBtn || !searchBar) return;

  toggleBtn.addEventListener('click', () => {
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) {
      setTimeout(() => searchInput.focus(), 100);
    }
  });

  searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        // Implement search logic here
        console.log('Search for:', query);
        searchBar.classList.add('hidden');
      }
    }
  });
}

// ========== MOBILE MENU ==========
function setupMobileMenu() {
  const toggleBtn = el('#mobileMenuToggle');
  const mobileMenu = el('#mobileMenu');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && 
        !mobileMenu.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
      mobileMenu.classList.add('hidden');
    }
  });
}

// ========== CAROUSEL CONTROLS ==========
function setupCarouselControls() {
  const prevBtn = el('#carouselPrev');
  const nextBtn = el('#carouselNext');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      carouselIndex = (carouselIndex - 1 + carouselData.length) % carouselData.length;
      renderCarouselSlide(carouselIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      carouselIndex = (carouselIndex + 1) % carouselData.length;
      renderCarouselSlide(carouselIndex);
    });
  }
}

// ========== LOCAL STORAGE & READING HISTORY ==========
function loadReadingHistory() {
  const stored = localStorage.getItem('mamastoria_reading_history');
  readingHistory = stored ? JSON.parse(stored) : [];
  return readingHistory;
}

function saveReadingHistory(comicId, pageCount = 1, totalPages = 0) {
  loadReadingHistory();
  const existing = readingHistory.find(h => h.comicId === comicId);
  const now = new Date().toISOString();
  
  if (existing) {
    existing.pageCount = pageCount;
    existing.totalPages = totalPages;
    existing.lastRead = now;
    existing.readProgress = totalPages > 0 ? Math.round((pageCount / totalPages) * 100) : 0;
  } else {
    readingHistory.unshift({
      comicId,
      pageCount,
      totalPages,
      lastRead: now,
      readProgress: totalPages > 0 ? Math.round((pageCount / totalPages) * 100) : 0,
    });
  }
  
  readingHistory = readingHistory.slice(0, 20); // Keep last 20
  localStorage.setItem('mamastoria_reading_history', JSON.stringify(readingHistory));
}

function getRecommendedComics(allComics) {
  // Generate recommendations based on reading history genres and popularity
  if (readingHistory.length === 0) return allComics.slice(0, 12);
  
  const readGenres = readingHistory
    .map(h => allComics.find(c => c.id === h.comicId))
    .filter(c => c)
    .map(c => c.genre);

  // Score comics by genre match + not yet read
  const readComicIds = new Set(readingHistory.map(h => h.comicId));
  const scored = allComics
    .filter(c => !readComicIds.has(c.id))
    .map(c => ({
      ...c,
      score: (readGenres.filter(g => g === c.genre).length * 2) + Math.random(),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 12);
}

function getContinueReadingComics() {
  // Get comics from reading history with progress < 100%
  if (readingHistory.length === 0) return [];
  
  return readingHistory
    .filter(h => h.readProgress < 100)
    .map(h => {
      const comic = allComics.find(c => c.id === h.comicId);
      if (comic) {
        return {
          ...comic,
          progress: h.readProgress,
          pageCount: h.pageCount,
          totalPages: h.totalPages,
        };
      }
      return null;
    })
    .filter(c => c)
    .slice(0, 12);
}

// ========== COUNTDOWN BADGE HELPERS ==========
function formatCountdown(unlocksAt) {
  // Calculate time remaining until unlock
  const now = new Date();
  const target = new Date(unlocksAt);
  const diff = target - now;

  if (diff <= 0) return "Unlocked";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "Soon";
}

function startCountdownUpdates(elementId, unlocksAt) {
  // Clear existing interval if any
  if (countdownIntervals.has(elementId)) {
    clearInterval(countdownIntervals.get(elementId));
  }

  const element = el(`#${elementId}`);
  if (!element) return;

  const update = () => {
    const countdown = formatCountdown(unlocksAt);
    element.textContent = countdown;

    if (countdown === "Unlocked") {
      element.classList.remove('badge-timer');
      element.classList.add('badge-new');
      element.style.animation = 'pulse 0.6s ease-in-out';
      setTimeout(() => {
        element.style.animation = '';
      }, 600);

      if (countdownIntervals.has(elementId)) {
        clearInterval(countdownIntervals.get(elementId));
        countdownIntervals.delete(elementId);
      }
    }
  };

  update();
  const interval = setInterval(update, 60000); // Update every minute
  countdownIntervals.set(elementId, interval);
}

// ========== ENHANCED CONTENT CARD ==========
function createContentCard(comic, cardIndex, isRecommended = false) {
  const cardId = `card-${comic.id}-${cardIndex}`;
  const badgeHtml = comic.isNew
    ? '<span class="badge badge-new">New</span>'
    : isRecommended
    ? '<span class="badge badge-new" style="background: #4F46E5;">Recommended</span>'
    : '<span class="badge badge-up">Up</span>';

  const countdownId = `countdown-${comic.id}-${cardIndex}`;
  let countdownHtml = '';
  let countdownScript = '';
  
  if (comic.unlocksAt && new Date(comic.unlocksAt) > new Date()) {
    countdownHtml = `<span id="${countdownId}" class="badge badge-timer">${formatCountdown(comic.unlocksAt)}</span>`;
    countdownScript = `startCountdownUpdates('${countdownId}', '${comic.unlocksAt}')`;
  }

  const progressHtml = comic.progress ? `<div class="progress-bar" style="width: ${comic.progress}%"></div>` : '';

  const html = `
    <div class="content-card" id="${cardId}" data-comic-id="${comic.id}" onclick="window.location.href='detail.html?id=${comic.id}'">
      <div class="content-card-image">
        <img src="${comic.cover}" alt="${comic.title}" loading="lazy">
        ${badgeHtml}
        ${countdownHtml}
        ${progressHtml}
      </div>
      <div class="content-card-info">
        <h3>${comic.title}</h3>
        <p class="author">${comic.author}</p>
        <div class="metrics">
          <span>👁 ${comic.views}</span>
          <span>❤ ${comic.likes}</span>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  
  if (countdownScript) {
    setTimeout(() => eval(countdownScript), 100);
  }

  return div.firstElementChild;
}

// ========== RENDER FUNCTIONS ==========
function setupRoleBasedNavigation() {
  // Show/hide role-specific UI elements
  const readerNav = el('.nav-reader');
  const creatorNav = el('.nav-creator');

  if (readerNav) readerNav.style.display = userRole === 'reader' ? 'flex' : 'none';
  if (creatorNav) creatorNav.style.display = userRole === 'creator' ? 'flex' : 'none';

  // Handle role switch if role toggle exists
  const roleToggle = el('#roleToggle');
  if (roleToggle) {
    roleToggle.addEventListener('change', (e) => {
      userRole = e.target.checked ? 'creator' : 'reader';
      localStorage.setItem('userRole', userRole);
      setupRoleBasedNavigation();
    });
  }
}

function setupInteractiveButtons() {
  const publishBtn = el('#publishBtn');
  const userBtn = el('#userBtn');

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      if (userRole === 'creator') {
        window.location.href = 'creator-studio.html';
      } else {
        alert('Switch to Creator role to access publishing tools');
      }
    });
  }

  if (userBtn) {
    userBtn.addEventListener('click', () => {
      alert('User Account - Coming Soon!');
      // TODO: Link to login/profile
    });
  }
}

// ========== MAIN INITIALIZATION ==========
async function init() {
  console.log('Initializing MamaStoria...');

  // Load reading history from localStorage
  loadReadingHistory();

  // Fetch genres first
  await fetchGenres();

  // Fetch all data in parallel
  const [comics, newComics, trendingComics] = await Promise.all([
    fetchComics(),
    fetchNewComics(12),
    fetchTrendingComics(12),
  ]);

  allComics = comics;
  console.log(`Loaded ${comics.length} comics`);

  // Initialize carousel with featured titles
  initCarousel(newComics.length > 0 ? newComics : allComics);

  // Render personalized rails first (Continue Reading, Recommended)
  const continueReading = getContinueReadingComics();
  if (continueReading.length > 0) {
    renderHorizontalRail('continueReadingRail', continueReading);
  }

  const recommended = getRecommendedComics(allComics);
  renderHorizontalRail('recommendedRail', recommended);

  // Render curated and algorithmic rails
  renderHorizontalRail('newComicsRail', newComics.length > 0 ? newComics : allComics.slice(0, 12));
  renderHorizontalRail('trendingRail', trendingComics.length > 0 ? trendingComics : allComics.slice(12, 24));
  renderHorizontalRail('staffPicksRail', allComics.slice(24, 36));
  renderHorizontalRail('freeRail', allComics.slice(36, 48));
  renderHorizontalRail('completedRail', allComics.slice(48, 60));

  // Setup interactions
  setupDiscoveryTabs();
  setupSearch();
  setupMobileMenu();
  setupCarouselControls();
  setupRoleBasedNavigation();
  setupInteractiveButtons();
}

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', init);
