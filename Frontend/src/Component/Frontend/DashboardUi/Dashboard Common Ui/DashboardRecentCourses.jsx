import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

import DashboardRecentCourseItem from "./DashboardRecentCourseItem";
import DashboardSectionHeader from "./DashboardSectionHeader";


const DashboardRecentCourses = ({
    courses = [],
    limit = 5,
    viewAllLink = "#",
}) => {

    const recentCourses = courses.slice(0, limit);

    return (
        <section className="Dashboard_Recent_Courses">

            {/* Section Header */}
            <DashboardSectionHeader
                title="Recent Courses"
                icon={faBook}
                viewAllLink={viewAllLink}
            />


            {/* Course List */}
            <div className="Dashboard_Recent_Courses_List">

                {recentCourses.length > 0 ? (

                    recentCourses.map((course) => (
                        <DashboardRecentCourseItem
                            key={course.id}
                            course={course}
                        />
                    ))

                ) : (

                     <div className="Dashboard_Recent_Empty_Course">
                        No recent courses found.
                    </div>

                )}

            </div>

        </section>
    );
};


export default DashboardRecentCourses;