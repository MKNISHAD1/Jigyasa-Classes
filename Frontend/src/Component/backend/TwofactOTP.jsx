import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/Auth";
import { apiUrl } from "../Common/http";
import HeaderUi from "../Common/CommonUI/HeaderUi";
import FooterUi from "../Common/CommonUI/FooterUi";
import otpimg from "../../assets/images/otp-verify.jpeg"
import OtpInput from "../Common/CommonUI/OtpInput";
import OtpResendTimer from "../Common/CommonUI/OtpResendTimer";
import maskEmail from "../../utilities/maskEmail";
import { toast } from "react-toastify";


const TwofactOTP = () => {
  const { twoFactorEmail, setTwoFactorRequired, login,hasAnyRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    setLoading(true);
    try{
    
    if (otp.length !== 6) {
        toast.error("Please enter complete OTP.");
        setLoading(false);
        return;
    }

    const res = await fetch(apiUrl + "2fa-otp-verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: twoFactorEmail, otp }),
    });
    const result = await res.json();

    if (!result.status) {
      toast.error(result.message);
      return;
    }
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

      if (
        roleNames.includes("admin") ||
        roleNames.includes("moderator")
      ) {
        navigate("/admin");
      } else if (
        roleNames.includes("super_admin")
      ) {
        navigate("/superadmin");
      } else {
        navigate("/dash");
      }

  } catch (error) {
        // Network error (server down, CORS issue, etc.)
        toast.error(
          "Unable to connect to server. Please check your internet or try later."
        );
        console.error(error);
      } finally{
      setLoading(false);
    }

  };

  const handleResendOtp = async () => {
    try {

      const res = await fetch(apiUrl + "2fa-resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({
          email: twoFactorEmail,
        }),
      });

      const result = await res.json();

      if (result.status) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

    } catch (error) {

      toast.error(
        "Unable to resend OTP. Please try again."
      );

    }
  };

  return (
    <>
    {/* Header */}
    <HeaderUi/>

    <div className="container my-5">

      <div className="row align-items-center">
        {/* Illustrator Img */}
          <div className="col-lg-6 d-none d-md-flex">
            <img src={otpimg} alt="" width="100%"/>
          </div>
  <div className="col-lg-6 col-12">
      <div className="card border-0 shadow">
        <div className="card-body">
           <h1 className=" text-center fw-bold">  <span>Welcome</span> Back </h1>
            <p className="mb-3 text-center fw-medium">Kindly Enter OTP to Continue</p>

            <p className="text-center text-muted mb-4">
              We've sent a verification code to :
              <strong>{maskEmail(twoFactorEmail)}</strong>
          </p>
                   
            {/* OtpInput */}
            <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
            />
            {/* Otp Resend Timer */}
          <OtpResendTimer
              initialTime={60}
              onResend={handleResendOtp}
              disabled={loading}
          />

          <button
              className="btn btn-primary w-100 mt-4"
              disabled={loading || otp.length !== 6}
              onClick={verifyOtp}
          >

          {
          loading
          ?
          "Verifying..."
          :
          "Verify OTP"
          }

          </button>

            <a 
                href="/login"
                className="btn btn-outline-primary w-100 mt-2"
            >
                Back to Login
            </a>

        </div>
      </div>
  
  </div>
        {/* <h3>Enter OTP</h3>
        <input
          value={otp}
          onChange={(e) => setOtp(e
            .target.value)}
          placeholder="6-digit OTP"
        />
        <button onClick={verifyOtp}>Verify</button> */}
      </div>
    </div>

    {/* Footer  */}
    <FooterUi/>
    
    </>
  );
};

export default TwofactOTP;
