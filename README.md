# 文萃智析 (ContentWise)

文萃智析是一個網頁應用程式，利用 Google Gemini API 來分析文章內容，提取重點並生成有洞見的感想。

## 功能

- **設定 Google Gemini API Key**：用戶可以設定自己的 API Key 以使用 Google Gemini API。
- **文章分析**：支援兩種輸入方式：
  - 直接輸入文章內容
  - 輸入文章網址，系統會自動抓取網頁內容
- **分析結果**：
  - 總結重點：生成一段簡短的文字，概述文章的核心內容
  - 感想生成：根據文章內容，生成一段對文章的感想或評論
- **多語言支援**：
  - 預設使用台灣繁體中文輸出分析結果
  - 支援切換至簡體中文、英文、日文、韓文

## 技術特點

- 使用 React 和 TypeScript 開發
- 採用 Tailwind CSS 進行樣式設計
- 用戶資料（API Key、語言設定）儲存在本地 localStorage 中，保障隱私
- 使用最新的 Google Gemini 2.0 API 進行文章分析
- 支援 PWA，可安裝到桌面

## 開始使用

1. 在 [Google AI Studio](https://makersuite.google.com/app/apikey) 建立 Gemini API Key
2. 在網站的設定頁面輸入你的 API Key
3. 選擇你偏好的模型版本和輸出語言
4. 開始分析文章！

## 本地開發

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

## 部署

此專案已設定為可以直接部署到 GitHub Pages。
從 dist 資料夾部署靜態檔案到任何靜態網站托管服務。

```bash
npm run deploy
```

## 隱私政策

- 你的 API Key 只會儲存在你的瀏覽器本地，不會傳送到任何伺服器
- 所有的文章分析都直接使用你的 API Key 經由你的瀏覽器與 Google API 通訊，不經過第三方伺服器
- 我們不會收集或儲存你的文章內容

## 更新日誌

### 2024-11-18
- 更新至 Google Gemini 2.0 模型
- 新增多語言輸出支援（台灣繁體中文、簡體中文、英文、日文、韓文）
- 優化使用者界面
