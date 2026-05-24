/* -- CANVAS BG -- colored ambient washes + particles + cursor glow -- */
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

  // Slow-drifting ambient blobs - each has a phase offset so they move independently
  // These are the page-level gradient washes, drawn on the full-screen canvas
  const blobs = [
    { // pink - top-left drift
      col: '217,70,180', alpha: 0.13,
      bx: 0.18, by: 0.28, r: 0.38,
      phase: 0, speed: 0.00018, ax: 0.07, ay: 0.05
    },
    { // blue - bottom-right drift
      col: '46,168,232', alpha: 0.11,
      bx: 0.82, by: 0.72, r: 0.34,
      phase: Math.PI * 0.66, speed: 0.00022, ax: 0.06, ay: 0.07
    },
    { // purple - centre drift
      col: '168,85,247', alpha: 0.09,
      bx: 0.50, by: 0.48, r: 0.30,
      phase: Math.PI * 1.33, speed: 0.00015, ax: 0.08, ay: 0.06
    },
  ];

  let t = 0;
  (function loop(){
    t++; ctx.clearRect(0,0,W,H);

    // --- Full-page ambient colour blobs ---
    blobs.forEach(b => {
      b.phase += b.speed * (Math.PI * 2);
      const cx = (b.bx + Math.sin(b.phase)           * b.ax) * W;
      const cy = (b.by + Math.cos(b.phase * 0.71)    * b.ay) * H;
      const r  = b.r * Math.max(W, H);
      const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${b.col},${b.alpha})`);
      g.addColorStop(0.55, `rgba(${b.col},${(b.alpha * 0.4).toFixed(3)})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // cursor glow - subtle brightness on the background only
    if(mx>-9999){
      const cg=ctx.createRadialGradient(mx,my,0,mx,my,220);
      cg.addColorStop(0,'rgba(255,255,255,0.045)');
      cg.addColorStop(1,'transparent');
      ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);
    }
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
    'S++': { c:'#ff2222', desc:"Extremely rare at just 1.88%. The 14.99× multiplier is the absolute peak attainable before unlocking the CH2 Upgrade Tree. Celebrate this roll.', tip:'Best possible without CH2. Lock it and never look back. But after unlocking P+ enhancement, definitely reroll for P+. This tier might be the rarest, but it's not the best one." },
    'P':   { c:'#a855f7', desc:'Requires the Chapter 2 Upgrade Tree to enter the roll pool. At 25.99× this is a massive leap above S++ and will dramatically accelerate CH2+ progression.', tip:'Unlock the CH2 Upgrade Tree first, then hunt for P on primary currencies.' },
    'P+':  { c:'#d946ef', desc:'The most powerful tier at 49.99×. Requires the CH2 Upgrade Tree. Securing P+ on your key currencies is a major milestone that compresses enormous amounts of grind.', tip:'The holy grail. Prioritise getting CH2 Upgrade Tree unlocked to access this tier.' },
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
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    overlay.style.display = '';
    // Only remove modal-open if no other modals are still open
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.classList.remove('modal-open');
    }
  }, 360);
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

/* -- ROBLOX LIVE STATS (hardcoded values only) -- */
(function loadHardcodedRobloxStats() {
  const stats = {
    playing: 0,
    visits: 0,
    favoritedCount: 0,
    likeCount: 0,
    maxPlayers: 15,
  };

  const fmt = n => {
    if (!n && n !== 0) return '-';
    if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const setText = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };

  setText('stat-active', stats.playing > 0 ? fmt(stats.playing) : '—');
  setText('stat-visits', stats.visits > 0 ? fmt(stats.visits) : '—');
  setText('stat-favorites', stats.favoritedCount > 0 ? fmt(stats.favoritedCount) : '—');
  setText('stat-likes', stats.likeCount > 0 ? fmt(stats.likeCount) : '—');
  setText('stat-maxplayers', stats.maxPlayers ?? '-');

  // Only show the live badge when there are real active players
  const badge = document.getElementById('live-badge');
  if (badge) badge.style.display = stats.playing > 0 ? 'inline-flex' : 'none';
})();

/* -- DYNAMIC CODES SECTION SUB-TEXT -- */
(function updateCodesSectionSub() {
  // Run after DOM is ready
  function update() {
    const activeRows = document.querySelectorAll('#tab-codes .styled-table tbody tr.activec').length;
    const el = document.getElementById('codes-section-sub');
    if (!el) return;
    if (activeRows === 0) {
      el.textContent = 'No active codes right now — check back soon!';
    } else if (activeRows === 1) {
      el.textContent = 'There is 1 active code right now. Redeem it before it expires!';
    } else {
      el.textContent = `There are ${activeRows} active codes right now. Redeem them before they expire!`;
    }
  }
  // DOM is already parsed by defer, run immediately
  update();
})();

/* -- TABS -- */
/* Selects one of the main page tabs and updates the navigation state.
   Also scrolls the page to the top after switching tabs.
*/
function showTab(n){
  // Exit compare mode when navigating away from enhancements
  if (n !== 'enhancements' && window.exitCompareMode) window.exitCompareMode();
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

/* Copies a redeem code into the clipboard and shows a fixed bottom toast. */
// ── Singleton copy-toast element ──────────────────────────────────────────
const _copyToastEl = (() => {
  const el = document.createElement('div');
  el.id = 'copy-fixed-toast';
  el.className = 'copy-fixed-toast';
  document.body.appendChild(el);
  return el;
})();
let _copyToastTimer = null;
function _showCopyToast(msg) {
  _copyToastEl.textContent = msg;
  _copyToastEl.classList.remove('copy-toast-exit');
  _copyToastEl.classList.add('copy-toast-show');
  clearTimeout(_copyToastTimer);
  _copyToastTimer = setTimeout(() => {
    _copyToastEl.classList.add('copy-toast-exit');
    setTimeout(() => {
      _copyToastEl.classList.remove('copy-toast-show', 'copy-toast-exit');
    }, 380);
  }, 1600);
}

function copyCode(code, btn){
  const text = String(code);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).catch(()=>fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
  _showCopyToast('✓ Copied: ' + code);

  const original = btn.textContent;
  btn.textContent = '✓';
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

/* ========================================
   DO NOT EDIT BELOW THIS LINE
   ======================================== */

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
/* ==========================================
   FEATURE 1 – TIER ROW HOVER GLOW
   Sets --tier-color on each row for the CSS glow to use
   ========================================== */
(function(){
  const colorMap = {
    F:'rgba(34,196,94,0.45)', D:'rgba(74,222,128,0.45)', C:'rgba(190,242,100,0.45)',
    B:'rgba(251,191,36,0.45)', A:'rgba(245,158,11,0.45)', S:'rgba(249,115,22,0.45)',
    'S+':'rgba(239,68,68,0.45)', 'S++':'rgba(255,34,34,0.5)',
    P:'rgba(168,85,247,0.5)', 'P+':'rgba(217,70,239,0.55)'
  };
  document.querySelectorAll('.tier-row').forEach(row => {
    const badge = row.querySelector('.tier-badge');
    if (!badge) return;
    const tier = badge.textContent.trim();
    const col = colorMap[tier];
    if (col) row.style.setProperty('--tier-color', col);
  });
})();

/* ==========================================
   FEATURE 2 – ANIMATED STAT COUNTERS
   Numbers count up when live stats are applied
   ========================================== */
function animateCountUp(el, targetStr) {
  // Parse numeric value and suffix from formatted string like "1.2M", "45.6K"
  const suffixes = [
    { s: 'B', m: 1e9 }, { s: 'M', m: 1e6 }, { s: 'K', m: 1e3 }
  ];
  let targetNum = null, suffix = '', decimals = 0;
  for (const { s, m } of suffixes) {
    if (targetStr.endsWith(s)) {
      const raw = parseFloat(targetStr);
      targetNum = raw * m;
      suffix = s;
      decimals = targetStr.includes('.') ? 1 : 0;
      break;
    }
  }
  if (targetNum === null) {
    // plain number or non-numeric
    const plain = parseInt(targetStr.replace(/,/g,''), 10);
    if (isNaN(plain)) { el.textContent = targetStr; return; }
    targetNum = plain;
  }

  const duration = 900;
  const start = performance.now();
  const startVal = 0;

  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    const cur = startVal + (targetNum - startVal) * eased;
    let display;
    if (suffix === 'B') display = (cur / 1e9).toFixed(decimals) + 'B';
    else if (suffix === 'M') display = (cur / 1e6).toFixed(decimals) + 'M';
    else if (suffix === 'K') display = (cur / 1e3).toFixed(decimals) + 'K';
    else display = Math.floor(cur).toLocaleString();
    el.textContent = display;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = targetStr;
  }
  requestAnimationFrame(step);
}

// Patch applyStats to use animateCountUp
(function(){
  // Wait for DOM then patch
  const orig = window._applyStatsOrig;
  // We hook into the stat elements directly after fetch resolves
  // by overriding textContent assignment via MutationObserver on stat elements
  const statIds = ['stat-active','stat-visits','stat-favorites','stat-likes','stat-maxplayers'];
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const obs = new MutationObserver(() => {
      const val = el.textContent.trim();
      if (val && val !== '-' && !/\d/.test(el.textContent) === false) {
        obs.disconnect();
        const saved = val;
        el.textContent = '0';
        animateCountUp(el, saved);
      }
    });
    obs.observe(el, { childList: true, subtree: true });
  });
})();

/* ==========================================
   FEATURE 3 – PANEL BAR LOAD SHIMMER
   One-time sweep across panel bars when tab becomes visible
   ========================================== */
(function(){
  // Fire shimmer on all visible panel bars on first tab show
  function shimmerBars(tabEl) {
    tabEl.querySelectorAll('.panel-bar').forEach((bar, i) => {
      setTimeout(() => {
        bar.classList.remove('shimmer-once');
        void bar.offsetWidth;
        bar.classList.add('shimmer-once');
        setTimeout(() => bar.classList.remove('shimmer-once'), 1000);
      }, i * 80);
    });
  }
  // Hook into showTab
  const origShowTab = window.showTab;
  window.showTab = function(n) {
    origShowTab(n);
    const panel = document.getElementById('tab-' + n);
    if (panel) setTimeout(() => shimmerBars(panel), 60);
  };
  // Fire on home tab immediately
  setTimeout(() => {
    const home = document.getElementById('tab-home');
    if (home) shimmerBars(home);
  }, 400);
})();

/* ==========================================
   FEATURE 5 – TIER COMPARISON MODE (user-toggled)
   ========================================== */
(function(){
  const tierData = {
    F:   { c:'#22c45e', mult:1,     chance:18.78 },
    D:   { c:'#4ade80', mult:1.5,   chance:17.84 },
    C:   { c:'#bef264', mult:2.2,   chance:15.96 },
    B:   { c:'#fbbf24', mult:3.5,   chance:14.08 },
    A:   { c:'#f59e0b', mult:5,     chance:11.27 },
    S:   { c:'#f97316', mult:7.7,   chance:9.39  },
    'S+': { c:'#ef4444', mult:10.99, chance:7.51  },
    'S++':{ c:'#ff2222', mult:14.99, chance:1.88  },
    P:   { c:'#a855f7', mult:25.99, chance:3.29  },
    'P+': { c:'#d946ef', mult:49.99, chance:7.5   },
  };

  let compareMode = false;
  let compareA = null, compareB = null;

  // ── Slot DOM helpers ──────────────────────────
  function fillSlot(slot, tier, data) {
    const isA = slot === 'a';
    const elSlot   = document.getElementById('compare-slot-' + slot);
    const elTier   = document.getElementById('slot-' + slot + '-tier');
    const elMult   = document.getElementById('slot-' + slot + '-mult');
    const elHint   = document.getElementById('slot-' + slot + '-hint');
    if (!elSlot) return;
    elTier.textContent  = tier;
    elTier.style.color  = data.c;
    elTier.style.textShadow = `0 0 12px ${data.c}88`;
    elMult.textContent  = data.mult + '×  ·  ' + data.chance + '%';
    elMult.style.display = 'block';
    elMult.style.color = 'rgba(255,255,255,0.5)';
    elHint.style.display = 'none';
    elSlot.classList.add(isA ? 'slot-a-filled' : 'slot-b-filled');
  }

  function clearSlot(slot) {
    const isA = slot === 'a';
    const elSlot = document.getElementById('compare-slot-' + slot);
    const elTier = document.getElementById('slot-' + slot + '-tier');
    const elMult = document.getElementById('slot-' + slot + '-mult');
    const elHint = document.getElementById('slot-' + slot + '-hint');
    if (!elSlot) return;
    elTier.textContent = '—';
    elTier.style.color = '';
    elTier.style.textShadow = '';
    elMult.style.display = 'none';
    elHint.style.display = 'block';
    elSlot.classList.remove('slot-a-filled', 'slot-b-filled');
  }

  function updateStepHint() {
    const hint = document.getElementById('compare-step-hint');
    if (!hint) return;
    if (!compareA) {
      hint.textContent = '👇 Drag or tap any tier row to select Tier A';
      hint.classList.remove('done');
    } else if (!compareB) {
      hint.textContent = '👇 Now drag or tap a second tier row for Tier B';
      hint.classList.remove('done');
    } else {
      hint.textContent = '✓ Comparison ready — see results below';
      hint.classList.add('done');
    }
  }

  // ── Drag & Drop – shared drop handler ───────
  function applyDropToSlot(slot, tier, row) {
    const data     = tierData[tier];
    const box      = document.getElementById('tier-compare-box');
    const detailBox = document.getElementById('enh-tier-detail');
    if (!data) return;
    if (slot === 'a') {
      if (compareA) compareA.row.classList.remove('compare-a');
      compareA = { row, tier };
      row.classList.add('compare-a');
      fillSlot('a', tier, data);
      if (detailBox) {
        detailBox.classList.remove('open');
        setTimeout(() => { if (!detailBox.classList.contains('open')) detailBox.innerHTML = '<div class="enh-detail-inner"></div>'; }, 380);
      }
    } else {
      if (compareB) compareB.row.classList.remove('compare-b');
      compareB = { row, tier };
      row.classList.add('compare-b');
      fillSlot('b', tier, data);
    }
    updateStepHint();
    if (compareA && compareB) renderComparison(compareA, compareB);
  }

  // ── Desktop HTML5 Drag & Drop ────────────────
  let _draggedTier = null;
  let _draggedRow  = null;

  function initDesktopDragListeners() {
    document.querySelectorAll('.tier-row').forEach(row => {
      row.addEventListener('dragstart', e => {
        if (!compareMode) { e.preventDefault(); return; }
        const badge = row.querySelector('.tier-badge');
        if (!badge) return;
        _draggedTier = badge.textContent.trim();
        _draggedRow  = row;
        row.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', _draggedTier);
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('is-dragging');
        _draggedTier = null;
        _draggedRow  = null;
        document.querySelectorAll('.compare-slot').forEach(s => s.classList.remove('drag-over-a','drag-over-b'));
      });
    });

    ['a','b'].forEach(slot => {
      const el = document.getElementById('compare-slot-' + slot);
      if (!el) return;
      el.addEventListener('dragover', e => {
        if (!compareMode || !_draggedTier) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.compare-slot').forEach(s => s.classList.remove('drag-over-a','drag-over-b'));
        el.classList.add('drag-over-' + slot);
      });
      el.addEventListener('dragleave', e => {
        // Only remove if we're truly leaving the slot (not entering a child)
        if (!el.contains(e.relatedTarget)) el.classList.remove('drag-over-a','drag-over-b');
      });
      el.addEventListener('drop', e => {
        if (!compareMode || !_draggedTier) return;
        e.preventDefault();
        el.classList.remove('drag-over-a','drag-over-b');
        applyDropToSlot(slot, _draggedTier, _draggedRow);
      });
    });
  }

  // ── Mobile Touch Drag & Drop ─────────────────
  const _touchGhost = (() => {
    const g = document.createElement('div');
    g.id = 'compare-drag-ghost';
    document.body.appendChild(g);
    return g;
  })();
  let _touchTier = null;
  let _touchRow  = null;

  function initTouchDragListeners() {
    document.querySelectorAll('.tier-row').forEach(row => {
      row.addEventListener('touchstart', e => {
        if (!compareMode) return;
        const badge = row.querySelector('.tier-badge');
        if (!badge) return;
        _touchTier = badge.textContent.trim();
        _touchRow  = row;
        const data = tierData[_touchTier];
        if (!data) return;

        // Build ghost chip
        _touchGhost.textContent  = _touchTier;
        _touchGhost.style.color        = data.c;
        _touchGhost.style.borderColor  = data.c;
        _touchGhost.style.textShadow   = `0 0 14px ${data.c}`;
        const touch = e.touches[0];
        _touchGhost.style.left = touch.clientX + 'px';
        _touchGhost.style.top  = touch.clientY + 'px';
        _touchGhost.style.display = 'block';
        row.classList.add('is-dragging');
      }, { passive: true });

      row.addEventListener('touchmove', e => {
        if (!_touchTier) return;
        e.preventDefault(); // prevent scroll during drag
        const touch = e.touches[0];
        _touchGhost.style.left = touch.clientX + 'px';
        _touchGhost.style.top  = touch.clientY + 'px';

        // Highlight whichever slot the finger is over
        ['a','b'].forEach(slot => {
          const slotEl = document.getElementById('compare-slot-' + slot);
          if (!slotEl) return;
          const r = slotEl.getBoundingClientRect();
          const over = touch.clientX >= r.left && touch.clientX <= r.right &&
                       touch.clientY >= r.top  && touch.clientY <= r.bottom;
          slotEl.classList.toggle('drag-over-' + slot, over);
        });
      }, { passive: false });

      row.addEventListener('touchend', e => {
        if (!_touchTier) return;
        _touchGhost.style.display = 'none';
        row.classList.remove('is-dragging');

        const touch = e.changedTouches[0];
        let droppedSlot = null;
        ['a','b'].forEach(slot => {
          const slotEl = document.getElementById('compare-slot-' + slot);
          if (!slotEl) return;
          slotEl.classList.remove('drag-over-a','drag-over-b');
          const r = slotEl.getBoundingClientRect();
          if (touch.clientX >= r.left && touch.clientX <= r.right &&
              touch.clientY >= r.top  && touch.clientY <= r.bottom) droppedSlot = slot;
        });

        if (droppedSlot) applyDropToSlot(droppedSlot, _touchTier, _touchRow);
        _touchTier = null;
        _touchRow  = null;
      });
    });
  }

  // ── Enable / disable draggable attribute on rows ──
  function setDraggableRows(enable) {
    document.querySelectorAll('.tier-row').forEach(row => {
      if (enable) {
        row.setAttribute('draggable', 'true');
        row.classList.add('draggable-row');
      } else {
        row.removeAttribute('draggable');
        row.classList.remove('draggable-row','is-dragging');
      }
    });
  }

  // Init listeners once (gated by compareMode flag at call time)
  initDesktopDragListeners();
  initTouchDragListeners();

  // ── Public: reset slots ───────────────────────
  // ── Result card renderer ──────────────────────
  function renderComparison(aSel, bSel) {
    const box = document.getElementById('tier-compare-box');
    if (!aSel || !bSel || !box) return;
    const a = tierData[aSel.tier];
    const b = tierData[bSel.tier];
    if (!a || !b) return;

    const maxMult = Math.max(a.mult, b.mult);
    const barA = Math.round((a.mult / maxMult) * 100);
    const barB = Math.round((b.mult / maxMult) * 100);
    const multRatio = (b.mult / a.mult).toFixed(2);
    const multRatioRev = (a.mult / b.mult).toFixed(2);
    const multDiff  = Math.abs(b.mult - a.mult).toFixed(2);
    const better = b.mult >= a.mult;
    const arrowCol  = better ? '#22c45e' : '#ef4444';
    const arrowIcon = better ? '▲' : '▼';
    const speedup = better
      ? `${multRatio}× faster with ${bSel.tier}`
      : `${multRatioRev}× faster with ${aSel.tier}`;

    const chanceDiff = Math.abs(b.chance - a.chance).toFixed(2);
    const chanceBetter = b.chance > a.chance;
    const chancePillCol = chanceBetter ? 'rgba(34,196,94,0.2)' : 'rgba(220,50,50,0.2)';
    const chancePillTxt = chanceBetter ? `+${chanceDiff}% easier to roll` : `-${chanceDiff}% harder to roll`;
    const chancePillBorder = chanceBetter ? 'rgba(34,196,94,0.4)' : 'rgba(220,50,50,0.4)';
    const chancePillColor  = chanceBetter ? '#22c45e' : '#ef4444';

    box.innerHTML = `<div class="compare-inner">
      <div style="font-size:0.62rem;font-weight:800;color:rgba(255,255,255,0.28);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;">Result</div>
      <div class="compare-result-card">
        <div class="compare-result-side">
          <div class="compare-result-label">Tier A</div>
          <div class="compare-result-tier-name" style="color:${a.c};text-shadow:0 0 14px ${a.c}88;">${aSel.tier}</div>
          <div class="compare-result-mult">${a.mult}×</div>
          <div class="compare-result-chance">${a.chance}% roll chance</div>
          <div class="compare-result-bar-wrap"><div class="compare-result-bar" style="width:${barA}%;background:${a.c};box-shadow:0 0 6px ${a.c}88;"></div></div>
        </div>
        <div class="compare-result-center">
          <div class="compare-result-diff-num" style="color:${arrowCol};">${arrowIcon} ${multDiff}×</div>
          <div class="compare-result-speedup">${speedup}</div>
          <div class="compare-chance-pill" style="background:${chancePillCol};border:1px solid ${chancePillBorder};color:${chancePillColor};">${chancePillTxt}</div>
        </div>
        <div class="compare-result-side">
          <div class="compare-result-label">Tier B</div>
          <div class="compare-result-tier-name" style="color:${b.c};text-shadow:0 0 14px ${b.c}88;">${bSel.tier}</div>
          <div class="compare-result-mult">${b.mult}×</div>
          <div class="compare-result-chance">${b.chance}% roll chance</div>
          <div class="compare-result-bar-wrap"><div class="compare-result-bar" style="width:${barB}%;background:${b.c};box-shadow:0 0 6px ${b.c}88;"></div></div>
        </div>
      </div>
    </div>`;
    void box.offsetHeight;
    box.classList.add('open');
  }

  // ── Public: reset slots ───────────────────────
  window.resetCompareSlots = function() {
    if (compareA) { compareA.row.classList.remove('compare-a'); compareA = null; }
    if (compareB) { compareB.row.classList.remove('compare-b'); compareB = null; }
    clearSlot('a'); clearSlot('b');
    updateStepHint();
    const box = document.getElementById('tier-compare-box');
    if (box) box.classList.remove('open');
  };

  // ── Public: exit compare mode (called on tab switch) ──
  window.exitCompareMode = function() {
    if (!compareMode) return;
    compareMode = false;
    const btn  = document.getElementById('compare-toggle-btn');
    const panel = document.getElementById('compare-slot-panel');
    const box  = document.getElementById('tier-compare-box');
    if (btn) btn.classList.remove('active');
    if (panel) panel.classList.remove('visible');
    setDraggableRows(false);
    window.resetCompareSlots();
    if (box) box.classList.remove('open');
    document.querySelectorAll('.tier-row').forEach(r => r.classList.remove('compare-a','compare-b'));
  };

  // ── Public: toggle ────────────────────────────
  window.toggleCompareMode = function() {
    compareMode = !compareMode;
    const btn   = document.getElementById('compare-toggle-btn');
    const panel = document.getElementById('compare-slot-panel');
    const detailBox = document.getElementById('enh-tier-detail');

    if (compareMode) {
      btn && btn.classList.add('active');
      panel && panel.classList.add('visible');
      setDraggableRows(true);
      // collapse any open detail panel
      document.querySelectorAll('.tier-row').forEach(r => r.classList.remove('active'));
      if (detailBox) {
        detailBox.classList.remove('open');
        setTimeout(() => { if (!detailBox.classList.contains('open')) detailBox.innerHTML = '<div class="enh-detail-inner"></div>'; }, 380);
      }
      updateStepHint();
    } else {
      btn && btn.classList.remove('active');
      panel && panel.classList.remove('visible');
      setDraggableRows(false);
      window.resetCompareSlots();
      const box = document.getElementById('tier-compare-box');
      if (box) box.classList.remove('open');
      document.querySelectorAll('.tier-row').forEach(r => r.classList.remove('compare-a','compare-b'));
    }
  };

  // ── Patch enhTierClick for compare mode ──────
  window.enhTierClick = (function(origFn){
    return function(row, tier) {
      const box       = document.getElementById('tier-compare-box');
      const detailBox = document.getElementById('enh-tier-detail');

      if (!compareMode) {
        // Normal mode: clear any leftover compare classes
        document.querySelectorAll('.tier-row').forEach(r => r.classList.remove('compare-a','compare-b'));
        origFn(row, tier);
        return;
      }

      const data = tierData[tier];
      if (!data) return;

      // Clicking the already-selected A tier → deselect A
      if (compareA && compareA.tier === tier) {
        compareA.row.classList.remove('compare-a');
        compareA = null;
        clearSlot('a');
        updateStepHint();
        if (box) box.classList.remove('open');
        return;
      }
      // Clicking the already-selected B tier → deselect B
      if (compareB && compareB.tier === tier) {
        compareB.row.classList.remove('compare-b');
        compareB = null;
        clearSlot('b');
        updateStepHint();
        if (box) box.classList.remove('open');
        return;
      }

      // Fill slot A first
      if (!compareA) {
        compareA = { row, tier };
        row.classList.add('compare-a');
        fillSlot('a', tier, data);
        // Close detail panel if open
        if (detailBox) {
          detailBox.classList.remove('open');
          setTimeout(() => { if (!detailBox.classList.contains('open')) detailBox.innerHTML = '<div class="enh-detail-inner"></div>'; }, 380);
        }
        updateStepHint();
        return;
      }

      // Then fill slot B and render
      compareB = { row, tier };
      row.classList.add('compare-b');
      fillSlot('b', tier, data);
      updateStepHint();
      renderComparison(compareA, compareB);
    };
  })(window.enhTierClick);

})();

/* ==========================================
   FEATURE 6 – BACK TO TOP BUTTON
   ========================================== */
(function(){
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  // Robust click: scroll both documentElement and body for full cross-browser support
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fallback for browsers that ignore behavior:'smooth' on window.scrollTo
    document.documentElement.scrollTop = 0;
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 320) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, { passive: true });
})();

/* ==========================================
   FEATURE 7 – KEYBOARD SHORTCUTS
   H=Home, C=Chapters, E=Enhancements, O=Others, K=Codes, F=FAQ
   ========================================== */
(function(){
  const keyMap = {
    h: 'home', c: 'chapters', e: 'enhancements',
    o: 'others', k: 'codes', f: 'faq'
  };
  const navIdMap = {
    home: 'nav-home', chapters: 'nav-chapters', enhancements: 'nav-enhancements',
    others: 'nav-others', codes: 'nav-codes', faq: 'nav-faq'
  };
  document.addEventListener('keydown', e => {
    // Ignore shortcuts while typing in an input or editing content.
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    // Ignore when a modal is open.
    if (document.body.classList.contains('modal-open')) return;
    // Only trigger navigation for plain key presses, not modifier combinations.
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    const tab = keyMap[e.key.toLowerCase()];
    if (!tab) return;
    e.preventDefault();
    showTab(tab);
    // Flash the kbd hint
    const navBtn = document.getElementById(navIdMap[tab]);
    if (navBtn) {
      const hint = navBtn.querySelector('.kbd-hint');
      if (hint) {
        hint.classList.remove('kbd-flash');
        void hint.offsetWidth;
        hint.classList.add('kbd-flash');
        setTimeout(() => hint.classList.remove('kbd-flash'), 350);
      }
    }
    showToast(`⌨️ Jumped to ${tab.charAt(0).toUpperCase() + tab.slice(1)} [${e.key.toUpperCase()}]`, 1800);
  });
})();

/* ==========================================
   FEATURE 8 – MILESTONE ACHIEVEMENT BADGES
   ========================================== */
(function(){
  const milestones = [
    { secs: 60,  icon: '⏱️', title: 'Time Scholar',      sub: '1 minute on the Wiki!' },
    { secs: 300, icon: '🎲', title: 'Reroll Enthusiast', sub: '5 minutes — you deserve a P+ roll' },
    { secs: 600, icon: '✦',  title: 'Waste Time Legend', sub: '10 minutes of dedication!' },
  ];
  const earned = new Set();

  function showAchievement(icon, title, sub) {
    const popup = document.getElementById('achievement-popup');
    const elIcon  = document.getElementById('ach-icon');
    const elTitle = document.getElementById('ach-title');
    const elSub   = document.getElementById('ach-sub');
    if (!popup) return;
    elIcon.textContent  = icon;
    elTitle.textContent = title;
    elSub.textContent   = sub;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 4200);
  }

  // Hook into the session timer
  const origInterval = setInterval;
  // Poll from session start
  const sessionStart = Date.now();
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    milestones.forEach(m => {
      if (!earned.has(m.secs) && elapsed >= m.secs) {
        earned.add(m.secs);
        showAchievement(m.icon, m.title, m.sub);
      }
    });
  }, 5000);
})();

/* ==========================================
   FEATURE 10 – CODES FILTER
   ========================================== */
function filterCodes(filter, btn) {
  // Update active button state
  document.querySelectorAll('.codes-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const rows = document.querySelectorAll('#tab-codes .styled-table tbody tr');
  let shown = 0;
  rows.forEach(row => {
    const isExpired = row.classList.contains('expired');
    const isActive  = row.classList.contains('activec') || (!isExpired);
    let show = false;
    if (filter === 'all')     show = true;
    if (filter === 'active')  show = !isExpired;
    if (filter === 'expired') show = isExpired;
    row.style.display = show ? '' : 'none';
    if (show) shown++;
  });

  // Update counts
  const total   = rows.length;
  const expired = Array.from(rows).filter(r => r.classList.contains('expired')).length;
  const active  = total - expired;
  const countEl = document.getElementById('count-' + filter);
  if (countEl) countEl.textContent = shown;
}

// Init counts on load
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const rows    = document.querySelectorAll('#tab-codes .styled-table tbody tr');
    const total   = rows.length;
    const expired = Array.from(rows).filter(r => r.classList.contains('expired')).length;
    const active  = total - expired;
    const allEl  = document.getElementById('count-all');
    const actEl  = document.getElementById('count-active');
    const expEl  = document.getElementById('count-expired');
    if (allEl)  allEl.textContent  = total;
    if (actEl)  actEl.textContent  = active;
    if (expEl)  expEl.textContent  = expired;
  });
})();