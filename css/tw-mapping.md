# CSS-to-Tailwind Mapping Reference

## HEAD BLOCK (Replace old CSS links with this in EVERY HTML file)
```html
<!-- Google Fonts: Plus Jakarta Sans & Outfit -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Font Awesome 6 Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { main: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'] },
      maxWidth: { 'custom': '1360px' },
    }
  }
}
</script>

<!-- Custom styles that can't be Tailwind (animations, pseudo-elements, JS toggles) -->
<link rel="stylesheet" href="css/tailwind-custom.css">
```

## REMOVE THESE LINES FROM HEAD:
```
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/pages.css">
```

## CSS CLASS -> TAILWIND MAPPING

### Layout
- `.container-custom` → `w-full max-w-custom mx-auto px-5`

### Header
- `.site-header` → `sticky top-0 z-[100] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]`
- `.header-top` → `py-[0.85rem] bg-white border-b border-slate-100`
- `.header-top-inner` → `flex items-center justify-between gap-6` (add `max-md:flex-wrap max-md:gap-3`)
- `.header-left-group` → `flex items-center gap-9 shrink-0 max-[1180px]:gap-5 max-md:gap-[0.65rem]`
- `.brand-logo` → `flex items-center no-underline`
- `.brand-logo-img` → `h-12 max-h-[52px] w-auto max-w-[220px] object-contain bg-transparent block scale-[1.08] origin-left transition-transform duration-[250ms] ease-out hover:scale-[1.15] max-md:h-[38px] max-md:max-w-[100px]`
- `.brand-name` → `text-[1.45rem] font-extrabold tracking-tight text-gray-900 leading-none max-md:text-xl`
- `.brand-sub` → `text-[0.72rem] font-bold tracking-[0.08em] text-orange-500 uppercase mt-px max-md:text-[0.65rem]`
- `.delivery-selector-wrap` → `relative max-lg:hidden` (keep class name for JS)
- `.delivery-box` → `flex flex-col cursor-pointer py-[0.35rem] px-[0.6rem] rounded-[6px] transition-all duration-[250ms] hover:bg-slate-50`
- `.delivery-label` → `text-xs text-slate-500 font-medium leading-none mb-1`
- `.delivery-location` → `flex items-center gap-[0.35rem] text-sm font-bold text-slate-800`
- `.delivery-dropdown` → `absolute top-[calc(100%+8px)] left-0 w-[250px] bg-white rounded-[10px] shadow-lg border border-slate-200 p-3 opacity-0 invisible translate-y-[10px] transition-all duration-[250ms] z-50` (keep class name for JS toggle)
- `.delivery-dropdown-title` → `text-xs font-bold uppercase text-slate-500 px-2 pt-1 pb-2 border-b border-slate-100`
- `.delivery-options-list` → `mt-2 max-h-[190px] overflow-y-auto`
- `.delivery-option-item` → `flex items-center justify-between py-2 px-[0.6rem] rounded-[6px] text-[0.85rem] font-medium text-slate-700 cursor-pointer transition-all duration-[250ms] hover:bg-green-100 hover:text-green-700 hover:font-semibold`

### Search
- `.header-search-wrap` → `flex-1 max-w-[440px] relative max-lg:max-w-[320px] max-md:order-3 max-md:w-full max-md:max-w-full max-md:mt-[0.65rem]`
- `.search-form` → `relative w-full`
- `.search-input` → `w-full h-11 pr-11 pl-4 text-[0.9rem] text-slate-800 bg-white border border-gray-300 rounded-[6px] outline-none transition-all duration-[250ms] placeholder:text-gray-400 focus:border-orange-500 focus:ring-[3px] focus:ring-orange-500/15`
- `.search-btn` → `absolute right-[0.35rem] top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-500 text-base rounded-[6px] transition-all duration-[250ms] hover:text-orange-500`
- `.search-suggestions` → `absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-[10px] shadow-lg p-2 hidden z-50` (keep class name for JS)
- `.suggestion-item` → `flex items-center gap-[0.6rem] py-2 px-3 text-[0.85rem] text-slate-700 rounded-[6px] cursor-pointer hover:bg-slate-50 hover:text-orange-500`

### Header Actions
- `.header-actions-group` → `flex items-center gap-7 shrink-0 max-[1180px]:gap-5 max-md:gap-[0.85rem]`
- `.action-wishlist` → `relative flex items-center justify-center text-gray-900 text-[1.35rem] p-[0.35rem] rounded-full transition-all duration-[250ms] hover:text-red-500 hover:scale-[1.08] max-md:text-xl`
- `.badge-count` → `absolute -top-1 -right-2 bg-green-500 text-white text-[0.65rem] font-bold py-[0.15rem] px-[0.35rem] min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-[0_1px_3px_rgba(34,197,94,0.4)]`
- `.action-cart-wrap` → `relative` (keep class name for JS)
- `.action-cart` → `flex items-center gap-[0.65rem] cursor-pointer py-[0.35rem] px-2 rounded-[6px] transition-all duration-[250ms] hover:bg-slate-50`
- `.cart-icon-box` → `relative text-[1.35rem] text-gray-900 flex items-center max-md:text-xl`
- `.cart-info` → `flex flex-col leading-[1.15] max-md:hidden`
- `.cart-label` → `text-xs text-slate-500 font-medium`
- `.cart-amount` → `text-sm font-extrabold text-orange-500`
- `.cart-dropdown-menu` → `absolute top-[calc(100%+12px)] right-0 w-80 bg-white rounded-[10px] shadow-lg border border-slate-200 p-4 opacity-0 invisible translate-y-[10px] transition-all duration-[250ms] z-50` (keep class name for JS)
- `.cart-item-row` → `flex items-center gap-3 pb-3 border-b border-slate-100 mb-3`
- `.cart-item-img` → `w-12 h-12 rounded-[6px] object-cover bg-gray-100`
- `.cart-item-details` → `flex-1`
- `.cart-item-name` → `text-[0.85rem] font-semibold text-slate-800 leading-[1.3]`
- `.cart-item-price` → `text-[0.8rem] text-orange-500 font-bold`
- `.cart-checkout-btn` → `block w-full text-center bg-orange-500 text-white py-[0.65rem] rounded-full text-sm font-semibold shadow-[0_10px_25px_-5px_rgba(249,115,22,0.35)] hover:bg-orange-600`

### User Profile
- `.action-user-wrap` → `relative` (keep class name for JS)
- `.action-user` → `flex items-center gap-[0.65rem] cursor-pointer py-1 px-2 rounded-full transition-all duration-[250ms] hover:bg-slate-50`
- `.user-avatar-img` → `w-9 h-9 rounded-full object-cover border-[1.5px] border-gray-200 max-md:w-8 max-md:h-8`
- `.user-name-text` → `text-sm font-bold text-gray-800 whitespace-nowrap max-lg:hidden`
- `.user-dropdown-menu` → `absolute top-[calc(100%+10px)] right-0 w-[200px] bg-white rounded-[10px] shadow-lg border border-slate-200 p-2 opacity-0 invisible translate-y-[10px] transition-all duration-[250ms] z-50` (keep class name for JS)
- `.user-dropdown-item` → `flex items-center gap-[0.65rem] py-[0.55rem] px-3 text-[0.85rem] font-medium text-slate-700 rounded-[6px] transition-all duration-[250ms] hover:bg-slate-50 hover:text-orange-500`

### Mobile Toggle
- `.mobile-toggle-btn` → `hidden text-[1.35rem] text-slate-800 p-[0.4rem] cursor-pointer max-lg:flex`

### Header Bottom Nav
- `.header-bottom` → `bg-white py-[0.45rem] border-b border-slate-200 max-lg:hidden`
- `.header-bottom-inner` → `flex items-center justify-between gap-6`
- `.bottom-left-group` → `flex items-center gap-10 max-[1180px]:gap-6`
- `.categories-dropdown-wrap` → `relative` (keep class name for JS)
- `.categories-trigger-btn` → `flex items-center gap-[0.65rem] text-[0.95rem] font-bold text-gray-900 py-2 px-[0.4rem] cursor-pointer transition-all duration-[250ms]`
- `.categories-menu` → `absolute top-[calc(100%+8px)] left-0 w-[270px] bg-white rounded-[10px] shadow-lg border border-slate-200 py-[0.6rem] opacity-0 invisible translate-y-[10px] transition-all duration-[250ms] z-[60]` (keep class name for JS)
- `.category-menu-item` → `flex items-center justify-between py-[0.65rem] px-5 text-[0.885rem] font-medium text-gray-700 transition-all duration-[250ms] hover:bg-orange-50 hover:text-orange-500 hover:pl-[1.45rem]`
- `.main-nav-list` → `flex items-center gap-8 max-[1180px]:gap-5`
- `.nav-link` → `text-[0.925rem] font-medium text-gray-700 relative py-[0.45rem] inline-block transition-all duration-[250ms] hover:text-orange-500 hover:font-semibold`
- `.bottom-right-group` → `flex items-center gap-7 max-[1180px]:gap-5`
- `.nav-phone-contact` → `flex items-center gap-[0.55rem] text-[0.95rem] font-bold text-gray-800 transition-all duration-[250ms] hover:text-orange-500`
- `.btn-gift-cards` → `inline-flex items-center justify-center gap-[0.55rem] bg-gradient-to-br from-[#ff8a3d] to-[#f36c1e] text-white text-[0.9rem] font-bold py-[0.6rem] px-[1.45rem] rounded-full shadow-[0_4px_14px_rgba(243,108,30,0.35)] transition-all duration-[250ms] whitespace-nowrap hover:from-[#f36c1e] hover:to-[#e05b10] hover:shadow-[0_6px_18px_rgba(243,108,30,0.45)] hover:-translate-y-px`

### Mobile Drawer
- `.mobile-overlay` → `fixed inset-0 bg-slate-900/55 backdrop-blur-[4px] z-[200] opacity-0 invisible transition-all duration-[250ms]` (keep class name for JS)
- `.mobile-drawer` → `fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-[210] -translate-x-full transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-y-auto shadow-lg` (keep class name for JS)
- `.mobile-drawer-header` → `flex items-center justify-between p-5 border-b border-slate-200`
- `.mobile-close-btn` → `text-xl text-slate-500 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 hover:text-slate-800`
- `.mobile-drawer-body` → `p-5 flex flex-col gap-6`
- `.mobile-user-profile` → `flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]`
- `.mobile-delivery-section` → `flex flex-col gap-1 p-3 border border-slate-200 rounded-[10px]`
- `.mobile-nav-links` → `flex flex-col gap-2`
- `.mobile-nav-item` → `flex items-center justify-between py-[0.65rem] px-2 text-[0.95rem] font-semibold text-slate-800 rounded-[6px] transition-all duration-[250ms] hover:text-orange-500 hover:bg-orange-50 hover:pl-3`
- `.mobile-categories-accordion` → `border-t border-slate-100 pt-3`
- `.mobile-categories-btn` → `flex items-center justify-between w-full py-[0.65rem] px-2 text-[0.95rem] font-bold text-slate-800`
- `.mobile-categories-list` → `hidden flex-col pl-6 gap-[0.4rem] mt-2` (keep class name for JS `.open`)
- `.mobile-cat-link` → `text-sm text-slate-500 py-[0.35rem] hover:text-orange-500`
- `.mobile-footer-actions` → `mt-auto pt-4 border-t border-slate-200 flex flex-col gap-[0.85rem]`

### Hero Section
- `.hero-fullscreen-100vh` → `min-h-[460px] max-h-[540px] relative flex items-center py-11 text-white hero-fullscreen-100vh max-md:min-h-0 max-md:max-h-none max-md:py-10 min-[992px]:min-h-[480px] min-[992px]:max-h-[530px]` (keep class name for background)
- `.hero-fullscreen-badge` → `inline-flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-400 text-[0.85rem] font-bold py-[0.35rem] px-[1.15rem] rounded-full mb-[0.85rem] backdrop-blur-[8px]`
- `.hero-fullscreen-title` → `text-[2.75rem] font-extrabold leading-[1.18] text-white mb-[0.85rem] tracking-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.3)] max-md:text-[2rem]`
- `.hero-fullscreen-subtitle` → `text-[1.05rem] text-slate-200 leading-[1.55] mb-6 max-w-[620px] [text-shadow:0_1px_4px_rgba(0,0,0,0.4)] max-md:text-[0.95rem]`
- `.hero-fullscreen-cta-group` → `flex items-center gap-[1.15rem] flex-wrap mb-7`
- `.hero-trust-bar` → `grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 border-t border-white/15 pt-5`
- `.hero-trust-item` → `flex items-center gap-3`
- `.hero-trust-icon` → `w-[38px] h-[38px] rounded-full bg-green-500/20 border border-green-400/40 text-green-400 flex items-center justify-center text-[1.05rem] shrink-0`
- `.hero-trust-title` → `font-bold text-[0.9rem] text-white`
- `.hero-trust-desc` → `text-xs text-slate-400`

### Buttons
- `.btn-primary-green` → `bg-green-500 text-white font-bold py-[0.85rem] px-[1.85rem] rounded-full shadow-[0_10px_20px_-5px_rgba(34,197,94,0.4)] transition-all duration-[250ms] hover:bg-green-600 hover:-translate-y-0.5`
- `.btn-secondary-outline` → `border-[1.5px] border-slate-200 text-slate-800 font-bold py-[0.85rem] px-[1.85rem] rounded-full bg-white transition-all duration-[250ms] hover:border-orange-500 hover:text-orange-500`
- `.btn-primary-orange` → `inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-bold text-[0.925rem] py-3 px-7 rounded-full transition-all duration-[250ms] shadow-[0_4px_12px_rgba(249,115,22,0.25)] border-none cursor-pointer no-underline hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(249,115,22,0.35)]`

### Promo Banners
- `.promo-banners-grid` → `grid grid-cols-2 gap-8 my-14 max-[900px]:grid-cols-1`
- `.promo-banner-card` → `bg-gradient-to-br from-[#f0ede6] to-[#e6e2d8] rounded-2xl py-9 px-10 flex items-center justify-between gap-6 relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-all duration-[350ms] min-h-[220px] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(0,0,0,0.08)]`
- `.promo-banner-text` → `flex-1 z-[2]`
- `.promo-banner-title` → `text-2xl font-extrabold text-slate-800 leading-[1.25] mb-[0.4rem] tracking-tight`
- `.promo-banner-subtitle` → `text-[0.95rem] text-slate-500 font-medium mb-5`
- `.promo-banner-btn` → `inline-flex items-center gap-2 bg-green-500 text-white font-bold text-[0.85rem] py-[0.55rem] px-5 rounded-full transition-all duration-[250ms] hover:bg-green-600 hover:translate-x-[3px]`
- `.promo-banner-img-wrap` → `w-[190px] h-40 flex items-center justify-center shrink-0 relative`
- `.promo-banner-img` → `max-w-full max-h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.12)] transition-transform duration-[400ms]`

### Deals Section
- `.deals-section` → `py-14 bg-gradient-to-b from-slate-50 to-white border-y border-slate-100 relative`
- `.deals-header-row` → `flex justify-between items-end mb-9 flex-wrap gap-5`
- `.deals-badge-tag` → `inline-flex items-center gap-[0.45rem] bg-red-50 border border-red-200 text-red-500 text-[0.8rem] font-extrabold uppercase tracking-[0.05em] py-[0.35rem] px-[0.95rem] rounded-full mb-2`
- `.deals-countdown-box` → `inline-flex items-center gap-3 bg-slate-900 text-white py-[0.65rem] px-[1.35rem] rounded-full text-[0.85rem] font-bold shadow-[0_4px_15px_rgba(15,23,42,0.18)]`
- `.deals-grid` → `grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-7`

### Deal Cards (dynamically generated by JS)
- `.deal-card` → `bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 relative shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_16px_30px_rgba(0,0,0,0.09)] hover:border-green-500`
- `.deal-badge-discount` → `absolute top-3 left-3 bg-gradient-to-br from-red-500 to-red-600 text-white text-[0.78rem] font-extrabold py-[0.3rem] px-3 rounded-full z-[4] shadow-[0_4px_10px_rgba(239,68,68,0.35)] inline-flex items-center gap-[0.3rem]`
- `.deal-card-img-wrap` → `relative h-[200px] bg-slate-50 overflow-hidden flex items-center justify-center`
- `.deal-card-img` → `w-full h-full object-cover transition-transform duration-[450ms]`
- `.deal-card-body` → `p-5 flex flex-col grow`
- `.deal-card-title` → `text-[1.05rem] font-bold text-slate-900 leading-[1.35] mb-[0.4rem]`
- `.deal-pricing-row` → `flex items-baseline gap-[0.65rem] mt-auto mb-3 flex-wrap`
- `.price-strikethrough` → `text-[0.92rem] text-slate-400 line-through font-semibold`
- `.deal-price-current` → `text-[1.45rem] font-extrabold text-slate-900 leading-none`
- `.deal-price-currency` → `text-[0.92rem] text-green-600 mr-0.5`
- `.deal-savings-tag` → `inline-flex items-center gap-[0.3rem] bg-green-100 text-green-800 text-xs font-extrabold py-[0.2rem] px-[0.6rem] rounded`

### View All Shop CTA
- `.view-all-shop-cta-wrap` → `mt-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl py-11 px-12 text-white relative overflow-hidden shadow-[0_12px_32px_rgba(15,23,42,0.12)]`
- `.cta-inner` → `flex items-center justify-between gap-8 relative z-[2] flex-wrap`
- `.cta-text` → `max-w-[650px]`
- `.cta-kicker` → `inline-flex items-center gap-[0.45rem] bg-green-500/20 text-green-400 text-[0.8rem] font-extrabold uppercase tracking-[0.05em] py-[0.3rem] px-[0.85rem] rounded-full mb-3`
- `.cta-title` → `text-[1.85rem] font-extrabold leading-[1.25] text-white mb-2`
- `.cta-desc` → `text-slate-300 text-[0.98rem] leading-[1.6]`
- `.btn-explore-shop` → `inline-flex items-center gap-3 bg-green-500 text-white font-bold text-[1.05rem] py-[1.1rem] px-9 rounded-full shadow-[0_6px_20px_rgba(34,197,94,0.35)] transition-all duration-300 whitespace-nowrap no-underline hover:bg-green-600 hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(34,197,94,0.45)]`

### About Section
- `.home-about-section` → `py-20 bg-white border-t border-slate-100`
- `.home-about-grid` → `grid grid-cols-[1.15fr_0.85fr] gap-16 items-center max-lg:grid-cols-1 max-lg:gap-10`
- `.section-kicker` → `inline-flex items-center gap-[0.45rem] bg-green-100 text-green-800 text-[0.8rem] font-extrabold uppercase tracking-[0.05em] py-[0.35rem] px-[0.95rem] rounded-full mb-3`
- `.home-about-title` → `text-[2.25rem] font-extrabold text-slate-900 leading-[1.25] mb-4`
- `.home-about-narrative` → `text-slate-600 text-[1.02rem] leading-[1.65] mb-8`
- `.about-highlights-list` → `flex flex-col gap-5 mb-10`
- `.about-highlight-item` → `flex items-start gap-[1.15rem]`
- `.highlight-icon` (child of .about-highlight-item) → `w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shrink-0 border border-emerald-200`
- `.highlight-title` (child of .about-highlight-item) → `text-[1.02rem] font-bold text-slate-900 mb-1`
- `.highlight-desc` (child of .about-highlight-item) → `text-[0.885rem] text-slate-500 leading-normal`
- `.home-about-cta` → `flex items-center gap-6 flex-wrap`
- `.btn-about-nav` → `py-[0.95rem] px-8 text-[0.95rem] rounded-full`
- `.btn-link-simple` → `inline-flex items-center gap-[0.45rem] text-green-600 font-bold text-[0.92rem] no-underline transition-all duration-[250ms] hover:text-green-700 hover:translate-x-1`
- `.home-about-visual-wrap` → `relative`
- `.home-about-img-box` → `relative rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.1)]`
- `.home-about-main-img` → `w-full h-[380px] object-cover block`
- `.about-badge-float` → `absolute bottom-5 left-5 bg-slate-900/[0.88] backdrop-blur-[8px] text-white py-[0.85rem] px-5 rounded-[14px] flex items-center gap-3 border border-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.25)]`
- `.about-metrics-strip` → `grid grid-cols-4 gap-3 mt-5 max-[560px]:grid-cols-2`
- `.metric-item` → `bg-slate-50 border border-slate-200 rounded-xl py-4 px-3 text-center`
- `.metric-num` → `text-2xl font-extrabold text-green-600 leading-[1.2]`
- `.metric-lbl` → `text-xs font-semibold text-slate-500 mt-[0.2rem]`

### Blog Section
- `.home-blog-section` → `py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200`
- `.home-blog-grid` → `grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8`
- `.home-blog-card` → `bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.04)] flex flex-col transition-all duration-[350ms] hover:-translate-y-1.5 hover:shadow-[0_16px_30px_rgba(0,0,0,0.08)] hover:border-green-500`
- `.home-blog-img-box` → `relative h-[210px] overflow-hidden`
- `.home-blog-img` → `w-full h-full object-cover transition-transform duration-500`
- `.blog-pill-tag` → `absolute top-3 left-3 bg-slate-900/85 backdrop-blur-[6px] text-white text-xs font-bold py-[0.3rem] px-3 rounded-full`
- `.home-blog-body` → `p-6 flex flex-col grow`
- `.home-blog-meta` → `flex items-center gap-2 text-[0.8rem] text-slate-400 font-semibold mb-[0.65rem]`
- `.home-blog-title` → `text-[1.15rem] font-extrabold leading-[1.38] text-slate-900 mb-3`
- `.home-blog-excerpt` → `text-slate-500 text-[0.9rem] leading-[1.6] mb-5 grow`
- `.home-blog-read-link` → `inline-flex items-center gap-2 text-green-600 font-bold text-[0.885rem] no-underline transition-transform duration-200 hover:translate-x-1 hover:text-green-700`

### Footer
- `.site-footer-dark` → `bg-[#121212] text-zinc-400 pt-[4.5rem] pb-8 border-t-[3px] border-green-500 font-[family-name:var(--font-main)]`
- `.footer-main-grid` → `grid grid-cols-[1.4fr_1fr_1fr_1.1fr] gap-12 mb-14 max-lg:grid-cols-2 max-lg:gap-10 max-sm:grid-cols-1 max-sm:gap-8`
- `.footer-col-title` → `text-white text-[1.15rem] font-bold relative pb-3 mb-6 tracking-tight footer-col-title` (keep class for ::after pseudo-element)
- `.footer-contact-list` → `flex flex-col gap-4 text-[0.9rem] text-zinc-300 leading-normal`
- `.footer-contact-item` → `flex items-start gap-[0.85rem]`
- `.footer-links-list` → `flex flex-col gap-3 text-[0.9rem]`
- `.footer-link-item` → `flex items-center gap-[0.65rem] text-zinc-300 transition-all duration-200 no-underline hover:text-green-500 hover:translate-x-1`
- `.chevron-arrow` → `text-zinc-500 text-[0.85rem] font-bold transition-all duration-200`
- `.footer-bottom-bar` → `border-t border-zinc-800 pt-8 flex justify-between items-center flex-wrap gap-4`

### Shipping Promo Bar
- `.shipping-promo-bar` → `bg-gradient-to-r from-green-900 to-green-800 text-white py-3 px-4 text-center text-[0.9rem] font-semibold`
- `.highlight-tag` (in shipping bar) → `bg-yellow-200 text-yellow-800 py-[0.2rem] px-[0.55rem] rounded-full text-xs font-extrabold mr-2 uppercase`

### Products Grid (pages.css)
- `.products-grid` → `grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7`

### Product Card (dynamically generated by JS)
- `.product-card` → `bg-white rounded-[10px] border border-slate-200 overflow-hidden flex flex-col transition-all duration-[250ms] relative hover:-translate-y-1 hover:shadow-lg hover:border-slate-300`
- `.product-card-img-wrap` → `relative w-full h-[200px] bg-slate-100 overflow-hidden`
- `.product-card-img` → `w-full h-full object-cover transition-transform duration-[400ms]`
- `.product-badge-stock` → `absolute top-[10px] left-[10px] text-[0.72rem] font-bold py-1 px-[0.6rem] rounded-full uppercase tracking-[0.05em] z-[2]`
- `.badge-in-stock` → `bg-green-100 text-green-800 border border-green-200`
- `.badge-out-stock` → `bg-red-100 text-red-800 border border-red-200`
- `.product-badge-cat` → `absolute top-[10px] right-[10px] text-[0.7rem] font-semibold py-1 px-[0.55rem] rounded-[6px] bg-white/90 text-slate-600 backdrop-blur-[4px] z-[2]`
- `.product-card-body` → `p-5 flex flex-col grow`
- `.product-card-title` → `text-[1.05rem] font-bold text-slate-800 leading-[1.35] mb-[0.35rem]`
- `.product-rating-box` → `flex items-center gap-[0.35rem] mb-2`
- `.stars-row` → `flex items-center gap-0.5 text-amber-500 text-[0.8rem]`
- `.rating-score` → `text-[0.8rem] font-bold text-slate-800 ml-0.5`
- `.reviews-count` → `text-xs text-slate-400`
- `.product-short-desc` → `text-[0.825rem] text-slate-500 leading-[1.45] mb-3 line-clamp-2`
- `.product-card-unit` → `text-[0.78rem] font-semibold text-green-800 bg-green-50 py-[0.15rem] px-2 rounded-[6px] inline-block mb-3 w-fit`
- `.product-card-pricing` → `flex items-baseline gap-[0.4rem] mb-4 mt-auto`
- `.price-currency` → `text-[0.95rem] font-bold text-orange-500`
- `.price-amount` → `text-[1.45rem] font-extrabold text-orange-500 tracking-tight`
- `.stock-count-text` → `text-xs text-slate-500 ml-auto`
- `.product-card-actions` → `flex items-center gap-[0.65rem] mt-2`
- `.quantity-control` → `inline-flex items-center bg-slate-50 border border-slate-200 rounded-full py-0.5 px-1`
- `.btn-qty` → `w-7 h-7 flex items-center justify-center rounded-full text-slate-800 font-bold bg-white shadow-sm transition-all duration-[250ms] border border-slate-200 hover:bg-green-500 hover:text-white hover:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed`
- `.qty-display` → `w-8 text-center text-[0.9rem] font-bold text-slate-800`
- `.btn-add-cart` → `flex-1 inline-flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-bold py-[0.6rem] px-[0.85rem] rounded-full transition-all duration-[250ms] shadow-[0_2px_8px_rgba(34,197,94,0.3)] hover:bg-green-600 hover:-translate-y-px disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none`
- `.btn-card-wishlist` → `absolute top-[10px] right-[10px] w-9 h-9 rounded-full bg-white/[0.92] border border-black/[0.08] flex items-center justify-center text-slate-500 text-base cursor-pointer z-[5] transition-all duration-200 shadow-[0_3px_8px_rgba(0,0,0,0.1)] hover:scale-[1.15] hover:text-red-500 hover:bg-white btn-card-wishlist` (keep class name for JS `.active`)

### Checkout (pages.css)
- `.checkout-grid` → `grid grid-cols-[1.6fr_1fr] gap-10 items-start max-lg:grid-cols-1`
- `.checkout-card` → `bg-white rounded-[10px] border border-slate-200 p-7 shadow-sm mb-6`
- `.checkout-card-title` → `text-xl font-extrabold text-slate-800 mb-5 flex items-center gap-[0.65rem]`
- `.form-group` → `mb-[1.15rem]`
- `.form-label` → `block text-[0.85rem] font-bold text-slate-800 mb-[0.4rem]`
- `.form-control` → `w-full py-[0.7rem] px-[0.9rem] rounded-[6px] border border-slate-200 text-[0.9rem] font-[family-name:inherit] transition-all duration-[250ms] focus:outline-none focus:border-orange-500 focus:ring-[3px] focus:ring-orange-500/15`
- `.radio-option-card` → `border-[1.5px] border-slate-200 rounded-[10px] p-4 mb-3 flex items-start gap-3 cursor-pointer transition-all duration-[250ms] hover:border-green-500 hover:bg-green-50`
- `.summary-row` → `flex justify-between items-center text-[0.9rem] text-slate-700 mb-3`
- `.summary-row.total-row` → add `text-xl font-extrabold text-slate-800 border-t-[1.5px] border-dashed border-slate-200 pt-4 mt-4`

### Cart Drawer (pages.css)
- `.cart-drawer-overlay` → `fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] z-[300] opacity-0 invisible transition-all duration-[250ms]` (keep class name for JS)
- `.cart-drawer` → `fixed top-0 right-0 bottom-0 w-[420px] max-w-[90vw] bg-white z-[310] translate-x-full transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col shadow-lg` (keep class name for JS)
- `.cart-drawer-header` → `py-5 px-6 border-b border-slate-200 flex items-center justify-between`
- `.cart-drawer-title` → `text-[1.15rem] font-extrabold text-slate-800 flex items-center gap-2`
- `.cart-drawer-body` → `py-5 px-6 flex-1 overflow-y-auto`
- `.cart-drawer-item` → `flex items-center gap-4 pb-4 mb-4 border-b border-slate-100`
- `.cart-drawer-item-img` → `w-16 h-16 rounded-[6px] object-cover bg-slate-100`
- `.cart-drawer-footer` → `p-6 border-t border-slate-200 bg-slate-50`

### Auth Modal (pages.css)
- `.auth-modal-overlay` → `fixed inset-0 bg-slate-900/65 backdrop-blur-[4px] z-[400] flex items-center justify-center p-4 opacity-0 invisible transition-all duration-[250ms]` (keep class name for JS)
- `.auth-modal-card` → `w-full max-w-[480px] bg-white rounded-2xl shadow-lg overflow-hidden translate-y-5 transition-transform duration-300 auth-modal-card` (keep class name for JS)
- `.auth-tabs` → `flex border-b border-slate-200`
- `.auth-tab-btn` → `flex-1 p-4 font-bold text-[0.95rem] text-slate-500 border-b-2 border-transparent transition-all duration-[250ms] text-center`

### Toast (pages.css)
- `.toast-container` → `fixed bottom-6 right-6 z-[9999] flex flex-col gap-[0.65rem]`
- `.toast-msg` → `bg-slate-800 text-white py-[0.85rem] px-5 rounded-[10px] shadow-lg flex items-center gap-3 text-[0.885rem] font-semibold`

### Delivery Meter (pages.css)
- `.delivery-meter-box` → `bg-green-50 border border-green-200 rounded-[10px] p-4 mb-5`
- `.meter-title` → `text-[0.85rem] font-bold text-green-900 flex items-center gap-2 mb-2`
- `.meter-progress-track` → `h-2 bg-green-100 rounded-full overflow-hidden mb-[0.4rem]`
- `.meter-progress-fill` → `h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-[width] duration-300`
- `.meter-desc` → `text-[0.78rem] text-green-800 font-semibold`

### Category Filter (pages.css)
- `.category-filter-bar` → `flex items-center gap-[0.65rem] overflow-x-auto py-2 pb-5 mb-6`
- `.category-tab-btn` → `py-[0.55rem] px-5 rounded-full text-sm font-semibold bg-white border border-slate-200 text-slate-700 whitespace-nowrap transition-all duration-[250ms] hover:bg-green-500 hover:text-white hover:border-green-500`

### Order Tracking (pages.css) - keep CSS class names for JS state management
- `.order-tracking-card` → `bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8`
- `.order-stepper` → `flex justify-between items-start relative my-10 order-stepper` (keep for ::before)
- `.stepper-step` → `relative z-[3] flex flex-col items-center text-center w-[120px] stepper-step` (keep for .completed/.active states)
- `.stepper-icon` → `w-12 h-12 rounded-full bg-slate-100 border-[3px] border-slate-300 text-slate-500 flex items-center justify-center text-[1.15rem] mb-[0.65rem] transition-all duration-300 stepper-icon`
- `.stepper-title` → `font-bold text-[0.85rem] text-slate-800 leading-[1.3]`
- `.stepper-time` → `text-[0.72rem] text-slate-400 mt-0.5`

## IMPORTANT NOTES FOR WORKERS:

1. **Keep class names that are used by JS** — Classes like `mobile-drawer`, `cart-drawer`, `auth-modal-overlay`, `search-suggestions`, `delivery-selector-wrap`, `categories-dropdown-wrap`, `action-cart-wrap`, `action-user-wrap`, `mobile-categories-list`, `btn-card-wishlist`, `footer-col-title`, `hero-fullscreen-100vh`, `scroll-reveal`, `auth-modal-card`, `order-stepper`, `stepper-step`, `stepper-icon`, etc. must be KEPT alongside Tailwind classes.

2. **Keep all `id` attributes** — They are referenced by JavaScript.

3. **Keep all `onclick` handlers and event attributes** — They are used for functionality.

4. **Existing inline `style=""` attributes** — Convert them to Tailwind classes where possible; if not expressible in Tailwind, keep the style attribute.

5. **The `.highlight-green` class** → Replace with `text-green-500`

6. **The `.highlight` class** (in hero titles) → Replace with `text-green-400` (for dark bg) or `text-green-500` (for light bg)

7. **Media query responsive classes** — Use Tailwind breakpoint prefixes: `max-sm:` (640px), `max-md:` (768px), `max-lg:` (992px), `max-[1180px]:`, `max-[900px]:`

