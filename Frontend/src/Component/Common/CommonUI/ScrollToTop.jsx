import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 20,
            behavior: "smooth" // or "instant"
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;