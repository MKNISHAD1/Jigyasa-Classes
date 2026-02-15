
import React, { useState } from "react";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";
import { useForm } from "react-hook-form";
import { apiUrl, token } from "../Common/http";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState("");
  const [isDisable, setIsDisable] = useState(false);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors,  isSubmitting  },
  } = useForm({
    defaultValues: async () => {
      const res = await fetch(apiUrl + "viewprofile", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();
      setUser(result.user);
      return {
        name: result.user.name,
        email: result.user.email,
        username: result.user.username,
        mobile_no: result.user.mobile_no,
        address: result.user.address,
      };
    },
  });
// Disbale submit button if no change
const watchAll = watch();
const isChanged =
  user &&
  (watchAll.name !== user.name ||
    watchAll.username !== user.username ||
    watchAll.mobile_no !== user.mobile_no ||
    watchAll.address !== user.address);


  // File preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const navigate = useNavigate();

  // Update Profile
  const onSubmit = async (data) => {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.username) formData.append("username", data.username);
    if (data.mobile_no) formData.append("mobile_no", data.mobile_no);
    if (data.address) formData.append("address", data.address);
                      formData.append("_method","PUT");
    if (data.profile_pic && data.profile_pic[0]) {
      formData.append("profile_pic", data.profile_pic[0]);
    }

    const res = await fetch(apiUrl + "updateprofile", {
      method: "POST", // Laravel handles update with POST + _method override
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: formData,
    });

    const result = await res.json();
    setIsDisable(false);

    if (result.status === true) {
      toast.success(result.message);
      reset();
      setPreview(null);
      navigate("/dash");
    } else {
      toast.error(result.message || "Update failed");
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
            <div className="col-md-9 dashboard">
              <div className="card shadow border-0">
                <div className="card-body d-flex justify-content-center align-items-center">
                  <div className="profile-section p-4">
                    <h1 className="mb-4 text-center">User Profile</h1>
                    <div className="p-3 text-center">
                      <img
                        src={preview || user?.profile_pic}
                        alt="Profile"
                        className="rounded-circle mb-2"
                        width="120"
                        height="120"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        {...register("profile_pic")}
                        onChange={handleFileChange}
                        className="form-control mt-2"
                      />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row pt-4">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                              {...register("email")}
                              type="text"
                              className="form-control"
                              disabled
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                              {...register("name", {
                                required: "Name is required",
                              })}
                              type="text"
                              className={`form-control ${
                                errors.name && "is-invalid"
                              }`}
                            />
                            {errors.name && (
                              <p className="invalid-feedback">
                                {errors.name?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                              {...register("username", {
                                required: "Username is required",
                              })}
                              type="text"
                              className={`form-control ${
                                errors.username && "is-invalid"
                              }`}
                            />
                            {errors.username && (
                              <p className="invalid-feedback">
                                {errors.username?.message}
                              </p>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Mobile</label>
                            <input
                              {...register("mobile_no", {
                                required: "Mobile number is required",
                              })}
                              type="text"
                              className={`form-control ${
                                errors.mobile_no && "is-invalid"
                              }`}
                            />
                            {errors.mobile_no && (
                              <p className="invalid-feedback">
                                {errors.mobile_no?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      
<button
  type="submit"
  className="btn btn-primary"
  disabled={!isChanged || isSubmitting}
>
  Update Profile
</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;