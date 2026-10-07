# Scratch AI 作品評分系統

繁體中文評分網站：先選組別，再填寫作品資料與分數。支援 100 分制、配分調整、評語、CSV 匯出與 Google 試算表寫入。

## 四個組別

1. 國小動畫 AI 互動組
2. 國小遊戲 AI 互動組
3. 國中生活 AI 互動組
4. 國中 AI 智慧生活組

## 開啟網站

公開原始碼使用 `YOUR_SPREADSHEET_ID` 與 `YOUR_SITE_DOMAIN` 作為設定占位文字，不包含原網站的私人 Google 資源識別碼。

網站原始碼在 儲存庫根目錄，不需要安裝套件或建置。以靜態網頁伺服器開啟儲存庫根目錄即可。亦可部署到 GitHub Pages 或其他靜態網站服務。

## Google 試算表連線

1. 將 `GoogleSheets.gs`、`sheets.js`、`sheets-setup.html` 中的 `YOUR_SPREADSHEET_ID` 替換為自己的成績試算表 ID，並將 `YOUR_SITE_DOMAIN` 替換為自己的網站網域。避免把私人設定或通行碼提交到公開儲存庫。
2. 開啟網站的「首次設定說明與程式碼」。
2. 在成績試算表的 Apps Script 貼上 `GoogleSheets.gs`。
3. 執行 `setup` 取得通行碼，再部署為網頁應用程式。
4. 在網站填入部署網址與通行碼，按「確認連線」。
5. 儲存新成績會自動送出；歷史成績可按「同步尚未確認的成績」。

如更換試算表，須修改 `GoogleSheets.gs` 的 `SPREADSHEET_ID` 及網站內成績表連結。如更換網站網址，須將新的網站 origin 加入 `ALLOWED_ORIGINS` 並重新部署 Apps Script。

通行碼僅留在目前頁面記憶體，不提交到 GitHub。重新整理後需重新輸入。成績保存在各瀏覽器 localStorage；匯出 CSV 可用於備份。接收程式依紀錄 ID 避免重複新增。

## 評分規準

初始配分為建議規準，並非官方競賽標準。五項配分可調整，合計須為 100 分。

## 檔案

- `index.html`：評分介面
- `app.js`：組別、評分、本機紀錄與 CSV
- `sheets.js`：Google 試算表連線與同步
- `GoogleSheets.gs`：Google Apps Script 接收程式
- `sheets-setup.html`：連線設定說明

本儲存庫不包含評分紀錄、通行碼或 Sites 平台憑證。
