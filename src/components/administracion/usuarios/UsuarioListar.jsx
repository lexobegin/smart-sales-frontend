import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Modal,
  Card,
  Badge,
  Form,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import {
  fetchUsuarios,
  deleteUsuario,
  fetchRoles,
  GENEROS,
  ESTADOS_USUARIO,
} from "../../../services/usuarios";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaUser,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function UsuarioListar() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rol: "",
    genero: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadRoles();
    loadUsuarios(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await fetchRoles();
      setRoles(data.results || data); // Adaptarse a la estructura de tu API
    } catch (err) {
      console.error("Error cargando roles:", err);
      alert("Error al cargar los roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadUsuarios = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);

      // Preparar parámetros según tu Django ViewSet
      const params = {
        page: page.toString(),
        ...(search && { search }), // search_fields en ViewSet
      };

      // Agregar filtros según filterset_fields del ViewSet
      if (filterParams.rol) {
        params.rol = filterParams.rol;
      }
      if (filterParams.genero) {
        params.genero = filterParams.genero; // filterset_fields incluye 'genero'
      }
      if (filterParams.estado !== "") {
        params.activo = filterParams.estado; // filterset_fields incluye 'activo'
      }

      const data = await fetchUsuarios(page, search, params);
      setUsuarios(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      alert("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedUsuarioId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedUsuarioId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedUsuario(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteUsuario(selectedUsuarioId);
      loadUsuarios(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      alert("Error al eliminar el usuario");
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Filtros
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      rol: "",
      genero: "",
      estado: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      usuarios.map((usuario) => ({
        ID: usuario.id,
        Nombre: usuario.nombre,
        Apellido: usuario.apellido,
        "Nombre Completo": usuario.nombre_completo,
        Email: usuario.email,
        Teléfono: usuario.telefono,
        Tipo: getTipoDisplay(usuario.tipo_usuario),
        Género: getGeneroDisplay(usuario.genero),
        Estado: getEstadoDisplay(usuario.activo),
        Edad: usuario.edad,
        "Fecha Registro": new Date(usuario.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios - SmartSales365", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = usuarios.map((usuario) => [
      usuario.id,
      usuario.nombre_completo,
      usuario.email,
      getTipoDisplay(usuario.tipo_usuario),
      getEstadoDisplay(usuario.activo),
      usuario.edad || "N/A",
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [["ID", "Nombre", "Email", "Tipo", "Estado", "Edad"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [13, 110, 253], // Color primary de Bootstrap
        textColor: 255,
      },
    });

    doc.save("usuarios_smartsales365.pdf");
  };

  // Funciones auxiliares para displays
  const getTipoDisplay = (tipo) => {
    return tipo || "No especificado";
  };

  const getGeneroDisplay = (genero) => {
    const generoObj = GENEROS.find((g) => g.value === genero);
    return generoObj ? generoObj.label : genero || "No especificado";
  };

  const getEstadoDisplay = (estado) => {
    return estado ? "Activo" : "Inactivo";
  };

  // Funciones para badges
  const getTipoBadge = (tipo) => {
    const colors = {
      Administrador: "danger",
      Empleado: "warning",
      Cliente: "info",
    };
    return <Badge bg={colors[tipo] || "secondary"}>{tipo}</Badge>;
  };

  const getGeneroBadge = (genero) => {
    return genero === "M" ? (
      <Badge bg="info">Masculino</Badge>
    ) : genero === "F" ? (
      <Badge bg="pink" text="dark">
        Femenino
      </Badge>
    ) : (
      <Badge bg="light" text="dark">
        No especificado
      </Badge>
    );
  };

  const getEstadoBadge = (activo) => {
    return activo ? (
      <Badge bg="success">Activo</Badge>
    ) : (
      <Badge bg="secondary">Inactivo</Badge>
    );
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ACTUALIZAR: Función para obtener el nombre del rol
  /*const getRolDisplay = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : `Rol ${rolId}`;
  };*/

  // ACTUALIZAR: Función para el badge del rol
  const getRolBadge = (rolId) => {
    const rol = roles.find((r) => r.id === rolId);
    const rolNombre = rol ? rol.nombre : `Rol ${rolId}`;

    const colors = {
      Administrador: "danger",
      Empleado: "warning",
      Cliente: "info",
    };

    return <Badge bg={colors[rolNombre] || "secondary"}>{rolNombre}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <Button
          onClick={() => navigate("/admin/usuarios/crear")}
          variant="primary"
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Buscar Usuarios</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, email, teléfono..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className="ms-2"
                  >
                    <FaFilter className="me-1" />
                    Filtros
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Form.Label>Exportar</Form.Label>
              <div>
                <Button
                  variant="outline-success"
                  onClick={exportToExcel}
                  className="me-2"
                >
                  <FaFileExcel className="me-1" /> Excel
                </Button>
                <Button variant="outline-danger" onClick={exportToPDF}>
                  <FaFilePdf className="me-1" /> PDF
                </Button>
              </div>
            </Col>
          </Row>

          {/* Filtros desplegables */}
          {showFilters && (
            <div className="mt-3">
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Rol de Usuario</Form.Label>
                    <Form.Select
                      value={filters.rol}
                      onChange={(e) =>
                        handleFilterChange("rol", e.target.value)
                      }
                      disabled={loadingRoles}
                    >
                      <option value="">Todos los roles</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingRoles && (
                      <small className="text-muted">Cargando roles...</small>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Género</Form.Label>
                    <Form.Select
                      value={filters.genero}
                      onChange={(e) =>
                        handleFilterChange("genero", e.target.value)
                      }
                    >
                      <option value="">Todos los géneros</option>
                      {GENEROS.map((genero) => (
                        <option key={genero.value} value={genero.value}>
                          {genero.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filters.estado}
                      onChange={(e) =>
                        handleFilterChange("estado", e.target.value)
                      }
                    >
                      <option value="">Todos los estados</option>
                      {ESTADOS_USUARIO.map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando usuarios...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Información</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.id}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{usuario.nombre_completo}</strong>
                    </div>
                    <div>
                      <small className="text-muted">
                        {usuario.genero && getGeneroBadge(usuario.genero)}
                      </small>
                    </div>
                    {usuario.edad && (
                      <div>
                        <small className="text-muted">
                          Edad: {usuario.edad}
                        </small>
                      </div>
                    )}
                  </td>
                  <td>
                    <div>
                      <FaEnvelope className="me-1 text-muted" />
                      <small>{usuario.email}</small>
                    </div>
                    {usuario.telefono && (
                      <div>
                        <FaPhone className="me-1 text-muted" />
                        <small>{usuario.telefono}</small>
                      </div>
                    )}
                  </td>
                  <td>{getRolBadge(usuario.rol)}</td>
                  <td>{getEstadoBadge(usuario.activo)}</td>

                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => handleShowDetailModal(usuario)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </Button>

                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() =>
                          navigate(`/admin/usuarios/editar/${usuario.id}`)
                        }
                        title="Editar"
                      >
                        <FaEdit />
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleShowDeleteModal(usuario.id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="text-muted">
                Página {currentPage} de {totalPages}
              </span>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="me-2"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se
          puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalles */}
      {selectedUsuario && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUser className="me-2 text-primary" />
              Detalles del Usuario: {selectedUsuario.nombre_completo}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <strong>Información Personal</strong>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      <strong>ID:</strong> {selectedUsuario.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedUsuario.nombre}
                    </p>
                    <p>
                      <strong>Apellido:</strong> {selectedUsuario.apellido}
                    </p>
                    <p>
                      <strong>Nombre Completo:</strong>{" "}
                      {selectedUsuario.nombre_completo}
                    </p>
                    <p>
                      <strong>Género:</strong>{" "}
                      {getGeneroBadge(selectedUsuario.genero)}
                    </p>
                    <p>
                      <strong>Edad:</strong>{" "}
                      {selectedUsuario.edad || "No especificado"}
                    </p>
                    {selectedUsuario.fecha_nacimiento && (
                      <p>
                        <strong>Fecha Nacimiento:</strong>{" "}
                        {selectedUsuario.fecha_nacimiento}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <strong>Información de Contacto</strong>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      <strong>Email:</strong> {selectedUsuario.email}
                    </p>
                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {selectedUsuario.telefono || "No registrado"}
                    </p>
                    {selectedUsuario.direccion && (
                      <p>
                        <strong>Dirección:</strong> {selectedUsuario.direccion}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Card>
                  <Card.Header>
                    <strong>Información del Sistema</strong>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      <strong>Tipo de Usuario:</strong>{" "}
                      {getTipoBadge(selectedUsuario.tipo_usuario)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {getEstadoBadge(selectedUsuario.activo)}
                    </p>
                    <p>
                      <strong>Fecha de Registro:</strong>{" "}
                      {formatFecha(selectedUsuario.created_at)}
                    </p>
                    <p>
                      <strong>Rol ID:</strong> {selectedUsuario.rol}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default UsuarioListar;
