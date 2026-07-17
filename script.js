(function() {
  /* ========== DARK MODE ========== */
  (function() {
    const toggle = document.getElementById('dark-toggle');
    if (!toggle) return;
    const html = document.documentElement;
    const stored = localStorage.getItem('gtm-theme');
    if (stored === 'dark') {
      html.setAttribute('data-theme', 'dark');
      toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    toggle.addEventListener('click', function() {
      const isDark = html.getAttribute('data-theme') === 'dark';
      if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem('gtm-theme', 'light');
        this.innerHTML = '<i class="fas fa-moon"></i>';
      } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('gtm-theme', 'dark');
        this.innerHTML = '<i class="fas fa-sun"></i>';
      }
    });
  })();

  /* ========== CART ========== */
  (function() {
    let cart = [];
    const STORAGE_KEY = 'gtm-cart';
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('cart-close');
    const cartIcon = document.getElementById('cart-icon');
    const badge = document.getElementById('cart-badge');
    const itemsWrap = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout');

    function loadCart() {
      try {
        const d = localStorage.getItem(STORAGE_KEY);
        if (d) cart = JSON.parse(d);
      } catch(e) { cart = []; }
    }

    function saveCart() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function updateUI() {
      const count = cart.reduce((s, i) => s + i.qty, 0);
      if (badge) {
        if (count > 0) { badge.textContent = count; badge.classList.add('show'); }
        else badge.classList.remove('show');
      }
      if (!itemsWrap) return;
      if (cart.length === 0) {
        itemsWrap.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
        if (totalEl) totalEl.textContent = 'UGX 0';
        return;
      }
      let html = '';
      let total = 0;
      cart.forEach((item, idx) => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''));
        total += priceNum * item.qty;
        html += '<div class="cart-item">';
        html += '<img src="' + item.img + '" alt="' + item.name + '">';
        html += '<div class="cart-item-info">';
        html += '<h4>' + item.name + '</h4>';
        html += '<p>UGX ' + priceNum.toLocaleString() + ' x ' + item.qty + '</p>';
        html += '</div>';
        html += '<button class="cart-item-remove" data-index="' + idx + '"><i class="fas fa-times"></i></button>';
        html += '</div>';
      });
      itemsWrap.innerHTML = html;
      if (totalEl) totalEl.textContent = 'UGX ' + total.toLocaleString();
      itemsWrap.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-index'));
          cart.splice(idx, 1);
          saveCart();
          updateUI();
        });
      });
    }

    function openCart() {
      if (drawer) drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeCart() {
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    window.gtmCart = {
      add: function(name, price, img) {
        loadCart();
        const existing = cart.find(i => i.name === name);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({ name, price, img, qty: 1 });
        }
        saveCart();
        updateUI();
        openCart();
      }
    };

    if (cartIcon) cartIcon.addEventListener('click', function(e) {
      e.preventDefault();
      openCart();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeCart();
    });

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        loadCart();
        if (cart.length === 0) return;
        let msg = 'Hello GTM COMPUTERS, I would like to order the following:%0A%0A';
        let total = 0;
        cart.forEach(item => {
          const p = parseInt(item.price.replace(/[^0-9]/g, ''));
          total += p * item.qty;
          msg += '• ' + item.name + ' x' + item.qty + ' = UGX ' + (p * item.qty).toLocaleString() + '%0A';
        });
        msg += '%0ATotal: UGX ' + total.toLocaleString() + '%0A%0APlease confirm availability and delivery.';
        window.open('https://wa.me/256704878505?text=' + msg, '_blank');
      });
    }

    loadCart();
    updateUI();
  })();

  /* ========== ADD TO CART BUTTONS ========== */
  (function() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.add-to-cart');
      if (!btn) return;
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const img = btn.getAttribute('data-img');
      if (name && price && window.gtmCart) {
        window.gtmCart.add(name, price, img);
      }
    });
  })();

  /* ========== SEARCH ========== */
  (function() {
    const input = document.getElementById('search-input');
    if (!input) return;
    input.addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      document.querySelectorAll('.product-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
      document.querySelectorAll('.category-heading').forEach(h => {
        if (!q) { h.style.display = ''; return; }
        const next = h.nextElementSibling;
        if (next && next.classList.contains('products-grid')) {
          const visible = [...next.querySelectorAll('.product-card')].some(c => c.style.display !== 'none');
          h.style.display = visible ? '' : 'none';
        }
      });
    });
  })();

  /* ========== BRAND FILTER (products.html) ========== */
  (function() {
    const btns = document.querySelectorAll('.brand-filter-btn');
    if (!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', function() {
        btns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const brand = this.getAttribute('data-brand');
        document.querySelectorAll('.product-card').forEach(card => {
          const label = card.querySelector('.brand-label');
          if (brand === 'all') { card.style.display = ''; return; }
          if (label) {
            card.style.display = label.classList.contains('brand-' + brand) ? '' : 'none';
          } else {
            card.style.display = 'none';
          }
        });
        document.querySelectorAll('.category-heading').forEach(h => {
          if (brand === 'all') { h.style.display = ''; return; }
          const next = h.nextElementSibling;
          if (next && next.classList.contains('products-grid')) {
            const visible = [...next.querySelectorAll('.product-card')].some(c => c.style.display !== 'none');
            h.style.display = visible ? '' : 'none';
          }
        });
      });
    });
  })();

  /* ========== HERO SLIDESHOW ========== */
  (function() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    let i = 0;
    slides[0].classList.add('active');
    setInterval(function() {
      slides.forEach(s => s.classList.remove('active'));
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, 4500);
  })();

  /* ========== HAMBURGER ========== */
  (function() {
    const btn = document.querySelector('.hamburger');
    const header = document.querySelector('header');
    if (!btn || !header) return;
    btn.addEventListener('click', function() { header.classList.toggle('nav-open'); });
    document.querySelectorAll('nav a').forEach(function(a) {
      a.addEventListener('click', function() { header.classList.remove('nav-open'); });
    });
  })();

  /* ========== SMOOTH SCROLL ========== */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const h = this.getAttribute('href');
      if (h === '#') return;
      e.preventDefault();
      const t = document.querySelector(h);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ========== ACTIVE NAV ========== */
  (function() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(function(a) {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  })();

  /* ========== LIGHTBOX ========== */
  (function() {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const close = document.getElementById('lightbox-close');
    if (!lb || !img) return;

    document.querySelectorAll('[data-lb]').forEach(function(el) {
      el.addEventListener('click', function() {
        img.src = this.src || this.getAttribute('href');
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (close) close.addEventListener('click', closeLb);
    lb.addEventListener('click', function(e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLb(); });
  })();

  /* ========== FAQ ========== */
  (function() {
    document.querySelectorAll('.faq-q').forEach(function(q) {
      q.addEventListener('click', function() { this.parentElement.classList.toggle('open'); });
    });
  })();

  /* ========== BACK TO TOP ========== */
  (function() {
    const btn = document.getElementById('back-top');
    if (!btn) return;
    window.addEventListener('scroll', function() { btn.classList.toggle('visible', window.scrollY > 400); });
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  })();
})();
