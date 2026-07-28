import React, { useContext } from 'react'
import logo from "../../../assets/images/Logo2.png"
import { Navbar } from 'react-bootstrap'
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from '../../../constants/nevigation/routes'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import LanguageSwitch from '../../Common/CommonUI/LanguageSwitch'
import { AuthContext } from '../../backend/context/Auth'
import { Link } from 'react-router-dom'

const DashboardHeaderUi = ({onMenuClick }) => {
      const { t, i18n } = useTranslation();
      const { user } = useContext(AuthContext);
  return (
    <>
    <div className="dashboard-header d-flex align-items-center justify-content-between py-3">
        {/* Left Side */}
        <button
            className="btn menu-btn" onClick={onMenuClick} >
            <FontAwesomeIcon icon={faBars} style={{fontSize:'27px', color:'#1363b8'}}/>
        </button>
        
        {/* Middle  */}
        <Navbar.Brand to={DASHBOARD_ROUTES.DASHBOARD}  >
            <div className="d-flex Brand_Section">
                <img src={logo} className="Brand_Logo" />
                <div className="d-md-block">
                <h5 className="Brand_Name">
                    <b>{t("Logo.title")}</b>
                </h5>
                <p className="Brand_Tagline">{t("Logo.tagline")}</p>
                </div>
            </div>
        </Navbar.Brand>

        {/* Right Side */}
        <div className="d-flex gap-3 px-3 Rightside_NavItems">
            {/* Language toggle Switch */}
            <LanguageSwitch />

            {/* Login-Button */}
            {
              user ? (
                <Link
                  to={DASHBOARD_ROUTES.DASHBOARD}
                  className="User_Profile_Link  d-md-block"
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
                  className="Button_Style1  d-md-block"
                >
                  Login/SignUp
                </Link>
              )
            }
        </div>
    </div>
    </>
  )
}

export default DashboardHeaderUi