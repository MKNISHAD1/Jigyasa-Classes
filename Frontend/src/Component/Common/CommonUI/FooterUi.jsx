import React from 'react'
import logo from '../../../assets/images/logo2.png';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
const FooterUi = () => {

      const { t, i18n } = useTranslation();
  return (
   <>
   <div className='Footer_Section conatiner '>
    <div className="row">
        <div className="col-lg-3 col-sm-6 d-block">
            <div className="d-flex">
              <img src={logo} className="Brand_Logo" />
              <div>
                <h5 className="Brand_Name">
                  <b>{t("Logo.title")}</b>
                </h5>
                <p className="Brand_Tagline">{t("Logo.tagline")}</p>
              </div>
            </div>
              <p className='text-left pt-2'>Empower Your Learning with Expert Guidance from Top Faculties </p>
        </div>
        <div className="col-lg-3 col-sm-6 ">
            <h3>Category</h3>
            <ul>
              <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/about" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>
                            <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/about" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>
                            <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/about" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>
            </ul>
        </div>
        <div className="col-lg-3 col-sm-6">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/about" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>
                            <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/about" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>
                            <li>
                <Link to="/" className="nav-link">
                  {t("header.home")}
                </Link>
              </li>

              <li>
                <Link to="/about" className="nav-link">
                  {t("header.about")}
                </Link>
              </li>
            </ul>
        </div>
        <div className="col-lg-3 col-sm-6">
            <h3>Quick Connect</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Et quisquam accusamus fuga exercitationem ex? Aspernatur blanditiis consequuntur ipsam voluptate a deserunt doloribus perferendis quos error!</p>

        </div>
    </div>
   </div>
   <div className="Footer_Label">
        HELLO TESTING for label
   </div>
   </>
  )
}

export default FooterUi