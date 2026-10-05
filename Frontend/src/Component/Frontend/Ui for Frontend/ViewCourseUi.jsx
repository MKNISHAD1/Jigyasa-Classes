import React, { useEffect, useState } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';  
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { apiUrl } from '../../Common/http';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight, faAngleUp, faArrowRight, faArrowTrendUp,faChalkboardTeacher, faCheck, faClock, faDoorOpen, faFolderTree, faHeart, faLanguage, faLayerGroup, faLink,  faPlay,  faPlayCircle,  faStar, faStopwatch, faUsers, faUserTie } from '@fortawesome/free-solid-svg-icons';
import {  faClockFour, faFile, faFileLines,  } from '@fortawesome/free-regular-svg-icons';
import CourseCurriculum from '../../backend/courses/CourseCurriculum';
import { faQuora } from '@fortawesome/free-brands-svg-icons';
import no_lesson from '../../../assets/images/not-found2.jpeg'
import { Accordion } from 'react-bootstrap';
import { PUBLIC_ROUTES } from '../../../constants/nevigation/routes';
import FaqSection from '../../backend/courses/FaqSection';
import CourseCardUi from '../../Common/CommonUI/CourseCardUi';
import { SwiperSlide, Swiper } from 'swiper/react';
import Share_Course_Card_Ui from '../../Common/CommonUI/Share_Course_Card_Ui';

const ViewCourseUi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqs,setFaqs] = useState([]);
  const [showMore, setShowMore] = useState(false);


  const shareUrl = window.location.href;
  const highlights = course?.highlights?.[i18n.language] || course?.highlights?.en || [];

  const courseFaqs = faqs.filter(
    (faq) =>
      faq.type === "course" &&
      faq.status === true
  );

    // Fetch FAQs
    const fetchFaqs = async () => {
      try {
        const res = await fetch(apiUrl + "list-faqs");
        const result = await res.json();
        if (result.status) setFaqs(result.faqs);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch FAQs");
      }
    };
  
    useEffect(() => {
      fetchFaqs();
    }, []);

    // Fetch Course 
  const fetchCourse = async () => {
    try {
      const res = await fetch(apiUrl + "Course-View/" + id, {
        headers: {
          Accept: "application/json",
                },
      });

      const result = await res.json();

      if (result.status) {
        setCourse(result.course);
        setSimilarCourses(result.similar_courses || []);
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

  useEffect(() => {
    fetchCourse();
  }, [id]);


  // Check If course have materials or not
  const hasMaterials = course?.modules?.some(module =>
    module.lessons?.some(lesson => lesson.has_materials)
  );

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

  //  Language Logic
  const languageLabel = {
    Both: "Eng / Hi",
    English: "English",
    Hindi: "Hindi"
  }[course?.language] || course?.language;

  //  Difficulty Level
  const difficultyLabel = {
    Beginner: "Beginner",
    Intermediate: "Intermediate",
    Advanced: "Advanced",
    "All Levels": "For Everyone"
  }[course?.difficulty_level] || course?.difficulty_level;


  // Highlights Logic
  const mid = Math.ceil(highlights.length / 2);
  const leftHighlights = highlights.slice(0, mid);
  const rightHighlights = highlights.slice(mid);

  // Course Duration
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

  // Similar courses
  const [similarCourses, setSimilarCourses] = useState([]);

  // spiner while loading data 
  if (loading) {
    return (

        <div
          className="d-flex flex-column justify-content-center align-items-center min-vh-100"
        >
          <div
            className="spinner-border text-primary "
            style={{ width: "3rem", height: "3rem" }}
          />

          <h5 className="mt-3 mb-1">Loading Course...</h5>

          <small className="text-muted">
            Please Wait While Fetching Course Information...
          </small>
        </div>

    );
  }
  if (!course) return <p className="text-center my-5">Course not found!</p>;

  return (
    <>
      {/* Header  */}
      <HeaderUi/>

      {/* Course-View-Hero  */}
      <section className="Course_View_Hero">
        <div className="container-fluid Backdrop">
          <div className="row">

            {/* Breadcrubms */}
            <section className="Breadcrumb_Section">
              <Link className='Bread_Link' to="/">Home</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>

              <Link className='Bread_Link' to="/courses">Courses</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>

              <span className='Course_Name'>{course.title?.[i18n.language] || course.title?.en}</span>
            </section>

            {/* Left Side   */}
              <div className="col-md-6 Thumbnail_Banner">
                {/* Couse Thumbnail  */}
                  <img
                      src={course.thumbnail || "/images/default-thumbnail.jpg"}
                      alt="Course Thumbnail"  
                  />
              </div>

            {/* Right Side  */}
            <div className="col-md-6 Thumbnail_Data">

              {/* Course title */}
              <h2  className='Course_Title'>  {course.title?.[i18n.language] || course.title?.en} </h2>
              
              {/* Categgory Pill */}
              <span className="Category_Pill">
                  {course.category?.name?.[i18n.language] ??
                    course.category?.name?.en}
              </span>
                
              {/* rating and enrollment count */}
              <div className="Course_Data_Icons">
                <div>
                  <div className="Data_Set">
                    <FontAwesomeIcon icon={faFolderTree} className='Icon'/> 
                     <span className='d-none d-md-inline-flex'>{(course.subcategory?.name?.[i18n.language] ??
                      course.subcategory?.name?.en) || 'General'}  </span> 
                    <div className="Body d-flex d-md-none">
                      <span>{(course.subcategory?.name?.[i18n.language] ??
                      course.subcategory?.name?.en) || 'General'}  </span>                       <small> Subcategory</small>
                    </div>
                  </div>

                  <div className="Data_Set">
                    <FontAwesomeIcon icon={faUserTie} className='Icon'/>
                    <span className='d-none d-md-inline-flex'>{course.teacher?.name || 'Jigaysa Instructor'} </span> 
                    <div className="Body d-flex d-md-none">
                      <span>{course.teacher?.name || 'Jigaysa Instructor'} </span>                       
                      <small> Instructor</small>
                    </div>
                  </div>
                </div>

                <div>

                  <div className="Data_Set">
                    <FontAwesomeIcon icon={faStar} className='Icon' /> 
                    <span className='d-none d-md-inline-flex'>5 (100 reviews) </span> 
                      <div className="Body d-flex d-md-none">
                        <span>5 (100 reviews) </span>                       
                        <small> Rating</small>
                      </div>
                  </div>
                  
                  <div className="Data_Set">
                    <FontAwesomeIcon icon={faUsers} className='Icon'/>
                    <span className='d-none d-md-inline-flex'>1200 Student enrolled</span> 
                      <div className="Body d-flex d-md-none">
                        <span>1200 students </span>                       
                        <small> Enrolled</small>
                      </div>
                  </div>              

                </div>
              </div>

                {/* Description  */}
                <p className='Course_Description'> {course.description?.[i18n.language] || course.description?.en}</p>

                {/* Hero Badges */}
                <div className="Hero_Badges d-none d-md-grid">

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faPlayCircle} />
                    </div>
                    <div className="Badge_Body">
                    <p>{course.lessons_count || 0} Lessons</p><small>Lectures</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faArrowTrendUp}/>
                    </div>
                    <div className="Badge_Body">
                      <p>{course.difficulty_level || "All Levels"}</p><small>Level</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faLanguage} /> 
                    </div>
                    <div className="Badge_Body">
                    <p>{course?.language}</p><small>Language</small>
                    </div>
                  </div>

                </div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Course-Details */}
      <section className="Course_Details">
        <div className="row">

          {/* Left Side Content */}
          <div className="col-md-8 col-lg-8 Left_Side_Card">

            {/* Overview Card For Mobile*/}
            <div className="Mobile_Overview_Card card d-block d-sm-none">

              <div className="Price_Section d-flex">
                {/* PRICE */}
                <div className="Price_Header">

                  <h3 className="Final_Price">
                    {price ? `₹${price}.00` : "Free"}
                  </h3>

                  {price > 0 ? (
                    <div className="Price_Row">

                      <span className="Old_Price">
                        ₹{originalPrice}.00
                      </span>

                      <span className="Discount_Badge">
                        {discount}% OFF
                      </span>

                    </div>
                  ):(
                    <span className="Free_Badge">
                        100% FREE
                    </span>
                    )
                  }

                </div>

                {/* BUTTONS */}
                <div className="Sidebar_Button">
                  <button className="Enroll_Button">
                    Enroll Now
                  </button>
                  <button className="Wishlist_Button" disabled>
                  <FontAwesomeIcon icon={faHeart} className='text-danger'/> Wishlist
                </button>
                </div>
              </div>

                <hr />

                {/* Hero Badges */}
                <div className="Hero_Badges">

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faClockFour}/>
                    </div>
                    <div className="Badge_Body">
                      <p>{formatCourseDuration(course.total_duration)}</p><small>Duration</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faPlayCircle} />
                    </div>
                    <div className="Badge_Body">
                    <p>{course.lessons_count || 0}</p><small>Lectures</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faFile}/>
                    </div>
                    <div className="Badge_Body">
                      <p>Yes</p><small>Materials</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faLanguage}/>
                    </div>
                    <div className="Badge_Body">
                      <p>{languageLabel}</p><small>Language</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faLayerGroup}/>
                    </div>
                    <div className="Badge_Body">
                      <p>{course.difficulty_level || "All Levels"}</p><small>Level</small>
                    </div>
                  </div>

                  <div className="Badge_Item">
                    <div className="Badge_Icon">
                    <FontAwesomeIcon icon={faStopwatch} /> 
                    </div>
                    <div className="Badge_Body">
                    <p>Lifetime</p><small>Access</small>
                    </div>
                  </div>

                </div>

            </div>

            {/* About Course Accoden Style For Mobile */}
            <div className="d-block d-sm-none">

              <Accordion
              defaultActiveKey="0"
              className="Course_Accordion mt-4"
              >

                <h4>Everything About <span>Course</span></h4>
                <p className='text-muted'>Know more details about course</p>

              {/* What You'll Learn */}

              <Accordion.Item eventKey="0">

                <Accordion.Header> What You'll Learn</Accordion.Header>

                <Accordion.Body>

                  <div className="Highlights_Section">

                    {
                        highlights.length > 0 ? (

                          highlights.map((item,index)=>(
                              <div
                                  className="Highlight_Items"
                                  key={index}
                              >
                                  <FontAwesomeIcon
                                      icon={faCheck}
                                      className="Check_Icon"
                                  />

                                  <span>{item}</span>

                              </div>
                          ))

                        ) : (

                            <small className='fw-bold text-success'>
                                Course highlights will be added soon.
                            </small>
                        )
                    }

                  </div>

                </Accordion.Body>

              </Accordion.Item>

              {/* ABOUT */}

              <Accordion.Item eventKey="1">

                <Accordion.Header> About Course </Accordion.Header>

                <Accordion.Body>

                  <div className="About_Course_Section">

                    <p className={showMore ? "expanded" : ""}
                       style={{whiteSpace:'pre-line'}}
                    >

                    {course.description?.[i18n.language] ||
                    course.description?.en}

                    </p>

                    {(course.description?.en?.length > 150 ||
                    course.description?.hi?.length > 150) && (

                    <button
                    className="Read_More_Button"
                    onClick={()=>setShowMore(!showMore)}
                    >

                    {showMore ? "Read Less" : "Read More"}

                    </button>

                    )}

                  </div>

                </Accordion.Body>

              </Accordion.Item>

              {/* Instructor */}

              <Accordion.Item eventKey="2">

                <Accordion.Header> About Instructor </Accordion.Header>

                <Accordion.Body>

                  <div className="Instructor_Section">

                    <div className="Teacher_Profile">

                      <img
                        src={course.teacher?.profile_pic || "/default-course.png"}
                        className="Teacher_Img"
                        alt={course.teacher?.name}
                      />

                      <h3 className="Teacher_Name">
                        {course.teacher?.name}
                      </h3>

                      <p className="Teacher_Title">
                        {course.teacher?.professional_title || "Instructor"}
                      </p>

                      {(course.teacher?.overall_rating || course.teacher?.total_students) && (
                        <div className="Teacher_Stats">

                          {course.teacher?.overall_rating && (
                            <div className="Stat_Box">
                              ⭐ {course.teacher.overall_rating}
                            </div>
                          )}

                          {course.teacher?.total_students > 0 && (
                            <div className="Stat_Box">
                              👨‍🎓 {course.teacher.total_students} Students
                            </div>
                          )}

                        </div>
                      )}


                    </div>

                    <div className="Teacher_About">

                      <h5>About Instructor</h5>

                      <p>
                        {
                          course.teacher?.bio ||
                          "Instructor information will be available soon."
                        }
                      </p>

                    </div>

                  </div>

                </Accordion.Body>

              </Accordion.Item>

              </Accordion>

            </div>

            {/* Tabs Content For Tablets */}
            <div className="d-sm-block d-none">
              <div className="course-tabs-card card shadow border-1 mt-4">

                <Tabs defaultActiveKey="Overview" id="fill-tab-example" className="tabs mb-3 " fill>
                  
                  {/* Overview Tab  */}
                  <Tab eventKey="Overview"
                    title={
                      <> <FontAwesomeIcon icon={faFileLines} className="me-2" />
                        Overview
                      </>
                    }
                  >
                    <div className="About_Course_Section">
                      <h5>About This <span>Course</span> </h5>
                        <p className={showMore ? "expanded" : ""}
                           style={{whiteSpace:'pre-line'}}                        >
                          {course.description?.[i18n.language] || course.description?.en}
                        </p>
                        {
                        (course.description?.en?.length > 150 ||
                        course.description?.hi?.length > 150)
                        && (
                          <button
                            className="Read_More_Button"
                            onClick={() =>
                              setShowMore(!showMore)
                            }
                          >
                            {showMore
                              ? (<>Read Less <FontAwesomeIcon icon={faAngleUp} /></> )
                              : (<>Read More <FontAwesomeIcon icon={faAngleDown} /></> )
                              }
                          </button>
                        )
                        }
                    </div>

                    <hr/>

                    <div className="Highlights_Section">

                      <h5>What <span>You'll Learn</span></h5>

                      {
                          highlights.length > 0 ? (

                              <div className="Highlights_Grid">

                                  <div className="Highlight_Column">

                                      {leftHighlights.map((item,index)=>(
                                          <div
                                              className="Highlight_Items"
                                              key={index}
                                          >
                                              <FontAwesomeIcon
                                                  icon={faCheck}
                                                  className="Check_Icon"
                                              />

                                              <span>{item}</span>

                                          </div>
                                      ))}

                                  </div>

                                  <div className="Highlight_Column">

                                      {rightHighlights.map((item,index)=>(
                                          <div
                                              className="Highlight_Items"
                                              key={index}
                                          >
                                              <FontAwesomeIcon
                                                  icon={faCheck}
                                                  className="Check_Icon"
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
                  </Tab>

                  {/* Instructer Tab  */}
                  <Tab
                    eventKey="Instructor"
                    title={
                      <>
                        <FontAwesomeIcon
                          icon={faChalkboardTeacher}
                          className="me-2"
                        />
                        Instructor
                      </>
                    }
                  >
                    <div className="Instructor_Section">

                      <div className="Teacher_Profile">

                        <img
                          src={course.teacher?.profile_pic || "/default-course.png"}
                          className="Teacher_Img"
                          alt={course.teacher?.name}
                        />

                        <h3 className="Teacher_Name">
                          {course.teacher?.name}
                        </h3>

                        <p className="Teacher_Title">
                          {course.teacher?.professional_title || "Instructor"}
                        </p>

                        {(course.teacher?.overall_rating || course.teacher?.total_students) && (
                          <div className="Teacher_Stats">

                            {course.teacher?.overall_rating && (
                              <div className="Stat_Box">
                                ⭐ {course.teacher.overall_rating}
                              </div>
                            )}

                            {course.teacher?.total_students > 0 && (
                              <div className="Stat_Box">
                                👨‍🎓 {course.teacher.total_students} Students
                              </div>
                            )}

                          </div>
                        )}


                      </div>

                      <div className="Teacher_About">

                        <h5>About Instructor</h5>

                        <p>
                          {
                            course.teacher?.bio ||
                            "Instructor information will be available soon."
                          }
                        </p>

                      </div>

                    </div>
                  </Tab>

                  {/* Review Tab */}
                  <Tab eventKey="Reviews" title={
                      <>
                        <FontAwesomeIcon icon={faStar} className="me-2" />
                        Reviews
                      </>
                    } disabled>
                    Tab content for Contact
                  </Tab>

                </Tabs>

              </div>
            </div>

            {/* Curriculum Tab  */}
            <div className="card shadow Curriculum_Section ">              
              {
                course.lessons?.length > 0 ? (
                  <CourseCurriculum
                    modules={course.modules}
                    lessonsCount={course.lessons_count}
                    course={course}
                  />
                ) : (
                  <div className="Empty_Curriculum text-center">
                    <h4>Course <span>Curriculum </span></h4>
                    <img src={no_lesson} alt="No Lesson Found" />


                    <h5>Curriculum Coming <span>Soon</span></h5>
                    <p> Lessons are being <span>prepared</span>. Please check back <span>later</span> .</p>
                </div>
                )
              }
            </div>
              
            {/* FAQ Section */}
            <div className="faq-section m-2">

              <FaqSection 
                faqs={courseFaqs}
                subtitle="Find answers to the most common questions about this course."
              />

            </div>
          </div>

          {/* Right Side Content */}
          <div className="col-md-4 col-lg-4 Right-Side-Card">

            {/* SHARE CARD Desktop */}
            <div className="Share_Course_Section card border-0 d-none d-md-flex">
              <Share_Course_Card_Ui shareUrl={shareUrl} />
            </div>

            {/* Course Price, Overview Card Right for  Desktop */}
            <div className="Overview_Card card border-1 w-100 shadow mt-4 d-none d-md-flex">

                  <h5 className="Overview_Title">
                    Course <span>Overview</span>  
                  </h5>

                  <hr />

                  {/* PRICE */}
                  <div className="Price_Header">

                    <h3 className="Final_Price">
                        {price ? `₹${price}.00` : "Free"}
                    </h3>

                    {price > 0 ? (
                      <div className="Price_Row">

                        <span className="Old_Price">
                          ₹{originalPrice}.00
                        </span>

                        <span className="Discount_Badge">
                          {discount}% OFF
                        </span>

                      </div>
                    ):(
                      <span className="Free_Badge">
                          100% FREE
                      </span>
                      )
                    }

                  </div>

                  {/* BUTTONS */}
                  <div className="Sidebar_Button">
                    <button className="Enroll_Button">
                      Enroll Now 
                    </button>

                    <button className="Wishlist_Button" disabled>
                      <FontAwesomeIcon icon={faHeart} className='text-danger'/> Wishlist
                    </button>
                  </div>

                  <hr />

                  {/* DETAILS */}
                  <div className="Overview_List">

                    <div className="Overview_Item">
                      <div className="Left_Side">
                          <FontAwesomeIcon icon={faPlayCircle} className='Item_Icon'/>
                          <div className="Item_Body">
                            <strong>Total Lectures</strong>
                            <small className='text-muted'>Structured Video Lessons </small>
                          </div>
                      </div>
                      <div className="Right_Side ">
                        <strong>{course.lessons_count || 0} </strong>
                         <small className='text-muted'>Lecture{course.lessons_count === 1 ? "" : "s"}</small>
                      </div>
                    </div>

                    <div className="Overview_Item">
                      <div className="Left_Side">
                          <FontAwesomeIcon icon={faClock} className='Item_Icon'/>
                          <div className="Item_Body">
                            <strong>Total Duration</strong>
                            <small className='text-muted'>Learn at your own pace</small>
                          </div>
                      </div>
                      <div className="Right_Side ">
                        <strong>{formatCourseDuration(course.total_duration)} </strong>
                         <small className='text-muted'>Duration</small>
                      </div>
                    </div>

                    <div className="Overview_Item">
                      <div className="Left_Side">
                          <FontAwesomeIcon icon={faFileLines} className='Item_Icon'/>
                          <div className="Item_Body">
                            <strong>Study Materials</strong>
                            <small className='text-muted'>Notes,PDFs, and More</small>
                          </div>
                      </div>
                      <div className="Right_Side ">
                        <strong>{hasMaterials ? "Yes" : "Not"} </strong>
                         <small className='text-muted'>Available</small>
                      </div>
                    </div>

                    <div className="Overview_Item">
                      <div className="Left_Side">
                          <FontAwesomeIcon icon={faLanguage} className='Item_Icon'/>
                          <div className="Item_Body">
                            <strong>Language</strong>
                            <small className='text-muted'>Availbale in Multiple Language</small>
                          </div>
                      </div>
                      <div className="Right_Side ">
                        <strong>{languageLabel}  </strong>
                         <small className='text-muted'>Language</small>
                      </div>
                    </div>

                    <div className="Overview_Item">
                      <div className="Left_Side">
                          <FontAwesomeIcon icon={faLayerGroup} className='Item_Icon'/>
                          <div className="Item_Body">
                            <strong>Course Level</strong>
                            <small className='text-muted'>Suitable For You</small>
                          </div>
                      </div>
                      <div className="Right_Side ">
                        <strong>{difficultyLabel}  </strong>
                         <small className='text-muted'>Level</small>
                      </div>
                    </div>

                    <div className="Overview_Item">
                      <div className="Left_Side">
                          <FontAwesomeIcon icon={faStopwatch} className='Item_Icon'/>
                          <div className="Item_Body">
                            <strong>Access</strong>
                            <small className='text-muted'>Learn anytime, anywhere</small>
                          </div>
                      </div>
                      <div className="Right_Side ">
                        <strong> Lifetime </strong>
                         <small className='text-muted'>Access</small>
                      </div>
                    </div>

                  </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHARE CARD Mobile */}
      <div className="Share_Card_Mobile m-4 text-center mt-0 card border-0 d-block d-sm-none ">
          <Share_Course_Card_Ui shareUrl={shareUrl} />
      </div>

      {/* Similar Courses */}
      <section className="Similar_Courses_Section">
          {similarCourses?.length > 0 && (
            <>
              <div className="Section_Header">

                  <div className='Header_Title'>
                      <h3>
                          Similar <span>Courses</span>
                      </h3>

                      <p>
                          Explore more courses you might be <span>interested in.</span>
                      </p>

                  </div>

                  <div className="Header_Link">
                    <Link
                        to={PUBLIC_ROUTES.COURSES}
                        className="Primary_Button"
                    >
                      View All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>

              </div>

              {/* Similar Course Card  */}
              {/* Desktop / Tablet Grid */}
              <div className="Similar_Courses_Grid d-none d-md-grid">

                  {similarCourses.slice(0, 4).map((item) => (
                      <CourseCardUi
                          key={item.id}
                          course={item}
                      />
                  ))}

              </div>

              {/* Mobile Swiper */}
              <Swiper
                  className="Similar_Courses_Swiper d-md-none"
                  spaceBetween={16}
                  slidesPerView={1.15}
              >

                  {similarCourses.slice(0, 4).map((item) => (
                      <SwiperSlide key={item.id}>
                          <CourseCardUi course={item} />
                      </SwiperSlide>
                  ))}

              </Swiper>
            </>
          )}

      </section>

      {/* Footer  */}
      <FooterUi/>
    </>
  )
}

export default ViewCourseUi