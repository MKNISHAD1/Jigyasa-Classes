import { useLocation, useNavigate } from "react-router-dom";

const RefreshLink = ({ 
  to, 
  children, 
  className="",
  activeClassname="active",
  onNavigate,
 }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive= location.pathname === to || location.pathname.startsWith(`${to}/`);

  const handleClick = (e) => {
    e.preventDefault();

    if (isActive) {
      // If already on the same page, do a full refresh
      window.location.reload();
    } else {
      // Navigate normally
      navigate(to);

      // Offcanvas sidebar nevigate
      if (onNavigate) {
          onNavigate();
      }
    }
  };

  return (
    <a 
      href={to} 
      onClick={handleClick} 
      className={`${className} ${isActive ? activeClassname : ""}`}
      >
      {children}
    </a>
  );
};

export default RefreshLink;