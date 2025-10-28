import { createContext } from "react";

// Exportamos el contexto para que pueda ser usado por el hook
export const AuthContext = createContext();

/*
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const userData = await authService.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);

      const userData = data.user;
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Credenciales incorrectas",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};*/

// Ya no exportamos useAuth desde aquí
