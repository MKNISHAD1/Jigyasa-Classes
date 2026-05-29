import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-regular-svg-icons";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, Accordion, Offcanvas} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../../assets/css/style.scss";
import "../../../i18n/i18n";
import { useTranslation } from "react-i18next";
import logo2 from "../../../assets/images/Logo2.png";
import LanguageSwitch from "./LanguageSwitch";
import { useCategories } from "../../../hooks/useCategories";

const HeaderUi = () => {

  const { categories, subcategories, loading } = useCategories();

  const [show, setShow] = useState(false);
  const { t, i18n } = useTranslation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Testing Arena  */}

      {/* 
<div className="conainer-fluid">
  <div className='box text-center p-4'>
    <button className='butt'>
      <b className='p-2 '>Test the Button</b>
    </button>
    
  </div>
  <div className='box text-center p-4'>
    <button className='buttt'>
      <b className='p-2 '>Test the Button</b>
    </button>
    
  </div>
</div> */}

<div className="py-3">
<div className="line p-2 text-center text-light">Responsive Test</div>
</div>

      {/* Production Code  */}

      {/* <div>
        <div className="media_label">
          <Link to="/about  ">
            <FontAwesomeIcon icon={faHouse} className=" text-light px-2" />
          </Link>
          <FontAwesomeIcon icon={faCircleUser} className="px-4 text-light" />
        </div>
      </div> */}

      <div className="container-fluid m-0 p-0">
        <Navbar expand="lg" className="shadow">
          {/* Left side LOGO*/}

          <Navbar.Brand href="#">
            <div className="d-flex Brand_Section">
              <img src={logo2} className="Brand_Logo" />
              <div className="d-none d-md-block">
                <h5 className="Brand_Name">
                  <b>{t("Logo.title")}</b>
                </h5>
                <p className="Brand_Tagline">{t("Logo.tagline")}</p>
              </div>
            </div>
          </Navbar.Brand>

          <Navbar.Collapse id="basic-navbar-nav" className="d-none Nav_Items">
            {/* Dropdown Logic working  */}

            <Nav className="Menu_Items_Gap">
              <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/About" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>

              <li>
                <Link to="/Courses" className="nav-link">
                  Courses
                </Link>
              </li>

              <li className="menu-item has-dropdown">
                <span className="nav-link">Exams ▾</span>

              <ul className="dropdown-menu-custom Nav_Dropdown">
                  {loading && (
                    <li className="dropdown-item text-muted">Loading...</li>
                  )}

                  {!loading &&
                    categories.map((cat) => {
                      const subs = subcategories[cat.id] || [];

                      return (
                        <li key={cat.id} className={subs.length ? "has-submenu" : ""}>
                          {subs.length ? (
                            <>
                              <span className="dropdown-item submenu-title">
                                {cat.name[i18n.language] ?? cat.name.en}
                                <span className="arrow"> › </span>
                              </span>

                              <ul className="submenu">
                                {subs.map((sub) => (
                                  <li key={sub.id}>
                                    <Link
                                      to={`/exams/${cat.id}/${sub.id}`}
                                      className="dropdown-item"
                                    >
                                      {sub.name[i18n.language] ?? sub.name.en}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <Link
                              to={`/exams/${cat.id}`}
                              className="dropdown-item"
                            >
                              {cat.name[i18n.language] ?? cat.name.en}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </li>

              {/* Dropdown Code  */}
              <li className="menu-item has-dropdown">
                <span className="nav-link">Pages ▾</span>

                <ul className="dropdown-menu-custom">
                  <li>
                    <Link to="/CourseCard" className="dropdown-item">
                      Course Card
                    </Link>
                  </li>

                  <li className="has-submenu">
                    <span className="dropdown-item submenu-title">
                      Instructors <span className="arrow"> › </span>
                    </span>

                    <ul className="submenu">
                      <li>
                        <Link to="/instructors" className="dropdown-item">
                          Instructors
                        </Link>
                      </li>
                      <li>
                        <Link to="/become-instructor" className="dropdown-item">
                          Become Instructor
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/instructor-details"
                          className="dropdown-item"
                        >
                          Instructor Details
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <Link to="/faq" className="dropdown-item">
                      FAQ
                    </Link>
                  </li>

                  <li>
                    <Link to="/privacy-policy" className="dropdown-item">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/Contact-Us" className="nav-link">
                  Contact Us
                </Link>
              </li>
            </Nav>

            {/* Mobile Offcanvas */}

            <Offcanvas show={show} onHide={handleClose} placement="start">
              <Offcanvas.Header closeButton className="Offcanvas_header">
                <Offcanvas.Title >
                  <b style={{ paddingLeft: 145 }}>Menu</b><br />

                  <div className="pt-3" style={{ paddingLeft: 105 }}>
                    <a href="/signup" className="Button_Style " >Sign Up</a> <a href="/login" className="Button_Style ">Login</a>
                  </div>
                </Offcanvas.Title>
              </Offcanvas.Header>

              <Offcanvas.Body className="Offcanvas_MenuItem">
                <Accordion alwaysOpen>
                  {/* Home */}
                  <div className="test">
                    <Link
                      to="/"
                      className="nav-link fw-bold"
                      onClick={handleClose}
                    >
                      {t("header.home")}
                    </Link>
                  </div>

                  <div className="test">
                    <Link
                      to="/about" className="nav-link fw-bold"  onClick={handleClose}
                    >
                      {t("header.about")}
                    </Link>
                  </div>

                  <div className="test">
                    <Link
                      to="/courses" className="nav-link fw-bold"  onClick={handleClose}
                    >
                      Courses
                    </Link>
                  </div>

                  {/* Exams  */}

                  <Accordion.Item eventKey="exams">
                      <Accordion.Header>Exams</Accordion.Header>
                      <Accordion.Body>
                        {categories.map((cat) => {
                          const subs = subcategories[cat.id] || [];

                          return (
                            <div key={cat.id}>
                              {subs.length ? (
                                <Accordion flush>
                                  <Accordion.Item eventKey={`exam-${cat.id}`}>
                                    <Accordion.Header>
                                      {cat.name[i18n.language] ?? cat.name.en}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                      {subs.map((sub) => (
                                        <Link
                                          key={sub.id}
                                          to={`/exams/${cat.id}/${sub.id}`}
                                          className="nav-link"
                                          onClick={handleClose}
                                        >
                                          {sub.name[i18n.language] ?? sub.name.en}
                                        </Link>
                                      ))}
                                    </Accordion.Body>
                                  </Accordion.Item>
                                </Accordion>
                            ) : (
                              <Link
                                to={`/exams/${cat.id}`}
                                className="nav-link"
                                onClick={handleClose}
                              >
                                {cat.name[i18n.language] ?? cat.name.en}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </Accordion.Body>
              </Accordion.Item>

                  {/* Pages  */}
                  <Accordion.Item eventKey="pages">
                    <Accordion.Header className="test1">Pages</Accordion.Header>
                    <Accordion.Body>
                      <Link
                        to="/about"
                        className="nav-link"
                        onClick={handleClose}
                      >
                        About Us
                      </Link>
                      {/* Nested Accordion */}

                      <Link
                        to="/faq"
                        className="nav-link"
                        onClick={handleClose}
                      >
                        FAQ
                      </Link>

                      <Link
                        to="/privacy-policy"
                        className="nav-link"
                        onClick={handleClose}
                      >
                        Privacy Policy
                      </Link>
                      <Accordion flush>
                        <Accordion.Item eventKey="instructors">
                          <Accordion.Header>Instructors</Accordion.Header>
                          <Accordion.Body>
                            <Link
                              to="/instructors"
                              className="nav-link"
                              onClick={handleClose}
                            >
                              Instructors
                            </Link>
                            <Link
                              to="/become-instructor"
                              className="nav-link"
                              onClick={handleClose}
                            >
                              Become Instructor
                            </Link>
                            <Link
                              to="/instructor-details"
                              className="nav-link"
                              onClick={handleClose}
                            >
                              Instructor Details
                            </Link>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </Accordion.Body>
                  </Accordion.Item>




                  {/* Blog */}
                  <div className="test">
                    <Link to="/blog" className="nav-link" onClick={handleClose}>
                      <b>Contact Us</b>
                    </Link>
                  </div>

                  {/* Auth */}
                  <div className="test">
                    <Link
                      to="/login"
                      className="nav-link"
                      onClick={handleClose}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="nav-link"
                      onClick={handleClose}
                    >
                      Register
                    </Link>
                  </div>

                </Accordion>
              </Offcanvas.Body>
            </Offcanvas>
          </Navbar.Collapse>

          {/* RIGHT (ALWAYS VISIBLE) */}
          <div className="d-flex gap-3 px-3 Rightside_NavItems">
            {/* Language toggle Switch */}
            <LanguageSwitch />

            {/* Add To Cart icon */}
            <FontAwesomeIcon icon={faCartShopping} className="Cart_Icon"/>

            {/* Login-Button */}
            <Link to="/login" className="Button_Style1 d-none d-xl-block">
              Login/SignUp
            </Link>
            
            {/* Login icon  */}
            <Link to="/login" className="d-none d-sm-block d-xl-none ">
                <FontAwesomeIcon icon={faCircleUser} className="User_Icon" />
            </Link>

            {/* Toggle icon  */}
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              onClick={handleShow}
            />
          </div>
        </Navbar>
      </div>
    </>
  );
};

export default HeaderUi;
