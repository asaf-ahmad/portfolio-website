/* ═══════════════════════════════════════════════════════════
   Asaf Ahmad Shayaan — Portfolio Database v12
   Unified data layer with Collection API
   ═══════════════════════════════════════════════════════════ */

var CATEGORIES = [
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

var READ_LENGTHS = [
  { id: "rapid",  label: "Rapid Read",  mins: "< 3 min",  color: "#059669" },
  { id: "medium", label: "Medium Read", mins: "5-8 min",  color: "#B8962E" },
  { id: "long",   label: "Long Read",   mins: "10+ min",  color: "#8B3A2A" }
];

var COVER_IMAGES = CATEGORIES.map(function(c) { return { id: c.id, label: c.label, url: c.url }; });


/* ═══════════════════════════════════════════════════════════
   COLLECTION — reusable CRUD engine
   ═══════════════════════════════════════════════════════════ */
function Collection(key, prefix, required) {
  this._key = key;
  this._prefix = prefix;
  this._required = required || [];
}

Collection.prototype.getAll = function() {
  try { return JSON.parse(localStorage.getItem(this._key) || '[]'); }
  catch(e) { return []; }
};

Collection.prototype.getById = function(id) {
  var items = this.getAll();
  for (var i = 0; i < items.length; i++) { if (items[i].id === id) return items[i]; }
  return null;
};

Collection.prototype.count = function() {
  return this.getAll().length;
};

Collection.prototype.save = function(record) {
  if (!record.id) {
    for (var i = 0; i < this._required.length; i++) {
      var f = this._required[i];
      if (!record[f] || (typeof record[f] === 'string' && !record[f].trim()))
        return { error: f + ' is required' };
    }
  }
  var items = this.getAll();
  if (record.id) {
    var found = false;
    for (var j = 0; j < items.length; j++) {
      if (items[j].id === record.id) { record.updatedAt = new Date().toISOString(); items[j] = record; found = true; break; }
    }
    if (!found) items.unshift(record);
  } else {
    record.id = this._prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    record.date = record.date || new Date().toISOString();
    record.createdAt = new Date().toISOString();
    items.unshift(record);
  }
  localStorage.setItem(this._key, JSON.stringify(items));
  return record;
};

Collection.prototype.delete = function(id) {
  var items = this.getAll();
  var filtered = items.filter(function(r) { return r.id !== id; });
  if (filtered.length < items.length) {
    localStorage.setItem(this._key, JSON.stringify(filtered));
    return true;
  }
  return false;
};

Collection.prototype.patch = function(id, field, value) {
  var items = this.getAll();
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      items[i][field] = value;
      items[i].updatedAt = new Date().toISOString();
      localStorage.setItem(this._key, JSON.stringify(items));
      return items[i];
    }
  }
  return null;
};

Collection.prototype.query = function(fn) {
  return this.getAll().filter(fn);
};

Collection.prototype.recent = function(n) {
  return this.getAll().slice(0, n || 5);
};


/* ═══════════════════════════════════════════════════════════
   DB — unified database
   ═══════════════════════════════════════════════════════════ */
var DB = {
  posts:      new Collection('asaf_posts',     'post', ['title', 'content']),
  portfolios: new Collection('asaf_portfolio', 'pf',   ['title', 'html']),
  sketches:   new Collection('asaf_sketches',  'sk',   ['title']),
  poems:      new Collection('asaf_poems',     'pm',   ['title', 'body']),
  requests:   new Collection('asaf_requests',  'req',  ['name', 'email', 'service']),

  /* Resume (singleton) */
  getResume: function() {
    try { return JSON.parse(localStorage.getItem('asaf_resume') || 'null'); } catch(e) { return null; }
  },
  saveResume: function(d) { localStorage.setItem('asaf_resume', JSON.stringify(d)); },
  removeResume: function() { localStorage.removeItem('asaf_resume'); },

  /* Auth */
  getPassword: function() { return localStorage.getItem('asaf_admin_pass') || 'Asaf@2026'; },
  setPassword: function(p) { localStorage.setItem('asaf_admin_pass', p); },
  isLoggedIn: function() { return sessionStorage.getItem('asaf_auth') === 'true'; },
  login: function(pass) {
    if (pass === this.getPassword()) { sessionStorage.setItem('asaf_auth', 'true'); return true; }
    return false;
  },
  logout: function() { sessionStorage.removeItem('asaf_auth'); },

  /* Theme */
  getTheme: function() { return localStorage.getItem('asaf_theme') || 'minimal'; },
  setTheme: function(t) { localStorage.setItem('asaf_theme', t); },

  /* Stats */
  stats: function() {
    return {
      posts: this.posts.count(), portfolios: this.portfolios.count(),
      sketches: this.sketches.count(), poems: this.poems.count(),
      requests: this.requests.count(), hasResume: this.getResume() !== null
    };
  },

  /* Export all data for backup */
  exportAll: function() {
    return JSON.stringify({
      _v: 12, _at: new Date().toISOString(),
      posts: this.posts.getAll(), portfolios: this.portfolios.getAll(),
      sketches: this.sketches.getAll(), poems: this.poems.getAll(),
      requests: this.requests.getAll(), resume: this.getResume()
    });
  },

  /* Import from backup */
  importAll: function(json) {
    try {
      var d = JSON.parse(json);
      if (d.posts)      localStorage.setItem('asaf_posts',     JSON.stringify(d.posts));
      if (d.portfolios) localStorage.setItem('asaf_portfolio', JSON.stringify(d.portfolios));
      if (d.sketches)   localStorage.setItem('asaf_sketches',  JSON.stringify(d.sketches));
      if (d.poems)      localStorage.setItem('asaf_poems',     JSON.stringify(d.poems));
      if (d.requests)   localStorage.setItem('asaf_requests',  JSON.stringify(d.requests));
      if (d.resume)     localStorage.setItem('asaf_resume',    JSON.stringify(d.resume));
      return { success: true };
    } catch(e) { return { error: e.message }; }
  },

  /* Backward-compat aliases */
  getPosts:         function()   { return this.posts.getAll(); },
  getPost:          function(id) { return this.posts.getById(id); },
  savePost:         function(p)  { return this.posts.save(p); },
  deletePost:       function(id) { return this.posts.delete(id); },
  getPortfolios:    function()   { return this.portfolios.getAll(); },
  getPortfolioItem: function(id) { return this.portfolios.getById(id); },
  savePortfolio:    function(p)  { return this.portfolios.save(p); },
  deletePortfolio:  function(id) { return this.portfolios.delete(id); }
};


/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
function toast(msg, type) {
  type = type || 'success';
  var el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg; el.className = 'toast ' + type;
  setTimeout(function() { el.classList.add('show'); }, 10);
  setTimeout(function() { el.classList.remove('show'); }, 3000);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function stripHtml(html) {
  var d = document.createElement('div'); d.innerHTML = html;
  return d.textContent || d.innerText || '';
}

function requireAuth() { if (!DB.isLoggedIn()) window.location.href = 'admin.html'; }


/* ═══════════════════════════════════════════════════════════
   BLOG CARD BUILDER
   ═══════════════════════════════════════════════════════════ */
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
    '</div><div class="blog-date">' + formatDate(p.date) + '</div>' +
    '<h3 class="blog-title">' + p.title + '</h3>' +
    '<p class="blog-excerpt">' + stripHtml(p.content).substring(0, excerptLen) + '...</p>' +
    '<span class="blog-read-more">Read more &rarr;</span></div>';
}


/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════════════════════════ */
function toggleTheme() {
  var isCreative = !document.body.classList.contains('minimal-mode');
  if (isCreative) { document.body.classList.add('minimal-mode'); DB.setTheme('minimal'); }
  else { document.body.classList.remove('minimal-mode'); DB.setTheme('creative'); }
  var tm = document.getElementById('toggle-minimal');
  var tc = document.getElementById('toggle-creative');
  if (tm) tm.classList.toggle('active', document.body.classList.contains('minimal-mode'));
  if (tc) tc.classList.toggle('active', !document.body.classList.contains('minimal-mode'));
}

function restoreTheme() {
  // ?theme=artsy or ?theme=minimal in the URL switches (and remembers) the view
  var q = new URLSearchParams(window.location.search).get('theme');
  if (q === 'artsy' || q === 'creative') DB.setTheme('creative');
  else if (q === 'minimal') DB.setTheme('minimal');
  if (DB.getTheme() === 'creative') {
    document.body.classList.remove('minimal-mode');
    var tm = document.getElementById('toggle-minimal');
    var tc = document.getElementById('toggle-creative');
    if (tm) tm.classList.remove('active');
    if (tc) tc.classList.add('active');
  }
}


/* ═══════════════════════════════════════════════════════════
   SHARED INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', function() { links.classList.toggle('open'); });
  restoreTheme();
  var cur = document.getElementById('cursor'), ring = document.getElementById('cursor-ring');
  if (cur && ring && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function(e) {
      cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
      setTimeout(function() { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; }, 60);
    });
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
});
