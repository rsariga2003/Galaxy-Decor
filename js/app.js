function resolveCategoryImage(c) {
  const genericFallback = "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80";
  
  // FORCE OVERRIDE for Tea Poys if the user has a broken image saved in local storage
  if (c && c.name && (c.name.toLowerCase() === "tea poys" || c.name.toLowerCase() === "teapoys")) {
      return genericFallback;
  }
  
  if (!c.image || c.image.startsWith("placeholder_")) {
    const fallbacks = {
      "living-room": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
      "bedroom": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      "office": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
      "dining": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80",
      "gift-items": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      "showpieces": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80",
      "fountains": "https://images.unsplash.com/photo-1588694926280-3ae414d06ccb?auto=format&fit=crop&w=600&q=80",
      "vases": "https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&w=600&q=80",
      "decor-accessories": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      "home-furniture": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
      "commercial-furniture": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
    };
    return fallbacks[c.id] || genericFallback;
  }
  return c.image.startsWith('http') || c.image.startsWith('data:') ? c.image : '/assets/products/' + c.image;
}

window.setupPhoneField = function(inputEl) {
  if (!inputEl) return;
  
  inputEl.addEventListener("input", function() {
    let val = this.value.replace(/[^0-9+\-\s]/g, ""); // Keep digits, plus, hyphens, spaces
    let digitsOnly = val.replace(/[^0-9]/g, "");
    
    if (val.startsWith("+")) {
      // Foreign number: limit to 15 digits
      if (digitsOnly.length > 15) {
        let count = 0;
        let truncated = "";
        for (let char of val) {
          if (/[0-9]/.test(char)) {
            count++;
            if (count > 15) continue;
          }
          truncated += char;
        }
        val = truncated;
      }
    } else {
      // Local Indian number: limit to 10 digits
      if (digitsOnly.length > 10) {
        let count = 0;
        let truncated = "";
        for (let char of val) {
          if (/[0-9]/.test(char)) {
            count++;
            if (count > 10) continue;
          }
          truncated += char;
        }
        val = truncated;
      }
    }
    this.value = val;
  });

  inputEl.addEventListener("blur", function() {
    let val = this.value.trim();
    if (!val) return;
    
    let digits = val.replace(/[^0-9]/g, "");
    if (val.startsWith("+")) {
      if (digits.length < 7) {
        window.GalaxyUtils.showToast("Foreign phone number must have at least 7 digits.", "warning");
      }
    } else {
      if (digits.length < 10) {
        window.GalaxyUtils.showToast("Local phone number must be exactly 10 digits.", "warning");
      }
    }
  });
};

class ECommerceApp {
  constructor() {
    window.GalaxyAppInstance = this;
    // 1. Initialize State from LocalStorage or fallbacks
    this.cart = JSON.parse(localStorage.getItem("gd_cart")) || [];
    this.wishlist = JSON.parse(localStorage.getItem("gd_wishlist")) || [];
    
    // Check if synced catalog is loaded, otherwise use fallback data from data.js
    let parsedProducts = null;
    try { parsedProducts = JSON.parse(localStorage.getItem("gd_products")); } catch (e) {}
    this.products = Array.isArray(parsedProducts) ? parsedProducts : window.GALAXY_DECOR_DB.products;

    // Force upgrade categories using a version flag to clear any old cached/broken category image URLs
    const CAT_VERSION = "v6";
    if (localStorage.getItem("gd_categories_ver") !== CAT_VERSION) {
      localStorage.removeItem("gd_categories");
      localStorage.setItem("gd_categories_ver", CAT_VERSION);
    }
    
    let parsedCategories = null;
    try { parsedCategories = JSON.parse(localStorage.getItem("gd_categories")); } catch (e) {}
    this.categories = Array.isArray(parsedCategories) ? parsedCategories : window.GALAXY_DECOR_DB.categories;

    this.interiorSolutions = window.GALAXY_DECOR_DB.interiorSolutions;

    let parsedReviews = null;
    try { parsedReviews = JSON.parse(localStorage.getItem("gd_reviews")); } catch (e) {}
    this.reviews = Array.isArray(parsedReviews) ? parsedReviews : window.GALAXY_DECOR_DB.reviews;

    // Check if settings are saved in localStorage for admin management
    if (!localStorage.getItem("gd_store")) {
      localStorage.setItem("gd_store", JSON.stringify(window.GALAXY_DECOR_DB.store));
    }
    this.updateStoreConfig();

    // Active review slide index
    this.currentReviewIndex = 0;
    this.reviewInterval = null;

    // Cache elements
    this.appRoot = document.getElementById("app-root");
    this.cartBadge = document.getElementById("cart-badge");
    this.wishlistBadge = document.getElementById("wishlist-badge");
    
    this.mobileCartCount = document.getElementById("mobile-cart-count");
    this.mobileWishlistCount = document.getElementById("mobile-wishlist-count");

    // Global helper for smooth navigation to Contact section (prevents dead clicks if already on hash)
    window.navigateToContact = () => {
      const contactSec = document.querySelector(".showroom-details");
      if (window.location.pathname === "/contact") {
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        window.GalaxyRouter.navigate("/contact");
      }
    };

    // Initialize UI handlers
    this.initGlobalEvents();
    this.updateBadges();

    // Register SPA Routes with GalaxyRouter
    this.registerRoutes();
  }

  updateStoreConfig() {
    let storedConfig = null;
    try { storedConfig = JSON.parse(localStorage.getItem("gd_store")); } catch (e) {}
    this.store = (storedConfig && typeof storedConfig === 'object' && !storedConfig.error)
      ? storedConfig
      : (window.GALAXY_DECOR_DB ? window.GALAXY_DECOR_DB.store : {});

    if (!this.store) return;

    const phone = this.store.phone || "8608738393";
    const email = this.store.email || "galaxydecorind@gmail.com";
    const address = this.store.address || "4/642, Post Office Building, Sakthi Nagar, Opp. Viswanathan Hospital, Vijayamangalam, Perundurai, Erode - 638056, Tamil Nadu";
    const hours = this.store.hours || "Mon - Sun: 9:30 AM - 8:30 PM";

    // 1. Top Announcement Bar
    const topPhone = document.getElementById("topbar-phone");
    const topPhoneLink = document.getElementById("topbar-phone-link");
    const topLoc = document.getElementById("topbar-location");

    if (topPhone) topPhone.textContent = phone;
    if (topPhoneLink) topPhoneLink.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    if (topLoc) {
      const parts = address.split(",");
      const shortLoc = parts.length >= 3 ? `${parts[1].trim()}, ${parts[2].trim()}` : address;
      topLoc.textContent = shortLoc;
    }

    // 2. Footer Section
    const footAddress = document.getElementById("footer-address");
    const footPhone = document.getElementById("footer-phone");
    const footPhoneLink = document.getElementById("footer-phone-link");
    const footEmail = document.getElementById("footer-email");
    const footEmailLink = document.getElementById("footer-email-link");
    const footHours = document.getElementById("footer-hours");

    if (footAddress) footAddress.textContent = address;
    if (footPhone) footPhone.textContent = phone;
    if (footPhoneLink) footPhoneLink.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    if (footEmail) footEmail.textContent = email;
    if (footEmailLink) footEmailLink.href = `mailto:${email}`;
    if (footHours) footHours.textContent = hours;
  }

  // --- State Updates & Badges ---
  updateBadges() {
    let totalQty = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartBadge.textContent = totalQty;
    if (this.mobileCartCount) this.mobileCartCount.textContent = totalQty;

    let wishlistCount = this.wishlist.length;
    this.wishlistBadge.textContent = wishlistCount;
    if (this.mobileWishlistCount) this.mobileWishlistCount.textContent = wishlistCount;

    // Update Drawer if open
    this.renderCartDrawerItems();
  }

  saveCart() {
    localStorage.setItem("gd_cart", JSON.stringify(this.cart));
    this.updateBadges();
  }

  saveWishlist() {
    localStorage.setItem("gd_wishlist", JSON.stringify(this.wishlist));
    this.updateBadges();
  }

  // --- Cart & Wishlist Operations ---
  addToCart(productId, quantity = 1, showFeedback = true) {
    let product = this.products.find(p => p.id === productId);
    if (!product) return;

    let existingItem = this.cart.find(item => item.product.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }

    this.saveCart();
    if (showFeedback) {
      window.GalaxyUtils.showToast(`"${product.name}" added to shopping bag.`);
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
    this.saveCart();
    window.GalaxyUtils.showToast("Item removed from bag.", "info");
  }

  updateCartQuantity(productId, newQty) {
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    let item = this.cart.find(item => item.product.id === productId);
    if (item) {
      item.quantity = newQty;
      this.saveCart();
    }
  }

  toggleWishlist(productId) {
    let index = this.wishlist.indexOf(productId);
    let product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (index === -1) {
      this.wishlist.push(productId);
      window.GalaxyUtils.showToast(`"${product.name}" added to Wishlist.`);
    } else {
      this.wishlist.splice(index, 1);
      window.GalaxyUtils.showToast("Item removed from Wishlist.", "info");
    }
    this.saveWishlist();
    this.updateBadges();
    
    // Rerender active page if it is wishlist or catalog to keep heart states updated
    let currentHash = window.location.pathname;
    if (currentHash.startsWith("/wishlist")) {
      this.renderWishlistPage();
    }
  }

  // --- Global Event Bindings (Header navigation drawer, Cart sidebar, Search dropdown) ---
  initGlobalEvents() {
    // Mobile Sidebar Toggles
    const burgerBtn = document.getElementById("mobile-menu-toggle");
    const closeSidebarBtn = document.getElementById("close-sidebar-btn");
    const sidebarOverlay = document.getElementById("mobile-sidebar-overlay");
    const sidebar = document.getElementById("mobile-sidebar");

    burgerBtn.addEventListener("click", () => this.openMobileSidebar());
    closeSidebarBtn.addEventListener("click", () => this.closeMobileSidebar());
    sidebarOverlay.addEventListener("click", () => this.closeMobileSidebar());

    // Cart Drawer Toggles
    const cartBtn = document.getElementById("cart-drawer-toggle");
    const closeDrawerBtn = document.getElementById("close-drawer-btn");
    const drawerOverlay = document.getElementById("cart-drawer-overlay");
    const drawer = document.getElementById("cart-drawer");

    cartBtn.addEventListener("click", () => this.openCartDrawer());
    closeDrawerBtn.addEventListener("click", () => this.closeCartDrawer());
    drawerOverlay.addEventListener("click", () => this.closeCartDrawer());

    // Search Dropdown Toggles
    const searchToggleBtn = document.getElementById("search-toggle-btn");
    const closeSearchBtn = document.getElementById("close-search-btn");
    const searchDropdown = document.getElementById("search-dropdown");

    searchToggleBtn.addEventListener("click", () => this.toggleSearchDropdown());
    closeSearchBtn.addEventListener("click", () => this.closeSearchDropdown());

    // Quick View Modal Close
    const closeQuickviewBtn = document.getElementById("close-quickview-btn");
    const quickviewModal = document.getElementById("quickview-modal");
    if (closeQuickviewBtn) {
      closeQuickviewBtn.addEventListener("click", () => {
        quickviewModal.classList.add("hidden");
      });
    }
    if (quickviewModal) {
      quickviewModal.addEventListener("click", (e) => {
        if (e.target === quickviewModal) {
          quickviewModal.classList.add("hidden");
        }
      });
    }

    // Global ripple initialization
    window.GalaxyUtils.initButtonRipples();

    // Global Search Auto-Complete Event
    const searchInput = document.getElementById("global-search-input");
    const searchResultsPreview = document.getElementById("search-results-preview");

    searchInput.addEventListener("input", (e) => {
      let query = e.target.value.toLowerCase().trim();
      if (query.length < 2) {
        searchResultsPreview.classList.add("hidden");
        return;
      }

      let matches = this.products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.shortDesc.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      ).slice(0, 5); // Limit 5

      if (matches.length > 0) {
        searchResultsPreview.innerHTML = matches.map(p => `
          <div class="search-preview-item" data-id="${p.id}">
            ${this.renderProductImageHTML(p, "search-preview-img")}
            <div class="search-preview-info">
              <div class="search-preview-title">${p.name}</div>
              <div class="search-preview-cat">${this.getCategoryName(p.category)}</div>
            </div>
            <div class="search-preview-price">${window.GalaxyUtils.formatCurrency(p.offerPrice || p.price)}</div>
          </div>
        `).join("");
        searchResultsPreview.classList.remove("hidden");
      } else {
        searchResultsPreview.innerHTML = `<div class="search-no-results">No luxury pieces match "${query}"</div>`;
        searchResultsPreview.classList.remove("hidden");
      }
    });

    // Handle clicks inside search preview results
    searchResultsPreview.addEventListener("click", (e) => {
      let item = e.target.closest(".search-preview-item");
      if (item) {
        let id = item.getAttribute("data-id");
        window.GalaxyRouter.navigate(`/product/${id}`);
        this.closeSearchDropdown();
        searchInput.value = "";
        searchResultsPreview.classList.add("hidden");
      }
    });

    // Handle form submit (Routes to Shop with search filter)
    const searchForm = document.getElementById("global-search-form");
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let query = searchInput.value.trim();
      if (query) {
        window.GalaxyRouter.navigate(`/products?search=${encodeURIComponent(query)}`);
        this.closeSearchDropdown();
        searchInput.value = "";
        searchResultsPreview.classList.add("hidden");
      }
    });
  }

  // --- Sidebar/Drawer State Modifiers ---
  openMobileSidebar() {
    document.getElementById("mobile-sidebar").classList.add("active");
    document.getElementById("mobile-sidebar-overlay").classList.add("active");
  }
  closeMobileSidebar() {
    document.getElementById("mobile-sidebar").classList.remove("active");
    document.getElementById("mobile-sidebar-overlay").classList.remove("active");
  }
  openCartDrawer() {
    document.getElementById("cart-drawer").classList.add("active");
    document.getElementById("cart-drawer-overlay").classList.add("active");
    this.renderCartDrawerItems();
  }
  closeCartDrawer() {
    document.getElementById("cart-drawer").classList.remove("active");
    document.getElementById("cart-drawer-overlay").classList.remove("active");
  }
  toggleSearchDropdown() {
    const el = document.getElementById("search-dropdown");
    el.classList.toggle("hidden");
    if (!el.classList.contains("hidden")) {
      document.getElementById("global-search-input").focus();
    }
  }
  closeSearchDropdown() {
    document.getElementById("search-dropdown").classList.add("hidden");
  }
  closeQuickView() {
    const quickviewModal = document.getElementById("quickview-modal");
    if (quickviewModal) {
      quickviewModal.classList.add("hidden");
    }
  }

  // Render items inside Sidebar Cart Drawer
  renderCartDrawerItems() {
    const listContainer = document.getElementById("cart-drawer-items");
    const footerContainer = document.getElementById("cart-drawer-footer");
    
    if (!listContainer) return;

    if (this.cart.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-cart-message">
          <i data-lucide="shopping-bag" class="empty-icon"></i>
          <p>Your shopping bag is empty.</p>
          <a href="/products" class="btn btn-gold btn-sm">Explore Collection</a>
        </div>
      `;
      footerContainer.classList.add("hidden");
      lucide.createIcons();
      return;
    }

    listContainer.innerHTML = this.cart.map(item => {
      let p = item.product;
      return `
        <div class="drawer-item" data-id="${p.id}">
          ${this.renderProductImageHTML(p, "drawer-item-img")}
          <div class="drawer-item-details">
            <h3 class="drawer-item-title">${p.name}</h3>
            <div class="drawer-item-cat">${this.getCategoryName(p.category)}</div>
            <div class="drawer-item-price-wrapper">
              <span class="drawer-item-price">${window.GalaxyUtils.formatCurrency(p.offerPrice || p.price)}</span>
            </div>
            <div class="drawer-item-qty-selector">
              <button class="qty-btn btn-minus" aria-label="Decrease Qty"><i data-lucide="minus" style="width:10px;height:10px;"></i></button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn btn-plus" aria-label="Increase Qty"><i data-lucide="plus" style="width:10px;height:10px;"></i></button>
            </div>
            <div>
              <button class="remove-drawer-item" aria-label="Remove item">
                <i data-lucide="trash-2" style="width:12px;height:12px;"></i> remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    lucide.createIcons();

    // Bind quantity button events in drawer
    listContainer.querySelectorAll(".drawer-item").forEach(itemEl => {
      let id = itemEl.getAttribute("data-id");
      let item = this.cart.find(c => c.product.id === id);

      itemEl.querySelector(".btn-minus").addEventListener("click", () => {
        this.updateCartQuantity(id, item.quantity - 1);
      });
      itemEl.querySelector(".btn-plus").addEventListener("click", () => {
        this.updateCartQuantity(id, item.quantity + 1);
      });
      itemEl.querySelector(".remove-drawer-item").addEventListener("click", () => {
        this.removeFromCart(id);
      });
    });

    // Update prices totals
    let subtotal = this.cart.reduce((sum, item) => sum + ((item.product.offerPrice || item.product.price) * item.quantity), 0);
    let total = subtotal;

    document.getElementById("drawer-subtotal").textContent = window.GalaxyUtils.formatCurrency(subtotal);
    document.getElementById("drawer-total").textContent = window.GalaxyUtils.formatCurrency(total);

    footerContainer.classList.remove("hidden");
  }

  // Helper to render product image or fallback vector SVG
  renderProductImageHTML(product, className = "") {
    if (!product.image || product.image.startsWith("default_") || product.image.startsWith("placeholder")) {
      return `<div class="${className} fallback-svg-container">${window.GalaxyUtils.getPremiumFurnitureSVG(product.category, product.name)}</div>`;
    }
    const src = (product.image.startsWith("http://") || product.image.startsWith("https://") || product.image.startsWith("data:"))
      ? product.image
      : `/assets/products/${product.image}`;
    return `<img src="${src}" alt="${product.name}" class="${className}" loading="lazy" onerror="this.outerHTML='<div class=\\'${className} fallback-svg-container\\'>'+window.GalaxyUtils.getPremiumFurnitureSVG('${product.category.replace(/'/g, "\\'")}', '${product.name.replace(/'/g, "\\'")}')+'</div>'">`;
  }

  getCategoryName(catId) {
    let cat = this.categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
  }

  // --- SPA Router Mappings ---
  registerRoutes() {
    window.GalaxyRouter
      .on("/", () => this.renderHome())
      .on("/about", () => this.renderAbout())
      .on("/products", (_, q) => this.renderProducts(q))
      .on("/categories", () => this.renderCategories())
      .on("/product/:id", (p) => this.renderProductDetail(p.id))
      .on("/cart", () => this.renderCartPage())
      .on("/checkout", () => this.renderCheckoutPage())
      .on("/wishlist", () => this.renderWishlistPage())
      .on("/contact", () => this.renderContact())
      .on("/privacy-policy", () => this.renderPolicy("privacy"))
      .on("/terms-conditions", () => this.renderPolicy("terms"))
      .on("/refund-policy", () => this.renderPolicy("refund"))
      .on("/shipping-policy", () => this.renderPolicy("shipping"))
      .on("/order-success", () => this.renderOrderSuccess());
      
    // Manually trigger the router now that routes are registered
    window.GalaxyRouter.handleRouting();
  }

  // --- Modal Quick View Handler ---
  openQuickView(productId) {
    const product = this.products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const modal = document.getElementById("quickview-modal");
    const content = document.getElementById("quickview-modal-content");
    if (!modal || !content) return;

    let qvThumbnailsHTML = "";
    const imagesArray = product.gallery || [product.image];
    if (imagesArray && imagesArray.length > 1) {
      const thumbs = imagesArray.slice(0, 3);
      qvThumbnailsHTML = `<div class="qv-thumbnail-gallery">
        ${thumbs.map((imgStr, idx) => {
          const resolvedSrc = (imgStr && !imgStr.startsWith("default_") && !imgStr.startsWith("placeholder"))
            ? ((imgStr.startsWith("http") || imgStr.startsWith("data:")) ? imgStr : `/assets/products/${imgStr}`)
            : null;
          
          if (!resolvedSrc) {
            return `
            <div class="qv-thumb ${idx === 0 ? "active" : ""}" data-index="${idx}">
              <div class="fallback-svg-container">${window.GalaxyUtils.getPremiumFurnitureSVG(product.category, product.name)}</div>
            </div>
            `;
          }

          return `
          <div class="qv-thumb ${idx === 0 ? "active" : ""}" data-src="${resolvedSrc}">
            <img src="${resolvedSrc}" alt="thumb" loading="lazy" onerror="this.outerHTML='<div class=\\'fallback-svg-container\\'>'+window.GalaxyUtils.getPremiumFurnitureSVG('${product.category.replace(/'/g, "\\'")}', '${product.name.replace(/'/g, "\\'")}')+'</div>'">
          </div>
          `;
        }).join("")}
      </div>`;
    }

    content.innerHTML = `
      <div class="product-detail-layout" style="gap: var(--spacing-lg);">
        <div class="detail-gallery">
          <div class="detail-main-img-wrapper qv-main-img-wrapper">
            ${this.renderProductImageHTML(product, "detail-main-img")}
          </div>
          ${qvThumbnailsHTML}
        </div>
        <div>
          <span class="detail-meta-cat">${this.getCategoryName(product.category)}</span>
          <h2 class="detail-title" style="font-size: 1.8rem; margin-bottom: 5px;">${product.name}</h2>
          
          <div class="detail-price-row" style="margin-bottom: var(--spacing-sm); padding-bottom: var(--spacing-sm);">
            <span class="detail-price-actual" style="font-size: 1.5rem;">${window.GalaxyUtils.formatCurrency(product.offerPrice || product.price)}</span>
            ${product.offerPrice ? `<span class="detail-price-original" style="font-size: 1rem;">${window.GalaxyUtils.formatCurrency(product.price)}</span>` : ""}
            ${product.offerPrice ? `<span class="detail-discount-badge" style="font-size: 0.65rem;">-${Math.round((product.price - product.offerPrice)/product.price * 100)}%</span>` : ""}
          </div>
          
          <div class="detail-stock-status" style="margin-bottom: var(--spacing-md); font-weight:600; font-size:0.9rem; color: ${product.inStock ? 'var(--color-success)' : 'var(--color-error)'};">
            ${product.inStock ? (product.stockCount !== undefined ? `✅ Only ${product.stockCount} left in stock` : "✅ In Stock") : "❌ Out of Stock"}
          </div>
          
          <p class="detail-desc" style="font-size: 0.85rem; line-height: 1.5; margin-bottom: var(--spacing-md);">${product.desc || product.shortDesc}</p>
          
          <div class="qv-purchase-options">
            <button class="btn btn-gold btn-qv-action btn-add-cart-qv" ${!product.inStock ? "disabled" : ""}>
              <i data-lucide="shopping-cart"></i> ${!product.inStock ? "Sold Out" : "Add To Cart"}
            </button>
            <button class="btn btn-black btn-qv-action btn-buy-qv" ${!product.inStock ? "disabled" : ""}>
              Buy Now
            </button>
          </div>
          
          <a href="/product/${product.id}" class="btn btn-outline-black btn-qv-action btn-view-details-qv" style="margin-top: 10px;">View Full Details</a>
        </div>
      </div>
    `;

    lucide.createIcons();

    // Bind thumbnail clicks
    const mainImgEl = content.querySelector(".detail-main-img-wrapper img");
    content.querySelectorAll(".qv-thumb").forEach(thumb => {
      thumb.addEventListener("click", () => {
        content.querySelectorAll(".qv-thumb").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        if (mainImgEl) {
          mainImgEl.src = thumb.getAttribute("data-src");
        }
      });
    });

    // Bind modal actions
    content.querySelector(".btn-add-cart-qv").addEventListener("click", () => {
      this.addToCart(product.id, 1);
      modal.classList.add("hidden");
    });

    content.querySelector(".btn-buy-qv").addEventListener("click", () => {
      this.addToCart(product.id, 1, false);
      modal.classList.add("hidden");
      window.GalaxyRouter.navigate("/checkout");
    });

    content.querySelector(".btn-view-details-qv").addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    modal.classList.remove("hidden");
  }

  // ==========================================================================
  // PAGE RENDERERS
  // ==========================================================================

  // --- Helper: Render Product Grid Card ---
  renderProductCardHTML(p) {
    let hasDiscount = !!p.offerPrice;
    let isWishlisted = this.wishlist.includes(String(p.id));
    let discountPct = hasDiscount ? Math.round(((p.price - p.offerPrice) / p.price) * 100) : 0;
    
    let thumbnailsHTML = "";
    if (p.images && p.images.length > 0) {
      const thumbs = p.images.slice(0, 3);
      thumbnailsHTML = `<div class="card-thumbnails">
        ${thumbs.map(img => `<div class="card-thumb"><img src="${img}" loading="lazy" alt="thumb"></div>`).join('')}
      </div>`;
    } else {
      let fallbackImg = "";
      if (p.image && !p.image.startsWith("default_") && !p.image.startsWith("placeholder")) {
        fallbackImg = (p.image.startsWith("http") || p.image.startsWith("data:")) ? p.image : `/assets/products/${p.image}`;
        thumbnailsHTML = `<div class="card-thumbnails"><div class="card-thumb"><img src="${fallbackImg}" loading="lazy" alt="thumb"></div></div>`;
      }
    }
    
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-image-wrapper">
          <a href="/product/${p.id}">
            ${this.renderProductImageHTML(p, "product-img")}
          </a>
          
          <div class="product-badge-group">
            ${p.isNew ? `<span class="product-badge badge-new">New</span>` : ""}
            ${hasDiscount ? `<span class="product-badge badge-discount">-${discountPct}%</span>` : ""}
            ${!p.inStock ? `<span class="product-badge badge-out-stock">Sold Out</span>` : ""}
          </div>
          
          <button class="wishlist-add-btn ${isWishlisted ? "wishlisted" : ""}" data-id="${p.id}" aria-label="Toggle Wishlist">
            <i data-lucide="heart" style="width: 16px; height: 16px; ${isWishlisted ? "fill: #C9A227; stroke: #C9A227;" : ""}"></i>
          </button>
          
          <div class="quickview-bar-overlay">
            <button class="btn-quickview-bar btn-quickview" data-id="${p.id}" title="Quick View">
              <i data-lucide="eye" style="width:14px;height:14px;margin-right:6px;"></i> Quick View
            </button>
          </div>
        </div>
        
        <div class="product-card-info">
          ${thumbnailsHTML}
          <span class="product-card-cat">${this.getCategoryName(p.category)}</span>
          <h3 class="product-card-title"><a href="/product/${p.id}">${p.name}</a></h3>
          <div class="product-card-price-row">
            <span class="price-actual">${window.GalaxyUtils.formatCurrency(p.offerPrice || p.price)}</span>
            ${hasDiscount ? `<span class="price-original">${window.GalaxyUtils.formatCurrency(p.price)}</span>` : ""}
          </div>
        </div>
        
        <div class="product-card-footer">
          <button class="btn btn-outline-black btn-sm btn-buy-now" data-id="${p.id}" ${!p.inStock ? "disabled style='opacity:0.6; cursor:not-allowed;'" : ""}>Buy Now</button>
          <button class="btn btn-gold btn-sm btn-add-cart" data-id="${p.id}" ${!p.inStock ? "disabled style='opacity:0.6; cursor:not-allowed;'" : ""}><i data-lucide="shopping-bag" style="width:14px;height:14px;margin-right:4px;"></i> ${!p.inStock ? "Sold Out" : "Add"}</button>
        </div>
      </article>
    `;
  }

  // Attach card event bindings (Add to cart, Wishlist, Quick view, Buy now)
  bindProductCardEvents(containerEl) {
    if (!containerEl) return;

    // Wishlist clicks
    containerEl.querySelectorAll(".wishlist-add-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = btn.getAttribute("data-id");
        this.toggleWishlist(id);
        
        // Toggle icon visual quickly
        let icon = btn.querySelector("svg") || btn.querySelector("i");
        let isWish = this.wishlist.includes(id);
        btn.classList.toggle("wishlisted", isWish);
        if (icon) {
          if (isWish) {
            icon.style.fill = "#C9A227";
            icon.style.stroke = "#C9A227";
          } else {
            icon.style.fill = "none";
            icon.style.stroke = "currentColor";
          }
        }
      });
    });

    // Add to cart clicks
    containerEl.querySelectorAll(".btn-add-cart").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = btn.getAttribute("data-id");
        this.addToCart(id, 1);
      });
    });

    // Quick View clicks
    containerEl.querySelectorAll(".btn-quickview").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = btn.getAttribute("data-id");
        this.openQuickView(id);
      });
    });

    // Buy Now clicks
    containerEl.querySelectorAll(".btn-buy-now").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = btn.getAttribute("data-id");
        this.addToCart(id, 1, false);
        window.GalaxyRouter.navigate("/checkout");
      });
    });
  }

  // --- 1. Render HOME PAGE ---
  renderHome() {
    this.appRoot.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero-section">
        <div class="hero-slider-container" id="hero-slider-container">
          <div class="hero-slide active" style="background-image: url('/assets/hero_slide_1.jpg');"></div>
          <div class="hero-slide" style="background-image: url('/assets/hero_slide_2.png');"></div>
        </div>
        <div class="hero-overlay"></div>
        <div class="container hero-content-container">
          <div class="hero-content fade-in-up">
            <h1 class="hero-title" style="margin-top: 2rem;">Elevate Your Living <span>Spaces</span></h1>
            <p class="hero-desc">Curated minimalist lines, gold metallic finishes, and premium imported furniture designed for luxury homes.</p>
            <div class="hero-actions">
              <a href="/products" class="btn btn-gold">Explore Showroom</a>
              <a href="/contact" class="btn btn-outline-white" onclick="window.navigateToContact(); return false;">Book Consultation</a>
            </div>
          </div>
        </div>
        <!-- Slider Navigation Indicators -->
        <div class="hero-slider-indicators">
          <span class="indicator active" data-slide="0"></span>
          <span class="indicator" data-slide="1"></span>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="py-section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Showroom Highlights</span>
            <h2 class="section-title">New Arrivals</h2>
            <p class="section-desc">Exquisite pieces selected for high visual impact and durability.</p>
          </div>
          <div class="products-grid" id="home-products-grid">
            <!-- Injected dynamically -->
          </div>
          <div style="text-align: center; margin-top: var(--spacing-xl);">
            <a href="/products" class="btn btn-black btn-lg">Explore Full Catalog</a>
          </div>
        </div>
      </section>

      <!-- Featured Categories -->
      <section class="py-section bg-soft">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Browse Styles</span>
            <h2 class="section-title">Featured Categories</h2>
            <p class="section-desc">Find collections tailored for every corner of your home or workspace.</p>
          </div>
          <div class="category-carousel">
            ${this.categories.slice(0, 4).map(c => `
              <div class="category-card" onclick="window.GalaxyRouter.navigate('/products?category=${c.id}')">
                <div class="category-img" style="background-image: url('${resolveCategoryImage(c)}'); background-size: cover; background-position: center; transition: transform var(--transition-smooth);"></div>
                <div class="category-overlay">
                  <h3 class="category-title">${c.name}</h3>
                  <span class="category-btn">Explore Collection <i data-lucide="arrow-right" style="width:12px;height:12px;"></i></span>
                </div>
              </div>
            `).join("")}
          </div>
          <div style="text-align: center; margin-top: var(--spacing-xl);">
            <a href="/categories" class="btn btn-outline-black">View All Categories</a>
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="py-section">
        <div class="container">
          <div class="section-header fade-in">
            <span class="section-subtitle">Excellence Guaranteed</span>
            <h2 class="section-title">Why Settle For Ordinary?</h2>
            <p class="section-desc">We bring international interior standards directly to Erode with curated luxury collections.</p>
          </div>
          <div class="why-grid">
            <div class="why-card card-hover-effect">
              <div class="why-icon-wrapper"><i data-lucide="package"></i></div>
              <h3>Premium Imported Furniture</h3>
              <p>Hand-picked, high-quality collections imported from leading Asian furniture production hubs.</p>
            </div>
            <div class="why-card card-hover-effect">
              <div class="why-icon-wrapper"><i data-lucide="award"></i></div>
              <h3>International Quality</h3>
              <p>Strict quality checks ensuring solid structural framing, flawless coatings, and fine stitching.</p>
            </div>
            <div class="why-card card-hover-effect">
              <div class="why-icon-wrapper"><i data-lucide="sparkles"></i></div>
              <h3>Modern & Luxury Designs</h3>
              <p>Minimalist lines, glass elements, and gold accents matching current architectural trends.</p>
            </div>
            <div class="why-card card-hover-effect">
              <div class="why-icon-wrapper"><i data-lucide="tag"></i></div>
              <h3>Affordable Pricing</h3>
              <p>Direct factory sourcing allows luxury showroom designs at fair and competitive prices.</p>
            </div>
            <div class="why-card card-hover-effect">
              <div class="why-icon-wrapper"><i data-lucide="heart-handshake"></i></div>
              <h3>Professional Service</h3>
              <p>End-to-end design consultancy, site measurements, transport, and expert on-site assembly.</p>
            </div>
            <div class="why-card card-hover-effect">
              <div class="why-icon-wrapper"><i data-lucide="shield-check"></i></div>
              <h3>Fast Customer Support</h3>
              <p>Dedicated staff ready to answer queries, manage logistics, and support your projects.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Complete Interior Solutions -->
      <section class="py-section bg-soft">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Turnkey Interiors</span>
            <h2 class="section-title">Complete Room Solutions</h2>
            <p class="section-desc">Get a cohesive designer look with our complete residential and commercial furniture packs.</p>
          </div>
          <div class="solutions-grid">
            ${(Array.isArray(this.interiorSolutions) ? this.interiorSolutions : []).slice(0, 3).map(s => {
              const sTitle = s.title || 'Interior Package';
              const sSub = s.subtitle || 'Custom Design';
              const sPrice = s.price || 'Contact for Quote';
              const sDesc = s.desc || '';
              const sImg = s.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
              const sFeatures = Array.isArray(s.features) ? s.features : [];

              return `
              <div class="solution-card">
                <div class="solution-img-wrapper">
                  <img
                    src="${sImg}"
                    alt="${sTitle}"
                    class="solution-img-photo"
                    loading="lazy"
                    onerror="this.style.display='none'; this.parentElement.style.background='#1a1a1a';"
                  >
                  <div class="solution-img-overlay"></div>
                  <span class="solution-badge">${sSub}</span>
                  <div class="solution-price-tag">${sPrice}</div>
                </div>
                <div class="solution-info">
                  <h3>${sTitle}</h3>
                  <p>${sDesc}</p>
                  <ul style="font-size:0.8rem; color:var(--color-secondary-muted); margin-bottom:var(--spacing-md); line-height:1.8;">
                    ${sFeatures.map(f => `<li><i data-lucide="check" style="width:10px;height:10px;color:var(--color-accent);margin-right:5px;vertical-align:middle;"></i> ${f}</li>`).join("")}
                  </ul>
                  <button class="btn btn-outline-gold btn-sm" onclick="window.navigateToContact()" type="button">Enquire Details</button>
                </div>
              </div>
              `;
            }).join("")}
          </div>
          <div style="text-align: center; margin-top: var(--spacing-xl);">
            <button class="btn btn-black" onclick="window.navigateToContact()" type="button">Discuss Your Project</button>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-section bg-dark">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle" style="color:var(--color-accent);">Client Stories</span>
            <h2 class="section-title">What Our Patrons Say</h2>
          </div>
          <div class="reviews-container">
            <div class="review-slider">
              <div class="review-slides-wrapper" id="review-slides-wrapper">
                ${(Array.isArray(this.reviews) && this.reviews.length > 0 ? this.reviews : (window.GALAXY_DECOR_DB ? window.GALAXY_DECOR_DB.reviews : [])).map(r => `
                  <div class="review-slide">
                    <div class="review-quote-icon">“</div>
                    <p class="review-text">${r.text || ''}</p>
                    <div class="review-rating">
                      ${Array(Number(r.rating) || 5).fill('<i data-lucide="star"></i>').join("")}
                    </div>
                    <div class="review-author">${r.author || 'Anonymous'}</div>
                    <div class="review-author-title">${r.title || 'Patron'}</div>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="review-dots" id="review-dots">
              ${(Array.isArray(this.reviews) && this.reviews.length > 0 ? this.reviews : (window.GALAXY_DECOR_DB ? window.GALAXY_DECOR_DB.reviews : [])).map((_, i) => `<span class="review-dot ${i === 0 ? "active" : ""}" data-index="${i}"></span>`).join("")}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: var(--spacing-xl);">
            <button id="btn-toggle-review-form" class="btn btn-outline-gold btn-sm">Write a Review</button>
          </div>
          
          <div id="review-form-container" style="display: none; max-width: 600px; margin: var(--spacing-xl) auto 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.25); border-radius: 18px; padding: 2.25rem; box-shadow: var(--shadow-lg); transition: all 0.3s ease;">
            <h3 style="color:#ffffff; font-family:var(--font-serif); font-size:1.4rem; margin-bottom:1.5rem; text-align:center; letter-spacing: 0.02em;">Share Your Experience</h3>
            <form id="client-review-form">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label for="rev-author" style="color:rgba(255,255,255,0.7); font-size:0.72rem; text-transform:uppercase; letter-spacing:0.12em; display:block; margin-bottom:0.4rem; font-weight: 600;">Your Name</label>
                  <input type="text" id="rev-author" required placeholder="e.g. Anand Kumar" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; width:100%; border-radius:8px; padding:0.7rem 1.1rem; font-size: 0.85rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label for="rev-title" style="color:rgba(255,255,255,0.7); font-size:0.72rem; text-transform:uppercase; letter-spacing:0.12em; display:block; margin-bottom:0.4rem; font-weight: 600;">Location / Designation</label>
                  <input type="text" id="rev-title" required placeholder="e.g. Homeowner, Erode" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; width:100%; border-radius:8px; padding:0.7rem 1.1rem; font-size: 0.85rem;">
                </div>
              </div>
              <div class="form-group" style="margin-bottom:1.25rem;">
                <label for="rev-rating" style="color:rgba(255,255,255,0.7); font-size:0.72rem; text-transform:uppercase; letter-spacing:0.12em; display:block; margin-bottom:0.4rem; font-weight: 600;">Rating</label>
                <select id="rev-rating" required style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; width:100%; border-radius:8px; padding:0.7rem 1.1rem; cursor:pointer; font-size: 0.85rem;">
                  <option value="5" style="background:#1e1e1e;">⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                  <option value="4" style="background:#1e1e1e;">⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                  <option value="3" style="background:#1e1e1e;">⭐⭐⭐ (3 Stars - Good)</option>
                  <option value="2" style="background:#1e1e1e;">⭐⭐ (2 Stars - Fair)</option>
                  <option value="1" style="background:#1e1e1e;">⭐ (1 Star - Poor)</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:1.75rem;">
                <label for="rev-text" style="color:rgba(255,255,255,0.7); font-size:0.72rem; text-transform:uppercase; letter-spacing:0.12em; display:block; margin-bottom:0.4rem; font-weight: 600;">Review Message</label>
                <textarea id="rev-text" required rows="4" placeholder="Tell us about the product quality, shipping, or showroom experience..." style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; width:100%; border-radius:8px; padding:0.7rem 1.1rem; resize:vertical; font-size: 0.85rem; line-height: 1.5;"></textarea>
              </div>
              <div style="text-align:center;">
                <button type="submit" class="btn btn-gold" style="padding: 0.75rem 2rem; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em;">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Quick Contact form -->
      <section class="py-section">
        <div class="container contact-grid">
          <div class="showroom-details">
            <span class="section-subtitle">Visit Us</span>
            <h3>Our Flagship Showroom</h3>
            <p class="showroom-intro">Experience the weight, build, and textures of our premium imported collections in person. Let our consultants guide your planning.</p>
            <div class="contact-info-list">
              <div class="contact-info-card">
                <i data-lucide="map-pin"></i>
                <div>
                  <h4>Address</h4>
                  <p>${this.store.address}</p>
                </div>
              </div>
              <div class="contact-info-card">
                <i data-lucide="phone"></i>
                <div>
                  <h4>Phone</h4>
                  <p><a href="tel:${this.store.phone}">${this.store.phone}</a></p>
                </div>
              </div>
              <div class="contact-info-card">
                <i data-lucide="mail"></i>
                <div>
                  <h4>Email</h4>
                  <p><a href="mailto:${this.store.email}">${this.store.email}</a></p>
                </div>
              </div>
            </div>
            
            <div class="map-container" style="padding: 0; min-height: 250px; overflow: hidden; border-radius: var(--border-radius); border: 1px solid var(--color-border); position: relative;">
              <a href="https://maps.google.com/?q=${encodeURIComponent('4/642, Post Office Building, Sakthi Nagar, Opp. Viswanathan Hospital, Vijayamangalam, Perundurai, Erode - 638056, Tamil Nadu')}" target="_blank" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;" title="Click to open in Google Maps"></a>
              <iframe 
                src="https://maps.google.com/maps?q=${encodeURIComponent('4/642, Post Office Building, Sakthi Nagar, Opp. Viswanathan Hospital, Vijayamangalam, Perundurai, Erode - 638056, Tamil Nadu')}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style="border:0; min-height: 250px; pointer-events: none;" 
                allowfullscreen="" 
                loading="lazy">
              </iframe>
            </div>
            <div style="margin-top: 12px;">
              <a href="https://maps.google.com/?q=${encodeURIComponent('4/642, Post Office Building, Sakthi Nagar, Opp. Viswanathan Hospital, Vijayamangalam, Perundurai, Erode - 638056, Tamil Nadu')}" target="_blank" class="btn btn-outline-black btn-block" style="font-size: 0.85rem;"><i data-lucide="navigation" style="width:14px;height:14px;margin-right:6px;"></i> Get Directions on Google Maps</a>
            </div>
          </div>

          <div class="contact-form-wrapper">
            <h3>Send An Enquiry</h3>
            <form id="home-contact-form">
              <div class="form-group">
                <label for="c-name">Full Name</label>
                <input type="text" id="c-name" class="form-control" placeholder="Enter your name" required>
              </div>
              <div class="form-group">
                <label for="c-phone">Phone Number</label>
                <input type="tel" id="c-phone" class="form-control" placeholder="Enter phone number" required>
              </div>
              <div class="form-group">
                <label for="c-email">Email Address (Optional)</label>
                <input type="email" id="c-email" class="form-control" placeholder="Enter email address">
              </div>
              <div class="form-group">
                <label for="c-interest">I am interested in</label>
                <select id="c-interest" class="form-control">
                  <option>Home Living Room Furniture</option>
                  <option>Bedroom Sets</option>
                  <option>Office Tables & Chairs</option>
                  <option>Cafe / Restaurant Seating</option>
                  <option>Water Fountains & Decor</option>
                  <option>Complete Interior Solutions</option>
                </select>
              </div>
              <div class="form-group">
                <label for="c-message">Your Message</label>
                <textarea id="c-message" class="form-control" placeholder="Describe your requirement (sizes, materials, custom designs)..." required></textarea>
              </div>
              <button type="submit" class="btn btn-gold btn-block">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    `;

    lucide.createIcons();

    // Inject Home Products (first 6 items)
    const homeProductsGrid = document.getElementById("home-products-grid");
    if (homeProductsGrid) {
      let featuredList = this.products.slice(0, 6);
      homeProductsGrid.innerHTML = featuredList.map(p => this.renderProductCardHTML(p)).join("");
      this.bindProductCardEvents(homeProductsGrid);
    }

    // Set up reviews slider and hero banner slideshow animations
    this.initReviewSlider();
    this.initHeroSlider();

    // Bind contact form submit
    const contactForm = document.getElementById("home-contact-form");
    if (contactForm) {
      window.setupPhoneField(document.getElementById("c-phone"));
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const phoneVal = document.getElementById("c-phone").value.trim();
        const digitsOnly = phoneVal.replace(/[^0-9]/g, "");
        if (phoneVal.startsWith("+")) {
          if (digitsOnly.length < 7) {
            window.GalaxyUtils.showToast("Foreign phone number must have at least 7 digits.", "error");
            return;
          }
        } else {
          if (digitsOnly.length < 10) {
            window.GalaxyUtils.showToast("Local phone number must be exactly 10 digits.", "error");
            return;
          }
        }

        try {
          let enquiries = JSON.parse(localStorage.getItem("gd_enquiries")) || [];
          let newEnquiry = {
            id: "ENQ-" + Date.now(),
            name: document.getElementById("c-name").value.trim(),
            phone: phoneVal,
            email: document.getElementById("c-email").value.trim(),
            interest: document.getElementById("c-interest").value,
            message: document.getElementById("c-message").value.trim(),
            date: new Date().toLocaleString()
          };
          enquiries.push(newEnquiry);
          localStorage.setItem("gd_enquiries", JSON.stringify(enquiries));

          // Sync to real backend
          if (window.GalaxyAPI) {
            window.GalaxyAPI.syncEntity('enquiries', 'POST', newEnquiry);
          }
        } catch (err) {
          console.error("Failed to save enquiry:", err);
        }
        window.GalaxyUtils.showToast("Thank you! Your enquiry has been sent. Our team will contact you shortly.");
        contactForm.reset();
      });
    }

    // Review form toggle and submit event handling
    const btnToggleReviewForm = document.getElementById("btn-toggle-review-form");
    const reviewFormContainer = document.getElementById("review-form-container");
    if (btnToggleReviewForm && reviewFormContainer) {
      btnToggleReviewForm.addEventListener("click", () => {
        const isCollapsed = reviewFormContainer.style.display === "none";
        reviewFormContainer.style.display = isCollapsed ? "block" : "none";
        btnToggleReviewForm.textContent = isCollapsed ? "Cancel Review" : "Write a Review";
        if (isCollapsed) {
          reviewFormContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }

    const clientReviewForm = document.getElementById("client-review-form");
    if (clientReviewForm) {
      clientReviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const author = document.getElementById("rev-author").value.trim();
        const title = document.getElementById("rev-title").value.trim();
        const rating = parseInt(document.getElementById("rev-rating").value);
        const text = document.getElementById("rev-text").value.trim();
        
        const newReview = {
          id: "rev_" + Date.now(),
          author: author || "Anonymous",
          title: title || "Showroom Experience",
          rating: rating || 5,
          text: text || ""
        };
        
        this.reviews.unshift(newReview);
        localStorage.setItem("gd_reviews", JSON.stringify(this.reviews));
        
        // Sync to Supabase Cloud Backend
        if (window.GalaxyAPI) {
          await window.GalaxyAPI.syncEntity('reviews', 'POST', newReview);
        }
        
        window.GalaxyUtils.showToast("Review submitted successfully!");
        
        clientReviewForm.reset();
        if (reviewFormContainer) reviewFormContainer.style.display = "none";
        if (btnToggleReviewForm) btnToggleReviewForm.textContent = "Write a Review";
        
        // Re-render homepage so the new review is instantly visible
        this.renderHome();
      });
    }
  }

  // Testimonials automatic slider logic
  initReviewSlider() {
    if (this.reviewInterval) clearInterval(this.reviewInterval);
    const wrapper = document.getElementById("review-slides-wrapper");
    const dots = document.querySelectorAll(".review-dot");
    if (!wrapper || dots.length === 0) return;

    const slideTo = (index) => {
      this.currentReviewIndex = index;
      wrapper.style.transform = `translateX(-${index * 100}%)`;
      
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    };

    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        let index = parseInt(dot.getAttribute("data-index"));
        slideTo(index);
      });
    });

    // Auto rotate every 5 seconds
    this.reviewInterval = setInterval(() => {
      let nextIndex = (this.currentReviewIndex + 1) % this.reviews.length;
      slideTo(nextIndex);
    }, 5000);
  }

  // Hero slideshow logic
  initHeroSlider() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    const slides = this.appRoot.querySelectorAll(".hero-slide");
    const indicators = this.appRoot.querySelectorAll(".hero-slider-indicators .indicator");
    if (slides.length === 0) return;

    let currentSlide = 0;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
      indicators.forEach((ind, i) => {
        ind.classList.toggle("active", i === index);
      });
      currentSlide = index;
    };

    const nextSlide = () => {
      let next = (currentSlide + 1) % slides.length;
      showSlide(next);
    };

    // Auto rotate background every 6 seconds
    this.heroInterval = setInterval(nextSlide, 6000);

    indicators.forEach((ind, i) => {
      ind.addEventListener("click", () => {
        clearInterval(this.heroInterval);
        showSlide(i);
        this.heroInterval = setInterval(nextSlide, 6000);
      });
    });
  }

  // --- 2. Render ABOUT PAGE ---
  renderAbout() {
    this.appRoot.innerHTML = `
      <section class="py-section container">
        <div class="about-page-grid">
          <div class="about-text-content fade-in">
            <span class="section-subtitle">Our Heritage</span>
            <h1>Imports For <span>Premium Living</span></h1>
            <p class="about-lead">${this.store.about}</p>
            <p class="about-description">Every item at Galaxy Decor undergoes detailed evaluation. From high-durability modern structural steel bases to natural fine Italian marbles and premium boucle upholstery, we source collections designed to elevate standard rooms into modern design showrooms.</p>
            
            <div class="about-features-list">
              <div class="about-feature-item"><i data-lucide="check-circle"></i> Premium Imported Furniture</div>
              <div class="about-feature-item"><i data-lucide="check-circle"></i> International Quality</div>
              <div class="about-feature-item"><i data-lucide="check-circle"></i> Modern & Luxury Designs</div>
              <div class="about-feature-item"><i data-lucide="check-circle"></i> Complete Interior Solutions</div>
              <div class="about-feature-item"><i data-lucide="check-circle"></i> Affordable Pricing</div>
              <div class="about-feature-item"><i data-lucide="check-circle"></i> Professional Customer Support</div>
              <div class="about-feature-item" style="grid-column: span 2;"><i data-lucide="check-circle"></i> Turnkey Residential & Commercial Projects</div>
            </div>
          </div>
          <div class="about-image-wrapper fade-in">
            <img src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80" alt="Galaxy Decor Showroom" class="about-showroom-img">
          </div>
        </div>
      </section>

      <!-- Sourcing & Showroom Gallery Grid -->
      <section class="py-section container" style="border-top: 1px solid var(--color-border); margin-top: 2rem; padding-top: 4rem;">
        <div class="section-header">
          <span class="section-subtitle">Exquisite Craftsmanship</span>
          <h2 class="section-title">Showroom &amp; Sourcing Gallery</h2>
          <p class="section-desc">A glimpse into our curated luxury pieces, metal textures, marble finishes, and premium imports.</p>
        </div>
        
        <div class="about-gallery-grid">
          <div class="gallery-item-wrap fade-in">
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80" alt="Luxury Living Room Sourcing">
            <div class="gallery-item-label">Luxury Living Curation</div>
          </div>
          <div class="gallery-item-wrap fade-in">
            <img src="https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80" alt="Marble Dining Sets">
            <div class="gallery-item-label">Italian Marble Dining</div>
          </div>
          <div class="gallery-item-wrap fade-in">
            <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80" alt="Premium Bedroom Collection">
            <div class="gallery-item-label">Imported Bedroom Sets</div>
          </div>
          <div class="gallery-item-wrap fade-in">
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80" alt="Bespoke Metal Accents">
            <div class="gallery-item-label">Metallic Accent Details</div>
          </div>
        </div>
      </section>
    `;
    lucide.createIcons();
  }

  // --- 3. Render CATEGORIES LISTING ---
  renderCategories() {
    this.appRoot.innerHTML = `
      <section class="py-section container">
        <div class="section-header">
          <span class="section-subtitle">Exquisite curation</span>
          <h2 class="section-title">Design Categories</h2>
          <p class="section-desc">Select a collection category to narrow down your search for the perfect interior components.</p>
        </div>
        <div class="category-carousel" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          ${this.categories.map(c => `
            <div class="category-card" onclick="window.GalaxyRouter.navigate('/products?category=${c.id}')">
              <div class="category-img" style="background-image: url('${resolveCategoryImage(c)}'); background-size: cover; background-position: center; transition: transform var(--transition-smooth);"></div>
              <div class="category-overlay">
                <h3 class="category-title" style="font-size:1.4rem;">${c.name}</h3>
                <p style="font-size:0.75rem; color:rgba(255,255,255,0.7); margin-bottom:10px; display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;">${c.desc}</p>
                <span class="category-btn">Explore <i data-lucide="arrow-right" style="width:12px;height:12px;"></i></span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
    lucide.createIcons();
  }

  // --- 4. Render PRODUCTS CATALOG ---
  renderProducts(queryParams) {
    let activeCategory = queryParams.category || "";
    let searchQuery = queryParams.search || "";

    // Set up search terms filters inside App Root
    this.appRoot.innerHTML = `
      <section class="py-section container">
        <div class="catalog-layout">
          <!-- Sidebar Filters -->
          <aside class="filters-sidebar" id="catalog-filters-sidebar">
            <div class="filters-header">
              <span class="filters-title">Filter Selection</span>
              <button class="clear-filters-btn" id="btn-clear-filters">Clear All</button>
            </div>
            
            <!-- Category Filter -->
            <div class="filter-group">
              <h4 class="filter-group-title">Category</h4>
              <div class="filter-options">
                ${this.categories.map(c => `
                  <label class="custom-checkbox">
                    <input type="checkbox" name="f-category" value="${c.id}" ${activeCategory === c.id ? "checked" : ""}>
                    <span class="checkmark"></span>
                    <span class="checkbox-text">${c.name}</span>
                  </label>
                `).join("")}
              </div>
            </div>

            <!-- Price Filter -->
            <div class="filter-group">
              <h4 class="filter-group-title">Price Limit</h4>
              <div class="price-range-wrapper">
                <input type="range" id="filter-price-slider" class="price-slider-input" min="0" max="150000" step="5000" value="150000">
                <div class="price-range-values">
                  <span>₹0</span>
                  <span id="price-slider-value">Max: ₹1,50,000</span>
                </div>
              </div>
            </div>

            <!-- Availability Filter -->
            <div class="filter-group">
              <h4 class="filter-group-title">Availability</h4>
              <div class="filter-options">
                <label class="custom-checkbox">
                  <input type="checkbox" id="filter-stock-only">
                  <span class="checkmark"></span>
                  <span class="checkbox-text">Exclude Out of Stock</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Catalog Main Column -->
          <div>
            <div class="catalog-header">
              <div class="results-count" id="catalog-results-count">
                Showing all <strong>${this.products.length}</strong> luxury articles
              </div>
              
              <div class="sort-select-wrapper">
                <label for="catalog-sort">Sort By</label>
                <select id="catalog-sort" class="sort-select">
                  <option value="latest">Latest Designs</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div class="products-grid" id="catalog-products-grid">
              <!-- Injected dynamically -->
            </div>
            
            <div class="empty-catalog hidden" id="catalog-empty-state">
              <i data-lucide="package-search"></i>
              <h3>No items match your configuration</h3>
              <p style="color:var(--color-secondary-muted); font-size:0.9rem; margin-top:5px;">Try loosening your category choices or pricing thresholds.</p>
            </div>
          </div>
        </div>
      </section>
    `;

    lucide.createIcons();

    this.bindCatalogEvents(activeCategory, searchQuery);
  }

  bindCatalogEvents(initialCategory, searchQuery) {
    const grid = document.getElementById("catalog-products-grid");
    const emptyState = document.getElementById("catalog-empty-state");
    const countEl = document.getElementById("catalog-results-count");
    
    const categoryCheckboxes = document.querySelectorAll('input[name="f-category"]');
    const priceSlider = document.getElementById("filter-price-slider");
    const priceLabel = document.getElementById("price-slider-value");
    const stockCheckbox = document.getElementById("filter-stock-only");
    const sortSelect = document.getElementById("catalog-sort");
    const clearBtn = document.getElementById("btn-clear-filters");

    // Local filter state
    const filterState = {
      categories: initialCategory ? [initialCategory] : [],
      maxPrice: 150000,
      stockOnly: false,
      sortBy: "latest",
      search: searchQuery
    };

    // Update filter tags
    const applyFiltersAndRender = () => {
      let filtered = [...this.products];

      // 1. Search Query
      if (filterState.search) {
        let q = filterState.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.shortDesc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }

      // 2. Categories
      if (filterState.categories.length > 0) {
        filtered = filtered.filter(p => filterState.categories.includes(p.category));
      }

      // 3. Price Range
      filtered = filtered.filter(p => (p.offerPrice || p.price) <= filterState.maxPrice);

      // 4. Stock Availability
      if (filterState.stockOnly) {
        filtered = filtered.filter(p => p.inStock);
      }

      // 5. Sorting
      if (filterState.sortBy === "price-low") {
        filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
      } else if (filterState.sortBy === "price-high") {
        filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
      } else {
        // latest/default: new items first
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      }

      // Render items
      if (filtered.length > 0) {
        grid.innerHTML = filtered.map(p => this.renderProductCardHTML(p)).join("");
        grid.classList.remove("hidden");
        emptyState.classList.add("hidden");
        this.bindProductCardEvents(grid);
      } else {
        grid.classList.add("hidden");
        emptyState.classList.remove("hidden");
      }

      // Update count text
      countEl.innerHTML = `Showing <strong>${filtered.length}</strong> matching premium articles`;
      lucide.createIcons();
    };

    // Event hooks
    categoryCheckboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        let checked = Array.from(categoryCheckboxes).filter(c => c.checked).map(c => c.value);
        filterState.categories = checked;
        applyFiltersAndRender();
      });
    });

    priceSlider.addEventListener("input", (e) => {
      let val = parseInt(e.target.value);
      priceLabel.textContent = `Max: ${window.GalaxyUtils.formatCurrency(val)}`;
    });

    priceSlider.addEventListener("change", (e) => {
      let val = parseInt(e.target.value);
      filterState.maxPrice = val;
      applyFiltersAndRender();
    });

    stockCheckbox.addEventListener("change", (e) => {
      filterState.stockOnly = e.target.checked;
      applyFiltersAndRender();
    });

    sortSelect.addEventListener("change", (e) => {
      filterState.sortBy = e.target.value;
      applyFiltersAndRender();
    });

    clearBtn.addEventListener("click", () => {
      categoryCheckboxes.forEach(c => c.checked = false);
      priceSlider.value = 150000;
      priceLabel.textContent = "Max: ₹1,50,000";
      stockCheckbox.checked = false;
      sortSelect.value = "latest";
      
      filterState.categories = [];
      filterState.maxPrice = 150000;
      filterState.stockOnly = false;
      filterState.sortBy = "latest";
      filterState.search = "";

      applyFiltersAndRender();
    });

    // Run first render
    applyFiltersAndRender();
  }

  // --- 5. Render PRODUCT DETAILS ---
  renderProductDetail(productId) {
    const product = this.products.find(p => String(p.id) === String(productId));
    if (!product) {
      window.GalaxyRouter.navigate("/products");
      return;
    }

    // Get related products (same category, exclude current)
    const related = this.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);

    let isWish = this.wishlist.includes(product.id);
    let images = product.gallery || [product.image, product.image, product.image];

    this.appRoot.innerHTML = `
      <section class="py-section container fade-in">
        <div style="margin-bottom: var(--spacing-md);">
          <button class="btn btn-outline-black btn-sm" onclick="window.history.back()"><i data-lucide="arrow-left" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;"></i> Back</button>
        </div>
        <div class="product-detail-layout">
          <!-- Gallery -->
          <div class="detail-gallery" style="display:flex !important; flex-direction:column !important; align-items:center !important; width:100% !important;">
            <div class="qv-main-img-wrapper" id="detail-main-image-wrapper" style="width:100% !important; max-width:none !important; margin-bottom:20px !important;">
              ${this.renderProductImageHTML(product, "detail-main-img")}
            </div>
            
            <!-- thumbnails -->
            <div class="qv-thumbnail-gallery" style="width:100% !important; margin-bottom:20px !important;">
              ${images.map((img, i) => {
                const src = (img && !img.startsWith("default_") && !img.startsWith("placeholder"))
                  ? ((img.startsWith("http") || img.startsWith("data:")) ? img : `/assets/products/${img}`)
                  : null;
                
                if (!src) {
                  return `
                    <div class="qv-thumb ${i === 0 ? "active" : ""}" data-index="${i}">
                      <div class="fallback-svg-container">${window.GalaxyUtils.getPremiumFurnitureSVG(product.category, product.name)}</div>
                    </div>
                  `;
                }
                
                return `
                  <div class="qv-thumb ${i === 0 ? "active" : ""}" data-index="${i}" data-src="${src}">
                    <img src="${src}" alt="${product.name}" loading="lazy" onerror="this.outerHTML='<div class=\\'fallback-svg-container\\'>'+window.GalaxyUtils.getPremiumFurnitureSVG('${product.category.replace(/'/g, "\\'")}', '${product.name.replace(/'/g, "\\'")}')+'</div>'">
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Options -->
          <div>
            <span class="detail-meta-cat">${this.getCategoryName(product.category)}</span>
            <h1 class="detail-title">${product.name}</h1>

            <div class="detail-price-row" style="margin-bottom: var(--spacing-sm); border-bottom: none;">
              <span class="detail-price-actual">${window.GalaxyUtils.formatCurrency(product.offerPrice || product.price)}</span>
              ${product.offerPrice ? `<span class="detail-price-original">${window.GalaxyUtils.formatCurrency(product.price)}</span>` : ""}
              ${product.offerPrice ? `<span class="detail-discount-badge">-${Math.round((product.price - product.offerPrice)/product.price * 100)}% DISCOUNT</span>` : ""}
            </div>

            <div class="detail-stock-status" style="margin-bottom: var(--spacing-md); font-weight:600; font-size:1rem; color: ${product.inStock ? 'var(--color-success)' : 'var(--color-error)'}; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: var(--spacing-sm);">
              ${product.inStock ? (product.stockCount !== undefined ? `✅ Only ${product.stockCount} left in stock` : "✅ In Stock") : "❌ Out of Stock"}
            </div>

            <p class="detail-desc">${product.desc || product.shortDesc}</p>

            <div class="detail-purchase-options">
              <div class="purchase-row">
                <div class="qty-input-group">
                  <button class="qty-btn" id="btn-qty-minus" aria-label="Subtract" ${!product.inStock ? "disabled" : ""}><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                  <span class="qty-val" id="detail-qty-value">1</span>
                  <button class="qty-btn" id="btn-qty-plus" aria-label="Add" ${!product.inStock ? "disabled" : ""}><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                </div>
                
                <div class="purchase-actions">
                  <button class="btn btn-gold" id="btn-detail-add-cart" ${!product.inStock ? "disabled style='opacity:0.6; cursor:not-allowed;'" : ""}><i data-lucide="shopping-bag" style="width:16px;height:16px;margin-right:8px;"></i> ${!product.inStock ? "Sold Out" : "Add To Cart"}</button>
                  <button class="btn btn-black" id="btn-detail-buy" ${!product.inStock ? "disabled style='opacity:0.6; cursor:not-allowed;'" : ""}>Buy Now</button>
                </div>

                <button class="wishlist-detail-btn ${isWish ? "wishlisted" : ""}" id="btn-detail-wish" aria-label="Toggle Wishlist">
                  <i data-lucide="heart" style="width: 20px; height: 20px; ${isWish ? "fill: #C9A227; stroke: #C9A227;" : ""}"></i>
                </button>
              </div>
            </div>

            <!-- Specifications Table -->
            <div class="specs-section">
              <h3>Technical Specifications</h3>
              <table class="specs-table">
                <tbody>
                  ${Object.entries(product.specs || {
                    "Dimensions": "Standard Showroom Fit",
                    "Upholstery": "Premium Fabric Sourcing",
                    "Warranty": "1 Year Manufacturer Defect Sourcing Warranty",
                    "Shipping": "Safe local Erode shipping and expert assembly included"
                  }).map(([lbl, val]) => `
                    <tr>
                      <td class="specs-label">${lbl}</td>
                      <td class="specs-value">${val}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        ${related.length > 0 ? `
          <div class="related-section">
            <div class="section-header" style="text-align: left; margin-bottom:var(--spacing-lg); max-width:100%;">
              <h2 class="section-title" style="font-size:1.8rem;">Related Luxury Designs</h2>
            </div>
            <div class="products-grid" id="related-products-grid">
              ${related.map(p => this.renderProductCardHTML(p)).join("")}
            </div>
          </div>
        ` : ""}
      </section>
    `;

    lucide.createIcons();

    // Bind related products events
    const relGrid = document.getElementById("related-products-grid");
    if (relGrid) this.bindProductCardEvents(relGrid);

    // Zoom setup
    const wrapper = document.getElementById("detail-main-image-wrapper");
    const mainImg = wrapper.querySelector(".detail-main-img");
    window.GalaxyUtils.initImageZoom(wrapper, mainImg);

    // Thumbnails swap
    const thumbs = document.querySelectorAll(".qv-thumb");
    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        thumbs.forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        
        // Grab inner graphic or image source
        const innerImg = thumb.querySelector("img");
        if (innerImg) {
          mainImg.src = innerImg.src;
          mainImg.classList.remove("hidden");
          wrapper.querySelector("svg")?.remove();
        } else {
          // If svg outline is used
          const innerSvg = thumb.querySelector("svg").cloneNode(true);
          wrapper.innerHTML = "";
          wrapper.appendChild(innerSvg);
          innerSvg.classList.add("detail-main-img");
          window.GalaxyUtils.initImageZoom(wrapper, innerSvg);
        }
      });
    });

    // Local Quantity manipulation
    let localQty = 1;
    const qtyVal = document.getElementById("detail-qty-value");
    
    document.getElementById("btn-qty-minus").addEventListener("click", () => {
      if (localQty > 1) {
        localQty--;
        qtyVal.textContent = localQty;
      }
    });

    document.getElementById("btn-qty-plus").addEventListener("click", () => {
      localQty++;
      qtyVal.textContent = localQty;
    });

    // Add to Cart
    document.getElementById("btn-detail-add-cart").addEventListener("click", () => {
      this.addToCart(product.id, localQty);
    });

    // Buy Now
    document.getElementById("btn-detail-buy").addEventListener("click", () => {
      this.addToCart(product.id, localQty, false);
      window.GalaxyRouter.navigate("/checkout");
    });

    // Wishlist toggle
    const detailWishBtn = document.getElementById("btn-detail-wish");
    detailWishBtn.addEventListener("click", () => {
      this.toggleWishlist(product.id);
      let active = this.wishlist.includes(product.id);
      detailWishBtn.classList.toggle("wishlisted", active);
      
      let icon = detailWishBtn.querySelector("i");
      if (active) {
        icon.style.fill = "#C9A227";
        icon.style.stroke = "#C9A227";
      } else {
        icon.style.fill = "none";
        icon.style.stroke = "currentColor";
      }
    });
  }

  // --- 6. Render CART PAGE ---
  renderCartPage() {
    if (this.cart.length === 0) {
      this.appRoot.innerHTML = `
        <section class="py-section container text-center fade-in" style="max-width: 600px; margin: 0 auto; text-align: center;">
          <div style="border: 1px solid var(--color-border); padding: var(--spacing-xxl); border-radius: var(--border-radius);">
            <i data-lucide="shopping-bag" style="width: 64px; height: 64px; stroke-width: 1px; color: var(--color-secondary-muted); margin-bottom: var(--spacing-md);"></i>
            <h1 class="section-title" style="font-size:2rem; margin-bottom:10px;">Your Shopping Bag is Empty</h1>
            <p style="color:var(--color-secondary-muted); margin-bottom:var(--spacing-xl);">You haven't added any luxury furniture pieces yet.</p>
            <a href="/products" class="btn btn-gold">Explore Collections</a>
          </div>
        </section>
      `;
      lucide.createIcons();
      return;
    }

    this.appRoot.innerHTML = `
      <section class="py-section container fade-in">
        <div style="margin-bottom: var(--spacing-sm);">
          <button class="btn btn-outline-black btn-sm" onclick="window.history.back()"><i data-lucide="arrow-left" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;"></i> Back</button>
        </div>
        <h1 class="section-title" style="margin-bottom: var(--spacing-xl); text-align:left;">Shopping Bag</h1>
        
        <div class="cart-layout">
          <!-- Items Table -->
          <div>
            <div class="cart-table-wrapper">
              <table class="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="cart-page-tbody">
                  <!-- Injected dynamically -->
                </tbody>
              </table>
            </div>

            <div class="cart-actions-row">
              <form class="coupon-form" id="cart-coupon-form">
                <input type="text" class="form-control" id="coupon-code" placeholder="Enter Coupon Code" required>
                <button type="submit" class="btn btn-outline-black btn-sm">Apply Code</button>
              </form>
              <a href="/products" class="btn btn-outline-gold btn-sm"><i data-lucide="arrow-left" style="width:12px;height:12px;margin-right:5px;"></i> Continue Shopping</a>
            </div>
          </div>

          <!-- Checkout Card -->
          <div class="cart-summary-card">
            <h3>Summary</h3>
            <table class="summary-table">
              <tbody>
                <tr>
                  <td class="summary-label">Bag Subtotal</td>
                  <td class="summary-value" id="cart-page-subtotal">₹0.00</td>
                </tr>
                <tr>
                  <td class="summary-label">Shipping Surcharge</td>
                  <td class="summary-value" style="color:var(--color-success);" id="cart-page-shipping">FREE</td>
                </tr>
                <tr class="total-row">
                  <td>Grand Total</td>
                  <td id="cart-page-grandtotal">₹0.00</td>
                </tr>
              </tbody>
            </table>
            <a href="/checkout" class="btn btn-gold btn-block">Proceed To Checkout</a>
          </div>
        </div>
      </section>
    `;

    lucide.createIcons();

    // Render table rows
    this.renderCartPageRows();

    // Coupon logic
    const couponForm = document.getElementById("cart-coupon-form");
    couponForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let code = document.getElementById("coupon-code").value.trim().toUpperCase();
      let gd_coupons = JSON.parse(localStorage.getItem("gd_coupons") || "[]");
      let matched = gd_coupons.find(c => c.code === code);
      if (matched) {
        window.GalaxyUtils.showToast(`Coupon ${code} applied! ${matched.discount}% discount subtracted from Subtotal.`);
        this.applyDiscount(matched.discount / 100);
      } else {
        window.GalaxyUtils.showToast("Invalid promo coupon code.", "error");
      }
    });
  }

  renderCartPageRows() {
    const tbody = document.getElementById("cart-page-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.cart.map(item => {
      let p = item.product;
      let cost = p.offerPrice || p.price;
      return `
        <tr class="cart-page-row" data-id="${p.id}">
          <td>
            <div class="cart-product-cell">
              ${this.renderProductImageHTML(p, "cart-product-img")}
              <div class="cart-product-info">
                <h3><a href="/product/${p.id}">${p.name}</a></h3>
                <p>Category: ${this.getCategoryName(p.category)}</p>
              </div>
            </div>
          </td>
          <td class="cart-product-price">${window.GalaxyUtils.formatCurrency(cost)}</td>
          <td>
            <div class="qty-input-group">
              <button class="qty-btn btn-minus" aria-label="Subtract"><i data-lucide="minus" style="width:12px;height:12px;"></i></button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn btn-plus" aria-label="Add"><i data-lucide="plus" style="width:12px;height:12px;"></i></button>
            </div>
          </td>
          <td class="cart-subtotal-cell">${window.GalaxyUtils.formatCurrency(cost * item.quantity)}</td>
          <td>
            <button class="remove-cart-item" aria-label="Remove Product"><i data-lucide="trash-2" style="width:18px;height:18px;"></i></button>
          </td>
        </tr>
      `;
    }).join("");

    lucide.createIcons();

    // Bind events to table elements
    tbody.querySelectorAll(".cart-page-row").forEach(rowEl => {
      let id = rowEl.getAttribute("data-id");
      let item = this.cart.find(c => c.product.id === id);

      rowEl.querySelector(".btn-minus").addEventListener("click", () => {
        this.updateCartQuantity(id, item.quantity - 1);
        this.renderCartPage(); // Rerender
      });
      rowEl.querySelector(".btn-plus").addEventListener("click", () => {
        this.updateCartQuantity(id, item.quantity + 1);
        this.renderCartPage(); // Rerender
      });
      rowEl.querySelector(".remove-cart-item").addEventListener("click", () => {
        this.removeFromCart(id);
        this.renderCartPage(); // Rerender
      });
    });

    this.calculateCartTotals();
  }

  calculateCartTotals(discountPercent = 0.0) {
    let subtotal = this.cart.reduce((sum, item) => sum + ((item.product.offerPrice || item.product.price) * item.quantity), 0);

    const subEl = document.getElementById("cart-page-subtotal");
    const shippingEl = document.getElementById("cart-page-shipping");
    const grandEl = document.getElementById("cart-page-grandtotal");

    if (subEl) subEl.textContent = window.GalaxyUtils.formatCurrency(subtotal);
    if (shippingEl) {
      // For cart page, let's assume standard shipping logic (e.g. free over 100000, else 2000 per item)
      let totalShipping = this.cart.reduce((sum, item) => sum + ((item.product.shipping || 0) * item.quantity), 0);
      shippingEl.textContent = totalShipping > 0 ? window.GalaxyUtils.formatCurrency(totalShipping) : "FREE";
      shippingEl.style.color = totalShipping > 0 ? "inherit" : "var(--color-success)";
    }
    if (grandEl) {
      let totalShipping = this.cart.reduce((sum, item) => sum + ((item.product.shipping || 0) * item.quantity), 0);
      let total = subtotal - (subtotal * (discountPercent/100)) + totalShipping;
      grandEl.innerHTML = `${window.GalaxyUtils.formatCurrency(total)}`;
    }
  }

  applyDiscount(percent) {
    this.calculateCartTotals(percent);
  }

  // --- 7. Render CHECKOUT PAGE ---
  renderCheckoutPage() {
    if (this.cart.length === 0) {
      window.GalaxyRouter.navigate("/cart");
      return;
    }

    let subtotal = this.cart.reduce((sum, item) => sum + ((item.product.offerPrice || item.product.price) * item.quantity), 0);
    let totalShipping = this.cart.reduce((sum, item) => sum + ((item.product.shipping || 0) * item.quantity), 0);
    let discountAmt = 0;
    let discountPercent = 0;
    let appliedPromoStr = "";
    
    // We will inject a dynamic render function for the summary section
    let renderSummary = () => {
      let total = subtotal - discountAmt + totalShipping;
      
      
      document.getElementById("checkout-subtotal-val").textContent = window.GalaxyUtils.formatCurrency(subtotal);
      
      let shipEl = document.getElementById("checkout-shipping-val");
      shipEl.textContent = totalShipping > 0 ? window.GalaxyUtils.formatCurrency(totalShipping) : "FREE";
      shipEl.style.color = totalShipping > 0 ? "inherit" : "var(--color-success)";
      
      let discEl = document.getElementById("checkout-discount-row");
      if (discountAmt > 0) {
        discEl.style.display = "table-row";
        document.getElementById("checkout-discount-val").textContent = "-" + window.GalaxyUtils.formatCurrency(discountAmt);
      } else {
        discEl.style.display = "none";
      }
      document.getElementById("checkout-grandtotal-val").innerHTML = `${window.GalaxyUtils.formatCurrency(total)}`;
    };

    this.appRoot.innerHTML = `
      <section class="py-section container fade-in">
        <div style="margin-bottom: var(--spacing-sm);">
          <button class="btn btn-outline-black btn-sm" onclick="window.history.back()"><i data-lucide="arrow-left" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;"></i> Back</button>
        </div>
        <h1 class="section-title" style="margin-bottom: var(--spacing-xl); text-align:left;">Secure Checkout</h1>
        
        <div class="checkout-layout">
          <!-- Customer Details & Billing -->
          <form id="checkout-form" class="contact-form-wrapper" style="box-shadow:none;">
            <div class="checkout-section-title">1. Shipping & Customer Details</div>
            
            <div class="checkout-form-grid">
              <div class="form-group">
                <label for="ch-fname">First Name</label>
                <input type="text" id="ch-fname" class="form-control" placeholder="Enter First name" required>
              </div>
              <div class="form-group">
                <label for="ch-lname">Last Name</label>
                <input type="text" id="ch-lname" class="form-control" placeholder="Enter Last name" required>
              </div>
              <div class="form-group grid-col-full">
                <label for="ch-address">Delivery Address</label>
                <input type="text" id="ch-address" class="form-control" placeholder="Flat No., Street, Area details" required>
              </div>
              <div class="form-group">
                <label for="ch-city">City</label>
                <input type="text" id="ch-city" class="form-control" value="Erode" required>
              </div>
              <div class="form-group">
                <label for="ch-pincode">Pincode</label>
                <input type="text" id="ch-pincode" class="form-control" placeholder="638056" required maxlength="6" minlength="6" pattern="[0-9]{6}" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);">
              </div>
              <div class="form-group">
                <label for="ch-phone">Phone Number</label>
                <input type="tel" id="ch-phone" class="form-control" placeholder="8608738393" required maxlength="10" minlength="10" pattern="[0-9]{10}" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);">
              </div>
              <div class="form-group">
                <label for="ch-email">Email Address</label>
                <input type="email" id="ch-email" class="form-control" placeholder="customer@gmail.com" required>
              </div>
            </div>

            <div class="checkout-section-title" style="margin-top:var(--spacing-xl);">2. Payment Method</div>
            <div class="payment-methods">
              <label class="payment-method-option selected" id="method-cod">
                <input type="radio" name="pay-method" value="COD" checked>
                <div class="payment-method-details">
                  <h4>Cash on Delivery (COD)</h4>
                  <p>Pay cash when we safely deliver and set up furniture at your location.</p>
                </div>
              </label>
              <label class="payment-method-option" id="method-online">
                <input type="radio" name="pay-method" value="ONLINE">
                <div class="payment-method-details">
                  <h4>Pay Online (UPI / Card / Net Banking)</h4>
                  <p>Pay securely via Razorpay — UPI, debit/credit cards, wallets, and net banking.</p>
                </div>
              </label>
            </div>

            <button type="submit" class="btn btn-gold btn-block btn-lg" style="margin-top: var(--spacing-lg);">Confirm Order (₹${subtotal.toLocaleString()})</button>
          </form>

          <!-- Order Summary Card -->
          <div class="cart-summary-card">
            <h3 style="border-bottom: 1px solid var(--color-border); padding-bottom:5px;">Order Summary</h3>
            
            <div class="checkout-items-list">
              ${this.cart.map(item => `
                <div class="checkout-item-row">
                  <span class="checkout-item-name">${item.product.name} (x${item.quantity})</span>
                  <span class="checkout-item-price">${window.GalaxyUtils.formatCurrency((item.product.offerPrice || item.product.price) * item.quantity)}</span>
                </div>
              `).join("")}
            </div>

            <form id="checkout-coupon-form" style="display:flex; gap:0.5rem; margin-bottom: 1.5rem; margin-top: 1rem;">
              <input type="text" id="ch-coupon-code" class="form-control" placeholder="Promo Code" required>
              <button type="submit" class="btn btn-black btn-sm">Apply</button>
            </form>

            <table class="summary-table" style="margin-bottom: 0;">
              <tbody>
                <tr>
                  <td class="summary-label">Items Total</td>
                  <td class="summary-value" id="checkout-subtotal-val"></td>
                </tr>
                <tr id="checkout-discount-row" style="display:none; color: var(--color-gold);">
                  <td class="summary-label">Promo Discount</td>
                  <td class="summary-value" id="checkout-discount-val"></td>
                </tr>
                <tr>
                  <td class="summary-label">Shipping Surcharge</td>
                  <td class="summary-value" id="checkout-shipping-val"></td>
                </tr>
                <tr class="total-row">
                  <td>Grand Total</td>
                  <td style="color:var(--color-accent); font-weight:700;" id="checkout-grandtotal-val"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    lucide.createIcons();
    renderSummary();

    const chCouponForm = document.getElementById("checkout-coupon-form");
    if (chCouponForm) {
      chCouponForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let code = document.getElementById("ch-coupon-code").value.trim().toUpperCase();
        let gd_coupons = JSON.parse(localStorage.getItem("gd_coupons") || "[]");
        let matched = gd_coupons.find(c => c.code === code);
        if (matched) {
          window.GalaxyUtils.showToast(`Coupon ${code} applied! ${matched.discount}% discount.`);
          discountPercent = matched.discount / 100;
          discountAmt = subtotal * discountPercent;
          appliedPromoStr = code;
          renderSummary();
        } else {
          window.GalaxyUtils.showToast("Invalid promo coupon code.", "error");
        }
      });
    }

    // Toggle Payment selection visuals
    const rCod = document.getElementById("method-cod");
    const rOnline = document.getElementById("method-online");
    const optCod = rCod.querySelector('input[value="COD"]');
    const optOnline = rOnline.querySelector('input[value="ONLINE"]');

    optCod.addEventListener("change", () => {
      rCod.classList.add("selected");
      rOnline.classList.remove("selected");
    });

    optOnline.addEventListener("change", () => {
      rOnline.classList.add("selected");
      rCod.classList.remove("selected");
    });

    // Handle Order Confirmation Form Submit
    const chForm = document.getElementById("checkout-form");
    if (chForm) {
      window.setupPhoneField(document.getElementById("ch-phone"));
      chForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const phoneVal = document.getElementById("ch-phone").value.trim();
        const digitsOnly = phoneVal.replace(/[^0-9]/g, "");
        if (phoneVal.startsWith("+")) {
          if (digitsOnly.length < 7) {
            window.GalaxyUtils.showToast("Foreign phone number must have at least 7 digits.", "error");
            return;
          }
        } else {
          if (digitsOnly.length < 10) {
            window.GalaxyUtils.showToast("Local phone number must be exactly 10 digits.", "error");
            return;
          }
        }

        let payMethod = chForm.querySelector('input[name="pay-method"]:checked').value;
        let orderDetails = {
          orderId: "GD-" + Math.floor(100000 + Math.random() * 900000),
          name: document.getElementById("ch-fname").value + " " + document.getElementById("ch-lname").value,
          phone: phoneVal,
          email: document.getElementById("ch-email").value,
          address: document.getElementById("ch-address").value + ", " + document.getElementById("ch-city").value + " - " + document.getElementById("ch-pincode").value,
          items: this.cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.offerPrice || item.product.price,
            shipping: item.product.shipping || 0
          })),
          subtotal: subtotal,
          totalShipping: totalShipping,
          promoDiscount: discountAmt,
          appliedPromo: appliedPromoStr,
          total: (subtotal - discountAmt + totalShipping),
          payment: payMethod,
          paymentStatus: payMethod === "COD" ? "Pending" : "Paid",
          orderStatus: "New",
          date: new Date().toLocaleString(),
          history: [{ status: "New", date: new Date().toLocaleString(), note: "Order placed via website." }]
        };

        if (payMethod === "ONLINE") {
          // ============================================
          // SECURE RAZORPAY PAYMENT FLOW
          // Step 1: Ask backend to create a Razorpay Order
          // Step 2: Open Razorpay Checkout with the order_id
          // Step 3: On success, send payment data to backend for verification
          // Step 4: Only finalize order after server confirms payment is genuine
          // ============================================

          const submitBtn = chForm.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.textContent = "Processing...";

          try {
            const apiBase = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';
            // Step 1: Create order on the server with cart items for server-side validation
            const createOrderResponse = await fetch(`${apiBase}/payment/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: orderDetails.total,           // Amount in rupees
                items: orderDetails.items,            // Cart items array for server price verification
                couponCode: this.appliedPromo ? this.appliedPromo.code : null, // Active coupon code if any
                receipt: orderDetails.orderId,        // Our internal order ID as receipt
                notes: {
                  customer_name: orderDetails.name,
                  customer_phone: orderDetails.phone
                }
              })
            });

            if (!createOrderResponse.ok) {
              const errorData = await createOrderResponse.json();
              throw new Error(errorData.error || 'Failed to create payment order.');
            }

            const razorpayOrder = await createOrderResponse.json();

            // Step 2: Open Razorpay Checkout with the server-created order
            const rzpOptions = {
              "key": razorpayOrder.key_id,
              "amount": razorpayOrder.amount,           // Already in paise from server
              "currency": razorpayOrder.currency,
              "name": "Galaxy Decor",
              "description": "Furniture Showroom Purchase",
              "image": "/assets/logo.png",
              "order_id": razorpayOrder.order_id,       // This links payment to our server order
              "handler": async (response) => {
                // Step 3: Payment completed on Razorpay — now verify on our server
                try {
                  const verifyResponse = await fetch(`${apiBase}/payment/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      orderDetails: orderDetails
                    })
                  });

                  const verifyResult = await verifyResponse.json();

                  if (verifyResponse.ok && verifyResult.verified) {
                    // Step 4: Payment verified — finalize the order
                    orderDetails.paymentStatus = "Paid";
                    orderDetails.paymentDetails = {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id
                    };
                    this.finalizeOrder(orderDetails);
                  } else {
                    window.GalaxyUtils.showToast(
                      "Payment verification failed. Please contact us if money was deducted.",
                      "error"
                    );
                  }
                } catch (verifyError) {
                  console.error("Payment verification error:", verifyError);
                  window.GalaxyUtils.showToast(
                    "Could not verify payment. Please contact us with your payment ID.",
                    "error"
                  );
                }

                submitBtn.disabled = false;
                submitBtn.textContent = `Confirm Order (₹${orderDetails.total.toLocaleString()})`;
              },
              "modal": {
                "ondismiss": () => {
                  // User closed the Razorpay popup without paying
                  submitBtn.disabled = false;
                  submitBtn.textContent = `Confirm Order (₹${orderDetails.total.toLocaleString()})`;
                  window.GalaxyUtils.showToast("Payment was cancelled.", "info");
                }
              },
              "theme": {
                "color": "#C9A227"
              },
              "prefill": {
                "name": orderDetails.name,
                "email": orderDetails.email,
                "contact": orderDetails.phone
              }
            };

            const rzp = new Razorpay(rzpOptions);
            rzp.open();

          } catch (error) {
            console.error("Razorpay order creation error:", error);
            window.GalaxyUtils.showToast(
              error.message || "Failed to start online payment. Please try Cash on Delivery.",
              "error"
            );
            submitBtn.disabled = false;
            submitBtn.textContent = `Confirm Order (₹${orderDetails.total.toLocaleString()})`;
          }

        } else {
          orderDetails.paymentStatus = "Pending";
          this.finalizeOrder(orderDetails);
        }
      });
    }
  }

  // Finalize order utility (saves order, clears cart, redirects)
  finalizeOrder(orderDetails) {
    try {
      let orders = JSON.parse(localStorage.getItem("gd_orders")) || [];
      orders.push(orderDetails);
      localStorage.setItem("gd_orders", JSON.stringify(orders));
      
      // Sync to real backend
      if (window.GalaxyAPI) {
        window.GalaxyAPI.syncEntity('orders', 'POST', orderDetails);
      }
    } catch (err) {
      console.error("Failed to save order to localStorage:", err);
    }
    
    sessionStorage.setItem("gd_last_order", JSON.stringify(orderDetails));
    
    this.cart = [];
    this.saveCart();

    window.GalaxyRouter.navigate("/order-success");
  }

  // --- 8. Render ORDER SUCCESS PAGE ---
  renderOrderSuccess() {
    let order = JSON.parse(sessionStorage.getItem("gd_last_order"));
    if (!order) {
      window.GalaxyRouter.navigate("/");
      return;
    }

    const orderId = order.orderId || order.id || 'GD-000000';
    const orderName = order.name || order.customerName || 'Valued Customer';
    const orderPhone = order.phone || order.customerPhone || '';
    const orderAddress = order.address || order.customerAddress || '';
    const orderTotal = order.total !== undefined ? Number(order.total) : (Number(order.totalAmount) || 0);
    const orderPayment = order.payment || (order.paymentStatus === 'Paid' ? 'Online Gateway' : 'COD');
    const orderPayStatus = order.paymentStatus || 'Pending';
    const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString());

    const cleanPhone = orderPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    
    const itemsList = (order.items || []).map(item => `- ${item.name || 'Product'} (x${item.quantity || 1})`).join("%0A");
    const billMessage = `*GALAXY DECOR - ORDER INVOICE*%0A%0A` +
                        `*Order ID:* ${orderId}%0A` +
                        `*Date:* ${orderDate}%0A%0A` +
                        `*Customer Details:*%0A` +
                        `Name: ${orderName}%0A` +
                        `Phone: ${orderPhone}%0A` +
                        `Address: ${orderAddress}%0A%0A` +
                        `*Items Ordered:*%0A${itemsList}%0A%0A` +
                        `*Total Amount:* %E2%82%B9${orderTotal.toLocaleString()}%0A` +
                        `*Payment Method:* ${orderPayment}%0A` +
                        `*Payment Status:* ${orderPayStatus}%0A%0A` +
                        `Thank you for shopping with Galaxy Decor!`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${billMessage}`;

    this.appRoot.innerHTML = `
      <section class="py-section container fade-in">
        <div class="order-success-card">
          <div class="success-icon-wrapper">
            <i data-lucide="check"></i>
          </div>
          
          <h1>Thank You For Your Order!</h1>
          <p>Your luxury selection has been successfully reserved. Our team will verify your address and coordinate transport and expert assembly.</p>

          <div class="success-details-box">
            <div class="success-details-row">
              <span>Order Number</span>
              <strong>${orderId}</strong>
            </div>
            <div class="success-details-row">
              <span>Recipient Name</span>
              <span>${orderName}</span>
            </div>
            <div class="success-details-row">
              <span>Delivery Address</span>
              <span style="max-width: 60%; text-align:right; font-size:0.75rem;">${orderAddress}</span>
            </div>
            <div class="success-details-row">
              <span>Payment Type</span>
              <span>${orderPayment === "COD" ? "Cash on Delivery" : "Online Gateway"}</span>
            </div>
            <div class="success-details-row">
              <span>Reserved Total</span>
              <strong style="color:var(--color-accent); font-size:1.1rem;">${window.GalaxyUtils.formatCurrency(orderTotal)}</strong>
            </div>
          </div>

          <div class="success-actions">
            <a href="/products" class="btn btn-gold">Back To Showroom</a>
            <a href="${whatsappUrl}" target="_blank" class="btn btn-success-wa"><i data-lucide="send" style="width:14px;height:14px;margin-right:6px;"></i> Send Bill to My WhatsApp</a>
          </div>
        </div>
      </section>
    `;

    lucide.createIcons();
  }

  // --- 9. Render WISHLIST PAGE ---
  renderWishlistPage() {
    if (this.wishlist.length === 0) {
      this.appRoot.innerHTML = `
        <section class="py-section container text-center fade-in" style="max-width: 600px; margin: 0 auto; text-align: center;">
          <div style="border: 1px solid var(--color-border); padding: var(--spacing-xxl); border-radius: var(--border-radius);">
            <i data-lucide="heart" style="width: 64px; height: 64px; stroke-width: 1px; color: var(--color-secondary-muted); margin-bottom: var(--spacing-md);"></i>
            <h1 class="section-title" style="font-size:2rem; margin-bottom:10px;">Your Wishlist is Empty</h1>
            <p style="color:var(--color-secondary-muted); margin-bottom:var(--spacing-xl);">Save items from our catalog to review or request quotes later.</p>
            <a href="/products" class="btn btn-gold">Explore Collections</a>
          </div>
        </section>
      `;
      lucide.createIcons();
      return;
    }

    let items = this.products.filter(p => this.wishlist.includes(p.id));

    this.appRoot.innerHTML = `
      <section class="py-section container fade-in">
        <h1 class="section-title" style="margin-bottom: var(--spacing-xl); text-align:left;">My Wishlist</h1>
        <div class="products-grid" id="wishlist-products-grid">
          ${items.map(p => this.renderProductCardHTML(p)).join("")}
        </div>
      </section>
    `;

    lucide.createIcons();
    this.bindProductCardEvents(document.getElementById("wishlist-products-grid"));
  }

  // --- 10. Render CONTACT PAGE ---
  renderContact() {
    this.renderHome();
    setTimeout(() => {
      const contactSec = document.querySelector(".showroom-details");
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // --- 11. Render POLICY PAGES ---
  renderPolicy(type) {
    let title = "";
    let content = "";

    if (type === "privacy") {
      title = "Privacy Policy";
      content = `
        <p>Last updated: July 17, 2026</p>
        <p>Galaxy Decor operates the showroom website to display premium imported furniture and collect consumer designs preferences enquiries. We are committed to protecting your privacy details securely.</p>
        
        <h2>1. Information We Collect</h2>
        <p>When you fill our showroom enquiry sheets or confirm checkout baskets, we collect: name, phone, address, and email coordinates. We only collect details required to organize delivery transport logistics and install structures at site.</p>
        
        <h2>2. Data Storage</h2>
        <p>Your coordinates are stored inside localized, safe CRM databases. We do not sell your personal files to third-party advert groups.</p>
      `;
    } else if (type === "terms") {
      title = "Terms & Conditions";
      content = `
        <p>Last updated: July 17, 2026</p>
        
        <h2>1. Scope of Service</h2>
        <p>Galaxy Decor provides imported furniture and custom layout project consultation. Catalog descriptions and custom estimates are subject to container import shipping adjustments, factory-direct sizing calibrations, and visual updates.</p>
        
        <h2>2. Showroom Orders</h2>
        <p>All showroom catalog reservations completed through this website serve as delivery request agreements. Sourcing payments are finalised on delivery verification or custom drawing releases.</p>
      `;
    } else if (type === "refund") {
      title = "Refund Policy";
      content = `
        <p>Last updated: July 17, 2026</p>
        
        <h2>1. Imported Furniture Checks</h2>
        <p>Since we import items directly from China and Indonesia based on selection dimensions, orders are checked at the showroom prior to dispatch. Cancellations are valid before local transportation dispatch.</p>
        
        <h2>2. Manufacturing Defect</h2>
        <p>We replace parts or correct coatings if visual cracks, structure defects or misalignment are flagged during our technicians' assembly on-site.</p>
      `;
    } else {
      title = "Shipping Policy";
      content = `
        <p>Last updated: July 17, 2026</p>
        
        <h2>1. Delivery Locations</h2>
        <p>We provide home delivery throughout Erode, Perundurai, Salem, Coimbatore, Tiruppur and surrounding regions in Tamil Nadu. Direct cargo containers can be organized for large commercial sites.</p>
        
        <h2>2. Assembly & Installation</h2>
        <p>All dining tables, modular beds, and heavy water fountains are assembled free on-site by Galaxy Decor technicians at the time of delivery.</p>
      `;
    }

    this.appRoot.innerHTML = `
      <article class="py-section container fade-in editorial-layout">
        <div style="margin-bottom: var(--spacing-md);">
          <button class="btn btn-outline-black btn-sm" onclick="window.history.back()"><i data-lucide="arrow-left" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;"></i> Back</button>
        </div>
        <h1 class="section-title" style="text-align:left;">${title}</h1>
        <span class="editorial-date">Galaxy Decor Official Sourcing Policy</span>
        <div class="editorial-content">
          ${content}
        </div>
      </article>
    `;
  }
}

// Initialize application on window load
window.addEventListener("DOMContentLoaded", () => {
  if (window.GalaxyAPI) {
    // Sync real data from backend to localStorage in the background
    // DO NOT await this, so the app boots instantly!
    window.GalaxyAPI.fetchAllData();
  }
  window.GalaxyApp = new ECommerceApp();
});

