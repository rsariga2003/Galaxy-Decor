/**
 * GALAXY DECOR - Backend API Integration Layer
 * Safely fetches data from the backend and falls back to LocalStorage if offline.
 */

const API_BASE = 'http://localhost:5000/api';

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

      // Update local storage so it acts as a cache/fallback
      localStorage.setItem("gd_products", JSON.stringify(products));
      localStorage.setItem("gd_categories", JSON.stringify(categories));
      localStorage.setItem("gd_reviews", JSON.stringify(reviews));
      localStorage.setItem("gd_store", JSON.stringify(store));
      localStorage.setItem("gd_solutions", JSON.stringify(solutions));

      console.log("Backend sync successful!");
      return true;
    } catch (error) {
      console.warn("Backend API is offline. Falling back to LocalStorage data.", error);
      return false; // Fallback to local storage
    }
  },

  async fetchAdminData() {
    try {
      const [ordersRes, enquiriesRes, couponsRes] = await Promise.all([
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/enquiries`),
        fetch(`${API_BASE}/coupons`)
      ]);

      const orders = await ordersRes.json();
      const enquiries = await enquiriesRes.json();
      const coupons = await couponsRes.json();

      localStorage.setItem("gd_orders", JSON.stringify(orders));
      localStorage.setItem("gd_enquiries", JSON.stringify(enquiries));
      localStorage.setItem("gd_coupons", JSON.stringify(coupons));
      
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
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Failed to delete from ${endpoint}`);
      return await response.json();
    } catch (error) {
      console.warn(`Failed to delete ${id} from ${endpoint}:`, error);
      return null;
    }
  }

};
