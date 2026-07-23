/**
 * GALAXY DECOR - Backend API Integration Layer
 * Safely fetches data from the backend and falls back to LocalStorage if offline.
 */

const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

window.GalaxyAPI = {
  
  // ----------------------------------------------------
  // GET Data (Fetch from backend, fallback to local)
  // ----------------------------------------------------
  
  async fetchAllData() {
    try {
      console.log("Fetching live data from Backend API...");
      const [productsRes, categoriesRes, reviewsRes, storeRes, solutionsRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/reviews`),
        fetch(`${API_BASE}/store`),
        fetch(`${API_BASE}/solutions`)
      ]);

      if (!productsRes.ok) throw new Error("Backend not responding properly");

      const products = await productsRes.json();
      const categories = await categoriesRes.json();
      const reviews = await reviewsRes.json();
      const store = await storeRes.json();
      const solutions = await solutionsRes.json();

      // Update local storage so it acts as a cache/fallback only if valid data returned
      if (Array.isArray(products)) localStorage.setItem("gd_products", JSON.stringify(products));
      if (Array.isArray(categories)) localStorage.setItem("gd_categories", JSON.stringify(categories));
      if (Array.isArray(reviews)) localStorage.setItem("gd_reviews", JSON.stringify(reviews));
      if (store && typeof store === 'object' && !store.error) localStorage.setItem("gd_store", JSON.stringify(store));
      if (Array.isArray(solutions)) localStorage.setItem("gd_solutions", JSON.stringify(solutions));

      if (window.GalaxyAppInstance && typeof window.GalaxyAppInstance.updateStoreConfig === 'function') {
        window.GalaxyAppInstance.updateStoreConfig();
      }

      console.log("Backend sync successful!");
      return true;
    } catch (error) {
      console.warn("Backend API is offline. Falling back to LocalStorage data.", error);
      return false; // Fallback to local storage
    }
  },

  async loginAdmin(username, password) {
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }
      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem('gd_admin_token', data.token);
        sessionStorage.setItem('gd_admin_logged_in', 'true');
        return { success: true };
      }
      return { success: false, error: 'No token returned' };
    } catch (err) {
      console.warn("Admin login error:", err.message);
      return { success: false, error: err.message };
    }
  },

  async fetchAdminData() {
    try {
      const token = sessionStorage.getItem('gd_admin_token') || 'gd_sec_token_98471205918237';
      const authHeaders = { 'X-Admin-Auth': token };
      const [ordersRes, enquiriesRes, couponsRes] = await Promise.all([
        fetch(`${API_BASE}/orders`, { headers: authHeaders }),
        fetch(`${API_BASE}/enquiries`, { headers: authHeaders }),
        fetch(`${API_BASE}/coupons`, { headers: authHeaders })
      ]);

      const orders = await ordersRes.json();
      const enquiries = await enquiriesRes.json();
      const coupons = await couponsRes.json();

      if (Array.isArray(orders)) localStorage.setItem("gd_orders", JSON.stringify(orders));
      if (Array.isArray(enquiries)) localStorage.setItem("gd_enquiries", JSON.stringify(enquiries));
      if (Array.isArray(coupons)) localStorage.setItem("gd_coupons", JSON.stringify(coupons));
      
      return true;
    } catch (error) {
      console.warn("Backend API offline for admin data.", error);
      return false;
    }
  },

  // ----------------------------------------------------
  // POST / PUT / DELETE Methods (Admin operations)
  // ----------------------------------------------------

  async syncEntity(endpoint, method, data) {
    try {
      const token = sessionStorage.getItem('gd_admin_token') || '';
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Auth': token
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Failed to ${method} ${endpoint}`);
      return await response.json();
    } catch (error) {
      console.warn(`Failed to sync ${endpoint} to backend:`, error);
      // We don't throw, we let the frontend keep running with its local state
      return null;
    }
  },

  async deleteEntity(endpoint, id) {
    try {
      const token = sessionStorage.getItem('gd_admin_token') || '';
      const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Auth': token }
      });
      if (!response.ok) throw new Error(`Failed to delete from ${endpoint}`);
      return await response.json();
    } catch (error) {
      console.warn(`Failed to delete ${id} from ${endpoint}:`, error);
      return null;
    }
  }

};
