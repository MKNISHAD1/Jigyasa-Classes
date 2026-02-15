// import React, { useState } from "react";
// import Header from "../../Common/Header";
// import Sidebar from "../../Common/Sidebar";
// import { useForm } from "react-hook-form";
// import { Link, useNavigate } from "react-router-dom";
// import { apiUrl, token } from "../../Common/http";
// import { toast } from "react-toastify";

// const Createuser = () => {
//   const [isDisable, setIsDisable] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//     setError,
//   } = useForm();

//   const navigate = useNavigate();

// const onSubmit = async (data) => {
//   setIsDisable(true); // optional, disable button while submitting
//   try {
//     const res = await fetch(apiUrl + 'add-user', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${token()}`
//       },
//       body: JSON.stringify(data)
//     });

//     const result = await res.json();

//     if (result.status === true) {
//       toast.success(result.message);
//       navigate('/admin/users');
//     } else {
//       // Server validation errors
//       if (result.error) {
//         for (const key in result.error) {
//           // result.error[key] is an array, we take the first message
//           setError(key, { type: 'server', message: result.error[key][0] });
//         }
//       } else {
//         toast.error(result.message || "Something went wrong!");
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Server error, please try again later.");
//   } finally {
//     setIsDisable(false);
//   }
// };

//   return (
//     <>
//       <Header />
//       <main>
//         <div className="container my-5">
//           <div className="row">
//             <div className="col-md-3">
//               {/* Sidebar Here  */}
//               <Sidebar />
//             </div>
//             <div className="col-md-9">
//               {/* Show Services */}

//               <div className="card shadow border-0">
//                 <div className="card-body p-4">
//                   <div className="d-flex justify-content-between">
//                     <h4 className="h5">Create New User</h4>
//                     <Link to="/admin/Users" className="btn btn-danger">
//                       Back
//                     </Link>
//                   </div>
//                   <hr />

//                   <form onSubmit={handleSubmit(onSubmit)}>
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label htmlFor="" className="form-label">
//                             Enter Your Email
//                           </label>
//                           <input
//                             {...register("email", {
//                               required: "This Field is Required",
//                               pattern: {
//                                 value:
//                                   /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                                 message:
//                                   "Invalid Email Address , Please Use Genuine Email!!!!",
//                               },
                              
//                             })}
//                             type="text"
//                             className={`form-control ${
//                               errors.email && "is-invalid"
//                             }`}
//                             placeholder="Enter Email here...."
//                           />
//                           {errors.email && (
//                             <p className="invalid-feedback">
//                               {errors.email?.message}
//                             </p>
//                           )}
//                         </div>

//                         <div className="mb-3">
//                           <label htmlFor="" className="form-label">
//                             Enter Name{" "}
//                           </label>
//                           <input
//                             {...register("name", {
//                               required: "This Field is Required",
//                             })}
//                             type="text"
//                             className={`form-control ${
//                               errors.name && "is-invalid"
//                             }`}
//                             placeholder="Enter Your name here...."
//                           />
//                           {errors.name && (
//                             <p className="invalid-feedback">
//                               {errors.name?.message}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label htmlFor="" className="form-label">
//                             Enter Username{" "}
//                           </label>
//                           <input
//                             {...register("username", {
//                               required: "This Field is Required",
//                             })}
//                             type="text"
//                             className={`form-control ${
//                               errors.username && "is-invalid"
//                             }`}
//                             placeholder="Enter username here...."
//                           />
//                           {errors.username && (
//                             <p className="invalid-feedback">
//                               {errors.username?.message}
//                             </p>
//                           )}
//                         </div>
//                         <div className="mb-3">
//                           <label htmlFor="" className="form-label">
//                             Enter Mobile No.{" "}
//                           </label>
//                           <input
//                             {...register("mobile_no", {
//                               required: "This Field is Required",
//                             })}
//                             type="text"
//                             className={`form-control ${
//                               errors.mobile_no && "is-invalid"
//                             }`}
//                             placeholder="Enter Mobile Number here...."
//                           />
//                           {errors.mobile && (
//                             <p className="invalid-feedback">
//                               {errors.mobile?.message}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label htmlFor="" className="form-label">
//                             Password
//                           </label>
//                           <input
//                             {...register("password", {
//                               required: "This Field is Required",
//                             })}
//                             type="password"
//                             className={`form-control ${
//                               errors.password && "is-invalid"
//                             }`}
//                             placeholder="Enter Password here...."
//                           />
//                           {errors.password && (
//                             <p className="invalid-feedback">
//                               {errors.password?.message}
//                             </p>
//                           )}
//                         </div>
//                         <div className="mb-3">
//                           <label htmlFor="" className="form-label">
//                             User Role
//                           </label>
//                           <select
//                             className="form-control"
//                             {...register("role")}
//                           >
//                             <option value="student">Student</option>
//                             <option value="teacher">Teacher</option>
//                             <option value="moderator">Moderator</option>
//                             <option value="admin">Admin</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                     <button type="submit" className="btn btn-warning">
//                       Create User
//                     </button>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// };

// export default Createuser;


import React, { useContext, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { AuthContext } from "../context/Auth";

const Createuser = () => {
  const {hasAnyRole} = useContext(AuthContext);
  const [isDisable, setIsDisable] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    mode: "onChange", // validates on change
  });

  const navigate = useNavigate();

  // Async validation for email
  const validateEmail = async (value) => {
    try {
      const res = await fetch(`${apiUrl}check-email?email=${value}`, {
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      if (data.exists) return "Email already taken";
      return true;
    } catch (err) {
      return "Error checking email";
    }
  };

  // Async validation for username
  const validateUsername = async (value) => {
    try {
      const res = await fetch(`${apiUrl}check-username?username=${value}`, {
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      if (data.exists) return "Username already taken";
      return true;
    } catch (err) {
      return "Error checking username";
    }
  };

  const onSubmit = async (data) => {
    setIsDisable(true);
    try {
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
        navigate("/admin/users");
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
      console.error(err);
      toast.error("Server error, please try again later.");
    } finally {
      setIsDisable(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9">
              <div className="card shadow border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between">
                    <h4 className="h5">Create New User</h4>
                    <Link to="/admin/Users" className="btn btn-danger">
                      Back
                    </Link>
                  </div>
                  <hr />

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Enter Your Email</label>
                          <input
                            {...register("email", {
                              required: "This Field is Required",
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid Email Address",
                              },
                              validate: validateEmail,
                            })}
                            type="text"
                            className={`form-control ${errors.email && "is-invalid"}`}
                            placeholder="Enter Email here...."
                          />
                          {errors.email && (
                            <p className="invalid-feedback">{errors.email.message}</p>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Enter Name</label>
                          <input
                            {...register("name", { required: "This Field is Required" })}
                            type="text"
                            className={`form-control ${errors.name && "is-invalid"}`}
                            placeholder="Enter Your name here...."
                          />
                          {errors.name && (
                            <p className="invalid-feedback">{errors.name.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Enter Username</label>
                          <input
                            {...register("username", {
                              required: "This Field is Required",
                              validate: validateUsername,
                            })}
                            type="text"
                            className={`form-control ${errors.username && "is-invalid"}`}
                            placeholder="Enter username here...."
                          />
                          {errors.username && (
                            <p className="invalid-feedback">{errors.username.message}</p>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Enter Mobile No.</label>
                          <input
                            {...register("mobile_no", { required: "This Field is Required" })}
                            type="text"
                            className={`form-control ${errors.mobile_no && "is-invalid"}`}
                            placeholder="Enter Mobile Number here...."
                          />
                          {errors.mobile_no && (
                            <p className="invalid-feedback">{errors.mobile_no.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Password</label>
                          <input
                            {...register("password", { required: "This Field is Required" })}
                            type="password"
                            className={`form-control ${errors.password && "is-invalid"}`}
                            placeholder="Enter Password here...."
                          />
                          {errors.password && (
                            <p className="invalid-feedback">{errors.password.message}</p>
                          )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">User Role</label>
                                  <select className="form-control" {...register("role", { required: true })}>
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
                    </div>

                    <button type="submit" className="btn btn-warning" disabled={isDisable}>
                      Create User
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Createuser;