import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBook,faStar,faUserGroup,faArrowRight,} from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { PUBLIC_ROUTES } from "../../../constants/nevigation/routes";

const CourseCardUi = ({ course }) => {

    const { i18n } = useTranslation();
    const courseTitle = course.title?.[i18n.language] ?? course.title?.en;
    const categoryName = course.category?.name?.[i18n.language] ?? course.category?.name?.en;

    const courseViewUrl = PUBLIC_ROUTES.COURSE_VIEW
        .replace(":id", course.id)
        .replace(":title", course.title?.en);
    
    const teacherViewProfile = PUBLIC_ROUTES.Course_Teacher_Profile
        .replace(":id", course.teacher?.id)
    const formatCourseDuration = (seconds) => {
        const totalMinutes = Math.floor((seconds || 0) / 60);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) {
            return `${minutes} Min`;
        }

        if (minutes === 0) {
            return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
        }

        return `${hours} hr  ${minutes} min`;
    };


    return (

        <div className="Course_Card">
            {/* Course Image */}
            <div className="Course_Image_Wrapper">

                <Link to={courseViewUrl} className="Course_Image_Link">
                    <img
                        src={course.thumbnail ?? "/default-course.png"}
                        className="Course_Img"
                        alt={courseTitle}
                    />
                </Link>

                {course.difficulty_level && (
                    <span
                        className={`Difficulty_Badge Difficulty_${course.difficulty_level.replace(
                            /\s+/g,
                            "_"
                        )}`}
                    >
                        {course.difficulty_level}
                    </span>
                )}

            </div>

            {/* Course Title */}
            <div className="Course_Header">
                <Link to={courseViewUrl} className="Course_Title_Link">
                    <h6 className="Course_Title">
                        {courseTitle}
                    </h6>
                </Link>
            </div>

            {/* Teacher Information */}
            <div className="Teacher_Data_Row">

                <Link to={teacherViewProfile} className="Teacher_Profile_Link">
                
                    <img
                        src={
                            course.teacher?.profile_pic ??
                            "/default-course.png"
                        }
                        className="Teacher_Img"
                        alt={course.teacher?.name}
                    />

                    <h6 className="Teacher_Name">
                        {course.teacher?.name}
                    </h6>
                    
                </Link>

                <Link
                    className="Category_Button"
                    to={`${PUBLIC_ROUTES.COURSES}?category=${course.category?.id}`}
                >
                    {categoryName}
                </Link>
            </div>

            {/* Course Body */}
            <div className="Course_Body">

                {/* Course Metadata */}
                <div className="Course_Meta">

                    <div className="Course_Meta_Left">
                        <span>
                            <FontAwesomeIcon icon={faBook} className="Icon"/>
                            {course.lessons_count || 0} Lessons
                        </span>

                        <span>
                            <FontAwesomeIcon icon={faStar} className="Icon" />
                            4.8
                        </span>

                    </div>


                    <div className="Course_Meta_Right">

                        <span>
                            <FontAwesomeIcon icon={faClock} className="Icon" />
                            {formatCourseDuration(course.total_duration)}
                        </span>

                        <span>
                            <FontAwesomeIcon icon={faUserGroup} className="Icon"/>
                            1200 Students
                        </span>
                    </div>
                </div>

                {/* Course Footer */}
                <div className="Course_Footer">

                    <span className="Price">

                        {course.price
                            ? `₹ ${course.price}`
                            : "Free"}

                    </span>


                    <Link
                        to={courseViewUrl}
                        className="View_Course_Button"
                    >
                        View{" "}
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>

                </div>

            </div>

        </div>
    );
};


export default CourseCardUi;