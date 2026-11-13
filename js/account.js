/**
 * GreenBasket - Customer Account, Live Order Tracking, Saved Cards & Order History Controller
 */

// Initialize Account Page
document.addEventListener('DOMContentLoaded', () => {
  initAccountPage();
});

async function initAccountPage() {
  const accountMain = document.getElementById('accountMainContent');
  if (!accountMain) return;

  const urlParams = new URLSearchParams(window.location.search);
  const trackIdParam = urlParams.get('track');

  if (trackIdParam && trackIdParam !== 'true') {
    // Direct track parameter passed in URL
    renderDirectOrderTracking(trackIdParam);
    return;
  }

  if (!GB.user) {
    renderAuthAndGuestTracking(trackIdParam === 'true' ? 'track' : 'login');
  } else {
    renderUserProfileAndDashboard();
  }
}

// ========================================================
// 1. NON-LOGGED IN: AUTH FORMS & INSTANT GUEST TRACKING
// ========================================================
function renderAuthAndGuestTracking(defaultTab = 'login') {
  const container = document.getElementById('accountMainContent');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width: 600px; margin: 2rem auto; background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: var(--shadow-md);">
      
      <!-- Top Navigation Tabs -->
      <div class="auth-tabs" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <button class="auth-tab-btn ${defaultTab === 'login' ? 'active' : ''}" id="btnTabLogin" onclick="switchGuestTab('login')" style="padding: 1rem 0.5rem; font-weight: 700; border: none; cursor: pointer;">
          <i class="fa-solid fa-right-to-bracket mr-1"></i> Customer Login
        </button>
        <button class="auth-tab-btn ${defaultTab === 'register' ? 'active' : ''}" id="btnTabRegister" onclick="switchGuestTab('register')" style="padding: 1rem 0.5rem; font-weight: 700; border: none; cursor: pointer;">
          <i class="fa-solid fa-user-plus mr-1"></i> Create Account
        </button>
        <button class="auth-tab-btn ${defaultTab === 'track' ? 'active' : ''}" id="btnTabTrack" onclick="switchGuestTab('track')" style="padding: 1rem 0.5rem; font-weight: 700; border: none; cursor: pointer; color: #16a34a;">
          <i class="fa-solid fa-truck-fast mr-1"></i> Track Order
        </button>
      </div>

      <!-- 1. Customer Login Form -->
      <div id="accountLoginForm" style="display: ${defaultTab === 'login' ? 'block' : 'none'}; padding: 2.25rem;">
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Welcome Back</h3>
        <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 1.5rem;">Sign in to access your order history, delivery tracking, and saved payment cards.</p>
        
        <form onsubmit="handleAccountLogin(event)">
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="loginEmail" class="form-control" placeholder="name@example.com" value="customer@greenbasket.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password *</label>
            <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" value="customer123" required>
          </div>
          <button type="submit" class="btn-primary-green" style="width: 100%; margin-top: 1rem; border-radius: 999px; padding: 0.85rem;">
            Sign In to Account
          </button>
        </form>

        <div style="margin-top: 1.75rem; padding: 0.85rem; background: #f8fafc; border-radius: 8px; font-size: 0.8rem; color: #64748b; border: 1px dashed #cbd5e1;">
          <strong>Demo Customer:</strong> customer@greenbasket.com / customer123
        </div>
      </div>

      <!-- 2. Create Account Form -->
      <div id="accountRegisterForm" style="display: ${defaultTab === 'register' ? 'block' : 'none'}; padding: 2.25rem;">
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Create GreenBasket Account</h3>
        <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 1.5rem;">Select your Sri Lanka district & city for automatic distance and shipping calculations.</p>

        <form onsubmit="handleAccountRegister(event)">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="regName" class="form-control" placeholder="Your full name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="regEmail" class="form-control" placeholder="name@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number * <span style="font-weight: 400; color: #64748b; font-size: 0.8rem;">(10 Digits)</span></label>
            <input type="tel" id="regPhone" class="form-control" placeholder="07XXXXXXXX" maxlength="10" pattern="0[0-9]{9}" required oninput="this.value = this.value.replace(/\\D/g, '').slice(0, 10)">
            <small style="font-size: 0.72rem; color: #64748b; display: block; margin-top: 3px;">10-digit Sri Lankan number starting with 0 (e.g. 0771234567)</small>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div class="form-group">
              <label class="form-label">District *</label>
              <select id="regDistrict" class="form-control" required style="font-weight: 600;" onchange="handleRegDistrictChange(this.value)">
                <!-- Populated dynamically -->
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">City / Town *</label>
              <select id="regCity" class="form-control" required style="font-weight: 600;" onchange="handleRegCityChange(this)">
                <!-- Populated dynamically -->
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Postal Code *</label>
              <input type="text" id="regPostalCode" class="form-control" placeholder="81000" style="font-weight: 600;" required>
            </div>
            <div class="form-group">
              <label class="form-label">Distance from Matara Hub</label>
              <input type="text" id="regDistanceDisplay" class="form-control" value="0.6 km" readonly style="background: #f1f5f9; font-weight: 700; color: #15803d;">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Street / House Address *</label>
            <input type="text" id="regAddress" class="form-control" placeholder="House no, Street name, Landmark" required>
          </div>
          <div class="form-group">
            <label class="form-label">Create Password *</label>
            <input type="password" id="regPassword" class="form-control" placeholder="At least 6 characters" required>
          </div>
          <button type="submit" class="btn-primary-green" style="width: 100%; margin-top: 1rem; border-radius: 999px; padding: 0.85rem;">
            Create Customer Account
          </button>
        </form>
      </div>

      <!-- 3. Direct Order Tracking Input (Instant Search) -->
      <div id="accountTrackForm" style="display: ${defaultTab === 'track' ? 'block' : 'none'}; padding: 2.25rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-truck-fast"></i>
          </div>
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0;">Track Your Grocery Order</h3>
            <span style="font-size: 0.8rem; color: #64748b;">Live GPS & Dispatch Updates Across Sri Lanka</span>
          </div>
        </div>

        <p style="font-size: 0.88rem; color: #64748b; margin: 1rem 0 1.5rem;">
          Enter your <strong>Order ID</strong> (from your order confirmation e.g. <code>ORD-501805</code>) to see live delivery status, packed items, and rider progress.
        </p>

        <form onsubmit="handleSearchOrderTrack(event)">
          <div class="form-group">
            <label class="form-label">Order Reference ID *</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="trackSearchInput" class="form-control" placeholder="E.g. ORD-501805" style="text-transform: uppercase; font-weight: 700; font-size: 1.05rem;" required>
              <button type="submit" class="btn-primary-green" style="padding: 0 1.5rem; border-radius: 8px; flex-shrink: 0;">
                <i class="fa-solid fa-magnifying-glass mr-1"></i> Track
              </button>
            </div>
          </div>
        </form>

        <div id="guestTrackResultContainer" style="margin-top: 1.5rem;"></div>
      </div>

    </div>
  `;

  initRegLocationDropdowns();
}

function switchGuestTab(tab) {
  const loginForm = document.getElementById('accountLoginForm');
  const regForm = document.getElementById('accountRegisterForm');
  const trackForm = document.getElementById('accountTrackForm');
  const btnLogin = document.getElementById('btnTabLogin');
  const btnReg = document.getElementById('btnTabRegister');
  const btnTrack = document.getElementById('btnTabTrack');

  if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
  if (regForm) regForm.style.display = tab === 'register' ? 'block' : 'none';
  if (trackForm) trackForm.style.display = tab === 'track' ? 'block' : 'none';

  if (btnLogin) btnLogin.classList.toggle('active', tab === 'login');
  if (btnReg) btnReg.classList.toggle('active', tab === 'register');
  if (btnTrack) btnTrack.classList.toggle('active', tab === 'track');
}

// Registration Dropdowns
let regSelectedDist = 'Matara';
let regSelectedCity = 'Matara City - Central (Within 1 km of Shop)';
let regPostal = '81000';
let regDistKm = 0.6;

function initRegLocationDropdowns() {
  const distSelect = document.getElementById('regDistrict');
  if (!distSelect || typeof SRI_LANKA_LOCATIONS === 'undefined') return;

  const districts = Object.keys(SRI_LANKA_LOCATIONS);
  distSelect.innerHTML = districts.map(d => `
    <option value="${d}" ${d === 'Matara' ? 'selected' : ''}>${d} District</option>
  `).join('');

  handleRegDistrictChange('Matara');
}

function handleRegDistrictChange(district) {
  regSelectedDist = district;
  const citySelect = document.getElementById('regCity');
  if (!citySelect || typeof SRI_LANKA_LOCATIONS === 'undefined') return;

  const distData = SRI_LANKA_LOCATIONS[district];
  if (!distData) return;

  citySelect.innerHTML = distData.cities.map(c => `
    <option value="${c.name}" data-postal="${c.postalCode}" data-km="${c.distanceKm}">
      ${c.name} (${c.distanceKm} km)
    </option>
  `).join('');

  handleRegCityChange(citySelect);
}

function handleRegCityChange(citySelect) {
  const opt = citySelect.options[citySelect.selectedIndex];
  if (!opt) return;

  regSelectedCity = opt.value;
  regPostal = opt.getAttribute('data-postal') || '81000';
  regDistKm = parseFloat(opt.getAttribute('data-km')) || 0.6;

  const postalInput = document.getElementById('regPostalCode');
  const distDisplay = document.getElementById('regDistanceDisplay');
  if (postalInput) postalInput.value = regPostal;
  if (distDisplay) distDisplay.value = `${regDistKm} km from Matara Hub`;
}

// Handle Login
async function handleAccountLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      saveUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      if (data.user.role === 'admin') {
        window.location.href = 'http://localhost:4000/admin_dashbord/';
      } else {
        renderUserProfileAndDashboard();
      }
    } else {
      showToast(data.message || 'Login failed.', 'error');
    }
  } catch (err) {
    showToast('Network error during login.', 'error');
  }
}

// Handle Register
async function handleAccountRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const rawPhone = document.getElementById('regPhone').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!name || name.length < 2) {
    showToast('Please enter your full name (at least 2 characters).', 'error');
    document.getElementById('regName')?.focus();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    document.getElementById('regEmail')?.focus();
    return;
  }

  // Strict 10-digit Sri Lankan phone number validation
  const cleanPhone = normalizeSriLankanPhone(rawPhone);
  if (!isValidSriLankanPhone(cleanPhone)) {
    showToast('Invalid Sri Lankan phone number. Must be exactly 10 digits starting with 0 (e.g. 0771234567 or 0412224589).', 'error');
    document.getElementById('regPhone')?.focus();
    return;
  }

  if (!address || address.length < 5) {
    showToast('Please enter your street/house address (at least 5 characters).', 'error');
    document.getElementById('regAddress')?.focus();
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters long.', 'error');
    document.getElementById('regPassword')?.focus();
    return;
  }

  const district = document.getElementById('regDistrict')?.value || regSelectedDist || 'Matara';
  const city = document.getElementById('regCity')?.value || regSelectedCity || 'Matara City';
  const postalCode = document.getElementById('regPostalCode')?.value || regPostal || '81000';
  const distanceKm = regDistKm || 0.6;
  const locationLabel = `${city}, ${district} (${postalCode}) - ${distanceKm} km from Matara Hub`;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone: cleanPhone,
        district,
        city,
        postalCode,
        distanceKm,
        locationLabel,
        address,
        password
      })
    });
    const data = await res.json();

    if (data.success) {
      saveUser(data.user);
      showToast('Registration successful! Welcome to GreenBasket.', 'success');
      renderUserProfileAndDashboard();
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    showToast('Network error during registration.', 'error');
  }
}

// ========================================================
// 2. LOGGED-IN CUSTOMER DASHBOARD
// ========================================================
let activeDashboardTab = 'orders';

function renderUserProfileAndDashboard() {
  const container = document.getElementById('accountMainContent');
  if (!container || !GB.user) return;

  const userDist = GB.user.district || 'Matara';
  const userCity = GB.user.city || 'Matara Central';
  const userPostal = GB.user.postalCode || '81000';
  const userKm = GB.user.distanceKm !== undefined ? GB.user.distanceKm : 0.6;

  container.innerHTML = `
    <!-- Top Account Welcome Banner -->
    <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.75rem 2rem; margin-bottom: 2rem; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 1.25rem;">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" alt="${GB.user.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2.5px solid #22c55e;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0;">${GB.user.name}</h2>
            <span style="font-size: 0.75rem; background: #dcfce7; color: #15803d; font-weight: 700; padding: 0.2rem 0.65rem; border-radius: 999px;">
              <i class="fa-solid fa-circle-check mr-1"></i> ${GB.user.role === 'admin' ? 'Administrator' : 'Verified Sri Lanka Customer'}
            </span>
          </div>
          <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
            <i class="fa-solid fa-envelope mr-1 text-gray-400"></i> ${GB.user.email} &nbsp;|&nbsp; 
            <i class="fa-solid fa-phone mr-1 text-gray-400"></i> ${GB.user.phone || '+94 77 123 4567'} &nbsp;|&nbsp;
            <i class="fa-solid fa-location-dot text-green-600 mr-1"></i> ${userCity}, ${userDist} (${userPostal}) • <strong>${userKm} km</strong>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <a href="shop.html" class="btn-primary-green" style="padding: 0.6rem 1.25rem; font-size: 0.85rem; border-radius: 999px;">
          <i class="fa-solid fa-basket-shopping mr-1"></i> Shop Deals
        </a>
        <button onclick="logoutUser()" class="btn-secondary-outline" style="padding: 0.6rem 1.15rem; font-size: 0.85rem; border-radius: 999px; color: #dc2626; border-color: #fca5a5;">
          <i class="fa-solid fa-right-from-bracket mr-1"></i> Log Out
        </button>
      </div>
    </div>

    <!-- Navigation Tabs inside Account -->
    <div style="display: flex; gap: 0.5rem; border-bottom: 2px solid #e2e8f0; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 2px;">
      <button class="auth-tab-btn ${activeDashboardTab === 'orders' ? 'active' : ''}" onclick="switchDashboardTab('orders')" style="font-size: 0.95rem; font-weight: 700; padding: 0.75rem 1.25rem; border: none; background: none; cursor: pointer;">
        <i class="fa-solid fa-box-open mr-1"></i> My Orders (${GB.user.email})
      </button>
      <button class="auth-tab-btn ${activeDashboardTab === 'track' ? 'active' : ''}" onclick="switchDashboardTab('track')" style="font-size: 0.95rem; font-weight: 700; padding: 0.75rem 1.25rem; border: none; background: none; cursor: pointer; color: #16a34a;">
        <i class="fa-solid fa-truck-fast mr-1"></i> Live Order Tracking
      </button>
      <button class="auth-tab-btn ${activeDashboardTab === 'cards' ? 'active' : ''}" onclick="switchDashboardTab('cards')" style="font-size: 0.95rem; font-weight: 700; padding: 0.75rem 1.25rem; border: none; background: none; cursor: pointer;">
        <i class="fa-solid fa-credit-card mr-1"></i> My Saved Cards
      </button>
      <button class="auth-tab-btn ${activeDashboardTab === 'cart' ? 'active' : ''}" onclick="switchDashboardTab('cart')" style="font-size: 0.95rem; font-weight: 700; padding: 0.75rem 1.25rem; border: none; background: none; cursor: pointer;">
        <i class="fa-solid fa-cart-shopping mr-1"></i> My Active Basket
      </button>
    </div>

    <!-- Tab Contents Container -->
    <div id="dashboardTabContent">
      <!-- Populated dynamically -->
    </div>
  `;

  renderActiveTabContent();
}

function switchDashboardTab(tab) {
  activeDashboardTab = tab;
  renderUserProfileAndDashboard();
}

function renderActiveTabContent() {
  const container = document.getElementById('dashboardTabContent');
  if (!container) return;

  if (activeDashboardTab === 'orders') {
    renderUserOrdersTab(container);
  } else if (activeDashboardTab === 'track') {
    renderUserTrackTab(container);
  } else if (activeDashboardTab === 'cards') {
    renderUserCardsTab(container);
  } else if (activeDashboardTab === 'cart') {
    renderUserCartTab(container);
  }
}

// ========================================================
// TAB 1: MY ORDERS & HISTORY
// ========================================================
async function renderUserOrdersTab(container) {
  container.innerHTML = `
    <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0;">
          <i class="fa-solid fa-box-archive text-green-600 mr-2"></i> Order History
        </h3>
        <span style="font-size: 0.85rem; color: #64748b;">Showing orders placed by ${GB.user.email}</span>
      </div>

      <div id="userOrdersList">
        <div style="text-align: center; padding: 3rem; color: #64748b;">
          <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #22c55e;"></i>
          <p style="margin-top: 1rem; font-weight: 600;">Loading your Sri Lanka grocery orders...</p>
        </div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(`/api/orders?email=${encodeURIComponent(GB.user.email)}`);
    const data = await res.json();
    const list = document.getElementById('userOrdersList');
    if (!list) return;

    if (!data.success || data.orders.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1rem; color: #64748b;">
          <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
          <h4 style="font-weight: 800; font-size: 1.15rem; color: #1e293b; margin-bottom: 0.5rem;">No past orders yet</h4>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">When you order fresh groceries, they will appear here with live tracking.</p>
          <a href="shop.html" class="btn-primary-green">Shop Fresh Groceries Now</a>
        </div>
      `;
      return;
    }

    list.innerHTML = data.orders.map(order => {
      const isOut = order.status === 'Out for Delivery';
      const isDelivered = order.status === 'Delivered';
      const isCancelled = order.status === 'Cancelled';
      let badgeBg = '#fef3c7';
      let badgeColor = '#b45309';

      if (isDelivered) { badgeBg = '#dcfce7'; badgeColor = '#15803d'; }
      else if (isOut) { badgeBg = '#ffedd5'; badgeColor = '#c2410c'; }
      else if (isCancelled) { badgeBg = '#fee2e2'; badgeColor = '#b91c1c'; }

      return `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; background: #fafafa; transition: box-shadow 0.2s;" onmouseenter="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'" onmouseleave="this.style.boxShadow='none'">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.85rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
                <span>Order #${order.id}</span>
                <span style="font-size: 0.75rem; background: ${badgeBg}; color: ${badgeColor}; font-weight: 800; padding: 0.2rem 0.65rem; border-radius: 999px;">
                  ${order.status}
                </span>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 3px;">
                Placed on ${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Payment: <strong>${order.paymentMethod || 'Cash on Delivery'}</strong>
              </div>
            </div>

            <div>
              <button onclick="trackSpecificOrder('${order.id}')" class="btn-primary-green" style="font-size: 0.85rem; padding: 0.5rem 1.15rem; border-radius: 999px;">
                <i class="fa-solid fa-truck-fast mr-1"></i> Track Live Status
              </button>
            </div>
          </div>

          <!-- Items Row -->
          <div style="margin-bottom: 1.25rem;">
            ${order.items.map(it => `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; padding: 0.45rem 0; border-bottom: 1px dashed #f1f5f9;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${it.image}" alt="${it.name}" style="width: 38px; height: 38px; border-radius: 6px; object-fit: cover;">
                  <div>
                    <span style="font-weight: 700; color: #1e293b;">${it.name}</span>
                    <span style="color: #64748b; font-size: 0.8rem;"> (×${it.quantity} ${it.unit || ''})</span>
                  </div>
                </div>
                <div style="font-weight: 700; color: #0f172a;">Rs. ${it.itemTotal || (it.price * it.quantity)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Pricing & Destination Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; font-size: 0.85rem; color: #64748b; background: #ffffff; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #f1f5f9;">
            <div>
              <i class="fa-solid fa-location-dot text-green-600 mr-1"></i>
              Destination: <strong>${order.customer.locationLabel}</strong>
            </div>
            <div style="display: flex; gap: 1.5rem; align-items: center;">
              <div>Shipping: <strong style="color: ${order.shippingFee === 0 ? '#16a34a' : '#1e293b'}">${order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee}`}</strong></div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">
                Total: <span style="color: #ea580c;">Rs. ${order.totalPrice}</span>
              </div>
            </div>
          </div>

        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error fetching customer orders:', err);
  }
}

// ========================================================
// TAB 2: LIVE ORDER TRACKING BY ID
// ========================================================
function renderUserTrackTab(container) {
  container.innerHTML = `
    <div class="order-tracking-card">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
          <i class="fa-solid fa-satellite-dish"></i>
        </div>
        <div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0;">Live Grocery Dispatch Tracker</h3>
          <p style="font-size: 0.85rem; color: #64748b; margin: 0;">Real-time GPS status and delivery progress for any Sri Lanka order.</p>
        </div>
      </div>

      <form onsubmit="handleSearchOrderTrack(event)" style="margin-bottom: 2rem;">
        <div style="display: flex; gap: 0.75rem; max-width: 550px;">
          <input type="text" id="trackSearchInput" class="form-control" placeholder="Enter Order ID (e.g. ORD-501805)" style="text-transform: uppercase; font-weight: 700; font-size: 1.05rem;" required>
          <button type="submit" class="btn-primary-green" style="padding: 0 1.5rem; border-radius: 8px; flex-shrink: 0;">
            <i class="fa-solid fa-magnifying-glass mr-1"></i> Track Order
          </button>
        </div>
      </form>

      <div id="guestTrackResultContainer">
        <div style="text-align: center; padding: 2.5rem 1rem; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <i class="fa-solid fa-truck-ramp-box" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 0.75rem;"></i>
          <p style="font-weight: 600; color: #334155;">Enter an Order ID above or click "Track Live Status" from your orders list.</p>
        </div>
      </div>
    </div>
  `;
}

// Track Specific Order by ID (From button click)
function trackSpecificOrder(orderId) {
  activeDashboardTab = 'track';
  renderUserProfileAndDashboard();
  setTimeout(() => {
    const input = document.getElementById('trackSearchInput');
    if (input) input.value = orderId;
    fetchAndDisplayOrderTracking(orderId);
  }, 100);
}

// Handle Direct URL Tracking
function renderDirectOrderTracking(orderId) {
  const container = document.getElementById('accountMainContent');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width: 800px; margin: 2rem auto;">
      <div style="margin-bottom: 1.5rem;">
        <a href="account.html" class="btn-secondary-outline" style="font-size: 0.85rem; border-radius: 999px; padding: 0.4rem 1rem;">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back to Account
        </a>
      </div>
      <div id="guestTrackResultContainer">
        <div style="text-align: center; padding: 3rem; color: #64748b;">
          <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #22c55e;"></i>
          <p style="margin-top: 1rem; font-weight: 600;">Tracking Order #${orderId}...</p>
        </div>
      </div>
    </div>
  `;

  fetchAndDisplayOrderTracking(orderId);
}

// Handle Search Order Track Submit
function handleSearchOrderTrack(e) {
  e.preventDefault();
  const input = document.getElementById('trackSearchInput');
  if (!input) return;
  const orderId = input.value.trim().toUpperCase();
  if (orderId) {
    fetchAndDisplayOrderTracking(orderId);
  }
}

// Fetch and Render Visual Step-by-Step Order Tracker
async function fetchAndDisplayOrderTracking(orderId) {
  const container = document.getElementById('guestTrackResultContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 2.5rem; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #22c55e;"></i>
      <p style="margin-top: 1rem; font-weight: 600;">Contacting GreenBasket Matara Hub for Order #${orderId}...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`);
    const data = await res.json();

    if (!data.success || !data.order) {
      container.innerHTML = `
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 2rem; text-align: center; color: #be123c;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 0.75rem;"></i>
          <h4 style="font-weight: 800; font-size: 1.2rem; margin-bottom: 0.5rem;">Order Not Found</h4>
          <p style="font-size: 0.9rem; color: #9f1239;">We couldn't locate any order with ID <strong>${orderId}</strong>. Please double-check your Order ID from your receipt or checkout screen.</p>
        </div>
      `;
      return;
    }

    const order = data.order;
    const status = order.status || 'Pending';

    // Calculate Stepper Progress Percentage & Step States
    // Steps: 1. Placed -> 2. Quality Checked -> 3. Chilled Packed -> 4. Out for Delivery -> 5. Delivered
    let activeStepNum = 1;
    let progressPct = 10;
    const isCancelled = status === 'Cancelled';

    if (status === 'Quality Checked' || status === 'Confirmed') {
      activeStepNum = 2;
      progressPct = 35;
    } else if (status === 'Chilled Packed' || status === 'Processing' || status === 'Packing') {
      activeStepNum = 3;
      progressPct = 60;
    } else if (status === 'Out for Delivery') {
      activeStepNum = 4;
      progressPct = 85;
    } else if (status === 'Delivered') {
      activeStepNum = 5;
      progressPct = 100;
    }

    const isStepCompleted = (step) => !isCancelled && (step < activeStepNum || activeStepNum === 5);
    const isStepActive = (step) => !isCancelled && (step === activeStepNum && activeStepNum !== 5);

    container.innerHTML = `
      <div style="background: #ffffff; border: 1.5px solid ${isCancelled ? '#ef4444' : '#22c55e'}; border-radius: 16px; padding: 2rem; box-shadow: var(--shadow-md);">
        
        <!-- Order Header Badge -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: ${isCancelled ? '#dc2626' : '#16a34a'}; text-transform: uppercase; letter-spacing: 0.05em;">Verified Order Status</span>
            <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0;">Order #${order.id}</h3>
            <span style="font-size: 0.825rem; color: #64748b;">Placed on ${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div style="text-align: right;">
            <span class="order-status-badge" style="font-size: 0.95rem; padding: 0.45rem 1.25rem; font-weight: 800; background: ${isCancelled ? '#fee2e2' : (activeStepNum === 5 ? '#dcfce7' : '#ffedd5')}; color: ${isCancelled ? '#b91c1c' : (activeStepNum === 5 ? '#15803d' : '#c2410c')}; border-radius: 999px;">
              <i class="fa-solid ${isCancelled ? 'fa-ban' : (activeStepNum === 5 ? 'fa-circle-check' : 'fa-truck-fast')} mr-1"></i> ${order.status}
            </span>
          </div>
        </div>

        ${isCancelled ? `
          <div style="background: #fef2f2; border: 1.5px solid #f87171; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; color: #991b1b; display: flex; align-items: center; gap: 1rem;">
            <i class="fa-solid fa-circle-exclamation fa-2x text-red-600"></i>
            <div>
              <div style="font-weight: 800; font-size: 1rem;">This order was Cancelled</div>
              <div style="font-size: 0.85rem; color: #7f1d1d;">Items have been safely returned to store inventory. If you need assistance, please contact our Matara support team at +94 41-222-4589.</div>
            </div>
          </div>
        ` : ''}

        <!-- Visual Stepper Progress Bar -->
        <div class="order-stepper">
          <div class="order-stepper-progress" style="width: ${progressPct}%;"></div>

          <!-- Step 1: Placed -->
          <div class="stepper-step ${isStepCompleted(1) ? 'completed' : (isStepActive(1) ? 'active' : '')}">
            <div class="stepper-icon"><i class="fa-solid fa-receipt"></i></div>
            <div class="stepper-title">Order Placed</div>
            <div class="stepper-time">Received at Hub</div>
          </div>

          <!-- Step 2: Quality Inspection -->
          <div class="stepper-step ${isStepCompleted(2) ? 'completed' : (isStepActive(2) ? 'active' : '')}">
            <div class="stepper-icon"><i class="fa-solid fa-shield-halved"></i></div>
            <div class="stepper-title">Quality Checked</div>
            <div class="stepper-time">Keells Standard</div>
          </div>

          <!-- Step 3: Packing -->
          <div class="stepper-step ${isStepCompleted(3) ? 'completed' : (isStepActive(3) ? 'active' : '')}">
            <div class="stepper-icon"><i class="fa-solid fa-box"></i></div>
            <div class="stepper-title">Chilled Packed</div>
            <div class="stepper-time">Inspected Produce</div>
          </div>

          <!-- Step 4: Out for Delivery -->
          <div class="stepper-step ${isStepCompleted(4) ? 'completed' : (isStepActive(4) ? 'active' : '')}">
            <div class="stepper-icon"><i class="fa-solid fa-motorcycle"></i></div>
            <div class="stepper-title">Out for Delivery</div>
            <div class="stepper-time">Rider Dispatched</div>
          </div>

          <!-- Step 5: Delivered -->
          <div class="stepper-step ${isStepCompleted(5) ? 'completed' : (isStepActive(5) ? 'active' : '')}">
            <div class="stepper-icon"><i class="fa-solid fa-house-chimney-check"></i></div>
            <div class="stepper-title">Delivered</div>
            <div class="stepper-time">Safe Handover</div>
          </div>
        </div>

        <!-- Live Dispatch Note Box -->
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 1rem 1.25rem; margin: 2rem 0; display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 1.5rem; color: #16a34a;"><i class="fa-solid fa-location-crosshairs"></i></div>
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #15803d;">
              ${activeStepNum === 5 
                ? 'Order Successfully Delivered!' 
                : (activeStepNum === 4 ? 'GreenBasket Courier is en route to your doorstep!' : 'Order is being processed at Matara Central Hub.')}
            </div>
            <div style="font-size: 0.85rem; color: #166534;">
              Delivering to: <strong>${order.customer.address}, ${order.customer.city}, ${order.customer.district}</strong> (${order.customer.distanceKm || 0.6} km from Matara Hub)
            </div>
          </div>
        </div>

        <!-- Ordered Items Table -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem;">Basket Items (${order.items.length})</h4>
          <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
            ${order.items.map(it => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${it.image}" alt="${it.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;">
                  <div>
                    <div style="font-weight: 700; color: #1e293b; font-size: 0.9rem;">${it.name}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Rs. ${it.price} × ${it.quantity} ${it.unit || ''}</div>
                  </div>
                </div>
                <div style="font-weight: 800; color: #0f172a;">Rs. ${it.itemTotal || (it.price * it.quantity)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Financial Summary Breakdown -->
        <div style="background: #f8fafc; border-radius: 10px; padding: 1.25rem; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; color: #64748b;">
            <span>Items Subtotal:</span>
            <span style="font-weight: 700; color: #0f172a;">Rs. ${order.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; color: #64748b;">
            <span>Shipping Fee (${order.customer.locationLabel}):</span>
            <span style="font-weight: 700; color: ${order.shippingFee === 0 ? '#16a34a' : '#0f172a'};">
              ${order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee}`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 0.75rem;">
            <span>Total Payable:</span>
            <span style="color: #ea580c;">Rs. ${order.totalPrice}</span>
          </div>
        </div>

      </div>
    `;

  } catch (err) {
    console.error('Error tracking order:', err);
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ef4444;">Failed to retrieve order tracking data.</div>`;
  }
}

// ========================================================
// TAB 3: MY SAVED CARDS & PAYMENT METHODS
// ========================================================
function getSavedCards() {
  return JSON.parse(localStorage.getItem('gb_saved_cards') || '[]');
}

function saveCards(cards) {
  localStorage.setItem('gb_saved_cards', JSON.stringify(cards));
}

function renderUserCardsTab(container) {
  let cards = getSavedCards();

  // If empty, initialize with 1 default demo card for smooth UX
  if (cards.length === 0) {
    cards = [
      { id: 'card-1', brand: 'VISA', number: '•••• •••• •••• 4242', holder: GB.user.name || 'Kasun Perera', exp: '08/28', isDefault: true }
    ];
    saveCards(cards);
  }

  container.innerHTML = `
    <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0;">
            <i class="fa-solid fa-credit-card text-green-600 mr-2"></i> Saved Payment Cards
          </h3>
          <p style="font-size: 0.85rem; color: #64748b; margin: 3px 0 0;">Manage your debit/credit cards for 1-click grocery checkout.</p>
        </div>
        <button type="button" onclick="openAddNewCardModal()" class="btn-primary-green" style="font-size: 0.85rem; border-radius: 999px; padding: 0.5rem 1.15rem; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-plus"></i> Add New Card
        </button>
      </div>

      <!-- Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
        ${cards.map(c => `
          <div class="saved-card-item" style="border: 1.5px solid ${c.isDefault ? '#22c55e' : '#e2e8f0'}; background: ${c.isDefault ? '#f0fdf4' : '#ffffff'}; border-radius: 12px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="card-brand-badge" style="background: ${c.brand === 'VISA' ? '#1e40af' : (c.brand === 'Mastercard' || c.brand === 'MC' ? '#ea580c' : '#0284c7')}; color: white; padding: 0.4rem 0.65rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.05em;">
                ${c.brand}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 1rem; color: #0f172a; letter-spacing: 0.05em;">${c.number}</div>
                <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">Expires ${c.exp} • ${c.holder}</div>
                ${c.isDefault 
                  ? '<span style="font-size: 0.72rem; color: #15803d; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; margin-top: 4px;"><i class="fa-solid fa-circle-check"></i> Default Card</span>' 
                  : `<button type="button" onclick="setDefaultCard('${c.id}')" style="background: none; border: none; font-size: 0.72rem; color: #0284c7; font-weight: 700; cursor: pointer; padding: 0; margin-top: 4px; text-decoration: underline;">Set as Default</button>`}
              </div>
            </div>
            <button type="button" onclick="deleteCard('${c.id}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; transition: color 0.15s;" title="Remove Card" onmouseenter="this.style.color='#ef4444'" onmouseleave="this.style.color='#94a3b8'">
              <i class="fa-solid fa-trash-can fa-lg"></i>
            </button>
          </div>
        `).join('')}
      </div>

      <div style="padding: 1rem; background: #f8fafc; border-radius: 10px; border: 1px dashed #cbd5e1; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 0.75rem;">
        <i class="fa-solid fa-shield-halved text-green-600 fa-lg"></i>
        <span>Bank-grade 256-bit SSL encryption. Card numbers are securely tokenized and masked across Sri Lanka banking systems.</span>
      </div>
    </div>
  `;
}

// Open Add New Card Modal Dialog
function openAddNewCardModal() {
  let modal = document.getElementById('addCardModalOverlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'addCardModalOverlay';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
      <div style="max-width: 460px; width: 92%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1); animation: modalFadeIn 0.2s ease-out;">
        <div style="background: #166534; color: #ffffff; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 0.6rem;">
            <i class="fa-solid fa-credit-card"></i>
            <span>Add New Payment Card</span>
          </div>
          <button type="button" onclick="closeAddNewCardModal()" style="background: none; border: none; color: #ffffff; font-size: 1.25rem; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="addNewCardForm" onsubmit="handleSaveNewCard(event)" style="padding: 1.75rem;">
          <div class="form-group" style="margin-bottom: 1.15rem;">
            <label class="form-label" style="font-weight: 700; color: #1e293b; margin-bottom: 0.35rem; display: block;">Cardholder Full Name *</label>
            <input type="text" id="modalCardHolder" class="form-control" placeholder="e.g. Kasun Perera" required value="${GB.user ? (GB.user.name || '') : ''}">
          </div>

          <div class="form-group" style="margin-bottom: 1.15rem;">
            <label class="form-label" style="font-weight: 700; color: #1e293b; margin-bottom: 0.35rem; display: block;">16-Digit Card Number *</label>
            <div style="position: relative;">
              <input type="text" id="modalCardNumber" class="form-control" placeholder="4532 8901 2345 6789" maxlength="19" required style="font-weight: 700; letter-spacing: 0.05em; font-size: 1rem;">
              <span id="modalCardBrandBadge" style="position: absolute; right: 12px; top: 11px; font-size: 1.4rem;">
                <i class="fa-brands fa-cc-visa" style="color: #1e40af;"></i>
              </span>
            </div>
            <small style="font-size: 0.72rem; color: #64748b; margin-top: 3px; display: block;">VISA, Mastercard or Sri Lanka bank debit card</small>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.15rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; color: #1e293b; margin-bottom: 0.35rem; display: block;">Expiry Date *</label>
              <input type="text" id="modalCardExpiry" class="form-control" placeholder="MM/YY" maxlength="5" required style="font-weight: 600;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; color: #1e293b; margin-bottom: 0.35rem; display: block;">CVV / CVC *</label>
              <input type="password" id="modalCardCVV" class="form-control" placeholder="123" maxlength="4" required style="font-weight: 600;">
            </div>
          </div>

          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #475569; cursor: pointer; margin-bottom: 1.5rem;">
            <input type="checkbox" id="modalCardDefault" checked>
            <span>Set as my default payment method for fast checkout</span>
          </label>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" onclick="closeAddNewCardModal()" class="btn-secondary-outline" style="flex: 1; border-radius: 999px; padding: 0.75rem;">
              Cancel
            </button>
            <button type="submit" class="btn-primary-green" style="flex: 1.5; border-radius: 999px; padding: 0.75rem;">
              <i class="fa-solid fa-shield-halved mr-1"></i> Save Card
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Card formatting input listeners
    const numInput = document.getElementById('modalCardNumber');
    if (numInput) {
      numInput.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        e.target.value = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
        const brandBadge = document.getElementById('modalCardBrandBadge');
        if (brandBadge) {
          if (raw.startsWith('4')) {
            brandBadge.innerHTML = '<i class="fa-brands fa-cc-visa" style="color: #1e40af;"></i>';
          } else if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) {
            brandBadge.innerHTML = '<i class="fa-brands fa-cc-mastercard" style="color: #ea580c;"></i>';
          } else if (/^3[47]/.test(raw)) {
            brandBadge.innerHTML = '<i class="fa-brands fa-cc-amex" style="color: #0284c7;"></i>';
          } else {
            brandBadge.innerHTML = '<i class="fa-regular fa-credit-card" style="color: #64748b;"></i>';
          }
        }
      });
    }

    const expInput = document.getElementById('modalCardExpiry');
    if (expInput) {
      expInput.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (raw.length >= 3) {
          e.target.value = raw.slice(0, 2) + '/' + raw.slice(2);
        } else {
          e.target.value = raw;
        }
      });
    }

    const cvvInput = document.getElementById('modalCardCVV');
    if (cvvInput) {
      cvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      });
    }
  }

  modal.style.display = 'flex';
}

function closeAddNewCardModal() {
  const modal = document.getElementById('addCardModalOverlay');
  if (modal) modal.style.display = 'none';
}

// Handle Save New Card Submit with Full Validation
function handleSaveNewCard(e) {
  e.preventDefault();
  const holder = (document.getElementById('modalCardHolder')?.value || '').trim();
  const rawNum = (document.getElementById('modalCardNumber')?.value || '').replace(/\s+/g, '');
  const exp = (document.getElementById('modalCardExpiry')?.value || '').trim();
  const cvv = (document.getElementById('modalCardCVV')?.value || '').trim();
  const isDefault = document.getElementById('modalCardDefault')?.checked || false;

  if (!holder || holder.length < 2) {
    showToast('Please enter the cardholder name.', 'error');
    document.getElementById('modalCardHolder')?.focus();
    return;
  }

  if (!validateLuhn(rawNum)) {
    showToast('Invalid card number. Please enter a valid 16-digit debit/credit card number.', 'error');
    document.getElementById('modalCardNumber')?.focus();
    return;
  }

  if (!validateCardExpiry(exp)) {
    showToast('Invalid or expired date. Expiry date must be a valid future MM/YY.', 'error');
    document.getElementById('modalCardExpiry')?.focus();
    return;
  }

  if (!validateCardCVV(cvv)) {
    showToast('Invalid CVV (must be 3 or 4 digits).', 'error');
    document.getElementById('modalCardCVV')?.focus();
    return;
  }

  const brand = detectCardBrand(rawNum);
  const masked = `•••• •••• •••• ${rawNum.slice(-4)}`;

  let cards = getSavedCards();
  if (isDefault) {
    cards.forEach(c => c.isDefault = false);
  }

  cards.push({
    id: `card-${Date.now()}`,
    brand,
    number: masked,
    holder,
    exp,
    isDefault: isDefault || cards.length === 0
  });

  saveCards(cards);
  closeAddNewCardModal();
  showToast('Payment card saved securely!', 'success');
  renderUserCardsTab(document.getElementById('dashboardTabContent'));
}

// Set Default Card
function setDefaultCard(cardId) {
  let cards = getSavedCards();
  cards.forEach(c => {
    c.isDefault = (c.id === cardId);
  });
  saveCards(cards);
  showToast('Default payment card updated.', 'success');
  renderUserCardsTab(document.getElementById('dashboardTabContent'));
}

// Delete Card
function deleteCard(cardId) {
  let cards = getSavedCards().filter(c => c.id !== cardId);
  if (cards.length > 0 && !cards.some(c => c.isDefault)) {
    cards[0].isDefault = true;
  }
  saveCards(cards);
  showToast('Card removed from your account.', 'info');
  renderUserCardsTab(document.getElementById('dashboardTabContent'));
}

// ========================================================
// TAB 4: MY ACTIVE BASKET / CART
// ========================================================
function renderUserCartTab(container) {
  const subtotal = GB.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  container.innerHTML = `
    <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0;">
            <i class="fa-solid fa-cart-shopping text-green-600 mr-2"></i> Current Shopping Basket
          </h3>
          <p style="font-size: 0.85rem; color: #64748b; margin: 3px 0 0;">${GB.cart.length} item(s) currently selected.</p>
        </div>
        ${GB.cart.length > 0 ? `
          <a href="checkout.html" class="btn-primary-orange">
            <span>Proceed to Checkout</span> <i class="fa-solid fa-arrow-right"></i>
          </a>
        ` : ''}
      </div>

      ${GB.cart.length === 0 ? `
        <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
          <i class="fa-solid fa-basket-shopping fa-3x" style="color: #cbd5e1; margin-bottom: 1rem;"></i>
          <h4 style="font-weight: 800; font-size: 1.15rem; color: #1e293b; margin-bottom: 0.5rem;">Your basket is empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Choose from our Nuwara Eliya vegetables, fruits, Kotmale milk & spices.</p>
          <a href="shop.html" class="btn-primary-green">Browse Supermarket Aisles</a>
        </div>
      ` : `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem;">
          ${GB.cart.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.image}" alt="${item.name}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover;">
                <div>
                  <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem;">${item.name}</div>
                  <div style="font-size: 0.825rem; color: #64748b;">Rs. ${item.price} each (${item.unit || ''})</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div class="quantity-control">
                  <button class="btn-qty" onclick="changeCartItemQty('${item.productId}', -1); renderUserProfileAndDashboard();">-</button>
                  <span class="qty-display">${item.quantity}</span>
                  <button class="btn-qty" onclick="changeCartItemQty('${item.productId}', 1); renderUserProfileAndDashboard();">+</button>
                </div>
                <div style="font-weight: 800; font-size: 1.05rem; color: #0f172a; min-width: 90px; text-align: right;">
                  Rs. ${item.price * item.quantity}
                </div>
                <button onclick="removeCartItem('${item.productId}'); renderUserProfileAndDashboard();" style="color: #ef4444; background: none; border: none; cursor: pointer; padding: 0.4rem;">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 1.25rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div>
            <span style="font-size: 0.85rem; color: #64748b;">Basket Subtotal:</span>
            <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">Rs. ${subtotal}</div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <a href="shop.html" class="btn-secondary-outline">Add More Groceries</a>
            <a href="checkout.html" class="btn-primary-orange">
              <span>Checkout Order</span> <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `}
    </div>
  `;
}
