// =============================================
// GLOBAL STATE
// =============================================
let currentPanel = 'code';
let escPressCount = 0;
let escTimer = null;
const HOUR_OFF = 18; // 18:01 shutdown

// =============================================
// CLOCK & WLB CHECK
// =============================================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clock-display').textContent = `${h}:${m}:${s}`;
  if (now.getHours() >= HOUR_OFF && now.getMinutes() >= 1) {
    showWlb();
  }
}
setInterval(updateClock, 1000);
updateClock();

function showWlb() {
  document.getElementById('wlb-modal').classList.add('show');
}
function closeWlb() {
  document.getElementById('wlb-modal').classList.remove('show');
}

// =============================================
// PANEL SWITCHING
// =============================================
function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => { p.style.display = 'none'; });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById('panel-' + name);
  if (panel) {
    panel.style.display = 'flex';
    currentPanel = name;
  }
  document.querySelector(`.nav-item[data-panel="${name}"]`)?.classList.add('active');

  if (name === 'excel') initExcel();
  if (name === 'build') startBuild();
  if (name === 'slack') initSlack();
  if (name === 'decoy') initDecoy();
}

// =============================================
// ESC × 3 SHRED
// =============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    escPressCount++;
    clearTimeout(escTimer);
    escTimer = setTimeout(() => { escPressCount = 0; }, 1500);
    if (escPressCount >= 3) {
      escPressCount = 0;
      triggerShred();
    }
  }
  // F-001 key trigger
  if (currentPanel === 'code' && e.key.length === 1) {
    triggerCodeTyping();
  }
});

function triggerShred() {
  const overlay = document.getElementById('shred-overlay');
  overlay.classList.add('show');
  const bar = document.getElementById('shred-bar');
  const log = document.getElementById('shred-log');
  const msgs = [
    'Deleting browser history...', 'Wiping localStorage...', 'Destroying spec documents...',
    'Removing all traces of JobSimulator DX...', 'Clearing cookies...', 'Shredding evidence...',
    'Overwriting sectors...', 'Complete. あとは逃げろ。'
  ];<overlap>
  'Overwriting sectors...', 'Complete. あとは逃げろ。'
  ];
</overlap>

<continue>
  let i = 0;
  bar.style.width = '0%';
  log.innerHTML = '';
  const interval = setInterval(() => {
    if (i < msgs.length) {
      const line = document.createElement('div');
      line.textContent = '> ' + msgs[i];
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      bar.style.width = ((i + 1) / msgs.length * 100) + '%';
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.remove('show');
        // reload to "wipe" state
        location.reload();
      }, 1500);
    }
  }, 400);
}

// =============================================
// F-001: HOLLYWOOD CODE PANEL
// =============================================
const codeSnippets = [
  `void exploit_buffer(char *input) {\n  char buf[64];\n  strcpy(buf, input); // ← 意図的脆弱性\n  printf("injected: %s\\n", buf);\n}`,
  `def quantum_sort(arr, ψ=0.5):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr)//2]\n    left = [x for x in arr if x < pivot]\n    right = [x for x in arr if x > pivot]\n    return quantum_sort(left) + [pivot] + quantum_sort(right)`,
  `class NeuralMatrix:\n    def __init__(self, layers):\n        self.W = [np.random.randn(l,r)*0.01\n                  for l,r in zip(layers,layers[1:])]\n    def forward(self, X):\n        for w in self.W: X = sigmoid(X@w)\n        return X`,
  `int main(void) {\n  // wagahai ha neko de aru. namae ha mada nai.\n  struct Neko *neko = malloc(sizeof(*neko));\n  neko->namae = NULL;\n  deploy(neko);\n  return 0;\n}`,
  `async function fetchQuantumData(endpoint) {\n  const res = await fetch(endpoint, {\n    headers: {'X-Quantum-Key': crypto.randomUUID()}\n  });\n  const data = await res.json();\n  return data.map(d => d * Math.PI);\n}`,
  `SELECT u.name, SUM(t.amount) AS total\nFROM users u\nJOIN transactions t ON t.user_id = u.id\nWHERE u.status = 'active'\nGROUP BY u.name\nHAVING total > 1000000\nORDER BY total DESC;`,
  `fn recursive_despair(depth: usize) -> String {\n    if depth == 0 { return "締切".to_string(); }\n    format!("未完了({})", recursive_despair(depth - 1))\n}`,
  `class BlockchainLedger:\n    def __init__(self):\n        self.chain = [self._genesis()]\n    def _genesis(self):\n        return {'index':0,'hash':sha256(b'wagahai').hexdigest()}\n    def add_block(self, data):\n        prev = self.chain[-1]['hash']\n        block = {'data':data,'prev':prev}\n        block['hash'] = sha256(str(block).encode()).hexdigest()\n        self.chain.append(block)`,
];

let codeBuffer = '';
let codeTypingInterval = null;
let currentSnippetIndex = 0;
let charIndex = 0;
let lineCount = 0;

function getNextChar() {
  const snippet = codeSnippets[currentSnippetIndex];
  if (charIndex >= snippet.length) {
    currentSnippetIndex = (currentSnippetIndex + 1) % codeSnippets.length;
    charIndex = 0;
    return '\n\n// ---\n\n';
  }
  return snippet[charIndex++];
}

function triggerCodeTyping() {
  if (codeTypingInterval) return;
  const display = document.getElementById('code-display');
  let burst = 0;
  const maxBurst = 80 + Math.floor(Math.random() * 120);
  codeTypingInterval = setInterval(() => {
    const ch = getNextChar();
    if (ch === '\n') {
      lineCount++;
      document.getElementById('line-count').textContent = lineCount;
    }
    codeBuffer += ch;
    // keep last 3000 chars
    if (codeBuffer.length > 3000) codeBuffer = codeBuffer.slice(-3000);
    display.textContent = codeBuffer;
    display.scrollTop = display.scrollHeight;
    burst++;
    if (burst >= maxBurst) {
      clearInterval(codeTypingInterval);
      codeTypingInterval = null;
      // Enter sound every 3rd burst
      if (Math.random() < 0.33) playEnter();
    }
  }, 18);
  playKeyClick();
}

// Auto demo typing loop
let autoDemoInterval = null;
function startAutoDemo() {
  if (autoDemoInterval) return;
  autoDemoInterval = setInterval(() => {
    if (currentPanel === 'code') triggerCodeTyping();
  }, 600);
}
startAutoDemo();

// =============================================
// F-002: EXCEL PANEL
// =============================================
function initExcel() {
  const grid = document.getElementById('excel-grid');
  if (grid.dataset.init) return;
  grid.dataset.init = '1';

  const COLS = 30;
  const ROWS = 60;
  const colHeaders = [''];
  for (let c = 0; c < COLS; c++) {
    colHeaders.push(colLabel(c));
  }

  const formulas = [
    '=VLOOKUP(A2,$M$1:$N$9999,2,FALSE)',
    '=IFERROR(INDEX($C$1:$C$999,MATCH(B3,$D$1:$D$999,0)),"")',
    '=SUMIFS($E$2:$E$9999,$F$2:$F$9999,">="&DATE(2024,1,1))',
    '=IF(AND(G2>0,H2<>0),G2/H2*100,"N/A")',
    '=CONCATENATE(LEFT(J2,3),"-",RIGHT(K2,4))',
    '=NETWORKDAYS(L2,TODAY())-1',
    '=AVERAGEIFS(P2:P999,Q2:Q999,"完了",R2:R999,">=80")',
    '=TEXT(S2,"yyyy/mm/dd")',
    '=ROUNDUP(T2*1.1,-2)',
    '=INDIRECT("Sheet"&U2&"!A1")',
  ];

  const statuses = ['完了','処理中','確認待','保留','却下','承認済','未着手'];
  const depts = ['営業部','開発部','総務部','企画部','経理部'];

  let html = '<table><thead><tr>';
  colHeaders.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';

  for (let r = 0; r < ROWS; r++) {
    const rowNum = r + 1;
    html += `<tr><td class="row-num">${rowNum}</td>`;
    for (let c = 0; c < COLS; c++) {
      const rand = Math.random();
      let content = '';
      let cls = '';
      if (r === 0) {
        // header row
        const headers = ['案件ID','担当者','部署','売上(円)','ステータス','予算','実績','達成率','備考','期日','承認者','コスト','粗利','税込','前年比','評価','区分','フラグ','更新日','担当2','CC','優先度','工数','残日','完了%','リスク','版数','ロケール','備考2','チェック'];
        content = headers[c] || '';
        cls = 'header-cell';
      } else if (c === 0) {
        content = `案件-${String(rowNum).padStart(4,'0')}`;
      } else if (c === 2) {
        content = depts[rowNum % depts.length];
      } else if (c === 4) {
        const s = statuses[rowNum % statuses.length];
        cls = s === '完了' ? 'cell-green' : s === '却下' ? 'cell-red' : s === '保留' ? 'cell-yellow' : '';
        content = s;
      } else if (rand < 0.15) {
        content = formulas[(r + c) % formulas.length];
        cls = 'cell-formula';
      } else if (rand < 0.4) {
        content = Math.floor(Math.random() * 9999999 + 10000).toLocaleString();
        cls = 'cell-num';
      } else if (rand < 0.55) {
        const y = 2023 + (rowNum % 2);
        const mo = String((rowNum % 12) + 1).padStart(2,'0');
        const d = String((c % 28) + 1).padStart(2,'0');
        content = `${y}/${mo}/${d}`;
      } else if (rand < 0.65) {
        content = `${Math.floor(Math.random()*100)}%`;
        cls = parseFloat(content) >= 80 ? 'cell-green' : parseFloat(content) < 50 ? 'cell-red' : 'cell-yellow';
      } else {
        content = '';
      }
      html += `<td class="${cls}">${escHtml(content)}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  grid.innerHTML = html;
}

function colLabel(n) {
  let s = '';
  n++;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// =============================================
// F-003: BUILD PANEL
// =============================================
const buildMessages = [
  '[INFO] Initializing build pipeline...',
  '[INFO] Loading webpack config...',
  '[WARN] Deprecated option: mode=legacy',
  '[INFO] Resolving 2847 modules...',
  '[OK]   Entry: ./src/index.ts',
  '[INFO] Compiling TypeScript (strict mode)...',
  '[INFO] Running ESLint (0 errors, 14 warnings ignored)',
  '[INFO] Bundling assets...',
  '[INFO] Optimizing chunks...',
  '[INFO] Tree-shaking dead code (removing 847 unused exports)...',
  '[OK]   Bundle size: 4.2MB (gzip: 1.1MB)',
  '[INFO] Running unit tests... (2847/2848 passed)',
  '[WARN] 1 test skipped: "TODO: fix this someday"',
  '[INFO] Building Docker image layer 1/14...',
  '[INFO] Building Docker image layer 2/14...',
  '[INFO] Building Docker image layer 3/14...',
  '[INFO] Building Docker image layer 4/14...',
  '[INFO] Building Docker image layer 5/14...',
  '[INFO] Building Docker image layer 6/14...',
  '[INFO] Building Docker image layer 7/14...',
  '[INFO] Building Docker image layer 8/14...',
  '[INFO] Building Docker image layer 9/14...',
  '[INFO] Building Docker image layer 10/14...',
  '[INFO] Building Docker image layer 11/14...',
  '[INFO] Building Docker image layer 12/14...',
  '[INFO] Building Docker image layer 13/14...',
  '[INFO] Building Docker image layer 14/14...',
  '[OK]   Docker image built: jobsim-dx:latest (sha256:a1b2c3d4e5f6...)',
  '[INFO] Pushing to registry...',
  '[INFO] Deploying to staging-cluster-ap-northeast-1...',
  '[INFO] Rolling update: 0/3 pods ready',
  '[INFO] Rolling update: 1/3 pods ready',
  '[INFO] Rolling update: 2/3 pods ready',
  '[INFO] Rolling update: 3/3 pods ready',
  '[OK]   Deployment successful (canary: 10%)',
  '[INFO] Running smoke tests...',
  '[OK]   Health check: /api/health → 200 OK',
  '[INFO] Monitoring metrics (1m window)...',
  '[OK]   Error rate: 0.001%  Latency p99: 42ms',
  '[INFO] Promoting canary to 100%...',
  '[OK]   🚀 DEPLOY COMPLETE',
  '[INFO] Sleeping 30s before next cycle...',
  '',
  '> Re-initializing build pipeline...',
];

let buildInterval = null;
let buildMsgIndex = 0;
let buildRunning = false;
let buildCycleCount = 0;

function startBuild() {
  if (buildRunning) return;
  buildRunning = true;
  const log = document.getElementById('build-log');
  buildInterval = setInterval(() => {
    const msg = buildMessages[buildMsgIndex % buildMessages.length];
    buildMsgIndex++;
    if (buildMsgIndex % buildMessages.length === 0) {
      buildCycleCount++;
      document.getElementById('build-cycle').textContent = buildCycleCount;
    }
    const line = document.createElement('div');
    line.className = 'build-line';
    if (msg.startsWith('[OK]')) line.classList.add('ok');
    else if (msg.startsWith('[WARN]')) line.classList.add('warn');
    else if (msg.startsWith('[ERR]')) line.classList.add('err');
    line.textContent = `[${timestamp()}] ${msg}`;
    log.appendChild(line);
    // keep max 200 lines
    while (log.children.length > 200) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
    document.getElementById('build-lines').textContent = parseInt(document.getElementById('build-lines').textContent || '0') + 1;
  }, 220);
}

function timestamp() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`;
}

// =============================================
// F-004 / BOSS SENSOR
// =============================================
let bossStream = null;
let bossDetector = null;

function triggerBossAlert() {
  const overlay = document.getElementById('boss-overlay');
  overlay.classList.add('show');
  setTimeout(() => { overlay.classList.remove('show'); }, 150);
  showDecoy();
}

function showDecoy() {
  switchPanel('decoy');
}

async function startBossCam() {
  const status = document.getElementById('cam-status');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    bossStream = stream;
    status.textContent = 'カメラ: ON (監視中...)';
    status.style.color = '#4caf50';
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.style.display = 'none';
    document.body.appendChild(video);

    // Simple motion detection via pixel diff
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 120;
    const ctx = canvas.getContext('2d');
    let prevData = null;

    bossDetector = setInterval(() => {
      ctx.drawImage(video, 0, 0, 160, 120);
      const curr = ctx.getImageData(0, 0, 160, 120).data;
      if (prevData) {
        let diff = 0;
        for (let i = 0; i < curr.length; i += 4) {
          diff += Math.abs(curr[i] - prevData[i]);
        }
        const avg = diff / (curr.length / 4);
        if (avg > 15) {
          triggerBossAlert();
        }
      }
      prevData = curr.slice();
    }, 300);
  } catch(e) {
    status.textContent = 'カメラ: エラー (許可が必要)';
    status.style.color = '#f44';
  }
}

// =============================================
// DECOY PANEL
// =============================================
function initDecoy() {
  // already rendered as static HTML
}

function setDecoy(type) {
  document.querySelectorAll('.decoy-option').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  const frame = document.getElementById('decoy-frame');
  if (type === 'nikkei') {
    frame.innerHTML = buildFakeNikkei();
  } else {
    frame.innerHTML = buildFakePortal();
  }
}

function buildFakeNikkei() {
  const headlines = [
    '日経平均、3万9000円台で推移 — 半導体関連が牽引',
    '米FRB、利下げ判断を先送り — 雇用統計が予想上回る',
    'トヨタ、EV新型モデルを2025年に投入 — 国内販売は堅調',
    'デジタル庁、マイナ保険証の普及率が80%超に',
    '中国・恒大、再建計画を発表 — 市場は慎重な見方',
    '生成AI市場規模、2030年に100兆円超の見通し',
    'サイバー攻撃被害、過去最多 — 中小企業の対策急務',
    '日銀、追加利上げを検討 — 為替は1ドル148円台',
  ];
  return `<div style="font-family:'Noto Serif JP',serif;background:#fff;color:#111;padding:16px;height:100%;overflow:auto;">
    <div style="border-bottom:3px solid #c00;padding-bottom:8px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
      <span style="font-weight:900;font-size:22px;color:#c00;">日本経済新聞</span>
      <span style="font-size:11px;color:#666;margin-left:auto;">${new Date().toLocaleDateString('ja-JP')} 電子版</span>
    </div>
    ${headlines.map((h,i) => `<div style="padding:10px 0;border-bottom:1px solid #eee;display:flex;gap:10px;align-items:start;">
      <span style="font-size:10px;color:#c00;white-space:nowrap;padding-top:2px;">${['マーケット','政治','企業','テクノロジー','国際','IT','セキュリティ','金融'][i]}</span>
      <span style="font-size:13px;font-weight:${i<2?'700':'400'};line-height:1.5;cursor:pointer;">${h}</span>
    </div>`).join('')}
  </div>`;
}

function buildFakePortal() {
  return `<div style="font-family:Arial,sans-serif;background:#f4f4f4;height:100%;overflow:auto;">
    <div style="background:#003c7e;color:#fff;padding:10px 16px;font-size:14px;font-weight:bold;">
      社内ポータル &nbsp;|&nbsp; <span style="font-weight:normal;font-size:12px;">ようこそ、社員の皆様</span>
    </div>
    <div style="padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="background:#fff;border:1px solid #ddd;border-radius:4px;padding:10px;">
        <div style="font-size:12px;font-weight:bold;color:#003c7e;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:8px;">📢 お知らせ</div>
        <div style="font-size:11px;line-height:1.8;color:#333;">
          ・全社MTG 6/15(水) 14:00〜 (必須参加)<br>
          ・経費精算システム メンテ 6/20 0:00〜4:00<br>
          ・健康診断申込締切 6/30まで<br>
          ・夏季休暇取得推奨期間 8/10〜8/18
        </div>
      </div>
      <div style="background:#fff;border:1px solid #ddd;border-radius:4px;padding:10px;">
        <div style="font-size:12px;font-weight:bold;color:#003c7e;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:8px;">📅 今日の予定</div>
        <div style="font-size:11px;line-height:1.8;color:#333;">
          10:00 朝会 (Zoom)<br>
          13:00 ランチ<br>
          15:00 進捗報告 MTG<br>
          17:00 1on1 (マネージャー)
        </div>
      </div>
      <div style="background:#fff;border:1px solid #ddd;border-radius:4px;padding:10px;grid-column:span 2;">
        <div style="font-size:12px;font-weight:bold;color:#003c7e;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:8px;">📊 KPI ダッシュボード（Q2）</div>
        <div style="display:flex;gap:16px;">
          ${[['売上達成率','87%','#4caf50'],['タスク消化率','62%','#ff9800'],['顧客満足度','4.2/5.0','#2196f3'],['稼働率','94%','#9c27b0']].map(([k,v,c]) =>
            `<div style="flex:1;text-align:center;"><div style="font-size:10px;color:#666;">${k}</div><div style="font-size:20px;font-weight:bold;color:${c};">${v}</div></div>`
          ).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// =============================================
// SLACK PANEL
// =============================================
const buzzwords = [
  'アライン','シナジー','コンセンサス','アジャイル','スケール','ピボット','バリュー','コミット',
  'オンボード','エンゲージメント','KPI','ROI','ステークホルダー','ベストプラクティス',
  'イノベーション','DX推進','ナレッジ共有','ボトルネック','ペインポイント','クイックウィン'
];
const phrases = [
  'については、一旦ペンディングでお願いします。',
  'の件、アグリーです。ボールをお戻しします。',
  'についてはコンセンサスを取ってからMTGセットしましょう。',
  'の観点からリスクヘッジをしっかりやっていきたいと思います。',
  'については全体最適の観点でブラッシュアップが必要かと。',
  'はいったんホールドして、来週アライメントしましょう。',
  'のバリューをしっかりステークホルダーに伝えていきたいですね。',
  'についてはコミットできますが、スコープのすり合わせが先かと思います。',
];
const senders = ['田中（PM）','佐藤さん','山田マネ','鈴木@企画','上司','同僚A','隣の部署の人','謎のCC'];

let slackInterval = null;
let slackRunning = false;
function initSlack() {
  if (slackRunning) return;
  slackRunning = true;
  const feed = document.getElementById('slack-feed');
  function addMessage(manual = false) {
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const bw1 = buzzwords[Math.floor(Math.random() * buzzwords.length)];
    const bw2 = buzzwords[Math.floor(Math.random() * buzzwords.length)];
    const ph = phrases[Math.floor(Math.random() * phrases.length)];
    const msg = `${bw1}と${bw2}${ph}`;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const item = document.createElement('div');
    item.className = 'slack-msg' + (manual ? ' manual' : '');
    item.innerHTML = `<div class="slack-sender">${escHtml(sender)} <span class="slack-time">${time}</span></div><div class="slack-text">${escHtml(msg)}</div>`;
    feed.appendChild(item);
    while (feed.children.length > 30) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
  }
  // Initial messages
  for (let i = 0; i < 5; i++) addMessage();
  slackInterval = setInterval(() => addMessage(), 8000 + Math.random() * 12000);
  document.getElementById('slack-send-btn').addEventListener('click', () => {
    addMessage(true);
    document.getElementById('slack-input').value = generateAutoReply();
  });
}

function generateAutoReply() {
  const bw = buzzwords[Math.floor(Math.random() * buzzwords.length)];
  const ph = phrases[Math.floor(Math.random() * phrases.length)];
  return bw + ph;
}

function randomReply() {
  document.getElementById('slack-input').value = generateAutoReply();
}

// =============================================
// MOUSE JIGGLER
// =============================================
let jigglerTimer = null;
let jigglerRunning = false;

function toggleJiggler() {
  jigglerRunning = !jigglerRunning;
  const btn = document.getElementById('jiggler-btn');
  const status = document.getElementById('jiggler-status');
  if (jigglerRunning) {
    btn.textContent = '🛑 ジグラー停止';
    btn.style.background = '#c62828';
    status.textContent = '稼働中 — Slackを緑に保持中...';
    status.style.color = '#4caf50';
    // We can't actually move the OS cursor from JS, but we simulate
    // by dispatching mousemove events and logging
    jigglerTimer = setInterval(() => {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const log = document.getElementById('jiggler-log');
      const line = document.createElement('div');
      line.style.cssText = 'font-size:10px;color:#4caf50;font-family:monospace;';
      line.textContent = `[${timestamp()}] MOVE Δ(${x.toFixed(3)}, ${y.toFixed(3)}) — STATUS: 🟢 ONLINE`;
      log.appendChild(line);
      while (log.children.length > 20) log.removeChild(log.firstChild);
      log.scrollTop = log.scrollHeight;
    }, 3000 + Math.random() * 2000);
  } else {
    clearInterval(jigglerTimer);
    btn.textContent = '🖱️ ジグラー起動';
    btn.style.background = '#1565c0';
    status.textContent = '停止中';
    status.style.color = '#888';
  }
}

// =============================================
// KEYBOARD SOUND (Web Audio API)
// =============================================
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playKeyClick() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

function playEnter() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.6;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

// Keyboard sound panel toggle
let kbSoundOn = false;
let kbAutoInterval = null;
function toggleKeyboardSound() {
  kbSoundOn = !kbSoundOn;
  const btn = document.getElementById('kb-sound-btn');
  const status = document.getElementById('kb-sound-status');
  if (kbSoundOn) {
    btn.textContent = '🔇 キー
ボード音 停止';
    btn.style.background = '#c62828';
    status.textContent = '稼働中 — カタカタ音を再生中...';
    status.style.color = '#4caf50';
    // Auto-play keyboard sounds at random intervals
    function scheduleNext() {
      if (!kbSoundOn) return;
      const delay = 80 + Math.random() * 200;
      kbAutoInterval = setTimeout(() => {
        playKeyClick();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    // Enter sound every 3 minutes
    kbEnterInterval = setInterval(() => {
      if (kbSoundOn) playEnter();
    }, 180000);
  } else {
    clearTimeout(kbAutoInterval);
    clearInterval(kbEnterInterval);
    btn.textContent = '⌨️ キーボード音 起動';
    btn.style.background = '#1565c0';
    status.textContent = '停止中';
    status.style.color = '#888';
  }
}
let kbEnterInterval = null;

// =============================================
// SIGH VOICE (S-002)
// =============================================
let sighOn = false;
let sighTimer = null;
const sighPhrases = [
  'うーん、アーキテクチャがな…',
  '根本から見直すか…',
  'このロジック、技術的負債になるんだよな…',
  'スケーラビリティの問題が…',
  'なんでここがボトルネックになってるんだ…',
  'リファクタリングしないとまずいな…',
  'ドメイン設計を間違えたかもしれない…',
  'マイクロサービス化を検討すべきか…',
];

function toggleSigh() {
  sighOn = !sighOn;
  const btn = document.getElementById('sigh-btn');
  const status = document.getElementById('sigh-status');
  if (sighOn) {
    btn.textContent = '🔇 ため息 停止';
    btn.style.background = '#c62828';
    status.textContent = '稼働中 — 知的独り言を生成中...';
    status.style.color = '#4caf50';
    scheduleSigh();
  } else {
    clearTimeout(sighTimer);
    btn.textContent = '😤 ため息ボイス 起動';
    btn.style.background = '#6a1b9a';
    status.textContent = '停止中';
    status.style.color = '#888';
  }
}

function scheduleSigh() {
  if (!sighOn) return;
  const delay = (15 + Math.random() * 15) * 60 * 1000; // 15〜30分
  // For demo, use shorter interval: 20-40 seconds
  const demoDelay = (20 + Math.random() * 20) * 1000;
  sighTimer = setTimeout(() => {
    if (!sighOn) return;
    const phrase = sighPhrases[Math.floor(Math.random() * sighPhrases.length)];
    speakPhrase(phrase);
    const log = document.getElementById('sigh-log');
    const line = document.createElement('div');
    line.style.cssText = 'font-size:11px;color:#ce93d8;font-family:monospace;margin:2px 0;';
    line.textContent = `[${timestamp()}] 💭 "${phrase}"`;
    log.appendChild(line);
    while (log.children.length > 10) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
    scheduleSigh();
  }, demoDelay);
}

function speakPhrase(text) {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.volume = 0.3;
    utter.rate = 0.85;
    utter.pitch = 0.9;
    window.speechSynthesis.speak(utter);
  } catch(e) {}
}

// =============================================
// SLACK AUTO-REPLY GENERATOR (C-001)
// =============================================
const buzzwords = {
  agree: ['アグリーです','それはアライメントが取れています','コンセンサスを得られそうです','全体最適の観点から賛成です'],
  delay: ['一旦ペンディングさせてください','ボールをお返しします','持ち帰って検討します','次のスプリントで対応します'],
  action: ['アクションアイテムとして起票します','タスク化してトラッキングします','オーナーシップを持って対応します','ステークホルダーと調整します'],
  buzzword: ['シナジーを創出し','バリューを最大化して','PDCAを回しながら','KPIをドライブして'],
  closing: ['よろしくお願いします🙏','引き続きよろしくです！','ご確認ください🙇','ご検討のほどよろしくお願いします'],
};

function generateReply() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const reply = `${pick(buzzwords.buzzword)}、${pick(buzzwords.agree)}。${pick(buzzwords.action)}ので、${pick(buzzwords.delay)}。${pick(buzzwords.closing)}`;
  document.getElementById('slack-output').textContent = reply;
}

function copyReply() {
  const text = document.getElementById('slack-output').textContent;
  if (!text || text === '↑ ボタンを押して返信を生成') return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✅ コピー完了！';
    setTimeout(() => btn.textContent = '📋 コピー', 2000);
  });
}

// =============================================
// BOSS SENSOR (F-004) — using webcam + MediaPipe placeholder
// =============================================
let bossSensorOn = false;
let bossVideoStream = null;
let bossDetectInterval = null;
let bossAlertActive = false;

async function toggleBossSensor() {
  bossSensorOn = !bossSensorOn;
  const btn = document.getElementById('boss-btn');
  const status = document.getElementById('boss-status');
  if (bossSensorOn) {
    btn.textContent = '🛑 センサー停止';
    btn.style.background = '#c62828';
    status.textContent = '起動中 — カメラアクセスを要求中...';
    status.style.color = '#ffeb3b';
    try {
      bossVideoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      const video = document.getElementById('boss-video');
      video.srcObject = bossVideoStream;
      video.play();
      status.textContent = '監視中 — 背後に注意...';
      status.style.color = '#4caf50';
      startBossDetection();
    } catch(e) {
      status.textContent = 'カメラアクセス拒否 — シミュレーションモードで動作';
      status.style.color = '#ff7043';
      startBossSimulation();
    }
  } else {
    stopBossSensor();
    btn.textContent = '👀 ボスセンサー 起動';
    btn.style.background = '#e65100';
    status.textContent = '停止中';
    status.style.color = '#888';
  }
}

function stopBossSensor() {
  if (bossVideoStream) {
    bossVideoStream.getTracks().forEach(t => t.stop());
    bossVideoStream = null;
  }
  clearInterval(bossDetectInterval);
  bossSensorOn = false;
}

function startBossDetection() {
  // Simplified motion detection using canvas diff
  const video = document.getElementById('boss-video');
  const canvas = document.getElementById('boss-canvas');
  const ctx = canvas.getContext('2d');
  let lastFrame = null;

  bossDetectInterval = setInterval(() => {
    if (!bossSensorOn) return;
    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);
    const frame = ctx.getImageData(0, 0, 160, 120);
    if (lastFrame) {
      let diff = 0;
      for (let i = 0; i < frame.data.length; i += 4) {
        diff += Math.abs(frame.data[i] - lastFrame.data[i]);
      }
      const avgDiff = diff / (frame.data.length / 4);
      updateBossRadar(avgDiff);
      if (avgDiff > 15 && !bossAlertActive) {
        triggerBossAlert();
      }
    }
    lastFrame = frame;
  }, 200);
}

function startBossSimulation() {
  // Random simulation mode
  bossDetectInterval = setInterval(() => {
    if (!bossSensorOn) return;
    const fakeDiff = Math.random() * 8;
    updateBossRadar(fakeDiff);
  }, 500);
}

function updateBossRadar(level) {
  const bar = document.getElementById('boss-radar-bar');
  const label = document.getElementById('boss-radar-label');
  const pct = Math.min(100, (level / 30) * 100);
  bar.style.width = pct + '%';
  bar.style.background = pct > 50 ? '#f44336' : pct > 25 ? '#ff9800' : '#4caf50';
  label.textContent = pct > 50 ? '⚠️ 接近検知！' : pct > 25 ? '👁️ 動体あり' : '✅ 安全';
}

function triggerBossAlert() {
  bossAlertActive = true;
  // Flash overlay
  const overlay = document.getElementById('boss-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
    bossAlertActive = false;
  }, 2000);
}

// =============================================
// WORK HOURS ENFORCEMENT
// =============================================
function checkWorkHours() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;
  const start = 9 * 60;
  const end = 18 * 60 + 1;
  if (totalMin >= end || totalMin < start) {
    showOvertimeModal();
  }
}

function showOvertimeModal() {
  document.getElementById('overtime-modal').style.display = 'flex';
}

function dismissOvertimeModal() {
  document.getElementById('overtime-modal').style.display = 'none';
}

// =============================================
// EMERGENCY ESCAPE (ESC x3)
// =============================================
let escCount = 0;
let escTimer = null;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    escCount++;
    clearTimeout(escTimer);
    escTimer = setTimeout(() => { escCount = 0; }, 1000);
    if (escCount >= 3) {
      triggerEmergencyEscape();
      escCount = 0;
    }
  }
  // Any key triggers code typewriter effect
  if (activeScreen === 'code') {
    typeNextCodeChar();
  }
});

function triggerEmergencyEscape() {
  const modal = document.getElementById('escape-modal');
  modal.style.display = 'flex';
  // Simulate shredder animation
  let count = 0;
  const shredder = document.getElementById('shredder-progress');
  const interval = setInterval(() => {
    count += Math.random() * 15;
    shredder.style.width = Math.min(100, count) + '%';
    if (count >= 100) {
      clearInterval(interval);
      document.getElementById('shredder-status').textContent = '✅ 完全抹消完了';
    }
  }, 100);
}

function closeEscapeModal() {
  document.getElementById('escape-modal').style.display = 'none';
  document.getElementById('shredder-progress').style.width = '0%';
  document.getElementById('shredder-status').textContent = '抹消中...';
}

// =============================================
// INIT
// =============================================
window.addEventListener('load', () => {
  showScreen('dashboard');
  checkWorkHours();
  // Start build log automatically
  startBuildLog();
  // Clock
  setInterval(() => {
    document.getElementById('clock').textContent = new Date().toLocaleTimeString('ja-JP');
  }, 1000);
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('ja-JP');
});

function startBuildLog() {
  buildLogRunning = true;
  scheduleBuildLine();
}