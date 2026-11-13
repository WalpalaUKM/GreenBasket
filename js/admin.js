/**
 * GreenBasket - Node.js Admin Dashboard Controller
 * Product Management, 1-Click Out-of-Stock Toggle, Edit Item with Rating & Short Desc, Orders Tracking
 */

let adminProducts = [];
let adminOrders = [];

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
  checkAdminSession();
});

// Check if admin is signed in
function checkAdminSession() {
  const adminUser = JSON.parse(localStorage.getItem('gb_user') || 'null');
  const loginWrapper = document.getElementById('adminLoginWrapper');
  const dashboardLayout = document.getElementById('adminDashboardLayout');

  if (adminUser && adminUser.role === 'admin') {
    if (loginWrapper) loginWrapper.style.display = 'none';
    if (dashboardLayout) dashboardLayout.style.display = 'flex';
    document.getElementById('adminNameDisplay').textContent = adminUser.name;
    loadAdminStats();
    loadAdminProducts();
    loadAdminOrders();
  } else {
    if (loginWrapper) loginWrapper.style.display = 'flex';
    if (dashboardLayout) dashboardLayout.style.display = 'none';
  }
}

// Handle Admin Login Submit
async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success && data.user.role === 'admin') {
      saveUser(data.user);
      showToast('Admin access granted! Loading dashboard...', 'success');
      checkAdminSession();
    } else {
      showToast('Invalid admin credentials or access denied.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to backend server.', 'error');
  }
}

// Admin Logout
function handleAdminLogout() {
  saveUser(null);
  showToast('Logged out of Admin Portal.', 'success');
  checkAdminSession();
}

// Load Dashboard Analytics / Stats
async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.success) {
      document.getElementById('statTotalSales').textContent = `Rs. ${data.stats.totalSales.toLocaleString()}`;
      document.getElementById('statTotalOrders').textContent = data.stats.totalOrders;
      document.getElementById('statTotalProducts').textContent = data.stats.totalProducts;
      document.getElementById('statOutOfStock').textContent = data.stats.outOfStockCount;
      document.getElementById('statPendingOrders').textContent = data.stats.pendingOrders;
    }
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }
}

// ========================================================
// PRODUCT MANAGEMENT
// ========================================================

// Load Products into Admin Table
async function loadAdminProducts() {
  const tableBody = document.getElementById('adminProductsTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      adminProducts = data.products;
      renderAdminProductsTable();
    }
  } catch (err) {
    console.error('Error loading admin products:', err);
  }
}

function renderAdminProductsTable() {
  const tableBody = document.getElementById('adminProductsTableBody');
  if (!tableBody) return;

  if (adminProducts.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No products found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = adminProducts.map(prod => {
    const isOut = !prod.inStock || prod.count <= 0;
    const ratingVal = prod.rating || 4.8;
    const shortDesc = prod.shortDesc || prod.description || '100% certified organic produce.';

    return `
      <tr>
        <td>
          <img src="${prod.image}" alt="${prod.name}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;">
        </td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${prod.name}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${prod.unit || '1 unit'} • ${prod.category}</div>
        </td>
        <td style="max-width: 220px;">
          <!-- Little Description Snippet in Admin -->
          <div style="font-size: 0.78rem; color: #475569; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${shortDesc}
          </div>
        </td>
        <td>
          <!-- Rating in Admin -->
          <div style="display: flex; align-items: center; gap: 3px; font-weight: 700; font-size: 0.85rem; color: #b45309;">
            <i class="fa-solid fa-star text-amber-500"></i> ${ratingVal.toFixed(1)}
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: normal;">(${prod.reviewsCount || 20})</span>
          </div>
        </td>
        <td style="font-weight: 800; color: #ea580c;">
          Rs. ${prod.price}
        </td>
        <td style="font-weight: 700; color: ${prod.count <= 5 ? '#dc2626' : '#1e293b'};">
          ${prod.count}
        </td>
        <td>
          <!-- 1-CLICK TOGGLE OUT OF STOCK / IN STOCK BUTTON -->
          <button 
            class="btn-toggle-stock ${isOut ? 'is-outstock' : 'is-instock'}"
            onclick="toggleProductStock('${prod.id}')"
            title="Click to toggle stock status"
          >
            <i class="fa-solid ${isOut ? 'fa-ban' : 'fa-check'}"></i>
            <span>${isOut ? 'OUT OF STOCK' : 'IN STOCK'}</span>
          </button>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button onclick="openEditProductModal('${prod.id}')" style="color: #0284c7; background: #e0f2fe; padding: 0.35rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Edit Product">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteProduct('${prod.id}')" style="color: #ef4444; background: #fee2e2; padding: 0.35rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Delete Product">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 1-Click Toggle Out of Stock
async function toggleProductStock(productId) {
  try {
    const res = await fetch(`/api/products/${productId}/toggle-stock`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminProducts();
      loadAdminStats();
    } else {
      showToast('Failed to toggle stock status', 'error');
    }
  } catch (err) {
    showToast('Network error while toggling stock', 'error');
  }
}

// Delete Product
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to permanently delete this product?')) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted successfully', 'success');
      loadAdminProducts();
      loadAdminStats();
    } else {
      showToast('Failed to delete product', 'error');
    }
  } catch (err) {
    showToast('Network error while deleting', 'error');
  }
}

// Add New Product Modal & Submit
function openAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.add('active');
}

function closeAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.remove('active');
}

async function handleAddProductSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('newProdName').value.trim();
  const category = document.getElementById('newProdCategory').value;
  const price = document.getElementById('newProdPrice').value;
  const count = document.getElementById('newProdCount').value;
  const unit = document.getElementById('newProdUnit').value.trim();
  const rating = document.getElementById('newProdRating').value || 4.8;
  const shortDesc = document.getElementById('newProdShortDesc').value.trim();
  const image = document.getElementById('newProdImage').value.trim();
  const description = document.getElementById('newProdDesc').value.trim();

  const payload = {
    name,
    category,
    price: parseFloat(price),
    count: parseInt(count, 10),
    unit,
    rating: parseFloat(rating),
    shortDesc,
    image,
    description
  };

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('New product added to inventory with rating & description!', 'success');
      closeAddProductModal();
      document.getElementById('addProductForm').reset();
      loadAdminProducts();
      loadAdminStats();
    } else {
      showToast(data.message || 'Error adding product', 'error');
    }
  } catch (err) {
    showToast('Network error while saving product', 'error');
  }
}

// ========================================================
// EDIT PRODUCT MODAL (Control Rating, Short Desc, Price, Count)
// ========================================================
function openEditProductModal(productId) {
  const prod = adminProducts.find(p => p.id === productId);
  if (!prod) return;

  let modal = document.getElementById('editProductModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.id = 'editProductModal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="admin-modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #0f172a;">Edit Product Details</h3>
        <button onclick="closeEditProductModal()" style="font-size: 1.25rem; color: #94a3b8; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <form onsubmit="handleEditProductSubmit(event, '${prod.id}')">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input type="text" id="editProdName" class="form-control" value="${prod.name}" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="editProdCategory" class="form-control" required>
              <option value="Fresh Vegetables" ${prod.category === 'Fresh Vegetables' ? 'selected' : ''}>Fresh Vegetables</option>
              <option value="Fresh Fruits" ${prod.category === 'Fresh Fruits' ? 'selected' : ''}>Fresh Fruits</option>
              <option value="Dairy & Breakfast" ${prod.category === 'Dairy & Breakfast' ? 'selected' : ''}>Dairy & Breakfast</option>
              <option value="Rice & Staples" ${prod.category === 'Rice & Staples' ? 'selected' : ''}>Rice & Staples</option>
              <option value="Spices & Condiments" ${prod.category === 'Spices & Condiments' ? 'selected' : ''}>Spices & Condiments</option>
              <option value="Tea & Biscuits" ${prod.category === 'Tea & Biscuits' ? 'selected' : ''}>Tea & Biscuits</option>
              <option value="Bakery & Snacks" ${prod.category === 'Bakery & Snacks' ? 'selected' : ''}>Bakery & Snacks</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Unit / Packaging</label>
            <input type="text" id="editProdUnit" class="form-control" value="${prod.unit || '1 kg'}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Price in Rupees (Rs.) *</label>
            <input type="number" id="editProdPrice" class="form-control" value="${prod.price}" min="1" step="0.5" required>
          </div>
          <div class="form-group">
            <label class="form-label">Stock Count *</label>
            <input type="number" id="editProdCount" class="form-control" value="${prod.count}" min="0" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Customer Rating (1.0 to 5.0) *</label>
            <input type="number" id="editProdRating" class="form-control" value="${prod.rating || 4.8}" min="1.0" max="5.0" step="0.1" required>
          </div>
          <div class="form-group">
            <label class="form-label">Reviews Count</label>
            <input type="number" id="editProdReviewsCount" class="form-control" value="${prod.reviewsCount || 25}" min="1">
          </div>
        </div>

        <!-- Little Description Control -->
        <div class="form-group">
          <label class="form-label">Little Description (Short Snippet) *</label>
          <textarea id="editProdShortDesc" class="form-control" rows="2" required placeholder="A short 1-2 sentence description shown directly on the product card.">${prod.shortDesc || prod.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Product Image URL *</label>
          <input type="url" id="editProdImage" class="form-control" value="${prod.image}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Full Nutritional & Origin Description</label>
          <textarea id="editProdDesc" class="form-control" rows="3">${prod.description || ''}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
          <button type="button" onclick="closeEditProductModal()" class="btn-secondary-outline">Cancel</button>
          <button type="submit" class="btn-primary-green">Update Product</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');
}

function closeEditProductModal() {
  const modal = document.getElementById('editProductModal');
  if (modal) modal.classList.remove('active');
}

async function handleEditProductSubmit(e, productId) {
  e.preventDefault();
  const name = document.getElementById('editProdName').value.trim();
  const category = document.getElementById('editProdCategory').value;
  const price = parseFloat(document.getElementById('editProdPrice').value);
  const count = parseInt(document.getElementById('editProdCount').value, 10);
  const unit = document.getElementById('editProdUnit').value.trim();
  const rating = parseFloat(document.getElementById('editProdRating').value);
  const reviewsCount = parseInt(document.getElementById('editProdReviewsCount').value, 10);
  const shortDesc = document.getElementById('editProdShortDesc').value.trim();
  const image = document.getElementById('editProdImage').value.trim();
  const description = document.getElementById('editProdDesc').value.trim();

  const payload = {
    name,
    category,
    price,
    count,
    unit,
    rating,
    reviewsCount,
    shortDesc,
    image,
    description
  };

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Product updated successfully with new rating & description!', 'success');
      closeEditProductModal();
      loadAdminProducts();
      loadAdminStats();
    } else {
      showToast(data.message || 'Error updating product', 'error');
    }
  } catch (err) {
    showToast('Network error while updating product', 'error');
  }
}

// Preset Image Picker helper
function setPresetImage(url) {
  document.getElementById('newProdImage').value = url;
}

// ========================================================
// ORDERS MANAGEMENT
// ========================================================

// Load All Orders
async function loadAdminOrders() {
  const tableBody = document.getElementById('adminOrdersTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (data.success) {
      adminOrders = data.orders;
      renderAdminOrdersTable();
    }
  } catch (err) {
    console.error('Error loading admin orders:', err);
  }
}

function renderAdminOrdersTable() {
  const tableBody = document.getElementById('adminOrdersTableBody');
  if (!tableBody) return;

  if (adminOrders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No orders placed yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = adminOrders.map(order => {
    return `
      <tr>
        <td>
          <div style="font-weight: 800; color: #0f172a;">#${order.id}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${new Date(order.createdAt).toLocaleDateString()}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #1e293b;">${order.customer.name}</div>
          <div style="font-size: 0.78rem; color: #64748b;">${order.customer.phone || 'No phone'}</div>
          <div style="font-size: 0.75rem; color: #16a34a; font-weight: 600;">
            <i class="fa-solid fa-location-dot"></i> ${order.customer.locationLabel}
          </div>
        </td>
        <td style="max-width: 280px;">
          <!-- SHOWS WHICH ITEMS, WHAT QUANTITY/COUNT, AND UNIT PRICE -->
          ${order.items.map(it => `
            <div style="font-size: 0.8rem; margin-bottom: 3px;">
              <strong>${it.name}</strong> × <span style="background: #e2e8f0; font-weight: 800; padding: 1px 5px; border-radius: 4px;">${it.quantity}</span> 
              <span style="color: #64748b;">(@ Rs. ${it.price})</span>
            </div>
          `).join('')}
        </td>
        <td>
          <div style="font-size: 0.825rem; color: #64748b;">Subtotal: Rs. ${order.subtotal}</div>
          <div style="font-size: 0.825rem; color: ${order.shippingFee === 0 ? '#16a34a' : '#64748b'};">
            Shipping: ${order.shippingFee === 0 ? '<strong>FREE</strong>' : `Rs. ${order.shippingFee}`}
          </div>
        </td>
        <td>
          <div style="font-size: 1.15rem; font-weight: 800; color: #ea580c;">
            Rs. ${order.totalPrice}
          </div>
          <div style="font-size: 0.72rem; color: #64748b;">${order.paymentMethod}</div>
        </td>
        <td>
          <select 
            onchange="updateOrderStatus('${order.id}', this.value)"
            style="padding: 0.35rem 0.5rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; border: 1px solid #cbd5e1; background: white;"
          >
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

// Update Order Status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order #${orderId} marked as ${newStatus}`, 'success');
      loadAdminOrders();
      loadAdminStats();
    } else {
      showToast('Failed to update status', 'error');
    }
  } catch (err) {
    showToast('Network error updating status', 'error');
  }
}

// Admin Tab Switching (Overview, Products, Orders)
function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

  const activeBtn = document.getElementById(`navTab-${tabName}`);
  const activeContent = document.getElementById(`tabContent-${tabName}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.style.display = 'block';

  if (tabName === 'products') loadAdminProducts();
  if (tabName === 'orders') loadAdminOrders();
  if (tabName === 'overview') loadAdminStats();
}
