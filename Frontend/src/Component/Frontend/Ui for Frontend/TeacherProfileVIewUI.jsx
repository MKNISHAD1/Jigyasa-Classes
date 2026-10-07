import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import CourseCardUi from "../../Common/CommonUI/CourseCardUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { apiUrl } from "../../Common/http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faBook, faStar, faUsers } from "@fortawesome/free-solid-svg-icons";


const TeacherProfileVIewUI = () => {

const { id } = useParams();
const { i18n } = useTranslation();

const [teacher, setTeacher] = useState(null);
const [courses, setCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const coursesSectionRef = useRef(null);

const [currentPage, setCurrentPage] = useState(1);

const coursesPerPage = 4;



useEffect(() => {

    const fetchTeacherProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const res = await fetch(
                apiUrl + `teacher-profile-view/${id}`
            );

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(
                    result.message || "Failed to load teacher profile."
                );
            }

            setTeacher(result.teacher);
            setCourses(result.courses || []);

        } catch (error) {

            console.error("Failed to fetch teacher profile:", error);
            setError(error.message || "Something went wrong.");

        } finally {

            setLoading(false);

        }

    };

    if (id) {
        fetchTeacherProfile();
    }

}, [id]);

useEffect(() => {
    setCurrentPage(1);
}, [id]);

if (loading) {
    return (
        <div
          className="d-flex flex-column justify-content-center align-items-center min-vh-100"
        >
          <div
            className="spinner-border text-primary "
            style={{ width: "3rem", height: "3rem" }}
          />

          <h5 className="mt-3 mb-1">Loading Instructor Profile...</h5>

          <small className="text-muted">
            Please Wait While Fetching Instructor Information...
          </small>
        </div>
    );
}


if (error || !teacher) {
    return (
        <>
            <HeaderUi />

            <div className="Teacher_Profile_Page container-fluid">
                <div className="Teacher_Profile_Error">
                    <h3>Teacher Not Found</h3>
                    <p>
                        {error || "Unable to load this teacher profile."}
                    </p>
                </div>
            </div>

            <FooterUi />
        </>
    );
}



const teacherName = teacher.name || "Instructor";

const professionalTitle =
    teacher.professional_title || "Jigyasa Classes Instructor";

const bio =
    teacher.bio?.[i18n.language] ||
    teacher.bio?.en ||
    teacher.bio ||
    "No introduction available.";

const profileImage =
    teacher.profile_pic || "/images/Teacher_Default.png";

// Pagination
const totalPages = Math.ceil(
    courses.length / coursesPerPage
);

const paginatedCourses = courses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
);

const courseFrom =
    courses.length > 0
        ? (currentPage - 1) * coursesPerPage + 1
        : 0;

const courseTo =
    Math.min(
        currentPage * coursesPerPage,
        courses.length
    );


// Change page
const changePage = (page) => {
    setCurrentPage(page);

    coursesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};



    return (
        <>

            <HeaderUi />


            <main className="Teacher_Profile_Page container-fluid">

                {/* Teacher Profile Hero */}
                <section className="Teacher_Profile_Section">

                    <div className="Teacher_Profile_Hero">

                        <div className="row align-items-center">

                            {/* Teacher Image */}
                            <div className="col-lg-4 col-md-5">

                                <div className="Teacher_Profile_Image_Wrapper">

                                    <img
                                        src={profileImage}
                                        alt={teacherName}
                                        className="Teacher_Profile_Image"
                                    />

                                </div>

                            </div>


                            {/* Teacher Information */}
                            <div className="col-lg-8 col-md-7">

                                <div className="Teacher_Profile_Content">

                                    <span className="Teacher_Profile_Tag">
                                        Instructor
                                    </span>


                                    <h1>
                                        {teacherName}
                                    </h1>


                                    <h4>
                                        {professionalTitle}
                                    </h4>


                                    <p className="Teacher_Profile_Bio">
                                        {bio}
                                    </p>


                                    {/* Profile Stats */}
                                    <div className="Teacher_Profile_Stats">

                                        <div className="Teacher_Stat">

                                            <div className="Teacher_Stat_Icon">
                                                <FontAwesomeIcon icon={faBook} />
                                            </div>

                                            <div>
                                                <strong>{courses.length}</strong>
                                                <small>Courses</small>
                                            </div>

                                        </div>


                                        {/* {teacher.total_students > 0 && ( */}
                                            <div className="Teacher_Stat">

                                                <div className="Teacher_Stat_Icon">
                                                    <FontAwesomeIcon icon={faUsers} />
                                                </div>

                                                <div>
                                                    <strong>120</strong>
                                                    <small>Students</small>
                                                </div>

                                            </div>
                                        {/* )} */}


                                        {/* {teacher.overall_rating && ( */}
                                            <div className="Teacher_Stat">

                                                <div className="Teacher_Stat_Icon Rating_Icon">
                                                    <FontAwesomeIcon icon={faStar}/>
                                                </div>

                                                <div>
                                                    <strong>4.3</strong>
                                                    <small>Rating</small>
                                                </div>

                                            </div>
                                        {/* )} */}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* Teacher Courses */}
                <section className="Teacher_Courses_Section container" ref={coursesSectionRef}>

                    <div className="Teacher_Courses_Header">

                        <h2>
                            Courses By This <span>Instructor</span>
                        </h2>

                        <p>
                            Explore courses created by {teacherName}.
                        </p>

                        <div className="Teacher_Courses_Underline"></div>

                    </div>


                    {courses.length > 0 ? (
                        <>
                        
                        <div className="row">

                            {paginatedCourses.map((course) => (

                                <div
                                    className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 Course_List"
                                    key={course.id}
                                >

                                    <CourseCardUi
                                        course={course}
                                    />

                                </div>

                            ))}

                        </div>

                        {totalPages > 1 && (
                            <div className="Course_Pagination">

                                <span className="Course_Pagination_Info">
                                    Showing{" "}
                                    <strong>{courseFrom} - {courseTo}</strong>{" "}
                                    of{" "}
                                    <strong>{courses.length}</strong>{" "}
                                    Course{courses.length !== 1 ? "s" : ""}
                                </span>


                                <div className="Course_Pagination_Controls d-flex align-items-center">

                                    <button
                                        type="button"
                                        className="Primary_Button"
                                        disabled={currentPage === 1}
                                        onClick={() => changePage(currentPage - 1)}
                                        aria-label="Previous page"
                                    >

                                        <small className="d-none d-md-block mx-2">
                                            Previous Page
                                        </small>

                                        <FontAwesomeIcon
                                            icon={faAngleLeft}
                                            className="d-block d-md-none Icon"
                                        />

                                    </button>


                                    <small className="Course_Pagination_Page mx-2">
                                        {currentPage} / {totalPages}
                                    </small>


                                    <button
                                        type="button"
                                        className="Primary_Button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => changePage(currentPage + 1)}
                                        aria-label="Next page"
                                    >

                                        <small className="d-none d-md-block mx-2">
                                            Next Page
                                        </small>

                                        <FontAwesomeIcon
                                            icon={faAngleRight}
                                            className="d-block d-md-none Icon"
                                        />

                                    </button>

                                </div>

                            </div>
                        )}
                        </>


                    ) : (

                        <div className="Teacher_No_Courses">

                            <h5>No courses available</h5>

                            <p>
                                This instructor hasn't published any courses yet.
                            </p>

                        </div>

                    )}

                </section>

            </main>


            <FooterUi />

        </>
    );
};


export default TeacherProfileVIewUI;