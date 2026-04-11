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

// Keep backward compat
const COVER_IMAGES = CATEGORIES.map(c => ({ id: c.id, label: c.label, url: c.url }));

const DB = {
  // ── Blog ──────────────────────────────────────
  getPosts() {
    return JSON.parse(localStorage.getItem('asaf_posts') || '[]');
  },
  savePost(post) {
    const posts = this.getPosts();
    if (post.id) {
      const i = posts.findIndex(p => p.id === post.id);
      if (i > -1) posts[i] = post; else posts.unshift(post);
    } else {
      post.id = 'post_' + Date.now();
      post.date = post.date || new Date().toISOString();
      posts.unshift(post);
    }
    localStorage.setItem('asaf_posts', JSON.stringify(posts));
    return post;
  },
  deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id);
    localStorage.setItem('asaf_posts', JSON.stringify(posts));
  },
  getPost(id) {
    return this.getPosts().find(p => p.id === id);
  },

  // ── Portfolio ─────────────────────────────────
  getPortfolios() {
    return JSON.parse(localStorage.getItem('asaf_portfolio') || '[]');
  },
  savePortfolio(item) {
    const items = this.getPortfolios();
    if (item.id) {
      const i = items.findIndex(p => p.id === item.id);
      if (i > -1) items[i] = item; else items.unshift(item);
    } else {
      item.id = 'pf_' + Date.now();
      item.date = new Date().toISOString();
      items.unshift(item);
    }
    localStorage.setItem('asaf_portfolio', JSON.stringify(items));
    return item;
  },
  deletePortfolio(id) {
    const items = this.getPortfolios().filter(p => p.id !== id);
    localStorage.setItem('asaf_portfolio', JSON.stringify(items));
  },
  getPortfolioItem(id) {
    return this.getPortfolios().find(p => p.id === id);
  },

  // ── Auth ──────────────────────────────────────
  ADMIN_KEY: 'asaf_admin_pass',
  getPassword() {
    return localStorage.getItem(this.ADMIN_KEY) || 'Asaf@2026';
  },
  setPassword(p) {
    localStorage.setItem(this.ADMIN_KEY, p);
  },
  isLoggedIn() {
    return sessionStorage.getItem('asaf_auth') === 'true';
  },
  login(pass) {
    if (pass === this.getPassword()) {
      sessionStorage.setItem('asaf_auth', 'true');
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem('asaf_auth');
  }
};

// ── Helpers ────────────────────────────────────────
function toast(msg, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast ' + type;
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => el.classList.remove('show'), 3000);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function stripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
}

function requireAuth() {
  if (!DB.isLoggedIn()) {
    window.location.href = 'admin.html';
  }
}

// ── Nav Active State ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
});
