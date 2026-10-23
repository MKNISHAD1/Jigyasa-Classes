import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import {
  DASHBOARD_ROUTES,
  USER_ROUTES,
} from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faArrowLeft,
  faAt,
  faCircleExclamation,
  faEnvelope,
  faShieldHalved,
  faCalendar,
  faCheckCircle,
  faUser,
  faClock,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const SuspendUser = () => {
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("2");
  const [confirming, setConfirming] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch the user
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoadingUser(true);

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

        if (!cancelled) {
          const currentUser = result.user;

          const currentRole =
            result.roles?.[0] ||
            currentUser.role?.[0] ||
            currentUser.role ||
            "";

          setUser({ ...currentUser, role: currentRole });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || "Unable to fetch user information.");
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [id]);

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

  // Calculate the estimated suspension end
  const getEstimatedEnd = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(days));
    return endDate;
  };

  const estimatedEnd = getEstimatedEnd();

  // Continue to the confirmation step
  const handleContinue = () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for suspension.");
      return;
    }

    if (reason.trim().length > 255) {
      toast.error("The reason cannot exceed 255 characters.");
      return;
    }

    if (!Number.isInteger(Number(days)) || Number(days) < 1) {
      toast.error("Please select a valid suspension duration.");
      return;
    }

    setConfirming(true);
  };

  // Submit the suspension once, after confirmation
  const onSubmit = async (event) => {
    event.preventDefault();

    if (!user || !confirming || submitting || loadingUser) return;

    if (isSuspended) {
      toast.error("This account is already suspended.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason for suspension.");
      setConfirming(false);
      return;
    }

    setSubmitting(true);

    // Calculate the expiry at submission time
    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + Number(days));

    try {
      const res = await fetch(`${apiUrl}user-suspended/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          until: untilDate.toISOString(),
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.status !== true) {
        throw new Error(result.message || "Failed to suspend user.");
      }

      toast.success(
        result.message || "User suspended successfully. Notification email sent."
      );

      navigate(USER_ROUTES.LIST);
    } catch (error) {
      toast.error(error.message || "Unable to suspend user.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
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
    <form onSubmit={onSubmit}>
      {/* Page heading and breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <section className="breadcrumb-section px-4 pt-3">
          <h3>Suspend <span>User</span></h3>
  
          <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
          <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

          <Link className='bread-link' to={USER_ROUTES.LIST}>Manage Users</Link>
          <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>
  
          <Link className='bread-link' to=""><span>Suspend User</span></Link>
        </section>

        <Link to={USER_ROUTES.LIST} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon" />
          Return
        </Link>
      </div>

      {/* User summary */}
      <div className="dashboard-card Summary_Card mt-3">
        <div className="row">
          <div className="col-md-5 text-center d-flex align-items-center justify-content-center">
            <div className="profile-image-box">
              <img
                src={user.profile_pic}
                alt={user.name || "User profile"}
              />
            </div>
          </div>

          <div className="col-md-7 Card_Data">
            <h4 className="mb-2 text-capitalize">{user.name}</h4>

            <p className="text-muted mb-3">
              User ID: <b>#{user.id}</b>
            </p>

            <div className="d-flex flex-wrap gap-2 mb-3">
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
                <FontAwesomeIcon icon={faEnvelope} className="Icon" />
                <div>
                  <small className="text-muted d-block">Email</small>
                  <strong>{user.email || "—"}</strong>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faAt} className="Icon" />
                    <div>
                      <small className="text-muted d-block">Username</small>
                      <strong>{user.username || "—"}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faUser} className="Icon" />
                    <div>
                      <small className="text-muted d-block">Mobile</small>
                      <strong>{user.mobile_no || "—"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspension details */}
      <div className="dashboard-card mt-4">
        <div className="card-header-custom mb-1">
          <div className="header">
            <FontAwesomeIcon icon={faShieldHalved} className="icon" />
            <span>Suspension Details</span>
          </div>
        </div>
          <small  className="text-muted">
            Provide the suspension reason and duration. The user will be
            unable to sign in until the suspension period ends.
          </small>

        {isSuspended ? (
          <div className="alert alert-warning my-4">
            <FontAwesomeIcon icon={faCircleExclamation} className="me-2" />
            This account is already suspended. You cannot suspend it again
            from this page.
          </div>
        ) : (
          <>          
            <div className="row g-3 mt-1">
              {/* Reason */}
              <div className="col-lg-6">
                <div className="mb-0">
                  <label htmlFor="suspension-reason" className="form-label">
                    Reason for suspension <span className="text-danger">*</span>
                  </label>

                  <textarea
                    id="suspension-reason"
                    className="form-control"
                    rows={4}
                    maxLength={255}
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      setConfirming(false);
                    }}
                    placeholder="Explain why this account is being suspended..."
                    disabled={submitting}
                    required
                  />

                  <div className="text-end small text-muted">
                    {reason.length}/255
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label htmlFor="suspension-duration" className="form-label">
                    Duration <span className="text-danger">*</span>
                  </label>

                  <select
                    id="suspension-duration"
                    className="form-select"
                    value={days}
                    onChange={(event) => {
                      setDays(event.target.value);
                      setConfirming(false);
                    }}
                    disabled={submitting}
                  >
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>

                <div className="profile-stat">
                  <FontAwesomeIcon icon={faClock} className="icon" />
                  <div>
                    <h6>Suspension period</h6>
                    <span>
                      The account will remain suspended for {days}{" "}
                      {Number(days) === 1 ? "day" : "days"}.
                    </span>
                  </div>
                </div>
              </div>

            </div>
            {/* Email notification is mandatory */}
            <div className="profile-stat mt-4">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="icon"
              />
              <div>
                <h6>User will be notified by email</h6>
                <span>
                  A suspension notification will be sent to{" "}
                  {user.email || "the user's registered email address"}.
                </span>
              </div>
            </div>
          </>

          
        )}
      </div>

      {/* Confirmation review */}
      {!isSuspended && (
        <div className="my-4">
          {!confirming ? (
            <div className="d-flex justify-content-end gap-3 flex-wrap m-4">
              <button
                type="button"
                className="btn gray-btn-opp"
                onClick={() => navigate(USER_ROUTES.LIST)}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn blue-btn"
                onClick={handleContinue}
                disabled={submitting}
              >
                Continue to Review
              </button>
            </div>
          ) : (
            <div className="dashboard-card alert alert-warning mb-0">
              <div className="d-flex align-items-start gap-3 mb-3">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="text-warning mt-1"
                  size="xl"
                />

                <div>
                  <h5 className="mb-1">Review Suspension</h5>
                  <p className="mb-0">
                    Please confirm the suspension details before proceeding.
                  </p>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <small className="text-muted d-block">Reason</small>
                  <strong className="text-break">
                    {reason.trim()}
                  </strong>
                </div>

                <div className="col-md-4">
                  <small className="text-muted d-block">Duration</small>
                  <strong>
                    {days} {Number(days) === 1 ? "day" : "days"}
                  </strong>
                </div>

                <div className="col-md-4">
                  <small className="text-muted d-block">
                    Estimated end
                  </small>
                  <strong>
                    {formatDateTime(estimatedEnd)}
                  </strong>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mb-3">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-success"
                />
                <span>
                  The user will be notified by email.
                </span>
              </div>

              <div className="d-flex gap-3 flex-wrap">
                <button
                  type="submit"
                  className="btn red-btn flex-fill"
                  disabled={submitting || !reason.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2 text-light" />
                      Suspending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faBan}
                        className="me-2"
                      />
                      Confirm Suspension
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn gray-btn flex-fill"
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <hr className="my-4 d-lg-none d-block" />
    </form>
  );
};

export default SuspendUser;