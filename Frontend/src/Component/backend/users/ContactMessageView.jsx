import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";

const ContactMessageView = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMessage = async () => {

        try {

            const res = await fetch(
                apiUrl + `contact-message/${id}`,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token()}`
                    }
                }
            );

            const result = await res.json();

            if (result.status) {
                setMessage(result.message);
            } else {
                toast.error("Failed to load message");
            }

        } catch (error) {

            console.error(error);
            toast.error("Something went wrong");

        } finally {

            setLoading(false);

        }

    };

    const closeMessage = async () => {

        if (!window.confirm("Close this message?")) return;

        try {

            const res = await fetch(
                apiUrl + `contact-message/${id}/close`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token()}`
                    }
                }
            );

            const result = await res.json();

            if (result.status) {

                toast.success("Message closed");

                setMessage(prev => ({
                    ...prev,
                    status: "closed"
                }));

            } else {

                toast.error("Failed to close message");

            }

        } catch (error) {

            console.error(error);
            toast.error("Something went wrong");

        }

    };

    useEffect(() => {
        fetchMessage();
    }, []);

    if (loading) {
        return <p className="text-center my-5">Loading...</p>;
    }

    if (!message) {
        return <p className="text-center my-5">Message not found</p>;
    }

    return (
        <>
            {/* Header  */}
            <HeaderUi />

            <main>
                <div className="container my-5">
                    <div className="row">

                        <div className="col-md-3">
                            <Sidebar />
                        </div>

                        <div className="col-md-9">

                            <div className="card shadow border-0 p-4">

                                <h4 className="mb-4">
                                    Contact Message Details
                                </h4>

                                <div className="mb-3">
                                    <strong>Name:</strong> {message.name}
                                </div>

                                <div className="mb-3">
                                    <strong>Email:</strong> {message.email}
                                </div>

                                <div className="mb-3">
                                    <strong>Phone:</strong> {message.phone}
                                </div>

                                <div className="mb-3">
                                    <strong>Category:</strong> {message.category}
                                </div>

                                <div className="mb-3">
                                    <strong>Subject:</strong> {message.subject}
                                </div>

                                <div className="mb-3">
                                    <strong>Status:</strong>{" "}
                                    <span
                                        className={`badge ${
                                            message.status === "new"
                                                ? "bg-danger"
                                                : message.status === "read"
                                                ? "bg-warning text-dark"
                                                : "bg-success"
                                        }`}
                                    >
                                        {message.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <strong>Message:</strong>

                                    <div className="border rounded p-3 mt-2 bg-light">
                                        {message.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <strong>Created:</strong>{" "}
                                    {new Date(message.created_at)
                                        .toLocaleString()}
                                </div>

                                <div className="mt-4">

                                    {message.status !== "closed" && (
                                        <button
                                            className="btn btn-success me-2"
                                            onClick={closeMessage}
                                        >
                                            Close Message
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate("/admin/contact-messages")}
                                    >
                                        Back
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </main>

            {/* Footer  */}
            <FooterUi/>
        </>
    );
};

export default ContactMessageView;