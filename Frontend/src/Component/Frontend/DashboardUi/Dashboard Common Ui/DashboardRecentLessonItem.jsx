import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCirclePlay,
    faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";


const DashboardRecentLessonItem = ({ lesson }) => {

const formatDashboardDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
};
 
    return (
        <div className="Dashboard_Recent_Lesson_Item">

            {/* Lesson Icon */}
            <div className="Dashboard_Recent_Lesson_Icon">
                <FontAwesomeIcon icon={faCirclePlay} />
            </div>


            {/* Lesson Information */}
            <div className="Dashboard_Recent_Lesson_Info">

                <h6 className="Dashboard_Recent_Lesson_Title">
                    {lesson?.title?.en || lesson?.title || "Untitled Lesson"}
                </h6>

                <small className="Dashboard_Recent_Lesson_Course">
                     {lesson?.course?.title?.en ||
                        lesson?.course?.title ||
                        "Unknown Course"}
                </small>

            </div>


            {/* Status + Date */}
            <div className="Dashboard_Recent_Lesson_Status">

                <span
                    className={`Lesson_Status_${
                        lesson?.status || "unknown"
                    }`}
                >
                    {lesson?.status || "Unknown"}
                </span>

                <small>
                    {formatDashboardDate(lesson?.created_at )}
                </small>

            </div>


            {/* More */}
            {/* <button
                type="button"
                className="Dashboard_Recent_Lesson_More"
                aria-label="Lesson options"
            >
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </button> */}

        </div>
    );
};


export default DashboardRecentLessonItem;