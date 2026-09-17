import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import LessonTable from "../Lessons/LessonTable";
import { faAngleLeft, faAngleRight, faArrowLeft, faArrowRight, faBarChart, faCalendar, faCalendarDay, faChartSimple, faCheck, faCheckCircle, faCircleMinus, faCirclePlay, faClock, faClockRotateLeft, faFileAlt, faFileLines, faFlag, faFolderClosed, faFolderTree, faIndianRupeeSign, faLanguage, faPen, faPlayCircle, faSitemap, faStar, faUsers, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { COURSE_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { FaUserTie } from "react-icons/fa";
import { Accordion } from "react-bootstrap";
import PageNotFound from '../../../assets/images/not-found.jpeg';


const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModules, setSelectedModules] = useState([]);
  const highlights = course?.highlights?.[i18n.language] || course?.highlights?.en || [];

  
    // Accordon Lessoon pagination
    const LESSONS_PER_PAGE = 10;
    const [lessonPages, setLessonPages] = useState({});
  
    const getLessonPage = (moduleId) => {
      return lessonPages[moduleId] || 1;
    };
  
    const changeLessonPage = (moduleId, page) => {
      setLessonPages((prev) => ({
        ...prev,
        [moduleId]: page,
      }));
    };
  
    // Module pagination Home Screen
    const MODULES_PER_PAGE = 15;
    const [modulePage, setModulePage] = useState(1);
    const modules = course?.modules || [];
    const totalModules = modules.length;
  
    const totalModulePages = Math.ceil(
      totalModules / MODULES_PER_PAGE
    );
  
    const moduleStartIndex =
      (modulePage - 1) * MODULES_PER_PAGE;
  
    const paginatedModules = modules.slice(
      moduleStartIndex,
      moduleStartIndex + MODULES_PER_PAGE
    );
  
    const moduleFrom =
      totalModules === 0 ? 0 : moduleStartIndex + 1;
  
    const moduleTo = Math.min(
      moduleStartIndex + MODULES_PER_PAGE,
      totalModules
    );

  // Highlights Logic
  const mid = Math.ceil(highlights.length / 2);
  const leftHighlights = highlights.slice(0, mid);
  const rightHighlights = highlights.slice(mid);
  

  // Fetch Course
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl + "view-course/" + id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();

      if (result.status) {
        setCourse(result.course);
      } else {
        toast.error("Failed to fetch course details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong while fetching course");
    } finally {
      setLoading(false);
    }
  };

  
  // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

        return new Date(date).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"numeric",
            year:"numeric",
            hour: "numeric",
            minute: "2-digit",
        });

    };  

  // formate currency

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount));
};



  //Price Section Logic
  const price = Number(course?.price || 0);

  // Discount between 20% and 30%
  const discount = price
    ? (20 + (course.id % 3) * 5) // 20,25,30
    : 0;
 
  // Original Price
  const originalPrice = price
    ? Math.round(price / (1 - discount / 100))
    : 0;

  useEffect(() => {
    fetchCourse();
  }, [id]);

    const handleLessonDeleted = (lessonId) => {
      setCourse((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((l) => l.id !== lessonId),
      }));
    };

if (loading) {
  return (
    <div className="dashboard-card mt-4">
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "350px" }}
      >
        <div
          className="spinner-border text-success "
          style={{ width: "3rem", height: "3rem" }}
        />

        <h5 className="mt-3 mb-1">Fetching Course Information...</h5>

        <small className="text-muted">
          Please wait while we fetch your course information.
        </small>
      </div>
    </div>
  );
}

if (!course) return <p className="text-center my-5">Course not found!</p>;

  return (
    <>

      {/* Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center">
          <section className="breadcrumb-section">
              <h3>Course  <span>Details</span></h3>

              <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to=""><span>View Course</span></Link>

          </section>

          <Link to={COURSE_ROUTES.MY_COURSE} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
          </Link>
      </div>

      {/* Thumbnail and data */}
      <div className="dashboard-card mt-4">
        <div className="row">
          {/* Thumbnail Image */}
          <div className="col-lg-6 text-center mb-3">
            <div className="thumbnail-img">
              <img
                src={course.thumbnail || "/images/default-thumbnail.jpg"}
                alt="Course Thumbnail"
              />
            </div>
          </div>
          {/* Thumbnail Data */}
          <div className="col-lg-6 p-0">
            <div className="thumbnail-data">

              {/* Course Title */}
              <h4 className="title">{course.title?.[i18n.language] || course.title?.en}</h4>
              
              {/* Course Status */}
              <span
                className={`badge course-status mb-2 ${
                  course.status === "published" ? "badge-published text-success" : "badge-draft text-warning"
                }`}
              >
                {course.status}
              </span>

              <div className="additional-data d-flex mb-2">

                <div className="left-data mx-2">

                  {/* Teacher Name */}
                  <div className="data-set">
                      <FontAwesomeIcon icon={faUserTie} className="icon"/>
                      <small>{course.teacher?.name}</small>
                  </div>
                  {/* Category */}
                  <div className="data-set">
                      <FontAwesomeIcon icon={faFolderClosed} className="icon"/>
                      <small>{course.category?.name?.[i18n.language] || course.category?.name?.en}</small> 
                      <span className="mx-1"> • </span>
                      <FontAwesomeIcon icon={faFolderTree} className="icon"/>
                      <small>{course.subcategory?.name?.[i18n.language] || course.subcategory?.name?.en  || "General"}</small>
                  </div>
                </div>


                <div className="right-data mx-2">
                  {/* Created At */}
                  <div className="data-set">
                      <FontAwesomeIcon icon={faCalendar} className="icon"/>
                      <small>{formatDate(course.created_at)}</small>
                  </div>

                  {/* Updated At */}
                  <div className="data-set">
                      <FontAwesomeIcon icon={faClockRotateLeft} className="icon"/>
                      <small>{formatDate(course.updated_at || course.created_at)}</small>
                  </div>                
                </div>
              </div>

              <div className="button-set mt-3">
                <Link className="btn btn-sm blue-btn" 
                  to={`/admin/course/update-Course/${course.id}`}
                >
                  <FontAwesomeIcon icon={faPen} className="icon"/> Edit Course 
                </Link>

                <Link className="btn btn-sm blue-btn mx-3" 
                  to={`/admin/course/${course.id}/course-modules`}              
                >
                  <FontAwesomeIcon icon={faSitemap} className="icon"/> Manage Structure
                </Link>
              </div>


              {/* Price */}
              {/* <div className="price-section d-flex">

                <h5 className="final-price text-success fw-semibold">
                  {formatCurrency(price)}
                </h5>

                {price > 0 ? (
                  <div className="price-row">

                    <span className="old-price px-2">
                     <strike className='text-dark'>{formatCurrency(originalPrice)}</strike> 
                    </span>

                    <span className="badge discount-badge bg-danger ">
                      {discount}% OFF
                    </span>

                  </div>
                ):(
                  <span className=" badge free-badge bg-success text-light">
                      100% FREE
                  </span>
                  )
                }

              </div> */}

              {/* Course Badges */}
              {/* <div className="course-badges d-none d-md-grid">

                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div className="body">
                  <p>4.5 </p><small>120 Reviews</small>
                  </div>
                </div>

                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="body">
                  <p>120+ </p><small>Students</small>
                  </div>
                </div>


                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faLanguage} /> 
                  </div>
                  <div className="body">
                  <p>{course?.language}</p><small>Language</small>
                  </div>
                </div>

              </div> */}

            </div>

            
          </div>

        </div>

      </div>

      {/* Description */}
        <div className="dashboard-card mt-4">
          <div className="card-header-custom">

              <div className="header">
                  <FontAwesomeIcon icon={faFileAlt} className="icon"/>
                  <span>Course Description</span>
              </div>

          </div>            
          <p className="description"> {course.description?.[i18n.language] || course.description?.en} </p>
        </div>

      {/* Highlights */}
        <div className="dashboard-card mt-4 d-none d-md-block">
          <div className="mb-3">
            <div className="card-header-custom">
                <div className="header">
                    <FontAwesomeIcon icon={faStar} className="icon"/>
                    <span>Highlights</span>
                </div>
            </div>

            <div className="highlights-section">

                {
                    highlights.length > 0 ? (

                        <div className="highlights-grid">

                            <div className="highlight-column">

                                {leftHighlights.map((item,index)=>(
                                    <div
                                        className="highlight-item"
                                        key={index}
                                    >
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            className="check-icon"
                                        />

                                        <span>{item}</span>

                                    </div>
                                ))}

                            </div>

                            <div className="highlight-column">

                                {rightHighlights.map((item,index)=>(
                                    <div
                                        className="highlight-item"
                                        key={index}
                                    >
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            className="check-icon"
                                        />

                                        <span>{item}</span>

                                    </div>
                                ))}

                            </div>

                        </div>

                    ) : (

                        <small className='text-success fw-bold'>
                            Course highlights will be coming soon.
                        </small>

                    )
                }

            </div>
            </div>
      </div>

      {/* Highlights On Mobile */}
      <div className="dashboard-card mt-4 d-block d-md-none">
        <div className="mb-3">
          <div className="card-header-custom">
              <div className="header">
                  <FontAwesomeIcon icon={faStar} className="icon"/>
                  <span>Highlights</span>
              </div>
          </div>
              <div className="highlights-section">

                {
                    highlights.length > 0 ? (

                      highlights.map((item,index)=>(
                          <div
                              className="highlight-item my-2"
                              key={index}
                          >
                              <FontAwesomeIcon
                                  icon={faCheck}
                                  className="check-icon"
                              />

                              <span>{item}</span>

                          </div>
                      ))

                    ) : (

                        <small className='text-success fw-bold'>
                            Course highlights will be coming soon.
                        </small>

                    )
                }

              </div>
            </div>
      </div>

      {/* Course Overview Icons set */}
      <div className="dashboard-card mt-4">
        <div className="card-header-custom mb-4">
          <div className="header">
            <FontAwesomeIcon icon={faFileLines} className="icon" />
            <span>Course Overview</span>
          </div>
        </div>

        <div className="overview-grid">

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faFolderClosed} className="icon text-primary" />
              <span>Category</span>
            </div>
            <span className="separator">:</span>
            <span className="value">
              {course.category?.name?.[i18n.language] || course.category?.name?.en}
            </span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faCirclePlay} className="icon text-purple" />
              <span>Lessons</span>
            </div>
            <span className="separator">:</span>
            <span className="value">{course.lessons_count || 0}</span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faFolderTree} className="icon text-info" />
              <span>Sub Category</span>
            </div>
            <span className="separator">:</span>
            <span className="value">
              {course.subcategory?.name?.[i18n.language] ||
                course.subcategory?.name?.en ||
                "General"}
            </span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faUserTie} className="icon text-primary" />
              <span>Instructor</span>
            </div>
            <span className="separator">:</span>
            <span className="value">
              {course.teacher?.name || "Jigyasa"}
            </span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faChartSimple} className="icon text-success" />
              <span>Level</span>
            </div>
            <span className="separator">:</span>
            <span className="value">{course.difficulty_level}</span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faCalendar} className="icon text-success" />
              <span>Created At</span>
            </div>
            <span className="separator">:</span>
            <span className="value">{formatDate(course.created_at)}</span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon
                icon={faIndianRupeeSign}
                className="icon text-primary"
              />
              <span>Price</span>
            </div>
            <span className="separator">:</span>
            <span className="value">{formatCurrency(course.price)}</span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon
                icon={faCalendarDay}
                className="icon text-purple"
              />
              <span>Updated At</span>
            </div>
            <span className="separator">:</span>
            <span className="value">
              {formatDate(course.updated_at || course.created_at)}
            </span>
          </div>

          <div className="overview-item">
            <div className="label">
              <FontAwesomeIcon icon={faFlag} className="icon text-warning" />
              <span>Status</span>
            </div>
            <span className="separator">:</span>
            <span className="value text-capitalize">
              {course.status}
            </span>
          </div>

        </div>
      </div>

      {/* Lessons Overview*/}
      <div className="dashboard-card mt-4 mb-4">
        <div className="card-header-custom">
          <div className="header">
              <FontAwesomeIcon icon={faCirclePlay} className="icon"/>
              <span>Lessons Overview</span>
          </div>

        </div>  


        {/*Module  Accordion  */}

        <Accordion defaultActiveKey="0">

        {paginatedModules.map((module, index) => (

          <Accordion.Item
            eventKey={index.toString()}
            key={module.id}
          >

            <Accordion.Header>
              {/* <input
                type="checkbox"
                className="form-check-input me-2"
                disabled={module.title?.en === "General"}
                checked={
                  module.title?.en !== "General" &&
                  selectedModules.includes(module.id)
                }
                onClick={(e) => e.stopPropagation()}
                onChange={() => {
                  if (module.title?.en === "General") return;

                  setSelectedModules((prev) =>
                    prev.includes(module.id)
                      ? prev.filter((id) => id !== module.id)
                      : [...prev, module.id]
                  );
                }}
              /> */}

              <div className="module-header-content">
                <span className="module-title text-capitalize fw-semibold">
                  {index + 1} : {module.title?.[i18n.language] ||
                    module.title?.en}
                </span>

                <span className="badge bg-primary module-lesson-count">
                  {module.lessons_count}{" "}
                  {module.lessons_count === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>


            </Accordion.Header>

            <Accordion.Body>

              {/* Lesson List */}

              {module.lessons?.length > 0 ? (

                <>
                  {(() => {

                    const currentPage = getLessonPage(module.id);

                    const totalLessons = module.lessons.length;

                    const totalPages = Math.ceil(
                      totalLessons / LESSONS_PER_PAGE
                    );

                    const startIndex =
                      (currentPage - 1) * LESSONS_PER_PAGE;

                    const endIndex =
                      startIndex + LESSONS_PER_PAGE;

                    const currentLessons =
                      module.lessons.slice(
                        startIndex,
                        endIndex
                      );

                    return (
                      <>
                        {/* Lessons */}

                        <ul className="list-group mb-2">

                          {currentLessons.map((lesson) => (

                            <li
                              key={lesson.id}
                              className="list-group-item lesson-row"
                            >

                              <span className="lesson-title">

                                <FontAwesomeIcon
                                  icon={faCirclePlay}
                                  className="mx-2"
                                />

                                {lesson.title?.[i18n.language] ||
                                  lesson.title?.en}

                              </span>

                              <span
                                className={`badge course-status mb-2 ${
                                  lesson.status === "published"
                                    ? "badge-published text-success"
                                    : "badge-draft"
                                }`}
                              >
                                {lesson.status}
                              </span>

                            </li>

                          ))}

                        </ul>


                        {/* Lesson Pagination */}

                        {totalPages > 1 && (

                        <div className="modal-pagination">

                          <span>
                            Showing <strong>{startIndex + 1} - {Math.min(endIndex, totalLessons)}</strong>{" "}
                            of <strong>{totalLessons}</strong> Lessons
                          </span>

                            <div className="pagination-buttons">

                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                changeLessonPage(
                                  module.id,
                                  currentPage - 1
                                )}
                              >
                                <FontAwesomeIcon icon={faAngleLeft} />
                              </button>

                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                  changeLessonPage(
                                    module.id,
                                    currentPage + 1
                                  )
                                }
                              >
                                <FontAwesomeIcon icon={faAngleRight} />
                              </button>

                            </div>

                        </div>
                        )}

                      </>
                    );

                  })()}

                </>

              ) : (
                <>
                  <div className="d-flex justify-content-center py-2">
                    <div className="d-flex align-items-center">

                        <img
                            src={PageNotFound}
                            alt="No courses found"
                            height="100px"
                            width="140px"
                        />

                        <div className="text-body mx-4">
                          <h6 className="text">No Lesson Assigned</h6>

                          <small className="text-muted ">Start by assigning lessons to this module.</small>
          
                        </div>

                    
                    </div>
                  </div>
                </>

              )}

            </Accordion.Body>

          </Accordion.Item>

        ))}

        </Accordion>

        <div className="module-pagination">

          <span className="module-pagination-info">
            Showing <strong>{moduleFrom} - {moduleTo}</strong> of{" "}
            <strong>{totalModules}</strong> modules
          </span>

          <div className="module-pagination-buttons">

            <button
              type="button"
              className="pagination-arrow"
              disabled={modulePage === 1}
              onClick={() =>
                setModulePage((page) => page - 1)
              }
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            <button
              type="button"
              className="pagination-arrow"
              disabled={modulePage === totalModulePages}
              onClick={() =>
                setModulePage((page) => page + 1)
              }
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>

          </div>

        </div>

        
          {/* Lesson Table */}
          {/* <LessonTable
            lessons={course.lessons}
            courseId={course.id}
            onLessonDeleted={handleLessonDeleted}
            reloadLessons={fetchCourse}
          /> */}


            {/* Buttons */}
            <div className="d-flex gap-3 mt-4">


              {/* Manage Structure */}
              <Link className="btn yellow-btn" 
                to={`/admin/course/${course.id}/course-modules`}              
              >
                <FontAwesomeIcon icon={faSitemap} className="icon"/> Manage Structure
              </Link>

              {/* Manage Lessons */}
              <Link className="btn blue-btn" 
                to={`/admin/lesson/${course.id}/course-lessons`}              
              >
                <FontAwesomeIcon icon={faCirclePlay} className="icon"/> Manage Lessons
              </Link>

              {/* Update Course Button */}
              <Link className="btn green-btn" 
                to={`/admin/course/update-Course/${course.id}`}
              >
                <FontAwesomeIcon icon={faPen} className="icon"/> Edit Course 
              </Link>
              
              {/* Return to List */}
              <Link
                className="btn gray-btn"
                to={COURSE_ROUTES.MY_COURSE}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back To List
              </Link>
            </div>
      </div>

      {/* <div className="dashboard-card">
                  Lesson Table
          <LessonTable
            lessons={course.lessons}
            courseId={course.id}
            onLessonDeleted={handleLessonDeleted}
            reloadLessons={fetchCourse}
          />
      </div> */}
      
            
    </>
  );
};

export default CourseView;
