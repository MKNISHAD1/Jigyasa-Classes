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
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { faClockFour, faEnvelope, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';

const FooterUi = () => {
  return (
<section className="astra-footer">
  <div className="footer-wrapper container-fluid">

<div className="row footer-top">

  {/* BRAND */}
  <div className="col-lg-3 col-md-6 col-6 footer-brand">
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

  {/* QUICK LINKS */}
  <div className="col-lg-2 col-md-6 col-6 footer-links">
    <h5>Quick Links</h5>
    <ul>
      <li>Home</li>
      <li>About Us</li>
      <li>Courses</li>
      <li>Blog</li>
      <li>Contact Us</li>
    </ul>
  </div>

  {/* COURSES */}
  <div className="col-lg-2 col-md-6 col-6 footer-links">
    <h5>Courses</h5>
    <ul>
      <li>UPSC</li>
      <li>SSC</li>
      <li>JEE</li>
      <li>Banking</li>
      <li>Railway</li>
    </ul>
  </div>

  {/* EXAMS */}
  <div className="col-lg-2 col-md-6 col-6 footer-links">
    <h5>Popular Exams</h5>
    <ul>
      <li>UPSC</li>
      <li>SSC CGL</li>
      <li>PSC</li>
      <li>Teaching</li>
      <li>Railway</li>
    </ul>
  </div>

  {/* CONTACT */}
  <div className="col-lg-3 col-md-12 col-12 footer-contact">
    <h5>Contact Us</h5>

    <div className="contact-item">
      <FontAwesomeIcon icon={faEnvelope} /> support@jigyasaclasses.com
    </div>

    <div className="contact-item">
      <FontAwesomeIcon icon={faPhone} />+91 98765 43210
    </div>

    <div className="contact-item">
      <FontAwesomeIcon icon={faLocationDot} /> Maharashtra, India
    </div>

    <div className="contact-item">
      <FontAwesomeIcon icon={faClockFour} /> Mon - Sat | 9 AM - 7 PM
    </div>
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