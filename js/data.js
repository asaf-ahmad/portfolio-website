/* ═══════════════════════════════════════════════════════════
   Asaf Ahmad Shayaan — Portfolio Database v13
   Unified data layer with Collection API
   ═══════════════════════════════════════════════════════════ */

var CATEGORIES = [
  { id: "product",      label: "Product Management",           url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80", color: "#2E2416" },
  { id: "books",        label: "Learnings from Books",         url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80", color: "#3D2B1F" },
  { id: "ai",           label: "AI in Lending",                url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80", color: "#1A1A2E" },
  { id: "los",          label: "Loan Origination Systems",     url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",  color: "#1A3A5C" },
  { id: "underwriting", label: "Credit Underwriting",          url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80", color: "#2D1B1B" },
  { id: "collections",  label: "Collections",                  url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", color: "#1C2B3A" },
  { id: "lending",      label: "Digital Lending & Onboarding", url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",  color: "#2C4A3E" },
  { id: "fintech",      label: "Fintech & Banking",            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",  color: "#0F2027" },
  { id: "presales",     label: "Pre-Sales & GTM",              url: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=800&q=80",  color: "#2A1F0F" },
  { id: "career",       label: "Career in Product",            url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",  color: "#1F2937" },
  { id: "data",         label: "Data & Analytics",             url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80", color: "#0D1B2A" },
  { id: "ux",           label: "UX & Design",                  url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80", color: "#1A1A1A" }
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
  getTheme: function() { return localStorage.getItem('asaf_theme') || 'creative'; },
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
   CONTENT — public articles & documents from data/learnings.json
   localStorage posts are private to this browser; anything in the
   JSON file is served by GitHub Pages to every visitor (and Google).
   ═══════════════════════════════════════════════════════════ */
var Content = {
  _data: null, _loading: null,
  load: function(cb) {
    var self = this;
    if (self._data) { cb(self._data); return; }
    if (!self._loading) {
      self._loading = fetch('data/learnings.json', { cache: 'no-cache' })
        .then(function(r) { return r.ok ? r.json() : { articles: [], documents: [] }; })
        .catch(function() { return { articles: [], documents: [] }; })
        .then(function(d) { d.articles = d.articles || []; d.documents = d.documents || []; self._data = d; return d; });
    }
    self._loading.then(cb);
  },
  /* All articles: static JSON first, then anything drafted locally in the admin */
  articles: function() {
    var fromJson = (this._data ? this._data.articles : []).map(function(a) {
      return { id: a.id, title: a.title, date: a.date, cover: a.category, readlength: a.readlength,
               excerpt: a.excerpt || '', content: a.content || '', source: a.source || '', url: a.url || '', banner: a.banner || '', medium: a.medium || '', isStatic: true };
    });
    var ids = {}; fromJson.forEach(function(a) { ids[a.id] = true; });
    var local = DB.getPosts().filter(function(p) { return !ids[p.id]; });
    return fromJson.concat(local).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  },
  article: function(id) {
    var list = this.articles();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  },
  documents: function() {
    return (this._data ? this._data.documents : []).slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  },
  /* Resolve the HTML body of an article (inline content or a fetched file) */
  body: function(a, cb) {
    if (a.content) { cb(a.content); return; }
    if (a.source) {
      fetch(a.source).then(function(r) { return r.ok ? r.text() : ''; }).catch(function() { return ''; }).then(cb);
      return;
    }
    cb('');
  }
};


/* ═══════════════════════════════════════════════════════════
   SITE CONTENT — data/site.json hydrates [data-site*] elements
   ═══════════════════════════════════════════════════════════ */
function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function getPath(o, p) { return p.split('.').reduce(function(a, k) { return a == null ? undefined : a[k]; }, o); }
function fetchJSON(url, cb) {
  fetch(url, { cache: 'no-cache' }).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }).then(cb);
}
var SiteRenderers = {
  stats: function(a) { return a.map(function(x) { return '<div class="stat-item"><div class="stat-value">' + x.value.replace(/\+$/, '<sup style="font-size:0.5em;vertical-align:super">+</sup>') + '</div><div class="stat-label">' + esc(x.label) + '</div></div>'; }).join(''); },
  tech: function(a) { return a.map(function(x) { return '<li>' + esc(x) + '</li>'; }).join(''); },
  hobbies: function(a) { return '<span class="hobby-label">Off the clock</span>' + a.map(function(h) { return '<div class="hobby"><span class="hobby-icon">' + h.icon + '</span><div><strong>' + esc(h.title) + '</strong><small>' + esc(h.note) + '</small></div></div>'; }).join(''); },
  about_paragraphs: function(a) { return a.map(function(p, i) { return '<p style="margin-bottom:' + (i === a.length - 1 ? 36 : 18) + 'px">' + esc(p) + '</p>'; }).join(''); },
  profile: function(a) { return a.map(function(r) { return '<div style="display:flex;gap:16px"><span style="color:rgba(247,244,238,0.3);font-size:0.72rem;width:90px;flex-shrink:0;font-family:\'DM Mono\',monospace;letter-spacing:0.06em;text-transform:uppercase;padding-top:2px">' + esc(r.k) + '</span><span style="font-size:0.92rem;color:var(--paper)">' + esc(r.v) + '</span></div>'; }).join(''); },
  competencies: function(a) { return a.map(function(t) { return '<span class="tag">' + esc(t) + '</span>'; }).join(''); }
};
function hydrateSite(d) {
  if (!d) return;
  document.querySelectorAll('[data-site]').forEach(function(el) { var v = getPath(d, el.getAttribute('data-site')); if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('[data-site-html]').forEach(function(el) { var v = getPath(d, el.getAttribute('data-site-html')); if (typeof v === 'string') el.innerHTML = v; });
  document.querySelectorAll('[data-site-href]').forEach(function(el) {
    var spec = el.getAttribute('data-site-href'), m = spec.match(/^(mailto|tel|wa):(.+)$/), key = m ? m[2] : spec, v = getPath(d, key);
    if (typeof v !== 'string') return;
    if (!m) el.href = v;
    else if (m[1] === 'mailto') el.href = 'mailto:' + v;
    else if (m[1] === 'tel') el.href = 'tel:' + v;
    else el.href = 'https://wa.me/' + v + (d.contact && d.contact.whatsapp_text ? '?text=' + encodeURIComponent(d.contact.whatsapp_text) : '');
  });
  document.querySelectorAll('[data-site-render]').forEach(function(el) {
    var name = el.getAttribute('data-site-render'), src = el.getAttribute('data-site-src'), v = getPath(d, src);
    if (Array.isArray(v) && SiteRenderers[name]) el.innerHTML = SiteRenderers[name](v);
  });
}

/* ═══════════════════════════════════════════════════════════
   EXPERIENCE + SERVICES — rendered from data/*.json
   ═══════════════════════════════════════════════════════════ */
function renderExperience(d) {
  if (!d) return;
  var t = document.getElementById('exp-title'), su = document.getElementById('exp-sub');
  if (t && d.header) t.textContent = d.header.title; if (su && d.header) su.textContent = d.header.sub;
  var tl = document.getElementById('timeline-root');
  if (tl && d.timeline) tl.innerHTML = d.timeline.map(function(j) {
    return '<div class="timeline-item"><div class="timeline-date">' + esc(j.period) + '</div><div class="timeline-title">' + esc(j.title) + '</div><div class="timeline-company">' + esc(j.company) + '</div>' +
      '<div class="timeline-body">' + (j.bullets && j.bullets.length > 1 ? '<ul>' + j.bullets.map(function(b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '<p>' + esc((j.bullets || [])[0] || '') + '</p>') + '</div>' +
      (j.tags && j.tags.length ? '<div class="timeline-tags">' + j.tags.map(function(x) { return '<span class="tag">' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div>';
  }).join('');
  var ed = document.getElementById('education-root');
  if (ed && d.education) ed.innerHTML = d.education.map(function(e, i) { return '<div class="card" style="margin-bottom:' + (i === d.education.length - 1 ? 48 : 24) + 'px"><span class="card-tag">' + esc(e.period) + '</span><h3>' + esc(e.degree) + '</h3><p style="margin-top:8px">' + esc(e.school) + '</p></div>'; }).join('');
  var aw = document.getElementById('awards-root');
  if (aw && d.awards) aw.innerHTML = d.awards.map(function(a) { return '<li><strong>' + esc(a.title) + '</strong>' + (a.detail ? ', ' + esc(a.detail) : '') + '</li>'; }).join('');
  var co = document.getElementById('competencies-root');
  if (co && d.competencies) co.innerHTML = d.competencies.map(function(c, i) { return '<p style="font-size:0.68rem;font-weight:700;color:var(--accent);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em;font-family:\'DM Mono\',monospace">' + esc(c.group) + '</p><p style="font-size:0.88rem;color:var(--text-muted)' + (i === d.competencies.length - 1 ? '' : ';margin-bottom:18px') + '">' + esc(c.items) + '</p>'; }).join('');
}
function renderServices(d) {
  if (!d) return;
  function head(sec, blk) { if (!sec || !blk) return; var l = sec.querySelector('.section-label'), t = sec.querySelector('.section-title'), ds = sec.querySelector('.section-desc'); if (l && blk.label) l.textContent = blk.label; if (t && blk.title) t.textContent = blk.title; if (ds && blk.desc) ds.textContent = blk.desc; }
  function cards(items) { return items.map(function(x) { return '<div class="card service-card" onclick="selectService(\'' + esc(x.title).replace(/'/g, "\\'") + '\',this)"><div class="service-icon">' + x.icon + '</div><span class="card-tag">' + esc(x.tag) + '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.desc) + '</p><span class="service-price">' + esc(x.price) + '</span></div>'; }).join(''); }
  var h1 = document.querySelector('.page-header h1'), hp = document.querySelector('.page-header p');
  if (h1 && d.header) h1.textContent = d.header.title; if (hp && d.header) hp.textContent = d.header.sub;
  var c = document.getElementById('consultancy'), m = document.getElementById('mentoring');
  if (c && d.consultancy) { head(c, d.consultancy); var g = c.querySelector('.services-grid'); if (g) g.innerHTML = cards(d.consultancy.items || []); }
  if (m && d.mentoring) { head(m, d.mentoring); var g2 = m.querySelector('.services-grid'); if (g2) g2.innerHTML = cards(d.mentoring.items || []); }
  var st = document.querySelector('.steps');
  if (st && d.steps) { head(st.closest('section'), d.steps); st.innerHTML = (d.steps.items || []).map(function(x) { return '<div class="step"><h3>' + esc(x.title) + '</h3><p>' + esc(x.desc) + '</p></div>'; }).join(''); }
  var fq = document.querySelector('.faq');
  if (fq && d.faq) { head(fq.closest('section'), d.faq); fq.innerHTML = (d.faq.items || []).map(function(x) { return '<details><summary>' + esc(x.q) + '</summary><p>' + esc(x.a) + '</p></details>'; }).join(''); }
  if (d.form) { var ft = document.querySelector('#booking-section h3'), fh = document.getElementById('selected-service-label'), fb = document.querySelector('#booking-section .btn'); if (ft) ft.textContent = d.form.title; if (fh && !fh.dataset.touched) fh.textContent = d.form.hint; if (fb && d.form.button) fb.innerHTML = esc(d.form.button); }
}


/* ═══════════════════════════════════════════════════════════
   ANALYTICS — GoatCounter page views + a time-on-page beacon
   ═══════════════════════════════════════════════════════════ */
function initAnalytics(d) {
  var code = d && d.analytics && d.analytics.goatcounter;
  if (!code || /^(localhost|127\.)/.test(location.hostname)) return;
  var endpoint = 'https://' + code + '.goatcounter.com/count';
  var s = document.createElement('script'); s.async = true; s.src = '//gc.zgo.at/count.js'; s.setAttribute('data-goatcounter', endpoint); document.head.appendChild(s);
  var start = Date.now(), active = 0, sent = false;
  document.addEventListener('visibilitychange', function() { if (document.hidden) { active += Date.now() - start; } else { start = Date.now(); } });
  function bucket(sec) { return sec < 10 ? 't-10s' : sec < 30 ? 't-30s' : sec < 60 ? 't-60s' : sec < 180 ? 't-3m' : sec < 600 ? 't-10m' : 't-10m-plus'; }
  window.addEventListener('pagehide', function() {
    if (sent) return; sent = true;
    var sec = Math.round((active + (document.hidden ? 0 : Date.now() - start)) / 1000);
    var url = endpoint + '?p=' + encodeURIComponent(bucket(sec)) + '&e=true&t=' + encodeURIComponent('Time on page ' + bucket(sec)) + '&r=' + encodeURIComponent(location.pathname);
    if (navigator.sendBeacon) navigator.sendBeacon(url); else { var i = new Image(); i.src = url; }
  });
}

/* ═══════════════════════════════════════════════════════════
   FORMS — post to the configured endpoint, fall back to mailto
   ═══════════════════════════════════════════════════════════ */
function postForm(fields, subject) {
  var ep = window.SITE && window.SITE.forms && window.SITE.forms.endpoint;
  var email = (window.SITE && window.SITE.contact && window.SITE.contact.email) || 'asaf.ahmad.shayaan@gmail.com';
  var body = Object.keys(fields).map(function(k) { return k + ': ' + fields[k]; }).join('\n');
  function mailto() { window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); return Promise.resolve({ via: 'mailto' }); }
  if (!ep) return mailto();
  var f = window.SITE.forms, payload;
  if (/web3forms/.test(ep)) {
    if (!f.access_key) return mailto();
    payload = Object.assign({}, fields, { access_key: f.access_key, subject: subject, from_name: 'asafahmad.com', botcheck: '' });
  } else {
    payload = Object.assign({}, fields, { _subject: subject, _template: 'table', _captcha: 'false', _honey: '' });
  }
  return fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
    .then(function(r) { return r.json().catch(function() { return {}; }).then(function(j) { if (r.ok && j && (j.success === 'true' || j.success === true)) return { via: 'endpoint' }; throw new Error('endpoint rejected'); }); })
    .catch(function() { return mailto(); });
}
function initNoteBox(d) {
  var box = document.getElementById('notebox'); if (!box) return;
  var nb = d.notebox || {};
  var btn = box.querySelector('button'), msg = document.getElementById('nb-msg'), name = document.getElementById('nb-name'), mail = document.getElementById('nb-email'), done = document.getElementById('nb-done');
  if (nb.placeholder) msg.placeholder = nb.placeholder;
  btn.onclick = function() {
    var text = msg.value.trim(); if (!text) { msg.focus(); toast('Write something first', 'error'); return; }
    if (box.querySelector('#nb-hp') && box.querySelector('#nb-hp').value) return;
    btn.disabled = true; btn.textContent = 'Sending…';
    postForm({ message: text, name: name.value.trim() || 'Anonymous', email: mail.value.trim() || 'not given', page: location.href }, '[asafahmad.com] Note from ' + (name.value.trim() || 'a visitor'))
      .then(function(r) { box.querySelector('.nb-form').style.display = 'none'; done.textContent = r.via === 'mailto' ? 'Your email app should have opened with the note ready to send.' : (nb.thanks || 'Thank you.'); done.style.display = 'block'; })
      .catch(function() { btn.disabled = false; btn.textContent = nb.button || 'Send'; toast('Could not send. Please email me directly.', 'error'); });
  };
}


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
  var img = p.banner || (cat ? cat.url : '');
  var bg  = img ? "background-image:url('" + img + "');background-size:cover;background-position:center" : 'background:linear-gradient(135deg,#111,#2a2a2a)';
  var badges = '';
  if (rl)  badges += '<span class="card-badge" style="background:' + rl.color + '">' + rl.label + '</span>';
  if (cat) badges += '<span class="card-badge card-badge-dark">' + cat.label + '</span>';
  var text = p.excerpt || stripHtml(p.content || '');
  if (text.length > excerptLen) text = text.substring(0, excerptLen).replace(/\s+\S*$/, '') + '…';
  var open = p.url ? "window.open('" + p.url + "','_blank','noopener')" : "window.location='post.html?id=" + p.id + "'";
  var more = p.url ? 'Read on Medium &nearr;' : 'Read article &rarr;';
  return '<article class="card blog-card" onclick="' + open + '">' +
    '<div class="blog-card-img' + (p.banner ? ' has-banner' : '') + '" style="' + bg + ';position:relative" role="img" aria-label="' + (cat ? cat.label : 'Article') + '">' +
    (badges ? '<div class="card-badges">' + badges + '</div>' : '') +
    '</div><div class="blog-date">' + formatDate(p.date) + '</div>' +
    '<h3 class="blog-title">' + p.title + '</h3>' +
    '<p class="blog-excerpt">' + text + '</p>' +
    '<span class="blog-read-more">' + more + '</span></article>';
}

function buildDocCard(d) {
  var cat = d.category ? CATEGORIES.find(function(c) { return c.id === d.category; }) : null;
  var type = (d.type || (d.file || '').split('.').pop() || 'file').toUpperCase();
  var isPdf = type === 'PDF';
  return '<a class="doc-card" href="' + d.file + '" target="_blank" rel="noopener">' +
    '<span class="doc-type ' + (isPdf ? 'pdf' : 'ppt') + '">' + type + '</span>' +
    '<div class="doc-info"><h3>' + d.title + '</h3>' +
    (d.description ? '<p>' + d.description + '</p>' : '') +
    '<div class="doc-meta">' + formatDate(d.date) + (cat ? ' &middot; ' + cat.label : '') + (d.pages ? ' &middot; ' + d.pages + ' pages' : '') + '</div></div>' +
    '<span class="doc-dl" aria-hidden="true">&darr;</span></a>';
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
  var minimal = document.body.hasAttribute('data-force-minimal') || DB.getTheme() === 'minimal';
  document.body.classList.toggle('minimal-mode', minimal);
  var tm = document.getElementById('toggle-minimal');
  var tc = document.getElementById('toggle-creative');
  if (tm) tm.classList.toggle('active', minimal);
  if (tc) tc.classList.toggle('active', !minimal);
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
  fetchJSON('data/site.json', function(d) { hydrateSite(d); window.SITE = d; initAnalytics(d); initNoteBox(d); });
  if (document.getElementById('timeline-root')) fetchJSON('data/experience.json', renderExperience);
  if (document.getElementById('consultancy')) fetchJSON('data/services.json', renderServices);
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
