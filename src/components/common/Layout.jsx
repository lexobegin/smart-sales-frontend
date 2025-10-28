import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Header from "./Header";
import SidebarDesktop from "./SidebarDesktop";
import SidebarMobile from "./SidebarMobile";

const Layout = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarShow(!sidebarShow);
  };

  const handleHideSidebar = () => {
    setSidebarShow(false);
  };

  useEffect(() => {
    const isDesktop = window.innerWidth >= 992;
    document.body.style.overflow = isDesktop ? "hidden" : "auto";

    const handleResize = () => {
      const isNowDesktop = window.innerWidth >= 992;
      document.body.style.overflow = isNowDesktop ? "hidden" : "auto";
    };

    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header onToggleSidebar={handleToggleSidebar} />

      <Container fluid className="flex-grow-1 p-0">
        <Row className="g-0 flex-fill">
          {/* Sidebar Desktop */}
          <div className="d-none d-lg-block sidebar-fixed">
            <div className="content-scroll h-100">
              <div className="p-3">
                <SidebarDesktop />
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <Col className="main-content-container">
            <div className="content-scroll main-content p-3 p-lg-4">
              {children}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Sidebar Mobile */}
      <SidebarMobile show={sidebarShow} onHide={handleHideSidebar} />
    </div>
  );
};

export default Layout;
