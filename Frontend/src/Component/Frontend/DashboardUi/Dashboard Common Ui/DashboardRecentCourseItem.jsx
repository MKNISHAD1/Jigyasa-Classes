import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faUsers,
    faEllipsisVertical,
    faCirclePlay,
    faUserTie,
    faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";


const DashboardRecentCourseItem = ({ course }) => {

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
        <div className="Dashboard_Recent_Course_Item">
            <div className="Dashboard_Recent_Course_Info">
                <div className="Dashboard_Recent_Course_Thumbnail">
                    <img
                        src={course?.thumbnail}
                        alt={course?.title?.en || course?.title || "Course"}
                    />
                </div>

                <h6 className="Dashboard_Recent_Course_Title">
                    {course?.title?.en || course?.title || "Untitled Course"}
                </h6>

                {course?.teacher?.name && (
                    <p className="Dashboard_Recent_Course_Teacher">
                        <FontAwesomeIcon icon={faUserTie} className="Icon" />
                        {" "}{course.teacher.name}
                    </p>
                )}

                <div className="Dashboard_Recent_Course_Meta">
                    <span>
                        <FontAwesomeIcon icon={faCirclePlay} />
                        <b>{course?.lessons_count ?? 0}</b> Lessons
                    </span>

                    <span>
                        <FontAwesomeIcon icon={faUserGraduate} />
                        <b>{course?.students_count ?? 0} </b> Students
                    </span>
                </div>
            </div>

            <div className="Dashboard_Recent_Course_Side">
                <div className="Dashboard_Recent_Course_Difficulty">
                    <span>{course?.difficulty_level || "All Levels"}</span>
                </div>

                <div className="Dashboard_Recent_Course_Status">
                    <span className={`Course_Status_${course?.status || "unknown"}`}>
                        {course?.status || "Unknown"}
                    </span>
                    <small>{formatDashboardDate(course?.created_at)}</small>
                </div>
            </div>
        </div>
    );
};


export default DashboardRecentCourseItem;