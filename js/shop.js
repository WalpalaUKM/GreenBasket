/**
 * GreenBasket - Shop & Product Catalog Controller
 * Enhanced with Star Ratings, Little Description Snippets, and Quick View
 */

let allProducts = [];
let activeCategory = 'All';
let currentSearch = '';

// Load products from API
async function loadProducts() {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: #22c55e; margin-bottom: 1rem;"></i>
      <p style="color: #64748b; font-weight: 600;">Loading certified organic Sri Lankan harvest...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      allProducts = data.products;
      window.GB_ALL_PRODUCTS = allProducts;
      renderProducts();
      renderHomeDiscountDeals();
      startDealsCountdown();
    } else {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #ef4444;">Failed to load products.</div>`;
    }
  } catch (err) {
    console.error('Error fetching products:', err);
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #ef4444;">Error connecting to server.</div>`;
  }
}

// Generate Star Rating HTML
function generateStarsHtml(rating = 4.8) {
  const fullStars = Math.floor(rating);
  const hasHalf = (rating - fullStars) >= 0.3;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars && hasHalf) {
      html += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      html += '<i class="fa-regular fa-star"></i>';
    }
  }
  return html;
}

// Render Products Grid
function renderProducts() {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  let filtered = allProducts;

  // Filter Category
  if (activeCategory && activeCategory !== 'All') {
    filtered = filtered.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
  }

  // Filter Search
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  const countBadge = document.getElementById('productsFoundCount');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} organic products available`;
  }

  // Detect Home Page vs Shop Page
  const isHomePage = document.body.classList.contains('home-page') || 
                     Boolean(document.getElementById('homeDiscountContainer')) ||
                     (!window.location.pathname.includes('shop.html') && Boolean(document.getElementById('featured-products')));

  // On Home Page: Curate to 8 products max with "Go to Shop" CTA button
  const displayList = isHomePage ? filtered.slice(0, 8) : filtered;

  if (displayList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <i class="fa-solid fa-leaf" style="font-size: 3rem; color: #94a3b8; margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">No items found</h3>
        <p style="color: #64748b; margin-bottom: 1.5rem;">Try choosing another category or clearing your search term.</p>
        <button onclick="resetFilters()" class="btn-primary-green">View All Produce</button>
      </div>
    `;
    return;
  }

  container.innerHTML = displayList.map(prod => {
    const isOut = !prod.inStock || prod.count <= 0;
    const ratingVal = prod.rating || 4.8;
    const reviewsNum = prod.reviewsCount || 25;
    const shortSnippet = prod.shortDesc || prod.description || '100% certified quality supermarket produce.';
    const isInWishlist = GB.wishlist && GB.wishlist.includes(prod.id);

    return `
      <div class="product-card" id="card-${prod.id}">
        <div class="product-card-img-wrap" style="position: relative;">
          <img src="${prod.image}" alt="${prod.name}" class="product-card-img" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'">
          
          <!-- Floating Wishlist Heart Button -->
          <button class="btn-card-wishlist ${isInWishlist ? 'active' : ''}" data-id="${prod.id}" onclick="toggleWishlist('${prod.id}', event)" title="Save to Wishlist">
            <i class="${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart" ${isInWishlist ? 'style="color:#ef4444;"' : ''}></i>
          </button>

          <!-- In Stock vs Out of Stock Badge -->
          <span class="product-badge-stock ${isOut ? 'badge-out-stock' : 'badge-in-stock'}">
            ${isOut ? '<i class="fa-solid fa-ban"></i> Out of Stock' : '<i class="fa-solid fa-check"></i> In Stock'}
          </span>

          <span class="product-badge-cat">${prod.badge || prod.category}</span>
        </div>

        <div class="product-card-body">
          
          <!-- Star Rating & Review Count -->
          <div class="product-rating-box">
            <div class="stars-row">
              ${generateStarsHtml(ratingVal)}
            </div>
            <span class="rating-score">${ratingVal.toFixed(1)}</span>
            <span class="reviews-count">(${reviewsNum})</span>
          </div>

          <h3 class="product-card-title">${prod.name}</h3>
          
          <!-- Little Description Snippet -->
          <p class="product-short-desc">${shortSnippet}</p>

          <div class="product-card-unit">
            <i class="fa-solid fa-cube text-xs mr-1"></i> ${prod.unit || '1 unit'}
          </div>
          
          <div class="product-card-pricing">
            <span class="price-currency">Rs.</span>
            <span class="price-amount">${prod.price}</span>
            <span class="stock-count-text">${isOut ? '<span style="color:#ef4444; font-weight:700;">Sold Out</span>' : `${prod.count} in stock`}</span>
          </div>

          <!-- Quantity Selector and Add to Cart -->
          <div class="product-card-actions">
            <div class="quantity-control">
              <button class="btn-qty" onclick="adjustCardQty('${prod.id}', -1)" ${isOut ? 'disabled' : ''}>-</button>
              <span class="qty-display" id="qty-${prod.id}">1</span>
              <button class="btn-qty" onclick="adjustCardQty('${prod.id}', 1, ${prod.count})" ${isOut ? 'disabled' : ''}>+</button>
            </div>

            <button 
              class="btn-add-cart" 
              onclick="handleAddToCart('${prod.id}')"
              ${isOut ? 'disabled' : ''}
            >
              <i class="fa-solid fa-cart-plus"></i>
              <span>${isOut ? 'Out of Stock' : 'Add'}</span>
            </button>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

// Render Weekly Supermarket Discounts & Deals Grid
function renderHomeDiscountDeals() {
  const container = document.getElementById('homeDiscountContainer');
  if (!container || !allProducts || allProducts.length === 0) return;

  // Selected top weekly discounted products with high savings
  const dealsData = [
    {
      id: 'prod-1',
      originalPrice: 320,
      dealPrice: 260,
      saveAmount: 60,
      discountTag: '-19% OFF',
      dealBadge: 'Farm Special'
    },
    {
      id: 'prod-9',
      originalPrice: 620,
      dealPrice: 520,
      saveAmount: 100,
      discountTag: '-16% OFF',
      dealBadge: 'Highland Dairy'
    },
    {
      id: 'prod-13',
      originalPrice: 390,
      dealPrice: 320,
      saveAmount: 70,
      discountTag: '-18% OFF',
      dealBadge: 'Pantry Staple'
    },
    {
      id: 'prod-18',
      originalPrice: 680,
      dealPrice: 550,
      saveAmount: 130,
      discountTag: '-19% OFF',
      dealBadge: 'Ceylon Alba'
    }
  ];

  const cardsHtml = dealsData.map(deal => {
    const prod = allProducts.find(p => p.id === deal.id) || {
      id: deal.id,
      name: 'Supermarket Special Item',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      shortDesc: 'Limited time discounted weekly grocery offer.',
      unit: '1 pack',
      count: 25,
      rating: 4.9,
      reviewsCount: 88,
      inStock: true
    };

    const isOut = !prod.inStock || prod.count <= 0;
    const ratingVal = prod.rating || 4.9;
    const isInWishlist = GB.wishlist && GB.wishlist.includes(prod.id);

    return `
      <div class="deal-card" id="deal-card-${prod.id}">
        <!-- Floating Discount Badge -->
        <span class="deal-badge-discount">
          <i class="fa-solid fa-bolt-lightning"></i> ${deal.discountTag}
        </span>

        <div class="deal-card-img-wrap">
          <img src="${prod.image}" alt="${prod.name}" class="deal-card-img" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'">
          
          <!-- Wishlist Heart Button -->
          <button class="btn-card-wishlist ${isInWishlist ? 'active' : ''}" data-id="${prod.id}" onclick="toggleWishlist('${prod.id}', event)" title="Save to Wishlist">
            <i class="${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart" ${isInWishlist ? 'style="color:#ef4444;"' : ''}></i>
          </button>
        </div>

        <div class="deal-card-body">
          <div class="product-rating-box">
            <div class="stars-row">${generateStarsHtml(ratingVal)}</div>
            <span class="rating-score">${ratingVal.toFixed(1)}</span>
            <span class="reviews-count">(${prod.reviewsCount || 45})</span>
          </div>

          <h3 class="deal-card-title">${prod.name}</h3>
          <p class="product-short-desc">${prod.shortDesc || prod.description || 'Certified fresh supermarket produce.'}</p>

          <div class="product-card-unit" style="margin-bottom: 0.65rem;">
            <i class="fa-solid fa-cube text-xs mr-1"></i> ${prod.unit || 'Standard Pack'}
          </div>

          <!-- Strikethrough & Deal Price Row -->
          <div class="deal-pricing-row">
            <span class="price-strikethrough">Rs. ${deal.originalPrice}</span>
            <div style="display: flex; align-items: baseline;">
              <span class="deal-price-currency">Rs.</span>
              <span class="deal-price-current">${deal.dealPrice}</span>
            </div>
            <span class="deal-savings-tag"><i class="fa-solid fa-tag"></i> Save Rs. ${deal.saveAmount}</span>
          </div>

          <!-- Quantity Stepper & Add to Cart -->
          <div class="product-card-actions">
            <div class="quantity-control">
              <button class="btn-qty" onclick="adjustDealQty('${prod.id}', -1)" ${isOut ? 'disabled' : ''}>-</button>
              <span class="qty-display" id="deal-qty-${prod.id}">1</span>
              <button class="btn-qty" onclick="adjustDealQty('${prod.id}', 1, ${prod.count})" ${isOut ? 'disabled' : ''}>+</button>
            </div>

            <button 
              class="btn-add-cart" 
              onclick="handleAddDealToCart('${prod.id}')"
              ${isOut ? 'disabled' : ''}
              style="background-color: #ea580c; border-color: #ea580c;"
            >
              <i class="fa-solid fa-cart-plus"></i>
              <span>${isOut ? 'Sold Out' : 'Grab Deal'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

// Live Countdown Timer for Weekly Supermarket Deals
function startDealsCountdown() {
  const timerEl = document.getElementById('dealsTimer');
  if (!timerEl) return;

  function update() {
    const now = new Date();
    // 2 days, 18 hours forward weekly cycle
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59, 59);
    const diff = Math.max(0, endOfWeek - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    timerEl.textContent = `${String(d).padStart(2, '0')}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`;
  }

  update();
  setInterval(update, 1000);
}

// Adjust quantity counter on card
function adjustCardQty(prodId, delta, maxStock = 99) {
  const el = document.getElementById(`qty-${prodId}`);
  if (!el) return;
  let val = parseInt(el.textContent, 10) || 1;
  val += delta;
  if (val < 1) val = 1;
  if (val > maxStock) {
    showToast(`Only ${maxStock} items left in stock.`, 'error');
    val = maxStock;
  }
  el.textContent = val;
}

// Add to Cart from Card
function handleAddToCart(prodId) {
  const prod = allProducts.find(p => p.id === prodId);
  if (!prod) return;

  const qtyEl = document.getElementById(`qty-${prodId}`);
  const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;

  addToCart(prod, qty);
}

// Adjust quantity counter on Deal card
function adjustDealQty(prodId, delta, maxStock = 99) {
  const el = document.getElementById(`deal-qty-${prodId}`);
  if (!el) return;
  let val = parseInt(el.textContent, 10) || 1;
  val += delta;
  if (val < 1) val = 1;
  if (val > maxStock) {
    showToast(`Only ${maxStock} items left in stock.`, 'error');
    val = maxStock;
  }
  el.textContent = val;
}

// Add to Cart from Deal Card
function handleAddDealToCart(prodId) {
  const prod = allProducts.find(p => p.id === prodId);
  if (!prod) return;

  const qtyEl = document.getElementById(`deal-qty-${prodId}`);
  const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;

  addToCart(prod, qty);
}

// Category Tab Filter
function filterByCategory(cat, btnElement) {
  activeCategory = cat;
  document.querySelectorAll('.category-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  } else {
    // Sync buttons
    document.querySelectorAll('.category-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-cat') === cat) btn.classList.add('active');
    });
  }
  renderProducts();
}

// Reset Filters
function resetFilters() {
  activeCategory = 'All';
  currentSearch = '';
  const searchEl = document.getElementById('shopSearchInput');
  if (searchEl) searchEl.value = '';
  document.querySelectorAll('.category-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === 'All');
  });
  renderProducts();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  const catParam = params.get('cat');

  if (qParam) {
    currentSearch = qParam;
    const searchEl = document.getElementById('shopSearchInput');
    if (searchEl) searchEl.value = qParam;
  }

  if (catParam) {
    activeCategory = catParam;
  }

  loadProducts();

  const shopSearchInput = document.getElementById('shopSearchInput');
  if (shopSearchInput) {
    shopSearchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      renderProducts();
    });
  }
});
