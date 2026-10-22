import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faUsers,
    faBook,
    faCirclePlay,
    faUserPlus,
    faTrash,
    faCheckCircle,
    faFileCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../../backend/context/Auth";

import DashboardHero from "../Dashboard Common Ui/DashboardHero";
import DashboardStatCard from "../Dashboard Common Ui/DashboardStatCard";
import DashboardRecentCourses from "../Dashboard Common Ui/DashboardRecentCourses";
import DashboardRecentLessons from "../Dashboard Common Ui/DashboardRecentLessons";

import adminmoderatordashimg from "../../../../assets/images/admin-moderator-dash.jpeg";
import Wavehand from "../../../../assets/images/waving-hand.svg?react";

import { apiUrl, token } from "../../../Common/http";
import DashboardRecentUsers from "../Dashboard Common Ui/DashboardRecentUsers";
import AdminModeratorStatSection from "../Dashboard Common Ui/AdminModeratorStatSection";
import DashboardQuickAction from "../Dashboard Common Ui/DashboardQuickAction";
import DashboardQuickActionsSection from "../Dashboard Common Ui/DashboardQuickActionSection";

const AdminModeratorDashboard = () => {
    const { user } = useContext(AuthContext);

    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentCourses, setRecentCourses] = useState([]);
    const [recentLessons, setRecentLessons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${apiUrl}dashboard/admin-moderator?${new URLSearchParams({
                        users_limit: "5",
                        courses_limit: "5",
                        lessons_limit: "6",
                    })}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token()}`,
                        },
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.status) {
                    throw new Error(
                        result.message ||
                            "Failed to load admin dashboard."
                    );
                }

                setStats(result.stats ?? null);
                setRecentUsers(result.recent_users ?? []);
                setRecentCourses(result.recent_courses ?? []);
                setRecentLessons(result.recent_lessons ?? []);
            } catch (err) {
                if (err.name === "AbortError") return;

                console.error(
                    "Failed to fetch admin/moderator dashboard:",
                    err
                );

                setError(
                    err.message || "Something went wrong."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => controller.abort();
    }, []);

    return (
        <div className="Admin_Moderator_Dashboard">
            <DashboardHero
                title={
                   <>
                        Hello, <span>{user?.name || "Teacher"}!</span>{" "}
                        <Wavehand className="Icon" />
                    </>
                }
                description="Manage users, courses and content."
                secondaryDescription="Here's an overview of your platform and recent activity."
                image={adminmoderatordashimg}
            />

            <AdminModeratorStatSection
                stats={stats}
                loading={loading}
            />

            <DashboardQuickActionsSection/>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row py-3 g-2">
                <div className="col-12 col-xl-8 py-2">
                    <DashboardRecentCourses
                        courses={recentCourses}
                        limit={5}
                    />
                </div>

                <div className="col-12 col-xl-4 py-2">
                    <DashboardRecentLessons
                        lessons={recentLessons}
                        limit={6}
                    />
                </div>
            </div>

            {/* Recent users */}

            <DashboardRecentUsers 
                users={recentUsers}
                limit={5}
            />

        </div>
    );
};

export default AdminModeratorDashboard;