import React, { useContext, useEffect, useState } from "react";
import Header from "../Common/Header";
import Footercomp from "../Common/footer";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/Auth";
import { apiUrl } from "../Common/http";

const Login = () => {
  const { login, setTwoFactorRequired, setTwoFactorEmail,hasAnyRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [retryAfter, setRetryAfter] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

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
        navigate("/two-factor");
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
      };

      // it will store in local storage
      if (data.rememberMe) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      }

      // It will login the user from local storage and authcontext & authprovider
      login(userInfo);

      // Will redirect to Dashbord page
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
    } catch (error) {
      toast.error("Network error, please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="login-form">
          <div className="card border-0 shadow">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="mb-3 text-center"> Login Page </h1>
                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Email
                  </label>
                  <input
                    {...register("email", {
                      required: "This is Required Field",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message:
                          "Invalid Email Address , Please Use Genuine Email!!!!",
                      },
                    })}
                    type="text"
                    className={`form-control ${errors.email && "is-invalid"}`}
                    placeholder="Enter Email here...."
                  />
                  {errors.email && (
                    <p className="invalid-feedback">{errors.email?.message}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Password
                  </label>
                  <input
                    {...register("password", {
                      required: "This is Required Field",
                    })}
                    type="password"
                    className={`form-control ${
                      errors.password && "is-invalid"
                    }`}
                    placeholder="Enter Password here...."
                  />
                  {errors.password && (
                    <p className="invalid-feedback">
                      {errors.password?.message}
                    </p>
                  )}
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    {...register("rememberMe")}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me ?
                  </label>
                </div>

                <Link to="/forgot-password">Forget password?</Link>
                <br />
                <br />
                {/* Show countdown message */}
                {retryAfter > 0 && (
                  <p className="text-danger text-center mb-2">
                    Too many attempts. Please wait {retryAfter} seconds.
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={retryAfter > 0}
                >
                  {retryAfter > 0 ? `Try again in ${retryAfter}s` : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footercomp />
    </>
  );
};

export default Login;
