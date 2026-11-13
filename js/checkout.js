/**
 * GreenBasket - Sri Lanka District, City, GPS Location & Shipping Calculation Logic
 * Shop Base: Matara City (5.9496, 80.5469)
 */

let selectedDistrict = 'Matara';
let selectedCity = 'Matara City - Central (Within 1 km of Shop)';
let currentPostalCode = '81000';
let calculatedDistanceKm = 0.6;
let currentShippingFee = 0;

function initCheckout() {
  const checkoutContainer = document.getElementById('checkoutItemsList');
  if (!checkoutContainer) return;

  if (GB.cart.length === 0) {
    document.getElementById('checkoutMainSection').innerHTML = `
      <div style="text-align: center; padding: 4rem 1.5rem; background: white; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; box-shadow: var(--shadow-sm);">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.25rem;">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem;">Your Basket is Empty</h2>
        <p style="color: #64748b; margin-bottom: 1.75rem; font-size: 0.95rem;">You don't have any groceries in your cart to checkout yet.</p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="shop.html" class="btn-primary-green" style="padding: 0.75rem 1.5rem; border-radius: 999px;">
            <i class="fa-solid fa-basket-shopping mr-1"></i> Browse Fresh Aisles
          </a>
          <button type="button" onclick="loadDemoCartForTesting()" class="btn-secondary-outline" style="padding: 0.75rem 1.5rem; border-radius: 999px;">
            <i class="fa-solid fa-wand-magic-sparkles mr-1 text-orange-500"></i> Load Sample Basket (1-Click)
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Populate Districts dropdown
  populateDistrictDropdown();

  // Pre-fill user details if logged in
  if (GB.user) {
    const nameInput = document.getElementById('custName');
    const emailInput = document.getElementById('custEmail');
    const phoneInput = document.getElementById('custPhone');
    const addressInput = document.getElementById('custAddress');

    if (nameInput && !nameInput.value) nameInput.value = GB.user.name || '';
    if (emailInput && !emailInput.value) emailInput.value = GB.user.email || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = GB.user.phone || '';
    if (addressInput && !addressInput.value) addressInput.value = GB.user.address || '';

    if (GB.user.district) {
      selectedDistrict = GB.user.district;
      const distEl = document.getElementById('custDistrict');
      if (distEl) distEl.value = selectedDistrict;
      populateCitiesDropdown(selectedDistrict);
      
      if (GB.user.city) {
        selectedCity = GB.user.city;
        const cityEl = document.getElementById('custCity');
        if (cityEl) cityEl.value = selectedCity;
      }
      if (GB.user.postalCode) {
        currentPostalCode = GB.user.postalCode;
        const postalEl = document.getElementById('custPostalCode');
        if (postalEl) postalEl.value = currentPostalCode;
      }
      if (GB.user.distanceKm !== undefined) {
        calculatedDistanceKm = parseFloat(GB.user.distanceKm);
      }
    }
  }

  // Render items list
  checkoutContainer.innerHTML = GB.cart.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;">
        <div>
          <div style="font-weight: 700; font-size: 0.885rem; color: #1e293b;">${item.name}</div>
          <div style="font-size: 0.78rem; color: #64748b;">Rs. ${item.price} × ${item.quantity} ${item.unit || ''}</div>
        </div>
      </div>
      <div style="font-weight: 800; color: #1e293b; font-size: 0.95rem;">
        Rs. ${item.price * item.quantity}
      </div>
    </div>
  `).join('');

  // Initial calculation
  recalculateShippingAndTotals();

  // Initialize Saved Cards in Checkout if any exist
  initCheckoutSavedCards();

  // Real-time Sri Lankan phone number sanitization (strictly 10 digits starting with 0)
  const phoneInput = document.getElementById('custPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 10) val = val.slice(0, 10);
      e.target.value = val;
    });
  }

  // Real-time card formatting & brand detection
  const cardNumInput = document.getElementById('cardNumInput');
  if (cardNumInput) {
    cardNumInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      const icon = document.querySelector('#cardPaymentFields .fa-cc-visa, #cardPaymentFields .fa-cc-mastercard, #cardPaymentFields .fa-cc-amex, #cardPaymentFields .fa-credit-card');
      if (icon) {
        if (raw.startsWith('4')) {
          icon.className = 'fa-brands fa-cc-visa';
          icon.style.color = '#1e40af';
        } else if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) {
          icon.className = 'fa-brands fa-cc-mastercard';
          icon.style.color = '#ea580c';
        } else if (/^3[47]/.test(raw)) {
          icon.className = 'fa-brands fa-cc-amex';
          icon.style.color = '#0284c7';
        } else {
          icon.className = 'fa-regular fa-credit-card';
          icon.style.color = '#64748b';
        }
      }
    });
  }

  const cardExpInput = document.getElementById('cardExpInput');
  if (cardExpInput) {
    cardExpInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (raw.length >= 3) {
        e.target.value = raw.slice(0, 2) + '/' + raw.slice(2);
      } else {
        e.target.value = raw;
      }
    });
  }

  const cardCvvInput = document.getElementById('cardCvvInput');
  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  // Order submission
  const orderForm = document.getElementById('checkoutOrderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', handlePlaceOrder);
  }
}

// Payment Method Toggle & Card Fields
function handlePaymentMethodChange(val) {
  const isCard = val.includes('Card');
  const cardFields = document.getElementById('cardPaymentFields');
  const labelCod = document.getElementById('labelPaymentCod');
  const labelCard = document.getElementById('labelPaymentCard');

  if (labelCod) labelCod.classList.toggle('selected', !isCard);
  if (labelCard) labelCard.classList.toggle('selected', isCard);

  if (cardFields) {
    cardFields.style.display = isCard ? 'block' : 'none';
  }
}

function initCheckoutSavedCards() {
  const cards = JSON.parse(localStorage.getItem('gb_saved_cards') || '[]');
  const selectWrap = document.getElementById('savedCardsSelectorWrap');
  const select = document.getElementById('checkoutSavedCardSelect');

  if (cards.length > 0 && selectWrap && select) {
    selectWrap.style.display = 'block';
    select.innerHTML = `
      <option value="">-- Choose from your saved cards --</option>
      ${cards.map(c => `<option value="${c.id}">${c.brand} • ${c.number} (${c.holder})</option>`).join('')}
      <option value="new">+ Enter a new card</option>
    `;
  }
}

function handleSavedCardSelected(cardId) {
  const cards = JSON.parse(localStorage.getItem('gb_saved_cards') || '[]');
  const card = cards.find(c => c.id === cardId);
  const cardNum = document.getElementById('cardNumInput');
  const cardExp = document.getElementById('cardExpInput');
  const cardHolder = document.getElementById('cardHolderInput');
  const brandIcon = document.getElementById('cardBrandIcon');

  if (card) {
    if (cardNum) cardNum.value = card.number;
    if (cardExp) cardExp.value = card.exp;
    if (cardHolder) cardHolder.value = card.holder;
    if (brandIcon) {
      if (card.brand === 'VISA') {
        brandIcon.className = 'fa-brands fa-cc-visa';
        brandIcon.style.color = '#1e40af';
      } else if (card.brand === 'Mastercard' || card.brand === 'MC') {
        brandIcon.className = 'fa-brands fa-cc-mastercard';
        brandIcon.style.color = '#ea580c';
      } else if (card.brand === 'AMEX') {
        brandIcon.className = 'fa-brands fa-cc-amex';
        brandIcon.style.color = '#0284c7';
      }
    }
  } else if (cardId === 'new') {
    if (cardNum) cardNum.value = '';
    if (cardExp) cardExp.value = '';
    if (cardHolder) cardHolder.value = GB.user ? GB.user.name : '';
    if (brandIcon) {
      brandIcon.className = 'fa-regular fa-credit-card';
      brandIcon.style.color = '#64748b';
    }
  }
}

// Convenient Test/Demo Basket Loader
function loadDemoCartForTesting() {
  GB.cart = [
    {
      productId: "prod-1",
      name: "Keells Fresh Nuwara Eliya Carrots",
      price: 260,
      quantity: 2,
      itemTotal: 520,
      image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=500&auto=format&fit=crop&q=80",
      unit: "500g pack"
    },
    {
      productId: "prod-5",
      name: "Kotmale Pure Fresh Cow Milk",
      price: 480,
      quantity: 2,
      itemTotal: 960,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80",
      unit: "1L bottle"
    },
    {
      productId: "prod-18",
      name: "Pure Ceylon Alba Cinnamon Quills",
      price: 550,
      quantity: 1,
      itemTotal: 550,
      image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500&auto=format&fit=crop&q=80",
      unit: "100g tin"
    }
  ];
  saveCart();
  if (typeof updateCartUI === 'function') updateCartUI();
  location.reload();
}

// Populate District Dropdown
function populateDistrictDropdown() {
  const distSelect = document.getElementById('custDistrict');
  if (!distSelect || typeof SRI_LANKA_LOCATIONS === 'undefined') return;

  const districts = Object.keys(SRI_LANKA_LOCATIONS);
  distSelect.innerHTML = districts.map(d => `
    <option value="${d}" ${d === selectedDistrict ? 'selected' : ''}>${d} District</option>
  `).join('');

  distSelect.addEventListener('change', (e) => {
    selectedDistrict = e.target.value;
    populateCitiesDropdown(selectedDistrict);
  });

  populateCitiesDropdown(selectedDistrict);
}

// Populate City Dropdown based on chosen District
function populateCitiesDropdown(district) {
  const citySelect = document.getElementById('custCity');
  const postalInput = document.getElementById('custPostalCode');
  if (!citySelect || typeof SRI_LANKA_LOCATIONS === 'undefined') return;

  const distData = SRI_LANKA_LOCATIONS[district];
  if (!distData) return;

  citySelect.innerHTML = distData.cities.map(c => `
    <option value="${c.name}" data-postal="${c.postalCode}" data-km="${c.distanceKm}">
      ${c.name} (${c.distanceKm} km from Matara Shop)
    </option>
  `).join('');

  // Update selection
  selectedCity = citySelect.value;
  const selectedOption = citySelect.options[citySelect.selectedIndex];
  if (selectedOption) {
    currentPostalCode = selectedOption.getAttribute('data-postal') || distData.postalCodeDefault;
    calculatedDistanceKm = parseFloat(selectedOption.getAttribute('data-km')) || 1.0;
    if (postalInput) postalInput.value = currentPostalCode;
  }

  citySelect.onchange = (e) => {
    selectedCity = e.target.value;
    const opt = e.target.options[e.target.selectedIndex];
    currentPostalCode = opt.getAttribute('data-postal') || distData.postalCodeDefault;
    calculatedDistanceKm = parseFloat(opt.getAttribute('data-km')) || 1.0;
    if (postalInput) postalInput.value = currentPostalCode;
    recalculateShippingAndTotals();
  };

  recalculateShippingAndTotals();
}

// Live GPS Location Tracker Click Handler
function handleDetectGPSLocation() {
  const gpsBtn = document.getElementById('btnDetectGPS');
  if (gpsBtn) {
    gpsBtn.disabled = true;
    gpsBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Tracking GPS...`;
  }

  detectUserLiveGPSLocation((result) => {
    if (gpsBtn) {
      gpsBtn.disabled = false;
      gpsBtn.innerHTML = `<i class="fa-solid fa-location-crosshairs mr-1"></i> Detect My Live GPS Location`;
    }

    if (result) {
      calculatedDistanceKm = result.distanceKm;
      const badge = document.getElementById('liveDistanceDisplay');
      if (badge) {
        badge.style.display = 'block';
        badge.innerHTML = `
          <div style="background: #dcfce7; border: 1px solid #86efac; color: #15803d; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
            <i class="fa-solid fa-satellite-dish text-green-600"></i>
            <span>Live GPS Verified: You are exactly <strong>${calculatedDistanceKm} km</strong> from GreenBasket Matara Hub!</span>
          </div>
        `;
      }
      showToast(`GPS Location Detected: ${calculatedDistanceKm} km from Matara shop!`, 'success');
      recalculateShippingAndTotals();
    }
  });
}

// Recalculate Shipping Fee and Grand Totals
function recalculateShippingAndTotals() {
  const subtotal = GB.cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutTotal');
  const alertEl = document.getElementById('shippingRuleAlert');
  const distanceInfoEl = document.getElementById('distanceSummaryInfo');

  if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal}`;

  // Call Sri Lanka calculation formula
  const calc = calculateSriLankaShipping(calculatedDistanceKm, subtotal);
  currentShippingFee = calc.shippingFee;

  if (shippingEl) {
    shippingEl.innerHTML = calc.isFree 
      ? '<span style="color: #16a34a; font-weight: 800;">FREE (Rs. 0)</span>' 
      : `Rs. ${calc.shippingFee}`;
  }

  if (totalEl) totalEl.textContent = `Rs. ${subtotal + calc.shippingFee}`;

  if (distanceInfoEl) {
    distanceInfoEl.textContent = `${calculatedDistanceKm} km (${calc.zoneName})`;
  }

  if (alertEl) {
    alertEl.innerHTML = `
      <div style="background-color: ${calc.isFree ? '#dcfce7' : '#fff7ed'}; border: 1px solid ${calc.isFree ? '#86efac' : '#fdba74'}; border-radius: 8px; padding: 0.75rem 1rem; color: ${calc.isFree ? '#15803d' : '#c2410c'}; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid ${calc.isFree ? 'fa-circle-check text-green-600' : 'fa-truck-fast text-orange-500'}"></i>
        <div>${calc.message}</div>
      </div>
    `;
  }
}

// Handle Order Placement
async function handlePlaceOrder(e) {
  e.preventDefault();

  if (GB.cart.length === 0) {
    showToast('Your basket is empty!', 'error');
    return;
  }

  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const rawPhone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const postalCode = document.getElementById('custPostalCode')?.value.trim() || currentPostalCode;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash on Delivery';
  const orderNotes = document.getElementById('orderNotes')?.value.trim() || '';

  if (!name || name.length < 2) {
    showToast('Please enter your full name (minimum 2 characters).', 'error');
    document.getElementById('custName')?.focus();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    document.getElementById('custEmail')?.focus();
    return;
  }

  // 1. Strict Sri Lankan Phone Number Validation (strictly 10 digits starting with 0)
  const cleanPhone = normalizeSriLankanPhone(rawPhone);
  if (!isValidSriLankanPhone(cleanPhone)) {
    showToast('Please enter a valid 10-digit Sri Lankan phone number starting with 0 (e.g. 0771234567 or 0412224589).', 'error');
    document.getElementById('custPhone')?.focus();
    return;
  }

  if (!address || address.length < 5) {
    showToast('Please enter a complete delivery address (at least 5 characters).', 'error');
    document.getElementById('custAddress')?.focus();
    return;
  }

  // 2. Strict Card / Online Payment Validation
  const isCard = paymentMethod.includes('Card');
  let cardBrand = 'VISA';
  let last4 = '4242';
  let cardHolder = name;
  let cardExp = '12/28';

  if (isCard) {
    const savedCardSelect = document.getElementById('checkoutSavedCardSelect');
    const isUsingSavedCard = savedCardSelect && savedCardSelect.value && savedCardSelect.value !== 'new' && savedCardSelect.value !== '';

    if (isUsingSavedCard) {
      const cards = JSON.parse(localStorage.getItem('gb_saved_cards') || '[]');
      const chosenCard = cards.find(c => c.id === savedCardSelect.value);
      if (chosenCard) {
        cardBrand = chosenCard.brand || 'VISA';
        last4 = (chosenCard.number || '').replace(/\D/g, '').slice(-4) || '4242';
        cardHolder = chosenCard.holder || name;
        cardExp = chosenCard.exp || '12/28';
      }
    } else {
      const cardNum = (document.getElementById('cardNumInput')?.value || '').trim();
      cardExp = (document.getElementById('cardExpInput')?.value || '').trim();
      const cardCvv = (document.getElementById('cardCvvInput')?.value || '').trim();
      cardHolder = (document.getElementById('cardHolderInput')?.value || '').trim();

      const rawCardDigits = cardNum.replace(/\s+/g, '');

      if (!cardHolder || cardHolder.length < 2) {
        showToast('Please enter the Cardholder Name as shown on the card.', 'error');
        document.getElementById('cardHolderInput')?.focus();
        return;
      }

      if (!validateLuhn(rawCardDigits)) {
        showToast('Invalid card number. Please enter a valid 16-digit credit or debit card number.', 'error');
        document.getElementById('cardNumInput')?.focus();
        return;
      }

      if (!validateCardExpiry(cardExp)) {
        showToast('Invalid or expired card expiration date (must be future MM/YY).', 'error');
        document.getElementById('cardExpInput')?.focus();
        return;
      }

      if (!validateCardCVV(cardCvv)) {
        showToast('Invalid CVV/CVC code (must be 3 or 4 digits).', 'error');
        document.getElementById('cardCvvInput')?.focus();
        return;
      }

      cardBrand = detectCardBrand(rawCardDigits);
      last4 = rawCardDigits.slice(-4);
    }
  }

  const orderPayload = {
    customer: {
      id: GB.user ? GB.user.id : 'guest',
      name,
      email,
      phone: cleanPhone,
      district: selectedDistrict,
      city: selectedCity,
      postalCode,
      address,
      distanceKm: calculatedDistanceKm,
      locationLabel: `${selectedCity}, ${selectedDistrict} (${postalCode}) - ${calculatedDistanceKm} km from Matara Shop`
    },
    items: GB.cart,
    paymentMethod,
    orderNotes
  };

  const submitBtn = document.getElementById('placeOrderBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...`;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (data.success) {
      GB.cart = [];
      saveCart();
      if (typeof updateCartUI === 'function') updateCartUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If card was paid and save checkbox checked, save masked card to user account
      const saveCheckbox = document.getElementById('saveCardCheckbox');
      const savedCardSelect = document.getElementById('checkoutSavedCardSelect');
      const isUsingSavedCard = savedCardSelect && savedCardSelect.value && savedCardSelect.value !== 'new' && savedCardSelect.value !== '';

      if (isCard && saveCheckbox && saveCheckbox.checked && !isUsingSavedCard) {
        const cards = JSON.parse(localStorage.getItem('gb_saved_cards') || '[]');
        const masked = `•••• •••• •••• ${last4}`;
        cards.push({
          id: `card-${Date.now()}`,
          brand: cardBrand,
          number: masked,
          holder: cardHolder,
          exp: cardExp,
          isDefault: cards.length === 0
        });
        localStorage.setItem('gb_saved_cards', JSON.stringify(cards));
      }

      localStorage.setItem('gb_last_order_id', data.order.id);
      showOrderConfirmation(data.order);
    } else {
      showToast(data.message || 'Failed to place order.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Place Order</span> <i class="fa-solid fa-arrow-right"></i>`;
      }
    }
  } catch (err) {
    console.error('Error submitting order:', err);
    showToast('Network error while placing order.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Place Order</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
  }
}

// Show Confirmation Screen
function showOrderConfirmation(order) {
  const mainSec = document.getElementById('checkoutMainSection');
  if (!mainSec) return;

  mainSec.innerHTML = `
    <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 3rem 2rem; max-width: 720px; margin: 0 auto; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
      <div style="width: 72px; height: 72px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.5rem;">
        <i class="fa-solid fa-check"></i>
      </div>
      
      <h2 style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Thank You For Your Order!</h2>
      <p style="color: #64748b; font-size: 1rem; margin-bottom: 1.5rem;">
        Your order has been received at our <strong>Matara Hub</strong> and is being prepared with sunrise-harvested organic produce.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-align: left; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem;">
          <span style="font-weight: 600; color: #64748b;">Order Number:</span>
          <span style="font-weight: 800; color: #0f172a;">${order.id}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
          <span style="font-weight: 600; color: #64748b;">Customer Name:</span>
          <span style="font-weight: 700; color: #0f172a;">${order.customer.name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
          <span style="font-weight: 600; color: #64748b;">Delivery Destination:</span>
          <span style="font-weight: 700; color: #16a34a;">${order.customer.locationLabel}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
          <span style="font-weight: 600; color: #64748b;">Distance from Matara Shop:</span>
          <span style="font-weight: 700; color: #0f172a;">${order.customer.distanceKm || 0.6} km</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
          <span style="font-weight: 600; color: #64748b;">Shipping Fee:</span>
          <span style="font-weight: 700; color: ${order.shippingFee === 0 ? '#16a34a' : '#0f172a'};">
            ${order.shippingFee === 0 ? 'FREE (Within 1 km of Matara Shop & Total >= Rs. 2,000)' : `Rs. ${order.shippingFee}`}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; border-top: 1.5px dashed #cbd5e1; padding-top: 0.75rem; color: #0f172a;">
          <span>Total Payable:</span>
          <span style="color: #ea580c;">Rs. ${order.totalPrice}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <a href="account.html?track=${order.id}" class="btn-primary-green" style="padding: 0.85rem 1.75rem; border-radius: 999px;">
          <i class="fa-solid fa-truck-fast mr-1"></i> Track Live Status
        </a>
        <a href="shop.html" class="btn-secondary-outline" style="padding: 0.85rem 1.5rem; border-radius: 999px;">
          Continue Shopping
        </a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initCheckout);
