import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const Dashboard = () => {
  // Datos de ejemplo para probar el scroll
  const sampleCards = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Dashboard</h1>
          <p className="text-muted">Panel principal de SmartSales365</p>
        </Col>
      </Row>

      <Row>
        <Col md={6} lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="text-primary">Ventas Totales</Card.Title>
              <Card.Text className="h4">$0.00</Card.Text>
              <small className="text-muted">Sin datos disponibles</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="text-success">Productos</Card.Title>
              <Card.Text className="h4">0</Card.Text>
              <small className="text-muted">Total de productos</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="text-info">Clientes</Card.Title>
              <Card.Text className="h4">0</Card.Text>
              <small className="text-muted">Clientes registrados</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="text-warning">Reportes</Card.Title>
              <Card.Text className="h4">0</Card.Text>
              <small className="text-muted">Reportes generados</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contenido adicional para probar scroll */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title>Bienvenido a SmartSales365</Card.Title>
              <Card.Text>
                Sistema Inteligente de Gestión Comercial y Reportes Dinámicos.
                Aquí podrás gestionar productos, clientes, ventas y generar
                reportes inteligentes.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas adicionales para probar scroll */}
      {sampleCards.map((item) => (
        <Row key={item} className="mt-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Card.Title>Sección {item}</Card.Title>
                <Card.Text>
                  Contenido de ejemplo para demostrar el scroll independiente
                  del contenido. Esto simula una página con mucho contenido.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default Dashboard;
