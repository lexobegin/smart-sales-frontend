import api from "./api";

// Constantes para tu proyecto SmartSales365
export const TIPOS_USUARIO = [
  { value: 1, label: "Administrador" },
  { value: 2, label: "Empleado" },
  { value: 3, label: "Cliente" },
];

export const GENEROS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

export const ESTADOS_USUARIO = [
  { value: true, label: "Activo" },
  { value: false, label: "Inactivo" },
];

// Servicios de API
export const usuariosService = {
  // Obtener lista de usuarios con paginación y filtros
  fetchUsuarios: async (page = 1, search = "", filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...filters,
    });

    console.log("Fetching usuarios with params:", params.toString()); // Para debug

    const response = await api.get(`/administracion/usuarios/?${params}`);
    return response.data;
  },

  // Obtener un usuario por ID
  fetchUsuarioById: async (id) => {
    const response = await api.get(`/administracion/usuarios/${id}/`);
    return response.data;
  },

  // Crear nuevo usuario
  createUsuario: async (usuarioData) => {
    const response = await api.post("/administracion/usuarios/", usuarioData);
    return response.data;
  },

  // Actualizar usuario
  updateUsuario: async (id, usuarioData) => {
    const response = await api.put(
      `/administracion/usuarios/${id}/`,
      usuarioData
    );
    return response.data;
  },

  // Eliminar usuario
  deleteUsuario: async (id) => {
    const response = await api.delete(`/administracion/usuarios/${id}/`);
    return response.data;
  },

  // Activar/Desactivar usuario
  toggleUsuarioStatus: async (id, activo) => {
    const response = await api.patch(`/administracion/usuarios/${id}/`, {
      activo,
    });
    return response.data;
  },
};

// Exportar las funciones individualmente para compatibilidad
export const fetchUsuarios = usuariosService.fetchUsuarios;
export const deleteUsuario = usuariosService.deleteUsuario;

// La función registrarRostroUsuario no es necesaria en SmartSales365
// Se eliminó para evitar errores de ESLint

export const rolesService = {
  // Obtener lista de roles
  fetchRoles: async () => {
    const response = await api.get("/administracion/roles-select/");
    return response.data;
  },

  // Obtener un rol por ID
  fetchRolById: async (id) => {
    const response = await api.get(`/administracion/roles/${id}/`);
    return response.data;
  },
};

// Exportar individualmente
export const fetchRoles = rolesService.fetchRoles;
