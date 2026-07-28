import React, { useContext } from 'react'
import '../../assets/css/style.scss'
import { AuthContext } from '../backend/context/Auth'
import RefreshLink from './RefreshLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DASHBOARD_LINKS, SIDEBAR_SECTIONS } from '../../constants/nevigation/sidebarlinks';
import { Accordion } from 'react-bootstrap';
import { faArrowRightFromBracket, faClose, faCross } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';


const Sidebar = ({onNavigate, onClose }) => {
const {user,logout,hasAnyRole} = useContext(AuthContext);

const location = useLocation();

const visibleSections = SIDEBAR_SECTIONS.filter(section =>
    hasAnyRole(section.roles)
);

const isRouteActive = (path) => {
    const basePath = path.replace(/:\w+/g, "");
    return location.pathname.startsWith(basePath);
};



  return (
<>

        <div className="dashboard-sidebar card shadow border-0 h-100"  >
            <button className="close-btn" onClick={onClose}>
                <FontAwesomeIcon icon={faClose} className='close-btn-icon d-lg-none'/>
            </button>

            <div className="sidebar-header">

                <img
                    src={user?.profile_pic}
                    className="sidebar-avatar"
                    alt={user?.name}
                />

                <h5>{user?.name}</h5>

                <span className="sidebar-role">
                    {user?.roles?.[0]}
                </span>

            </div>

            <div className="sidebar-body">

                {/* Dashboard Links */}
                <div className="sidebar-links">
                    {DASHBOARD_LINKS.map(item => (

                        <RefreshLink
                            key={item.path}
                            to={item.path}
                            className="sidebar-link"
                            onNavigate={onNavigate}
                        >

                            <FontAwesomeIcon
                                icon={item.icon}
                                className="sidebar-link-icon"
                            />

                            <span className="sidebar-link-text">
                                {item.title}
                            </span>
                        </RefreshLink>

                    ))}

                </div>

                {/* Sections */}
                <div className="sidebar-section">
                    <Accordion
                        // alwaysOpen
                        defaultActiveKey={
                            visibleSections
                                .map((section, index) =>                                                           
                                    section.items
                                        .filter(item => hasAnyRole(item.roles ?? section.roles))
                                        .some(item => isRouteActive(item.path))
                                        ? String(index)
                                        : null
                                )
                                .filter(Boolean)
                        }
                    >
                    {visibleSections.map((section, index) => {

                        const visibleItems = section.items.filter(item =>
                            hasAnyRole(item.roles ?? section.roles)
                        );

                        const isSectionActive = visibleItems.some(item =>
                            isRouteActive(item.path)
                        );

                        return (
                            <Accordion.Item
                                eventKey={String(index)}
                                key={section.title}
                            >
                                <Accordion.Header
                                    className={isSectionActive ? "sidebar-section-active" : ""}
                                >
                                    <FontAwesomeIcon
                                        icon={section.icon}
                                        className="me-2"
                                    />
                                    {section.title}
                                </Accordion.Header>

                                <Accordion.Body>
                                    {visibleItems.map(item => (
                                        <RefreshLink
                                            key={item.path}
                                            to={item.path}
                                            className="sidebar-link"
                                            onNavigate={onNavigate}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className="sidebar-link-icon"
                                            />

                                            <span className="sidebar-link-text">
                                                {item.title}
                                            </span>
                                        </RefreshLink>
                                    ))}
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                    </Accordion>

                </div>

            </div>

            <div className="sidebar-footer">

                <button onClick={logout} className='logout-btn'><FontAwesomeIcon icon={faArrowRightFromBracket} className='logout-icon'/> Logout  </button>

            </div>

        </div>

    </>
  )
}

export default Sidebar