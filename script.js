/* -- CANVAS BG -- white particles + cursor glow on background -- */
(function(){
  const c=document.getElementById('bg-canvas'),ctx=c.getContext('2d');
  let W,H; const rsz=()=>{W=c.width=innerWidth;H=c.height=innerHeight}; rsz(); addEventListener('resize',rsz);
  // tiny white particles - very low alpha, slow drift
  const pts=Array.from({length:55},()=>({
    x:Math.random()*3000,y:Math.random()*2000,
    r:.3+Math.random()*.8,
    vx:(Math.random()-.5)*.04,vy:-.008-.04*Math.random(),
    a:.02+Math.random()*.05,
    tp:Math.random()*Math.PI*2,ts:.002+Math.random()*.004
  }));
  // cursor position tracked for bg glow - starts off-screen
  let mx=-9999,my=-9999;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  let f=0;
  (function loop(){
    f++; ctx.clearRect(0,0,W,H);
    // cursor glow - subtle brightness on the background only
    if(mx>-9999){
      const cg=ctx.createRadialGradient(mx,my,0,mx,my,220);
      cg.addColorStop(0,'rgba(255,255,255,0.045)');
      cg.addColorStop(1,'transparent');
      ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);
    }
    // very subtle ambient washes - kept from original
    const g1=ctx.createRadialGradient(W*.15,H*.25,0,W*.15,H*.25,W*.3);
    g1.addColorStop(0,'rgba(180,40,140,0.03)'); g1.addColorStop(1,'transparent');
    ctx.fillStyle=g1; ctx.fillRect(0,0,W,H);
    const g2=ctx.createRadialGradient(W*.85,H*.7,0,W*.85,H*.7,W*.28);
    g2.addColorStop(0,'rgba(40,120,200,0.03)'); g2.addColorStop(1,'transparent');
    ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
    // white particles
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.tp+=p.ts;
      if(p.y<-8){p.y=H+8;p.x=Math.random()*W;} if(p.x<-8)p.x=W+8; if(p.x>W+8)p.x=-8;
      const a=p.a*(.5+.5*Math.sin(p.tp));
      ctx.fillStyle=`rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
})();

/* -- ENHANCEMENT TIER CLICK - smooth expand -- */
function enhTierClick(row, tier) {
  const wasActive = row.classList.contains('active');
  document.querySelectorAll('.tier-row').forEach(r => r.classList.remove('active'));
  const box = document.getElementById('enh-tier-detail');

  if (wasActive) {
    // clicking the same row - collapse
    box.classList.remove('open');
    setTimeout(() => { if (!box.classList.contains('open')) box.innerHTML = '<div class="enh-detail-inner"></div>'; }, 380);
    return;
  }

  row.classList.add('active');
  const map = {
    'F':   { c:'#22c45e', desc:'The most common roll at 18.78%. Provides only a 1× multiplier - the baseline. Always reroll F on any currency you actively use.', tip:'Never lock F. Reroll immediately.' },
    'D':   { c:'#4ade80', desc:'Very common at 17.84%. A 1.5× boost is a minor step up from baseline. Only acceptable very early when rerolls are scarce.', tip:'Reroll unless you have no rerolls left.' },
    'C':   { c:'#bef264', desc:'Common at 15.96%. A 2.2× multiplier is below average but usable as a short-term hold while farming more rerolls.', tip:'Lock temporarily if needed - aim higher for primary currencies.' },
    'B':   { c:'#fbbf24', desc:'Average roll at 14.08%. A 3.5× multiplier makes a noticeable difference. Decent for secondary currencies as a medium-term hold.', tip:'Lock secondary currencies at B while hunting S+ for primaries.' },
    'A':   { c:'#f59e0b', desc:'Above average at 11.27%. A 5× boost is solid and worth locking on most currencies until you can roll S or higher.', tip:'Lock and keep on non-primary currencies. Hunt higher for Time / Eons.' },
    'S':   { c:'#f97316', desc:'Rare at 9.39%. A 7.7× multiplier is where enhancements become genuinely powerful. Lock on every active currency.', tip:'Lock immediately on anything you actively use.' },
    'S+':  { c:'#ef4444', desc:'Very rare at 7.51%. At 10.99× this is an excellent roll that will noticeably accelerate progression on any currency.', tip:'Always lock S+. Great roll - protect it.' },
    'S++': { c:'#ff2222', desc:'Extremely rare at just 1.88%. The 14.99× multiplier is the absolute peak attainable before unlocking the CH2 Upgrade Tree. Celebrate this roll.', tip:'Best possible without CH2. Lock it and never look back.' },
    'P':   { c:'#a855f7', desc:'Requires the Chapter 2 Upgrade Tree to enter the roll pool. At 25.99× this is a massive leap above S++ and will dramatically accelerate CH2+ progression.', tip:'Unlock the CH2 Upgrade Tree first, then hunt for P on primary currencies.' },
    'P+':  { c:'#d946ef', desc:'The rarest and most powerful tier at 49.99×. Requires the CH2 Upgrade Tree. Securing P+ on your key currencies is a major milestone that compresses enormous amounts of grind.', tip:'The holy grail. Prioritise getting CH2 Upgrade Tree unlocked to access this tier.' },
  };
  const d = map[tier]; if (!d) return;

  // Populate inner content then animate open
  box.style.borderColor = d.c + '55';
  box.innerHTML = `<div class="enh-detail-inner"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-family:'Lilita One',cursive;font-size:1.15rem;color:${d.c};text-shadow:0 0 10px ${d.c}88;">${tier}</span><span style="font-size:0.78rem;font-weight:800;color:rgba(255,255,255,0.5);">- Selected Tier</span></div><p style="font-size:0.84rem;font-weight:600;color:rgba(255,255,255,0.62);line-height:1.65;margin-bottom:10px;">${d.desc}</p><div style="padding:8px 12px;border-radius:6px;background:rgba(255,255,255,0.04);border-left:3px solid ${d.c};font-size:0.8rem;font-weight:700;color:rgba(255,255,255,0.5);"><span style="color:${d.c};font-weight:800;">💡 </span>${d.tip}</div></div>`;
  // Force reflow then open
  void box.offsetHeight;
  box.classList.add('open');
}

/* -- MODAL SYSTEM -- */
/*
  Modal overlay helpers for opening and closing the popup panels.
  openModal(id): shows the overlay, enables the fade-in transition,
    and disables page scrolling while open.
  closeModal(id): hides the overlay and re-enables page scrolling.
  closeModalOutside(e, id): closes the modal when clicking the backdrop.
*/
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.style.display = 'flex';
  // force reflow so transition fires
  void overlay.offsetHeight;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { overlay.style.display = ''; }, 360);
}
function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}
// Close modals on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});
// Init modals as hidden
document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');

/* -- OTHERS SUB-TABS -- */
/* Switches between the two sub-tabs inside the "Others" main tab.
   Hides both panels first, then shows the selected panel and highlights the pill button.
*/
function showOthersTab(name) {
  document.querySelectorAll('.others-subtab').forEach(t => {
    t.style.display = 'none';
  });
  document.querySelectorAll('[id^="others-pill-"]').forEach(p => p.classList.remove('active'));
  const tab = document.getElementById('others-' + name);
  const pill = document.getElementById('others-pill-' + name);
  if (tab) { tab.style.display = 'block'; tab.style.animation = 'fadeUp .3s cubic-bezier(0.22,1,0.36,1)'; }
  if (pill) pill.classList.add('active');
}

/* -- ROBLOX LIVE STATS (direct + CORS proxy fallback) -- */
(function fetchRobloxStats() {
  const UNIVERSE_ID = '7649346422';
  const DIRECT  = `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`;
  const PROXIED = `https://api.allorigins.win/get?url=${encodeURIComponent(DIRECT)}`;

  function fmt(n) {
    if (!n && n !== 0) return '-';
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n.toLocaleString();
  }
  function applyStats(data) {
    const g = data.data && data.data[0];
    if (!g) return false;
    const set = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
    set('stat-active',    fmt(g.playing));
    set('stat-visits',    fmt(g.visits));
    set('stat-favorites', fmt(g.favoritedCount));
    set('stat-likes',     fmt(g.likeCount));
    set('stat-maxplayers',g.maxPlayers ?? '-');
    const badge = document.getElementById('live-badge');
    if (badge) badge.style.display = 'inline-flex';
    return true;
  }
  function setFailed() {
    ['stat-active','stat-visits','stat-favorites','stat-likes','stat-maxplayers']
      .forEach(id => { const el=document.getElementById(id); if(el) el.textContent='-'; });
  }
  function tryFetch() {
    fetch(DIRECT)
      .then(r => r.json())
      .then(data => { if (!applyStats(data)) throw new Error('no data'); })
      .catch(() => {
        fetch(PROXIED)
          .then(r => r.json())
          .then(wrapper => {
            try { const data = JSON.parse(wrapper.contents); if (!applyStats(data)) setFailed(); }
            catch { setFailed(); }
          })
          .catch(setFailed);
      });
  }
  tryFetch();
  setInterval(tryFetch, 60000);
})();

/* -- TABS -- */
/* Selects one of the main page tabs and updates the navigation state.
   Also scrolls the page to the top after switching tabs.
*/
function showTab(n){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const p=document.getElementById('tab-'+n); if(p) p.classList.add('active');
  // Mark the matching nav button active
  document.querySelectorAll('.nav-btn').forEach(b=>{
    const t = b.textContent.toLowerCase();
    if(n==='others' && t.includes('other')) b.classList.add('active');
    else if(n!=='others' && t.includes(n.slice(0,4).toLowerCase())) b.classList.add('active');
  });
  scrollTo({top:0,behavior:'smooth'});
}

/* -- CHAPTERS -- */
/* Shows the requested chapter content and updates the chapter pill button state. */
function showChapter(n){
  document.querySelectorAll('.chapter-content').forEach(c=>c.style.display='none');
  document.querySelectorAll('.chapter-pill').forEach(p=>p.classList.remove('active'));
  const ch=document.getElementById('chapter-'+n); if(ch)ch.style.display='block';
  const pills=document.querySelectorAll('.chapter-pill'); if(pills[n-1])pills[n-1].classList.add('active');
}

/* -- FAQ -- */
/* Toggles a FAQ item open or closed and closes any other question that is currently expanded. */
function toggleFaq(btn){
  const i = btn.closest('.faq-item');
  const was = i.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(x => x.classList.remove('open'));
  if (!was) i.classList.add('open');
}

/* Copies a redeem code into the clipboard and shows a temporary button state. */
function copyCode(code, btn){

  const text = String(code);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).catch(()=>fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
  const original = btn.textContent;
  btn.textContent = 'Copied';
  btn.disabled = true;
  btn.style.opacity = '0.85';
  setTimeout(()=>{ btn.textContent = original; btn.disabled = false; btn.style.opacity=''; }, 1200);
}

/* Fallback copy method for browsers that do not support navigator.clipboard. */
function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

/* -- IDLE COUNTER (in seconds, accelerating) -- */
(function(){
  let secs = 0, rate = 1;
  const el = document.getElementById('hdr-counter');
  const fmt = v => {
    if(v>=1e15) return (v/1e15).toFixed(1)+'Qa s';
    if(v>=1e12) return (v/1e12).toFixed(1)+'T s';
    if(v>=1e9)  return (v/1e9).toFixed(1)+'B s';
    if(v>=1e6)  return (v/1e6).toFixed(1)+'M s';
    if(v>=1e3)  return (v/1e3).toFixed(1)+'K s';
    return Math.floor(v)+'s';
  };
  // Every second, add the rate, then accelerate the rate slightly
  setInterval(() => {
    secs += rate;
    rate *= 1.018; // gentle acceleration like the game
    if (el) {
      const formatted = fmt(secs);
      if (el.textContent !== formatted) {
        el.classList.remove('counter-pop');
        void el.offsetWidth;
        el.classList.add('counter-pop');
        el.textContent = formatted;
      }
    }
  }, 1000);
})();

/* -- SESSION TIMER (real time spent on the guide) -- */
(function(){
  const el = document.getElementById('hdr-session');
  const start = Date.now();
  function fmtSecs(s) {
    if (s < 60)  return s + 's';
    if (s < 3600) return Math.floor(s/60) + 'm ' + (s%60) + 's';
    return Math.floor(s/3600) + 'h ' + Math.floor((s%3600)/60) + 'm';
  }
  // Milestones to toast
  const milestones = {30:'30 seconds in! You\'re wasting time... in a good way 😄', 120:'2 minutes here! A true scholar of Waste Time 📖', 300:'5 minutes! You deserve a P+ roll 🎲', 600:'10 minutes! Legendary dedication ✦'};
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    if (el) el.textContent = fmtSecs(s);
    if (milestones[s]) { showToast('⏱️ ' + milestones[s]); delete milestones[s]; }
  }, 1000);
})();

/* -- TOAST NOTIFICATION -- */
(function(){
  const el = document.createElement('div');
  el.className = 'wt-toast'; el.id = 'wt-toast';
  document.body.appendChild(el);
})();
function showToast(msg, duration) {
  const el = document.getElementById('wt-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration || 3200);
}

/* -- MOBILE NAV -- */
function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  const ham   = document.getElementById('nav-hamburger');
  if (!links) return;
  const open = links.classList.toggle('open');
  if (ham) ham.textContent = open ? '✕' : '☰';
}
function closeMobileNav() {
  const links = document.getElementById('nav-links');
  const ham   = document.getElementById('nav-hamburger');
  if (links) links.classList.remove('open');
  if (ham)   ham.textContent = '☰';
}

/* -- CHAPTER/OTHERS PILL STAGGER ANIMATION -- */
/* Applies a small stagger delay to pill buttons so they animate in sequence.
   This creates a nicer entrance effect for the chip-style pills.
*/
function staggerPills(selector) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.animationDelay = (i * 0.07) + 's';
  });
}
staggerPills('.chapter-pill');
staggerPills('[id^="others-pill-"]');

/* -- TIER HINT - hide once a row is clicked -- */
(function(){
  const hint = document.getElementById('tier-hint');
  document.querySelectorAll('.tier-row').forEach(row => {
    row.addEventListener('click', () => {
      if (hint) { hint.style.transition='opacity .4s'; hint.style.opacity='0'; setTimeout(()=>hint.style.display='none',400); }
    }, { once: true });
  });
})();

/* -- ENHANCED MOUSE TRAIL - alternates pink/blue/gold -- */
let _trailIdx = 0;
const _trailCols = ['rgba(217,70,180,0.7)','rgba(46,168,232,0.7)','rgba(245,166,35,0.6)','rgba(168,85,247,0.7)'];
document.addEventListener('mousemove',e=>{
  const col = _trailCols[_trailIdx++ % _trailCols.length];
  const size = 3 + Math.random()*3;
  const d=document.createElement('div');
  d.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;border-radius:50%;background:${col};box-shadow:0 0 ${size*2}px ${col};pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:opacity .5s,transform .5s;`;
  document.body.appendChild(d);
  setTimeout(()=>{d.style.opacity='0';d.style.transform='translate(-50%,-50%) scale(0)';},40);
  setTimeout(()=>d.remove(),560);
});

/* -- NAV SPARKLES -- */
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('mouseenter',()=>{
    for(let i=0;i<3;i++){
      const s=document.createElement('div'),r=btn.getBoundingClientRect();
      s.style.cssText=`position:fixed;left:${r.left+Math.random()*r.width}px;top:${r.top+Math.random()*r.height}px;width:5px;height:5px;border-radius:50%;background:rgba(217,70,180,0.9);box-shadow:0 0 6px rgba(217,70,180,0.8);pointer-events:none;z-index:9999;animation:sparklePop .45s ease-out forwards;`;
      document.body.appendChild(s);
      setTimeout(()=>s.remove(),480);
    }
  });
});

/* -- CLICK BURST -- */
(function(){
  const BURST_COLS = ['#d946b4','#2ea8e8','#f5a623','#a855f7','#22c45e','#ffffff'];
  const SHAPES = ['●','✦','★','◆','✸','⬡'];

  document.addEventListener('click', e => {
    const x = e.clientX, y = e.clientY;
    const col = BURST_COLS[Math.floor(Math.random() * BURST_COLS.length)];

    // -- Ring pulse --
    const ring = document.createElement('div');
    ring.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:6px; height:6px; border-radius:50%;
      border:2px solid ${col};
      box-shadow: 0 0 12px ${col}, 0 0 24px ${col}44;
      transform:translate(-50%,-50%) scale(1);
      pointer-events:none; z-index:9999;
      transition: transform .55s cubic-bezier(0.2,0,0.3,1), opacity .55s ease;
    `;
    document.body.appendChild(ring);
    requestAnimationFrame(() => {
      ring.style.transform = 'translate(-50%,-50%) scale(9)';
      ring.style.opacity = '0';
    });
    setTimeout(() => ring.remove(), 580);

    // -- Particle burst --
    const count = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2;
      const dist   = 38 + Math.random() * 44;
      const tx     = Math.cos(angle) * dist;
      const ty     = Math.sin(angle) * dist;
      const size   = 3 + Math.random() * 4;
      const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const pCol   = BURST_COLS[Math.floor(Math.random() * BURST_COLS.length)];
      const delay  = Math.random() * 60;
      const dur    = 420 + Math.random() * 200;

      const p = document.createElement('div');
      p.textContent = Math.random() > 0.55 ? shape : '';
      p.style.cssText = `
        position:fixed; left:${x}px; top:${y}px;
        width:${size}px; height:${size}px;
        border-radius: ${Math.random()>0.4 ? '50%' : '2px'};
        background: ${p.textContent ? 'transparent' : pCol};
        color: ${pCol}; font-size:${size + 3}px; line-height:1;
        box-shadow: 0 0 ${size*2}px ${pCol}88;
        pointer-events:none; z-index:9998;
        transform:translate(-50%,-50%) scale(1) rotate(0deg);
        transition: transform ${dur}ms cubic-bezier(0.2,0,0.4,1) ${delay}ms,
                    opacity   ${dur * 0.7}ms ease ${delay + dur * 0.35}ms;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0) rotate(${Math.random()*360}deg)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), dur + delay + 60);
    }

    // -- Central flash --
    const flash = document.createElement('div');
    flash.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:14px; height:14px; border-radius:50%;
      background: radial-gradient(circle, #fff 0%, ${col} 50%, transparent 100%);
      transform:translate(-50%,-50%) scale(1);
      pointer-events:none; z-index:10000;
      transition: transform .22s ease, opacity .22s ease;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.transform='translate(-50%,-50%) scale(2.4)'; flash.style.opacity='0'; });
    setTimeout(() => flash.remove(), 240);
  });
})();

/* -- SCROLL PROGRESS BAR -- */
(function(){
  const bar = document.getElementById('scroll-progress');
  function updateBar(){
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }
  addEventListener('scroll', updateBar, {passive:true});
  updateBar();
})();

/* Parallax removed - background is fixed */

/* -- SCROLL REVEAL - auto-applied, no HTML changes needed -- */
(function(){
  // Elements that slide up
  const upSels = '.game-panel,.quick-stat,.section-title,.section-sub,.glow-divider,.coming-soon,.countdown-wrapper';
  // Elements that scale in
  const scaleSels = '.rank-badge,.chapter-pill,[id^="others-pill-"]';
  // Table rows
  const rowSels = '.styled-table tbody tr';
  // Stat rows
  const statSels = '.stat-row,.faq-item,.stage-card,.prog-wrap';

  function applyClass(sel, cls){
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add(cls);
      // stagger siblings within the same parent
      el.style.transitionDelay = ((i % 8) * 0.07) + 's';
    });
  }
  applyClass(upSels,    'sr');
  applyClass(scaleSels, 'sr-scale');
  applyClass(rowSels,   'sr');
  applyClass(statSels,  'sr');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target); // animate once, then done
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.sr,.sr-left,.sr-right,.sr-scale').forEach(el => io.observe(el));
})();

/* -- CARD TILT on .game-panel and .quick-stat -- */
(function(){
  const MAX = 6;
  function tiltOn(e){
    // Override the .sr transition so tilt is instant, not 0.6s delayed
    this.style.transition = 'box-shadow .2s, transform 0.04s ease';
    const r = this.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width  - 0.5;
    const cy = (e.clientY - r.top)  / r.height - 0.5;
    this.style.transform = `perspective(700px) rotateY(${cx*MAX*2}deg) rotateX(${-cy*MAX*2}deg) translateY(-2px)`;
    this.style.boxShadow = `0 12px 32px rgba(0,0,0,0.6), 0 0 20px rgba(217,70,180,0.1)`;
  }
  function tiltOff(){
    // Smooth return on leave
    this.style.transition = 'box-shadow .2s, transform .35s ease';
    this.style.transform = '';
    this.style.boxShadow = '';
  }
  document.querySelectorAll('.game-panel:not([data-no-tilt]),.quick-stat:not([data-no-tilt])').forEach(el => {
    el.addEventListener('mousemove', tiltOn);
    el.addEventListener('mouseleave', tiltOff);
  });
})();

/* -- COUNTDOWN TIMER (for Chapter 4 release) -- */
/* -----------------------------------------
   WTU Countdown Timer - countdown.js
   -----------------------------------------

   ★ TO SET THE RELEASE DATE ★
   Edit TARGET_DATE below. Always use UTC
   so the timer is identical for every viewer
   regardless of their timezone.

   Format:  new Date("YYYY-MM-DDTHH:MM:SSZ")
            The trailing "Z" means UTC.

   Example: new Date("2025-12-25T18:00:00Z")
            = 25 Dec 2025 at 6:00 PM UTC

   ----------------------------------------- */

const TARGET_DATE = new Date("2026-05-17T03:15:00Z");

/* ════════════════════════════════════════
   DO NOT EDIT BELOW THIS LINE
   ════════════════════════════════════════ */

const targetTimestamp = TARGET_DATE.getTime();

// -- DOM refs ------------------------------
const elDays     = document.getElementById('days');
const elHours    = document.getElementById('hours');
const elMinutes  = document.getElementById('minutes');
const elSeconds  = document.getElementById('seconds');
const elStatus   = document.getElementById('statusMsg');
const elLaunched = document.getElementById('launchedMsg');
const elDisplay  = document.getElementById('countdownDisplay');

// -- Init ----------------------------------
(function init() {
  if (targetTimestamp <= Date.now()) {
    showLaunched();
    return;
  }
  tick();
  setInterval(tick, 1000);
})();

// -- Core tick -----------------------------
function tick() {
  const diff = targetTimestamp - Date.now();

  if (diff <= 0) {
    setUnit(elDays,    0);
    setUnit(elHours,   0);
    setUnit(elMinutes, 0);
    setUnit(elSeconds, 0);
    showLaunched();
    return;
  }

  const days    = Math.floor(diff / 86_400_000);
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000)  / 60_000);
  const seconds = Math.floor((diff % 60_000)      / 1_000);

  setUnit(elDays,    days);
  setUnit(elHours,   hours);
  setUnit(elMinutes, minutes);
  setUnit(elSeconds, seconds, true);
}

// -- Helpers -------------------------------

function setUnit(el, value, animate = false) {
  const str = String(value).padStart(2, '0');
  if (el.textContent !== str) {
    el.textContent = str;
    if (animate) {
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }
}

function showLaunched() {
  elLaunched.classList.add('visible');
  elStatus.textContent = '';
}