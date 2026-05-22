import Alpine from 'alpinejs';
import './site.css';
import { initRouter } from './router';
import { populateHomePage } from './home';
import { siteContent, programDescriptors } from './content';

// Alpine handles mobile nav dropdowns via x-data attributes in the HTML
(window as unknown as Record<string, unknown>).Alpine = Alpine;
Alpine.start();

// Populate home page text and cards from captive JSON files.
// Must run before initRouter so dynamic cards have proper hrefs when the
// router fires on first load (e.g. direct link to #publications/articles/foo).
populateHomePage(siteContent, programDescriptors);

// Content router — no fetch(), reads from build-time bundle
initRouter();

// ── Scroll-aware nav ──────────────────────────────────────────────────────────
const nav = document.getElementById('nav')!;
window.addEventListener('scroll', () => {
  // The content viewer scrolls internally, so window.scrollY stays 0.
  // CSS sibling selector handles the nav appearance when viewer is open;
  // this listener handles the normal scroll case only.
  const viewerOpen = document.getElementById('content-view')!.classList.contains('active');
  if (!viewerOpen) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Theme toggle ──────────────────────────────────────────────────────────────
const THEME_KEY = 'isrd-theme';
const themeToggle = document.getElementById('theme-toggle')!;

function applyTheme(theme: string): void {
  document.documentElement.setAttribute('data-theme', theme);
  // Minimal icon-only toggle; ☀ = switch to light, ☾ = switch to dark
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  localStorage.setItem(THEME_KEY, theme);
}

// Sync button label with whatever the FOUC-prevention script already applied
applyTheme(localStorage.getItem(THEME_KEY) ?? 'dark');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') ?? 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ── Mobile nav — close on link tap ───────────────────────────────────────────
nav.addEventListener('touchend', e => {
  const link = (e.target as Element).closest('.nav-links a');
  if (!link) return;
  if (!link.parentElement!.classList.contains('has-dropdown')) {
    window.dispatchEvent(new CustomEvent('close-nav'));
  }
}, { passive: true });

// ── Star field ────────────────────────────────────────────────────────────────
function makeStars(canvasId: string, count: number, size: number, opacity: number): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const hero = canvas.parentElement!;
  canvas.width  = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = canvas.height * 0.28 + Math.random() * canvas.height * 0.68;
    const r = Math.random() * size + 0.2;
    const a = Math.random() * opacity + opacity * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  }
}

function drawAllStars(): void {
  makeStars('stars1', 260, 0.6, 0.55);
  makeStars('stars2',  80, 1.1, 0.75);
  makeStars('stars3',  20, 1.8, 0.90);
}

drawAllStars();
window.addEventListener('resize', drawAllStars);
