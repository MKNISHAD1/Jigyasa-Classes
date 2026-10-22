import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCirclePlay,
    faPlus,
    faUsers,
    faStar,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../../backend/context/Auth";

import DashboardHero from "../Dashboard Common Ui/DashboardHero";
import DashboardStatCard from "../Dashboard Common Ui/DashboardStatCard";
import DashboardRecentCourses from "../Dashboard Common Ui/DashboardRecentCourses";
import DashboardRecentLessons from "../Dashboard Common Ui/DashboardRecentLessons";
import DashboardQuickActionsSection from "../Dashboard Common Ui/DashboardQuickActionSection";

import teacherDashboardCover from "../../../../assets/images/teacher-dash-2.jpeg";
import Wavehand from "../../../../assets/images/waving-hand.svg?react";
import { apiUrl, token } from "../../../Common/http";

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);

    const [stats, setStats] = useState(null);
    const [recentCourses, setRecentCourses] = useState([]);
    const [recentLessons, setRecentLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        // Fetch Teacher Dashboard data
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    apiUrl + "dashboard/teacher",
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
                        result.message || "Failed to load teacher dashboard."
                    );
                }

                setStats(result.stats ?? null);
                setRecentCourses(result.recent_courses ?? []);
                setRecentLessons(result.recent_lessons ?? []);
            } catch (err) {
                if (err.name === "AbortError") return;

                console.error("Failed to fetch teacher dashboard:", err);
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

    const statCards = [
        {
            title: "Total Courses",
            value: stats?.total_courses ?? "—",
            icon: faBook,
            variant: "blue",
        },
        {
            title: "Total Lessons",
            value: stats?.total_lessons ?? "—",
            icon: faCirclePlay,
            variant: "green",
        },
        {
            title: "New Courses",
            value: stats?.new_courses ?? "—",
            icon: faPlus,
            variant: "blue",
            description: "This month",
        },
        {
            title: "New Lessons",
            value: stats?.new_lessons ?? "—",
            icon: faCirclePlay,
            variant: "orange",
            description: "This month",
        },
        {
            title: "Total Students",
            value: "—",
            icon: faUsers,
            variant: "purple",
        },
        {
            title: "Average Rating",
            value: "—",
            icon: faStar,
            variant: "yellow",
        },
        {
            title: "Trashed Courses",
            value: stats?.trashed_courses ?? "—",
            icon: faTrash,
            variant: "red",
        },
        {
            title: "Trashed Lessons",
            value: stats?.trashed_lessons ?? "—",
            icon: faTrash,
            variant: "red",
        },
    ];

    return (
        <div className="Teacher_Dashboard">
            <DashboardHero
                title={
                    <>
                        Hello, <span>{user?.name || "Teacher"}!</span>{" "}
                        <Wavehand className="Icon" />
                    </>
                }
                description="Create amazing courses and help students learn."
                secondaryDescription="Here's an overview of your content and recent activity."
                image={teacherDashboardCover}
            />

            <div className="Dashboard_Stats">
                {statCards.map((stat) => (
                    <DashboardStatCard
                        key={stat.title}
                        title={stat.title}
                        value={loading ? "—" : stat.value}
                        icon={stat.icon}
                        variant={stat.variant}
                        description={stat.description}
                    />
                ))}
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row">
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

            <DashboardQuickActionsSection />
        </div>
    );
};

export default TeacherDashboard;