import React, { useState } from 'react'
import Header from '../Common/Header'
import Sidebar from '../Common/Sidebar'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { apiUrl, token } from '../Common/http'
import { toast } from 'react-toastify'

const Changepassword = () => {
  const [isDisable, setIsDisable] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsDisable(true);

    try {
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
        toast.success(result.message);
        navigate('/dash');
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
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9 dashboard">
              <div className="card shadow border-0">
                <div className="card-body d-flex justify-content-center align-items-center">
                  
                  <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%", maxWidth: "500px" }}>
                    <h1 className='mb-4 text-center'>Change Password</h1>
                    
                    {/* Current Password */}
                    <div className="mb-3">
                      <label className='form-label'>Current Password</label>
                      <input
                        {...register('current_password', { required: "Current password is required" })}
                        type="password"
                        className={`form-control ${errors.current_password ? 'is-invalid' : ''}`}
                        placeholder='Enter Current Password'
                      />
                      {errors.current_password && <p className='invalid-feedback'>{errors.current_password.message}</p>}
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label className='form-label'>New Password</label>
                      <input
                        {...register('new_password', { required: "New password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                        type="password"
                        className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
                        placeholder='Enter New Password'
                      />
                      {errors.new_password && <p className='invalid-feedback'>{errors.new_password.message}</p>}
                    </div>

                    {/* Confirm New Password (MUST BE new_password_confirmation) */}
                    <div className="mb-3">
                      <label className='form-label'>Confirm Password</label>
                      <input
                        {...register('new_password_confirmation', {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === watch('new_password') || "Passwords do not match"
                        })}
                        type="password"
                        className={`form-control ${errors.new_password_confirmation ? 'is-invalid' : ''}`}
                        placeholder='Confirm New Password'
                      />
                      {errors.new_password_confirmation && <p className='invalid-feedback'>{errors.new_password_confirmation.message}</p>}
                    </div>

                    <button type='submit' className='btn btn-primary w-100' disabled={isDisable}>
                      {isDisable ? "Updating..." : "Update Password"}
                    </button>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Changepassword