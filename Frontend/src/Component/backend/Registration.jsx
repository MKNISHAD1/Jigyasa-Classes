import React, { useContext, useState } from 'react'
import Header from '../Common/Header'
import Footercomp from '../Common/footer'
import { useForm } from "react-hook-form"
import { apiUrl } from '../Common/http'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from './context/Auth'
import { toast } from 'react-toastify'
import HeaderUi from '../Common/CommonUI/HeaderUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import FooterUi from '../Common/CommonUI/FooterUi'
import signupimg from "../../assets/images/signup.jpeg"
import { AUTH_ROUTES } from '../../constants/nevigation/routes'
import { availabilityValidator } from '../../utilities/validators'



const Registration = () => {

   
  const {login} = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);


  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
        mode:"onChange", // onBlur  = after leaving the field and debounce validator 
    reValidateMode:"onChange",
  })

  const onSubmit = async (data) => {
    setLoading(true);
    try{

    //configure API here and fetch from api 
    const res = await fetch(apiUrl + 'register', {
      'method': 'POST',
      'headers' : {
                        'Content-type' : 'application/json',
                        'Accept' : 'application/json',
                  },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.status === false) {

      if (result.error) {
          Object.entries(result.error).forEach(([field, messages]) => {
              setError(field, {
                  type: "server",
                  message: messages[0],
              });
          });
      } 
      
      else if (result.message) {
          toast.error(result.message);
      }
    }

    else {
      // Show success message for login
      toast.success(result.message);//Registration successful! Please login to continue.
      navigate(AUTH_ROUTES.LOGIN);
    }
    }
    catch(error){
      toast.error( "Network error. Please try again.");
    }
    finally{
      setLoading(false);
    }
  }


  return (
    <>
      {/* Header */}
      <HeaderUi />

      <div className="container my-5">
        <div className="row align-items-center">
        
          {/* Illustrator Img */}
          <div className="col-lg-6 d-none d-md-flex">
            <img src={signupimg} alt="" width="100%" height="50%"/>
          </div>

          {/* Registration Form */}
          <div className="col-lg-6 col-12">
            <div className="registration-form">
              <div className="card border-0 shadow">
                <div className="card-body">

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <h1 className='mb-4 text-center'> Registration Page</h1>
                    <div className="row">

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
                            type="text" className={`form-control ${errors.name && 'is-invalid'}`} placeholder='Enter Your name here....' disabled={loading} />
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
                            type="text" className={`form-control ${errors.email && 'is-invalid'}`} placeholder='Enter Email here....' disabled={loading} />
                          {
                            errors.email && <p className='invalid-feedback'>{errors.email?.message}</p>
                          }
                        </div>

                      </div>

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
                            type="text" className={`form-control ${errors.username && 'is-invalid'}`} placeholder='Enter username here....' disabled={loading} />
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
                              pattern: {
                                  value: /^[6-9]\d{9}$/,
                                  message: "Enter a valid 10-digit mobile number."
                              }
                            })
                            }
                            type="text" className={`form-control ${errors.mobile_no && 'is-invalid'}`} placeholder='Enter Mobile Number here....' disabled={loading} />
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
                            type={showPassword ? "text" : "password"} className={`form-control ${errors.password && 'is-invalid'}`} placeholder='Enter Password here....'
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

                          <span className='text-light'>Creating Account... </span>

                        </>

                        ) : (

                          "Create Account"

                      )}

                    </button>

                    <br />
                                        
                    <hr />
                    
                    <div className="text-center mt-4">

                      <p className="fw-medium"> Already have an account?
                        <Link
                        to={AUTH_ROUTES.LOGIN}
                        className="ms-2"
                        >

                      Login Now

                      </Link>

                      </p>

                      </div>
                  </form>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <FooterUi />
    </>
  )
}

export default Registration