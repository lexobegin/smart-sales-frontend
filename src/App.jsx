import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/common/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import UsuarioListar from "./components/administracion/usuarios/UsuarioListar";
import UsuarioCrear from "./components/administracion/usuarios/UsuarioCrear";
import UsuarioEditar from "./components/administracion/usuarios/UsuarioEditar";
import ProductoListar from "./components/producto/productos/ProductoListar";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/usuarios" element={<UsuarioListar />} />
                  <Route
                    path="/admin/usuarios/crear"
                    element={<UsuarioCrear />}
                  />
                  <Route
                    path="/admin/usuarios/editar/:id"
                    element={<UsuarioEditar />}
                  />
                  <Route
                    path="/productos/producto"
                    element={<ProductoListar />}
                  />
                  <Route
                    path="/clients"
                    element={
                      <div className="p-3">
                        Página de Clientes - En desarrollo
                      </div>
                    }
                  />
                  <Route
                    path="/sales"
                    element={
                      <div className="p-3">
                        Página de Ventas - En desarrollo
                      </div>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <div className="p-3">
                        Página de Reportes - En desarrollo
                      </div>
                    }
                  />
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
export default App;
