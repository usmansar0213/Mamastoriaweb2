// ========== EXPLORE PAGE - TAG-BASED DISCOVERY ==========
const API_BASE = window.API_BASE || "https://nanobanana-backend-1089713441636.us-central1.run.app/api/v1/";

// ========== STATE ==========
let allComics = [];
let genresMap = {};
let filteredResults = [];
let currentPage = 1;
const resultsPerPage = 24;
let currentTag = '';
let currentSort = 'popular';
let currentFilter = '';

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
    }
  } catch (e) {
    console.error("Failed to fetch genres:", e);
  }
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

// ========== FILTERING & SORTING ==========
function filterComics() {
  let results = [...allComics];

  // Apply tag filter if selected
  if (currentTag) {
    results = results.filter(c => c.genre.toLowerCase() === currentTag.toLowerCase());
  }

  // Apply type filter
  if (currentFilter === 'free') {
    results = results.filter(c => !c.isPremium);
  } else if (currentFilter === 'completed') {
    results = results.filter(c => c.status === 'completed');
  } else if (currentFilter === 'ongoing') {
    results = results.filter(c => c.status !== 'completed');
  }

  // Apply sorting
  if (currentSort === 'newest') {
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (currentSort === 'trending') {
    results.sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  } else if (currentSort === 'views') {
    results.sort((a, b) => {
      const viewsA = parseInt(a.views.replace(/[KM]/g, '')) || 0;
      const viewsB = parseInt(b.views.replace(/[KM]/g, '')) || 0;
      return viewsB - viewsA;
    });
  }
  // Default 'popular' is already sorted

  filteredResults = results;
  currentPage = 1;
  return results;
}

// ========== RENDERING ==========
function createGenreTag(genreName, comicCount = 0) {
  return `
    <button class="genre-tag p-4 bg-gradient-to-br from-[#00D564]/10 to-[#00D564]/5 border border-[#00D564]/20 rounded-lg hover:border-[#00D564]/50 hover:bg-gradient-to-br hover:from-[#00D564]/20 hover:to-[#00D564]/10 transition text-center cursor-pointer group" data-genre="${genreName}">
      <i class="fas fa-tag text-[#00D564] mb-2 text-lg block group-hover:scale-110 transition"></i>
      <h3 class="font-semibold text-sm">${genreName}</h3>
      <p class="text-xs text-gray-500 mt-1">${comicCount} series</p>
    </button>
  `;
}

function createContentCard(comic, isSmall = false) {
  const sizeClass = isSmall ? 'flex-0-0-130px' : '';
  return `
    <div class="content-card cursor-pointer group transition-all" data-comic-id="${comic.id}" onclick="window.location.href='detail.html?id=${comic.id}'">
      <div class="content-card-image relative">
        <img src="${comic.cover}" alt="${comic.title}" class="w-full h-full object-cover rounded-lg" loading="lazy">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded-lg"></div>
        ${comic.isNew ? '<span class="absolute top-2 left-2 badge badge-new">New</span>' : ''}
      </div>
      <div class="mt-3">
        <h3 class="font-semibold text-sm line-clamp-2">${comic.title}</h3>
        <p class="text-xs text-gray-500 mt-1">${comic.author}</p>
        <div class="flex gap-2 mt-2 text-xs text-gray-600">
          <span>👁 ${comic.views}</span>
          <span>❤ ${comic.likes}</span>
        </div>
      </div>
    </div>
  `;
}

function renderGenreGrid() {
  const genres = Array.from(new Set(allComics.map(c => c.genre)));
  const genreGrid = el('#genreGrid');
  
  genreGrid.innerHTML = genres.map(genre => {
    const count = allComics.filter(c => c.genre === genre).length;
    return createGenreTag(genre, count);
  }).join('');

  // Attach genre tag click handlers
  els('.genre-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      currentTag = tag.dataset.genre;
      els('.genre-tag').forEach(t => t.classList.remove('ring-2', 'ring-[#00D564]'));
      tag.classList.add('ring-2', 'ring-[#00D564]');
      filterComics();
      renderContentGrid();
      updateResultsTitle();
    });
  });
}

function renderContentGrid() {
  const contentGrid = el('#contentGrid');
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const paginatedResults = filteredResults.slice(start, end);

  contentGrid.innerHTML = paginatedResults.map(comic => createContentCard(comic)).join('');
  
  // Update load more button visibility
  const loadMoreBtn = el('#loadMoreBtn');
  if (end >= filteredResults.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }
}

function updateResultsTitle() {
  const resultsTitle = el('#resultsTitle');
  const resultCount = el('#resultCount');
  const suffix = currentTag ? ` in ${currentTag}` : '';
  resultsTitle.textContent = `Showing Results${suffix}`;
  resultCount.textContent = `(${filteredResults.length} found)`;
}

// ========== EVENT HANDLERS ==========
function setupSearchAndFilters() {
  // Search toggle
  el('#searchToggle').addEventListener('click', () => {
    const searchBar = el('#searchBar');
    searchBar.classList.toggle('hidden');
  });

  // Tag search
  el('#tagSearchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    els('.genre-tag').forEach(tag => {
      const genre = tag.dataset.genre.toLowerCase();
      tag.style.display = genre.includes(query) ? 'block' : 'none';
    });
  });

  // Sort dropdown
  el('#sortBy').addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterComics();
    renderContentGrid();
  });

  // Filter dropdown
  el('#filterBy').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    filterComics();
    renderContentGrid();
  });

  // Load more button
  el('#loadMoreBtn').addEventListener('click', () => {
    currentPage++;
    renderContentGrid();
    window.scrollBy({ top: -200, behavior: 'smooth' });
  });
}

// ========== URL QUERY HANDLER ==========
function handleQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const tagParam = params.get('tag');
  const sortParam = params.get('sort');
  const filterParam = params.get('filter');

  if (tagParam) {
    currentTag = decodeURIComponent(tagParam);
  }
  if (sortParam) {
    currentSort = sortParam;
    el('#sortBy').value = sortParam;
  }
  if (filterParam) {
    currentFilter = filterParam;
    el('#filterBy').value = filterParam;
  }
}

// ========== INITIALIZATION ==========
async function init() {
  console.log('Initializing Explore page...');

  // Fetch data
  await fetchGenres();
  allComics = await fetchComics();
  
  console.log(`Loaded ${allComics.length} comics`);

  // Handle URL params (tag, sort, filter)
  handleQueryParams();

  // Filter initial results
  filterComics();

  // Render UI
  renderGenreGrid();
  renderContentGrid();
  updateResultsTitle();

  // Setup interactions
  setupSearchAndFilters();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
