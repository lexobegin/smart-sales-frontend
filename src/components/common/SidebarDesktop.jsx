import React, { useState } from "react";
import { Nav, Accordion, Card } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const SidebarDesktop = () => {
  const [activeKeys, setActiveKeys] = useState({});

  const handleToggle = (key) => {
    setActiveKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const sidebarContent = (
    <Nav className="flex-column sidebar-nav">
      {/* Dashboard */}
      <Nav.Item className="mb-2">
        <LinkContainer to="/dashboard">
          <Nav.Link className="rounded">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Nav.Link>
        </LinkContainer>
      </Nav.Item>

      {/* Administración - CON SUBMENÚS */}
      <Nav.Item className="mb-2">
        <Accordion>
          <Card className="border-0">
            <Accordion.Item eventKey="administracion" className="border-0">
              <Accordion.Header
                className="p-0 border-0"
                onClick={() => handleToggle("administracion")}
              >
                <div className="d-flex align-items-center w-100">
                  <i className="bi bi-gear me-2"></i>
                  <span className="flex-grow-1">Administración</span>
                  <i
                    className={`bi bi-chevron-${
                      activeKeys["administracion"] ? "up" : "down"
                    } small`}
                  ></i>
                </div>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Nav className="flex-column small">
                  <Nav.Item>
                    <LinkContainer to="/admin/usuarios">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-person me-2"></i>
                        Usuarios
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to="/admin/roles">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-shield-check me-2"></i>
                        Roles y permisos
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to="/admin/bitacora">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-journal-text me-2"></i>
                        Bitácora
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to="/admin/administradores">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-person-badge me-2"></i>
                        Administradores
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to="/admin/empleados">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-people-fill me-2"></i>
                        Empleados
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        </Accordion>
      </Nav.Item>

      {/* Producto - CON SUBMENÚS */}
      <Nav.Item className="mb-2">
        <Accordion>
          <Card className="border-0">
            <Accordion.Item eventKey="productos" className="border-0">
              <Accordion.Header
                className="p-0 border-0"
                onClick={() => handleToggle("productos")}
              >
                <div className="d-flex align-items-center w-100">
                  <i className="bi bi-box-seam me-2"></i>
                  <span className="flex-grow-1">Productos</span>
                  <i
                    className={`bi bi-chevron-${
                      activeKeys["productos"] ? "up" : "down"
                    } small`}
                  ></i>
                </div>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Nav className="flex-column small">
                  <Nav.Item>
                    <LinkContainer to="/productos/categoria">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-tags me-2"></i>
                        Categorías
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to="/productos/producto">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-box-seam me-2"></i>
                        Productos
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        </Accordion>
      </Nav.Item>

      {/* Cliente - CON SUBMENÚS */}
      <Nav.Item className="mb-2">
        <Accordion>
          <Card className="border-0">
            <Accordion.Item eventKey="clientes" className="border-0">
              <Accordion.Header
                className="p-0 border-0"
                onClick={() => handleToggle("clientes")}
              >
                <div className="d-flex align-items-center w-100">
                  <i className="bi bi-people me-2"></i>
                  <span className="flex-grow-1">Clientes</span>
                  <i
                    className={`bi bi-chevron-${
                      activeKeys["clientes"] ? "up" : "down"
                    } small`}
                  ></i>
                </div>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Nav className="flex-column small">
                  <Nav.Item>
                    <LinkContainer to="/clientes/clientes">
                      <Nav.Link className="rounded ps-4">
                        <i className="bi bi-person me-2"></i>
                        Clientes
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        </Accordion>
      </Nav.Item>
    </Nav>
  );

  return sidebarContent;
};

export default SidebarDesktop;
