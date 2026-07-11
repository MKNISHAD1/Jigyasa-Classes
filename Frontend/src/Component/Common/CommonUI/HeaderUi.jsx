import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-regular-svg-icons";
import { faCartShopping,faHouse,faBookOpen,faEnvelope,faClipboardList,faUser,faTrophy,faArrowRightFromBracket,faUserGear } from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, Accordion, Offcanvas} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../../assets/css/style.scss";
import "../../../i18n/i18n";
import { useTranslation } from "react-i18next";
import logo2 from "../../../assets/images/Logo2.png";
import LanguageSwitch from "./LanguageSwitch";
import { useCategories } from "../../../hooks/useCategories";
import { AuthContext } from "../../backend/context/Auth";

const HeaderUi = () => {

  const { categories, subcategories, loading } = useCategories();

  const [show, setShow] = useState(false);
  const { t, i18n } = useTranslation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { user, logout } = useContext(AuthContext);

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

          <Navbar.Brand href="/">
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

            <Offcanvas show={show} onHide={handleClose} placement="start" scroll={true}>
              <Offcanvas.Header closeButton className="Offcanvas_header">
                <Offcanvas.Title >
                  <div className="d-flex Brand_Section">
                    <img src={logo2} className="Brand_Logo" />
                    <div className="">
                      <h5 className="Brand_Name">
                        <b>{t("Logo.title")}</b>
                      </h5>
                      <p className="Brand_Tagline">{t("Logo.tagline")}</p>
                    </div>
                  </div>
                </Offcanvas.Title>
              </Offcanvas.Header>

              <Offcanvas.Body className="New_Offcanvas">

                    {/* Guest User */}

                    {
                      user ? (

                        <div className="Welcome_Card">

                          <img
                            src={
                              user.profile_pic ||
                              "/images/default-user.png"
                            }
                            alt=""
                            className="Welcome_Avatar"
                          />

                          <h5>
                            Welcome Back!
                          </h5>

                          <p>
                            {user.name}
                          </p>

                          <small>
                            {
                              Array.isArray(user?.roles)
                                ? (
                                    user.roles[0]?.name ||
                                    user.roles[0] ||
                                    "Student"
                                  )
                                : "Student"
                            }
                          </small>

                          <Link
                            to="/dash"
                            className="Dashboard_Button"
                          >
                            View Dashboard
                          </Link>

                        </div>

                      ) : (

                        <div className="Guest_Actions">

                          <Link
                            to="/register"
                            className="Signup_Btn"
                          >
                            Sign Up
                          </Link>

                          <Link
                            to="/login"
                            className="Login_Btn"
                          >
                            Login
                          </Link>

                        </div>

                      )
                    }

                    {/* Menu */}

                    <div className="Sidebar_Menu">

                      <Link to="/" className="Sidebar_Link">
                        <FontAwesomeIcon icon={faHouse}/>
                        <span>Home</span>
                      </Link>

                      <Link to="/about" className="Sidebar_Link">
                        <FontAwesomeIcon icon={faUser}/>
                        <span>About Us</span>
                      </Link>

                      <Link to="/courses" className="Sidebar_Link">
                        <FontAwesomeIcon icon={faBookOpen}/>
                        <span>Courses</span>
                      </Link>

                    </div>

                    {/* Exams */}

                    <Accordion flush className="Sidebar_Accordion">

                      <Accordion.Item eventKey="1">

                        <Accordion.Header>

                          <div className="Menu_Header">
                            <FontAwesomeIcon icon={faClipboardList} style={{color:"#1363b8"}}/>
                            <span>Exams</span>
                          </div>

                        </Accordion.Header>

                        <Accordion.Body>

                          {categories.map((cat) => (

                            <Link
                              key={cat.id}
                              to={`/exams/${cat.id}`}
                              className="Sidebar_SubLink"
                            >
                              {cat.name[i18n.language] ?? cat.name.en}
                            </Link>

                          ))}

                        </Accordion.Body>

                      </Accordion.Item>

                    </Accordion>

                    {/* Pages */}

                    <Accordion flush className="Sidebar_Accordion">

                      <Accordion.Item eventKey="2">

                        <Accordion.Header>

                          <div className="Menu_Header">
                            <FontAwesomeIcon icon={faBookOpen} style={{color:"#1363b8"}}/>
                            <span>Pages</span>
                          </div>

                        </Accordion.Header>

                        <Accordion.Body>

                          <Link to="/faq" className="Sidebar_SubLink">
                            FAQ
                          </Link>

                          <Link to="/privacy-policy" className="Sidebar_SubLink">
                            Privacy Policy
                          </Link>

                        </Accordion.Body>

                      </Accordion.Item>

                    </Accordion>

                    {/* Contact */}

                    <Link to="/Contact-Us" className="Sidebar_Link">
                      <FontAwesomeIcon icon={faEnvelope}/>
                      <span>Contact Us</span>
                    </Link>

                    {/* Motivation Card */}

                    <div className="Learning_Card">

                      <FontAwesomeIcon
                        icon={faTrophy}
                        className="Trophy_Icon"
                      />

                      <div>

                        <h6>Keep Learning, Keep Growing!</h6>

                        <p>
                          Explore new courses and achieve your goals.
                        </p>

                      </div>

                    </div>

                    {/* Logout Button */}
                    {
                      user && (
                        <div className="Logout_Section text-center">
                          <button
                            className="Logout_Btn"
                            onClick={() => {
                              logout();
                              handleClose();
                            }}
                          >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} />
                            <span className="logout">Log out</span>
                          </button>
                        </div>
                      )
                    }


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
            {
              user ? (
                <Link
                  to="/dash"
                  className="User_Profile_Link  d-none d-xl-block"
                >
                  <img
                    src={
                      user.profile_pic ||
                      "/images/default-user.png"
                    }
                    alt="profile"
                    className="Navbar_Profile"
                  />

                  <span className="p-1">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="Button_Style1  d-none d-xl-block"
                >
                  Login/SignUp
                </Link>
              )
            }
            
            {/* Login icon  */}
            {
              user ? (
                <Link
                  to="/dash"
                  className="User_Profile_Link  d-sm-block d-xl-none"
                >
                  <img
                    src={
                      user.profile_pic ||
                      "/images/default-user.png"
                    }
                    alt="profile"
                    className="Navbar_Profile"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="d-none d-sm-block d-xl-none"
                >
                  <FontAwesomeIcon icon={faCircleUser} className="User_Icon" />
                </Link>
              )
            }
            {/* <Link to="/login" className="d-none d-sm-block d-xl-none ">
                <FontAwesomeIcon icon={faCircleUser} className="User_Icon" />
            </Link> */}

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
