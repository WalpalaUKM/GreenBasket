/**
 * GreenBasket - Sri Lanka Locations, Postal Codes & Matara Shop Distance Calculator
 * Shop Base: Matara City, Sri Lanka (Coordinates: 5.9496° N, 80.5469° E, Postal Code: 81000)
 */

const MATARA_SHOP = {
  name: "GreenBasket Organic Hub - Matara",
  address: "No. 42, Main Street, Matara City, Sri Lanka",
  district: "Matara",
  city: "Matara City",
  postalCode: "81000",
  lat: 5.9496,
  lng: 80.5469,
  phone: "+94 41 222 3456",
  mobile: "+94 77 123 4567"
};

// Sri Lankan Districts and Cities with Postal Codes and approximate distance from Matara shop (km)
const SRI_LANKA_LOCATIONS = {
  "Matara": {
    postalCodeDefault: "81000",
    cities: [
      { name: "Matara City - Central (Within 1 km of Shop)", postalCode: "81000", distanceKm: 0.6, isWithin1Km: true },
      { name: "Nupe / Walgama (1 - 3 km)", postalCode: "81000", distanceKm: 2.1, isWithin1Km: false },
      { name: "Polhena / Beach Road (2 - 4 km)", postalCode: "81000", distanceKm: 3.2, isWithin1Km: false },
      { name: "Meddawatta / Rahula (2 - 5 km)", postalCode: "81000", distanceKm: 3.8, isWithin1Km: false },
      { name: "Weligama", postalCode: "81700", distanceKm: 15.2, isWithin1Km: false },
      { name: "Mirissa", postalCode: "81740", distanceKm: 11.5, isWithin1Km: false },
      { name: "Dondra (Devinuwara)", postalCode: "81150", distanceKm: 6.4, isWithin1Km: false },
      { name: "Dikwella", postalCode: "81200", distanceKm: 21.0, isWithin1Km: false },
      { name: "Kamburupitiya", postalCode: "81100", distanceKm: 17.8, isWithin1Km: false },
      { name: "Akuressa", postalCode: "81400", distanceKm: 23.5, isWithin1Km: false },
      { name: "Hakmana", postalCode: "81300", distanceKm: 25.0, isWithin1Km: false },
      { name: "Deniyaya", postalCode: "81500", distanceKm: 62.0, isWithin1Km: false }
    ]
  },
  "Galle": {
    postalCodeDefault: "80000",
    cities: [
      { name: "Galle Fort / City", postalCode: "80000", distanceKm: 44.0, isWithin1Km: false },
      { name: "Unawatuna", postalCode: "80600", distanceKm: 38.5, isWithin1Km: false },
      { name: "Koggala / Ahangama", postalCode: "80198", distanceKm: 28.0, isWithin1Km: false },
      { name: "Hikkaduwa", postalCode: "80240", distanceKm: 59.0, isWithin1Km: false },
      { name: "Ambalangoda", postalCode: "80300", distanceKm: 72.0, isWithin1Km: false },
      { name: "Elpitiya", postalCode: "80400", distanceKm: 68.0, isWithin1Km: false }
    ]
  },
  "Hambantota": {
    postalCodeDefault: "82000",
    cities: [
      { name: "Tangalle", postalCode: "82200", distanceKm: 37.0, isWithin1Km: false },
      { name: "Ranna", postalCode: "82240", distanceKm: 48.0, isWithin1Km: false },
      { name: "Ambalantota", postalCode: "82100", distanceKm: 65.0, isWithin1Km: false },
      { name: "Hambantota Town", postalCode: "82000", distanceKm: 82.0, isWithin1Km: false },
      { name: "Tissamaharama", postalCode: "82600", distanceKm: 105.0, isWithin1Km: false }
    ]
  },
  "Colombo": {
    postalCodeDefault: "00100",
    cities: [
      { name: "Colombo 01 - 03 (Fort / Kollupitiya)", postalCode: "00100", distanceKm: 156.0, isWithin1Km: false },
      { name: "Colombo 04 - 07 (Bambalapitiya / Cinnamon Gardens)", postalCode: "00400", distanceKm: 152.0, isWithin1Km: false },
      { name: "Dehiwala / Mount Lavinia", postalCode: "10350", distanceKm: 144.0, isWithin1Km: false },
      { name: "Nugegoda / Kotte", postalCode: "10250", distanceKm: 148.0, isWithin1Km: false },
      { name: "Maharagama / Kottawa", postalCode: "10280", distanceKm: 142.0, isWithin1Km: false },
      { name: "Moratuwa / Panadura", postalCode: "10400", distanceKm: 135.0, isWithin1Km: false }
    ]
  },
  "Kalutara": {
    postalCodeDefault: "12000",
    cities: [
      { name: "Kalutara Town", postalCode: "12000", distanceKm: 115.0, isWithin1Km: false },
      { name: "Beruwala", postalCode: "12070", distanceKm: 98.0, isWithin1Km: false },
      { name: "Aluthgama / Bentota", postalCode: "12080", distanceKm: 92.0, isWithin1Km: false },
      { name: "Horana", postalCode: "12400", distanceKm: 130.0, isWithin1Km: false }
    ]
  },
  "Gampaha": {
    postalCodeDefault: "11000",
    cities: [
      { name: "Gampaha City", postalCode: "11000", distanceKm: 175.0, isWithin1Km: false },
      { name: "Negombo", postalCode: "11500", distanceKm: 190.0, isWithin1Km: false },
      { name: "Kelaniya / Kiribathgoda", postalCode: "11600", distanceKm: 165.0, isWithin1Km: false }
    ]
  },
  "Kandy": {
    postalCodeDefault: "20000",
    cities: [
      { name: "Kandy City", postalCode: "20000", distanceKm: 220.0, isWithin1Km: false },
      { name: "Peradeniya", postalCode: "20400", distanceKm: 215.0, isWithin1Km: false },
      { name: "Katugastota", postalCode: "20800", distanceKm: 224.0, isWithin1Km: false }
    ]
  },
  "Ratnapura": {
    postalCodeDefault: "70000",
    cities: [
      { name: "Ratnapura City", postalCode: "70000", distanceKm: 110.0, isWithin1Km: false },
      { name: "Embilipitiya", postalCode: "70300", distanceKm: 85.0, isWithin1Km: false }
    ]
  }
};

/**
 * Haversine formula to compute distance in km between two GPS coordinates
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

/**
 * Calculate shipping cost based on Distance from Matara Shop and Subtotal
 */
function calculateSriLankaShipping(distanceKm, subtotal) {
  // RULE: Within 1 km of Matara shop, FREE shipping if subtotal is above Rs. 2,000!
  if (distanceKm <= 1.0) {
    if (subtotal >= 2000) {
      return {
        shippingFee: 0,
        isFree: true,
        zoneName: "Matara Local Express (< 1 km)",
        message: "🎉 FREE Shipping Applied! (Within 1 km of Matara Shop & Total >= Rs. 2,000)"
      };
    } else {
      const remaining = 2000 - subtotal;
      return {
        shippingFee: 60,
        isFree: false,
        zoneName: "Matara Local Express (< 1 km)",
        message: `Local Matara Delivery: Rs. 60. Add Rs. ${remaining} more to get FREE Delivery!`
      };
    }
  } else if (distanceKm <= 5.0) {
    return {
      shippingFee: 100,
      isFree: false,
      zoneName: "Matara Suburban Zone (1 - 5 km)",
      message: "Matara Suburbs Delivery (1 - 5 km): Rs. 100"
    };
  } else if (distanceKm <= 25.0) {
    return {
      shippingFee: 180,
      isFree: false,
      zoneName: "Matara District Zone (5 - 25 km)",
      message: "Matara District Delivery (Mirissa, Weligama, Dikwella): Rs. 180"
    };
  } else if (distanceKm <= 60.0) {
    return {
      shippingFee: 250,
      isFree: false,
      zoneName: "Southern Province (Galle / Tangalle)",
      message: "Southern Express Delivery (Galle, Tangalle): Rs. 250"
    };
  } else {
    return {
      shippingFee: 350,
      isFree: false,
      zoneName: "Islandwide Delivery (Colombo, Kandy, etc.)",
      message: "Islandwide Safe Courier Delivery: Rs. 350"
    };
  }
}

/**
 * Normalizes Sri Lankan phone number:
 * Accepts:
 *  - 10 digits starting with 0: "0771234567"
 *  - "+94771234567" or "+94 77 123 4567" -> normalized to "0771234567"
 *  - "94771234567" -> normalized to "0771234567"
 *  - Strips spaces, dashes, brackets
 * Returns normalized 10-digit string or clean numeric string
 */
function normalizeSriLankanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith('+94')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('94') && clean.length === 11) {
    clean = '0' + clean.slice(2);
  }
  return clean.replace(/\D/g, '');
}

/**
 * Strictly checks if phone is a valid 10-digit Sri Lankan phone number (starts with 0)
 */
function isValidSriLankanPhone(phone) {
  const normalized = normalizeSriLankanPhone(phone);
  return /^0\d{9}$/.test(normalized);
}

/**
 * Validates Card Number using Luhn Algorithm
 */
function validateLuhn(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length !== 16 && digits.length !== 15) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Validates Card Expiration Date (MM/YY)
 */
function validateCardExpiry(exp) {
  if (!exp || typeof exp !== 'string') return false;
  const match = exp.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;
  return true;
}

/**
 * Validates CVV (3 or 4 digits)
 */
function validateCardCVV(cvv) {
  if (!cvv || typeof cvv !== 'string') return false;
  const digits = cvv.replace(/\D/g, '');
  return digits.length === 3 || digits.length === 4;
}

/**
 * Detect Card Brand
 */
function detectCardBrand(number) {
  const clean = (number || '').replace(/\D/g, '');
  if (clean.startsWith('4')) return 'VISA';
  if (/^5[1-5]/.test(clean) || /^2(22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'AMEX';
  return 'Card';
}

// Export for Node.js if in commonjs environment, otherwise attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MATARA_SHOP,
    SRI_LANKA_LOCATIONS,
    calculateHaversineDistance,
    calculateSriLankaShipping,
    normalizeSriLankanPhone,
    isValidSriLankanPhone,
    validateLuhn,
    validateCardExpiry,
    validateCardCVV,
    detectCardBrand
  };
}

