import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const { user: userData } = await api.getUser();
          setUser(userData);
        } catch (error) {
          api.setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await api.login(email, password);
      api.setToken(token);
      setUser(userData);
      navigate("/");
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await api.signup(email, password);
      api.setToken(token);
      setUser(userData);
      navigate("/");
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    api.setToken(null);
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
