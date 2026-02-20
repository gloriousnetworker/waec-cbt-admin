export async function authenticatedFetch(url, options = {}) {
    const response = await fetch(`https://nysc-backend.vercel.app${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    
    return response;
  }
  
  export async function getCurrentUser() {
    try {
      const response = await authenticatedFetch('/api/auth/me');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
  
  export async function loginUser(identifier, password) {
    try {
      const response = await fetch('https://nysc-backend.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  export async function logoutUser() {
    try {
      const response = await fetch('https://nysc-backend.vercel.app/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }