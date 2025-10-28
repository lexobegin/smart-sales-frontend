import api from "./api";

export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login/", credentials);

    // Guardar tokens en localStorage
    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout/");
    // Limpiar localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return response.data;
  },

  getProfile: async () => {
    // Si ya tenemos el usuario en localStorage, lo devolvemos
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }

    // Si no, hacemos la petición al backend
    const response = await api.get("/administracion/usuarios/me/");
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await api.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });

    // Actualizar el access token
    localStorage.setItem("accessToken", response.data.access);
    return response.data;
  },
};
