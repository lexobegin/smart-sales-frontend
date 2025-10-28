import React from "react";
import { Spinner, Container } from "react-bootstrap";

const LoadingSpinner = () => {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
    >
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </Container>
  );
};

export default LoadingSpinner;
