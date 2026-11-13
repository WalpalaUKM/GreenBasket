/**
 * GreenBasket - Professional Fullstack Server Architecture
 * Separate Ports for Customer Frontend (Port 3000) and Admin Dashboard (Port 4000)
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 4000;

// Directories
const DATA_DIR = path.join(__dirname, "data");
const HTML_DIR = path.join(__dirname, "html");
const ADMIN_DIR = path.join(__dirname, "admin_dashbord");

const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Helper functions for shared JSON storage & Sri Lanka utilities
const {
  MATARA_SHOP,
  SRI_LANKA_LOCATIONS,
  calculateHaversineDistance,
  calculateSriLankaShipping,
  normalizeSriLankanPhone,
  isValidSriLankanPhone,
  validateLuhn,
  validateCardExpiry,
  validateCardCVV,
  detectCardBrand,
} = require("./js/sri-lanka-locations.js");

function readData(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Shipping Calculation Rule using Sri Lanka Matara Shop Base
function calculateShipping(distanceOrZone, subtotal) {
  let distanceKm = 0.8;
  if (typeof distanceOrZone === "number") {
    distanceKm = distanceOrZone;
  } else if (typeof distanceOrZone === "string") {
    if (
      distanceOrZone === "within_1km" ||
      distanceOrZone.includes("Within 1 km")
    )
      distanceKm = 0.6;
    else if (distanceOrZone === "1_to_5km") distanceKm = 3.5;
    else if (distanceOrZone === "5_to_25km") distanceKm = 15.0;
    else if (distanceOrZone === "beyond_5km") distanceKm = 40.0;
    else distanceKm = parseFloat(distanceOrZone) || 0.8;
  }
  const calc = calculateSriLankaShipping(distanceKm, subtotal);
  return {
    shippingFee: calc.shippingFee,
    isFree: calc.isFree,
    distanceKm: distanceKm,
    zoneName: calc.zoneName,
    note: calc.message,
  };
}

// Shared API Router Builder with Strict Senior Software Engineer Backend Logics & Authorization
function createApiRouter(isAdmin = false) {
  const router = express.Router();

  // Middleware: Require Admin Privileges (Restricts Admin Endpoints to Port 4000)
  const requireAdmin = (req, res, next) => {
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied: Administrative actions are strictly prohibited on the Customer Portal (Port 3000). Please authenticate on the Admin Portal (Port 4000).",
      });
    }
    next();
  };

  // GET /api/products
  router.get("/products", (req, res) => {
    const { q, category } = req.query;
    let products = readData(PRODUCTS_FILE, []);

    if (category && category !== "All") {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (q) {
      const query = q.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query)),
      );
    }

    res.json({ success: true, count: products.length, products });
  });

  // GET /api/products/:id
  router.get("/products/:id", (req, res) => {
    const products = readData(PRODUCTS_FILE, []);
    const product = products.find((p) => p.id === req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  });

  // POST /api/orders/calculate
  router.post("/orders/calculate", (req, res) => {
    const { locationZone, distanceKm, subtotal } = req.body;
    const dist =
      distanceKm !== undefined ? parseFloat(distanceKm) : locationZone;
    const result = calculateShipping(
      dist || "within_1km",
      parseFloat(subtotal) || 0,
    );
    res.json({ success: true, ...result });
  });

  // POST /api/shipping/calculate-distance (Sri Lanka GPS & District Tracker API)
  router.post("/shipping/calculate-distance", (req, res) => {
    const { lat, lng, district, city, postalCode, subtotal } = req.body;
    let distanceKm = 0.8;

    if (lat && lng) {
      distanceKm = calculateHaversineDistance(
        MATARA_SHOP.lat,
        MATARA_SHOP.lng,
        parseFloat(lat),
        parseFloat(lng),
      );
    } else if (district && SRI_LANKA_LOCATIONS[district]) {
      const cities = SRI_LANKA_LOCATIONS[district].cities;
      const match = city
        ? cities.find(
            (c) =>
              c.name.toLowerCase().includes(city.toLowerCase()) ||
              city.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]),
          )
        : cities[0];
      if (match) {
        distanceKm = match.distanceKm;
      } else if (cities.length > 0) {
        distanceKm = cities[0].distanceKm;
      }
    }

    const result = calculateShipping(distanceKm, parseFloat(subtotal) || 0);
    res.json({
      success: true,
      shop: MATARA_SHOP,
      distanceKm,
      ...result,
    });
  });

  // POST /api/orders - Place Order with Robust Backend Validation
  router.post("/orders", (req, res) => {
    const { customer, items, paymentMethod, orderNotes } = req.body;

    // 1. Validate Customer Object
    if (!customer || typeof customer !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Customer details are required." });
    }

    const custName = (customer.name || "").trim();
    if (!custName || custName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid customer name (at least 2 characters).",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const custEmail = (customer.email || "").trim().toLowerCase();
    if (!custEmail || !emailRegex.test(custEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // 2. Strict Sri Lankan Phone Number Validation (strictly 10 digits starting with 0)
    const rawPhone = customer.phone || "";
    const normalizedPhone = normalizeSriLankanPhone(rawPhone);
    if (!isValidSriLankanPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Sri Lankan phone number. Phone number must be exactly 10 digits starting with 0 (e.g., 0771234567 or 0412224589).",
      });
    }

    const custAddress = (customer.address || "").trim();
    if (!custAddress || custAddress.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a complete delivery address (at least 5 characters).",
      });
    }

    // 3. Validate Items Array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Your basket is empty. Please add items before placing an order.",
      });
    }

    const products = readData(PRODUCTS_FILE, []);
    let subtotal = 0;
    const validatedItems = [];

    for (const it of items) {
      const targetId = it.productId || it.id;
      const prod = products.find((p) => p.id === targetId);
      if (!prod) {
        return res.status(400).json({
          success: false,
          message: `Product "${it.name || targetId}" is not available in our store catalog.`,
        });
      }

      const qty = parseInt(it.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid item quantity for "${prod.name}". Quantity must be a positive integer.`,
        });
      }

      if (!prod.inStock || prod.count < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Only ${prod.count} items left in stock.`,
        });
      }

      // Safe price calculation using verified database price (prevents client price tampering)
      const itemTotal = prod.price * qty;
      subtotal += itemTotal;

      // Deduct inventory atomically
      prod.count -= qty;
      if (prod.count <= 0) {
        prod.count = 0;
        prod.inStock = false;
      }

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: qty,
        itemTotal,
        image: prod.image,
        unit: prod.unit,
      });
    }

    // 4. Server-Side Accurate Shipping Calculation
    const custDistance =
      customer.distanceKm !== undefined
        ? parseFloat(customer.distanceKm)
        : customer.locationZone || "within_1km";
    const shippingInfo = calculateShipping(custDistance, subtotal);
    const totalPrice = subtotal + shippingInfo.shippingFee;
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    // 5. Build Comprehensive Order Object with Timeline
    const newOrder = {
      id: orderId,
      createdAt: nowIso,
      customer: {
        id: customer.id || "guest",
        name: custName,
        email: custEmail,
        phone: normalizedPhone,
        district: customer.district || "Matara",
        city: customer.city || "Matara City",
        postalCode: customer.postalCode || "81000",
        address: custAddress,
        distanceKm: shippingInfo.distanceKm,
        locationZone: shippingInfo.zoneName,
        locationLabel:
          customer.locationLabel ||
          `${customer.city || "Matara City"}, ${customer.district || "Matara"} (${customer.postalCode || "81000"}) - ${shippingInfo.distanceKm} km from Matara Shop`,
      },
      items: validatedItems,
      subtotal,
      shippingFee: shippingInfo.shippingFee,
      shippingDiscountNote: shippingInfo.note,
      totalPrice,
      paymentMethod: paymentMethod || "Cash on Delivery",
      orderNotes: (orderNotes || "").trim(),
      status: "Pending",
      timeline: [
        {
          stage: 1,
          status: "Pending",
          label: "Order Placed",
          time: nowIso,
          completed: true,
          active: true,
        },
        {
          stage: 2,
          status: "Quality Checked",
          label: "Quality Checked",
          time: null,
          completed: false,
          active: false,
        },
        {
          stage: 3,
          status: "Chilled Packed",
          label: "Chilled Packed",
          time: null,
          completed: false,
          active: false,
        },
        {
          stage: 4,
          status: "Out for Delivery",
          label: "Out for Delivery",
          time: null,
          completed: false,
          active: false,
        },
        {
          stage: 5,
          status: "Delivered",
          label: "Delivered",
          time: null,
          completed: false,
          active: false,
        },
      ],
    };

    const orders = readData(ORDERS_FILE, []);
    orders.unshift(newOrder);

    // Save atomicity
    const ordersSaved = writeData(ORDERS_FILE, orders);
    const productsSaved = writeData(PRODUCTS_FILE, products);

    if (!ordersSaved || !productsSaved) {
      return res.status(500).json({
        success: false,
        message: "Database write error. Order could not be recorded.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  });

  // GET /api/orders
  router.get("/orders", (req, res) => {
    const { email, orderId } = req.query;
    let orders = readData(ORDERS_FILE, []);

    if (orderId) {
      const qId = String(orderId).trim().toUpperCase();
      orders = orders.filter((o) => o.id && o.id.toUpperCase() === qId);
    } else if (email) {
      const qEmail = String(email).trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.customer &&
          o.customer.email &&
          o.customer.email.toLowerCase() === qEmail,
      );
    }

    res.json({ success: true, count: orders.length, orders });
  });

  // GET /api/orders/track/:id - Direct single order live tracking
  router.get("/orders/track/:id", (req, res) => {
    const orders = readData(ORDERS_FILE, []);
    const searchId = String(req.params.id).trim().toUpperCase();
    const order = orders.find((o) => o.id && o.id.toUpperCase() === searchId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${req.params.id}" not found. Please check your Order ID.`,
      });
    }
    res.json({ success: true, order });
  });

  // GET /api/orders/:id
  router.get("/orders/:id", (req, res) => {
    const orders = readData(ORDERS_FILE, []);
    const searchId = String(req.params.id).trim().toUpperCase();
    const order = orders.find((o) => o.id && o.id.toUpperCase() === searchId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${req.params.id}" not found.`,
      });
    }
    res.json({ success: true, order });
  });

  // POST /api/auth/register with Strict Validations
  router.post("/auth/register", (req, res) => {
    const {
      name,
      email,
      password,
      phone,
      district,
      city,
      postalCode,
      address,
      distanceKm,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Strict 10-digit Sri Lankan phone number validation
    const rawPhone = phone || "";
    const normalizedPhone = normalizeSriLankanPhone(rawPhone);
    if (!isValidSriLankanPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Sri Lankan phone number. Must be exactly 10 digits starting with 0 (e.g. 0771234567 or 0412224589).",
      });
    }

    const users = readData(USERS_FILE, []);
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const dist =
      distanceKm !== undefined
        ? parseFloat(distanceKm)
        : city && city.includes("Within 1 km")
          ? 0.6
          : 3.5;

    const newUser = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: cleanEmail,
      password: password.trim(),
      role: "customer",
      phone: normalizedPhone,
      district: district || "Matara",
      city: city || "Matara City - Central (Within 1 km of Shop)",
      postalCode: postalCode || "81000",
      address: (address || "").trim(),
      distanceKm: dist,
      locationLabel: `${city || "Matara City"}, ${district || "Matara"} (${postalCode || "81000"}) - ${dist} km from Matara Shop`,
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    // Never return raw password to client
    const { password: pw, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: safeUser,
    });
  });

  // POST /api/auth/login
  router.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPw = password.trim();

    const users = readData(USERS_FILE, []);
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || user.password !== cleanPw) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const { password: pw, ...safeUser } = user;
    res.json({ success: true, message: "Login successful!", user: safeUser });
  });

  // ==========================================
  // ADMIN-ONLY REST ENDPOINTS (Protected with requireAdmin)
  // ==========================================

  // POST /api/products - Admin adds product
  router.post("/products", requireAdmin, (req, res) => {
    const {
      name,
      category,
      price,
      count,
      image,
      unit,
      rating,
      reviewsCount,
      shortDesc,
      description,
      badge,
    } = req.body;
    if (!name || price === undefined || count === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and count are required.",
      });
    }

    const numPrice = parseFloat(price);
    const numCount = parseInt(count, 10);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number.",
      });
    }
    if (isNaN(numCount) || numCount < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock count must be a non-negative integer.",
      });
    }

    const products = readData(PRODUCTS_FILE, []);
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category: category || "General",
      price: numPrice,
      count: numCount,
      inStock: numCount > 0,
      rating: parseFloat(rating) || 4.8,
      reviewsCount:
        parseInt(reviewsCount, 10) || Math.floor(12 + Math.random() * 40),
      unit: unit || "1 unit",
      badge: badge || "Organic",
      shortDesc:
        shortDesc || "100% certified organic produce from local partner farms.",
      description:
        description ||
        "Freshly harvested organic product packed with natural nutrients and zero chemicals.",
      image:
        image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80",
    };

    products.unshift(newProduct);
    writeData(PRODUCTS_FILE, products);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  });

  // PUT /api/products/:id - Admin updates product
  router.put("/products/:id", requireAdmin, (req, res) => {
    const products = readData(PRODUCTS_FILE, []);
    const idx = products.findIndex((p) => p.id === req.params.id);

    if (idx === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const {
      name,
      category,
      price,
      count,
      inStock,
      rating,
      reviewsCount,
      shortDesc,
      description,
      unit,
      image,
      badge,
    } = req.body;
    const current = products[idx];

    let updatedPrice = current.price;
    if (price !== undefined) {
      const p = parseFloat(price);
      if (!isNaN(p) && p > 0) updatedPrice = p;
    }

    let updatedCount = current.count;
    if (count !== undefined) {
      const c = parseInt(count, 10);
      if (!isNaN(c) && c >= 0) updatedCount = c;
    }

    const updatedInStock =
      inStock !== undefined ? Boolean(inStock) : updatedCount > 0;

    products[idx] = {
      ...current,
      name: name ? name.trim() : current.name,
      category: category || current.category,
      price: updatedPrice,
      count: updatedCount,
      inStock: updatedInStock,
      rating: rating !== undefined ? parseFloat(rating) : current.rating || 4.8,
      reviewsCount:
        reviewsCount !== undefined
          ? parseInt(reviewsCount, 10)
          : current.reviewsCount || 25,
      shortDesc: shortDesc !== undefined ? shortDesc : current.shortDesc,
      description:
        description !== undefined ? description : current.description,
      unit: unit || current.unit,
      badge: badge || current.badge,
      image: image || current.image,
    };

    writeData(PRODUCTS_FILE, products);
    res.json({
      success: true,
      message: "Product updated successfully",
      product: products[idx],
    });
  });

  // PATCH /api/products/:id/toggle-stock - 1-Click Out-of-Stock Toggle
  router.patch("/products/:id/toggle-stock", requireAdmin, (req, res) => {
    const products = readData(PRODUCTS_FILE, []);
    const product = products.find((p) => p.id === req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    product.inStock = !product.inStock;
    if (product.inStock && product.count <= 0) {
      product.count = 10;
    }

    writeData(PRODUCTS_FILE, products);
    res.json({
      success: true,
      message: `Product is now marked as ${product.inStock ? "IN STOCK" : "OUT OF STOCK"}`,
      product,
    });
  });

  // DELETE /api/products/:id
  router.delete("/products/:id", requireAdmin, (req, res) => {
    let products = readData(PRODUCTS_FILE, []);
    const lenBefore = products.length;
    products = products.filter((p) => p.id !== req.params.id);

    if (products.length === lenBefore) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    writeData(PRODUCTS_FILE, products);
    res.json({ success: true, message: "Product deleted successfully" });
  });

  // PATCH /api/orders/:id/status with Allowed Status Enforcement & Stock Restoration
  router.patch("/orders/:id/status", requireAdmin, (req, res) => {
    const { status } = req.body;
    const VALID_STATUSES = [
      "Pending",
      "Quality Checked",
      "Chilled Packed",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed statuses are: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const orders = readData(ORDERS_FILE, []);
    const order = orders.find((o) => o.id === req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const prevStatus = order.status;

    // Senior SE Logic: If an active order is cancelled, restore its deducted inventory back to products!
    if (status === "Cancelled" && prevStatus !== "Cancelled") {
      const products = readData(PRODUCTS_FILE, []);
      for (const it of order.items) {
        const prod = products.find((p) => p.id === it.productId);
        if (prod) {
          prod.count += it.quantity;
          if (prod.count > 0) prod.inStock = true;
        }
      }
      writeData(PRODUCTS_FILE, products);
    }

    order.status = status;
    const nowIso = new Date().toISOString();

    // Update or populate audit timeline
    const stages = [
      "Pending",
      "Quality Checked",
      "Chilled Packed",
      "Out for Delivery",
      "Delivered",
    ];
    const currentStageIndex = stages.indexOf(status);

    if (!order.timeline || !Array.isArray(order.timeline)) {
      order.timeline = stages.map((s, idx) => ({
        stage: idx + 1,
        status: s,
        label: s === "Pending" ? "Order Placed" : s,
        time: idx <= currentStageIndex ? nowIso : null,
        completed: idx <= currentStageIndex,
        active: idx === currentStageIndex,
      }));
    } else {
      order.timeline = order.timeline.map((step, idx) => {
        const stepStageIndex = stages.indexOf(step.status);
        const isCompleted = stepStageIndex <= currentStageIndex;
        return {
          ...step,
          time: isCompleted ? step.time || nowIso : null,
          completed: isCompleted,
          active: stepStageIndex === currentStageIndex,
        };
      });
    }

    writeData(ORDERS_FILE, orders);
    res.json({
      success: true,
      message: `Order #${order.id} status updated to ${status}`,
      order,
    });
  });

  // GET /api/admin/stats
  router.get("/admin/stats", requireAdmin, (req, res) => {
    const products = readData(PRODUCTS_FILE, []);
    const orders = readData(ORDERS_FILE, []);
    const users = readData(USERS_FILE, []);

    const totalSales = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const outOfStockCount = products.filter(
      (p) => !p.inStock || p.count <= 0,
    ).length;
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;

    res.json({
      success: true,
      stats: {
        totalProducts: products.length,
        outOfStockCount,
        totalOrders: orders.length,
        pendingOrders,
        totalCustomers: users.filter((u) => u.role !== "admin").length,
        totalSales: Math.round(totalSales),
      },
      recentOrders: orders.slice(0, 6),
    });
  });

  return router;
}

// ========================================================
// 1. FRONTEND APP (Port 3000) - For Customers Only
// ========================================================
const frontendApp = express();

frontendApp.use(cors());
frontendApp.use(express.json());
frontendApp.use(express.urlencoded({ extended: true }));

// Static Assets
frontendApp.use("/css", express.static(path.join(__dirname, "css")));
frontendApp.use("/js", express.static(path.join(__dirname, "js")));
frontendApp.use("/ass", express.static(path.join(__dirname, "ass")));
frontendApp.use("/logo.jpg", express.static(path.join(__dirname, "logo.jpg")));
frontendApp.use("/logo.png", express.static(path.join(__dirname, "logo.png")));

// Sub-path aliases for /html
frontendApp.use("/html/css", express.static(path.join(__dirname, "css")));
frontendApp.use("/html/js", express.static(path.join(__dirname, "js")));
frontendApp.use("/html/ass", express.static(path.join(__dirname, "ass")));
frontendApp.use(
  "/html/logo.jpg",
  express.static(path.join(__dirname, "logo.jpg")),
);
frontendApp.use(
  "/html/logo.png",
  express.static(path.join(__dirname, "logo.png")),
);

// Serve Customer HTML files directly from /html folder or root
frontendApp.use(express.static(HTML_DIR));
frontendApp.use("/html", express.static(HTML_DIR));

// Aliases for blog/blogs
frontendApp.get("/blog.html", (req, res) => {
  res.sendFile(path.join(HTML_DIR, "blogs.html"));
});
frontendApp.get("/blogs.html", (req, res) => {
  res.sendFile(path.join(HTML_DIR, "blogs.html"));
});

// Also fallback to root for any direct requests
frontendApp.get("/", (req, res) => {
  res.sendFile(path.join(HTML_DIR, "index.html"));
});

// Attach API Router
frontendApp.use("/api", createApiRouter(false));

frontendApp.listen(FRONTEND_PORT, () => {
  console.log(
    `================================================================`,
  );
  console.log(` 🛒 FRONTEND STORE (Customer Portal) running on:`);
  console.log(`    👉 http://localhost:${FRONTEND_PORT}`);
  console.log(`    (HTML folder: d:/GreenBasket/html)`);
  console.log(
    `================================================================`,
  );
});

// ========================================================
// 2. ADMIN PANEL APP (Port 4000) - Dedicated Admin Portal
// ========================================================
const adminApp = express();

adminApp.use(cors());
adminApp.use(express.json());
adminApp.use(express.urlencoded({ extended: true }));

// Static Assets for Admin
adminApp.use("/css", express.static(path.join(__dirname, "css")));
adminApp.use("/js", express.static(path.join(__dirname, "js")));
adminApp.use("/ass", express.static(path.join(__dirname, "ass")));
adminApp.use("/logo.jpg", express.static(path.join(__dirname, "logo.jpg")));
adminApp.use("/logo.png", express.static(path.join(__dirname, "logo.png")));

// Sub-path aliases for /admin_dashbord
adminApp.use(
  "/admin_dashbord/css",
  express.static(path.join(__dirname, "css")),
);
adminApp.use("/admin_dashbord/js", express.static(path.join(__dirname, "js")));
adminApp.use(
  "/admin_dashbord/ass",
  express.static(path.join(__dirname, "ass")),
);
adminApp.use(
  "/admin_dashbord/logo.jpg",
  express.static(path.join(__dirname, "logo.jpg")),
);
adminApp.use(
  "/admin_dashbord/logo.png",
  express.static(path.join(__dirname, "logo.png")),
);

// Serve admin_dashbord folder
adminApp.use(express.static(ADMIN_DIR));
adminApp.use("/admin_dashbord", express.static(ADMIN_DIR));

// Admin Root routes to admin_dashbord
adminApp.get("/", (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, "index.html"));
});

adminApp.get("/admin_dashbord", (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, "index.html"));
});

// Attach Admin API Router
adminApp.use("/api", createApiRouter(true));

adminApp.listen(ADMIN_PORT, () => {
  console.log(
    `================================================================`,
  );
  console.log(` ⚙️  ADMIN PANEL PORTAL (Management) running on:`);
  console.log(`    👉 http://localhost:${ADMIN_PORT}/admin_dashbord`);
  console.log(`    (Admin folder: d:/GreenBasket/admin_dashbord)`);
  console.log(
    `================================================================`,
  );
});
