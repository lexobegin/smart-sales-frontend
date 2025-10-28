import React from "react";
import { Navbar, Nav, Container, Dropdown, Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        {/* Botón menú para móviles */}
        <Button
          variant="outline-light"
          className="d-lg-none me-2"
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list"></i>
        </Button>

        <Navbar.Brand href="#" className="me-auto">
          <strong>SmartSales365</strong>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#dashboard" className="text-white">
              Dashboard
            </Nav.Link>
          </Nav>

          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-light"
                id="dropdown-user"
                className="d-flex align-items-center"
              >
                <i className="bi bi-person-circle me-2"></i>
                {user?.nombre_completo || user?.email || "Usuario"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>
                  <div>
                    <strong>{user?.nombre_completo || "Usuario"}</strong>
                    <br />
                    <small className="text-muted">{user?.email}</small>
                    <br />
                    <small className="text-info">{user?.tipo_usuario}</small>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
