import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHouse,faBookOpen,faEnvelope,faClipboardList,faUser,faTrophy,faArrowRightFromBracket,faAngleDown, faBars,faClose,faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, Accordion, Offcanvas} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../../assets/css/style.scss";
import "../../../i18n/i18n";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./LanguageSwitch";
import { useCategories } from "../../../hooks/useCategories";
import { AuthContext } from "../../backend/context/Auth";
import { AUTH_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "../../../constants/nevigation/routes";
import BrandLogo from "./BrandLogo";

const HeaderUi = () => {

  const { categories, subcategories, loading } = useCategories();
  const { t, i18n } = useTranslation();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      {/* Repsonsive Text Ribbon  */}
      <div className="py-0">
        <div className="line text-center text-light">Responsive Test</div>
      </div>

      {/* Navbar Production Code */}
      <div className="container-fluid m-0 p-0">
        <Navbar expand="lg" className="Navbar">

          {/* Navbar Left Part: Brand Logo Section */}
          <div className="Navbar_Left_Part">
            
            <Navbar.Brand href={PUBLIC_ROUTES.HOME}>
              <BrandLogo/>
            </Navbar.Brand>

          </div>

          {/* Navbar Center Part: Nav Link and Dropdown Section */}
          <div className="Navbar_Center_Part">

            <Navbar.Collapse id="basic-navbar-nav" className="d-none Nav_Items">

              {/* Desktop/Laptop Navigation Links */}
              <Nav className="Menu_Items_Gap">

                {/* Home Link */}
                <li>
                  <Link to={PUBLIC_ROUTES.HOME} className="nav-link">
                    {t("header.home")}
                  </Link>
                </li>

                {/* Dropdown Exams  */}
                <li className="Menu_Item has-dropdown">
                  <span className="nav-link">Exams <FontAwesomeIcon icon={faAngleDown}/></span>
                  <ul className="Dropdown_Menu_Custom Nav_Dropdown">
                      {loading && (
                        <li className="Dropdown_Item text-muted">Loading...</li>
                      )}

                      {!loading &&
                        categories.map((cat) => {
                          const subs = subcategories[cat.id] || [];

                          return (
                            <li key={cat.id} className={subs.length ? "has-submenu" : ""}>
                              {subs.length ? (
                                <>
                                  <span className="Dropdown_Item Submenu_Title">
                                    {cat.name[i18n.language] ?? cat.name.en}
                                    <span className="Arrow"> › </span>
                                  </span>

                                  <ul className="Submenu">
                                    {subs.map((sub) => (
                                      <li key={sub.id}>
                                        <Link
                                          to={`/exams/${cat.id}/${sub.id}`}
                                          className="Dropdown_Item"
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
                                  className="Dropdown_Item"
                                >
                                  {cat.name[i18n.language] ?? cat.name.en}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                  </ul>
                </li>

                {/* Courses Link */}
                <li>
                  <Link to={PUBLIC_ROUTES.COURSES} className="nav-link">
                    Courses
                  </Link>
                </li>

                {/* Dropdown Pages */}
                <li className="Menu_Item has-dropdown">
                  <span className="nav-link">Pages <FontAwesomeIcon icon={faAngleDown}/></span>

                  <ul className="Dropdown_Menu_Custom">
                    <li>
                      <Link to="/CourseCard" className="Dropdown_Item">
                        Course Card
                      </Link>
                    </li>

                    <li className="has-submenu">
                      <span className="Dropdown_Item Submenu_Title">
                        Instructors <span className="Arrow"> › </span>
                      </span>

                      <ul className="Submenu">
                        <li>
                          <Link to="/instructors" className="Dropdown_Item">
                            Instructors
                          </Link>
                        </li>
                        <li>
                          <Link to="/become-instructor" className="Dropdown_Item">
                            Become Instructor
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/instructor-details"
                            className="Dropdown_Item"
                          >
                            Instructor Details
                          </Link>
                        </li>
                      </ul>
                    </li>

                    <li>
                      <Link to="/faq" className="Dropdown_Item">
                        FAQ
                      </Link>
                    </li>

                    <li>
                      <Link to="/privacy-policy" className="Dropdown_Item">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* About Us Link */}
                <li>
                  <Link to={PUBLIC_ROUTES.ABOUT} className="nav-link">
                    {t("header.about")}
                  </Link>
                </li>

                {/* Contact Link */}
                <li>
                  <Link to={PUBLIC_ROUTES.CONTACT} className="nav-link">
                    Contact Us
                  </Link>
                </li>

              </Nav>

              {/* Mobile Offcanvas Navbar*/}

              <Offcanvas show={show} onHide={handleClose} placement="start" scroll={true}>

                {/* Brand Logo Header Section*/}
                <Offcanvas.Header className="Offcanvas_Header">

                  {/* Brandd Logo */}
                  <Offcanvas.Title >
                    <BrandLogo/>
                  </Offcanvas.Title>

                  {/* Canvas Close Button */}
                  <button className="Offcanvas_Close_Btn" onClick={handleClose}>
                      <FontAwesomeIcon icon={faClose} className='Offcanvas_Close_Btn_Icon'/>
                  </button>
                

                </Offcanvas.Header>

                {/* Canvas Body Navigation Section */}
                <Offcanvas.Body className="New_Offcanvas">

                  {/* Signed User Welcome Card */}
                  { user ? (
                      <div className="Welcome_Card">

                        <img
                          src={
                            user.profile_pic ||
                            "/images/default-user.png"
                          }
                          alt=""
                          className="Welcome_Avatar"
                        />

                        <h5 className="Welcome_Text">
                          Welcome <span>Back!</span>
                        </h5>

                        <p className="Welcome_User_Name">
                          {user.name}
                        </p>

                        <small className="Welcome_User_Role">
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
                          to={DASHBOARD_ROUTES.DASHBOARD}
                          className="Dashboard_Button"
                        >
                          View Dashboard <FontAwesomeIcon icon={faArrowRight} />
                        </Link>

                      </div>

                    ) : (

                      // Guest User

                      <div className="Guest_Actions">

                        <Link
                          to={AUTH_ROUTES.REGISTER}
                          className="Signup_Btn"
                        >
                          Sign Up
                        </Link>

                        <Link
                          to={AUTH_ROUTES.LOGIN}
                          className="Login_Btn"
                        >
                          Login
                        </Link>

                      </div>

                    )
                  }

                  {/* Sidebar Menu */}
                  <div className="Sidebar_Menu">

                    {/* Home Link */}
                    <Link to={PUBLIC_ROUTES.HOME} className="Sidebar_Link">
                      <FontAwesomeIcon icon={faHouse} className="Sidebar_Icon"/>
                      <span className="Sidebar_Icon_Text">Home</span>
                    </Link>

                    {/* About Us Link */}
                    <Link to={PUBLIC_ROUTES.ABOUT} className="Sidebar_Link">
                      <FontAwesomeIcon icon={faUser} className="Sidebar_Icon"/>
                      <span className="Sidebar_Icon_Text">About Us</span>
                    </Link>

                    {/* Coourses Link */}
                    <Link to={PUBLIC_ROUTES.COURSES} className="Sidebar_Link">
                      <FontAwesomeIcon icon={faBookOpen} 
                      className="Sidebar_Icon"/>
                      <span className="Sidebar_Icon_Text">Courses</span>
                    </Link>

                  </div>

                  {/* Exams Dropdown */}

                  <Accordion flush className="Sidebar_Accordion">

                    <Accordion.Item eventKey="1">

                      <Accordion.Header>

                        <div className="Menu_Header">
                          <FontAwesomeIcon icon={faClipboardList} className="Sidebar_Icon"/>
                          <span className="Sidebar_Icon_Text">Exams</span>
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

                  {/* Pages Dropdown */}

                  <Accordion flush className="Sidebar_Accordion">

                    <Accordion.Item eventKey="2">

                      <Accordion.Header>

                        <div className="Menu_Header">
                          <FontAwesomeIcon icon={faBookOpen} className="Sidebar_Icon"/>
                          <span className="Sidebar_Icon_Text">Pages</span>
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

                  {/* Contact Link */}
                  <Link to={PUBLIC_ROUTES.CONTACT} className="Sidebar_Link">
                    <FontAwesomeIcon icon={faEnvelope} className="Sidebar_Icon"/>
                    <span className="Sidebar_Icon_Text">Contact Us</span>
                  </Link>

                  {/* Motivation Card */}
                  <div className="Learning_Card">

                    <FontAwesomeIcon
                      icon={faTrophy}
                      className="Trophy_Icon"
                    />

                    <div className="d-flex flex-column align-self-center">

                      <h6 className="Trophy_Text">Keep Learning, Keep Growing!</h6>

                      <p className="Trophy_Paragraph">
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
          </div>

          {/* Navbar Right Part : Login and Wishlist Section */}
          <div className="Navbar_Right_Part">

            <div className="d-flex gap-3 px-3 Rightside_NavItems">

              {/* Language toggle Switch */}
              <LanguageSwitch />

              {/* Add To Wishlist icon */}
              <Link
                    to="#"
                    className="d-none d-sm-block d-xl-none "
                  >
                    <FontAwesomeIcon icon={faHeart} className="Heart_Icon d-flex"/>
              </Link>

              {/* Login-Button */}
              {
                user ? (
                  <Link
                    to={DASHBOARD_ROUTES.DASHBOARD}
                    className="User_Profile_Link  d-none d-xl-block "
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
                    to={AUTH_ROUTES.LOGIN}
                    className="Primary_Button_Opposite d-none d-xl-block"
                  >
                    Login/SignUp
                  </Link>
                )
              }
              
              {/* Login icon  */}
              {
                user ? (
                  <Link
                    to={DASHBOARD_ROUTES.DASHBOARD}
                    className="User_Profile_Link d-none d-sm-block d-xl-none"
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
                    to={AUTH_ROUTES.LOGIN}
                    className="d-none d-sm-block d-xl-none "
                  >
                    <FontAwesomeIcon icon={faCircleUser} className="User_Icon d-flex" />
                  </Link>
                )
              }

              {/*Navbar Toggle icon  */}
              <button
                className="Navbar_Toggler d-sm-block d-lg-none"
                aria-controls="basic-navbar-nav "
                onClick={handleShow}
              >

                <FontAwesomeIcon icon={faBars} className="Navbar_Toggler_Icon"/>
              </button>

            </div>
          </div>

        </Navbar>
      </div>
    </>
  );
};

export default HeaderUi;
