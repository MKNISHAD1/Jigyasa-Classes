import React, { useState } from "react";
import Header from "../Common/Header";
import Footercomp from "../Common/footer";
import { useForm } from "react-hook-form";
import { apiUrl } from "../Common/http";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import HeaderUi from "../Common/CommonUI/HeaderUi";
import FooterUi from "../Common/CommonUI/FooterUi";
import forgetpassword from "../../assets/images/forget-password.jpeg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import OtpInput from "../Common/CommonUI/OtpInput";
import OtpResendTimer from "../Common/CommonUI/OtpResendTimer";
import maskEmail from "../../utilities/maskEmail";


const Forgotpassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step control
  const [email, setEmail] = useState(""); // store email for OTP step
  const [loading, setLoading] = useState(false); // Spinner state
  const [showPassword,setShowPassword]=useState(false); // view password state
  const [otp, setOtp] = useState(""); // OTP Component

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  // Step 1: Request Reset Mail (send OTP + reset link)

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl + "forgot-password", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.status === true) {
        toast.success(result.message || "Reset link sent to your email!");
        setEmail(data.email);
        setStep(2); // move to OTP step
      } else {
        toast.error(result.message || "Invalid Email , Please try Email which you used for login");
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
}

    // Step 2: Reset Password with OTP

    const onResetWithOtp = async (data) => {
      try {
        const payload = {
          email: email,
          otp: data.otp,
          password: data.password,
          password_confirmation: data.password_confirmation,
        };

        const res = await fetch(apiUrl + "reset-password-otp", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (result.status) {
          toast.success("Password reset successfully!");
          reset(); // clear form
          setStep(1); // back to email step
          navigate("/login")
        } else {
          toast.error(result.message || "Invalid OTP or error occurred");
        }
      } catch (err) {
        toast.error("Server error, please try again later!");
    }

  }

  // resend Otp
  const handleResendOtp = async () => {

    try {

        const res = await fetch(apiUrl + "resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        });

        const result = await res.json();

        if (result.status) {
            toast.success("OTP resent successfully.");
        } else {
            toast.error(result.message);
        }

    } catch (error) {
        toast.error("Unable to resend OTP.");
    }

};

  return (
    <>
      {/* Header */}
      <HeaderUi />

      <div className="container my-5">
        <div className="row">
          {/* Illustrator Img */}
          <div className="col-lg-6 d-none d-md-flex">
            <img src={forgetpassword} alt="" width="100%" />
          </div>
          
          {/* Login Form */}
          <div className="col-lg-6 col-12 m-auto">
            <div className="login-form">
              <div className="card border-0 shadow">
                <div className="card-body">
                  {step === 1 && (
                    <form onSubmit={handleSubmit(onSubmit)}>
                    <h1 className=" text-center fw-bold"> Forgot Your <span>Password?</span> </h1>
                    <p className="mb-3 text-center fw-medium">  Don't worry! It happens. We'll help you reset your password.</p>

                      <div className="mb-3">
                        <label className="form-label">Enter Your Email</label>
                        <input
                          {...register("email", {
                            required: "This field is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          type="text"
                          className={`form-control ${errors.email && "is-invalid"}`}
                          placeholder="Enter your email..."
                        />
                        {errors.email && (
                          <p className="invalid-feedback">
                            {errors.email?.message}
                          </p>
                        )}
                      </div>

                      <button
                          className="btn btn-primary w-100"
                          disabled={loading}
                      >
                          {loading ? (
                              <>
                                  <span
                                      className="spinner-border spinner-border-sm me-2 text-light"
                                      role="status"
                                  />
                                  Sending...
                              </>
                          ) : (
                              "Send Reset Code"
                          )}
                      </button>

                      <Link
                          to="/login"
                          className="btn btn-outline-primary w-100 mt-2"
                      >
                          Back to Login
                      </Link>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleSubmit(onResetWithOtp)}>
                      <h1 className="mb-4 text-center">Reset Your <span>Password</span> </h1>
                      <p className="text-muted">
                        We've sent a verification code to : <strong>{maskEmail(email)}</strong>{" "}
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => setStep(1)}
                        >
                          wrong email?
                        </button>
                      </p>

                      <div className="mb-3">
                        <label className="form-label">Enter OTP</label>
                        {/* OtpInput */}
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                        /> <br />
                        {/* Otp Resend Timer */}
                      <OtpResendTimer
                          initialTime={60}
                          onResend={handleResendOtp}
                      />
                        {errors.otp && (
                          <p className="invalid-feedback">{errors.otp?.message}</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <div className="input-group">
                        <input
                          {
                          ...register('password', {
                            required: "Password is required.",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters."
                            },
                            pattern: {
                                value:
                                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/,
                                message:
                                "Password must contain uppercase, lowercase, number and special character."
                            }
                          })
                          }
                            type={showPassword ? "text" : "password"} className={`form-control ${errors.password && 'is-invalid'}`} placeholder='Enter Password here....'
                            disabled={loading}
                            />

                          <button
                              type="button"
                              disabled={loading}
                              className="btn  view-password  btn-outline-secondary"
                              onClick={()=>setShowPassword(!showPassword)}
                              >

                              <FontAwesomeIcon
                              icon={showPassword ? faEyeSlash : faEye}
                              />

                            </button>
                          {
                            errors.password && <p className='invalid-feedback'>{errors.password?.message}</p>
                          }
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}

                          className={`form-control ${
                              errors.password_confirmation && "is-invalid"
                            }`}

                            placeholder="Confirm Password" disabled={loading}

                            {...register("password_confirmation", {
                              required:"Please confirm your password.",

                              validate:(value)=>
                              value===watch("password") ||
                              "Passwords do not match."
                            })}
                            
                          />
                          <button
                            type="button"
                            disabled={loading}
                            className="btn  view-password  btn-outline-secondary"
                            onClick={()=>setShowPassword(!showPassword)}
                            >

                            <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            />

                          </button>
                          {errors.password_confirmation && (
                            <p className="invalid-feedback">
                              {errors.password_confirmation?.message}
                            </p>
                          )}
                        </div>
                      </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >

                        {loading ? (

                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2 text-light"
                            role="status"
                          />

                          <span className='text-light'>Reseting Password... </span>

                        </>

                        ) : (

                          "Reset Password"

                      )}

                    </button>
                    </form>
                  )}


                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer */}
      <FooterUi />
    </>
  );
};

export default Forgotpassword;
