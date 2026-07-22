/* ==========================================================================
   GALAXY DECOR - CLIENT SIDE HISTORY API ROUTER
   ========================================================================== */

class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    
    // Bind popstate event for browser back/forward
    window.addEventListener("popstate", () => this.handleRouting());
    window.addEventListener("load", () => this.handleRouting());
    
    // Intercept all internal anchor clicks
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && link.getAttribute("href") && link.getAttribute("href").startsWith("/")) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });
  }

  // Programmatic navigation
  navigate(path) {
    window.history.pushState(null, "", path);
    this.handleRouting();
  }

  // Define route mapping to action handler
  on(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  // Parse path and handle page routing
  handleRouting() {
    // Get full path (e.g. /contact?search=sofa)
    let fullPath = window.location.pathname + window.location.search;
    
    // Separate path from query parameters
    let [pathWithParam, queryString] = fullPath.split("?");
    if (!pathWithParam) pathWithParam = "/";
    
    // Parse query parameters into key-value map
    let queryParams = {};
    if (queryString) {
      queryString.split("&").forEach(param => {
        let [key, val] = param.split("=");
        queryParams[decodeURIComponent(key)] = decodeURIComponent(val || "");
      });
    }

    // Resolve path matched
    let resolvedRoute = this.resolve(pathWithParam);
    
    // Close mobile menu sidebar overlay & cart drawer upon routing
    if (window.GalaxyApp) {
      window.GalaxyApp.closeMobileSidebar();
      window.GalaxyApp.closeCartDrawer();
      window.GalaxyApp.closeSearchDropdown();
      window.GalaxyApp.closeQuickView();
      if (window.GalaxyApp.heroInterval) {
        clearInterval(window.GalaxyApp.heroInterval);
        window.GalaxyApp.heroInterval = null;
      }
    }

    if (resolvedRoute) {
      this.currentPage = resolvedRoute.name;
      
      // Update header links state
      this.updateActiveNavLinks(resolvedRoute.name);
      
      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Call matched route handler
      resolvedRoute.handler(resolvedRoute.params, queryParams);

      // Notify global listeners (Lucide icon re-init, animations etc.)
      document.dispatchEvent(new CustomEvent("app:pageRendered", { detail: { page: resolvedRoute.name } }));
    } else {
      console.warn("Route not found: " + pathWithParam);
      // Redirect to homepage if route not found
      if (pathWithParam !== "/") {
        this.navigate("/");
      }
    }
  }

  // Resolve matching routes (supports simple parameter placeholders like :id)
  resolve(hashPath) {
    // Trim lead/trail slashes
    let path = hashPath;
    if (!path.startsWith("/")) path = "/" + path;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    // Try exact match first
    if (this.routes[path]) {
      return { name: this.getRouteName(path), handler: this.routes[path], params: {} };
    }

    // Try parameter matching (e.g. /product/:id)
    for (let registeredRoute in this.routes) {
      if (registeredRoute.includes("/:")) {
        let routeParts = registeredRoute.split("/");
        let pathParts = path.split("/");

        if (routeParts.length === pathParts.length) {
          let params = {};
          let isMatch = true;

          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
              let paramName = routeParts[i].slice(1);
              params[paramName] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              isMatch = false;
              break;
            }
          }

          if (isMatch) {
            return {
              name: this.getRouteName(registeredRoute),
              handler: this.routes[registeredRoute],
              params: params
            };
          }
        }
      }
    }

    return null;
  }

  // Convert route path to a cleaner page name string
  getRouteName(path) {
    if (path === "/") return "home";
    if (path.startsWith("/product/")) return "product-detail";
    return path.replace(/^\//, "");
  }

  // Highlights active page link in header and mobile sidebars
  updateActiveNavLinks(pageName) {
    // Handle specific groupings (like product detail showing shop active)
    let groupName = pageName;
    if (pageName === "product-detail") groupName = "products";

    // Desktop
    document.querySelectorAll(".desktop-nav .nav-link").forEach(link => {
      if (link.getAttribute("data-page") === groupName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Mobile
    document.querySelectorAll(".mobile-nav .mobile-nav-link").forEach(link => {
      if (link.getAttribute("data-page") === groupName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

// Instantiate global router
window.GalaxyRouter = new Router();
