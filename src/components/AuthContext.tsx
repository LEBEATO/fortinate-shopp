import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const AuthContext = createContext<AuthState>({} as AuthState);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Persist login check
  useEffect(() => {
    const storedEmail = localStorage.getItem('fn_current_user');
    if (storedEmail) {
      fetch(`${API_BASE_URL}/api/user/${storedEmail}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(u => setUser(u))
        .catch(() => {
          // Se o usuário não for encontrado no DB, limpa o localStorage
          localStorage.removeItem('fn_current_user');
        });
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const u = await response.json();
    localStorage.setItem('fn_current_user', email);
    setUser(u);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const u = await response.json();
    localStorage.setItem('fn_current_user', email);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('fn_current_user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (user) {
      const response = await fetch(`${API_BASE_URL}/api/user/${user.email}`);
      if (response.ok) {
        const freshUser = await response.json();
        setUser(freshUser);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const API_BASE_URL_CONST = API_BASE_URL;