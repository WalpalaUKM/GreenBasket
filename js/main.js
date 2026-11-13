/**
 * GreenBasket - Global JavaScript (Cart, Auth, Header, Nav, Drawer, Modals)
 */

// Global State
const GB = {
  cart: JSON.parse(localStorage.getItem('gb_cart') || '[]'),
  user: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wishlist: JSON.parse(localStorage.getItem('gb_wishlist_ids') || '["prod-1", "prod-7"]'),
  deliveryCity: localStorage.getItem('gb_delivery_city') || 'Colombo, Sri Lanka'
};

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('gb_cart', JSON.stringify(GB.cart));
  updateCartUI();
}

// Save User to LocalStorage
function saveUser(user) {
  GB.user = user;
  if (user) {
    localStorage.setItem('gb_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('gb_user');
  }
  updateAuthUI();
}

// Toast Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-green-300' : 'fa-circle-exclamation text-red-300'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Update Cart Header & Drawer UI
function updateCartUI() {
  const totalCount = GB.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = GB.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update header cart amount
  const headerCartAmount = document.querySelector('.cart-amount');
  if (headerCartAmount) {
    headerCartAmount.textContent = `Rs. ${subtotal}`;
  }

  // Update header cart count pill if present
  const headerCartCount = document.getElementById('headerCartCount');
  if (headerCartCount) {
    headerCartCount.textContent = totalCount;
  }

  // Render Cart Drawer Items
  const drawerList = document.getElementById('cartDrawerItems');
  const drawerSubtotal = document.getElementById('cartDrawerSubtotal');
  const drawerMeter = document.getElementById('cartDrawerShippingMeter');

  if (drawerSubtotal) {
    drawerSubtotal.textContent = `Rs. ${subtotal}`;
  }

  // Free shipping meter rule: within 1 km and subtotal >= 2000
  if (drawerMeter) {
    if (subtotal >= 2000) {
      drawerMeter.innerHTML = `
        <div class="delivery-meter-box">
          <div class="meter-title">
            <i class="fa-solid fa-gift text-green-600"></i>
            <span>🎉 FREE Delivery Unlocked!</span>
          </div>
          <div class="meter-progress-track">
            <div class="meter-progress-fill" style="width: 100%;"></div>
          </div>
          <div class="meter-desc">Your order is above Rs. 2,000. Free shipping within 1 km of shop!</div>
        </div>
      `;
    } else {
      const needed = 2000 - subtotal;
      const pct = Math.min(100, Math.round((subtotal / 2000) * 100));
      drawerMeter.innerHTML = `
        <div class="delivery-meter-box">
          <div class="meter-title">
            <i class="fa-solid fa-truck-fast text-orange-500"></i>
            <span>Free Shipping Progress</span>
          </div>
          <div class="meter-progress-track">
            <div class="meter-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="meter-desc">Add <strong>Rs. ${needed}</strong> more to get FREE delivery within 1 km of shop!</div>
        </div>
      `;
    }
  }

  if (drawerList) {
    if (GB.cart.length === 0) {
      drawerList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
          <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
          <p style="font-weight: 600; font-size: 1.1rem; color: #1e293b;">Your basket is empty</p>
          <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Explore our fresh farm-picked produce!</p>
          <a href="shop.html" class="btn-primary-green" style="display: inline-block;">Start Shopping</a>
        </div>
      `;
    } else {
      drawerList.innerHTML = GB.cart.map(item => `
        <div class="cart-drawer-item">
          <img src="${item.image}" alt="${item.name}" class="cart-drawer-item-img">
          <div style="flex: 1;">
            <div style="font-size: 0.885rem; font-weight: 700; color: #1e293b; line-height: 1.3;">${item.name}</div>
            <div style="font-size: 0.8rem; color: #64748b; margin: 2px 0 6px;">Rs. ${item.price} each</div>
            <div class="quantity-control">
              <button class="btn-qty" onclick="changeCartItemQty('${item.productId}', -1)">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="btn-qty" onclick="changeCartItemQty('${item.productId}', 1)">+</button>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.95rem; font-weight: 800; color: #f97316;">Rs. ${item.price * item.quantity}</div>
            <button onclick="removeCartItem('${item.productId}')" style="color: #ef4444; font-size: 0.8rem; margin-top: 6px; cursor: pointer;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

// Add Item to Cart
function addToCart(product, quantity = 1) {
  if (!product.inStock || product.count <= 0) {
    showToast(`Sorry, "${product.name}" is currently Out of Stock!`, 'error');
    return;
  }

  const existing = GB.cart.find(it => it.productId === product.id);
  if (existing) {
    if (existing.quantity + quantity > product.count) {
      showToast(`Only ${product.count} items available in stock.`, 'error');
      return;
    }
    existing.quantity += quantity;
  } else {
    GB.cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      unit: product.unit
    });
  }

  saveCart();
  showToast(`Added ${quantity}x "${product.name}" to basket!`, 'success');
  openCartDrawer();
}

// Global Handle Add to Cart by Product ID (Accessible everywhere)
async function handleAddToCart(prodId) {
  let prod = (window.GB_ALL_PRODUCTS || []).find(p => p.id === prodId);
  if (!prod) {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        window.GB_ALL_PRODUCTS = data.products;
        prod = data.products.find(p => p.id === prodId);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!prod) {
    showToast('Product details unavailable.', 'error');
    return;
  }

  const qtyEl = document.getElementById(`qty-${prodId}`);
  const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
  addToCart(prod, qty);
}

// Change Quantity in Cart
function changeCartItemQty(productId, delta) {
  const item = GB.cart.find(it => it.productId === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeCartItem(productId);
  } else {
    saveCart();
  }
}

// Remove Item from Cart
function removeCartItem(productId) {
  GB.cart = GB.cart.filter(it => it.productId !== productId);
  saveCart();
  showToast('Item removed from basket.', 'success');
}

// Cart Drawer Toggles
function openCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Update User UI (Header & Avatar)
function updateAuthUI() {
  const userTextEls = document.querySelectorAll('.user-name-text');
  const userRoleEls = document.querySelectorAll('.user-role-text');
  const userDropdownMenus = document.querySelectorAll('.user-dropdown-menu');

  if (GB.user) {
    userTextEls.forEach(el => el.textContent = GB.user.name);
    userRoleEls.forEach(el => el.textContent = GB.user.role === 'admin' ? 'Administrator' : 'Customer');

    const customerCity = GB.user.city ? `${GB.user.city}, Sri Lanka` : (GB.user.locationLabel || 'Colombo, Sri Lanka');
    document.querySelectorAll('#deliveryLocationText, #mobileDeliveryLocationText, .delivery-location-text').forEach(el => {
      el.textContent = customerCity;
    });

    userDropdownMenus.forEach(menu => {
      menu.innerHTML = `
        <div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; color: #64748b;">
          Signed in as <strong>${GB.user.name}</strong><br>
          <span style="color: #16a34a; font-weight: 600;">${GB.user.locationLabel || (GB.user.city ? `${GB.user.city}, Sri Lanka` : 'Sri Lanka Customer')}</span>
        </div>
        <a href="account.html" class="user-dropdown-item">
          <i class="fa-solid fa-box-open"></i> My Orders
        </a>
        <a href="account.html#profile" class="user-dropdown-item">
          <i class="fa-regular fa-user"></i> Profile Settings
        </a>
        <a href="javascript:void(0)" onclick="logoutUser()" class="user-dropdown-item text-red-500">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </a>
      `;
    });
  } else {
    userTextEls.forEach(el => el.textContent = 'Account');
    userDropdownMenus.forEach(menu => {
      menu.innerHTML = `
        <a href="javascript:void(0)" onclick="openAuthModal('login')" class="user-dropdown-item">
          <i class="fa-solid fa-right-to-bracket text-green-600"></i> Customer Login
        </a>
        <a href="javascript:void(0)" onclick="openAuthModal('register')" class="user-dropdown-item">
          <i class="fa-solid fa-user-plus text-orange-500"></i> Register Account
        </a>
        <a href="account.html" class="user-dropdown-item">
          <i class="fa-solid fa-box-archive text-gray-500"></i> Track Order
        </a>
      `;
    });
  }
}

// Open Auth Modal
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.add('active');
    switchAuthTab(tab);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
  }
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginFormContainer');
  const registerForm = document.getElementById('registerFormContainer');
  const loginTabBtn = document.getElementById('tabLoginBtn');
  const regTabBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (loginTabBtn) loginTabBtn.classList.add('active');
    if (regTabBtn) regTabBtn.classList.remove('active');
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (loginTabBtn) loginTabBtn.classList.remove('active');
    if (regTabBtn) regTabBtn.classList.add('active');
  }
}

// User Logout
function logoutUser() {
  saveUser(null);
  showToast('You have successfully logged out.', 'success');
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Global DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Mobile drawer controls
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileCategoriesToggle = document.getElementById('mobileCategoriesToggle');
  const mobileCategoriesList = document.getElementById('mobileCategoriesList');

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      if (mobileOverlay && mobileDrawer) {
        mobileOverlay.classList.add('active');
        mobileDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  function closeMobile() {
    if (mobileOverlay && mobileDrawer) {
      mobileOverlay.classList.remove('active');
      mobileDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobile);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobile);

  if (mobileCategoriesToggle && mobileCategoriesList) {
    mobileCategoriesToggle.addEventListener('click', () => {
      const isOpen = mobileCategoriesList.classList.toggle('open');
      const icon = mobileCategoriesToggle.querySelector('.fa-chevron-down');
      if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Cart trigger buttons (clicking header cart opens drawer)
  document.querySelectorAll('.action-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  const cartDrawerClose = document.getElementById('cartDrawerClose');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  // Deliver To Selector in Header (Sri Lanka Location Auto-Selection)
  const deliveryBox = document.getElementById('deliveryBox');
  const deliveryWrapper = document.getElementById('deliveryWrapper');
  const deliveryLocationText = document.getElementById('deliveryLocationText');
  const deliveryOptions = document.querySelectorAll('.delivery-option-item');

  // Automatically determine customer address in Sri Lanka
  const initialSriLankaCity = (GB.user && GB.user.city) 
    ? `${GB.user.city}, Sri Lanka` 
    : (localStorage.getItem('gb_delivery_city') || 'Colombo, Sri Lanka');
  
  const setAllDeliveryCityTexts = (city) => {
    document.querySelectorAll('#deliveryLocationText, #mobileDeliveryLocationText, .delivery-location-text').forEach(el => {
      el.textContent = city;
    });
  };

  setAllDeliveryCityTexts(initialSriLankaCity);

  if (deliveryBox && deliveryWrapper) {
    deliveryBox.addEventListener('click', (e) => {
      e.stopPropagation();
      deliveryWrapper.classList.toggle('active');
    });

    deliveryOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const city = opt.getAttribute('data-city') || opt.textContent.trim();
        setAllDeliveryCityTexts(city);
        localStorage.setItem('gb_delivery_city', city);
        deliveryOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        deliveryWrapper.classList.remove('active');
        showToast(`Delivery location set to: ${city}`);
      });
    });

    document.addEventListener('click', (e) => {
      if (!deliveryWrapper.contains(e.target)) {
        deliveryWrapper.classList.remove('active');
      }
    });
  }

  // Wishlist Action in Header: Opens Wishlist Drawer
  document.querySelectorAll('.action-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openWishlistDrawer();
    });
  });

  // Search input redirection
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.querySelector('.search-form');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `shop.html?q=${encodeURIComponent(query)}`;
      }
    });
  }

  // Global ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobile();
      closeCartDrawer();
      closeWishlistDrawer();
      closeAuthModal();
    }
  });

  // Initialize Scroll Animations & Wishlist
  initScrollAnimations();
  updateWishlistUI();

  // Initialize UI
  updateCartUI();
  updateAuthUI();
});

// ========================================================
// WISHLIST FUNCTIONALITY (Working Properly)
// ========================================================
function updateWishlistUI() {
  const badgeCounts = document.querySelectorAll('.action-wishlist .badge-count, #wishlistCount');
  badgeCounts.forEach(b => {
    b.textContent = GB.wishlist.length < 10 ? `0${GB.wishlist.length}` : GB.wishlist.length;
  });

  // Update card buttons
  document.querySelectorAll('.btn-card-wishlist').forEach(btn => {
    const prodId = btn.getAttribute('data-id');
    const isIn = GB.wishlist.includes(prodId);
    if (isIn) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fa-solid fa-heart" style="color: #ef4444;"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
  });

  renderWishlistDrawerItems();
}

function toggleWishlist(prodId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const idx = GB.wishlist.indexOf(prodId);
  if (idx > -1) {
    GB.wishlist.splice(idx, 1);
    showToast('Removed item from Wishlist.', 'error');
  } else {
    GB.wishlist.push(prodId);
    showToast('Saved item to your Wishlist!', 'success');
  }

  localStorage.setItem('gb_wishlist_ids', JSON.stringify(GB.wishlist));
  updateWishlistUI();
}

function openWishlistDrawer() {
  let overlay = document.getElementById('wishlistDrawerOverlay');
  let drawer = document.getElementById('wishlistDrawer');

  // Auto-inject Wishlist Drawer if missing on page
  if (!drawer) {
    overlay = document.createElement('div');
    overlay.className = 'cart-drawer-overlay';
    overlay.id = 'wishlistDrawerOverlay';
    overlay.onclick = closeWishlistDrawer;
    document.body.appendChild(overlay);

    drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.id = 'wishlistDrawer';
    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <div class="cart-drawer-title">
          <i class="fa-solid fa-heart text-red-500"></i>
          <span>My Saved Wishlist</span>
        </div>
        <button onclick="closeWishlistDrawer()" style="font-size: 1.25rem; color: #64748b; cursor: pointer; border: none; background: none;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="cart-drawer-body" id="wishlistDrawerItems"></div>
      <div class="cart-drawer-footer">
        <a href="shop.html" onclick="closeWishlistDrawer()" class="btn-primary-green" style="display: block; width: 100%; text-align: center; border-radius: 999px; padding: 0.85rem;">
          Continue Shopping
        </a>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  renderWishlistDrawerItems();
  overlay.classList.add('active');
  drawer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  const overlay = document.getElementById('wishlistDrawerOverlay');
  const drawer = document.getElementById('wishlistDrawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function renderWishlistDrawerItems() {
  const container = document.getElementById('wishlistDrawerItems');
  if (!container) return;

  if (GB.wishlist.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3.5rem 1rem; color: #64748b;">
        <i class="fa-regular fa-heart" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
        <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Your Wishlist is Empty</h4>
        <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Tap the heart on any supermarket product to save it here.</p>
        <a href="shop.html" class="btn-primary-green" onclick="closeWishlistDrawer()">Browse Products</a>
      </div>
    `;
    return;
  }

  // Get products catalog
  let prods = [];
  if (typeof allProducts !== 'undefined' && allProducts.length) {
    prods = allProducts;
  } else {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) prods = data.products;
    } catch(e) {}
  }

  const wishItems = prods.filter(p => GB.wishlist.includes(p.id));

  container.innerHTML = wishItems.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid #f1f5f9; gap: 0.75rem;">
      <img src="${item.image}" alt="${item.name}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 0.885rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
        <div style="font-size: 0.825rem; color: #16a34a; font-weight: 800;">Rs. ${item.price} <span style="font-size: 0.75rem; color: #64748b; font-weight: normal;">/ ${item.unit || 'unit'}</span></div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;">
        <button onclick="handleAddToCart('${item.id}'); showToast('Added ${item.name} to Basket!');" class="btn-primary-green" style="padding: 0.4rem 0.65rem; font-size: 0.78rem; border-radius: 6px;" title="Add to Basket">
          <i class="fa-solid fa-cart-plus"></i>
        </button>
        <button onclick="toggleWishlist('${item.id}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.4rem;" title="Remove">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// GPS detection for header selector
function detectHeaderGPS() {
  detectUserLiveGPSLocation((result) => {
    if (result) {
      const locText = `Sri Lanka (${result.distanceKm} km from hub)`;
      document.querySelectorAll('#deliveryLocationText, #mobileDeliveryLocationText, .delivery-location-text').forEach(el => {
        el.textContent = locText;
      });
      localStorage.setItem('gb_delivery_city', locText);
      showToast(`Location verified: ${result.distanceKm} km from hub!`, 'success');
      const wrapper = document.getElementById('deliveryWrapper');
      if (wrapper) wrapper.classList.remove('active');
    }
  });
}

// Scroll Reveal Animations Observer
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-reveal');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
}

// Live Location GPS Detection Helper (Matara Shop: 5.9496, 80.5469)
function detectUserLiveGPSLocation(callback) {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    if (callback) callback(null);
    return;
  }

  showToast('Detecting your GPS location in Sri Lanka...', 'success');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const mataraLat = 5.9496;
      const mataraLng = 80.5469;

      // Compute Haversine distance to Matara Shop
      const R = 6371;
      const dLat = (lat - mataraLat) * Math.PI / 180;
      const dLon = (lng - mataraLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(mataraLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = Math.round(R * c * 10) / 10;

      if (callback) callback({ lat, lng, distanceKm });
    },
    (error) => {
      console.warn('Geolocation error:', error);
      showToast('Could not access GPS location. Please select your district and city manually.', 'error');
      if (callback) callback(null);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}
