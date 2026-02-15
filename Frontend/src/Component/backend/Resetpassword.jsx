import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiUrl } from "../Common/http";
import { toast } from "react-toastify";
import Header from "../Common/Header";
import Footercomp from '../Common/footer';

const Resetpassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const navigate = useNavigate(); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await fetch(apiUrl + "reset-password-link", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    });

    const result = await res.json();

    if (result.status) {
      toast.success(result.message);
      navigate("/login");
    } else {
      toast.error(result.message || "Something went wrong!");
    }
  };

  return (
    <>
    <Header/>
    <div className="container my-5">
      <div className="card border-0 shadow">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="mb-4 text-center">Set New Password</h2>

            <div className="mb-3">
              <label>New Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required", minLength: 8 })}
                className={`form-control ${errors.password && "is-invalid"}`}
              />
              {errors.password && (
                <p className="invalid-feedback">{errors.password.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label>Confirm Password</label>
              <input
                type="password"
                {...register("password_confirmation", {
                  required: "Please confirm your password",
                })}
                className={`form-control ${errors.password_confirmation && "is-invalid"}`}
              />
              {errors.password_confirmation && (
                <p className="invalid-feedback">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
    <Footercomp/>
    </>
  );
};

export default Resetpassword;