// New code testing\\

import { createContext, useState, useEffect } from "react";
import { apiUrl } from "../../Common/http";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState(null);


const login = (userInfo) => {
  setUser({
    ...userInfo,
    roles: Array.isArray(userInfo.roles)
      ? userInfo.roles.map(role =>
          typeof role === "object" ? role.name : role
        )
      : [],
  });
};

  const logout = () => {
    localStorage.removeItem("userInfo");
    sessionStorage.removeItem("userInfo");
    setUser(null);
  };

    // On app start, check storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userInfo")) || JSON.parse(sessionStorage.getItem("userInfo"));

    if (saved?.token) {
      // optimistic: set snapshot immediately
      setUser(saved);

      // then fetch fresh user from backend
      fetch(apiUrl + "user", {
        headers: {
          Authorization: `Bearer ${saved.token}`,
        },
      })
        .then((res) => res.json())
        .then((fresh) => {
          if (fresh?.id) {
            // const updatedUserInfo = { token: saved.token, ...fresh };
            const updatedUserInfo = {
              token: saved.token,
              ...fresh,
              roles: Array.isArray(fresh.roles)
                ? fresh.roles.map(role =>
                    typeof role === "object"
                      ? role.name
                      : role
                  )
                : []
            };
            setUser(updatedUserInfo);

            // update state + storage
            if (localStorage.getItem("userInfo")) {
              localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            } else {
              sessionStorage.setItem(
                "userInfo",
                JSON.stringify(updatedUserInfo)
              );
            }
          } else {
            logout(); // invalid token, force logout
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false)); // ✅ mark finished
        } else {
          setLoading(false); // ✅ nothing to load
      }
  }, []);



  // Helper: check if user has one of the allowed roles
  const hasAnyRole = (allowedRoles = []) => {
    if (!user?.roles) return false;

    return allowedRoles.some(role =>
      user.roles.includes(role)
    );
  };

  //Check Single Role
    const hasRole = (role) => {
      return user?.roles?.includes(role);
    };

    // Check again
    const isAuthenticated = !!user;


    // Listen for localStorage changes across tabs
    useEffect(() => {
      const handleStorageChange = () => {
      const saved = localStorage.getItem("userInfo");
      setUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
    };
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        
        hasAnyRole,
        hasRole,
        isAuthenticated,
        
        twoFactorRequired,
        setTwoFactorRequired,

        twoFactorEmail,
        setTwoFactorEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
