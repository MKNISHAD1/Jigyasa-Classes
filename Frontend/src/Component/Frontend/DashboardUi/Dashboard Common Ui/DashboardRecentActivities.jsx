import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClockRotateLeft,
    faUser,
    faBookOpen,
    faCirclePlay,
    faUserShield,
} from "@fortawesome/free-solid-svg-icons";

import systemBot from "../../../../assets/images/system-bot.jpeg";
import superAdminAvatar from "../../../../assets/images/super-ad.jpeg";

import DashboardSectionHeader from "./DashboardSectionHeader";

const DashboardRecentActivities = ({
    activities = [],
    limit = 10,
    viewAllLink = "#",
}) => {
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
        });
    };

    const getActivityIcon = (activity) => {
        const action = String(activity?.action || "").toLowerCase();
        const actorType = String(activity?.actor_type || "").toLowerCase();
        const actorRole = String(activity?.actor_role || "").toLowerCase();

        // Automated backend/system activity
        if (
            actorType === "system" ||
            action.startsWith("system_") ||
            action.startsWith("auto_") ||
            action.includes("account_auto_suspended") ||
            action.includes("account_auto_unsuspended")
        ) {
            return {
                type: "image",
                src: systemBot,
                alt: "System",
            };
        }

        // Super Admin activity
        if (
            actorRole === "super_admin" ||
            actorRole === "super admin"
        ) {
            return {
                type: "image",
                src: superAdminAvatar,
                alt: "Super Admin",
            };
        }

        // Course operations
        if (
            action.includes("course") ||
            action.includes("category") ||
            action.includes("module") ||
            action.includes("faq")
        ) {
            return { type: "icon", icon: faBookOpen };
        }

        // Lesson operations
        if (action.includes("lesson")) {
            return { type: "icon", icon: faCirclePlay };
        }

        // User and authentication operations
        if (
            action.includes("user") ||
            action.includes("account") ||
            action.includes("login") ||
            action.includes("logout") ||
            action.includes("register") ||
            action.includes("profile") ||
            action.includes("password") ||
            action.includes("2fa") ||
            action.includes("suspension")
        ) {
            return { type: "icon", icon: faUser };
        }

        return { type: "icon", icon: faUserShield };
    };

    const recentActivities = activities.slice(0, limit);

    return (
        <section className="Dashboard_Recent_Activity_Section">
            <DashboardSectionHeader
                title="Recent Activities"
                icon={faClockRotateLeft}
                viewAllLink={viewAllLink}
            />

            <div className="Dashboard_Recent_Activities">
                {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                        <div
                            className="Dashboard_Recent_Activity_Item"
                            key={activity.id}
                        >
                            <div className="Dashboard_Recent_Activity_Icon">
                                {(() => {
                                    const activityIcon = getActivityIcon(activity);

                                    return activityIcon.type === "image" ? (
                                        <img
                                            src={activityIcon.src}
                                            alt={activityIcon.alt}
                                            className="Dashboard_Recent_Activity_Avatar"
                                        />
                                    ) : (
                                        <FontAwesomeIcon icon={activityIcon.icon} />
                                    );
                                })()}
                            </div>

                            <div className="Dashboard_Recent_Activity_Info">
                                <p className="Dashboard_Recent_Activity_Message">
                                    {activity.message ||
                                        `${activity.actor_name || "System"} performed an action`}
                                </p>

                                <small>
                                    {formatDate(activity.created_at)}
                                </small>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="Dashboard_Recent_Activity_Empty">
                        No recent activities found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default DashboardRecentActivities;