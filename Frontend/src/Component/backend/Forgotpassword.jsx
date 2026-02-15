import React, { useState } from "react";
import Header from "../Common/Header";
import Footercomp from "../Common/footer";
import { useForm } from "react-hook-form";
import { apiUrl } from "../Common/http";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Forgotpassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step control
  const [email, setEmail] = useState(""); // store email for OTP step

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Step 1: Request Reset Mail (send OTP + reset link)

  const onSubmit = async (data) => {
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

  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="login-form">
          <div className="card border-0 shadow">
            <div className="card-body">
              {step === 1 && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <h1 className="mb-4 text-center">Password Reset</h1>
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
                  <button type="submit" className="btn btn-success">
                    Request Reset
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit(onResetWithOtp)}>
                  <h1 className="mb-4 text-center">Enter OTP & New Password</h1>
                  <p className="text-muted">
                    Reset code sent to: <strong>{email}</strong>{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setStep(1)}
                    >
                      Change Email
                    </button>
                  </p>

                  <div className="mb-3">
                    <label className="form-label">OTP</label>
                    <input
                      {...register("otp", { required: "OTP is required" })}
                      type="text"
                      className={`form-control ${errors.otp && "is-invalid"}`}
                      placeholder="Enter OTP"
                    />
                    {errors.otp && (
                      <p className="invalid-feedback">{errors.otp?.message}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      type="password"
                      className={`form-control ${
                        errors.password && "is-invalid"
                      }`}
                      placeholder="Enter new password"
                    />
                    {errors.password && (
                      <p className="invalid-feedback">
                        {errors.password?.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      {...register("password_confirmation", {
                        required: "Please confirm password",
                      })}
                      type="password"
                      className={`form-control ${
                        errors.password_confirmation && "is-invalid"
                      }`}
                      placeholder="Confirm password"
                    />
                    {errors.password_confirmation && (
                      <p className="invalid-feedback">
                        {errors.password_confirmation?.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Reset Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footercomp />
    </>
  );
};

export default Forgotpassword;
