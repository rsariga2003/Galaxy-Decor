/* ==========================================================================
   GALAXY DECOR - UTILITY ENGINE & DYNAMIC COMPONENT RENDERER
   ========================================================================== */

const Utils = {
  // 1. Currency formatter (INR)
  formatCurrency(value) {
    if (typeof value === "string") return value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  },

  // 2. Custom Toast System
  showToast(message, type = "success") {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    // Choose icon based on type
    let iconName = "check-circle";
    if (type === "error") iconName = "alert-circle";
    if (type === "info") iconName = "info";

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Trigger transition
    setTimeout(() => toast.classList.add("show"), 50);

    // Remove toast after delay
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  // 3. Tactile Button Ripple Effect Handler
  initButtonRipples() {
    document.body.addEventListener("click", function(e) {
      let button = e.target.closest(".btn");
      if (!button) return;

      // Create ripple element
      let ripple = document.createElement("span");
      ripple.classList.add("ripple-effect");
      button.appendChild(ripple);

      // Get dimensions
      let diameter = Math.max(button.clientWidth, button.clientHeight);
      let radius = diameter / 2;

      // Position ripple based on cursor
      let rect = button.getBoundingClientRect();
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      // Remove after animation finishes
      ripple.addEventListener("animationend", () => {
        ripple.remove();
      });
    });
  },

  // 4. Image zoom handler
  initImageZoom(containerEl, imgEl) {
    if (!containerEl || !imgEl) return;

    containerEl.addEventListener("mousemove", (e) => {
      const rect = containerEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      imgEl.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      imgEl.style.transform = "scale(2)";
    });

    containerEl.addEventListener("mouseleave", () => {
      imgEl.style.transform = "scale(1)";
      imgEl.style.transformOrigin = "center center";
    });
  },

  // 5. Generate luxury inline SVG mock outlines for furniture catalog
  // Renders a high-end vector silhouette when actual images are not yet loaded.
  getPremiumFurnitureSVG(category, productName) {
    let strokeColor = "#C9A227"; // gold accent
    let width = 300;
    let height = 300;
    
    // Choose drawing pattern based on category slug
    let svgPath = "";
    if (category === "living-room") {
      // Elegant minimal sofa drawing
      svgPath = `
        <!-- Main backrest -->
        <path d="M 40 140 Q 150 120 260 140 L 260 180 Q 150 170 40 180 Z" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Soft cushions -->
        <rect x="50" y="170" width="98" height="40" rx="3" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <rect x="152" y="170" width="98" height="40" rx="3" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Elegant thin armrests -->
        <path d="M 30 210 L 30 150 C 30 135 45 135 45 150 L 45 210" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <path d="M 270 210 L 270 150 C 270 135 255 135 255 150 L 255 210" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Bottom base -->
        <line x1="45" y1="210" x2="255" y2="210" stroke="${strokeColor}" stroke-width="2" />
        <!-- Luxury thin gold legs -->
        <line x1="60" y1="210" x2="50" y2="235" stroke="${strokeColor}" stroke-width="2" />
        <line x1="240" y1="210" x2="250" y2="235" stroke="${strokeColor}" stroke-width="2" />
      `;
    } else if (category === "dining") {
      // Marble dining table and sleek chairs layout
      svgPath = `
        <!-- Table top with thick elegant bevel -->
        <rect x="60" y="150" width="180" height="12" rx="2" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Premium modern geometric steel leg setup -->
        <path d="M 100 162 L 70 230 L 230 230 L 200 162 Z" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <line x1="150" y1="162" x2="150" y2="230" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3,3" />
        <!-- Floor base support plate -->
        <line x1="65" y1="230" x2="235" y2="230" stroke="${strokeColor}" stroke-width="2" />
        <!-- Minimal Chairs shadows -->
        <path d="M 40 180 L 50 180 L 50 230" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.4" />
        <path d="M 260 180 L 250 180 L 250 230" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.4" />
      `;
    } else if (category === "bedroom") {
      // Luxury wingback bed outline
      svgPath = `
        <!-- Tufted high Headboard -->
        <rect x="50" y="80" width="200" height="90" rx="4" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Headboard luxury tufting diamond guide lines -->
        <path d="M 50 110 L 250 110 M 50 140 L 250 140 M 100 80 L 100 170 M 150 80 L 150 170 M 200 80 L 200 170" fill="none" stroke="${strokeColor}" stroke-width="0.5" opacity="0.3" />
        <!-- Mattress and bedframe base -->
        <rect x="60" y="170" width="180" height="35" rx="3" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Folded cozy duvet line -->
        <path d="M 60 180 C 120 175 180 175 240 180 L 240 205 L 60 205 Z" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.5" />
        <!-- Plump bedroom pillows -->
        <rect x="75" y="152" width="45" height="18" rx="2" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <rect x="180" y="152" width="45" height="18" rx="2" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <!-- Bed legs -->
        <line x1="70" y1="205" x2="65" y2="225" stroke="${strokeColor}" stroke-width="2" />
        <line x1="230" y1="205" x2="235" y2="225" stroke="${strokeColor}" stroke-width="2" />
      `;
    } else if (category === "office") {
      // Sleek leadership wood desk
      svgPath = `
        <!-- Desktop wood panel -->
        <rect x="40" y="140" width="220" height="15" rx="1" fill="none" stroke="${strokeColor}" stroke-width="1.8" />
        <!-- Solid wooden cabinets bases -->
        <rect x="55" y="155" width="45" height="60" fill="none" stroke="${strokeColor}" stroke-width="1.2" />
        <rect x="200" y="155" width="45" height="60" fill="none" stroke="${strokeColor}" stroke-width="1.2" />
        <!-- Cabinet drawers lines and gold pull handles -->
        <line x1="55" y1="175" x2="100" y2="175" stroke="${strokeColor}" stroke-width="1" />
        <line x1="55" y1="195" x2="100" y2="195" stroke="${strokeColor}" stroke-width="1" />
        <circle cx="77" cy="167" r="2" fill="${strokeColor}" />
        <circle cx="77" cy="185" r="2" fill="${strokeColor}" />
        <circle cx="77" cy="205" r="2" fill="${strokeColor}" />
        <!-- Opposite drawer handles -->
        <circle cx="222" cy="185" r="2" fill="${strokeColor}" />
        <!-- Center knee recess opening frame -->
        <path d="M 100 155 L 100 215 L 200 215 L 200 155" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.3" />
      `;
    } else if (category === "fountains") {
      // Ambient cascading water fountain
      svgPath = `
        <!-- Tall rock sculpture backdrop -->
        <path d="M 100 230 C 80 150 110 80 150 80 C 190 80 220 150 200 230 Z" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="4,4" />
        <!-- Cascade plates -->
        <path d="M 120 120 Q 150 125 180 120" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <path d="M 105 160 Q 150 168 195 160" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <path d="M 95 200 Q 150 210 205 200" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <!-- Flowing liquid streams -->
        <path d="M 150 125 L 150 160 M 130 163 L 130 200 M 170 163 L 170 200" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="5,3" opacity="0.6" />
        <!-- Heavy water basin pool -->
        <ellipse cx="150" cy="230" rx="70" ry="18" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <!-- Basin highlights -->
        <ellipse cx="150" cy="234" rx="60" ry="12" fill="none" stroke="${strokeColor}" stroke-width="0.8" opacity="0.5" />
      `;
    } else if (category === "center-tables" || category === "tea-poys") {
      // Elegant circular nesting center tables
      svgPath = `
        <!-- Large Table Top -->
        <ellipse cx="120" cy="150" rx="65" ry="18" fill="none" stroke="${strokeColor}" stroke-width="1.8" />
        <!-- Large Table Legs -->
        <path d="M 70 160 Q 90 220 120 220 M 170 160 Q 150 220 120 220" fill="none" stroke="${strokeColor}" stroke-width="1.2" />
        <line x1="120" y1="220" x2="120" y2="230" stroke="${strokeColor}" stroke-width="2" />
        
        <!-- Small Nesting Table Top (Offset and overlapping in background) -->
        <ellipse cx="190" cy="175" rx="45" ry="13" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Small Table Legs -->
        <path d="M 160 183 L 170 225 M 220 183 L 210 225" fill="none" stroke="${strokeColor}" stroke-width="1" />
      `;
    } else if (category === "showpieces") {
      // Modern sculpture (e.g. ginkgo leaf)
      svgPath = `
        <!-- Gold organic abstract ring structure -->
        <circle cx="150" cy="140" r="45" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Internal branch art detailing -->
        <path d="M 150 185 Q 140 140 165 110 M 150 160 Q 170 140 145 125" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Sleek support rod -->
        <line x1="150" y1="185" x2="150" y2="225" stroke="${strokeColor}" stroke-width="2" />
        <!-- Solid dark marble base frame -->
        <rect x="110" y="225" width="80" height="20" rx="1" fill="none" stroke="${strokeColor}" stroke-width="2" />
      `;
    } else if (category === "vases") {
      // Luxury tall vase outline
      svgPath = `
        <!-- Vase body silhouette -->
        <path d="M 125 100 C 125 100 100 130 100 180 C 100 225 120 240 150 240 C 180 240 200 225 200 180 C 200 130 175 100 175 100 Z" fill="none" stroke="${strokeColor}" stroke-width="1.8" />
        <!-- Flared gold top lip -->
        <ellipse cx="150" cy="100" rx="25" ry="6" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <!-- Vase ribbed vertical surface lines -->
        <path d="M 140 105 Q 125 160 130 238 M 150 106 L 150 240 M 160 105 Q 175 160 170 238" fill="none" stroke="${strokeColor}" stroke-width="0.8" opacity="0.4" />
        <!-- Dried botanical decor branches sticking out -->
        <path d="M 150 100 Q 130 50 90 40 M 150 100 Q 150 40 170 30 M 150 100 Q 165 60 210 50" fill="none" stroke="${strokeColor}" stroke-width="1.2" opacity="0.6" />
      `;
    } else {
      // General luxury abstract outline placeholder for other categories
      svgPath = `
        <!-- Luxury Diamond Box outline -->
        <polygon points="150,60 240,110 240,210 150,260 60,210 60,110" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3,3" />
        <polygon points="150,80 220,120 220,200 150,240 80,200 80,120" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <!-- Brand Initials GD inside the box -->
        <text x="150" y="165" font-family="${varToString(document.body, '--font-serif')}" font-size="28" font-weight="300" fill="${strokeColor}" text-anchor="middle" letter-spacing="4">GD</text>
        <circle cx="150" cy="160" r="35" fill="none" stroke="${strokeColor}" stroke-width="0.5" opacity="0.5" />
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="shimmer-svg" style="width:100%; height:100%; background: radial-gradient(circle, #fcfcfc 60%, #f3f3f3 100%);">
        <!-- Elegant subtle thin circular borders for backdrop -->
        <circle cx="150" cy="150" r="120" fill="none" stroke="#e8e8e8" stroke-width="0.5" />
        <circle cx="150" cy="150" r="95" fill="none" stroke="#f0f0f0" stroke-width="0.5" />
        
        <!-- Render path based on category -->
        ${svgPath}
        
        <!-- Subtle branding text at the bottom -->
        <text x="150" y="280" font-family="'Inter', sans-serif" font-size="7" font-weight="500" fill="#999999" text-anchor="middle" letter-spacing="1.5">GALAXY DECOR • IMPORTED</text>
      </svg>
    `;
  },

  processLogoBackground(imgSrc, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Loop through pixels to make background transparent
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let diff = max - min;
        
        // Background is charcoal grey: dark and low saturation
        if (max < 85 && diff < 15) {
          data[i + 3] = 0; // set transparent
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      try {
        callback(canvas.toDataURL("image/png"));
      } catch (e) {
        console.error("Canvas toDataURL failed:", e);
      }
    };
  }
};

// Simple helper to safely extract font family fallback
function varToString(element, varName) {
  return getComputedStyle(element).getPropertyValue(varName).trim() || 'serif';
}

window.GalaxyUtils = Utils;
