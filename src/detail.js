// ========== DETAIL PAGE LOGIC ==========

const el = (sel) => document.querySelector(sel);
const els = (sel) => document.querySelectorAll(sel);
const urlParams = new URLSearchParams(window.location.search);
const comicId = urlParams.get('id');
const API_BASE = window.API_BASE || "https://nanobanana-backend-1089713441636.us-central1.run.app/api/v1/";

let genresMap = {};
let currentComic = null;

// ========== API FUNCTIONS ==========
async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}genres`);
    const json = await res.json();
    if (json.ok && json.data) {
      json.data.forEach(g => genresMap[g.id] = g.name);
    }
  } catch (e) {
    console.error("Error fetching genres:", e);
  }
}

async function fetchComicDetail(id) {
  try {
    const res = await fetch(`${API_BASE}public/comics/${id}`);
    const json = await res.json();
    if (json.ok && json.data) {
      return json.data;
    }
  } catch (e) {
    console.error("Error fetching comic detail:", e);
  }
  return null;
}

async function fetchRelatedComics(limit = 6) {
  try {
    const res = await fetch(`${API_BASE}public/comics?per_page=${limit}&sort_by=popularity`);
    const json = await res.json();
    let data = [];
    if (json.data && Array.isArray(json.data)) data = json.data;
    else if (Array.isArray(json)) data = json;
    return data.filter(c => c.id !== comicId);
  } catch (e) {
    console.error("Error fetching related comics:", e);
  }
  return [];
}

// ========== FORMATTING HELPERS ==========
const formatViews = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// ========== DETAIL PAGE RENDERING ==========
async function renderDetail() {
  if (!comicId) {
    alert("No comic ID provided");
    window.location.href = 'index.html';
    return;
  }

  // Fetch genres first
  await fetchGenres();

  // Fetch comic detail
  const comic = await fetchComicDetail(comicId);
  if (!comic) {
    el('#detailTitle').textContent = "Comic Not Found";
    el('#detailDesc').textContent = "Could not load this comic. It may have been removed or is unavailable.";
    el('#epLoading').classList.add('hidden');
    return;
  }

  currentComic = comic;

  // Extract data
  const title = comic.title;
  const author = comic.user ? (comic.user.full_name || comic.user.username) : "Unknown Author";
  const cover = comic.cover_url || "https://via.placeholder.com/600x800";
  const desc = comic.synopsis || comic.summary || "No description available.";
  const views = formatViews(comic.total_views || 0);
  const likes = formatViews(comic.total_likes || 0);

  // Map genre
  let genreName = "Webtoon";
  if (comic.genre && comic.genre.length > 0) {
    genreName = genresMap[comic.genre[0]] || "Webtoon";
  }

  // Update UI
  document.title = `${title} - MamaStoria`;
  el('#headerTitle').textContent = title;
  el('#detailTitle').textContent = title;
  el('#detailAuthor').textContent = `by ${author}`;
  el('#genreBadge').textContent = genreName;
  el('#detailDesc').textContent = desc;
  el('#detailCover').src = cover;
  el('#detailViews').textContent = views;
  el('#detailLikes').textContent = likes;

  // Read Now button
  const readNowBtn = el('#readNowBtn');
  if (readNowBtn) {
    readNowBtn.href = `https://nanobananacomic-482111.web.app/#/public/comic/${comicId}`;
  }

  // Share button
  const shareBtn = el('#shareBtn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: `Check out "${title}" on MamaStoria!`,
          url: window.location.href
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Link copied to clipboard!');
        });
      }
    };
  }

  // Render episodes
  renderEpisodes(comic);

  // Render related series
  const relatedComics = await fetchRelatedComics(6);
  renderRelatedSeries(relatedComics);

  // Hide loading
  el('#epLoading').classList.add('hidden');
}

// ========== EPISODES RENDERING ==========
function renderEpisodes(comic) {
  const list = el('#episodeList');
  const episodeCount = el('#episodeCount');

  list.classList.remove('hidden');
  list.innerHTML = '';

  // Create single episode entry (or multiple if API supports)
  const episodeItem = document.createElement('li');
  episodeItem.className = 'flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-md transition cursor-pointer';
  episodeItem.onclick = () => window.location.href = `https://nanobananacomic-482111.web.app/#/public/comic/${comicId}`;

  const cover = comic.cover_url || 'https://via.placeholder.com/600x800';
  const date = new Date(comic.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  episodeItem.innerHTML = `
    <div class="w-16 h-24 rounded overflow-hidden flex-shrink-0">
      <img src="${cover}" alt="Episode" class="w-full h-full object-cover" />
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-gray-900 truncate">Full Story</h4>
      <p class="text-sm text-gray-500 mt-1">${comic.title}</p>
      <p class="text-xs text-gray-400 mt-2">${date}</p>
    </div>
    <div class="flex flex-col items-end gap-2">
      <span class="px-2 py-1 bg-[#00D564] text-white text-xs font-semibold rounded">NEW</span>
      <i class="fas fa-chevron-right text-gray-400"></i>
    </div>
  `;

  list.appendChild(episodeItem);
  episodeCount.textContent = `${1} episode available`;
}

// ========== RELATED SERIES RENDERING ==========
function renderRelatedSeries(comics) {
  const container = el('#relatedSeries');
  container.innerHTML = '';

  if (comics.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No related series found.</p>';
    return;
  }

  comics.slice(0, 6).forEach(comic => {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.onclick = () => window.location.href = `detail.html?id=${comic.id}`;

    const cover = comic.cover_url || 'https://via.placeholder.com/400x600';
    const author = comic.user ? (comic.user.full_name || comic.user.username) : 'Unknown';

    card.innerHTML = `
      <div class="content-card-image">
        <img src="${cover}" alt="${comic.title}" loading="lazy" />
        <div class="badge-container">
          ${comic.isNew ? '<div class="badge badge-new">NEW</div>' : ''}
        </div>
      </div>
      <h3 class="content-card-title">${comic.title}</h3>
      <p class="content-card-author">${author}</p>
    `;

    container.appendChild(card);
  });
}

// ========== TABS FUNCTIONALITY ==========
function setupTabs() {
  const tabs = els('.detail-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.textContent.toLowerCase();
      console.log('Switched to tab:', tabName);
      // Additional tab-specific logic can be implemented here
    });
  });
}

// ========== MORE BUTTON ==========
function setupMoreButton() {
  const moreBtn = el('#moreBtn');
  if (moreBtn) {
    moreBtn.onclick = () => {
      alert('More options - Coming Soon!');
      // TODO: Implement menu for report, save, etc.
    };
  }
}

// ========== INITIALIZATION ==========
async function init() {
  console.log('Loading detail page for comic:', comicId);
  await renderDetail();
  setupTabs();
  setupMoreButton();
}

document.addEventListener('DOMContentLoaded', init);
