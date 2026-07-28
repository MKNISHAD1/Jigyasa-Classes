import React, { useContext, useState } from 'react'
import Header from '../Common/Header'
import Sidebar from '../Common/Sidebar'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl, token } from '../Common/http'
import { toast } from 'react-toastify'
import HeaderUi from '../Common/CommonUI/HeaderUi'
import FooterUi from '../Common/CommonUI/FooterUi'
import { faAngleRight, faArrowLeft, faCircleExclamation, faCircleInfo, faLock } from '@fortawesome/free-solid-svg-icons'
import { AUTH_ROUTES, DASHBOARD_ROUTES } from '../../constants/nevigation/routes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons'
import { AuthContext } from './context/Auth'


const Changepassword = () => {

  const { logout } = useContext(AuthContext);

  const [isDisable, setIsDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
      mode:"onChange", // onBlur  = after leaving the field and debounce validator 
      reValidateMode:"onChange",
    })

  const onSubmit = async (data) => {
    setIsDisable(true);
    setLoading(true);

    try {

      data.current_password = data.current_password.trim();
      data.new_password = data.new_password.trim();
      data.new_password_confirmation = data.new_password_confirmation.trim();
      
      const res = await fetch(apiUrl + 'changepassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.status === true) {
        toast.success("Password updated successfully. Please login again");
        reset();
        logout();
        navigate(AUTH_ROUTES.LOGIN);
      } else {
        if (result.errors) {
          Object.values(result.errors).forEach(errArr => {
            toast.error(errArr[0]); // show first error from array
          });
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setIsDisable(false);
      setLoading(false);
    }
  }

  return (
    <>  

      <form onSubmit={handleSubmit(onSubmit)} 
      >

        {/* Breadcrumbs */}
        <div className="d-flex justify-content-between align-items-center">
          <section className="breadcrumb-section">
            <h3>Change <span>Password</span></h3>
    
            <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
            <span><FontAwesomeIcon icon={faAngleRight}/></span>
            
    
            <Link className='bread-link' to=""><span>Change Password</span></Link>
          </section>
    
          <Link to={DASHBOARD_ROUTES.VIEW_PROFILE} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  View Profile
          </Link>
        </div>

        <div className="dashboard-card mt-4 space"
        >

          {/* Header */}
          <div className="header-custom d-flex  justify-content-center mb-3">

              <div className="header d-flex align-items-center ">

                  <FontAwesomeIcon
                      icon={faLock}
                      className="icon p-3"
                      style={{
                        background:'#ebf1f5',
                        color:'#1363b8',
                        borderRadius:'50%'
                      }}
                  />

              </div>
              <div className=' mt-2 mb-2 px-3'>
                
                <span className='text-primary fw-bold '>Change Your Password</span><br />

                <small className="text-muted mb-0">
                    For your security, please use a strong password.
                </small>
              </div>
          </div>

          <hr />

                                      
          {/* Current Password */}
          <div className="mt-4 mb-4">

            <label className="form-label"> Current Password</label>

            <div className="input-group">

              <input
                type={ showCurrentPassword ? "text" : "password" }                
                placeholder="Enter your current password"
                disabled={loading}
                autoComplete='current-password'
                className={`form-control ${
                  errors.current_password &&
                  "is-invalid"
                  }`}

                {...register("current_password",
                  {required:
                    "Current password is required."
                    })}
              />

              <button
                type="button"
                disabled={loading}
                className="btn view-password btn-outline-secondary"
                onClick={()=> setShowCurrentPassword( !showCurrentPassword )}
              >

                <FontAwesomeIcon icon ={showCurrentPassword ? faEyeSlash : faEye}
                />

              </button>

            </div>

            {
              errors.current_password &&
              <p className="invalid-feedback d-block">
                {errors.current_password.message}
              </p>
            }

          </div>

          {/* New Password */}
          <div className="mb-4">

            <label className="form-label"> New Password</label>

            <div className="input-group">

              <input
                type={ showNewPassword ? "text" : "password" }                
                placeholder="Enter your new password"
                disabled={loading}
                autoComplete='new-password'
                className={`form-control ${
                  errors.new_password &&
                  "is-invalid"
                  }`}

                {...register("new_password",{
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
                    })}
              />

              <button
                type="button"
                disabled={loading}
                className="btn view-password  btn-outline-secondary"
                onClick={()=> setShowNewPassword( !showNewPassword )}
              >

                <FontAwesomeIcon icon ={showNewPassword ? faEyeSlash : faEye}
                />

              </button>

            </div>

            {
              errors.new_password &&
              <p className="invalid-feedback d-block">
                {errors.new_password.message}
              </p>
            }

          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label"> Confirm Password</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password" 
                disabled={loading}
                autoComplete='new-password'
                className={`form-control ${
                  errors.new_password_confirmation && "is-invalid"
                }`}


                {...register("new_password_confirmation",{
                  required:"Please confirm your password.",

                  validate:(value)=>
                  value===watch("new_password") ||
                    "Passwords do not match."
                })}
              />
              <button
                type="button"
                disabled={loading}
                className="btn view-password btn-outline-secondary"
                onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
                >

                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  
                />

              </button>

              {
                errors.new_password_confirmation &&
                  <p className="invalid-feedback d-block">
                  {errors.new_password_confirmation.message}
                  </p>
              }
            </div>

          </div>

          {/* Password Tip */}

          <div className="keep mt-4 mb-4 m-0"
            style={{ 
              border:'1px solid #1363b8', 
              borderRadius:'10px',
              background:'#ebf1f5'
            }}

          >

            <div className="profile-stat d-flex align-items-start w-100">

              <FontAwesomeIcon
                icon={faCircleInfo}
                className="icon bg-light" 
              />

              <div>

                <h6 className='text-primary mt-1 mb-2'>Password Tips : </h6>
                  <span>
                    • Use Minimum 8 characters.
                    <br/>

                    • Include uppercase, lowercase letters, numbers and symbols.
                    <br/>

                    • Avoid using personal information.
                    <br/>
                  </span>

              </div>

            </div>

          </div>

          {/* Button */}


          <button
            type="submit"
            className="btn btn-primary w-100 mt-2"
            disabled={loading || isDisable}

          >

            {loading ? 

                <>
                  <span
                    className="spinner-border spinner-border-sm me-2 text-light"
                  />
                  
                  <span>Updating Password...</span> 
                </> : <>
                          <FontAwesomeIcon
                            icon={faLock}
                            className="me-2"
                          />

                          Update Password

                      </>

            }

          </button>


        </div>
              {/* </div> */}
      </form>

    </>
  )
}

export default Changepassword