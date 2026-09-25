import React, { useContext } from 'react'
import { Navbar } from 'react-bootstrap'
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from '../../../constants/nevigation/routes'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import LanguageSwitch from '../../Common/CommonUI/LanguageSwitch'
import { AuthContext } from '../../backend/context/Auth'
import { Link } from 'react-router-dom'
import BrandLogo from '../../Common/CommonUI/BrandLogo'

const DashboardHeaderUi = ({onMenuClick }) => {
      const { t } = useTranslation();
      const { user } = useContext(AuthContext);
  return (
    <>
    <div className="container-fluid m-0 p-0 ">
      <Navbar expand="lg" className="Navbar">

        {/* Left Side */}
        {/*Navbar Toggle and Brand icon  */}
          <div className="Dashbord_Left_Part">
          
          {/* Navbar toggle */}
          <div className="ms-2 d-flex align-items-center">
            <button
              className="Navbar_Toggler"
              aria-controls="basic-navbar-nav"
              onClick={onMenuClick}
            >
              <FontAwesomeIcon icon={faBars} className="Navbar_Toggler_Icon"/>
            </button>

            {/* Navbar Brand */}
            <Navbar.Brand href={DASHBOARD_ROUTES.DASHBOARD} >
              <BrandLogo />
            </Navbar.Brand>

          </div>


        </div>

        {/* Right Side */}
        <div className="Navbar_Right_Part">
          <div className="d-flex gap-3 px-3 Rightside_NavItems">
              {/* Language toggle Switch */}
              <LanguageSwitch />

              {/* Login-Button */}
              {
                user ? (
                  <Link
                    to={DASHBOARD_ROUTES.VIEW_PROFILE}
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
                    to={DASHBOARD_ROUTES.VIEW_PROFILE}
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
          </div>
        </div>

      </Navbar>
    </div>
    </>
  )
}

export default DashboardHeaderUi