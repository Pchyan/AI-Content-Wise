// 服務工作線程 - 提供離線支持和資源緩存
const CACHE_NAME = 'content-wise-cache-v1';
const OFFLINE_URL = './error.html';

// 要緩存的資源
const urlsToCache = [
  './',
  './index.html',
  './favicon.svg',
  './error.html',
  './src/main.tsx',
  './src/index.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap'
];

// 安裝服務工作線程
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('已打開緩存');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 當服務工作線程被激活
self.addEventListener('activate', (event) => {
  // 清理舊的緩存
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截資源請求
self.addEventListener('fetch', (event) => {
  // 只處理 GET 請求
  if (event.request.method !== 'GET') return;

  // 排除 API 請求
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在緩存中找到了響應，則返回緩存的內容
        if (response) {
          return response;
        }

        // 否則，繼續網絡請求
        return fetch(event.request)
          .then((response) => {
            // 檢查是否收到有效的響應
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆響應，因為響應是流，只能使用一次
            const responseToCache = response.clone();

            // 打開緩存並存儲響應
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 如果網絡請求失敗，返回離線頁面
            return caches.match(OFFLINE_URL);
          });
      })
  );
}); 