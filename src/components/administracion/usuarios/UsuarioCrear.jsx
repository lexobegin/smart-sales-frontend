import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  usuariosService,
  fetchRoles,
  GENEROS,
} from "../../../services/usuarios";
import { FaSave, FaTimes, FaUserPlus } from "react-icons/fa";

function UsuarioCrear() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    genero: "",
    activo: true,
    rol: "",
  });

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

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

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirma la contraseña";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    if (!formData.nombre) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido) newErrors.apellido = "El apellido es requerido";
    if (!formData.rol) newErrors.rol = "El rol es requerido";

    // Validación de teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = "Teléfono inválido";
    }

    // Validación de fecha de nacimiento (opcional pero si se ingresa debe ser válida)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para enviar (sin confirmPassword)
      const usuarioData = { ...formData };
      delete usuarioData.confirmPassword;

      await usuariosService.createUsuario(usuarioData);

      setShowAlert(true);
      setTimeout(() => {
        navigate("/admin/usuarios");
      }, 2000);
    } catch (err) {
      console.error("Error creando usuario:", err);

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
        setErrors({ general: "Error al crear el usuario" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/usuarios");
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaUserPlus className="me-2 text-primary" />
          Crear Nuevo Usuario
        </h2>
        <Button variant="outline-secondary" onClick={handleCancel}>
          <FaTimes className="me-1" />
          Cancelar
        </Button>
      </div>

      {showAlert && (
        <Alert variant="success" className="mb-4">
          ¡Usuario creado exitosamente! Redirigiendo...
        </Alert>
      )}

      {errors.general && (
        <Alert variant="danger" className="mb-4">
          {errors.general}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Información Básica */}
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
                        placeholder="usuario@ejemplo.com"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contraseña *</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            placeholder="Mínimo 6 caracteres"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Contraseña *</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.confirmPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

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
                            placeholder="Nombre"
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
                            placeholder="Apellido"
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

              {/* Información Adicional */}
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
                        <small className="text-muted">Cargando roles...</small>
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
                              <option key={genero.value} value={genero.value}>
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
                        placeholder="+591 71234567"
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
                        placeholder="Dirección completa"
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

            {/* Botones de acción */}
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
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FaSave className="me-1" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UsuarioCrear;
