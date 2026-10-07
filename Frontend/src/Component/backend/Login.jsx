import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/Auth";
import { apiUrl } from "../Common/http";
import HeaderUi from "../Common/CommonUI/HeaderUi";
import FooterUi from "../Common/CommonUI/FooterUi";
import loginimg from "../../assets/images/login2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faGraduationCap, faKey } from "@fortawesome/free-solid-svg-icons";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "../../constants/nevigation/routes";
import logo from '../../assets/images/Logo2.png';


const Login = () => {
  const { login, setTwoFactorRequired, setTwoFactorEmail,hasAnyRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [retryAfter, setRetryAfter] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);

  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Fetch api logic from backend
  const onSubmit = async (data) => {
    if (retryAfter > 0) return; // block if locked
    setLoading(true);
    try {
      const res = await fetch(apiUrl + "login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      // const roleNames = result.user.roles.map(r => r.name);
      // console.log(roleNames)

      if (!res.ok) {
        // Too many attempts (Laravel 422 or 429)
        if (result.errors && result.errors.email) {
          const msg = result.errors.email[0];
          toast.error(msg);

          // Extract seconds from message e.g. "... 55 seconds."
          const match = msg.match(/(\d+)\s*seconds?/);
          if (match) setRetryAfter(parseInt(match[1], 10));
        } else {
          toast.error(result.message || "Something went wrong");
        }
        return;
      }
      // If 2FA required
      if (result.two_factor) {
        setTwoFactorRequired(true);
        setTwoFactorEmail(data.email);
        navigate(AUTH_ROUTES.TWO_FACTOR);
        return;
      }

      // Show error on invalid feedback/ wrong credential
      if (result.status == false) {
        toast.error(result.message || "Login failed");
        return;
      }

      // flatten user object
      const userInfo = {
        token: result.token,
        ...result.user,
        roles: Array.isArray(result.user.roles)
          ? result.user.roles.map(role =>
              typeof role === "object" ? role.name : role
            )
          : [],
      };

      // it will store in local storage
      if (data.rememberMe) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      }

      // It will login the user from local storage and authcontext & authprovider
      login(userInfo);
      

      navigate(DASHBOARD_ROUTES.DASHBOARD)

      
    }
     catch (error) {
      toast.error("Network error, please try again.");
    }
    finally{
    setLoading(false);
    
}
  };


  

  return (
    <>
      {/* Header */}
      <HeaderUi />

      <div className="container-fluid Form_Section">
        <div className="row ">

          {/* Illustrator Img */}
          <div className="col-lg-6 d-none d-lg-flex Illustration_Img">
            <img src={loginimg} alt="Login Illustration"/>
          </div>

          {/* Login Form */}
          <div className="col-lg-6 col-12">

            <div className="Form_Body">

              <form onSubmit={handleSubmit(onSubmit)}>

                {/* Logo Emblemb */}
                <div className="d-flex d-lg-none Logo_Emblemb">
                  <img src={logo} alt="login  Illustration"/>
                </div>

                {/* Form Title */}
                <div className="Form_Title">
                  <h1> Welcome <span>Back</span></h1>
                  <small className='text-muted'>Login To Continue Your <span>Learning Journey.</span></small>
                </div>

                {/* Divide Line */}
                <div className="Divider_Line">
                  <div className="Line"></div>
                  <FontAwesomeIcon icon={faGraduationCap} className='Icon'/>
                  <div className="Line"></div>
                </div>  

                {/* Email */}
                <div className="mb-4">
                  <div className="Input_Title">
                    <FontAwesomeIcon icon={faEnvelope} className='Icon' />
                    <label htmlFor="" className='form-label'>Email Address </label>
                  </div>      

                  <input
                    {...register("email", {
                      required:"Email is required.",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message:
                          "Invalid Email Address , Please Use Genuine Email!!!!",
                      },
                    })}
                    type="text"
                    className={`form-control ${errors.email && "is-invalid"}`}
                    placeholder="Enter Email here...."
                    disabled={loading || retryAfter > 0}
                  />
                  {errors.email && (
                    <p className="invalid-feedback">{errors.email?.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="Input_Title">
                    <FontAwesomeIcon icon={faKey} className='Icon' />
                    <label htmlFor="" className='form-label'>Password</label>
                  </div>   
                  <div className="input-group">

                    <input
                      {...register("password", {
                        required:"Password is required."
                      })}

                      
                      className={`form-control ${
                        errors.password && "is-invalid"
                      }`}
                      placeholder="Enter Password here...."
                      disabled={loading || retryAfter > 0}
                      type={showPassword ? "text":"password"}

                    />

                    <button
                      type="button"
                      disabled={loading}
                      className="btn  view-password  btn-outline-secondary"
                      onClick={()=>setShowPassword(!showPassword)}
                    >

                    <FontAwesomeIcon icon={ showPassword ? faEyeSlash :faEye }/>


                    </button>

                  {errors.password && (
                    <p className="invalid-feedback">
                      {errors.password?.message}
                    </p>
                  )}
                  </div>
                </div>
                
                {/* Remember Me */}
                <div className="mb-4 form-check d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    {...register("rememberMe")}
                    disabled={loading || retryAfter > 0}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me ?
                  </label>
                </div>

                {/* Forget Password */}
                <Link to={AUTH_ROUTES.FORGOT_PASSWORD} className="fw-semibold ">Forget password?</Link>
                
                {/* Show countdown message */}
                {retryAfter > 0 && (
                  <p className="text-danger text-center mb-2">
                    Too many attempts. Please wait {retryAfter} seconds.
                  </p>
                )}

                <button
                type="submit"
                className="btn blue-btn w-100 my-3"
                disabled={loading || retryAfter > 0}
                >
                {
                  loading ? (
                    <>
                      <span
                      className="spinner-border spinner-border-sm me-2 text-primary"
                      role="status"
                      />

                      <span className="text-primary">Logging In...</span>
                  </>

                    ) :
                  retryAfter>0 ? (
                    `Try again in  ${retryAfter}s`
                  )  : (
                    "Login"
                )}
                </button>

                <br />
                
               {/* Divide Line */}
                <div className="Divider_Line">
                  <div className="Line"></div>
                  <h4  className='Icon m-0'>OR</h4>
                  <div className="Line"></div>
                </div>
                
                <div className="text-center">

                  <p className="fw-medium"> Don't have an account? 
                    <Link
                    to={AUTH_ROUTES.REGISTER}
                    className="fw-bold ms-2"
                    >

                  Create Account Now

                  </Link>

                  </p>

                  </div>
              </form>

            </div>

          </div>
        </div>
      </div>
      
      {/* Footer */}
      <FooterUi />
    </>
  );
};

export default Login;
