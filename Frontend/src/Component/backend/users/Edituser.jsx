import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiUrl, token } from "../../Common/http";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/Auth";
import { DASHBOARD_ROUTES, USER_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faAngleRight,faArrowLeft,faA,faAt,faBriefcase,faCalendar,faCamera,faCheck,faCircleExclamation,faEnvelope,faFile,faFloppyDisk,faIdCard,faMobile,faPhone,faShieldHalved,faUser,faUserTag,faWarning, faGlobe} from "@fortawesome/free-solid-svg-icons";

const Edituser = () => {
  const { hasAnyRole } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);


const canManageRoles = hasAnyRole(["moderator","admin", "super_admin"]);

const assignableRoles = hasAnyRole(["super_admin"])
  ? ["student", "teacher", "moderator", "admin"]
  : hasAnyRole(["admin"])
  ? ["student", "teacher", "moderator"]
  : hasAnyRole(["moderator"])
  ? ["student", "teacher"]
  : [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      username: "",
      mobile_no: "",
      role: "",
      professional_title: "",
      bio: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${apiUrl}view-user/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        });

        const result = await res.json();

        if (!res.ok || !result.user) {
          throw new Error(result.message || "Unable to load user.");
        }

        if (cancelled) return;

        const currentUser = result.user;
        const currentRole =
          result.roles?.[0] ||
          currentUser.role?.[0] ||
          currentUser.role ||
          "";

        setUser({ ...currentUser, role: currentRole });
        setAllRoles(result.all_roles || []);

        reset({
          name: currentUser.name || "",
          email: currentUser.email || "",
          username: currentUser.username || "",
          mobile_no: currentUser.mobile_no || "",
          role: currentRole,
          professional_title: currentUser.professional_title || "",
          bio: currentUser.bio || "",
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Fetch user error:", error);
          toast.error(error.message || "Unable to fetch user information.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  const values = watch();
  const profilePic = watch("profile_pic");

  const isChanged =
    user &&
    (
      values.name !== (user.name || "") ||
      values.username !== (user.username || "") ||
      values.mobile_no !== (user.mobile_no || "") ||
      values.role !== (user.role || "") ||
      values.professional_title !== (user.professional_title || "") ||
      values.bio !== (user.bio || "") ||
      Boolean(profilePic?.length)
    );


  const {
    onChange: onProfilePicChange,
    ...profilePicRegister
  } = register("profile_pic");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      setPreview(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be 2 MB or smaller.");
      event.target.value = "";
      setPreview(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const formatRole = (role) =>
    String(role || "Unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "First login";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

const isSuspended = Boolean(user?.is_suspended);
const accountStatus = isSuspended ? "Suspended" : "Active";

  const onSubmit = async (data) => {
    if (!user) return;

    const formData = new FormData();
    formData.append("_method", "PUT");

    formData.append("name", data.name || "");
    formData.append("username", data.username || "");
    formData.append("mobile_no", data.mobile_no || "");
    formData.append("professional_title", data.professional_title || "");
    formData.append("bio", data.bio || "");

    if (canManageRoles && data.role) {
      formData.append("role", data.role);
    }

    if (data.profile_pic?.[0]) {
      formData.append("profile_pic", data.profile_pic[0]);
    }

    try {
      const res = await fetch(`${apiUrl}update-user/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || result.status !== true) {
        toast.error(result.message || "Unable to update user.");
        return;
      }

      toast.success(result.message || "User updated successfully.");

      navigate(USER_ROUTES.LIST);
    } catch (error) {
      console.error("Update user error:", error);
      toast.error("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card mt-4">
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "350px" }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <h5 className="mt-3 mb-1">Loading user profile...</h5>
          <small className="text-muted">
            Please wait while we fetch the user information.
          </small>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-card mt-4 p-4">
        <h5>Unable to load user</h5>
        <p className="text-muted">
          The user could not be found or the request failed.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(USER_ROUTES.LIST)}
        >
          Return to Users
        </button>
      </div>
    );
  }

  const currentRole = user.role;
  const isVerified = Boolean(user.email_verified_at);

  return (

    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Page heading and breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center">
        <section className="breadcrumb-section px-4 pt-3">
          <h3>Edit <span>User Profile</span></h3>
  
          <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
          <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

          <Link className='bread-link' to={USER_ROUTES.LIST}>Manage Users</Link>
          <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>
  
          <Link className='bread-link' to=""><span>Edit User Profile</span></Link>
        </section>

        <Link to={USER_ROUTES.LIST} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon " />
          Return
        </Link>
      </div>

      {/* User summary */}
      <div className="dashboard-card Summary_Card mt-3 ">
        <div className="row ">
          <div className="col-md-5 text-center Card_Img">
            <div className="profile-image-box mb-0">
              <img
                src={preview || user.profile_pic}
                alt={user.name || "User profile"}
              />

              <input
                id="admin-user-profile-pic"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                {...profilePicRegister}
                onChange={(event) => {
                  onProfilePicChange(event);
                  handleFileChange(event);
                }}
              />

              <label
                htmlFor="admin-user-profile-pic"
                className="btn btn-primary mt-3"
              >
                <FontAwesomeIcon icon={faCamera} className="me-2" />
                Change Photo
              </label>

              <small className="d-block text-muted mt-2">
                JPG, PNG, WEBP. Max size 2 MB.
              </small>
            </div>
          </div>

          <div className="col-md-7 Card_Data ">
            <h4 className="mb-2 text-capitalize">{user.name}</h4>

            <p className="text-muted mb-3">
              User ID :<b> #{user.id}</b>
            </p>

            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge bg-primary-subtle text-primary">
                {formatRole(currentRole)}
              </span>

              <span
                className={`badge ${
                  isSuspended
                    ? "bg-danger-subtle text-danger"
                    : "bg-success-subtle text-success"
                }`}
              >
                {accountStatus}
              </span>

              <span
                className={`badge ${
                  isVerified
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
                }`}
              >
                {isVerified ? "Email Verified" : "Email Not Verified"}
              </span>
            </div>

            <div className="Login_Data">
              <div className="d-flex align-items-center my-3">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="Icon"
                />
                <div>
                  <small className="text-muted d-block">Member since</small>
                  <strong>{formatDate(user.created_at)}</strong>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="Icon"
                />
                <div>
                  <small className="text-muted d-block">Last login</small>
                  <strong>{formatDateTime(user.last_login_at)}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 1. Profile Information */}
      <div className="dashboard-card mt-4">
        <div className="card-header-custom">
          <div className="header">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>1. Profile Information</span>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faA} className="icon me-2" />
                Full Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="invalid-feedback">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faAt} className="icon me-2" />
                Username
              </label>
              <input
                {...register("username", {
                  required: "Username is required",
                })}
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="invalid-feedback">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faBriefcase} className="icon me-2" />
                Professional Title
              </label>
              <input
                {...register("professional_title")}
                className="form-control"
                disabled={isSubmitting}
                placeholder="Professional title"
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faMobile} className="icon me-2" />
                Mobile Number
              </label>
              <input
                {...register("mobile_no", {
                  required: "Mobile number is required",
                })}
                className={`form-control ${
                  errors.mobile_no ? "is-invalid" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.mobile_no && (
                <p className="invalid-feedback">
                  {errors.mobile_no.message}
                </p>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="mb-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faIdCard} className="icon me-2" />
                Biography
              </label>
              <textarea
                rows={3}
                maxLength={300}
                {...register("bio")}
                className="form-control"
                disabled={isSubmitting}
                placeholder="User biography"
              />
              <small className="text-muted">
                {(values.bio || "").length}/300
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="dashboard-card mt-4">
        <div className="card-header-custom">
          <div className="header">
            <FontAwesomeIcon icon={faPhone} className="icon" />
            <span>2. Contact Information</span>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faEnvelope} className="icon me-2" />
                Email Address
              </label>
              <input
                {...register("email")}
                className="form-control"
                disabled
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faGlobe} className="icon me-2" />
                Country
              </label>
              <input
                type="text"
                className="form-control"
                value="India"
                disabled
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account & Permissions */}
      <div className="dashboard-card mt-4">
        <div className="card-header-custom">
          <div className="header">
            <FontAwesomeIcon icon={faShieldHalved} className="icon" />
            <span>3. Account &amp; Permissions</span>
          </div>
        </div>

        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faUserTag} className="icon me-2" />
                Account Role
              </label>

                <select
                  {...register("role", {
                    required: "Role is required",
                  })}
                  className={`form-select ${errors.role ? "is-invalid" : ""}`}
                  disabled={!canManageRoles || isSubmitting}
                >
                  {/* <option value="">Select role</option> */}

                  {assignableRoles.map((roleName) => (
                    <option key={roleName} value={roleName}>
                      {formatRole(roleName)}
                    </option>
                  ))}
                </select>

                {errors.role && (
                  <p className="invalid-feedback">{errors.role.message}</p>
                )}
            </div>
          </div>

          <div className="col-lg-6 info-stat">
            <div className="profile-stat">
              <FontAwesomeIcon icon={faCircleExclamation} className="icon" />
              <div>
                <h6>Permissions</h6>
                <span>
                  Changing the role can affect this user's access to platform
                  features. Only authorized administrators can change roles.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Read-only Account Overview */}
      <div className="dashboard-card mt-4">
        <div className="card-header-custom">
          <div className="header">
            <FontAwesomeIcon icon={faFile} className="icon" />
            <span>4. Account Overview</span>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <label className="form-label">Account Status</label>
            <input
              className="form-control"
              value={accountStatus}
              disabled
              readOnly
            />
          </div>

          <div className="col-lg-6 mb-4">
            <label className="form-label">Email Verification</label>
            <input
              className="form-control"
              value={isVerified ? "Verified" : "Not Verified"}
              disabled
              readOnly
            />
          </div>

<div className="col-lg-6 mb-4">
            <label className="form-label">Member Since</label>
            <input
              className="form-control"
              value={formatDate(user.created_at)}
              disabled
              readOnly
            />
          </div>

          <div className="col-lg-6 mb-4">
            <label className="form-label">Last Login</label>
            <input
              className="form-control"
              value={formatDateTime(user.last_login_at)}
              disabled
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mb-4 mt-4 keep">
        <div className="profile-stat">
          <FontAwesomeIcon icon={faCircleExclamation} className="icon" />
          <div>
            <h6>Note</h6>
            <span>
              Some account details are managed by the system and cannot be
              edited here. Changes to user permissions may affect platform
              access.
            </span>
          </div>
        </div>
      </div>

      <hr className="m-4" />

      {/* Actions */}
      <div className="d-flex justify-content-end gap-3 m-4 flex-wrap">
        <button
          type="button"
          className="btn gray-btn-opp"
          onClick={() => navigate(USER_ROUTES.LIST)}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn green-btn"
          disabled={!isChanged || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-light" />
              Saving Changes...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <hr className="my-4 d-lg-none d-block" />
    </form>
  );
};

export default Edituser;