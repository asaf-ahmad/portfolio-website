// ── Data Management Layer ─────────────────────────
// All data lives in localStorage so the site works on GitHub Pages with zero backend

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
