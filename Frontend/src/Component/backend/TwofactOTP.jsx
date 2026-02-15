import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/Auth";
import { apiUrl } from "../Common/http";

const TwofactOTP = () => {
  const { twoFactorEmail, setTwoFactorRequired, login,hasAnyRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    const res = await fetch(apiUrl + "2fa-otp-verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: twoFactorEmail, otp }),
    });
    const result = await res.json();

    if (!result.status) return alert(result.message);

    // flatten user object
    const userInfo = {
      token: result.token,
      ...result.user,
    };

    if (localStorage.getItem("userInfo")) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
    }

    login(userInfo);
    setTwoFactorRequired(false);

    // Redirect
    const roleNames = Array.isArray(result.user.roles)
      ? result.user.roles.map((r) => (r.name ? r.name : r))
      : [];

      if (hasAnyRole(["admin","moderator"])) {
        navigate("/admin");
      } else if (hasAnyRole(["super_admin"])) {
        navigate("/superadmin");
      } else {
        navigate("/dash");
    }
  };

  return (
    <div className="container my-5">
      <h3>Enter OTP</h3>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="6-digit OTP"
      />
      <button onClick={verifyOtp}>Verify</button>
    </div>
  );
};

export default TwofactOTP;
