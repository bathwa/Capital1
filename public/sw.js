const CACHE_NAME = 'abathwa-capital-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Process queued actions when back online
  const pendingActions = await getStoredActions();
  
  for (const action of pendingActions) {
    try {
      await processAction(action);
      await removeStoredAction(action.id);
    } catch (error) {
      console.error('Failed to sync action:', error);
    }
  }
}

async function getStoredActions() {
  // Get actions from IndexedDB or localStorage
  return JSON.parse(localStorage.getItem('abathwa_pending_actions') || '[]');
}

async function removeStoredAction(actionId) {
  const actions = await getStoredActions();
  const filteredActions = actions.filter(action => action.id !== actionId);
  localStorage.setItem('abathwa_pending_actions', JSON.stringify(filteredActions));
}

async function processAction(action) {
  // Process the action based on its type
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}