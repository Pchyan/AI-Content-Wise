// deploy.js - 部署前準備腳本
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 獲取 __dirname 的 ESM 替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 確保 dist 目錄存在
fs.ensureDirSync('dist');

console.log('開始部署前準備...');

// 複製 service-worker.js 到 dist 目錄
try {
  const sourceFile = path.join(__dirname, 'public', 'service-worker.js');
  const targetFile = path.join(__dirname, 'dist', 'service-worker.js');
  
  // 讀取原始 service-worker.js
  let content = fs.readFileSync(sourceFile, 'utf8');
  
  // 列出 dist/assets 目錄中的檔案，找出實際的 JS 和 CSS 檔案名稱
  if (fs.existsSync('dist/assets')) {
    const assetFiles = fs.readdirSync('dist/assets');
    
    // 找出 JS 和 CSS 檔案
    const jsFile = assetFiles.find(file => file.endsWith('.js') && file.startsWith('index'));
    const cssFile = assetFiles.find(file => file.endsWith('.css') && file.startsWith('index'));
    
    if (jsFile) {
      content = content.replace('./src/main.tsx', `assets/${jsFile}`);
      console.log(`將 main.tsx 路徑更新為 assets/${jsFile}`);
    }
    
    if (cssFile) {
      content = content.replace('./src/index.css', `assets/${cssFile}`);
      console.log(`將 index.css 路徑更新為 assets/${cssFile}`);
    }
  } else {
    console.warn('警告: dist/assets 目錄不存在，無法獲取確切的檔案名稱');
    // 使用替代方案
    content = content.replace('./src/main.tsx', 'assets/index.js');
    content = content.replace('./src/index.css', 'assets/index.css');
  }
  
  // 更新 Service Worker 中的快取文件路徑，適應 GitHub Pages
  content = content.replace('./error.html', 'error.html');
  content = content.replace(/'\.\//g, "'");
  
  // 寫入更新後的 service-worker.js
  fs.writeFileSync(targetFile, content);
  console.log('Service Worker 已成功複製並更新到 dist 目錄');
  
  // 複製 error.html 到 dist 目錄
  fs.copySync(
    path.join(__dirname, 'public', 'error.html'),
    path.join(__dirname, 'dist', 'error.html')
  );
  console.log('error.html 已成功複製到 dist 目錄');
  
  // 創建 404.html (GitHub Pages 特殊處理)
  fs.copySync(
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, 'dist', '404.html')
  );
  console.log('404.html 已創建（用於 GitHub Pages 單頁應用程式路由）');
  
  // 複製 public/404.html
  fs.copySync(
    path.join(__dirname, 'public', '404.html'),
    path.join(__dirname, 'dist', '404.html')
  );
  console.log('從 public 複製 404.html 已完成');
  
  console.log('部署前準備完成！');
  
} catch (error) {
  console.error('複製檔案時出錯:', error);
  process.exit(1);
} 