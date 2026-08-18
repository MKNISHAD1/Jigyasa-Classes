
import React, { useState } from "react";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";
import { useForm } from "react-hook-form";
import { apiUrl, token } from "../Common/http";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FooterUi from "../Common/CommonUI/FooterUi";
import HeaderUi from "../Common/CommonUI/HeaderUi";
import { availabilityValidator} from "../../utilities/validators";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faArrowLeft, faCamera, faCheck, faCircleExclamation, faPhone, faUserAlt, faWarning } from "@fortawesome/free-solid-svg-icons";
import { DASHBOARD_ROUTES } from "../../constants/nevigation/routes";

const EditProfile = () => {
  const [user, setUser] = useState("");
  const [isDisable, setIsDisable] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading,setLoading]=useState(false);
  

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors,  isSubmitting  },
  } = useForm({
    mode:"onChange", // onBlur  = after leaving the field and debounce validator 
    reValidateMode:"onChange",
    defaultValues: async () => {
      try{

          setLoading(true);

          // Fetch User data
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
              professional_title: result.user.professional_title,
              bio: result.user.bio,
            };
          } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Something went wrong while fetching profile information");
        } finally {
            setLoading(false);
        }
    },
  });

// Disbale submit button if no change
const watchAll = watch();
const profilePic = watch("profile_pic");
const isChanged =
  user &&
  (watchAll.name !== user.name ||
    watchAll.username !== user.username ||
    watchAll.mobile_no !== user.mobile_no ||
    watchAll.professional_title !== user.professional_title ||
    watchAll.bio !== user.bio ||
    (profilePic && profilePic.length > 0)
  ) 

  // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

        return new Date(date).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"long",
            year:"numeric",
        });

    };

    // Formate role
    const formatRole = role =>
    role
        ?.replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    // role helper 
    const role = user?.role?.[0]

    // Teacher check
    const isStudent = role === "student" ;

    //  Professional Title role based 
    const defaultProfessionalTitle = {
        student: "Jigyasa Classes Student",
        teacher: "Jigyasa Classes Instructor",
        moderator: "System Moderator",
        admin: "Administrator",
        super_admin: "System Administrator",
    };

    const professionalTitle =
        user?.professional_title ||
        defaultProfessionalTitle[user?.role?.[0]] ||
        "Jigyasa Classes Member";

    //  Biography role based 
    const defaultBiography = {
        student: "I am honerable student at Jigyasa Classes",
        teacher: "I am teaching instructor at Jigyasa Classess",
        moderator: "I am moderator, I help in maintaining system",
        admin: " I am administrator, I work under super admin", 
        super_admin: "I am super admin, I maintaine whole Jigyasa Classes system",
    };

    const userBio =
        user?.bio ||
        defaultBiography[user?.role?.[0]] ||
        "No biography has been added yet.";

// Destructer for profile img
const {
    onChange,
    ...profilePicRegister
} = register("profile_pic");

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
    setLoading(true);
    try{
    const formData = new FormData();
    
    formData.append("_method","PUT");
    if (data.name) formData.append("name", data.name);
    if (data.username) formData.append("username", data.username);
    if (data.mobile_no) formData.append("mobile_no", data.mobile_no);
    if (data.profile_pic && data.profile_pic[0]) {
      formData.append("profile_pic", data.profile_pic[0]);
    }
    if (data.professional_title)
    formData.append("professional_title", data.professional_title);
    if (data.bio)
        formData.append("bio", data.bio);

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

      // navigate();

      window.location.href = DASHBOARD_ROUTES.VIEW_PROFILE;

    } else {
      toast.error(result.message || "Update failed");
    }
    }    
    catch(error){
      toast.error( "Network error. Please try again.");
    }
    finally{
      setLoading(false);
    }

  };

// spiner while loading data 
if (loading) {
  return (
    <div className="dashboard-card mt-4">
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "350px" }}
      >
        <div
          className="spinner-border text-success "
          style={{ width: "3rem", height: "3rem" }}
        />

        <h5 className="mt-3 mb-1">Loading profile...</h5>

        <small className="text-muted">
          Please wait while we fetch your profile information.
        </small>
      </div>
    </div>
  );
}


  return (
    <>


<form onSubmit={handleSubmit(onSubmit)}>

    {/* Breadcrumbs */}
    <div className="d-flex justify-content-between align-items-center">
      <section className="breadcrumb-section">
        <h3>Edit <span>Profile</span> </h3>

        <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
        <span><FontAwesomeIcon icon={faAngleRight}/></span>
        

        <Link className='bread-link' to=""><span>Edit Profile</span></Link>
      </section>

      <Link to={DASHBOARD_ROUTES.VIEW_PROFILE} className="edit-btn">
      <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
      </Link>
    </div>

    {/* Profile Update */}
    <div className="dashboard-card mt-4">

        <div className="card-header-custom">
            <div className="header">
                <FontAwesomeIcon icon={faUserAlt} className="icon" />
                <span>Profile Information</span>
            </div>
        </div>

        <div className="row">

            {/* Left */}

            <div className="col-lg-4">
              <div className="profile-image-box mb-4">
                  <img
                      src={preview || user?.profile_pic}
                      alt={user?.name}
                      
                  />
                  <small>
                      JPG, PNG , JPEG, WEBP. Max Size 2 MB.
                  </small>
                  <input
                      id="profile_pic"
                      type="file"
                      hidden
                      accept="image/*"
                      {...profilePicRegister}
                      onChange={(e)=>{
                          onChange(e);
                          handleFileChange(e);
                      }}
                      disabled={loading}
                  />
                  <label
                      htmlFor="profile_pic"
                      className="btn btn-primary mt-3"
                  >
                    <FontAwesomeIcon icon={faCamera} className="me-2"/>
                    Change Photo
                  </label>

              </div>
            </div>

            {/* Right */}

            <div className="col-lg-8">

                {/* Full Name */}

                <div className="mb-3">

                    <label className="form-label">
                        Full Name
                    </label>

                    <input
                      {...register("name", {
                        required: "Name is required",
                      })}
                      type="text"
                      className={`form-control ${
                        errors.name && "is-invalid"
                      }`}
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="invalid-feedback">
                        {errors.name?.message}
                      </p>
                    )}

                </div>

                {/*  Only Student can't edit */}

                <div className="mb-3">
                    <label className="form-label">
                        Professional Title
                    </label>

                    <input
                        {...register("professional_title")}
                        className="form-control"
                        value={watch("professional_title") || professionalTitle}
                        disabled={isStudent}
                        placeholder={professionalTitle}
                    />
                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Biography
                    </label>

                    <textarea
                        rows={5}
                        maxLength={300}
                        {...register("bio")}
                        className="form-control"
                        value={watch("bio") || userBio}
                        disabled={isStudent}
                        placeholder={userBio}
                    />

                    <small className="text-muted">
                        {(watch("bio") || userBio).length}/300
                    </small>

                </div>
            </div>

        </div>

    </div>

    {/* Contact Information Card */}
    <div className="dashboard-card mt-4">

      <div className="card-header-custom">
          <div className="header">
              <FontAwesomeIcon icon={faPhone} className="icon" />
              <span>Contact Information</span>
          </div>
      </div>

      <div className="row">

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            {...register("email")}
            type="text"
            className="form-control"
            disabled
          />
        </div>

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              {...register("username", {
                required: "Username is required",
                validate :availabilityValidator(
                  "users", // Model name
                  "username", // Feild Name
                  user?.id,
                  user?.username,
                  "username" // lable Name
                )
              })}
              type="text"
              disabled={loading}
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
        </div>

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Mobile</label>
            <input
              {...register("mobile_no", {
                required: "Mobile number is required",
                pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number."
                  },
                validate :availabilityValidator(
                  "users", // Model name
                  "mobile_no", // Feild Name
                  user?.id,
                  user?.mobile_no,
                  "Mobile No." // lable Name
                ),
              })}
              type="text"
              maxLength={10}
              disabled={loading}
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

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Country</label>
            <input
              type="text"
              className="form-control"
              placeholder="India"
              disabled
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Language</label>
            <input
              type="text"
              className="form-control"
              placeholder="Hindi, English"
              disabled
            /> 
          </div>
      </div>

      </div>

    </div>

    {/* Account Information */}
    <div className="dashboard-card mt-4">

      <div className="card-header-custom">
          <div className="header">
              <FontAwesomeIcon icon={faPhone} className="icon" />
              <span>Contact Information</span>
          </div>
      </div>

      <div className="row">

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-control"
              placeholder={formatRole(role)}
              disabled
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Member Since</label>
            <input
              type="text"
              className="form-control"
              placeholder={formatDate(user?.created_at)}
              disabled
            />
          </div>
        </div>

        <div className="col-lg-6">
          <label className="form-label">Email Status</label> <br />

          <span className={`badge mb-3 ${
              user?.email_verified_at
                  ? "badge-verified text-success"
                  : "badge-not-verified text-danger"
          }`}>
              {user?.email_verified_at
                  ? 
                  <>
                    <FontAwesomeIcon icon={faCheck}/> Verified
                  </>
                  : 
                  <>
                    <FontAwesomeIcon icon={faWarning}/> Not Verified
                  </>}
          </span>
        </div>

        <div className="col-lg-6">
          <div className="mb-3">
            <label className="form-label">Last Login</label>
            <input
              type="text"
              className="form-control"
              placeholder={user?.last_login_at
                ? new Date(user.last_login_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
              }) : "First Login"}
              disabled
            />
          </div>
        </div>

      </div>
    </div>

    {/* Note */}
    <div className="mb-4  mt-4  keep"> 

          <div className="profile-stat">

            <FontAwesomeIcon icon={faCircleExclamation} className="icon"/>

            <div>
              <h6>Note</h6>
              <span>Some information is managed bt the system and cannot be edited. Kindly contact support in need of assisstence. Thank You!
</span>
            </div>
          </div>
    
    </div>

    <hr className="m-4" />

    {/* buttons */}
    <div className="d-flex justify-content-end gap-3 m-4">

        <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate(-1)}
        >
            Cancel
        </button>

        <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isChanged || isSubmitting}
            
        >
            {loading ? (

              <>
                <span
                  className="spinner-border spinner-border-sm me-2 text-light"
                  role="status"
                />

                  <span className='text-light'>Saving Changes... </span>

                </>

                ) : (

                  "Save Changes"

              )}
        </button>

    </div>

</form>
    </>
  );
};

export default EditProfile;