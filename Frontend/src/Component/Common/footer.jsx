import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const footer = () => {
  return (
    <footer className="bg-dark text-white pt-4">
      <div className="container text-center text-md-left">
        <div className="row">

          {/* About Section */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase">About Us</h5>
            <p>
              We create amazing web experiences and resources for developers around the world.
            </p>
          </div>

          {/* Links Section */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white text-decoration-none">Home</a></li>
              <li><a href="/services" className="text-white text-decoration-none">Services</a></li>
              <li><a href="/contact" className="text-white text-decoration-none">Contact</a></li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase">Follow Us</h5>
            <a href="#" className="text-white me-3"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-white me-3"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-white"><i className="fab fa-instagram"></i></a>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-secondary text-center py-3">
     2024 -    {new Date().getFullYear()} MK Nishad © All rights reserved.
      </div>
    </footer>
  );
};

export default footer;
