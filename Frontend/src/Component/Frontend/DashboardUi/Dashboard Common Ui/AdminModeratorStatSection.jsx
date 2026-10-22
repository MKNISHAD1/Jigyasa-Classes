import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faBookOpen,
    faCirclePlay,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const AdminModeratorStatSection = ({ stats, loading }) => {
    const cards = [
        {
            title: "Total Users",
            value: stats?.users?.total_users,
            icon: faUsers,
            variant: "blue",
            details: [
                `${stats?.users?.students ?? 0} Students`,
                `${stats?.users?.teachers ?? 0} Teachers`,
                `${(stats?.users?.admins ?? 0)+ (stats?.users?.moderators ?? 0) + (stats?.users?.super_admins ?? 0)} Admins`,
            ],
        },
        {
            title: "Total Courses",
            value: stats?.courses?.total_courses,
            icon: faBookOpen,
            variant: "green",
            details: [
                `${stats?.courses?.published_courses ?? 0} Published`,
                `${stats?.courses?.draft_courses ?? 0} Draft`,
                `${stats?.courses?.trashed_courses ?? 0} Trashed`,
            ],
        },
        {
            title: "Total Lessons",
            value: stats?.lessons?.total_lessons,
            icon: faCirclePlay,
            variant: "orange",
            details: [
                `${stats?.lessons?.published_lessons ?? 0} Published`,
                `${stats?.lessons?.draft_lessons ?? 0} Draft`,
                `${stats?.lessons?.trashed_lessons ?? 0} Trashed`,
            ],
        },
    ];

    return (
        <section className="Admin_Moderator_Stats">
            {cards.map((card) => (
                <article
                    className={`Admin_Stat_Card Admin_Stat_Card_${card.variant}`}
                    key={card.title}
                >
                    <div className="Admin_Stat_Card_Main">
                        <div className="Admin_Stat_Card_Icon">
                            <FontAwesomeIcon icon={card.icon} />
                        </div>

                        <div className="Admin_Stat_Card_Content">
                            <span className="Admin_Stat_Card_Title">
                                {card.title}
                            </span>

                            <strong className="Admin_Stat_Card_Value">
                                {loading
                                    ? "—"
                                    : (card.value ?? 0).toLocaleString()}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="Admin_Stat_Card_Action"
                            aria-label={`View ${card.title}`}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>

                    <div className="Admin_Stat_Card_Details">
                        {card.details.map((detail, index) => (
                            <React.Fragment key={detail}>
                                {index > 0 && (
                                    <span className="Admin_Stat_Card_Divider" />
                                )}
                                <span>{loading ? "—" : detail}</span>
                            </React.Fragment>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    );
};

export default AdminModeratorStatSection;