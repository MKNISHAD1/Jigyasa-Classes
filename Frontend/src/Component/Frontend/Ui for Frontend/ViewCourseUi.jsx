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
import { faAngleRight, faAward, faBookOpen, faCertificate, faChalkboardTeacher, faCircleCheck, faClipboardCheck, faClock, faGlobe, faLanguage, faLayerGroup, faLevelUp, faLink, faListCheck, faMobileButton, faShieldHalved, faStar, faTv, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faClockFour, faFile, faFileLines, faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import InfoItemUi from '../../Common/CommonUI/InfoItemUi';
import CourseCurriculum from '../../backend/courses/CourseCurriculum';
import { faFacebookF, faTelegramPlane, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import CourseFaqs from '../../backend/courses/CourseFaqs';

const ViewCourseUi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqs,setFaqs] = useState([]);
  const [showMore, setShowMore] = useState(false);

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


  if (loading) return <p className="text-center my-5">Loading course...</p>;
  if (!course) return <p className="text-center my-5">Course not found!</p>;
  return (
    <>
    {/* Header  */}
    <HeaderUi/>

    {/* Hero section  */}
    <section className="course-overview-hero-section">
      <div className="container">
        <div className="row">
          <div className="col-md-8">
          <div className="course-details p-3">

            {/* <Link className='category-button p-2' to="#" >
              {course.category?.name?.[i18n.language] ??
                course.category?.name?.en}
            </Link> */}

            <section className="breadcrumb-section">
              <Link className='bread-link' to="/">Home</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>

              <Link className='bread-link' to="/courses">Courses</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>

              <Link className='bread-link' to="/courses/upsc">UPSC</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>

              <span>{course.title?.[i18n.language] || course.title?.en}</span>
            </section>

            {/* Title  */}
            <h4>{course.title?.[i18n.language] || course.title?.en}</h4>

            {/* Description  */}
            <p> {course.description?.[i18n.language] || course.description?.en}</p>

            {/* rating and enrollment count */}
            <div className="rating-enrollcount d-flex pb-3">
              <div className="icon">
              <FontAwesomeIcon icon={faStar} /> 5 (100 reviews)
              </div>
              <div className="icon">
              <FontAwesomeIcon icon={faUsers}/> 1200 students enrolled 
              </div>
              <div className="icon">
              <FontAwesomeIcon icon={faLevelUp}/> Beginner to  Advanced 
              </div>
            </div>

            {/* icons for overwiew if cases */}

            <div className="overview-icons d-flex">
              <div className="ov-icons d-flex">
                <div className="icon ">
                <FontAwesomeIcon icon={faPlayCircle}/> 
                </div>
                <div className="ov-icon-body ">
                  <b>Lectures</b> <br />
                  <p>120+ Hours</p>
                </div>
              </div>
              <div className="ov-icons d-flex">
                <div className="icon">

                <FontAwesomeIcon icon={faAward}/> 
                </div>
                <div className="ov-icon-body ">
                  <b>Certificate</b> <br />
                  <p>Yes</p>
                </div>
              </div>
              <div className="ov-icons d-flex">
                <div className="icon">

                <FontAwesomeIcon icon={faClockFour}/> 
                </div>
                <div className="ov-icon-body ">
                  <b>Duration</b> <br />
                  <p>1 Year</p>
                </div>
              </div>
              <div className="ov-icons d-flex">
                <div className="icon">

                <FontAwesomeIcon icon={faGlobe}/> 
                </div>
                <div className="ov-icon-body ">
                  <b>Language</b> <br />
                  <p>Hindi</p>
                </div>
              </div>

            </div>
            
          </div>
          </div>
          <div className="col-md-4 m-auto">
            <div className="thumbnail-banner">
              {/* Couse Thumbnail  */}
                <img
                    src={course.thumbnail || "/images/default-thumbnail.jpg"}
                    alt="Course Thumbnail"
                    //  style={{ width: "100%", borderRadius: "10px", objectFit: "cover" }}
                  />
            </div>

          </div>
        </div>
      </div>
    </section>

    {/* Tabs and content  */}
    <section className="CourseDetailsPage">

      <div className="container">

        <div className="course-layout">

          {/* LEFT */}
          <div className="course-main">
            
            <div className="course-tabs-card card shadow p-3 border-1 mt-4">

              <Tabs
                defaultActiveKey="Overview"
                id="fill-tab-example"
                className="tabs mb-3 pt-3"
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
                    <h5>About This Course</h5>
                      <p className={showMore ? "expanded" : ""}>
                        {course.description?.[i18n.language] || course.description?.en}
                      </p>
                      <button
                        className="read-more-btn"
                        onClick={() => setShowMore(!showMore)}
                      >
                        {showMore ? "Read Less ▲" : "Read More ▼"}
                      </button>
                      <div className="tab-body-learn">
                      <h5>What You'll Learn</h5>
                      <div className="iconbody">
                    <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Concept-based learning with clear explanation</small>
                      <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Practice with tests and real exam questions</small>
                      <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Continuous support and doubt clarification</small>
                      </div>
                      </div>
                  </div>
                </Tab>

                {/* Curriculum Tab  */}
                <Tab eventKey="Curriculum" 
                  title={
                    <>
                      <FontAwesomeIcon icon={faListCheck} className="me-2" />
                      Curriculum
                    </>
                  }
                  >
                  <div className="Curriculum-tab-body">
                    <CourseCurriculum lessons={course.lessons} />
                  </div>
                </Tab>

                {/* Instructer Tab  */}
                <Tab eventKey="Instructor" title={
                    <>
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
                      Instructor
                    </>
                  }
                  >
                  <div className="instructer-tab-body">
                    <h5>About Instructer</h5>
                    <div className="img-name p-4 d-flex ">
                    <img
                    src={course.teacher.profile_pic ?? "/default-course.png"}
                    className="teacher-img"
                    alt={course.teacher.profile_pic?.en}

                  />
                    <div className="img-body">
                      <h5 className='Name'>{course.teacher.name}</h5>
                      <small className='Post'>JC Instructer</small>
                      <p className='About'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores quam, sapiente, nemo, tempore quia veritatis illum autem magni consectetur dolores sequi porro quisquam nisi perspiciatis temporibus fuga mollitia qui totam.</p>
                    </div>
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
              </Tabs>

            </div>



            <div className="related-course-card">
            <CourseFaqs
              faqs={courseFaqs}
            />
            </div>

          </div>

          {/* RIGHT */}
          <aside className="course-sidebar">

            {/* COURSE OVERVIEW */}
            <div className="overview-card card border-1 shadow mt-4">

              <h5 className="sidebar-title">
                Course Overview
              </h5>

              {/* PRICE */}
              <div className="price-section">

                <h3 className="final-price">
                  {course.price ? `₹${course.price}` : "Free"}
                </h3>

                <div className="price-row">

                  <span className="old-price">
                    ₹1999
                  </span>

                  <span className="discount-badge">
                    50% OFF
                  </span>

                </div>

              </div>

              {/* DETAILS */}
              <div className="overview-list">

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faClock} className="icon" />
                    <span>Course Duration</span>
                  </div>

                  <strong>6 Months</strong>
                </div>

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faBookOpen} className="icon" />
                    <span>Total Lectures</span>
                  </div>

                  <strong>{course.lessons?.length || 0}+</strong>
                </div>

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faFileLines} className="icon" />
                    <span>Study Material</span>
                  </div>

                  <strong>Yes</strong>
                </div>

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faClipboardCheck} className="icon" />
                    <span>Mock Tests</span>
                  </div>

                  <strong>25+</strong>
                </div>

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faLanguage} className="icon" />
                    <span>Language</span>
                  </div>

                  <strong>Hindi / English</strong>
                </div>

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faLayerGroup} className="icon" />
                    <span>Level</span>
                  </div>

                  <strong>Beginner to Advanced</strong>
                </div>

                <div className="overview-item">
                  <div className="left">
                    <FontAwesomeIcon icon={faCertificate} className="icon" />
                    <span>Certificate</span>
                  </div>

                  <strong>Yes</strong>
                </div>

              </div>

              {/* BUTTONS */}
              <button className="enroll-btn">
                Enroll Now
              </button>

              <button className="wishlist-btn">
                ♡ Add to Wishlist
              </button>

            </div>

            {/* SHARE CARD */}
            <div className="share-course-card card border-1 shadow mb-4">

              <h5>Share this course</h5>

              <p>Share with friends and classmates</p>

              <div className="social-icons">

                <a href="/">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>

                <a href="/">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>

                <a href="/">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>

                <a href="/">
                  <FontAwesomeIcon icon={faTelegramPlane} />
                </a>

                <a href="/">
                  <FontAwesomeIcon icon={faLink} />
                </a>

              </div>

            </div>

            {/* SECURITY */}
            {/* <div className="secure-card card border-1 shadow">

              <div className="secure-icon">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>

              <div>
                <h5>100% Secure Learning</h5>

                <p>
                  Your learning journey is safe with us.
                  30-day money back guarantee.
                </p>
              </div>

            </div> */}

          </aside>
        </div>

      </div>

    </section>


    

    

    {/* Footer  */}
    <FooterUi/>
    </>
  )
}

export default ViewCourseUi