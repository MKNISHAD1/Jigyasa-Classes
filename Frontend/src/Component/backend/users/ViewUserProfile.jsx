
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faCalendar, faCheck, faClock, faEnvelopeOpen, faPen, faPhone, faShield, faShieldHalved, faUserAlt, faWarning } from "@fortawesome/free-solid-svg-icons";
import { faClockFour, faEnvelope, faUser } from "@fortawesome/free-regular-svg-icons";
import studentBanner from "../../../assets/images/banner1.jpeg";
import teacherBanner from "../../../assets/images/banner2.jpeg";
import moderatorBanner from "../../../assets/images/banner3.jpeg";
import adminBanner from "../../../assets/images/banner4.jpeg";
import superAdminBanner from "../../../assets/images/banner5.jpeg";
import defaultBanner from "../../../assets/images/herobg5.png";
import { DASHBOARD_ROUTES, USER_ROUTES } from "../../../constants/nevigation/routes";
import { apiUrl, token } from "../../Common/http";



const ViewUserProfile = () => {
  const [user, setUser] = useState("");
  const [isDisable, setIsDisable] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  
  

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
        try {
            
            setLoading(true);

            // Fetch User data
            const res = await fetch(apiUrl + "view-user/" + params.id, {
                method: "GET",
                headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token()}`,
                },
            });
            
            const result = await res.json();
            
            // console.log(result.roles?.[0]);

            // put role directly inside user state
            setUser(result.user);

            return {
                name: result.user.name,
                email: result.user.email,
                username: result.user.username,
                mobile_no: result.user.mobile_no,
                professional_title: result.user.professional_title,
                bio: result.user.bio,
            };
        
            }catch (error) {
                console.error("Fetch error:", error);
                toast.error("Something went wrong while fetching profile information");
            } finally {
                setLoading(false);
        }
    },
  });


// console.log(user?.roles?.[0]?.name);

// role helper 
const role = user?.roles?.[0]?.name

// Formate role
const formatRole = role =>
role
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());


  // Banner Based on Role
  const bannerImage = {

    student:studentBanner,
    teacher:teacherBanner,
    moderator:moderatorBanner,
    admin:adminBanner,
    super_admin:superAdminBanner,

  }[role] || defaultBanner;

    // Badge based on Role
    const roleStyles = {
        student: "badge-student",
        teacher: "badge-teacher",
        moderator: "badge-moderator",
        admin: "badge-admin",
        super_admin: "badge-super-admin",
    };

  // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

        return new Date(date).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"long",
            year:"numeric",
        });

    };

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
        defaultProfessionalTitle[role] ||
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
        defaultBiography[role] ||
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
          Please wait while we fetching profile information.
        </small>
      </div>
    </div>
  );
}


  return (
    <>

    {/* Banner annd Avtar */}
    <div className="profile-hero">

        <div
          className="profile-banner"
          style={{
              backgroundImage:`url(${bannerImage})`,
              backgroundSize:'cover',
              backgroundRepeat:'no-repeat',
              
          }}
      >
      </div>

        <div className="profile-content">

            <div className="profile-avatar">

                <img
                    src={user?.profile_pic}
                    alt={user?.name}
                />

            </div>

            <div className="profile-details">

              <h1 className="profile-name">

                  {user?.name}

              </h1>

              <div className="profile-role">


                    <span className={`role-badge ${roleStyles[role]}`}>
                            {formatRole(role)}
                    </span>
                    <span className="mx-2">•</span>

                    <span>
                        {professionalTitle}
                    </span>                
              </div>            

                  <p className="profile-bio">
                      "{userBio}"
                  </p>
            </div>


        </div>

    </div>

    {/* Profile Stats */}
    <div className="profile-stats">

        <div className="profile-stat">

            <FontAwesomeIcon icon={faEnvelope} className="icon"/>

            <div>

                <h6>{user?.email}</h6>

                <span>Email</span>

            </div>

        </div>

        <div className="profile-stat">

            <FontAwesomeIcon icon={faPhone} className="icon"/>

            <div>

                <h6>{user?.mobile_no}</h6>

                <span>Mobile</span>

            </div>

        </div>

        <div className="profile-stat">

            <FontAwesomeIcon icon={faCalendar} className="icon"/>

            <div>

                <h6>{formatDate(user?.created_at)}</h6>

                <span>Member Since</span>

            </div>

        </div>

        <div className="profile-stat">

            <FontAwesomeIcon icon={faClockFour} className="icon" />

            <div>

                <h6>{user?.last_login_at
                            ? formatDate(user.last_login_at) : "First Login"}
                </h6>

                <span>Last Login</span>

            </div>

        </div>

    </div>
 
    {/* Breadcrumbs */}
    <div className="d-flex justify-content-between align-items-center">
      <section className="breadcrumb-section">
        <h3> View User <span>Profile</span></h3>

        <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
        <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

        <Link className='bread-link' to={USER_ROUTES.LIST}><span>Manage Users</span></Link>
        <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

        <Link className='bread-link' to=""><span>User Profile</span></Link>
      </section>

      <Link to={USER_ROUTES.EDIT} className="edit-btn">
      <FontAwesomeIcon icon={faPen} className="icon"/>  Edit User
      </Link>
    </div>


    {/* About Me */}
    <div className="dashboard-card mt-4">

        <div className="card-header-custom">

            <div className="header">
                <FontAwesomeIcon icon={faUserAlt} className="icon"/>
                <span>About User</span>
            </div>

        </div>

        <div className="profile-info-row">
            <span>Full Name</span>
            <p>{user?.name}</p>
        </div>

        <div className="profile-info-row">
            <span>Professional Title</span>
            <p>{professionalTitle}</p>
        </div>

        <div className="profile-info-row">
            <span>Biography</span>
            <p>{userBio}</p>
        </div>

        <div className="profile-info-row">
            <span>Language</span>
            <p>Hindi, English</p>
        </div>
    </div>

    {/* Contact and Account Information */}
    <div className="row contact-account mt-4 mb-4">

        <div className="col-lg-6">

            <div className="dashboard-card">

              <div className="card-header-custom">

                <div className="header">
                    <FontAwesomeIcon icon={faPhone} className="icon"/>
                    <span>Contact Information</span>
                </div>

              </div>

                <div className="profile-info-row">
                    <span>Email</span>
                    <p>{user?.email}</p>
                </div>

                <div className="profile-info-row">
                    <span>Mobile</span>
                    <p>{user?.mobile_no}</p>
                </div>

                <div className="profile-info-row">
                    <span>Username</span>
                    <p>{user?.username}</p>
                </div>

                <div className="profile-info-row">
                    <span>Country</span>
                    <p>India</p>
                </div>

            </div>

        </div>

        <div className="col-lg-6">

            <div className="dashboard-card">
              
              <div className="card-header-custom">

                <div className="header">
                    <FontAwesomeIcon icon={faShieldHalved} className="icon"/>
                    <span>Account Information</span>
                </div>

              </div>

                <div className="profile-info-row">
                    <span>Role</span>
                    <p style={{textTransform : 'capitalize'}}>{formatRole(role)}</p>
                </div>

                <div className="profile-info-row">
                    <span>Email Status</span>

                    <span className={`badge ${
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

                <div className="profile-info-row">
                    <span>Member Since</span>
                    <p>{formatDate(user?.created_at)}</p>
                </div>

                <div className="profile-info-row">
                    <span>Last Login</span>
                    <p>{user?.last_login_at
                            ? formatDate(user.last_login_at) : "First Login"}</p>
                </div>

            </div>

        </div>

    </div>

    {/* <hr className="m-4" />

    <div className="mb-4 keep"> 

          <div className="profile-stat">

            <FontAwesomeIcon icon={faShield} className="icon"/>

            <div>
              <h6>Keep Your Profile Updated</h6>
              <span>Complete and keep your profile updated to enjoy all features of Jigyasa Classes.
</span>
            </div>
          </div>
    
    </div> */}


    </>
  );
};

export default ViewUserProfile;