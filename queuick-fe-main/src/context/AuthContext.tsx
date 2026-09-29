import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hardcode the default values so the context immediately recognizes you as a logged-in admin
  const [user, setUser] = useState<any>({
    id: 1,
    username: "admin",
    is_superuser: true,
    role: "admin"
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (data: any) => {
    setUser({ id: 1, username: "admin", is_superuser: true, role: "admin" });
    setIsAuthenticated(true);
    setLoading(false);
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Disabled any backend API check hooks so page refreshes don't break the layout session
  useEffect(() => {
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
