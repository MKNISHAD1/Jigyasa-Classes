import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { apiUrl } from "../Common/http";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import HeaderUi from "../Common/CommonUI/HeaderUi";
import FooterUi from "../Common/CommonUI/FooterUi";
import forgetpassword from "../../assets/images/forgot-pass.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import OtpInput from "../Common/CommonUI/OtpInput";
import OtpResendTimer from "../Common/CommonUI/OtpResendTimer";
import maskEmail from "../../utilities/maskEmail";
import { faEnvelope, faGraduationCap, faHashtag, faKey, faLock } from "@fortawesome/free-solid-svg-icons";
import logo from '../../assets/images/Logo2.png';


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

      <div className="container-fluid Form_Section">
        <div className="row">
          {/* Illustrator Img */}
          <div className="col-lg-6 d-none d-lg-flex Illustration_Img">
            <img src={forgetpassword} alt="Forget Password Illustration" />
          </div>
          
          {/* Login Form */}
          <div className="col-lg-6 col-12 m-auto">

            <div className="Form_Body">
              {step === 1 && (
                <form onSubmit={handleSubmit(onSubmit)}>

                {/* Logo Emblemb */}
                <div className="d-flex d-lg-none Logo_Emblemb">
                  <img src={logo} alt="login  Illustration"/>
                </div>

                {/* Form Title */}
                <div className="Form_Title">
                  <h1> Forgot Your <span>Password?</span></h1>
                  <small className='text-muted'>Don't worry! It happens. We'll help you <span>reset your password.</span></small>
                </div>

                {/* Divide Line */}
                <div className="Divider_Line">
                  <div className="Line"></div>
                  <FontAwesomeIcon icon={faGraduationCap} className='Icon'/>
                  <div className="Line"></div>
                </div>  

                  <div className="mb-4">
                    <div className="Input_Title">
                      <FontAwesomeIcon icon={faEnvelope} className='Icon' />
                      <label htmlFor="" className='form-label'>Email Address </label>
                    </div>      

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
                      className="btn blue-btn w-100"
                      disabled={loading}
                  >
                      {loading ? (
                          <>
                              <span
                                  className="spinner-border spinner-border-sm me-2 text-primary"
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
                      className="btn gray-btn-opp w-100 mt-2"
                  >
                      Back to Login
                  </Link>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit(onResetWithOtp)}>

                {/* Logo Emblemb */}
                <div className="d-flex d-lg-none Logo_Emblemb">
                  <img src={logo} alt="login  Illustration"/>
                </div>

                {/* Form Title */}
                <div className="Form_Title">
                  <h1> Reset Your <span>Password?</span></h1>
                </div>

                {/* Divide Line */}
                <div className="Divider_Line">
                  <div className="Line"></div>
                  <FontAwesomeIcon icon={faGraduationCap} className='Icon'/>
                  <div className="Line"></div>
                </div>  

                  <p className="text-muted mb-4">
                    We've sent a verification code to : <strong>{maskEmail(email)}</strong>{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setStep(1)}
                    >
                      wrong email?
                    </button>
                  </p>

                  <div className="mb-2">
                    <div className="Input_Title">
                      <FontAwesomeIcon icon={faHashtag} className='Icon' />
                      <label htmlFor="" className='form-label'>Enter OTP </label>
                    </div>      

                    {/* OtpInput */}
                    <OtpInput
                        value={otp}
                        onChange={setOtp}
                    /> 
                    <br />
                    {/* Otp Resend Timer */}
                  <OtpResendTimer
                      initialTime={60}
                      onResend={handleResendOtp}
                  />
                    {errors.otp && (
                      <p className="invalid-feedback">{errors.otp?.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="Input_Title">
                      <FontAwesomeIcon icon={faLock} className='Icon' />
                      <label htmlFor="" className='form-label'>Create New Password</label>
                    </div>   

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

                  <div className="mb-4">
                    <div className="Input_Title">
                      <FontAwesomeIcon icon={faKey} className='Icon' />
                      <label htmlFor="" className='form-label'>Confirm New Password</label>
                    </div>  

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
                    className="btn blue-btn w-100"
                    disabled={loading}
                  >

                      {loading ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2 text-primary"
                          role="status"
                        />

                        <span className='text-primary'>Reseting Password... </span>

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
      
      {/* Footer */}
      <FooterUi />
    </>
  );
};

export default Forgotpassword;
