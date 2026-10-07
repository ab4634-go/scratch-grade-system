// 在成績試算表的「擴充功能 → Apps Script」貼上此程式。
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const TAB = '評分紀錄';
const GROUPS = ['國小動畫 AI 互動組','國小遊戲 AI 互動組','國中生活 AI 互動組','國中 AI 智慧生活組'];
const ALLOWED_ORIGINS = ['https://YOUR_SITE_DOMAIN','http://127.0.0.1:8123'];
function setup() {
  const props = PropertiesService.getScriptProperties();
  let code = props.getProperty('SCORING_ACCESS_CODE');
  if (!code) { code = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('SCORING_ACCESS_CODE',code); }
  SpreadsheetApp.openById(SPREADSHEET_ID).setSpreadsheetTimeZone('Asia/Taipei');
  console.log('請將以下評分通行碼輸入評分系統的 Google 試算表連線設定，並僅分享給評分者：\n'+code);
}
function doGet() { return HtmlService.createHtmlOutput('Scratch 成績接收程式已部署。請由評分系統送出成績。'); }
function doPost(e) {
  let p = {}, result;
  try {
    if (!e.parameter.payload || e.parameter.payload.length > 20000) throw new Error('資料格式錯誤');
    p = JSON.parse(e.parameter.payload);
    if (!ALLOWED_ORIGINS.includes(p.origin)) throw new Error('不允許的網站');
    const code=PropertiesService.getScriptProperties().getProperty('SCORING_ACCESS_CODE');
    if (!code || p.code !== code) throw new Error('評分通行碼錯誤，請重新設定');
    if (!/^[a-zA-Z0-9-]{10,100}$/.test(p.requestId||'')) throw new Error('請求格式錯誤');
    const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TAB);
    if (!sh || sh.getRange('A1').getValue()!=='紀錄ID') throw new Error('成績表欄位已變更');
    if (p.action==='check') result={ok:true,message:'已確認成績試算表連線'};
    else {
      const r=p.record;
      if (!r || !/^[a-zA-Z0-9-]{10,100}$/.test(r.id||'') || !GROUPS.includes(r.group)) throw new Error('紀錄或組別無效');
      ['judge','entry','title'].forEach(k=>{if(typeof r[k]!=='string'||!r[k].trim()||r[k].length>150)throw new Error('作品資料不完整');});
      if (!Array.isArray(r.weights)||r.weights.length!==5||!r.weights.every(n=>Number.isInteger(n)&&n>=0&&n<=100)||r.weights.reduce((a,b)=>a+b,0)!==100)throw new Error('配分無效');
      if(!Array.isArray(r.scores)||r.scores.length!==5||!r.scores.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=r.weights[i]))throw new Error('分數超出範圍');
      const time=new Date(r.time);if(!Number.isFinite(time.getTime()))throw new Error('時間格式無效');
      if(typeof r.feedback!=='string'||r.feedback.length>3000||typeof r.url!=='string'||r.url.length>2000||(r.url&&!/^https?:\/\//i.test(r.url)))throw new Error('評語或作品連結無效');
      const lock=LockService.getScriptLock();lock.waitLock(20000);
      try {
        const duplicate=sh.getLastRow()>1&&sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(r.id).matchEntireCell(true).findNext();
        if (!duplicate) {
          const row=sh.getLastRow()+1;
          const text=s=>/^[\s]*[=+@-]/.test(String(s))?"'"+s:String(s);
          sh.getRange(row,1,1,20).setValues([[r.id,r.group,text(r.entry),text(r.title),text(r.judge),...r.scores,r.scores.reduce((a,b)=>a+b,0),text(r.feedback),text(r.url),time,...r.weights,new Date()]]);
          sh.getRange(row,14).setNumberFormat('yyyy-mm-dd hh:mm:ss');sh.getRange(row,20).setNumberFormat('yyyy-mm-dd hh:mm:ss');SpreadsheetApp.flush();
        }
        result={ok:true,id:r.id,message:duplicate?'此筆成績已存在':'成績已寫入 Google 試算表'};
      } finally {lock.releaseLock();}
    }
  } catch(err) { result={ok:false,message:err.message}; }
  const response=JSON.stringify({type:'scratch-sheet-result',requestId:p.requestId,...result}).replace(/</g,'\\u003c');
  const origin=ALLOWED_ORIGINS.includes(p.origin)?p.origin:ALLOWED_ORIGINS[0];
  return HtmlService.createHtmlOutput('<script>window.top.postMessage('+response+','+JSON.stringify(origin)+');</script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
