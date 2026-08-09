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

// ===== DYNAMIC PRODUCTS =====
let globalProducts = [];

async function loadDynamicProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return; // Only run if there is a grid

  // Extract category filter from body dataset if exists (e.g. data-category="Clippers")
  const pageCategory = document.body.dataset.category || null;

  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Cargando productos... ⏳</div>';

  try {
    // Use static JSON (works on Vercel). Locally, XAMPP also serves this file.
    const res = await fetch('data/products.json');
    globalProducts = await res.json();
    renderDynamicProducts(pageCategory);
  } catch (e) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">Error cargando catálogo ❌</div>';
  }
}

function renderDynamicProducts(filterCategory = null) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let productsToShow = globalProducts;
  if (filterCategory) {
    productsToShow = globalProducts.filter(p => p.category === filterCategory);
  }

  if (productsToShow.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No hay productos en esta categoría.</div>';
    return;
  }

  grid.innerHTML = productsToShow.map((p, index) => {
    const delay = index % 4; // Add some stagger
    
    // Add WhatsApp specific text
    const waText = encodeURIComponent(`Hola! Me interesa ${p.name} 💈`);
    
    return `
      <article class="product-card reveal reveal-delay-${delay} visible" data-price="${p.price}" data-name="${p.name}">
        <div class="product-img-wrap">
          <img src="${p.image || 'images/logo.png'}" alt="${p.name}" loading="lazy" style="background:#fff;">
          <div class="product-quick-add">⚡ Agregar al carrito</div>
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-prices">
            <span class="price-current">${formatPrice(p.price)}</span>
          </div>
          <div class="product-actions">
            <button class="btn-add-cart" onclick="addToCart('${p.id}','${p.name.replace(/'/g, "\\'")}',${p.price},'${p.image}','${p.category}')">🛒 Agregar</button>
            <a href="https://wa.me/56986018173?text=${waText}" target="_blank" class="btn-whatsapp" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ===== WHATSAPP ORDER =====
function orderViaWhatsApp() {
  if (cart.length === 0) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = cart.map(i => `• ${i.qty}x ${i.name} - ${formatPrice(i.price * i.qty)}`).join('\n');
  const text = `Hola Tucabelo! 👋 Quiero hacer un pedido:\n\n${msg}\n\n*Total: ${formatPrice(total)}*\n\n¿Podrían confirmar disponibilidad?`;
  window.open(`https://wa.me/56986018173?text=${encodeURIComponent(text)}`, '_blank');
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
  
  // Load dynamic products
  loadDynamicProducts();

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
