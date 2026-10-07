import React, { useContext, useState } from 'react'
import { useForm } from "react-hook-form"
import { apiUrl } from '../Common/http'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import HeaderUi from '../Common/CommonUI/HeaderUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAt, faEnvelope, faEye, faEyeSlash, faGraduationCap, faKey, faLock, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import FooterUi from '../Common/CommonUI/FooterUi';
import signupimg from "../../assets/images/singup2.png";
import { AUTH_ROUTES } from '../../constants/nevigation/routes';
import { availabilityValidator } from '../../utilities/validators';
import logo from '../../assets/images/Logo2.png';



const Registration = () => {

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

      <div className="container-fluid Form_Section">
        <div className="row">
        
          {/* Illustrator Img */}
          <div className="col-lg-6 d-none d-lg-flex Illustration_Img">
            <img src={signupimg} alt="Signup  Illustration"/>
          </div>

          {/* Registration Form */}
          <div className="col-lg-6 col-12">

            <div className="Form_Body">

              <form onSubmit={handleSubmit(onSubmit)}>

                {/* Logo Emblemb */}
                <div className="d-flex d-lg-none Logo_Emblemb">
                  <img src={logo} alt="Signup  Illustration"/>
                </div>

                {/* Form Title */}
                <div className="Form_Title">
                  <h1> Create <span>Account</span></h1>
                  <small className='text-muted'>Start your learning journey with Jigyasa Classes</small>
                </div>

                {/* Divide Line */}
                <div className="Divider_Line">
                  <div className="Line"></div>
                  <FontAwesomeIcon icon={faGraduationCap} className='Icon'/>
                  <div className="Line"></div>
                </div>          

                {/* Input Groups */}
                <div className="row">

                  <div className="col-md-6">

                    {/* Name */}

                    <div className="mb-4">
                      <div className="Input_Title">
                        <FontAwesomeIcon icon={faUser} className='Icon' />
                        <label htmlFor="" className='form-label'>Full Name </label>
                      </div>
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
                        type="text" className={`form-control ${errors.name && 'is-invalid'}`} placeholder='Enter your full name ' disabled={loading} />
                      {
                        errors.name && <p className='invalid-feedback'>{errors.name?.message}</p>
                      }
                    </div>
                    
                    {/* Username */}
                    <div className="mb-4">
                      <div className="Input_Title">
                        <FontAwesomeIcon icon={faAt} className='Icon' />
                        <label htmlFor="" className='form-label'>Username </label>
                      </div>                     

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
                        type="text" className={`form-control ${errors.username && 'is-invalid'}`} placeholder='Choose an username' disabled={loading} />
                      {
                        errors.username && <p className='invalid-feedback'>{errors.username?.message}</p>
                      }
                    </div>

                  </div>

                  <div className="col-md-6">

                    {/* Email */}
                    <div className="mb-4">
                      <div className="Input_Title">
                        <FontAwesomeIcon icon={faEnvelope} className='Icon' />
                        <label htmlFor="" className='form-label'>Email Address </label>
                      </div>      
                      
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
                        type="text" className={`form-control ${errors.email && 'is-invalid'}`} placeholder='Enter your email address' disabled={loading} />
                      {
                        errors.email && <p className='invalid-feedback'>{errors.email?.message}</p>
                      }
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                      <div className="Input_Title">
                        <FontAwesomeIcon icon={faPhone} className='Icon' />
                        <label htmlFor="" className='form-label'>Phone Number </label>
                      </div>   

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
                        type="text" className={`form-control ${errors.mobile_no && 'is-invalid'}`} placeholder='Enter your mobile number' disabled={loading} />
                      {
                        errors.mobile_no && <p className='invalid-feedback'>{errors.mobile_no?.message}</p>
                      }
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <div className="Input_Title">
                      <FontAwesomeIcon icon={faLock} className='Icon' />
                      <label htmlFor="" className='form-label'>Password</label>
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
                        type={showPassword ? "text" : "password"} className={`form-control ${errors.password && 'is-invalid'}`} placeholder='Write your password'
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
                  <div className="mb-4">

                    <div className="Input_Title">
                      <FontAwesomeIcon icon={faKey} className='Icon' />
                      <label htmlFor="" className='form-label'>Confirm Password</label>
                    </div>  

                    <div className="input-group">

                      <input
                        type={showPassword ? "text" : "password"}

                        className={`form-control ${
                          errors.confirm_password && "is-invalid"
                        }`}

                        placeholder="Confirm your password" disabled={loading}

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

                {/* Submit Button */}
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

                      <span className='text-primary'>Creating Account... </span>

                    </>

                    ) : (

                      "Create Account"

                  )}

                </button>

               {/* Divide Line */}
                <div className="Divider_Line">
                  <div className="Line"></div>
                  <h4  className='Icon m-0'>OR</h4>
                  <div className="Line"></div>
                </div>
                
                {/* Login Page redirect */}
                <div className="text-center mt-1">
                  <p className="fw-medium"> Already have an account?
                    <Link
                    to={AUTH_ROUTES.LOGIN}
                    className="fw-bold ms-2"
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
      
      {/* Footer */}
      <FooterUi />
    </>
  )
}

export default Registration