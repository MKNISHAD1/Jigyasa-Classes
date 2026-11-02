import React, { useCallback, useEffect, useState } from "react";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { CONTACT_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleRight,
    faEnvelope,
    faEnvelopeOpen,
    faClock,
    faCircleCheck,
    faMagnifyingGlass,
    faRotate,
    faEye,
    faAngleLeft,
    faEnvelopeCircleCheck,
    faEnvelopesBulk,
    faCalendarDays,
    faFolder,
    faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

import DashboardAdminStatCard from "../../Frontend/DashboardUi/Dashboard Common Ui/DashboardSuperAdminStatCard ";

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        read: 0,
        pending_closure: 0,
        closed: 0,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Keep the current Laravel pagination response.
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const fetchMessages = useCallback(async (page = 1, isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const res = await fetch(
                `${apiUrl}contact-messages`,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token()}`,
                    },
                }
            );

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(
                    result.message || "Failed to load contact messages."
                );
            }

            const paginatedMessages = result.messages;

            setMessages(
                Array.isArray(result.messages) ? result.messages : []
            );

            // Global statistics returned by the backend.
            if (result.stats) {
                setStats({
                    total: Number(result.stats.total ?? 0),
                    new: Number(result.stats.new ?? 0),
                    read: Number(result.stats.read ?? 0),
                    pending_closure: Number(
                        result.stats.pending_closure ?? 0
                    ),
                    closed: Number(result.stats.closed ?? 0),
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages(1);
    }, [fetchMessages]);

    // Categories available in the currently loaded page.
    const categories = [
        ...new Set(
            messages
                .map((message) => message.category)
                .filter(Boolean)
        ),
    ].sort((a, b) => a.localeCompare(b));

    // Search and filters apply to the currently loaded page.
    const filteredMessages = messages.filter((message) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            [
                message.name,
                message.email,
                message.subject,
                String(message.id),
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(searchText)
            );

        const matchesCategory =
            !categoryFilter || message.category === categoryFilter;

        const matchesStatus =
            !statusFilter || message.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    useEffect(() => {
        setMessagePage(1);
    }, [search, categoryFilter, statusFilter]);

    // Contact message pagination
    const MESSAGES_PER_PAGE = 10;

    const [messagePage, setMessagePage] = useState(1);

    const totalMessages = filteredMessages.length;

    const totalMessagePages = Math.max(
        1,
        Math.ceil(totalMessages / MESSAGES_PER_PAGE)
    );

    const messageStartIndex =
        (messagePage - 1) * MESSAGES_PER_PAGE;

    const paginatedMessages = filteredMessages.slice(
        messageStartIndex,
        messageStartIndex + MESSAGES_PER_PAGE
    );

    const messageFrom =
        totalMessages === 0 ? 0 : messageStartIndex + 1;

    const messageTo = Math.min(
        messageStartIndex + MESSAGES_PER_PAGE,
        totalMessages
    );



    const mainStats = [
        {
            title: "Total Messages",
            value: stats.total,
            icon: faEnvelopesBulk,
            variant: "green",
            details: [
                {
                    label: "New",
                    value: stats.new ?? 0,
                },
                {
                    label: "Read",
                    value: stats.read ?? 0,
                },
                {
                    label: "Closed",
                    value: stats.closed ?? 0,
                },
            ],
        },
        {
            title: "Closed Messages",
            value: stats.closed,
            icon: faEnvelopeCircleCheck,
            variant: "red",
            details: [
                {
                    label: "closed",
                    value: stats.closed ?? 0,
                },
                {
                    label: "Pending Closure",
                    value: stats.pending_closure ?? 0,
                }
            ],
        }
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case "new":
                return "bg-danger";

            case "read":
                return "bg-warning text-dark";

            case "pending_closure":
                return "bg-info text-dark";

            case "closed":
                return "bg-success";

            default:
                return "bg-secondary";
        }
    };

    const changePage = (page) => {
        if (
            page < 1 ||
            page > pagination.last_page ||
            page === pagination.current_page
        ) {
            return;
        }

        fetchMessages(page);
    };

    //  Loading
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

                    <h5 className="mt-3 mb-1">
                        Loading Contact Messages
                    </h5>

                    <small className="text-muted">
                        Please wait while we fetch your messages.
                    </small>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Existing breadcrumbs preserved */}
            <div className="d-flex justify-content-between align-items-center">
                <section className="breadcrumb-section px-4 pt-3">
                    <h3>
                        Contact <span>Messages</span>
                    </h3>

                    <Link
                        className="bread-link"
                        to={DASHBOARD_ROUTES.DASHBOARD}
                    >
                        Dashboard
                    </Link>

                    <span>
                        <FontAwesomeIcon
                            icon={faAngleRight}
                            className="icon"
                        />
                    </span>

                    <Link
                        className="bread-link"
                        to={CONTACT_ROUTES.LIST}
                    >
                        <span>Message List</span>
                    </Link>
                </section>
            </div>

            <div className="dashboard-card my-2">

                {/* Header */}
                <div className="header-custom d-flex  justify-content-center my-1">

                    <div className="header d-flex align-items-center ">

                        <FontAwesomeIcon
                            icon={faEnvelope}
                            className="icon p-3"
                            style={{
                                background:'#ebf1f5',
                                color:'#1363b8',
                                borderRadius:'50%'
                            }}
                        />

                    </div>
                    <div className=' mb-2 px-3'>
                        
                        <span className='text-primary fw-bold '>Manage All Messages</span><br />

                        <small className="text-muted mb-0">
                        Manage all query messsagees at one place 
                        </small>

                    </div>
                </div>

                <hr />
      
                {/* Statistics: global counts from Laravel */}
                <section className="row g-3 mb-4 mt-2">
                    {mainStats.map((stat) => (
                        <div className="col-12 col-md-6" key={stat.title}>
                            <DashboardAdminStatCard
                                {...stat}
                                value={stat.value}
                                details={stat.details}
                            />
                        </div>
                    ))}
                </section>

                {/* Search, filters and refresh */}
                <div className="row g-3 mb-4">
                    {/* Search: always full width */}
                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </span>

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search name, email, subject or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category: always full width */}
                    <div className="col-12 col-md-5">
                        <select
                            className="form-select w-100"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status and refresh: side by side on mobile, flexible on desktop */}
                    <div className="col-12 col-md-5">
                        <select
                            className="form-select w-100"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="pending_closure">Pending Closure</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="col-12 col-md-2">
                        <button
                            type="button"
                            className="btn blue-btn w-100"
                            onClick={() => {
                                setMessagePage(1);
                                fetchMessages(1, true);
                            }}
                            disabled={refreshing}
                            title="Refresh messages and statistics"
                            aria-label="Refresh messages"
                        >
                            <FontAwesomeIcon
                                icon={faRotate}
                                spin={refreshing}
                                className="me-1"
                            />
                            Reload
                        </button>
                    </div>
                </div>

                {/* Contact message list */}
                <div className="contact-message-list">
                    {filteredMessages.length > 0 ? (
                        paginatedMessages.map((msg, index) => {
                            const avatarUrl =
                                msg.user?.profile_pic ||
                                msg.user?.avatar_url ||
                                null;

                            const initials = (msg.name || "U")
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase();

                            return (
                                <div className="contact-message-row" key={msg.id}>
                                    {/* Row number */}
                                    <div className="contact-message-number">
                                        {messageStartIndex + index + 1}.
                                    </div>

                                    {/* Avatar */}
                                    <div className="contact-message-avatar">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={`${msg.name || "User"} profile`}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </div>

                                    {/* Sender details */}
                                    <div className="contact-message-sender">
                                        <div className="contact-message-primary">
                                            {msg.name || "Unknown sender"}
                                        </div>
                                        <div className="contact-message-secondary">
                                            {msg.email || "No email provided"}
                                        </div>
                                    </div>

                                    {/* Subject and category */}
                                    <div className="contact-message-subject">
                                        <div className="contact-message-primary">
                                            {msg.subject || "No subject"}
                                        </div>

                                        <div className="contact-message-secondary">
                                            <FontAwesomeIcon
                                                icon={faFolder}
                                                className="me-1"
                                            />
                                            {msg.category || "Uncategorized"}
                                        </div>
                                    </div>

                                    {/* Received date and time */}
                                    <div className="contact-message-date">

                                        <div>
                                            <div>
                                                {msg.created_at
                                                    ? new Date(
                                                        msg.created_at
                                                    ).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </div>

                                            <div className="contact-message-secondary">
                                                {msg.created_at
                                                    ? new Date(
                                                        msg.created_at
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : ""}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="contact-message-status">
                                        <span
                                            className={`contact-status-pill status-${(
                                                msg.status || "unknown"
                                            ).toLowerCase()}`}
                                        >
                                            <span className="contact-status-dot" />
                                            {msg.status
                                                ?.replaceAll("_closure", " ")
                                                .replace(/\b\w/g, (char) =>
                                                    char.toUpperCase()
                                                ) || "Unknown"}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="contact-message-action">
                                        <Link
                                            to={`/admin/contact-message/${msg.id}`}
                                            className="btn btn-sm blue-btn "
                                        >
                                            <FontAwesomeIcon
                                                icon={faEye}
                                                className="me-2"
                                            />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="contact-message-empty">
                            <FontAwesomeIcon
                                icon={faEnvelope}
                                className="contact-message-empty-icon"
                            />

                            <h5>
                                {messages.length === 0
                                    ? "No contact messages yet"
                                    : "No matching messages"}
                            </h5>

                            <p>
                                {messages.length === 0
                                    ? "New website enquiries will appear here."
                                    : "Try changing your search or filters."}
                            </p>
                        </div>
                    )}
                </div>

                {/* pagination control*/}
                <div className="module-pagination">
                    <span className="module-pagination-info">
                        Showing <strong>{messageFrom} - {messageTo}</strong> of{" "}
                        <strong>{totalMessages}</strong> messages
                    </span>

                    <div className="module-pagination-buttons">
                        <button
                            type="button"
                            className="pagination-arrow"
                            disabled={messagePage === 1}
                            onClick={() =>
                                setMessagePage((page) => Math.max(1, page - 1))
                            }
                            aria-label="Previous page"
                        >
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </button>

                        <button
                            type="button"
                            className="pagination-arrow"
                            disabled={messagePage === totalMessagePages}
                            onClick={() =>
                                setMessagePage((page) =>
                                    Math.min(totalMessagePages, page + 1)
                                )
                            }
                            aria-label="Next page"
                        >
                            <FontAwesomeIcon icon={faAngleRight} />
                        </button>
                    </div>
                </div>
            </div>

            <hr className="my-4 d-lg-none d-block" />
        </>
    );
};

export default ContactMessages;