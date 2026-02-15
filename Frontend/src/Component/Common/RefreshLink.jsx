import { useLocation, useNavigate } from "react-router-dom";

const RefreshLink = ({ to, children, className }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    if (location.pathname === to) {
      // If already on the same page, do a full refresh
      window.location.reload();
    } else {
      // Navigate normally
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default RefreshLink;