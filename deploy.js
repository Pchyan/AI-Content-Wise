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

// 複製和更新必要檔案
try {
  // 1. 處理 service-worker.js
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
  
  // 2. 處理 error.html
  const errorSourceFile = path.join(__dirname, 'public', 'error.html');
  const errorTargetFile = path.join(__dirname, 'dist', 'error.html');
  let errorContent = fs.readFileSync(errorSourceFile, 'utf8');
  
  // 確保首頁連結正確（無需依賴 JavaScript 動態設置）
  errorContent = errorContent.replace('href="/"', 'href="/AI-Content-Wise/"');
  
  // 寫入更新後的 error.html
  fs.writeFileSync(errorTargetFile, errorContent);
  console.log('error.html 已成功複製並更新到 dist 目錄');
  
  // 3. 處理 404.html - 確保使用我們的自定義版本，而不是從 index.html 複製
  const notFoundSourceFile = path.join(__dirname, 'public', '404.html');
  const notFoundTargetFile = path.join(__dirname, 'dist', '404.html');
  
  fs.copySync(notFoundSourceFile, notFoundTargetFile);
  console.log('從 public 複製 404.html 已完成');
  
  // 4. 確保 robots.txt 存在
  if (fs.existsSync(path.join(__dirname, 'public', 'robots.txt'))) {
    fs.copySync(
      path.join(__dirname, 'public', 'robots.txt'),
      path.join(__dirname, 'dist', 'robots.txt')
    );
    console.log('robots.txt 已複製到 dist 目錄');
  }
  
  console.log('部署前準備完成！');
  
} catch (error) {
  console.error('複製檔案時出錯:', error);
  process.exit(1);
} 