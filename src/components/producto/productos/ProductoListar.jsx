import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spinner,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  fetchProductos,
  deleteProducto,
  fetchCategorias,
  fetchMarcas,
} from "../../../services/productos";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaBox,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaSearch,
  FaShoppingCart,
  FaTags,
  FaIndustry,
  FaStar,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function ProductoListar() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categoria: "",
    marca: "",
    con_descuento: "",
    precio_min: "",
    precio_max: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductoId, setSelectedProductoId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadFiltros();
    loadProductos(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadFiltros = async () => {
    try {
      setLoadingFiltros(true);
      const [categoriasData, marcasData] = await Promise.all([
        fetchCategorias(),
        fetchMarcas(),
      ]);
      setCategorias(categoriasData.results || categoriasData);
      setMarcas(marcasData.results || marcasData);
    } catch (err) {
      console.error("Error cargando filtros:", err);
    } finally {
      setLoadingFiltros(false);
    }
  };

  const loadProductos = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);

      // Preparar parámetros según tu Django ViewSet
      const params = {
        page: page.toString(),
        ...(search && { search }),
      };

      // Agregar filtros según filterset_fields del ViewSet
      if (filterParams.categoria) {
        params.categoria = filterParams.categoria;
      }
      if (filterParams.marca) {
        params.marca = filterParams.marca;
      }
      if (filterParams.con_descuento) {
        params.con_descuento = filterParams.con_descuento;
      }
      if (filterParams.precio_min) {
        params.precio_min = filterParams.precio_min;
      }
      if (filterParams.precio_max) {
        params.precio_max = filterParams.precio_max;
      }

      const data = await fetchProductos(page, search, params);
      setProductos(data.results);
      const total = Math.ceil(data.count / 12); // 12 productos por página para cards
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando productos:", err);
      alert("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedProductoId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedProductoId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (producto) => {
    setSelectedProducto(producto);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedProducto(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteProducto(selectedProductoId);
      loadProductos(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert("Error al eliminar el producto");
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
      categoria: "",
      marca: "",
      con_descuento: "",
      precio_min: "",
      precio_max: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      productos.map((producto) => ({
        ID: producto.id,
        Nombre: producto.nombre,
        Descripción: producto.descripcion,
        Precio: `Bs ${producto.precio}`,
        "Precio Original": producto.precio_original
          ? `Bs ${producto.precio_original}`
          : "N/A",
        "Tiene Descuento": producto.tiene_descuento ? "Sí" : "No",
        "% Descuento": producto.porcentaje_descuento
          ? `${producto.porcentaje_descuento}%`
          : "N/A",
        Marca: producto.marca_nombre,
        Categoría: producto.categoria_nombre,
        "Stock Mínimo": producto.stock_minimo,
        Estado: producto.activo ? "Activo" : "Inactivo",
        "Fecha Creación": new Date(producto.creado).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "productos.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Productos - SmartSales365", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = productos.map((producto) => [
      producto.id,
      producto.nombre.substring(0, 30) +
        (producto.nombre.length > 30 ? "..." : ""),
      `Bs ${producto.precio}`,
      producto.marca_nombre,
      producto.categoria_nombre,
      producto.activo ? "Activo" : "Inactivo",
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [["ID", "Nombre", "Precio", "Marca", "Categoría", "Estado"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [40, 167, 69], // Color verde
        textColor: 255,
      },
    });

    doc.save("productos_smartsales365.pdf");
  };

  const formatPrecio = (precio) => {
    return `Bs ${parseFloat(precio).toFixed(2)}`;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaBox className="me-2 text-success" />
          Gestión de Productos
        </h2>
        <Button
          onClick={() => navigate("/productos/producto/crear")}
          variant="success"
        >
          Nuevo Producto
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Buscar Productos</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, descripción, marca..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6} className="text-end">
              <Form.Label>Acciones</Form.Label>
              <div>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="me-2"
                >
                  <FaFilter className="me-1" />
                  Filtros
                </Button>
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select
                      value={filters.categoria}
                      onChange={(e) =>
                        handleFilterChange("categoria", e.target.value)
                      }
                      disabled={loadingFiltros}
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Marca</Form.Label>
                    <Form.Select
                      value={filters.marca}
                      onChange={(e) =>
                        handleFilterChange("marca", e.target.value)
                      }
                      disabled={loadingFiltros}
                    >
                      <option value="">Todas las marcas</option>
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Descuento</Form.Label>
                    <Form.Select
                      value={filters.con_descuento}
                      onChange={(e) =>
                        handleFilterChange("con_descuento", e.target.value)
                      }
                    >
                      <option value="">Todos</option>
                      <option value="true">Con descuento</option>
                      <option value="false">Sin descuento</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Precio Mín</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0.00"
                      value={filters.precio_min}
                      onChange={(e) =>
                        handleFilterChange("precio_min", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Precio Máx</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="10000.00"
                      value={filters.precio_max}
                      onChange={(e) =>
                        handleFilterChange("precio_max", e.target.value)
                      }
                    />
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
          <Spinner animation="border" variant="success" />
          <p className="mt-2">Cargando productos...</p>
        </div>
      ) : (
        <>
          {/* Grid de productos con cards */}
          <Row>
            {productos.map((producto) => (
              <Col key={producto.id} xl={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Row className="g-0 h-100">
                    {/* Imágenes del producto */}
                    <Col md={4}>
                      <div
                        className="h-100 d-flex align-items-center justify-content-center bg-light"
                        style={{ minHeight: "200px", cursor: "pointer" }}
                        onClick={() => handleShowDetailModal(producto)}
                      >
                        {producto.fotos && producto.fotos.length > 0 ? (
                          <img
                            src={producto.fotos[0].url_imagen}
                            alt={producto.nombre}
                            className="img-fluid rounded-start"
                            style={{
                              maxHeight: "180px",
                              width: "auto",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://www.rivera.gub.uy/portal/wp-content/uploads/2017/02/imagen-no-disponible.jpg";
                            }}
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <FaBox size={48} />
                            <div>Sin imagen</div>
                          </div>
                        )}
                      </div>
                    </Col>

                    {/* Información del producto */}
                    <Col md={8}>
                      <Card.Body className="d-flex flex-column h-100">
                        <div className="flex-grow-1">
                          <Card.Title
                            className="h6 mb-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleShowDetailModal(producto)}
                          >
                            {producto.nombre}
                          </Card.Title>

                          <div className="mb-2">
                            <Badge bg="secondary" className="me-1">
                              <FaTags className="me-1" />
                              {producto.categoria_nombre}
                            </Badge>
                            <Badge bg="outline-secondary" text="dark">
                              <FaIndustry className="me-1" />
                              {producto.marca_nombre}
                            </Badge>
                          </div>

                          <div className="mb-2 small text-muted">
                            {producto.descripcion &&
                            producto.descripcion.length > 100
                              ? `${producto.descripcion.substring(0, 100)}...`
                              : producto.descripcion}
                          </div>

                          <div className="mb-2">
                            {producto.tiene_descuento ? (
                              <>
                                <span className="text-danger h5 fw-bold">
                                  {formatPrecio(producto.precio)}
                                </span>
                                <span className="text-muted text-decoration-line-through ms-2">
                                  {formatPrecio(producto.precio_original)}
                                </span>
                                <Badge bg="danger" className="ms-2">
                                  -{producto.porcentaje_descuento}%
                                </Badge>
                              </>
                            ) : (
                              <span className="h5 fw-bold text-success">
                                {formatPrecio(producto.precio)}
                              </span>
                            )}
                          </div>

                          <div className="small text-muted">
                            Stock mínimo: {producto.stock_minimo}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                          <div>
                            <Button
                              size="sm"
                              variant="info"
                              onClick={() => handleShowDetailModal(producto)}
                              title="Ver detalles"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() =>
                                navigate(
                                  `/productos/producto/editar/${producto.id}`
                                )
                              }
                              className="ms-1"
                              title="Editar"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleShowDeleteModal(producto.id)}
                              className="ms-1"
                              title="Eliminar"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                          <Badge bg={producto.activo ? "success" : "secondary"}>
                            {producto.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">
                Página {currentPage} de {totalPages} - {productos.length}{" "}
                productos
              </span>
              <div>
                <Button
                  variant="outline-success"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="me-2"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline-success"
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
          ¿Estás seguro de que quieres eliminar este producto? Esta acción no se
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
      {selectedProducto && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaBox className="me-2 text-success" />
              {selectedProducto.nombre}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                {selectedProducto.fotos && selectedProducto.fotos.length > 0 ? (
                  <div
                    id="productoCarousel"
                    className="carousel slide"
                    data-bs-theme="dark"
                  >
                    <div className="carousel-inner rounded bg-light">
                      {selectedProducto.fotos.map((foto, index) => (
                        <div
                          key={foto.id}
                          className={`carousel-item ${
                            index === 0 ? "active" : ""
                          }`}
                        >
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: "300px" }}
                          >
                            <img
                              src={foto.url_imagen}
                              className="d-block"
                              alt={`${selectedProducto.nombre} - ${index + 1}`}
                              style={{
                                maxHeight: "280px",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                // Crear elemento de fallback
                                const fallback = document.createElement("div");
                                fallback.className = "text-center text-muted";
                                fallback.innerHTML = `
                            <FaBox size={64} />
                            <div>Imagen no disponible</div>
                          `;
                                e.target.parentNode.appendChild(fallback);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedProducto.fotos.length > 1 && (
                      <>
                        <button
                          className="carousel-control-prev"
                          type="button"
                          data-bs-target="#productoCarousel"
                          data-bs-slide="prev"
                          style={{ width: "50px" }}
                        >
                          <span
                            className="carousel-control-prev-icon bg-dark rounded-circle p-2"
                            aria-hidden="true"
                            style={{ background: "rgba(0,0,0,0.7) !important" }}
                          ></span>
                          <span className="visually-hidden">Anterior</span>
                        </button>
                        <button
                          className="carousel-control-next"
                          type="button"
                          data-bs-target="#productoCarousel"
                          data-bs-slide="next"
                          style={{ width: "50px" }}
                        >
                          <span
                            className="carousel-control-next-icon bg-dark rounded-circle p-2"
                            aria-hidden="true"
                            style={{ background: "rgba(0,0,0,0.7) !important" }}
                          ></span>
                          <span className="visually-hidden">Siguiente</span>
                        </button>
                      </>
                    )}
                    {/* Indicadores */}
                    {selectedProducto.fotos.length > 1 && (
                      <div className="carousel-indicators">
                        {selectedProducto.fotos.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            data-bs-target="#productoCarousel"
                            data-bs-slide-to={index}
                            className={index === 0 ? "active" : ""}
                            aria-current={index === 0 ? "true" : "false"}
                            aria-label={`Slide ${index + 1}`}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                          ></button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5 bg-light rounded">
                    <FaBox size={64} />
                    <div>No hay imágenes disponibles</div>
                  </div>
                )}
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <h5 className="card-title">{selectedProducto.nombre}</h5>

                    <div className="mb-3">
                      <strong>Descripción:</strong>
                      <p className="mb-0">{selectedProducto.descripcion}</p>
                    </div>

                    <div className="mb-3">
                      <strong>Precio:</strong>
                      <div>
                        {selectedProducto.tiene_descuento ? (
                          <>
                            <span className="text-danger h4 fw-bold">
                              {formatPrecio(selectedProducto.precio)}
                            </span>
                            <span className="text-muted text-decoration-line-through ms-2">
                              {formatPrecio(selectedProducto.precio_original)}
                            </span>
                            <Badge bg="danger" className="ms-2">
                              -{selectedProducto.porcentaje_descuento}% OFF
                            </Badge>
                          </>
                        ) : (
                          <span className="h4 fw-bold text-success">
                            {formatPrecio(selectedProducto.precio)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Row className="mb-3">
                      <Col>
                        <strong>Marca:</strong>
                        <div>{selectedProducto.marca_nombre}</div>
                      </Col>
                      <Col>
                        <strong>Categoría:</strong>
                        <div>{selectedProducto.categoria_nombre}</div>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col>
                        <strong>Stock Mínimo:</strong>
                        <div>{selectedProducto.stock_minimo}</div>
                      </Col>
                      <Col>
                        <strong>Estado:</strong>
                        <div>
                          <Badge
                            bg={
                              selectedProducto.activo ? "success" : "secondary"
                            }
                          >
                            {selectedProducto.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </Col>
                    </Row>

                    <div className="small text-muted">
                      <strong>Creado:</strong>{" "}
                      {formatFecha(selectedProducto.creado)}
                    </div>
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

export default ProductoListar;
