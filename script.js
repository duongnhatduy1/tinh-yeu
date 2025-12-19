// ====== Helpers ======
const $ = (sel) => document.querySelector(sel);
const rand = (a, b) => a + Math.random() * (b - a);

const intro = $("#intro");
const main = $("#main");
const result = $("#result");

const startBtn = $("#startBtn");
const musicBtn = $("#musicBtn");
const nextBtn = $("#nextBtn");
const confettiBtn = $("#confettiBtn");
const sparkBtn = $("#sparkBtn");
const heartBtn = $("#heartBtn");

const yesBtn = $("#yesBtn");
const noBtn = $("#noBtn");
const btnRow = $("#btnRow");

const typeText = $("#typeText");
const bgm = $("#bgm");

// ====== Typewriter ======
const messages = [
  "Tớ đã suy nghĩ rất lâu trước khi làm trang web này…",
  "Vì tớ muốn nói một cách thật đặc biệt: tớ thích Kim Ngân nhiều lắm 💖",
  "Tớ thích nụ cười của Ngân, thích cách Ngân nói chuyện, và cả những điều nhỏ xíu Ngân làm.",
  "Nếu Ngân cho phép… tớ muốn được ở bên cạnh Ngân, quan tâm và làm Ngân vui mỗi ngày.",
  "Vậy… Kim Ngân có đồng ý làm người yêu tớ không? 🥺"
];

let msgIndex = 0;
let charIndex = 0;
let typing = false;

function typeOneMessage(text, speed = 26) {
  typing = true;
  typeText.textContent = "";
  charIndex = 0;

  const tick = () => {
    typeText.textContent = text.slice(0, charIndex++);
    if (charIndex <= text.length) {
      setTimeout(tick, speed);
    } else {
      typing = false;
    }
  };
  tick();
}

function playNextMessage() {
  if (typing) return;
  typeOneMessage(messages[msgIndex]);
  msgIndex = Math.min(msgIndex + 1, messages.length - 1);
}

// ====== Canvas FX (stars + fireworks + hearts) ======
const canvas = $("#fx");
const ctx = canvas.getContext("2d");

let W, H, dpr;
function resize() {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = canvas.width = Math.floor(window.innerWidth * dpr);
  H = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1,0,0,1,0,0);
}
window.addEventListener("resize", resize);
resize();

const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: rand(0.6, 1.6),
  a: rand(0.12, 0.6),
  tw: rand(0.002, 0.008)
}));

let particles = [];
let hearts = [];
let confettis = [];

function addFirework(x, y) {
  const count = 90;
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count;
    const sp = rand(1.2, 4.2) * dpr;
    particles.push({
      x, y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      life: rand(40, 80),
      age: 0,
      // color as HSL
      h: rand(260, 360),
      s: rand(70, 100),
      l: rand(55, 75)
    });
  }
}

function addHeart() {
  hearts.push({
    x: rand(0.1, 0.9) * W,
    y: H + 20 * dpr,
    vy: rand(0.8, 1.6) * dpr,
    size: rand(10, 22) * dpr,
    sway: rand(0.6, 1.6) * dpr,
    t: rand(0, 999)
  });
}

function addConfettiBurst() {
  const x = rand(0.2, 0.8) * W;
  const y = rand(0.15, 0.35) * H;
  const n = 120;
  for (let i = 0; i < n; i++) {
    confettis.push({
      x, y,
      vx: rand(-3.2, 3.2) * dpr,
      vy: rand(-5.5, -1.2) * dpr,
      g: rand(0.08, 0.16) * dpr,
      w: rand(4, 9) * dpr,
      h: rand(6, 14) * dpr,
      r: rand(0, Math.PI),
      vr: rand(-0.12, 0.12),
      life: rand(70, 120),
      age: 0
    });
  }
}

function drawHeart(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 18, size / 18);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-10, -2, -18, 8, 0, 20);
  ctx.bezierCurveTo(18, 8, 10, -2, 0, 6);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 120, 170, 0.80)";
  ctx.fill();
  ctx.restore();
}

function loop() {
  ctx.clearRect(0, 0, W, H);

  // stars
  for (const s of stars) {
    s.a += Math.sin(performance.now() * s.tw) * 0.002;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, Math.min(0.8, s.a))})`;
    ctx.fill();
  }

  // fireworks particles
  particles = particles.filter(p => p.age < p.life);
  for (const p of particles) {
    p.age++;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.vy += 0.015 * dpr;

    const alpha = 1 - p.age / p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.h},${p.s}%,${p.l}%,${alpha})`;
    ctx.fill();
  }

  // hearts float
  hearts = hearts.filter(h => h.y > -50 * dpr);
  for (const h of hearts) {
    h.t += 0.02;
    h.y -= h.vy;
    h.x += Math.sin(h.t) * h.sway * 0.15;
    drawHeart(h.x, h.y, h.size);
  }

  // confetti
  confettis = confettis.filter(c => c.age < c.life);
  for (const c of confettis) {
    c.age++;
    c.x += c.vx;
    c.y += c.vy;
    c.vy += c.g;
    c.r += c.vr;
    const alpha = 1 - c.age / c.life;

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);
    ctx.globalAlpha = alpha;
    // màu ngẫu nhiên bằng HSL
    const hue = (c.age * 4 + c.x / 10) % 360;
    ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
    ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
    ctx.restore();
  }

  requestAnimationFrame(loop);
}
loop();

// ====== UI logic ======
function showMain() {
  intro.classList.add("hidden");
  main.classList.remove("hidden");
  playNextMessage();
  // vài trái tim “mở màn”
  for (let i = 0; i < 10; i++) addHeart();
}

function toggleMusic() {
  if (!bgm) return;
  if (bgm.paused) {
    bgm.play().catch(()=>{});
    musicBtn.textContent = "🔊 Nhạc";
  } else {
    bgm.pause();
    musicBtn.textContent = "🎵 Nhạc";
  }
}

startBtn.addEventListener("click", () => {
  showMain();
  // bật nhạc nếu được
  bgm.play().then(() => (musicBtn.textContent = "🔊 Nhạc")).catch(()=>{});
});

musicBtn.addEventListener("click", toggleMusic);

nextBtn.addEventListener("click", () => {
  if (typing) return;
  if (msgIndex < messages.length) playNextMessage();
  else typeOneMessage(messages[messages.length - 1]);
});

confettiBtn.addEventListener("click", () => addConfettiBurst());
sparkBtn.addEventListener("click", () => addFirework(rand(0.2,0.8)*W, rand(0.2,0.5)*H));
heartBtn.addEventListener("click", () => { for (let i=0;i<6;i++) addHeart(); });

// Click anywhere tạo pháo hoa nhẹ (cho vui)
window.addEventListener("click", (e) => {
  // tránh click vào nút
  if (e.target.closest("button")) return;
  addFirework(e.clientX * dpr, e.clientY * dpr);
});

// ====== "No" button dodge ======
let noCount = 0;
noBtn.addEventListener("mouseenter", () => {
  noCount++;
  const rect = btnRow.getBoundingClientRect();
  const nx = rand(0, rect.width - 120);
  const ny = rand(-10, 60);
  noBtn.style.position = "relative";
  noBtn.style.left = `${nx}px`;
  noBtn.style.top = `${ny}px`;

  if (noCount === 2) $("#hintText").textContent = "(* Nút “Không” đang run… 😳)";
  if (noCount === 4) $("#hintText").textContent = "(* Hình như nút này… không muốn làm Ngân buồn 🥺)";
});

// mobile tap
noBtn.addEventListener("click", () => {
  noCount++;
  addHeart();
  addFirework(rand(0.35,0.65)*W, rand(0.25,0.45)*H);
});

// ====== Yes flow ======
const resultText = $("#resultText");
const downloadBtn = $("#downloadBtn");
const restartBtn = $("#restartBtn");

yesBtn.addEventListener("click", () => {
  // big celebration
  for (let i=0;i<4;i++) addConfettiBurst();
  for (let i=0;i<3;i++) addFirework(rand(0.25,0.75)*W, rand(0.18,0.45)*H);
  for (let i=0;i<18;i++) addHeart();

  resultText.textContent =
    "Từ giờ, tớ xin phép được thương Kim Ngân một cách chính thức 😳💖 " +
    "Cảm ơn Ngân đã cho tớ cơ hội!";

  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

// ====== Download a love letter (.txt) ======
downloadBtn.addEventListener("click", () => {
  const content =
`Gửi Thạch Kim Ngân,

Tớ làm trang web này để nói một điều:
Tớ thích Ngân thật nhiều.

Tớ muốn được ở bên Ngân, quan tâm Ngân,
và cùng Ngân tạo ra nhiều kỷ niệm đẹp.

Nếu Ngân đồng ý, mình bắt đầu câu chuyện của tụi mình nha 💖

— Người đang thích Ngân`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Thu-tinh-gui-Kim-Ngan.txt";
  a.click();
  URL.revokeObjectURL(url);
});
