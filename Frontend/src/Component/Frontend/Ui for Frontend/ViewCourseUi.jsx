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
import { faAngleDown, faAngleRight, faAngleUp, faArrowRight, faArrowTrendUp, faAward, faBook, faBookOpen, faCertificate, faChalkboardTeacher, faCheck, faCircleCheck, faClipboardCheck, faClock, faDesktop, faGlobe, faHeart, faHouseLaptop, faLanguage, faLayerGroup, faLevelUp, faLink, faListCheck, faMobileButton, faShieldHalved, faStar, faStopwatch, faTv, faUserGroup, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faCirclePlay, faClockFour, faFile, faFileLines, faPaperPlane, faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import InfoItemUi from '../../Common/CommonUI/InfoItemUi';
import CourseCurriculum from '../../backend/courses/CourseCurriculum';
import { faFacebookF, faQuora, faTelegram, faTelegramPlane, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import CourseFaqs from '../../backend/courses/CourseFaqs';
import bgImage from '../../../assets/images/herobg6.png'
import no_lesson from '../../../assets/images/not-found2.jpeg'
import { Accordion } from 'react-bootstrap';


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
    Both: "English / Hindi",
    English: "English",
    Hindi: "Hindi"
  }[course?.language] || course?.language;

  //  Difficulty Level
  const difficultyLabel = {
    Beginner: "Beginner",
    Intermediate: "Intermediate",
    Advanced: "Advanced",
    "All Levels": "Suitable for All"
  }[course?.difficulty_level] || course?.difficulty_level;


  // Highlights Logic
  const mid = Math.ceil(highlights.length / 2);
  const leftHighlights = highlights.slice(0, mid);
  const rightHighlights = highlights.slice(mid);

  // Similar courses
  const [similarCourses, setSimilarCourses] = useState([]);

  if (loading) return <p className="text-center my-5">Loading course...</p>;
  if (!course) return <p className="text-center my-5">Course not found!</p>;
  return (
    <>
    {/* Header  */}
    <HeaderUi/>

    {/* Course-View-Hero  */}
   <section className="Course-View-Hero">
    <div className="container-fluid">
      <div className="row">
        {/* Breadcrubms */}
        <section className="breadcrumb-section">
          <Link className='bread-link' to="/">Home</Link>
          <span><FontAwesomeIcon icon={faAngleRight}/></span>

          <Link className='bread-link' to="/courses">Courses</Link>
          <span><FontAwesomeIcon icon={faAngleRight}/></span>

          <span className='course-name'>{course.title?.[i18n.language] || course.title?.en}</span>
        </section>

        {/* Left Side   */}
          <div className="col-md-6 text-center thumbnail-banner">
            {/* Couse Thumbnail  */}
              <img
                  src={course.thumbnail || "/images/default-thumbnail.jpg"}
                  alt="Course Thumbnail"  />
          </div>

        {/* Right Side  */}
        <div className="col-md-6 thumbnail-data">

          {/* Course title */}
          <h2  className='course-title'>  {course.title?.[i18n.language] || course.title?.en} </h2>
          
          {/* Categgory Pill */}
          <span className="category-pill">
              {course.category?.name?.[i18n.language] ??
                course.category?.name?.en}
          </span>
            
          {/* rating and enrollment count */}
          <div className="rating-enrollcount d-flex">
            <div className="icon">
            <FontAwesomeIcon icon={faStar} /> <span>5 (100 reviews)</span> 
            </div>
            <div className="icon">
            <FontAwesomeIcon icon={faUsers}/><span> 1200 students enrolled </span>
            </div>
          </div>

            {/* Description  */}
            <p className='course-description'> {course.description?.[i18n.language] || course.description?.en}</p>

            {/* Hero Badges */}
            <div className="hero-badges d-none d-md-grid">

              <div className="badge-item">
                <div className="icon">
                <FontAwesomeIcon icon={faPlayCircle} />
                </div>
                <div className="body">
                 <p>{course.lessons_count || 0} Lessons</p><small>Lectures</small>
                </div>
              </div>

              <div className="badge-item">
                <div className="icon">
                <FontAwesomeIcon icon={faArrowTrendUp}/>
                </div>
                <div className="body">
                  <p>{course.difficulty_level || "All Levels"}</p><small>Level</small>
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

            </div>
        </div>
      </div>
    </div>
    
   </section>

    {/* Course-Details */}
    <section className="Course-Details">
      <div className="row">

        {/* Left Side  */}
        <div className="col-md-8 col-lg-8 Left-Side-Card">

          {/* Mobile Price Card */}
          <div className="mobile-view card d-none mt-4">
            <div className="mobile-price d-flex">
              {/* PRICE */}
              <div className="price-section ">

                <h3 className="final-price">
                  {price ? `₹${price}.00` : "Free"}
                </h3>

                {price > 0 ? (
                  <div className="price-row">

                    <span className="old-price">
                      ₹{originalPrice}.00
                    </span>

                    <span className="discount-badge">
                      {discount}% OFF
                    </span>

                  </div>
                ):(
                  <span className="free-badge">
                      100% FREE
                  </span>
                  )
                }

              </div>

              {/* BUTTONS */}
              <div className="sidebar-button">
                <button className="enroll-btn">
                  Enroll Now
                </button>
                <button className="wishlist-btn" disabled>
                <FontAwesomeIcon icon={faHeart} className='text-danger'/> Wishlist
              </button>
              </div>
            </div>

                <hr />

              {/* Hero Badges */}
              <div className="hero-badges">


                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faClockFour}/>
                  </div>
                  <div className="body">
                    <p>10 Hour</p><small>Duration</small>
                  </div>
                </div>

                                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faPlayCircle} />
                  </div>
                  <div className="body">
                  <p>{course.lessons_count || 0}</p><small>Lectures</small>
                  </div>
                </div>

                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faFile}/>
                  </div>
                  <div className="body">
                    <p>Yes</p><small>Materials</small>
                  </div>
                </div>

                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faLanguage}/>
                  </div>
                  <div className="body">
                    <p>{languageLabel}</p><small>Language</small>
                  </div>
                </div>

                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faLayerGroup}/>
                  </div>
                  <div className="body">
                    <p>{course.difficulty_level || "All Levels"}</p><small>Level</small>
                  </div>
                </div>

                <div className="badge-item">
                  <div className="icon">
                  <FontAwesomeIcon icon={faStopwatch} /> 
                  </div>
                  <div className="body">
                  <p>Lifetime</p><small>Access</small>
                  </div>
                </div>

              </div>

          </div>

           <br />
          {/* About Course Accoden For Mobile */}
          <div className="d-block d-sm-none">

            <Accordion
            defaultActiveKey="0"
            className="course-accordion mt-4"
            >

              <h4 className='accorden-title'>Everything About <span>Course</span></h4>
              <p className='accorden-sub-title'>know more  details about course</p>

            {/* Whhat You'll Learn */}

            <Accordion.Item eventKey="0">

              <Accordion.Header> What You'll Learn</Accordion.Header>

              <Accordion.Body>

                <div className="tab-body-learn">

                  {
                      highlights.length > 0 ? (

                        highlights.map((item,index)=>(
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
                        ))

                      ) : (

                          <small className='text-success fw-bold'>
                              Course highlights will be coming soon.
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

                <div className="tab-body-about">

                  <p className={showMore ? "expanded" : ""}>

                  {course.description?.[i18n.language] ||
                  course.description?.en}

                  </p>

                  {(course.description?.en?.length > 150 ||
                  course.description?.hi?.length > 150) && (

                  <button
                  className="read-more-btn"
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

                <div className="instructor-tab-body">

                  <div className="teacher-profile">

                    <img
                      src={course.teacher?.profile_pic || "/default-course.png"}
                      className="teacher-img"
                      alt={course.teacher?.name}
                    />

                    <h3 className="teacher-name">
                      {course.teacher?.name}
                    </h3>

                    <p className="teacher-title">
                      {course.teacher?.professional_title || "Instructor"}
                    </p>

                    {(course.teacher?.overall_rating || course.teacher?.total_students) && (
                      <div className="teacher-stats">

                        {course.teacher?.overall_rating && (
                          <div className="stat-box">
                            ⭐ {course.teacher.overall_rating}
                          </div>
                        )}

                        {course.teacher?.total_students > 0 && (
                          <div className="stat-box">
                            👨‍🎓 {course.teacher.total_students} Students
                          </div>
                        )}

                      </div>
                    )}


                  </div>

                  <div className="teacher-about">

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

          {/* Tabs and content For tablets */}
          <div className="d-sm-block d-none">
            <div className="course-tabs-card card shadow border-1">

              <Tabs defaultActiveKey="Overview" id="fill-tab-example" className="tabs mb-3 " fill>
                
                {/* Overview Tab  */}
                <Tab eventKey="Overview"
                  title={
                    <> <FontAwesomeIcon icon={faFileLines} className="me-2" />
                      Overview
                    </>
                  }
                >
                  <div className="tab-body-about">
                    <h5>About This <span>Course</span> </h5>
                      <p className={showMore ? "expanded" : ""}>
                        {course.description?.[i18n.language] || course.description?.en}
                      </p>
                      {
                      (course.description?.en?.length > 150 ||
                      course.description?.hi?.length > 150)
                      && (
                        <button
                          className="read-more-btn"
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

                  <hr className='overview-divider'/>

                  <div className="tab-body-learn">

                    <h5>What <span>You'll Learn</span></h5>

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
                  <div className="instructor-tab-body">

                    <div className="teacher-profile">

                      <img
                        src={course.teacher?.profile_pic || "/default-course.png"}
                        className="teacher-img"
                        alt={course.teacher?.name}
                      />

                      <h3 className="teacher-name">
                        {course.teacher?.name}
                      </h3>

                      <p className="teacher-title">
                        {course.teacher?.professional_title || "Instructor"}
                      </p>

                      {(course.teacher?.overall_rating || course.teacher?.total_students) && (
                        <div className="teacher-stats">

                          {course.teacher?.overall_rating && (
                            <div className="stat-box">
                              ⭐ {course.teacher.overall_rating}
                            </div>
                          )}

                          {course.teacher?.total_students > 0 && (
                            <div className="stat-box">
                              👨‍🎓 {course.teacher.total_students} Students
                            </div>
                          )}

                        </div>
                      )}


                    </div>

                    <div className="teacher-about">

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

                <Tab eventKey="Reviews" title={
                    <>
                      <FontAwesomeIcon icon={faStar} className="me-2" />
                      Reviews
                    </>
                  } disabled>
                  Tab content for Contact
                </Tab>

                {/* Faq Tab */}
                {/* <Tab eventKey="FAQs" title={
                    <>
                      <FontAwesomeIcon icon={faQuora} className="me-2" />
                      FAQs
                    </>
                  }>
                <div className="related-course-card">
                  <CourseFaqs
                    faqs={courseFaqs}
                  />
                </div>
                </Tab> */}
              </Tabs>

            </div>
          </div>

          {/* Curriculum Tab  */}
          <div classsname="Curriculum-Section">
            <div className="card shadow h-100 curiculum  d-none d-sm-block">              
              {
                course.lessons?.length > 0 ? (
                  <CourseCurriculum
                  modules={course.modules}
                  lessonsCount={course.lessons_count}
                  />
                ) : (
                  <div className="empty-curriculum text-center">
                    <h4>Course <span>Curriculum </span></h4>
                    <img src={no_lesson} alt="No Lesson Found" />


                    <h5>Curriculum Coming <span>Soon</span></h5>
                    <p> Lessons are being <span>prepared</span>. Please check back <span>later</span> .</p>
                </div>
                )
              }
            </div>
            
          </div>

          {/* FAQ Section */}
          <div className="faq-section m-2">

            <CourseFaqs faqs={courseFaqs}/>

          </div>
        </div>

        <div className="col-md-4 col-lg-4 Right-Side-Card">

            {/* SHARE CARD */}
            <div className="share-course-card text-center card border-1 shadow mt-4 d-none d-md-flex">

              <h5 className=''> <span>Share</span> This Course</h5>

              <p>Share with Friends and Classmates</p>

              <div className="social-icons m-auto">

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  >
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>

                
                <a
                  href={`https://wa.me/?text=${shareUrl}`}
                  target="_blank"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>

                <a
                  href={`https://t.me/share/url?url=${shareUrl}`}
                  target="_blank"
                  >
                  <FontAwesomeIcon icon={faTelegramPlane} />
                </a>

                <a
                  href="#"
                  onClick={(e)=>{
                    e.preventDefault();
                    navigator.clipboard.writeText(
                      shareUrl
                    );
                    toast.success(
                      "Link copied!"
                    );
                  }}
                  >
                  <FontAwesomeIcon icon={faLink} />
                </a>

              </div>

            </div>

            {/* Course Price Card Right */}
            <div className="overview-card card border-1 shadow mt-4 d-none d-md-flex">

                  <h5 className="sidebar-title">
                    Course <span>Overview</span>  
                  </h5>
    <hr />
                  {/* PRICE */}
                  <div className="price-section">

                    <h3 className="final-price">
                      {price ? `₹${price}.00` : "Free"}
                    </h3>

                    {price > 0 ? (
                      <div className="price-row">

                        <span className="old-price">
                          ₹{originalPrice}.00
                        </span>

                        <span className="discount-badge">
                          {discount}% OFF
                        </span>

                      </div>
                    ):(
                      <span className="free-badge">
                          100% FREE
                      </span>
                      )
                    }

                  </div>

                  {/* <hr /> */}
                  {/* BUTTONS */}
                  <div className="sidebar-button">
                  <button className="enroll-btn">
                    Enroll Now
                  </button>

                  <button className="wishlist-btn" disabled>
                    <FontAwesomeIcon icon={faHeart} className='text-danger'/> Wishlist
                  </button>
                  </div>
                  <hr />

                  {/* DETAILS */}
                  <div className="overview-list">

                    <div className="overview-item">
                      <div className="left">
                        <FontAwesomeIcon icon={faCirclePlay } className="icon" />
                        {/* <span>Lectures</span> */}
                      <strong>{course.lessons_count || 0} Lectures</strong>
                      </div>

                    </div>

                    <div className="overview-item">
                      <div className="left">
                        <FontAwesomeIcon icon={faClock} className="icon" />
                        {/* <span>Duration</span> */}
                      <strong>10 Hours Duration</strong>
                      </div>

                    </div>

                  

                    <div className="overview-item">
                      <div className="left">
                        <FontAwesomeIcon icon={faFileLines} className="icon" />
                        {/* <span>Materials</span> */}
                      <strong>Materials Available</strong>
                      </div>

                    </div>

                    <div className="overview-item">
                      <div className="left">
                        <FontAwesomeIcon icon={faLanguage} className="icon" />
                        {/* <span>Language</span> */}
                    <strong>{languageLabel} Language</strong>
                      </div>
                    </div>

                    <div className="overview-item">
                      <div className="left">
                        <FontAwesomeIcon icon={faLayerGroup} className="icon" />
                        {/* <span>Level</span> */}
                      <strong>{difficultyLabel} Level</strong>
                      </div>

                    </div>

                    <div className="overview-item">
                      <div className="left">
                        <FontAwesomeIcon icon={faStopwatch} className="icon" />
                        {/* <span>Access</span> */}
                      <strong>Lifetime Access</strong>
                      </div>

                    </div>

                  </div>



            </div>


        </div>
      </div>
    </section>

    {/* Tabs and content For tablets */}
    <div className="d-none">
      <div className="course-tabs-card card shadow border-1 mt-4">

        <Tabs
          defaultActiveKey="Overview"
          id="fill-tab-example"
          className="tabs mb-3 "
          fill
        >
          {/* Overview Tab  */}
          <Tab
            eventKey="Overview"
            title={
              <>
                <FontAwesomeIcon icon={faFileLines} className="me-2" />
                Overview
              </>
            }
          >
            <div className="tab-body-about">
              <h5>About This <span>Course</span> </h5>
                <p className={showMore ? "expanded" : ""}>
                  {course.description?.[i18n.language] || course.description?.en}
                </p>
                {
                (course.description?.en?.length > 150 ||
                course.description?.hi?.length > 150)
                && (
                  <button
                    className="read-more-btn"
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
            <div className="instructor-tab-body">

              <div className="teacher-profile">

                <img
                  src={course.teacher?.profile_pic || "/default-course.png"}
                  className="teacher-img"
                  alt={course.teacher?.name}
                />

                <h3 className="teacher-name">
                  {course.teacher?.name}
                </h3>

                <p className="teacher-title">
                  {course.teacher?.professional_title || "Instructor"}
                </p>

                {(course.teacher?.overall_rating || course.teacher?.total_students) && (
                  <div className="teacher-stats">

                    {course.teacher?.overall_rating && (
                      <div className="stat-box">
                        ⭐ {course.teacher.overall_rating}
                      </div>
                    )}

                    {course.teacher?.total_students > 0 && (
                      <div className="stat-box">
                        👨‍🎓 {course.teacher.total_students} Students
                      </div>
                    )}

                  </div>
                )}


              </div>

              <div className="teacher-about">

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

          <Tab eventKey="Reviews" title={
              <>
                <FontAwesomeIcon icon={faStar} className="me-2" />
                Reviews
              </>
            } disabled>
            Tab content for Contact
          </Tab>

          {/* Faq Tab */}
          <Tab eventKey="FAQs" title={
              <>
                <FontAwesomeIcon icon={faQuora} className="me-2" />
                FAQs
              </>
            }>
          <div className="related-course-card">
            <CourseFaqs
              faqs={courseFaqs}
            />
          </div>
          </Tab>
        </Tabs>

      </div>
    </div>


    {/* Curriculum Tab  */}
    {/* <div classsname="Curriculum-Section">
      <div className="card shadow h-100 curiculum  d-sm-block d-none d-lg-none d-md-none ">              
        <h4>Course <span>Curriculum </span></h4>
        {
          course.lessons?.length > 0 ? (
            <CourseCurriculum
              modules={course.modules}
              lessonsCount={course.lessons_count}
            />
          ) : (
            <div className="empty-curriculum text-center">
              <img src={no_lesson} alt="No Lesson Found" />


              <h5>Curriculum Coming <span>Soon</span></h5>
              <p> Lessons are being <span>prepared</span>. Please check back <span>later</span> .</p>
          </div>
          )
        }
      </div>
      
    </div> */}

    {/* FAQ Section */}
    {/* <div className="faq-section m-4 p-2">

      <CourseFaqs faqs={courseFaqs}/>

    </div> */}

    {/* SHARE CARD Mobile */}
    <div className="share-card-mobile m-4  mt-0  d-none d-sm-block d-md-none d-lg-none d-xl-none">
      <div className="share-course-card text-center card border-1 shadow mt-2 ">

        <h5 className=''> <span>Share</span> This Course</h5>

        <p>Share with <span>Friends</span> and <span>Classmates</span></p>

        <div className="social-icons m-auto">

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>

          
          <a
            href={`https://wa.me/?text=${shareUrl}`}
            target="_blank"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>

          <a
            href={`https://t.me/share/url?url=${shareUrl}`}
            target="_blank"
            >
            <FontAwesomeIcon icon={faTelegramPlane} />
          </a>

          <a
            href="#"
            onClick={(e)=>{
              e.preventDefault();
              navigator.clipboard.writeText(
                shareUrl
              );
              toast.success(
                "Link copied!"
              );
            }}
            >
            <FontAwesomeIcon icon={faLink} />
          </a>

        </div>

      </div>
    </div>

    {/* Similar Courses */}
    <section className="similar-courses mt-1">

        <div className="section-header ">

            <div>
                <h3>
                    Similar <span>Courses</span>
                </h3>

                <p>
                    Explore more courses you might be <span>interested in.</span> 
                </p>

              <Link to="/courses" className="view-all-btn">
                  View All <FontAwesomeIcon icon={faArrowRight}/>
              </Link>
            </div>


        </div>

        {/* Card Logic */}
      <div className="Latest_Course_Section">

      <div className="row g-4">

        {similarCourses?.slice(0,4).map((item)=>(

            <div className="col-12 col-sm-6 col-lg-3" key={item.id}>
              <div className="card h-100 course-card">
                
                <img
                  src={item.thumbnail ?? "/default-course.png"}
                  className="course-img"
                  alt={item.title?.en}
                />

                  <div className="card-header">
                    <h6 className="course-title">
                    {item.title?.[i18n.language] ?? item.title?.en}
                  </h6>
                  </div>
                  <div className="container d-flex flex-row">
                    <img
                      src={item.teacher.profile_pic ?? "/default-course.png"}
                      className="teacher-img"
                      alt={item.teacher.profile_pic?.en}
                    />
                    <h6 className="teacher-name">
                      {item.teacher.name}
                    </h6>                                    
                    <div className="ms-auto"> 
                      <Link className='category-button' to="#" >
                        {item.category?.name?.[i18n.language] ??
                          item.category?.name?.en}
                      </Link>
                    </div>
                  </div>

                <div className="card-body d-flex flex-column h-100">
                  

                  {/* <p className="course-desc small flex-grow-1 mb-2">
                    {course.description?.[i18n.language] ??
                      course.description?.en}
                  </p> */}

                  <div className="course-meta">
                    <span>
                      <FontAwesomeIcon icon={faBook} className='icon'/> {item.lessons_count || 0} Lessons
                    </span>

                    {/* Future Data */}
                    <span><FontAwesomeIcon icon={faClock} className='icon'/> 18 Hours</span> <br />
                    {/* <span><FontAwesomeIcon icon={faStar}/> 4.8</span>
                    <span><FontAwesomeIcon icon={faUserGroup}/> 245</span> */}

                  </div>
                  <div className="d-flex card-footer justify-content-between align-items-center price-section">
                    <span className="fw-bold text-success price">
                      {item.price ? `₹${course.price}` : "Free"} 
                    </span>

                    <Link target='_top'
                      to={`/CourseView/${item.id}/${item.title?.en}`}
                      className="view-course-btn"
                    >
                      View Course 
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      </div>

  </section>

    {/* Footer  */}
    <FooterUi/>
    </>
  )
}

export default ViewCourseUi