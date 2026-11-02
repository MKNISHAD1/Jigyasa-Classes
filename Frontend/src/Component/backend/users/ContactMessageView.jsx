import React, {useContext,useEffect,useRef,useState} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { AuthContext } from "../context/Auth";
import { CONTACT_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { faAngleRight, faArrowLeft, faArrowRight, faCircleCheck, faClock, faClockRotateLeft, faCommentDots, faComments, faEnvelope, faEnvelopeCircleCheck, faEnvelopeOpen, faEnvelopeOpenText, faFile, faFlag, faFolder, faMinus, faMobile, faPlus, faScroll, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ContactMessageView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [message, setMessage] = useState(null);
    const [viewSummary, setViewSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [finalResolution, setFinalResolution] = useState("");
    const [showViewHistory, setShowViewHistory] = useState(false);
    const [showCommentHistory, setShowCommentHistory] = useState(false);

    // Avoid a duplicate initial fetch during React StrictMode's
    // development-only effect replay.
    const fetchedId = useRef(null);

    const roles = (user?.roles || []).map((role) =>
        typeof role === "string" ? role : role.name
    );

    const isSuperAdmin = roles.includes("super_admin");

    const canWorkOnMessage = roles.some((role) =>
        ["admin", "moderator", "super_admin"].includes(role)
    );

    const canRequestClosure = roles.some((role) =>
        ["admin", "moderator"].includes(role)
    );

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token()}`,
    };

    const fetchMessage = async () => {
        try {
            const res = await fetch(
                `${apiUrl}contact-message/${id}`,
                { headers }
            );

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(
                    result.message || "Failed to load message"
                );
            }

            setMessage(result.message);
            setViewSummary(result.view_summary || null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to load message");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fetchedId.current === id) return;

        fetchedId.current = id;
        setLoading(true);
        setMessage(null);
        setViewSummary(null);

        fetchMessage();
    }, [id]);

    const addComment = async (requestClosure = false) => {
        const trimmedComment = comment.trim();

        if (!trimmedComment) {
            toast.error(
                requestClosure
                    ? "Add a comment before requesting closure."
                    : "Please enter a comment."
            );
            return;
        }

        setSubmitting(true);

        try {
            const endpoint = requestClosure
                ? `contact-messages/${id}/request-closure`
                : `contact-messages/${id}/comments`;

            const res = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    ...headers,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    comment: trimmedComment,
                }),
            });

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(
                    result.message || "Action failed"
                );
            }

            toast.success(result.message);
            setComment("");

            // Reload comments and current status.
            await fetchMessage();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const closeMessage = async () => {
        const resolution = finalResolution.trim();

        if (!resolution) {
            toast.error("Please enter the final resolution.");
            return;
        }

        if (!window.confirm("Close this message and send the final resolution?")) {
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(
                `${apiUrl}contact-message/${id}/close`,
                {
                    method: "PUT",
                    headers: {
                        ...headers,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        final_resolution: resolution,
                    }),
                }
            );

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(
                    result.message || "Failed to close message"
                );
            }

            toast.success("Message closed successfully.");
            setFinalResolution("");
            await fetchMessage();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Unable to close message");
        } finally {
            setSubmitting(false);
        }
    };


    useEffect(() => {
        if (message) {
            setShowCommentHistory(message.status !== "closed");
        }
    }, [message?.id, message?.status]);

// Loading
    if (loading) {
    return (
        <div className="dashboard-card mt-4">
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "350px" }}
        >
            <div
            className="spinner-border text-primary "
            style={{ width: "3rem", height: "3rem" }}
            />

            <h5 className="mt-3 mb-1">Loading Message Details</h5>

            <small className="text-muted">
            Please wait while we fetching infomation.
            </small>
        </div>
        </div>
    );
    }

    if (!message) {
        return (
            <div className="p-4">
                <p>Message not found or could not be loaded.</p>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin/contact-messages")}
                >
                    Back to Messages
                </button>
            </div>
        );
    }

    const statusClass = {
        new: "bg-danger",
        read: "bg-warning text-dark",
        pending_closure: "bg-info text-dark",
        closed: "bg-success",
    };

    const views = viewSummary?.viewers || [];

    return (
        <>

            {/* Breadcrumbs */}
            <div className="d-flex justify-content-between align-items-center ">
                <section className="breadcrumb-section px-4 pt-3">
                <h3>View <span>Message</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Dashboard</Link>
                <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

                <Link className='bread-link' to={CONTACT_ROUTES.LIST}>Message List</Link>
                <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

                <Link className='bread-link' to=""><span>View Message</span></Link>
                </section>

                <Link to={CONTACT_ROUTES.LIST} className="edit-btn">
                    <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Back
                </Link>
            </div>

            <div className="dashboard-card my-2">
                {/* Header */}
                <div className="header-custom d-flex  justify-content-center my-1">

                    <div className="header d-flex align-items-center ">

                        <FontAwesomeIcon
                            icon={faEnvelopeOpenText}
                            className="icon p-3"
                            style={{
                                background:'#ebf1f5',
                                color:'#1363b8',
                                borderRadius:'50%'
                            }}
                        />

                    </div>
                    <div className=' mb-2 px-3'>
                        
                        <span className='text-primary fw-bold '>View Message</span><br />

                        <small className="text-muted mb-0">
                            Know about user query and provide  effective resolution.
                        </small>

                    </div>
                </div>

                <hr />

                {/* Details */}

                <div className="overview-grid">

                    {/* Name */}
                    <div className="overview-item">
                        <div className="label">
                        <FontAwesomeIcon icon={faUser} className="icon text-primary" />
                        <span className="fw-semibold">User Name</span>
                        </div>
                        <span className="separator">:</span>
                        <span className="value text-capitalize">
                        {message.name}
                        </span>
                    </div>

                    {/* Email */}
                    <div className="overview-item">
                        <div className="label">
                        <FontAwesomeIcon icon={faEnvelope} className="icon text-purple" />
                        <span className="fw-semibold">Email</span>
                        </div>
                        <span className="separator">:</span>
                        <span className="value">{message.email}</span>
                    </div>
                    
                    {/* Category */}
                    <div className="overview-item">
                        <div className="label">
                        <FontAwesomeIcon icon={faFolder} className="icon text-primary" />
                        <span className="fw-semibold">Category</span>
                        </div>
                        <span className="separator">:</span>
                        <span className="value">
                        {message.category}
                        </span>
                    </div>
                    
                    {/* Phone */}
                    <div className="overview-item">
                        <div className="label">
                        <FontAwesomeIcon icon={faMobile} className="icon text-info" />
                        <span className="fw-semibold">Phone Number </span>
                        </div>
                        <span className="separator">:</span>
                        <span className="value">
                        {message.phone}
                        </span>
                    </div>

                    {/* Status */}
                    <div className="overview-item">
                        <div className="label">
                        <FontAwesomeIcon
                            icon={faFlag}
                            className="icon text-primary"
                        />
                        <span className="fw-semibold">Status</span>
                        </div>
                        <span className="separator">:</span>
                        <span className={`text-capitalize badge ${statusClass[message.status] || "bg-secondary"}`}
                              style={{width:'max-content'}}
                            >
                            {message.status?.replaceAll("_", " ")}
                        </span>                
                    </div>

                    {/* Received at */}
                    <div className="overview-item">
                        <div className="label">
                        <FontAwesomeIcon icon={faClock} className="icon text-success" />
                        <span className="fw-semibold">Received At</span>
                        </div>
                        <span className="separator">:</span>
                        <span className="value">{new Date(message.created_at).toLocaleString()}</span>
                    </div>

                </div>

                {/* Subject  */}
                <div className="overview-item">
                    <div className="label">
                    <FontAwesomeIcon icon={faEnvelopeOpenText} className="icon text-success" />
                    <span className="fw-semibold">Subject</span>
                    </div>
                    <span className="separator">:</span>
                    <span className="value text-capitalize">{message.subject}</span>
                </div>

                {/* Description */}
                <div className="overview-item border-0">
                    <div className="label">
                        <FontAwesomeIcon
                            icon={faScroll}
                            className="icon text-purple"
                        />
                        <span className="fw-semibold">Description</span>
                    </div>
                    <span className="separator">:</span>
                    <span className="value">
                        {message.message}
                    </span>
                </div>

                {/* Closer  requested alert */}
                {message.status === "pending_closure" && (
                    <div className="alert alert-info">
                        Closure requested. Awaiting super admin review.
                    </div>
                )}

                {/* Final resolution message after close */}
                {message.status === "closed" && (
                    <>
                        <hr />

                        <div className="alert alert-success my-4">
                            <h5 className="mb-2">Final Resolution</h5>

                            <p className="mb-3" style={{ whiteSpace: "pre-wrap" }}>
                                {message.final_resolution}
                            </p>

                            <hr />

                            <div>
                                <strong>Closed On :</strong>
                                {message.closedBy?.name && ` by ${message.closedBy.name}`}
                                {message.closed_at &&
                                    ` ${new Date(message.closed_at).toLocaleString()}`}
                            </div>
                        </div>
                    </>
                )}

                <hr />

                {/* View Count History */}
                <div className="History_Card mb-3">
                    <button
                        type="button"
                        className="btn btn-link text-decoration-none p-0 w-100 d-flex justify-content-between align-items-center"
                        onClick={() => setShowViewHistory((prev) => !prev)}
                        aria-expanded={showViewHistory}
                    >
                        <span className="fw-semibold align-items-center">
                           <FontAwesomeIcon icon={faClockRotateLeft} className="me-2" /> View Activity History <span className="mx-2">( {viewSummary?.unique_viewers ?? 0} )</span> 
                        </span>
                        <span>{showViewHistory ? 
                                <> <FontAwesomeIcon  icon={faMinus} /></> : <><FontAwesomeIcon icon={faPlus} /></>}</span>
                    </button>


                    {showViewHistory && (
                        <div className="table-responsive mt-3">
                            <p className="mb-2  text-muted">
                                Total views: {viewSummary?.total_views ?? 0}
                                {" · "}
                                Unique viewers: {viewSummary?.unique_viewers ?? 0}
                            </p>

                            <table className="table table-bordered mb-0">
                                <thead>
                                    <tr>
                                        <th>Staff Member</th>
                                        <th>Views</th>
                                        <th>First Viewed</th>
                                        <th>Last Viewed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {views.length > 0 ? (
                                        views.map((viewer, index) => (
                                            <tr key={`${viewer.user_id}-${index}`}>
                                                <td>{viewer.user_name}</td>
                                                <td>{viewer.view_count}</td>
                                                <td>
                                                    {viewer.first_viewed_at
                                                        ? new Date(viewer.first_viewed_at).toLocaleString()
                                                        : "—"}
                                                </td>
                                                <td>
                                                    {viewer.last_viewed_at
                                                        ? new Date(viewer.last_viewed_at).toLocaleString()
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                No view activity available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* <hr /> */}

                {/* Comment History */}
                <div className="History_Card mb-3">
                    <button
                        type="button"
                        className="btn btn-link text-decoration-none p-0 w-100 d-flex justify-content-between align-items-center"
                        onClick={() => setShowCommentHistory((prev) => !prev)}
                        aria-expanded={showCommentHistory}
                    >
                        <span className="fw-semibold align-items-center">
                          <FontAwesomeIcon icon={faComments} className="me-2"/>  Comment History <span className="mx-2">( {message.comments?.length || 0} )</span> 
                        </span>
                        <span>{showCommentHistory ? <> <FontAwesomeIcon  icon={faMinus} /></> : <><FontAwesomeIcon icon={faPlus} /></>}</span>
                    </button>

                    {showCommentHistory && (
                        <div className="mt-3">
                            {message.comments?.length > 0 ? (
                                message.comments.map((item) => (
                                    <div
                                        key={item.id}
                                        className="History_Card p-3 mb-3"
                                    >
                                        <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                                            <strong>
                                                {item.user?.name || "Deleted user"}
                                            </strong>
                                            <small className="text-muted">
                                                {new Date(item.created_at).toLocaleString()}
                                            </small>
                                        </div>

                                        <div style={{ whiteSpace: "pre-wrap" }}>
                                            {item.comment}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="m-1 text-center">No comments yet.</p>
                            )}
                        </div>
                    )}
                </div>


                {/* Add Internal Comment History */}
                {canWorkOnMessage && message.status !== "closed" && (
                    <div className="History_Card mt-3">
                        <label htmlFor="staff-comment" className="form-label fw-semibold">
                            {isSuperAdmin
                                ? <>
                                    <FontAwesomeIcon icon={faCommentDots} /> Internal comment
                                  </>
                                : 
                                
                                <>
                                <FontAwesomeIcon icon={faCommentDots} /> Add an internal comment
                                </>}
                        </label>

                        <textarea
                            id="staff-comment"
                            className="form-control mb-3"
                            rows="4"
                            maxLength={5000}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write an investigation note or update..."
                        />

                        <button
                            type="button"
                            className="btn blue-btn me-2 mb-2"
                            disabled={submitting || !comment.trim()}
                            onClick={() => addComment(false)}
                        >
                            <FontAwesomeIcon icon={faPlus}  className="me-1"/> Add Comment
                        </button>

                        {canRequestClosure &&
                            message.status !== "pending_closure" && (
                                <button
                                    type="button"
                                    className="btn green-btn mb-2"
                                    disabled={submitting || !comment.trim()}
                                    onClick={() => addComment(true)}
                                >
                                  <FontAwesomeIcon icon={faEnvelopeCircleCheck}  className="me-1" />  Request Closure
                                </button>
                            )}
                    </div>
                )}

                {/* Super admin close remark */}
                {isSuperAdmin && message.status !== "closed" && (
                    <div className="border rounded p-3 mt-3">
                        <label htmlFor="final-resolution" className="form-label fw-semibold">
                          <FontAwesomeIcon icon={faCircleCheck}  />  Final Resolution Remark
                        </label>

                        <textarea
                            id="final-resolution"
                            className="form-control mb-3"
                            rows="4"
                            maxLength={5000}
                            value={finalResolution}
                            onChange={(e) => setFinalResolution(e.target.value)}
                            placeholder="Write the resolution that will be sent to the customer..."
                        />

                        <button
                            type="button"
                            className="btn btn-success"
                            disabled={submitting || !finalResolution.trim()}
                            onClick={closeMessage}
                        >
                          <FontAwesomeIcon icon={faEnvelopeCircleCheck}  className="me-1"/>  Close Message
                        </button>
                    </div>
                )}

                <div className="mt-4 text-end">
                    <button
                        type="button"
                        className="btn gray-btn"
                        onClick={() => navigate("/admin/contact-messages")}
                    >
                       <FontAwesomeIcon icon={faArrowLeft} className="me-2"/>Back
                    </button>
                </div>
            </div>
        </>

    );
};

export default ContactMessageView;