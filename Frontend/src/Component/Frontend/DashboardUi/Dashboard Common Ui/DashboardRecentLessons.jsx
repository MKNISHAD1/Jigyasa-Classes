import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCirclePlay,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import DashboardRecentLessonItem from "./DashboardRecentLessonItem";
import DashboardSectionHeader from "./DashboardSectionHeader";



const DashboardRecentLessons = ({ lessons = [], 
    viewAllLink = "#", limit = 6, }) => {

    const recentLessons = lessons.slice(0, limit);


    return (
        
        <section className="Dashboard_Recent_Lesson_Section">

            {/* Section Header */} 
            <DashboardSectionHeader
                title="Recent Lessons"
                icon={faCirclePlay}
                viewAllLink={viewAllLink}
            />


            {/* Lessons */}
            <div className="Dashboard_Recent_Lessons">

                {recentLessons.length > 0 ? (

                    recentLessons.map((lesson) => (
                        <DashboardRecentLessonItem
                            key={lesson.id}
                            lesson={lesson}
                        />
                    ))

                ) : (

                    <div className="Dashboard_Recent_Empty_Lesson">
                       No recent lessons found.
                    </div>

                )}

            </div>

        </section>
    );
};


export default DashboardRecentLessons;