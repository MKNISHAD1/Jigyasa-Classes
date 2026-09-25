import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faBook,
    faStar,
    faUserGroup,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { faClock } from "@fortawesome/free-regular-svg-icons";
import { PUBLIC_ROUTES } from "../../../constants/nevigation/routes";



const CourseCardUi = ({ course }) => {

    const { i18n } = useTranslation();

    const courseTitle =
        course.title?.[i18n.language] ??
        course.title?.en;

    const categoryName =
        course.category?.name?.[i18n.language] ??
        course.category?.name?.en;

    return (

        <div className="Course_Card">

            {/* Course Image */}
            <img
                src={course.thumbnail ?? "/default-course.png"}
                className="Course_Img"
                alt={courseTitle}
            />


            {/* Course Title */}
            <div className="Course_Header">

                <h6 className="Course_Title">
                    {courseTitle}
                </h6>

            </div>


            {/* Teacher Information */}
            <div className="Teacher_Data_Row">

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

                <Link
                    className="Category_Button"
                    to="#"
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
                            <FontAwesomeIcon
                                icon={faBook}
                                className="Icon"
                            />

                            {course.lessons_count || 0} Lessons
                        </span>

                        <span>
                            <FontAwesomeIcon
                                icon={faStar}
                                className="Icon"
                            />

                            4.8
                        </span>

                    </div>


                    <div className="Course_Meta_Right">

                        <span>
                            <FontAwesomeIcon
                                icon={faClock}
                                className="Icon"
                            />

                            18 Hours
                        </span>

                        <span>
                            <FontAwesomeIcon
                                icon={faUserGroup}
                                className="Icon"
                            />

                            1200 Students
                        </span>

                    </div>

                </div>


                {/* Course Footer */}
                <div className="Course_Footer">

                    <span className="Price">

                        {course.price
                            ? `₹${course.price}`
                            : "Free"}

                    </span>


                    <Link
                        to={PUBLIC_ROUTES.COURSE_VIEW
                            .replace(":id", course.id)
                            .replace(
                                ":title",
                                course.title?.en
                            )
                        }
                        className="View_Course_Button"
                    >
                        View{" "}
                        <FontAwesomeIcon
                            icon={faArrowRight}
                        />
                    </Link>

                </div>

            </div>

        </div>
    );
};


export default CourseCardUi;