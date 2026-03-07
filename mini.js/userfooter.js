// Live time for footer
function updateFooterTime() {
  var el = document.getElementById('footerTime');
  if (!el) return;
  var now = new Date();
  el.textContent = now.toLocaleTimeString();
}

// Initialize footer functionality
function initializeFooter() {
  updateFooterTime();
  setInterval(updateFooterTime, 1000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFooter);
} else {
  initializeFooter();
}
