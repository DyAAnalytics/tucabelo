/* =============================================
   TUCABELO - JavaScript Principal
   ============================================= */

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('tucabelo_cart')) || [];

function saveCart() {
  localStorage.setItem('tucabelo_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalEl = document.getElementById('cart-total-price');
  if (totalEl) totalEl.textContent = formatPrice(total);

  renderCartItems();
}

function formatPrice(n) {
  return '$' + n.toLocaleString('es-CL') + ' CLP';
}

function addToCart(id, name, price, img, category) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, category, qty: 1 });
  }
  saveCart();
  showToast(`${name.substring(0, 40)}... agregado al carrito 🛒`);
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function renderCartItems() {
  const body = document.getElementById('cart-body');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío.<br>¡Agrega algunos productos!</p>
        <a href="catalogo.html" class="btn-primary" style="margin-top:8px;">Ver Catálogo</a>
      </div>`;
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');
}

// ===== CART SIDEBAR =====
function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== SEARCH =====
function openSearch() {
  document.getElementById('search-overlay')?.classList.add('open');
  setTimeout(() => document.getElementById('search-input')?.focus(), 100);
}

function closeSearch() {
  document.getElementById('search-overlay')?.classList.remove('open');
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('hamburger-btn');
  menu?.classList.toggle('open');
  btn?.classList.toggle('open');
}

// ===== NAVBAR SCROLL =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✅'}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ===== SCROLL REVEAL =====
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== HERO PARTICLES =====
function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const count = 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (Math.random() * 6 + 6) + 's';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    container.appendChild(p);
  }
}

// ===== FILTER BUTTONS =====
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const group = this.dataset.group;
      if (group) {
        document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      }
      this.classList.toggle('active');
    });
  });
}

// ===== SORT PRODUCTS =====
function sortProducts(value) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  cards.sort((a, b) => {
    const priceA = parseInt(a.dataset.price || 0);
    const priceB = parseInt(b.dataset.price || 0);
    const nameA = a.dataset.name || '';
    const nameB = b.dataset.name || '';
    if (value === 'price-asc') return priceA - priceB;
    if (value === 'price-desc') return priceB - priceA;
    if (value === 'name-asc') return nameA.localeCompare(nameB);
    if (value === 'name-desc') return nameB.localeCompare(nameA);
    return 0;
  });
  cards.forEach(c => grid.appendChild(c));
}

// ===== WHATSAPP ORDER =====
function orderViaWhatsApp() {
  if (cart.length === 0) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = cart.map(i => `• ${i.qty}x ${i.name} - ${formatPrice(i.price * i.qty)}`).join('\n');
  const text = `Hola Tucabelo! 👋 Quiero hacer un pedido:\n\n${msg}\n\n*Total: ${formatPrice(total)}*\n\n¿Podrían confirmar disponibilidad?`;
  window.open(`https://wa.me/56900000000?text=${encodeURIComponent(text)}`, '_blank');
}

// ===== SET ACTIVE NAV LINK =====
function setActiveNavLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initParticles();
  initFilters();
  setActiveNavLink();
  updateCartUI();

  // Cart button
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);

  // Search
  document.getElementById('search-btn')?.addEventListener('click', openSearch);
  document.getElementById('search-close')?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); closeCart(); }
  });

  // Hamburger
  document.getElementById('hamburger-btn')?.addEventListener('click', toggleMobileMenu);

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', e => sortProducts(e.target.value));
});
