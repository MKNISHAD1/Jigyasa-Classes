import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faBookOpen,
    faCirclePlay,
    faFileAlt,
    faUserGraduate,
    faChalkboardTeacher,
    faWallet,
    faEnvelope,
    faCertificate,
    faUserCheck,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../../backend/context/Auth";
import { apiUrl, token } from "../../../Common/http";

import DashboardHero from "../Dashboard Common Ui/DashboardHero";
import DashboardRecentUsers from "../Dashboard Common Ui/DashboardRecentUsers";
import DashboardRecentCourses from "../Dashboard Common Ui/DashboardRecentCourses";
import DashboardRecentLessons from "../Dashboard Common Ui/DashboardRecentLessons";

import superdmindashdimg from "../../../../assets/images/superadmin-dash.jpeg";
import Wavehand from "../../../../assets/images/waving-hand.svg?react";
import DashboardAdminStatCard from "../Dashboard Common Ui/DashboardSuperAdminStatCard ";
import DashboardRecentActivities from "../Dashboard Common Ui/DashboardRecentActivities";

const SuperAdminDashboard = () => {
    const { user } = useContext(AuthContext);

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams({
                    users_limit: "15",
                    courses_limit: "5",
                    lessons_limit: "6",
                    activities_limit: "10",
                });

                const response = await fetch(
                    `${apiUrl}dashboard/superadmin?${params.toString()}`,
                    {
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
                            "Failed to load Super Admin dashboard."
                    );
                }

                setDashboard(result);
            } catch (err) {
                if (err.name === "AbortError") return;

                console.error("Super Admin dashboard error:", err);
                setError(err.message || "Something went wrong.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => controller.abort();
    }, []);

    const stats = dashboard?.stats ?? {};
    const users = stats.users ?? {};
    const courses = stats.courses ?? {};
    const lessons = stats.lessons ?? {};

    const mainStats = [
        {
            title: "Total Users",
            value: users.total_users,
            icon: faUsers,
            variant: "blue",
            details: [
                {
                    label: "Students",
                    value: users.students ?? 0,
                },
                {
                    label: "Teachers",
                    value: users.teachers ?? 0,
                },
                {
                    label: "Admins",
                    value:
                        (users.admins ?? 0) +
                        (users.super_admins ?? 0),
                },
            ],
        },
        {
            title: "Total Courses",
            value: courses.total_courses,
            icon: faBookOpen,
            variant: "green",
            details: [
                {
                    label: "Published",
                    value: courses.published_courses ?? 0,
                },
                {
                    label: "Draft",
                    value: courses.draft_courses ?? 0,
                },
                {
                    label: "Trashed",
                    value: courses.trashed_courses ?? 0,
                },
            ],
        },
        {
            title: "Total Lessons",
            value: lessons.total_lessons,
            icon: faCirclePlay,
            variant: "orange",
            details: [
                {
                    label: "Published",
                    value: lessons.published_lessons ?? 0,
                },
                {
                    label: "Draft",
                    value: lessons.draft_lessons ?? 0,
                },
                {
                    label: "Trashed",
                    value: lessons.trashed_lessons ?? 0,
                },
            ],
        },
        {
            title: "Total Exams",
            value: stats.exams?.total_exams,
            icon: faFileAlt,
            variant: "purple",
            details: [
                {
                    label: "Published",
                    value: stats.exams?.published_exams ?? "—",
                },
                {
                    label: "Draft",
                    value: stats.exams?.draft_exams ?? "—",
                },
                {
                    label: "Trashed",
                    value: stats.exams?.trashed_exams ?? "—",
                },
            ],
        },
    ];

    const secondaryStats = [
        {
            title: "Total Enrolments",
            value: stats.total_enrolments,
            icon: faUsers,
            variant: "purple",
        },
        {
            title: "Active Students",
            value: stats.active_students,
            icon: faUserGraduate,
            variant: "blue",
        },
        {
            title: "Active Teachers",
            value: stats.active_teachers,
            icon: faChalkboardTeacher,
            variant: "orange",
        },
        {
            title: "Total Payments",
            value: stats.total_payments,
            icon: faWallet,
            variant: "green",
        },
        {
            title: "Pending Enquiries",
            value: stats.pending_enquiries,
            icon: faEnvelope,
            variant: "red",
        },
        {
            title: "Certificates Issued",
            value: stats.certificates_issued,
            icon: faCertificate,
            variant: "yellow",
        },
    ];

    return (
        <div className="Super_Admin_Dashboard">

            <DashboardHero
                title={
                    <>
                        Welcome back,{" "}
                        <span>{user?.name || "Super Admin"}!</span>{" "}
                        <Wavehand className="Icon" />
                    </>
                }
                description="Here's what's happening on Jigyasa Classes."
                secondaryDescription="Manage your platform, track growth, and keep everything running smoothly."
                image={superdmindashdimg}
            />

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Main statistics */}
            <section className="Super_Admin_Main_Stats">
                {mainStats.map((stat) => (
                    <DashboardAdminStatCard
                        key={stat.title}
                        {...stat}
                        value={
                            loading
                                ? "0"
                                : stat.value ?? "0"
                        }
                        details={loading ? [] : stat.details}
                    />
                ))}
            </section>

            {/* Secondary statistics */}
            <section className="Super_Admin_Secondary_Stats">
                {secondaryStats.map((stat) => (
                    <div
                        className={`Super_Admin_Secondary_Card Super_Admin_Secondary_Card_${stat.variant}`}
                        key={stat.title}
                    >
                        <div className="Super_Admin_Secondary_Icon">
                            <FontAwesomeIcon icon={stat.icon} />
                        </div>

                        <div className="Super_Admin_Secondary_Info">
                            <span>{stat.title}</span>
                            <strong>
                                {loading ? "0" : stat.value ?? "0"}
                            </strong>
                        </div>
                    </div>
                ))}
            </section>

            {/* Recent platform data */}
            <section className="Super_Admin_Recent_Data">
                <div className="Super_Admin_Recent_Courses">
                    <DashboardRecentCourses
                        courses={dashboard?.recent_courses ?? []}
                        limit={5}
                    />
                </div>

                <div className="Super_Admin_Recent_Lessons">
                    <DashboardRecentLessons
                        lessons={dashboard?.recent_lessons ?? []}
                        limit={6}
                    />
                </div>

                <div className="Super_Admin_Recent_Users">
                    <DashboardRecentUsers
                        users={dashboard?.recent_users ?? []}
                        limit={13}
                    />
                </div>

                <div className="Super_Admin_Recent_Activities">
                    <DashboardRecentActivities
                        activities={dashboard?.recent_activities ?? []}
                        limit={10}
                    />
                </div>
            </section>

        </div>
    );
};

export default SuperAdminDashboard;