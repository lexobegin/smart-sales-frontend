import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  usuariosService,
  fetchRoles,
  GENEROS,
} from "../../../services/usuarios";
import { FaSave, FaTimes, FaUserEdit, FaKey } from "react-icons/fa";

function UsuarioEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("informacion");

  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    genero: "",
    activo: true,
    rol: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadRoles();
    loadUsuario();
  }, [id]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await fetchRoles();
      setRoles(data.results || data);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setErrors((prev) => ({ ...prev, general: "Error al cargar los roles" }));
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadUsuario = async () => {
    try {
      setLoadingUsuario(true);
      const usuario = await usuariosService.fetchUsuarioById(id);

      // Formatear fecha para el input date
      const fechaNacimiento = usuario.fecha_nacimiento
        ? usuario.fecha_nacimiento.split("T")[0]
        : "";

      setFormData({
        email: usuario.email || "",
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        telefono: usuario.telefono || "",
        direccion: usuario.direccion || "",
        fecha_nacimiento: fechaNacimiento,
        genero: usuario.genero || "",
        activo: usuario.activo || true,
        rol: usuario.rol?.toString() || "",
      });
    } catch (err) {
      console.error("Error cargando usuario:", err);
      setErrors((prev) => ({ ...prev, general: "Error al cargar el usuario" }));
    } finally {
      setLoadingUsuario(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.nombre) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido) newErrors.apellido = "El apellido es requerido";
    if (!formData.rol) newErrors.rol = "El rol es requerido";

    // Validación de teléfono
    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = "Teléfono inválido";
    }

    // Validación de fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento);
      const today = new Date();
      if (birthDate > today) {
        newErrors.fecha_nacimiento =
          "La fecha de nacimiento no puede ser futura";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (passwordData.password && passwordData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await usuariosService.updateUsuario(id, formData);

      setShowAlert(true);
      setTimeout(() => {
        navigate("/admin/usuarios");
      }, 2000);
    } catch (err) {
      console.error("Error actualizando usuario:", err);

      // Manejar errores del backend
      if (err.response?.data) {
        const backendErrors = err.response.data;
        const formattedErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          if (Array.isArray(backendErrors[key])) {
            formattedErrors[key] = backendErrors[key][0];
          } else {
            formattedErrors[key] = backendErrors[key];
          }
        });

        setErrors(formattedErrors);
      } else {
        setErrors({ general: "Error al actualizar el usuario" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      // Enviar solo la contraseña para cambiar
      await usuariosService.updateUsuario(id, {
        password: passwordData.password,
      });

      setShowAlert(true);
      setPasswordData({ password: "", confirmPassword: "" });

      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (err) {
      console.error("Error cambiando contraseña:", err);
      setErrors({ general: "Error al cambiar la contraseña" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/usuarios");
  };

  if (loadingUsuario) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaUserEdit className="me-2 text-primary" />
          Editar Usuario: {formData.nombre} {formData.apellido}
        </h2>
        <Button variant="outline-secondary" onClick={handleCancel}>
          <FaTimes className="me-1" />
          Cancelar
        </Button>
      </div>

      {showAlert && (
        <Alert variant="success" className="mb-4">
          {activeTab === "informacion"
            ? "¡Usuario actualizado exitosamente! Redirigiendo..."
            : "¡Contraseña cambiada exitosamente!"}
        </Alert>
      )}

      {errors.general && (
        <Alert variant="danger" className="mb-4">
          {errors.general}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab)}
            className="mb-3"
          >
            {/* Pestaña de Información General */}
            <Tab
              eventKey="informacion"
              title={
                <span>
                  <FaUserEdit className="me-1" />
                  Información General
                </span>
              }
            >
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        <strong>Información Básica</strong>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Email *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Nombre *</Form.Label>
                              <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                isInvalid={!!errors.nombre}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.nombre}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Apellido *</Form.Label>
                              <Form.Control
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                isInvalid={!!errors.apellido}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.apellido}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header>
                        <strong>Información Adicional</strong>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Rol *</Form.Label>
                          <Form.Select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            isInvalid={!!errors.rol}
                            disabled={loadingRoles}
                          >
                            <option value="">Seleccionar rol</option>
                            {roles.map((rol) => (
                              <option key={rol.id} value={rol.id}>
                                {rol.nombre}
                              </option>
                            ))}
                          </Form.Select>
                          {loadingRoles && (
                            <small className="text-muted">
                              Cargando roles...
                            </small>
                          )}
                          <Form.Control.Feedback type="invalid">
                            {errors.rol}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Género</Form.Label>
                              <Form.Select
                                name="genero"
                                value={formData.genero}
                                onChange={handleChange}
                              >
                                <option value="">Seleccionar género</option>
                                {GENEROS.map((genero) => (
                                  <option
                                    key={genero.value}
                                    value={genero.value}
                                  >
                                    {genero.label}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Fecha de Nacimiento</Form.Label>
                              <Form.Control
                                type="date"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                isInvalid={!!errors.fecha_nacimiento}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.fecha_nacimiento}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Teléfono</Form.Label>
                          <Form.Control
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            isInvalid={!!errors.telefono}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.telefono}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Dirección</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            name="activo"
                            label="Usuario activo"
                            checked={formData.activo}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <FaTimes className="me-1" />
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-1" />
                        Actualizar Usuario
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Tab>

            {/* Pestaña de Cambio de Contraseña */}
            <Tab
              eventKey="password"
              title={
                <span>
                  <FaKey className="me-1" />
                  Cambiar Contraseña
                </span>
              }
            >
              <Card>
                <Card.Body>
                  <Form onSubmit={handlePasswordSubmit}>
                    <Row className="justify-content-center">
                      <Col md={6}>
                        <Card>
                          <Card.Header>
                            <strong>Cambiar Contraseña</strong>
                          </Card.Header>
                          <Card.Body>
                            <Form.Group className="mb-3">
                              <Form.Label>Nueva Contraseña</Form.Label>
                              <Form.Control
                                type="password"
                                name="password"
                                value={passwordData.password}
                                onChange={handlePasswordChange}
                                isInvalid={!!errors.password}
                                placeholder="Dejar vacío para mantener la actual"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.password}
                              </Form.Control.Feedback>
                              <Form.Text className="text-muted">
                                Mínimo 6 caracteres. Dejar vacío si no deseas
                                cambiar la contraseña.
                              </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                Confirmar Nueva Contraseña
                              </Form.Label>
                              <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                isInvalid={!!errors.confirmPassword}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                              </Form.Control.Feedback>
                            </Form.Group>

                            <div className="d-flex justify-content-end gap-2">
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  setPasswordData({
                                    password: "",
                                    confirmPassword: "",
                                  })
                                }
                                disabled={loading}
                              >
                                <FaTimes className="me-1" />
                                Limpiar
                              </Button>
                              <Button
                                variant="warning"
                                type="submit"
                                disabled={loading || !passwordData.password}
                              >
                                {loading ? (
                                  <>
                                    <Spinner
                                      animation="border"
                                      size="sm"
                                      className="me-2"
                                    />
                                    Cambiando...
                                  </>
                                ) : (
                                  <>
                                    <FaKey className="me-1" />
                                    Cambiar Contraseña
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UsuarioEditar;
