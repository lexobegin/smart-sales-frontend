import api from "./api";

// Servicios de API para productos
export const productosService = {
  // Obtener lista de productos con paginación y filtros
  fetchProductos: async (page = 1, search = "", filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...filters,
    });

    const response = await api.get(`/producto/productos/?${params}`);
    return response.data;
  },

  // Obtener un producto por ID
  fetchProductoById: async (id) => {
    const response = await api.get(`/producto/productos/${id}/`);
    return response.data;
  },

  // Crear nuevo producto
  createProducto: async (productoData) => {
    const response = await api.post("/producto/productos/", productoData);
    return response.data;
  },

  // Actualizar producto
  updateProducto: async (id, productoData) => {
    const response = await api.put(`/producto/productos/${id}/`, productoData);
    return response.data;
  },

  // Eliminar producto
  deleteProducto: async (id) => {
    const response = await api.delete(`/producto/productos/${id}/`);
    return response.data;
  },

  // Activar/Desactivar producto
  toggleProductoStatus: async (id, activo) => {
    const response = await api.patch(`/producto/productos/${id}/`, { activo });
    return response.data;
  },

  // Obtener categorías
  fetchCategorias: async () => {
    const response = await api.get("/producto/categorias/");
    return response.data;
  },

  // Obtener marcas
  fetchMarcas: async () => {
    const response = await api.get("/producto/marcas/");
    return response.data;
  },
};

// Exportar las funciones individualmente
export const fetchProductos = productosService.fetchProductos;
export const deleteProducto = productosService.deleteProducto;
export const fetchCategorias = productosService.fetchCategorias;
export const fetchMarcas = productosService.fetchMarcas;
