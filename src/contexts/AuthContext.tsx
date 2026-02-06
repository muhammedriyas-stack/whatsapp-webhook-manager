import { login, useLogin } from "@/services/auth.service";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useLocation, useNavigate, useResolvedPath } from "react-router-dom";

interface AuthContextType {
  user: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { pathname } = useLocation();
  // ────────────────────────────────────────────────
  // Load user on mount (token-based auto-login)
  // ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (token) {
      setUser(token);
      setLoading(false);
      navigate(pathname);
      return;
    } else {
      setUser(null);
      setLoading(false);
      navigate("/auth");
      return;
    }
  }, []);


  // ────────────────────────────────────────────────
  // Sign In
  // ────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const res = await login({ email, password });

    if (res?.data) {
      localStorage.setItem("user_token", res?.data?.accessToken);
      setUser(res?.data?.user);
      setLoading(false);
      // No forced navigate here if we want to land on the current page or a safe default
      navigate("/");
    }

    return { error: null };
  };

  // ────────────────────────────────────────────────
  // Sign Out
  // ────────────────────────────────────────────────
  const signOut = () => {
    localStorage.removeItem("user_token");
    setUser(null);
    navigate("/auth");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
