import React from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import { Link } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { useCourses } from '../../../hooks/useCourses';
import ProfessorIcon from "../../../assets/images/professor2.svg?react";
import VideoIcon from "../../../assets/images/video2.svg?react";
import MoneyIcon from "../../../assets/images/money.svg?react";
import CertificateIcon from "../../../assets/images/certificate3.svg?react";
import student1 from '../../../assets/images/Student1.png';
import student2 from '../../../assets/images/Student2.png';
import student3 from '../../../assets/images/Student3.png';
import student4 from '../../../assets/images/Student4.png';
import student5 from '../../../assets/images/Student5.png';
import student6 from '../../../assets/images/student10.png';
import exam1 from '../../../assets/images/exam1.png';
import exam2 from '../../../assets/images/exam2.png';
import exam3 from '../../../assets/images/exam3.png';
import exam4 from '../../../assets/images/exam4.png';
import exam5 from '../../../assets/images/exam5.png';
import benefit from '../../../assets/images/bf3.jpeg';
import { Carousel } from 'react-bootstrap';
import { faArrowLeft, faArrowRight, faClock, faDesktop, faDollar,  faFile, faJournalWhills, faLaptop, faLayerGroup, faMessage, faQuoteLeft, faSearch,  faUserEdit, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AUTH_ROUTES, PUBLIC_ROUTES } from '../../../constants/nevigation/routes';
import SectionHeading from '../../Common/CommonUI/SectionHeading';
import CourseCardUi from '../../Common/CommonUI/CourseCardUi';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation , Autoplay } from "swiper/modules";
import "swiper/css";
import 'swiper/css/autoplay';
import "swiper/css/navigation";
import WhyChooseUs from '../../Common/CommonUI/WhyChooseUs';

const HomeUi = () => {

  const { loading } = useCategories();
  const { courses } = useCourses({
    status:"published",
    limit:6,
  });
  const { t, i18n } = useTranslation("homepage");

  return (
    <>
      {/* Header Navbar */}
      <HeaderUi />

      <div className="Home_Page_Body">
      
        {/* [1.] Hero Section  */}
        <section className="Hero_Section" >

          <div className="container-fluid Hero_Body">

            <div className="row">

              {/* LEFT CONTENT */}
              <div className="col-lg-6 Hero_Content pb-2">

                <small className="Hero_Tag">
                  {t("hero.tag")}
                </small>

                <h1>
                  {i18n.language === "hi" ? (
                    <>
                      {t("hero.title")} <br />
                      <span>{t("hero.qualityEducation")}</span>
                      <br />
                      {t("hero.and")} {t("hero.expert")}
                      <span> {t("hero.mentorship")}</span>
                    </>
                  ) : (
                    <>
                      {t("hero.title")} <br />
                      <span>{t("hero.qualityEducation")} </span>
                      {t("hero.and")}
                      <br />
                      {t("hero.expert")} <span>{t("hero.mentorship")}</span>
                    </>
                  )}
                </h1>

                <p className='m-0 mb-2'>{t("hero.description")}</p>

                <div className="Hero_Buttons">
                  <Link to={PUBLIC_ROUTES.COURSES} className="Primary_Button_2">
                     {t("hero.startLearning")}  <FontAwesomeIcon icon={faArrowRight} className='Icon'/>
                  </Link>
                </div>

                <div className="Hero_Features">

                  <div className="Feature_Item">
                    <FontAwesomeIcon icon={faDesktop} /> {t("hero.features.interactiveSessions")}
                  </div>

                  <div className="Feature_Item">
                    <FontAwesomeIcon icon={faUserGroup}/> {t("hero.features.expertFaculty")}
                  </div>


                  <div className="Feature_Item">
                    <FontAwesomeIcon icon={faFile} /> {t("hero.features.studyMaterial")}
                  </div>

                </div>

              </div>

              {/* RIGHT IMAGE */}
              <div className="col-lg-6 Hero_Img text-center">
                <img
                  src={student5}
                  alt="Student"
                  className="Student_Img"
                />

              </div>

            </div>

          </div>
        </section>
        
        {/* [2.1] Exams Section Heading */}
        <SectionHeading
          title={
            <>
              {t("exams.title")} <span>{t("exams.highlight")}</span>
            </>
          }
          subtitle={t("exams.subtitle")}
        />
        {/* [2.2] Exam Section */}
        <section className="Exam_Strip_Section">
          <div className="Exam_Marquee">

            <div className="Marquee_Track">

              {/* First Set */}
              <div className="Exam_Item">
                <img src={exam1} alt="UPPSC" />
                <span>UPPSC</span>
              </div>

              <div className="Exam_Item">
                <img src={exam2} alt="RRB" />
                <span>RRB</span>
              </div>

              <div className="Exam_Item">
                <img src={exam3} alt="PSC" />
                <span>PSC</span>
              </div>

              <div className="Exam_Item">
                <img src={exam4} alt="SSC" />
                <span>SSC</span>
              </div>

              <div className="Exam_Item">
                <img src={exam5} alt="JEE" />
                <span>JEE</span>
              </div>

              {/* Duplicate for infinite scroll */}
            <div className="Exam_Item">
                <img src={exam1} alt="UPPSC" />
                <span>UPPSC</span>
              </div>

              <div className="Exam_Item">
                <img src={exam2} alt="RRB" />
                <span>RRB</span>
              </div>

              <div className="Exam_Item">
                <img src={exam3} alt="PSC" />
                <span>PSC</span>
              </div>

              <div className="Exam_Item">
                <img src={exam4} alt="SSC" />
                <span>SSC</span>
              </div>

              <div className="Exam_Item">
                <img src={exam5} alt="JEE" />
                <span>JEE</span>
              </div>

            </div>

          </div>

        </section>    

        {/* [3.1] Latest Courses Section Heading */}
        <SectionHeading
          title={
              <>
                {t("latestCourses.title")} <span>{t("latestCourses.highlight")}</span>
              </>
            }
          subtitle={t("latestCourses.subtitle")}
        />
        {/*  [3.2] Latest Courses Section Heading */}
        <section className="Latest_Course_Section">

          {/* Loading */}
          { loading && (
            <div className="m-4">
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div
                  className="spinner-border text-primary"
                  style={{ width: "3rem", height: "3rem" }}
                />

                <h5 className="mt-3 mb-1">{t("latestCourses.loading")}</h5>

                <small className="text-muted">
                  {t("latestCourses.pleaseWait")}
                </small>
              </div>
            </div>
          )}

          {/* Course Cards */}
          {!loading && courses.length > 0 && (
              <div className="Latest_Course_Carousel">

                  {/* Previous Button */}
                  <button
                      className="Latest_Course_Nav Latest_Course_Nav_Prev"
                      type="button"
                      aria-label="Previous courses"
                  >
                      <span> <FontAwesomeIcon icon={faArrowLeft} className='Icon'/> </span>
                  </button>


                  {/* Swiper */}
                  <Swiper
                      className="Latest_Course_Swiper"
                      modules={[Navigation,Autoplay]}
                      loop={true} 
                      navigation={{
                          prevEl: ".Latest_Course_Nav_Prev",
                          nextEl: ".Latest_Course_Nav_Next",
                      }}
                      // Configure Autoplay
                      autoplay={{
                        delay: 3000, // Time in ms before moving to the next slide (2.5s)
                        disableOnInteraction: false, // Prevents autoplay from stopping after user swipes
                        pauseOnMouseEnter: true, // Pauses autoplay when the user hovers over the slider
                      }}
                      
                      spaceBetween={20}
                      slidesPerView={1}
                      slidesPerGroup={1}
                      breakpoints={{
                          576: {
                              slidesPerView: 2,
                              slidesPerGroup: 1,
                          },

                          992: {
                              slidesPerView: 3,
                              slidesPerGroup: 1,
                          },

                          1200: {
                              slidesPerView: 4,
                              slidesPerGroup: 1,
                          },
                      }}
                  >
                      {courses.map((course) => (
                          <SwiperSlide key={course.id}>
                              <CourseCardUi course={course} />
                          </SwiperSlide>
                      ))}
                  </Swiper>


                  {/* Next Button */}
                  <button
                      className="Latest_Course_Nav Latest_Course_Nav_Next"
                      type="button"
                      aria-label="Next courses"
                  >
                      <span><FontAwesomeIcon icon={faArrowRight} className='Icon' /></span>
                  </button>

              </div>
          )}

        </section>

        {/* [4.1] Why Choose Us Section */}
        <WhyChooseUs />

        {/* [5.1] Testimonials Section Heading */}
        <SectionHeading 
          title={
            <>
              {t("testimonials.title")} <span className='span2'> {t("testimonials.highlight")}</span>
            </>
          } 
          subtitle={t("testimonials.subtitle")}
        />
        {/* [5.2] Testimonials Section Heading */}
        <section className="Testimonial_Section">
          <div className="Testimonial_Overlay">
            <Carousel
              controls
              indicators={true}
              interval={4000}
              draggable={true}
            >

              {/* Slide 1 */}
              <Carousel.Item>
                <div className="Testimonial_Content container">
                  <div className="row align-items-center crouzel-body">
                    <div className="col-md-6 text-white">
                      <FontAwesomeIcon icon={faQuoteLeft} className='Quote_Icon'/>
                      <hr />
                      <p className="Testimonial_Text">
                        “{t("testimonials.students.priya.quote")}”
                      </p>
                      <hr />
                      <div className="Testimonial_Name_Role">
                      <h5 className='Student_Name'>Priya Sharma</h5>
                      <span className='Student_Role'>~ UPSC Aspirant</span>
                      </div>
                    </div>

                    <div className="col-md-6 text-center">
                      <img
                        src={student1}
                        className="Testimonial_Student_Img"
                      />
                    </div>
                  </div>
                </div>
              </Carousel.Item>

              {/* Slide 2 */}
              <Carousel.Item>
                <div className="Testimonial_Content container">
                  <div className="row align-items-center crouzel-body">
                    <div className="col-md-7 text-white">
                    <FontAwesomeIcon icon={faQuoteLeft} className='Quote_Icon'/>
                    <hr />
                      <p className="Testimonial_Text">
                        “{t("testimonials.students.rohan.quote")}”
                      </p>
                      <hr />
                      <div className="Testimonial_Name_Role">                    
                      <h5 className='Student_Name'>Rohan Mehta</h5>
                      <span className='Student_Role'>~   SSC Candidate</span>
                      </div>
                    </div>

                    <div className="col-md-5 text-center">
                      <img
                        src={student3}
                        className="Testimonial_Student_Img"
                      />
                    </div>
                  </div>
                </div>
              </Carousel.Item>

              {/* Slide 3  */}
              <Carousel.Item>
                <div className="Testimonial_Content container">
                  <div className="row align-items-center crouzel-body">
                    <div className="col-md-7 text-white">
                    <FontAwesomeIcon icon={faQuoteLeft} className='Quote_Icon'/>
                      <hr />
                      <p className="Testimonial_Text">
                        “{t("testimonials.students.neha.quote")}”
                      </p>
                      <hr />
                      <div className="Testimonial_Name_Role">                                    
                      <h5 className='Student_Name'>Neha Verma</h5>
                      <span className='Student_Role'>~   JEE Aspirant</span>
                      </div>
                    </div>

                    <div className="col-md-5 text-center">
                      <img
                        src={student6}
                        className="Testimonial_Student_Img"
                      />
                    </div>
                  </div>
                </div>
              </Carousel.Item>

              {/* Slide 4  */}
              <Carousel.Item>
                <div className="Testimonial_Content container">
                  <div className="row align-items-center crouzel-body">
                    <div className="col-md-7 text-white">
                    <FontAwesomeIcon icon={faQuoteLeft} className='Quote_Icon'/>
                      <hr />
                      <p className="Testimonial_Text">
                        “{t("testimonials.students.amit.quote")}”
                      </p>
                      <hr />
                      <div className="Testimonial_Name_Role">                                    
                      <h5 className='Student_Name'>Amit Kulkarni</h5>
                      <span className='Student_Role'>~   JEE Aspirant</span>
                      </div>
                    </div>

                    <div className="col-md-5 text-center">
                      <img
                        src={student4}
                        className="Testimonial_Student_Img"
                      />
                    </div>
                  </div>
                </div>
              </Carousel.Item>

              {/* Slide 5  */}
              <Carousel.Item>
                <div className="Testimonial_Content container">
                  <div className="row align-items-center crouzel-body">
                    <div className="col-md-7 text-white">
                    <FontAwesomeIcon icon={faQuoteLeft} className='Quote_Icon'/>
                      <hr />
                      <p className="Testimonial_Text">
                        “{t("testimonials.students.sneha.quote")}”
                      </p>
                      <hr />
                      <div className="Testimonial_Name_Role">                               
                      <h5 className='Student_Name'>Sneha Patil</h5>
                      <span className='Student_Role'>~ College Student</span>
                      </div>
                    </div>

                    <div className="col-md-5 text-center">
                      <img
                        src={student2}
                        className="Testimonial_Student_Img"
                      />
                    </div>
                  </div>
                </div>
              </Carousel.Item>

            </Carousel>
          </div>
        </section>

        {/* [6.1] Benenfit Section Heading*/}
        <SectionHeading 
          title={
            <>
              {t("benefits.title")} <span className='span2'>{t("benefits.highlight")} </span>
            </>
          }
          subtitle={t("benefits.subtitle")} 
        />
        {/* [6.2] Benenfit Section Heading*/}
        <section className="Benefits_Zigzag">
          <div className="container-fluid">
            <div className="Zigzag_Wrapper d-flex justify-content-between">
              
              {/* LEFT COLUMN */}
              <div className="Zigzag_Col Left">
                <div className="L1">
                  <div className="Benefit_Card" tabIndex="0"  aria-labelledby="Benefit_Anytime">
                    <div className="Benefit_Title">
                      <FontAwesomeIcon icon={faLaptop} className='Icon'/>
                    <h3 id="Benefit_Anytime">{t("benefits.items.anytime.title")}</h3>
                    </div>
                    <p>
                      {t("benefits.items.anytime.description")}
                    </p>
                  </div>
                </div>

                <div className="R1">
                  <div className="Benefit_Card Alt1" tabIndex="0" aria-labelledby="Benefit_Exam_Focused">
                    <div className="Benefit_Title">
                      <FontAwesomeIcon icon={faJournalWhills} className='Icon'/>
                    <h3 id="Benefit_Exam_Focused">{t("benefits.items.examFocused.title")}</h3>
                    </div>
                    <p>
                      {t("benefits.items.examFocused.description")}
                    </p>
                  </div>
                </div>      

              </div>

              <div className="Zigzag_Col d-flex flex-column justify-content-center">
                <div className="L2">          
                  <div className="Benefit_Card Center" tabIndex="0" aria-labelledby="Benefit_Multiple_Exams">
                    <div className="Benefit_Title">
                      <FontAwesomeIcon icon={faLayerGroup} className='Icon'/>
                    <h3 id="Benefit_Multiple_Exams">{t("benefits.items.multipleExams.title")}</h3>
                    </div>
                    <p>
                      {t("benefits.items.multipleExams.description")}
                    </p>
                  </div>
                </div>
                <img src={benefit}/>
              </div>

              {/* RIGHT COLUMN */}
              <div className="Zigzag_Col Right">
                <div className="R2">
                  <div className="Benefit_Card Alt2" tabIndex="0" aria-labelledby="Benefit_Flexible">
                    <div className="Benefit_Title">
                      <FontAwesomeIcon icon={faClock} className='Icon' />
                    <h3 id='Benefit_Flexible'>{t("benefits.items.flexible.title")}</h3>
                    </div>
                    <p>
                      {t("benefits.items.flexible.description")}
                    </p>
                  </div>
                </div>

                <div className="L3">
                  <div className="Benefit_Card" tabIndex="0">
                    <div className="Benefit_Title">
                      <FontAwesomeIcon icon={faMessage} className='Icon'/>
                    <h3>{t("benefits.items.interactive.title")}</h3>
                    </div>
                    <p>
                      {t("benefits.items.interactive.description")}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* [7.1] Take Action Section Heading*/}
        <SectionHeading
          title={
            <>
              {t("steps.title")} <span className='span2'> {t("steps.highlight")}</span>
            </>
          }
          subtitle={t("steps.subtitle")}
        />

        {/* [7.2] Take Actionn Section */}
        <section className="Take_Action_Section">
          <div className="Action_cont">
            <div className="row gx-0">

              {/* Step 1 */}
              <div className="col-md-4 Step_Wrap">
                <div className="text-center">
                  <div className="Action_Card" tabIndex="0"  aria-labelledby="Action_1">
                    <div className="Action_Title">
                      <FontAwesomeIcon icon={faUserEdit} className='Icon'/>
                      <h3 id="Action_1">{t("steps.items.account.title")}</h3>
                    </div>
                    <p>
                      {t("steps.items.account.description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-md-4 Step_Wrap">
                <div className="text-center">
                  <div className="Action_Card" tabIndex="0"  aria-labelledby="Action_2">
                    <div className="Action_Title">
                      <FontAwesomeIcon icon={faSearch} className='Icon'/>
                      <h3 id="Action_2">{t("steps.items.course.title")} </h3>
                    </div>
                    <p>
                    {t("steps.items.course.description")}
                    </p>
                  </div>
                </div>      
              </div>

              {/* Step 3 */}
              <div className="col-md-4 Step_Wrap">
                <div className="text-center">
                  <div className="Action_Card" tabIndex="0"  aria-labelledby="Action_3">
                    <div className="Action_Title">
                      <FontAwesomeIcon icon={faDollar} className='Icon'/>
                      <h3 id="Action_3">{t("steps.items.enroll.title")}</h3>
                    </div>
                    <p>
                      {t("steps.items.enroll.description")}
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="Action_Button">
              <Link to={AUTH_ROUTES.REGISTER} className=" btn blue-btn shadow">
                {t("steps.registerNow")} <FontAwesomeIcon icon={faArrowRight} className='Icon'/>
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* Footer  */}
      <FooterUi />
    </>
  )
}

export default HomeUi