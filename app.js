const SERVER = "";

/* =========================
   HELPERS
========================= */
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function isoDate(d){ return d.toISOString().slice(0,10); }
function isoToday(){ return isoDate(new Date()); }
function isoYesterday(){
  const d = new Date();
  d.setDate(d.getDate()-1);
  return isoDate(d);
}
function prettyDateFR(iso){
  if (!iso) return "—";
  const [y,m,d] = String(iso).slice(0,10).split("-");
  return (y && m && d) ? `${d}/${m}/${y}` : "—";
}
function normalizeAnswer(str){
  return String(str || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ");
}
function setImgSafe(imgEl, src){
  if (!imgEl) return;
  imgEl.onerror = () => { imgEl.src = "assets/images/quiz/placeholder.png"; };
  imgEl.src = src;
}

/* =========================
   NAV
========================= */
function showSection(id){
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");

  document.querySelectorAll("nav .tab").forEach(t => {
    t.classList.toggle("active", t.getAttribute("data-tab") === id);
  });
}
window.showSection = showSection;

/* =========================
   STORAGE
========================= */
const LS_KEY = "prime_eleven_az_progress_v1";

function getState(){
  let s = {};
  try { s = JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { s = {}; }
  if (!s.solvedLetters) s.solvedLetters = {};     // { A:true, B:true ... }
  if (!s.dailySolved) s.dailySolved = {};         // { "YYYY-MM-DD":true }
  if (!s.epochStart) s.epochStart = "2026-01-01"; // pour l’alphabet quotidien
  return s;
}
function saveState(s){
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}
function resetAll(){
  localStorage.removeItem(LS_KEY);
}
function countSolved(s){
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").reduce((acc,L)=>acc + (s.solvedLetters[L]?1:0), 0);
}
function updateProgressUI(){
  const s = getState();
  const done = countSolved(s);
  document.getElementById("pillProgress") && (document.getElementById("pillProgress").textContent = `${done}/26`);
  document.getElementById("collectionProgressText") && (document.getElementById("collectionProgressText").textContent = `${done}/26`);
}

/* =========================
   QUIZZES A→Z
   (images dans public/assets/images/quiz/)
========================= */
const quizzes = [
  { letter:"A", solution:"alaba", playerName:"David Alaba", image:"assets/images/quiz/alaba.png", hints:["Je suis Autrichien","J’ai joué au Bayern","J’ai joué au Real Madrid"] },
  { letter:"B", solution:"barthez", playerName:"Fabien Barthez", image:"assets/images/quiz/barthez.png", hints:["J’ai joué pour Manchester United","J’ai joué à Marseille","Je suis Champion du Monde 1998"] },
  { letter:"C", solution:"casillas", playerName:"Iker Casillas", image:"assets/images/quiz/casillas.png", hints:["Je suis Espagnol","Je suis gardien de but","J’ai joué pour le Real Madrid"] },
  { letter:"D", solution:"deschamps", playerName:"Didier Deschamps", image:"assets/images/quiz/deschamps.png", hints:["Je suis sélectionneur","Je suis champion du monde","J’ai gagné la ligue des champions"] },
  { letter:"E", solution:"etoo", playerName:"Samuel Eto’o", image:"assets/images/quiz/etoo.png", hints:["Je suis buteur","J’ai gagné le Ballon d’Or Africain","J’ai joué pour le Barça"] },
  { letter:"F", solution:"ferdinand", playerName:"Rio Ferdinand", image:"assets/images/quiz/ferdinand.png", hints:["J’ai joué pour l’Angleterre","J’ai joué pour Manchester United","Je suis défenseur"] },
  { letter:"G", solution:"griezmann", playerName:"Antoine Griezmann", image:"assets/images/quiz/griezmann.png", hints:["Je suis Français","J’ai joué à l’Atlético Madrid","J’ai gagné la coupe du monde"] },
  { letter:"H", solution:"hazard", playerName:"Eden Hazard", image:"assets/images/quiz/hazard.png", hints:["J’ai joué pour Lille","J’ai joué pour Chelsea","J’ai joué pour le Real Madrid"] },
  { letter:"I", solution:"ibrahimovic", playerName:"Zlatan Ibrahimović", image:"assets/images/quiz/ibrahimovic.png", hints:["J’ai joué pour le Barça","J’ai joué pour le PSG","Je suis Suédois"] },
  { letter:"J", solution:"juninho", playerName:"Juninho", image:"assets/images/quiz/juninho.png", hints:["J’ai joué à Lyon","Je suis Brésilien","J’aime les coups francs"] },
  { letter:"K", solution:"kaka", playerName:"Kaká", image:"assets/images/quiz/kaka.png", hints:["J’ai joué au Milan AC","J’ai joué au Real Madrid","Je suis Ballon d’Or"] },
  { letter:"L", solution:"lewandowski", playerName:"Lewandowski", image:"assets/images/quiz/lewandowski.png", hints:["Je suis buteur","J’ai joué au Bayern","Je suis Polonais"] },
  { letter:"M", solution:"maldini", playerName:"Maldini", image:"assets/images/quiz/maldini.png", hints:["J’ai joué au Milan AC","Je suis défenseur","J’ai porté le numéro 3"] },
  { letter:"N", solution:"neymar", playerName:"Neymar", image:"assets/images/quiz/neymar.png", hints:["J’ai joué à Santos","J’ai joué au Barça","J’ai joué au PSG"] },
  { letter:"O", solution:"owen", playerName:"Michael Owen", image:"assets/images/quiz/owen.png", hints:["Je suis Anglais","J’ai joué à Liverpool","Je suis Ballon d’Or"] },
  { letter:"P", solution:"pastore", playerName:"Javier Pastore", image:"assets/images/quiz/pastore.png", hints:["J’ai joué à Palerme","Je suis Argentin","J’ai joué au PSG"] },
  { letter:"Q", solution:"quaresma", playerName:"Ricardo Quaresma", image:"assets/images/quiz/quaresma.png", hints:["Je suis Portugais","J’ai joué à Porto","Je suis connu pour ma Trivela"] },
  { letter:"R", solution:"ronaldinho", playerName:"Ronaldinho", image:"assets/images/quiz/ronaldinho.png", hints:["J’ai joué au PSG","J’ai joué au Barça","Je suis Brésilien"] },
  { letter:"S", solution:"suarez", playerName:"Luis Suárez", image:"assets/images/quiz/suarez.png", hints:["J’ai joué à l’Ajax","J’ai joué à Liverpool","J’ai joué au Barça"] },
  { letter:"T", solution:"trezeguet", playerName:"Trezeguet", image:"assets/images/quiz/trezeguet.png", hints:["J’ai joué à la Juventus","J’ai gagné l’Euro","J’ai gagné la coupe du monde"] },
  { letter:"U", solution:"uchida", playerName:"Uchida", image:"assets/images/quiz/uchida.png", hints:["Je suis Japonais","J’ai joué à Schalke","Je suis défenseur"] },
  { letter:"V", solution:"vidal", playerName:"Vidal", image:"assets/images/quiz/vidal.png", hints:["J’ai joué à la Juventus","J’ai joué au Barça","Je suis Chilien"] },
  { letter:"W", solution:"wijnaldum", playerName:"Wijnaldum", image:"assets/images/quiz/wijnaldum.png", hints:["J’ai joué à Newcastle","J’ai joué à Liverpool","Je suis Hollandais"] },
  { letter:"X", solution:"xavi", playerName:"Xavi", image:"assets/images/quiz/xavi.png", hints:["J’ai joué pour le Barça","Je suis Espagnol","Je suis connu pour mon Tiki-Taka"] },
  { letter:"Y", solution:"yildiz", playerName:"Yildiz", image:"assets/images/quiz/yildiz.png", hints:["J’ai joué pour la Juventus","Je suis Turc","Je porte le numéro 10"] },
  { letter:"Z", solution:"zidane", playerName:"Zidane", image:"assets/images/quiz/zidane.png", hints:["J’ai joué à Bordeaux","J’ai joué au Real Madrid","Je suis Champion du monde"] },
];

function quizByLetter(letter){
  return quizzes.find(q => q.letter === letter) || quizzes[0];
}

/* =========================
   DAILY QUIZ: alphabet each day
========================= */
function daysBetweenISO(aISO, bISO){
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.floor((b - a) / 86400000);
}
function getDailyLetter(){
  const s = getState();
  const epoch = s.epochStart || "2026-01-01";
  const n = daysBetweenISO(epoch, isoToday());
  const idx = ((n % 26) + 26) % 26;
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[idx];
}

let daily = { quiz:null, hintIndex:0 };

function renderDaily(){
  const letter = getDailyLetter();
  daily.quiz = quizByLetter(letter);
  daily.hintIndex = 0;

  const q = daily.quiz;

  document.getElementById("homeDailyTitle").textContent = `Lettre ${q.letter} — Qui suis-je ?`;
  document.getElementById("homeDailyHintPreview").textContent = q.hints[0] || "—";
  document.getElementById("homeDailyHintList").innerHTML = `<li>${escapeHtml(q.hints[0] || "—")}</li>`;
  document.getElementById("homeDailyAnswer").value = "";

  const img = document.getElementById("homeDailyImage");
  setImgSafe(img, q.image);

  const s = getState();
  const solvedToday = !!s.dailySolved[isoToday()];
  img.classList.toggle("blurred", !solvedToday);

  const status = document.getElementById("homeDailyStatus");
  status.className = "status";
  status.textContent = "";

  if (solvedToday){
    status.className = "status ok";
    status.innerHTML = `🎉 Bonne réponse ! <button class="btn ghost" id="btnGoQuizFromDaily" type="button" style="padding:6px 10px; border-radius:10px; margin-left:8px;">Onglet Quiz</button>`;
    setTimeout(() => {
      document.getElementById("btnGoQuizFromDaily")?.addEventListener("click", () => showSection("quiz"));
    }, 0);
    img.classList.remove("blurred");
  }

  updateProgressUI();
}

/* Daily actions */
function dailyAddHint(){
  if (!daily.quiz) return;
  if (daily.hintIndex >= daily.quiz.hints.length - 1) return;
  daily.hintIndex++;
  document.getElementById("homeDailyHintList").innerHTML += `<li>${escapeHtml(daily.quiz.hints[daily.hintIndex])}</li>`;
}

function unlockLetter(letter){
  const s = getState();
  s.solvedLetters[letter] = true;
  saveState(s);
  updateProgressUI();
  renderQuizGrid();
  renderCollection();
}

function dailyCheck(){
  if (!daily.quiz) return;

  const val = normalizeAnswer(document.getElementById("homeDailyAnswer").value);
  const sol = normalizeAnswer(daily.quiz.solution);

  const status = document.getElementById("homeDailyStatus");

  if (!val){
    status.className = "status bad";
    status.textContent = "Entre une réponse.";
    return;
  }

  const ok = (val === sol) || val.includes(sol) || sol.includes(val);

  if (!ok){
    status.className = "status bad";
    status.textContent = "❌ Mauvaise réponse. Essaie encore.";
    return;
  }

  // ✅ Sauvegarde daily + déblocage lettre
  const s = getState();
  s.dailySolved[isoToday()] = true;
  s.solvedLetters[daily.quiz.letter] = true;
  saveState(s);

  const img = document.getElementById("homeDailyImage");
  img.classList.remove("blurred");

  status.className = "status ok";
  status.innerHTML = `🎉 Bonne réponse ! <button class="btn ghost" id="btnGoQuizFromDaily" type="button" style="padding:6px 10px; border-radius:10px; margin-left:8px;">Onglet Quiz</button>`;
  setTimeout(() => {
    document.getElementById("btnGoQuizFromDaily")?.addEventListener("click", () => showSection("quiz"));
  }, 0);

  updateProgressUI();
  renderQuizGrid();
  renderCollection();
}

/* =========================
   QUIZ section (letters any time)
========================= */
let active = { quiz:null, hintIndex:0 };

function loadQuizLetter(letter){
  active.quiz = quizByLetter(letter);
  active.hintIndex = 0;

  const q = active.quiz;

  document.getElementById("pillLetter").textContent = `Lettre ${q.letter}`;
  document.getElementById("quizTitle").textContent = `Lettre ${q.letter} — Qui suis-je ?`;
  document.getElementById("hintList").innerHTML = `<li>${escapeHtml(q.hints[0] || "—")}</li>`;
  document.getElementById("answerInput").value = "";

  const img = document.getElementById("quizImage");
  setImgSafe(img, q.image);
  img.classList.add("blurred");

  const status = document.getElementById("quizStatus");
  status.className = "status";
  status.textContent = "";
}

function addHint(){
  if (!active.quiz) return;
  if (active.hintIndex >= active.quiz.hints.length - 1) return;
  active.hintIndex++;
  document.getElementById("hintList").innerHTML += `<li>${escapeHtml(active.quiz.hints[active.hintIndex])}</li>`;
}
window.addHint = addHint;

function checkAnswer(){
  if (!active.quiz) return;

  const val = normalizeAnswer(document.getElementById("answerInput").value);
  const sol = normalizeAnswer(active.quiz.solution);

  const status = document.getElementById("quizStatus");
  const img = document.getElementById("quizImage");

  if (!val){
    status.className = "status bad";
    status.textContent = "Entre une réponse.";
    return;
  }

  const ok = (val === sol) || val.includes(sol) || sol.includes(val);

  if (!ok){
    status.className = "status bad";
    status.textContent = "❌ Mauvaise réponse. Essaie encore.";
    return;
  }

  // ✅ Sauvegarde : débloque la lettre
  unlockLetter(active.quiz.letter);

  img.classList.remove("blurred");
  status.className = "status ok";
  status.innerHTML = `✅ Bravo ! Carte débloquée : <b>${escapeHtml(active.quiz.playerName)}</b> — <button class="btn ghost" id="btnGoCollectionFromQuiz" type="button" style="padding:6px 10px; border-radius:10px; margin-left:8px;">Ma collection</button>`;

  setTimeout(() => {
    document.getElementById("btnGoCollectionFromQuiz")?.addEventListener("click", () => showSection("collection"));
  }, 0);
}
window.checkAnswer = checkAnswer;

function resetQuizUI(){
  if (!active.quiz) return;
  loadQuizLetter(active.quiz.letter);
}
window.resetQuizUI = resetQuizUI;

/* =========================
   QUIZ GRID (A→Z)
========================= */
function renderQuizGrid(){
  const grid = document.getElementById("quizGrid");
  if (!grid) return;

  const s = getState();
  grid.innerHTML = "";

  quizzes.forEach(q => {
    const solved = !!s.solvedLetters[q.letter];

    const card = document.createElement("div");
    card.className = "quiz-card";
    card.innerHTML = `
      <span class="badge ${solved ? "easy" : ""}">${solved ? "✅ Débloqué" : "🔒 À débloquer"}</span>
      <h3>Lettre ${escapeHtml(q.letter)}</h3>
      <p>${escapeHtml(q.hints[0])}…</p>
    `;
    card.addEventListener("click", () => {
      loadQuizLetter(q.letter);
      showSection("quiz");
    });

    grid.appendChild(card);
  });
}

/* =========================
   COLLECTION
========================= */
function renderCollection(){
  const wrap = document.getElementById("collectionGrid");
  if (!wrap) return;

  const s = getState();
  updateProgressUI();

  wrap.innerHTML = "";

  quizzes.forEach(q => {
    const solved = !!s.solvedLetters[q.letter];

    const card = document.createElement("div");
    card.className = "quiz-card";

    card.innerHTML = `
      <span class="badge ${solved ? "easy" : "hard"}">${solved ? "✅ Débloqué" : "🔒 Verrouillé"}</span>
      <h3>Lettre ${escapeHtml(q.letter)}</h3>
      <p style="margin-bottom:10px;">${solved ? escapeHtml(q.playerName) : "???"}</p>
      <img
        src="${solved ? q.image : "assets/images/quiz/placeholder.png"}"
        alt=""
        style="width:100%; border-radius:14px; border:1px solid rgba(11,37,69,.08);"
        class="${solved ? "" : "blurred"}"
        onerror="this.src='assets/images/quiz/placeholder.png'"
      >
    `;

    // si carte débloquée : click -> ouvrir la lettre dans Quiz
    if (solved){
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        loadQuizLetter(q.letter);
        showSection("quiz");
      });
    }

    wrap.appendChild(card);
  });
}

/* =========================
   NEWS
========================= */
function groupArticlesByLastDays(articles, days = 3){
  const buckets = new Map();
  for (let i=0; i<days; i++){
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(isoDate(d), []);
  }

  (articles || []).forEach(a => {
    const key = String(a.publishedAt || "").slice(0,10);
    if (buckets.has(key)) buckets.get(key).push(a);
  });

  for (const [k, arr] of buckets.entries()){
    arr.sort((x,y)=>String(y.publishedAt||"").localeCompare(String(x.publishedAt||"")));
    buckets.set(k, arr);
  }

  return buckets;
}

async function loadNews(){
  document.getElementById("pillToday").textContent = prettyDateFR(isoToday());

  try{
    const res = await fetch(`${SERVER}/api/news`);
    const data = await res.json();
    const articles = data.articles || [];

    // HOME: 3 actus
    const homeWrap = document.getElementById("homeNews");
    const pick = articles.slice(0, 3);

    homeWrap.innerHTML = pick.length ? pick.map(a => {
  const title = escapeHtml(a.title || "");
  const url = a.url || "";
  return `
    <div class="news-item">
      <h3>${url ? `<a href="${url}" target="_blank" rel="noopener">${title}</a>` : title}</h3>
    </div>
  `;
}).join("") : `<div class="meta" style="margin-top:10px;">Aucune actu disponible.</div>`;

    // INFO FOOT: 3 jours
    const buckets = groupArticlesByLastDays(articles, 3);
    const infoBox = document.getElementById("infoByDays");
    infoBox.innerHTML = "";

    let idx = 0;
    for (const [key, list] of buckets.entries()){
      const label = idx===0 ? "Aujourd’hui" : `Il y a ${idx} jour(s)`;

      infoBox.innerHTML += `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:${idx===0?0:14}px;">
          <h2 style="font-size:16px;">${label}</h2>
          <span class="pill">${prettyDateFR(key)}</span>
        </div>
        <div id="newsBlock_${idx}"></div>
      `;

      const block = infoBox.querySelector(`#newsBlock_${idx}`);
      if (!block) continue;

      block.innerHTML = list.length ? list.slice(0,10).map(a => {
  const title = escapeHtml(a.title || "");
  const url = a.url || "";
  return `
    <div class="news-item">
      <h3>${url ? `<a href="${url}" target="_blank" rel="noopener">${title}</a>` : title}</h3>
    </div>
  `;
}).join("") : `<div class="meta" style="margin-top:8px;">Aucune info.</div>`;

      idx++;
    }

  }catch(e){
    document.getElementById("homeNews").innerHTML = `<div class="meta" style="margin-top:10px;">Erreur chargement news.</div>`;
    document.getElementById("infoByDays").innerHTML = `<div class="meta">Erreur chargement news.</div>`;
  }
}

/* =========================
   BIND UI
========================= */
function bindUI(){
  // Daily quiz (home)
  document.getElementById("homeDailyHintBtn")?.addEventListener("click", dailyAddHint);
  document.getElementById("homeDailyCheckBtn")?.addEventListener("click", dailyCheck);
  document.getElementById("homeDailyCollectionBtn")?.addEventListener("click", () => showSection("collection"));
  document.getElementById("homeDailyAnswer")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") dailyCheck();
  });

  // Quiz section
  document.getElementById("btnHint")?.addEventListener("click", addHint);
  document.getElementById("btnCheck")?.addEventListener("click", checkAnswer);
  document.getElementById("btnRestart")?.addEventListener("click", resetQuizUI);
  document.getElementById("answerInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });

  // Collection
  document.getElementById("btnGoHome")?.addEventListener("click", () => showSection("home"));
  document.getElementById("btnResetAll")?.addEventListener("click", () => {
    if (confirm("Tu veux vraiment reset toute la progression A→Z ?")) {
      resetAll();
      updateProgressUI();
      renderQuizGrid();
      renderCollection();
      renderDaily();
      showSection("home");
    }
  });
}

/* =========================
   INIT
========================= */
(function init(){
  // defaults
  document.getElementById("pillToday") && (document.getElementById("pillToday").textContent = prettyDateFR(isoToday()));

  // data
  loadNews();

  // quiz
  updateProgressUI();
  renderQuizGrid();
  renderCollection();

  // daily
  renderDaily();

  // quiz section default letter
  loadQuizLetter("A");

  // binds
  bindUI();
})();
