import React, { useContext } from 'react'
import Header from '../Common/Header'
import Footercomp from '../Common/footer'
import { useForm } from "react-hook-form"
import { apiUrl } from '../Common/http'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './context/Auth'
import { toast } from 'react-toastify'

const Registration = () => {

   
  const {login} = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    // get data in console
    // console.log(data)

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

    if (result.status == false) {
      //Show  Error message 
      toast.error("Something went wrong, Please Try again");

      //redirect to register page after signup failed
      navigate('/register');
      
    }

    else {

      // Show success message for login
      toast.success(result.message);
      navigate("/login");


    }
    // ------------------------- Rediect to dashboard page (not working properly but able to login)--------------

    //   // create variable to store in local storage
    //   const userInfo = {
    //           id : result.id,
    //           token : result.token
    //   }

    //   // it will store in local storage
    //   localStorage.setItem('userInfo',JSON.stringify(userInfo))
      
    //   // It will login the user to dashboard
    //   login(userInfo);

    //   // It will redirect to dashbard
    //   navigate('/dash');

    // }
    // // console  log result 
    // // console.log(result);

  }


  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="login-form">
          <div className="card border-0 shadow">
            <div className="card-body">

              <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className='mb-4 text-center'> Registration Page</h1>
                <div className="row">
                  <div className="col-md-6">

                    <div className="mb-3">
                      <label htmlFor="" className='form-label'>Enter Your Email</label>
                      <input
                        {
                        ...register('email', {
                          required: "This Field is Required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid Email Address , Please Use Genuine Email!!!!"
                          }
                        })
                        }
                        type="text" className={`form-control ${errors.email && 'is-invalid'}`} placeholder='Enter Email here....' />
                      {
                        errors.email && <p className='invalid-feedback'>{errors.email?.message}</p>
                      }
                    </div>

                    <div className="mb-3">
                      <label htmlFor="" className='form-label'>Enter Name </label>
                      <input
                        {
                        ...register('name', {
                          required: "This Field is Required"
                        })
                        }
                        type="text" className={`form-control ${errors.name && 'is-invalid'}`} placeholder='Enter Your name here....' />
                      {
                        errors.name && <p className='invalid-feedback'>{errors.name?.message}</p>
                      }
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="" className='form-label'>Enter Username </label>
                      <input
                        {
                        ...register('username', {
                          required: "This Field is Required"
                        })
                        }
                        type="text" className={`form-control ${errors.username && 'is-invalid'}`} placeholder='Enter username here....' />
                      {
                        errors.username && <p className='invalid-feedback'>{errors.username?.message}</p>
                      }
                    </div>
                    <div className="mb-3">
                      <label htmlFor="" className='form-label'>Enter Mobile No. </label>
                      <input
                        {
                        ...register('mobile_no', {
                          required: "This Field is Required"
                        })
                        }
                        type="text" className={`form-control ${errors.mobile && 'is-invalid'}`} placeholder='Enter Mobile Number here....' />
                      {
                        errors.mobile && <p className='invalid-feedback'>{errors.mobile?.message}</p>
                      }
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="" className='form-label'>Password</label>
                    <input
                      {
                      ...register('password', {
                        required: "This Field is Required"
                      })
                      }
                      type="password" className={`form-control ${errors.password && 'is-invalid'}`} placeholder='Enter Password here....' />
                    {
                      errors.password && <p className='invalid-feedback'>{errors.password?.message}</p>
                    }
                  </div>

                </div>
                <button type='submit' className='btn btn-warning'>Register</button>
              </form>



            </div>

          </div>
        </div>
      </div>
      <Footercomp />
    </>
  )
}

export default Registration