'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const DEMO_ADMINS = [
  {
    id: 'admin001',
    email: 'admin@kogistatecollege.edu.ng',
    name: 'Dr. Michael Adebayo',
    role: 'Administrator',
    school: 'Kogi State College of Education',
    studentId: 'ADMIN001',
    avatar: '/images/avatar1.png',
    subjects: ['All Subjects']
  },
  {
    id: 'admin002',
    email: 'principal@kogistatecollege.edu.ng',
    name: 'Prof. Sarah Okafor',
    role: 'Principal',
    school: 'Kogi State College of Education',
    studentId: 'ADMIN002',
    avatar: '/images/avatar2.png',
    subjects: ['All Subjects']
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('school_admin');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem('school_admin');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const admin = DEMO_ADMINS.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase() && 
        password === 'admin123'
      );

      if (admin) {
        setUser(admin);
        localStorage.setItem('school_admin', JSON.stringify(admin));
        return { success: true, data: admin };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('school_admin');
    toast.success('Logged out successfully');
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('school_admin', JSON.stringify(newUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
      loading,
      authChecked
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};