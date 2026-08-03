import React, { useContext, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { AuthContext } from "../context/Auth";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { AUTH_ROUTES, DASHBOARD_ROUTES, USER_ROUTES } from "../../../constants/nevigation/routes";
import { DASHBOARD_LINKS } from "../../../constants/nevigation/sidebarlinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faArrowLeft, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { availabilityValidator } from "../../../utilities/validators";

const Createuser = () => {
  const {hasAnyRole} = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);


  const {
    register,
    handleSubmit, 
    watch,
    formState: { errors,  isSubmitting },
    setError
  } = useForm({
        mode:"onChange", // onBlur  = after leaving the field and debounce validator 
        reValidateMode:"onChange",  
  });




  // Create User 
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl + "add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.status === true) {
        toast.success(result.message);
        navigate(USER_ROUTES.LIST);
      } else {
        if (result.error) {
          for (const key in result.error) {
            setError(key, { type: "server", message: result.error[key][0] });
          }
        } else {
          toast.error(result.message || "Something went wrong!");
        }
      }
    } catch (err) {
      toast.error("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

    {/* Breadcrumbs */}
    <div className="d-flex justify-content-between align-items-center">
      <section className="breadcrumb-section">
        <h3>Create <span>User</span></h3>

        <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
        <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

        <Link className='bread-link' to=""><span>Create User</span></Link>
      </section>

      <Link to={USER_ROUTES.LIST} className="edit-btn">
      <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Back
      </Link>
    </div>

        <div className="dashboard-card mt-4 space">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              {/* Name And Email */}
              <div className="col-md-6">
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="" className='form-label'>Enter Name </label>
                  <input
                    {
                    ...register('name', {
                      required: "Name is required.",
                      minLength: {
                          value: 3,
                          message: "Name must be at least 3 characters."
                      },
                      maxLength: {
                          value: 50,
                          message: "Name cannot exceed 50 characters."
                      }
                    }) 
                    }
                    type="text"
                    className={`form-control ${errors.name && 'is-invalid'}`} 
                    placeholder='Enter Your name here....' 
                    disabled={loading

                    } 
                    />
                    {
                      errors.name && <p className='invalid-feedback'>{errors.name?.message}</p>
                    }
                </div>
                        
                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="" className='form-label'>Enter Your Email</label>
                  <input
                    {
                    ...register('email', {
                      required: "Email is Required",
                      validate :availabilityValidator(
                        "users", // Model name
                        "email", // Feild Name
                        null,
                        null,
                        "email" // lable Name
                      ),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid Email Address , Please Use Genuine Email!!!!"
                      }
                    })
                    }
                    type="text" 
                    className={`form-control ${errors.email && 'is-invalid'}`} 
                    placeholder='Enter Email here....' 
                    disabled={loading} 
                  />
                  {
                    errors.email && <p className='invalid-feedback'>{errors.email?.message}</p>
                  }
                </div>

              </div>

              {/* Username and Phone Number */}
              <div className="col-md-6">

                {/* Username */}
                <div className="mb-3">
                  <label htmlFor="" className='form-label'>Enter Username </label>
                  <input
                    {
                    ...register('username', {
                      required: "Username is required.",
                      validate :availabilityValidator(
                        "users", // Model name
                        "username", // Feild Name
                        null,
                        null,
                        "username" // lable Name
                      ),
                      minLength: {
                          value: 4,
                          message: "Username must be at least 4 characters."
                      },
                      pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: "Only letters, numbers and underscore allowed."
                      }
                    })
                    }
                    type="text" 
                    className={`form-control ${errors.username && 'is-invalid'}`} placeholder='Enter username here....' 
                    disabled={loading} 
                  />
                  {
                    errors.username && <p className='invalid-feedback'>{errors.username?.message}</p>
                  }
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label htmlFor="" className='form-label'>Enter Mobile No. </label>
                  <input
                    {
                    ...register('mobile_no', {
                      required: "Mobile number is required.",
                      validate :availabilityValidator(
                        "users", // Model name
                        "mobile_no", // Feild Name
                        null,
                        null,
                        "Mobile No" // lable Name
                      ),
                      pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: "Enter a valid 10-digit mobile number."
                      }
                    })
                    }
                    type="text" 
                    className={`form-control ${errors.mobile_no && 'is-invalid'}`} placeholder='Enter Mobile Number here....' 
                    disabled={loading} 
                  />
                  {
                    errors.mobile_no && <p className='invalid-feedback'>{errors.mobile_no?.message}</p>
                  }
                </div>
              </div>
                  
                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="" className='form-label'>Password</label>
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
                      type={showPassword ? "text" : "password"} 
                      className={`form-control ${errors.password && 'is-invalid'}`} placeholder='Enter Password here....'
                      disabled={loading}
                    />

                    <button
                        type="button"
                        className="btn view-password  btn-outline-secondary"
                        disabled={loading}
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

                {/* Confirm Password  */}
                <div className="mb-3">

                <label className="form-label"> Confirm Password</label>
                  <div className="input-group">

                    <input
                      type={showPassword ? "text" : "password"}

                      className={`form-control ${
                        errors.confirm_password && "is-invalid"
                      }`}

                      placeholder="Confirm Password" disabled={loading}

                      {...register("confirm_password",{
                      required:"Please confirm your password.",

                      validate:(value)=>
                      value===watch("password") ||
                      "Passwords do not match."
                      })}
                    />
                    <button
                      type="button"
                      className="btn view-password btn-outline-secondary"
                      disabled={loading}
                      onClick={()=>setShowPassword(!showPassword)}
                      >

                      <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      />

                    </button>

                    {
                    errors.confirm_password &&
                    <p className="invalid-feedback">
                    {errors.confirm_password.message}
                    </p>
                    }
                  </div>

                </div>


              {/* User  Roles */}
              <div className="mb-3">
                  <label className="form-label">User Role</label>
                        <select className="form-control" disable={loading} {...register("role", { required: true })}>
                          {/* Moderator can only create Student + Teacher */}
                          {hasAnyRole(["moderator"]) && (
                            <>
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                            </>
                          )}

                          {/* Admin can create Student + Teacher + Moderator */}
                          {hasAnyRole(["admin"]) && (
                            <>
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="moderator">Moderator</option>
                            </>
                          )}

                          {/* Super Admin can create everyone */}
                          {hasAnyRole(["super_admin"]) && (
                            <>
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </>
                          )}
                        </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading || isSubmitting}
            >

                {loading ? (

                <>
                  <span
                    className="spinner-border spinner-border-sm me-2 text-light"
                    role="status"
                  />

                  <span className='text-light'>Creating Account... </span>

                </>

                ) : (

                  "Create Account"

              )}

            </button>
          </form>
        </div>


 
    </>
  );
};

export default Createuser;