// src/NavbarOffcanvas.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuData } from './menuData';
import '../../assets/css/OffcanvasNavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const OffcanvasNavbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenus, setOpenMenus] = useState([]);
  const navigate = useNavigate();

  const toggleMenu = (id) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((menu) => menu !== id) : [...prev, id]
    );
  };

  const handleManualNav = (e, link) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(link);
  };

  const renderNestedMenu = (items, level = 1, prefix = '') => (
    <ul className={`nested-menu level-${level}`}>
      {items.map((item, idx) => {
        const id = `${prefix}${idx}`;
        return (
          <li key={id} className="nested-hover">
            {item.children ? (
              <>
                <div className="nested-title" onClick={() => toggleMenu(id)}>
                  {item.title}
                  <span className="arrow">
                    {openMenus.includes(id) ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                </div>
                {openMenus.includes(id) && renderNestedMenu(item.children, level + 1, `${id}-`)}
              </>
            ) : (
              <a
                href={item.link}
                className="nested-link"
                onClick={(e) => handleManualNav(e, item.link)}
              >
                {item.title}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderDropdownItems = (items, level = 0) => (
    <ul className={`dropdown-menu dropdown-boxed ${level > 0 ? 'dropdown-submenu' : ''}`}>
      {items.map((item, idx) => (
        <li
          key={idx}
          className={`position-relative ${item.children ? 'dropdown-hover' : ''}`}
        >
          {item.children ? (
            <>
              <a
                href="#"
                className="dropdown-item dropdown-toggle"
                onClick={(e) => e.preventDefault()}
              >
                {item.title}
                <FaChevronRight className="float-end small" />
              </a>
              {renderDropdownItems(item.children, level + 1)}
            </>
          ) : (
            <a className="dropdown-item" href={item.link}>{item.title}</a>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-light bg-light shadow-sm fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">MySite</a>

          <div className="d-flex d-md-none">
            <a href="/login" className="btn btn-outline-primary me-2">Login</a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse d-none d-md-flex justify-content-between">
            <ul className="navbar-nav">
              {menuData.map((item, idx) => (
                <li className="nav-item dropdown dropdown-hover position-relative" key={idx}>
                  {item.children ? (
                    <a href="#" className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>
                      {item.title} <FaChevronDown className="ms-1" />
                    </a>
                  ) : (
                    <a className="nav-link" href={item.link}>{item.title}</a>
                  )}
                  {item.children && renderDropdownItems(item.children)}
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <a href="/login" className="btn btn-outline-primary me-2">Login</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {renderNestedMenu(menuData)}
        </div>
      </div>
    </>
  );
};
export default OffcanvasNavbar;
