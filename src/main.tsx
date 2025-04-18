import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 檢查 URL 中是否有重定向參數，用於 GitHub Pages 的 SPA 路由
function handleRedirect() {
  const query = new URLSearchParams(window.location.search);
  const redirectPath = query.get('redirect');
  
  if (redirectPath) {
    // 從 URL 中移除 redirect 參數
    const newUrl = window.location.pathname + 
      window.location.search.replace(/[?&]redirect=[^&]+/, '');
    
    window.history.replaceState(null, '', newUrl);
    
    // 取出路徑的最後部分作為 hash 路由
    const routePath = redirectPath.split('/').filter(Boolean).pop() || '';
    if (routePath) {
      setTimeout(() => {
        window.location.hash = '#/' + routePath;
      }, 100);
    }
  }
}

// 處理重定向
handleRedirect();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
) 