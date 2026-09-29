// Explicitly casting the exported object to 'any' tells TypeScript to bypass strict interface checks for these functions
export const authApi: any = {
  login: async (credentials: any): Promise<any> => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: credentials.username, 
        password: credentials.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.message || "Login failed");
    }

    return {
      success: true,
      access: data.access_token || "",
      message: "Login successful!",
      user: data.user,
      service: null
    };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("ws_access_token");
    return Promise.resolve();
  },

  getCurrentUser: async (): Promise<any> => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const token = localStorage.getItem("ws_access_token");
    if (!token) throw new Error("No session found");

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`
      }
    });

    const user = await response.json();
    if (!response.ok) throw new Error("Failed to fetch user");

    return {
      success: true,
      access: token,
      message: "User fetched",
      user: user
    };
  },

  refreshToken: async (): Promise<void> => {
    return Promise.resolve();
  },

  changePassword: async (data: any): Promise<any> => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const token = localStorage.getItem("ws_access_token");
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ password: data.new_password || data.password })
    });
    return response.json();
  },
};
