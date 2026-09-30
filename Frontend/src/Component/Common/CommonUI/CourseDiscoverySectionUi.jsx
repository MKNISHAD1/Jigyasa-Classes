import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import CourseCardUi from "./CourseCardUi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const CourseDiscoverySectionUi = ({
    title,
    subtitle,
    courses = [],
    viewAllLink,
}) => {

    if (!courses.length) {
        return null;
    }

    return (
        <section className="Course_Discovery_Section">

            <div className="Course_Discovery_Header">

                <div className="Course_Discovery_Header_Content">

                    <h3 className="Course_Discovery_Title" dangerouslySetInnerHTML={{__html:title}}>
                        {/* {title} */}
                    </h3>

                    {subtitle && (
                        <p className="Course_Discovery_Subtitle">
                            {subtitle}
                        </p>
                    )}

                </div>


                {viewAllLink && (
                    <Link
                        to={viewAllLink}
                        className="Course_Discovery_View_All"
                    >
                        View All <FontAwesomeIcon icon={faArrowRight}/>
                    </Link>
                )}

            </div>


            <Swiper
                className="Course_Discovery_Swiper"
                spaceBetween={16}
                slidesPerView={1.15}
                breakpoints={{
                    576: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },

                    992: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                    },
                }}
            >

                {courses.map((course) => (
                    <SwiperSlide key={course.id}>
                        <CourseCardUi course={course} />
                    </SwiperSlide>
                ))}

            </Swiper>

        </section>
    );
};

export default CourseDiscoverySectionUi;