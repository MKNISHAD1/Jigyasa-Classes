import React, { useState } from 'react'
import { NavDropdown, Nav, Navbar, Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import Offcanvas from 'react-bootstrap/Offcanvas';
import logo from '../../assets/images/Logo.png'
import '../../assets/css/style.scss'
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "../../i18n/i18n"; // make sure i18n is loaded once

const Header = () => {
  const [show, setShow] = useState(false);
  const { t, i18n } = useTranslation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // toggle language
  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  };

  return (
    <>
      <header>
        <section className='section1'>
          <div className="container-fluid m-0 p-0">
            <Navbar expand="lg shadow">
              <Navbar.Brand href="/" className='logo'>
                <div className="d-flex">
                  <img src={logo} alt="" />
                  <div className="d-none d-sm-block">
                    <h5 className='pt-2 Name'>{t("Logo.title")}</h5> 
                    <p className='tag'>{t("Logo.tagline")}</p>
                  </div>
                </div>
              </Navbar.Brand>

              <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleShow} />
              <Navbar.Collapse id="basic-navbar-nav" className='d-none nav'>
                <Nav className='ms-auto'>
                  <Link to="/" className='nav-link'>{t("header.home")}</Link>
                  <Link to="/about" className='nav-link'>{t("header.about")}</Link>
                  <Link to="/" className='nav-link'>{t("header.services")}</Link>
                  <Link to="/" className='nav-link'>{t("header.projects")}</Link>
                </Nav>

                <Nav className='ms-auto'>
                  <Link to="/register" className='nav-link'>{t("header.signup")}</Link>
                  <Link to="/login" className='nav-link'>{t("header.login")}</Link>
                </Nav>

                {/* 🔘 Language toggle button */}
                <Button
                  variant="outline-primary"
                  className="ms-3"
                  onClick={toggleLang}
                >
                  {i18n.language === "en" ? "हिन्दी" : "English"}
                </Button>

                {/* Mobile Offcanvas */}
                <Offcanvas show={show} onHide={handleClose}>
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                <Nav>
                  <Link to="/" className='nav-link'>{t("header.home")}</Link>
                  <Link to="/about" className='nav-link'>{t("header.about")}</Link>
                  <Link to="/services" className='nav-link'>{t("header.services")}</Link>
                  <Link to="/projects" className='nav-link'>{t("header.projects")}</Link>
                  <Link to="/register" className='nav-link'>{t("header.signup")}</Link>
                  <Link to="/login" className='nav-link'>{t("header.login")}</Link>
                </Nav>

                  </Offcanvas.Body>
                </Offcanvas>
              </Navbar.Collapse>
            </Navbar>
          </div>
        </section>
      </header>
    </>
  )
}

export default Header;
