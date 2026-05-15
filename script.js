/* ─────────────────────────────────────────────
   SCROLL REVEAL (mobile-optimized)
───────────────────────────────────────────── */
// Higher threshold on mobile for better performance
const revealThreshold = window.innerWidth <= 768 ? 0.08 : 0.12;

const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }),
  { threshold: revealThreshold }
);
document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────────
   COUNTERS
───────────────────────────────────────────── */
const start    = new Date('2018-05-18');
const now      = new Date();
const diffMs   = now - start;
const totalDays   = Math.floor(diffMs / 86400000);
const totalMonths = Math.floor(diffMs / (86400000 * 30.4375));
const totalYears  = 8;

function animCount(el, target, dur) {
  const startTime = performance.now();
  function step(t) {
    const progress = Math.min((t - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statRibbon = document.querySelector('.stat-ribbon');
let counted = false;
const counterObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    animCount(document.getElementById('years-count'),  totalYears,    900);
    animCount(document.getElementById('months-count'), totalMonths,  1200);
    animCount(document.getElementById('days-count'),   totalDays,    1600);
    counterObs.disconnect();
  }
}, { threshold: 0.3 });
counterObs.observe(statRibbon);


/* ─────────────────────────────────────────────
   HERO SLIDESHOW — cinematic cross-fade + progress bars (mobile-optimized)
───────────────────────────────────────────── */
const slides        = document.querySelectorAll('.slide');
const progressWrap  = document.getElementById('heroProgress');
let current         = 0;
// Shorter slide duration on mobile for better engagement
const SLIDE_DURATION = window.innerWidth <= 768 ? 3000 : 4000;

// Build progress bars
const bars = Array.from({ length: slides.length }, (_, i) => {
  const b = document.createElement('div');
  b.className = 'hero-progress-bar';
  progressWrap.appendChild(b);
  return b;
});

function goTo(idx) {
  // Slide
  slides[current].classList.remove('active');
  bars[current].classList.remove('active');
  bars[current].classList.add('done');

  current = idx % slides.length;

  if (current === 0) {
    // Reset all bars on loop
    bars.forEach(b => b.classList.remove('done', 'active'));
  }

  slides[current].classList.add('active');
  // Small delay so CSS transition resets properly
  requestAnimationFrame(() => {
    requestAnimationFrame(() => bars[current].classList.add('active'));
  });
}

// Init first bar
requestAnimationFrame(() => {
  requestAnimationFrame(() => bars[0].classList.add('active'));
});

setInterval(() => goTo(current + 1), SLIDE_DURATION);


/* ─────────────────────────────────────────────
   GALLERY — drag + nav (mobile-optimized)
───────────────────────────────────────────── */
const trackWrap = document.querySelector('.gallery-track-wrap');
const dots      = document.querySelectorAll('.gdot');

// Responsive card width based on viewport
function getCardWidth() {
  if (window.innerWidth <= 480) return 165; // mobile
  if (window.innerWidth <= 768) return 195; // tablet
  return 270; // desktop
}

let CARD_W = getCardWidth();
window.addEventListener('resize', () => { CARD_W = getCardWidth(); });

let activeCard  = 0;
let dragStart, dragSL, dragging = false;
let isTouch = false;

// Mouse drag for desktop
trackWrap.addEventListener('mousedown', e => {
  isTouch = false;
  dragging = true;
  dragStart = e.pageX - trackWrap.offsetLeft;
  dragSL    = trackWrap.scrollLeft;
  trackWrap.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', () => {
  if (!isTouch) {
    dragging = false;
    trackWrap.style.cursor = 'grab';
  }
});

document.addEventListener('mousemove', e => {
  if (!dragging || isTouch) return;
  e.preventDefault();
  trackWrap.scrollLeft = dragSL - (e.pageX - trackWrap.offsetLeft - dragStart);
});

// Touch drag for mobile (passive for better performance)
let txStart;
trackWrap.addEventListener('touchstart', e => { 
  isTouch = true;
  txStart = e.touches[0].clientX; 
}, { passive: true });

trackWrap.addEventListener('touchmove', e => {
  if (!isTouch) return;
  trackWrap.scrollLeft += (txStart - e.touches[0].clientX) * 0.9;
  txStart = e.touches[0].clientX;
}, { passive: true });

trackWrap.addEventListener('touchend', () => {
  isTouch = false;
}, { passive: true });

function setDot(i) {
  dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
}

document.getElementById('nextBtn').addEventListener('click', () => {
  activeCard = Math.min(activeCard + 1, dots.length - 1);
  trackWrap.scrollBy({ left: CARD_W, behavior: 'smooth' });
  setDot(activeCard);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  activeCard = Math.max(activeCard - 1, 0);
  trackWrap.scrollBy({ left: -CARD_W, behavior: 'smooth' });
  setDot(activeCard);
});

trackWrap.addEventListener('scroll', () => {
  const idx = Math.round(trackWrap.scrollLeft / CARD_W);
  activeCard = Math.min(idx, dots.length - 1);
  setDot(activeCard);
});


/* ─────────────────────────────────────────────
   CLOSING — floating hearts / petals
───────────────────────────────────────────── */
const petalContainer = document.getElementById('petals');
const petalEmojis = ['🌸','✿','❀','🌺','♡','✦','·'];

function spawnPetal() {
  const p = document.createElement('span');
  p.className = 'petal';
  p.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
  p.style.left     = Math.random() * 100 + '%';
  p.style.fontSize = (0.7 + Math.random() * 1.1) + 'rem';
  p.style.animationDuration  = (8 + Math.random() * 10) + 's';
  p.style.animationDelay     = (Math.random() * 6) + 's';
  p.style.opacity = 0;
  petalContainer.appendChild(p);
  setTimeout(() => p.remove(), 20000);
}

// Observe closing section to trigger petals only when visible
const closingSection = document.querySelector('.closing');
let petalsActive = false;
let petalInterval;

const closingObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !petalsActive) {
    petalsActive = true;
    for (let i = 0; i < 12; i++) setTimeout(spawnPetal, i * 400);
    petalInterval = setInterval(spawnPetal, 1800);
  } else if (!entries[0].isIntersecting && petalsActive) {
    petalsActive = false;
    clearInterval(petalInterval);
  }
}, { threshold: 0.15 });

closingObserver.observe(closingSection);


/* ─────────────────────────────────────────────
   MUSIC
───────────────────────────────────────────── */
const bgMusic     = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
bgMusic.volume    = 0.55;
bgMusic.currentTime = 1;
let isPlaying     = false;

function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause();
    musicToggle.classList.remove('playing');
    isPlaying = false;
  } else {
    bgMusic.play().catch(() => {});
    musicToggle.classList.add('playing');
    isPlaying = true;
  }
}

musicToggle.addEventListener('click', toggleMusic);

// Play immediately on page load
bgMusic.play().then(() => {
  musicToggle.classList.add('playing');
  isPlaying = true;
}).catch(() => {
  // Browser blocked autoplay — fall back to first interaction
  function tryAutoPlay() {
    if (!isPlaying) {
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
        isPlaying = true;
        ['click','touchstart','keydown'].forEach(ev =>
          document.removeEventListener(ev, tryAutoPlay));
      }).catch(() => {});
    }
  }
  ['click','touchstart','keydown'].forEach(ev =>
    document.addEventListener(ev, tryAutoPlay, { once: true }));
});


/* ─────────────────────────────────────────────
   PARALLAX — subtle hero depth (mobile-optimized)
───────────────────────────────────────────── */
const heroSlideshow = document.getElementById('heroSlideshow');
const isMobile = window.innerWidth <= 768;

// Disable parallax on mobile for better performance
if (!isMobile) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroSlideshow.style.transform = `translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}