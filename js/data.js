/* ═══════════════════════════════════════════════════
   Asaf Ahmad Shayaan — Portfolio Data Layer
   ═══════════════════════════════════════════════════ */

const CATEGORIES = [
  { id: "los",         label: "Loan Origination Systems",   url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",  color: "#1A3A5C" },
  { id: "lending",     label: "Digital Lending",            url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",  color: "#2C4A3E" },
  { id: "msme",        label: "MSME & Credit",              url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", color: "#3D2B1F" },
  { id: "collections", label: "Collections",                url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", color: "#1C2B3A" },
  { id: "ai",          label: "AI in Fintech",              url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80", color: "#1A1A2E" },
  { id: "product",     label: "Product Strategy",           url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80", color: "#2E2416" },
  { id: "ux",          label: "UX & Design",                url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80", color: "#1A1A1A" },
  { id: "career",      label: "Career in Product",          url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",  color: "#1F2937" },
  { id: "fintech",     label: "Fintech Trends",             url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",  color: "#0F2027" },
  { id: "banking",     label: "Banking Technology",         url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", color: "#1C1C2E" },
  { id: "underwriting",label: "Credit Underwriting",        url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80", color: "#2D1B1B" },
  { id: "startup",     label: "Startup & Growth",           url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", color: "#1A2A1A" },
  { id: "presales",    label: "Pre-Sales & GTM",            url: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=800&q=80",  color: "#2A1F0F" },
  { id: "data",        label: "Data & Analytics",           url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80", color: "#0D1B2A" },
  { id: "payments",    label: "Payments & Embedded Finance",url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80", color: "#1A0A2E" }
];

const READ_LENGTHS = [
  { id: "rapid",  label: "Rapid Read",  mins: "< 3 min",  color: "#059669" },
  { id: "medium", label: "Medium Read", mins: "5-8 min",  color: "#B8962E" },
  { id: "long",   label: "Long Read",   mins: "10+ min",  color: "#8B3A2A" }
];

// Backward compat
const COVER_IMAGES = CATEGORIES.map(function(c) { return { id: c.id, label: c.label, url: c.url }; });

/* ── Database ──────────────────────────────────────── */
const DB = {
  // Blog
  getPosts: function() { return JSON.parse(localStorage.getItem('asaf_posts') || '[]'); },
  savePost: function(post) {
    var posts = this.getPosts();
    if (post.id) {
      var i = posts.findIndex(function(p) { return p.id === post.id; });
      if (i > -1) posts[i] = post; else posts.unshift(post);
    } else {
      post.id = 'post_' + Date.now();
      post.date = post.date || new Date().toISOString();
      posts.unshift(post);
    }
    localStorage.setItem('asaf_posts', JSON.stringify(posts));
    return post;
  },
  deletePost: function(id) {
    var posts = this.getPosts().filter(function(p) { return p.id !== id; });
    localStorage.setItem('asaf_posts', JSON.stringify(posts));
  },
  getPost: function(id) { return this.getPosts().find(function(p) { return p.id === id; }); },

  // Portfolio
  getPortfolios: function() { return JSON.parse(localStorage.getItem('asaf_portfolio') || '[]'); },
  savePortfolio: function(item) {
    var items = this.getPortfolios();
    if (item.id) {
      var i = items.findIndex(function(p) { return p.id === item.id; });
      if (i > -1) items[i] = item; else items.unshift(item);
    } else {
      item.id = 'pf_' + Date.now();
      item.date = new Date().toISOString();
      items.unshift(item);
    }
    localStorage.setItem('asaf_portfolio', JSON.stringify(items));
    return item;
  },
  deletePortfolio: function(id) {
    var items = this.getPortfolios().filter(function(p) { return p.id !== id; });
    localStorage.setItem('asaf_portfolio', JSON.stringify(items));
  },
  getPortfolioItem: function(id) { return this.getPortfolios().find(function(p) { return p.id === id; }); },

  // Auth
  ADMIN_KEY: 'asaf_admin_pass',
  getPassword: function() { return localStorage.getItem(this.ADMIN_KEY) || 'Asaf@2026'; },
  setPassword: function(p) { localStorage.setItem(this.ADMIN_KEY, p); },
  isLoggedIn: function() { return sessionStorage.getItem('asaf_auth') === 'true'; },
  login: function(pass) {
    if (pass === this.getPassword()) { sessionStorage.setItem('asaf_auth', 'true'); return true; }
    return false;
  },
  logout: function() { sessionStorage.removeItem('asaf_auth'); }
};

/* ── Helpers ────────────────────────────────────────── */
function toast(msg, type) {
  type = type || 'success';
  var el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast ' + type;
  setTimeout(function() { el.classList.add('show'); }, 10);
  setTimeout(function() { el.classList.remove('show'); }, 3000);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function stripHtml(html) {
  var d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
}

function requireAuth() {
  if (!DB.isLoggedIn()) window.location.href = 'admin.html';
}

/* ── Blog Card Builder ─────────────────────────────── */
function buildBlogCard(p, excerptLen) {
  var cat = p.cover ? CATEGORIES.find(function(c) { return c.id === p.cover; }) : null;
  var rl  = p.readlength ? READ_LENGTHS.find(function(r) { return r.id === p.readlength; }) : null;
  var bg  = cat ? "background-image:url('" + cat.url + "');background-size:cover;background-position:center" : 'background:linear-gradient(135deg,#111,#2a2a2a)';
  var badges = '';
  if (rl)  badges += '<span style="font-family:\'DM Mono\',monospace;font-size:0.6rem;text-transform:uppercase;background:' + rl.color + ';color:#fff;padding:3px 8px;border-radius:2px">' + rl.label + '</span>';
  if (cat) badges += '<span style="font-family:\'DM Mono\',monospace;font-size:0.6rem;text-transform:uppercase;background:rgba(0,0,0,0.6);color:#fff;padding:3px 8px;border-radius:2px;backdrop-filter:blur(4px)">' + cat.label + '</span>';
  return '<div class="card blog-card" onclick="window.location=\'post.html?id=' + p.id + '\'">' +
    '<div class="blog-card-img" style="' + bg + ';position:relative">' +
    (badges ? '<div style="position:absolute;bottom:12px;left:12px;display:flex;gap:6px;flex-wrap:wrap">' + badges + '</div>' : '') +
    '</div>' +
    '<div class="blog-date">' + formatDate(p.date) + '</div>' +
    '<h3 class="blog-title">' + p.title + '</h3>' +
    '<p class="blog-excerpt">' + stripHtml(p.content).substring(0, excerptLen) + '...</p>' +
    '<span class="blog-read-more">Read more &rarr;</span></div>';
}

/* ── Theme Toggle ──────────────────────────────────── */
function toggleTheme() {
  var isCreative = !document.body.classList.contains('minimal-mode');
  if (isCreative) {
    document.body.classList.add('minimal-mode');
    var tm = document.getElementById('toggle-minimal');
    var tc = document.getElementById('toggle-creative');
    if (tm) tm.classList.add('active');
    if (tc) tc.classList.remove('active');
    localStorage.setItem('asaf_theme', 'minimal');
  } else {
    document.body.classList.remove('minimal-mode');
    var tm2 = document.getElementById('toggle-minimal');
    var tc2 = document.getElementById('toggle-creative');
    if (tm2) tm2.classList.remove('active');
    if (tc2) tc2.classList.add('active');
    localStorage.setItem('asaf_theme', 'creative');
  }
}

function restoreTheme() {
  var saved = localStorage.getItem('asaf_theme');
  if (saved === 'creative') {
    document.body.classList.remove('minimal-mode');
    var tm = document.getElementById('toggle-minimal');
    var tc = document.getElementById('toggle-creative');
    if (tm) tm.classList.remove('active');
    if (tc) tc.classList.add('active');
  }
}

/* ── Shared Init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  // Nav active state
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function() { links.classList.toggle('open'); });
  }

  // Restore theme
  restoreTheme();

  // Cursor (only in creative mode, only on non-touch devices)
  var cur = document.getElementById('cursor');
  var ring = document.getElementById('cursor-ring');
  if (cur && ring && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function(e) {
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
      setTimeout(function() {
        ring.style.left = e.clientX + 'px';
        ring.style.top = e.clientY + 'px';
      }, 60);
    });
  }

  // Scroll reveal
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
});
