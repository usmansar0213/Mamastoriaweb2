// ========== CREATOR STUDIO ==========
const el = (sel) => document.querySelector(sel);
const els = (sel) => document.querySelectorAll(sel);

// ========== TAB SWITCHING ==========
function setupTabs() {
  // Get tab param from URL
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');

  els('.studio-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // Switch to tab from URL if specified
  if (tabParam) {
    switchTab(tabParam);
  }
}

function switchTab(tabName) {
  // Hide all tabs
  els('.studio-content').forEach(content => {
    content.classList.remove('active');
    content.classList.add('hidden');
  });

  // Remove active state from all tab buttons
  els('.studio-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.classList.remove('border-[#00D564]');
    tab.classList.add('border-transparent');
  });

  // Show selected tab
  const tabContent = el(`#${tabName}Tab`);
  if (tabContent) {
    tabContent.classList.remove('hidden');
    tabContent.classList.add('active');
  }

  // Activate tab button
  const tabButton = el(`[data-tab="${tabName}"]`);
  if (tabButton) {
    tabButton.classList.add('active');
    tabButton.classList.add('border-[#00D564]');
    tabButton.classList.remove('border-transparent');
  }

  // Update URL
  window.history.replaceState({}, '', `?tab=${tabName}`);
}

// ========== INITIALIZATION ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupTabs);
} else {
  setupTabs();
}
