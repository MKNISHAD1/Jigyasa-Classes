import React from 'react'
// import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import logo from "../../../assets/images/Logo2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const FooterUi = () => {
  return (
<section className="astra-footer">
  <div className="footer-wrapper container-fluid">

    <div className="row footer-top">

      {/* BRAND */}
      <div className="col-lg-4 footer-brand">
        <h2 className="logo">Jigyasa Classes</h2>

        <p>
          Learn anytime, anywhere with expert guidance.
          Jigyasa Classes helps you prepare smarter for
          competitive exams.
        </p>

        <div className="socials">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-youtube"></i>
          <i className="fab fa-linkedin"></i>
        </div>
      </div>

      {/* COURSES */}
      <div className="col-lg-2 footer-links">
        <h5>Courses</h5>
        <ul>
          <li>UPSC</li>
          <li>SSC</li>
          <li>JEE</li>
          <li>Banking</li>
        </ul>
      </div>

      {/* COMPANY */}
      <div className="col-lg-3 footer-links">
        <h5>Platform</h5>
        <ul>
          <li>About</li>
          <li>All Courses</li>
          <li>Blog</li>
          <li>Testimonials</li>
        </ul>
      </div>

      {/* SUPPORT */}
      <div className="col-lg-3 footer-links">
        <h5>Support</h5>
        <ul>
          <li>Contact</li>
          <li>FAQ</li>
          <li>Privacy Policy</li>
          <li>Terms & Conditions</li>
        </ul>
      </div>

    </div>

    {/* BOTTOM BAR */}
    <div className="footer-bottom">
      <p>© 2026 Jigyasa Classes. All rights reserved.</p>

      <div className="policy-links">
        <span>Privacy Policy</span>
        <span>Terms</span>
      </div>
    </div>

  </div>
</section>
  );
};

export default FooterUi;