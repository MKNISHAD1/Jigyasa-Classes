import React from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import hero from "../../../assets/images/hero.png"
import FooterUi from '../../Common/CommonUI/FooterUi'
import logo from "../../../assets/images/Logo2.png";
import { Link } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { useCourses } from '../../../hooks/useCourses';
import why1 from '../../../assets/images/why-1.jpeg';
import why2 from '../../../assets/images/why-2.jpeg';
import why3 from '../../../assets/images/why-3.jpeg';
import why4 from '../../../assets/images/why-4.jpeg';
import blackboard from '../../../assets/images/blackboard4.png';
import student1 from '../../../assets/images/Student1.png'
import student2 from '../../../assets/images/Student2.png'
import student3 from '../../../assets/images/Student3.png'
import student4 from '../../../assets/images/Student4.png'
import student5 from '../../../assets/images/Student5.png'
import exam from '../../../assets/images/exams1.png'
import exam1 from '../../../assets/images/exam1.png'
import exam2 from '../../../assets/images/exam2.png'
import exam3 from '../../../assets/images/exam3.png'
import exam4 from '../../../assets/images/exam4.png'
import exam5 from '../../../assets/images/exam5.png'
import bfs1 from '../../../assets/images/bf1.png'
import bfs2 from '../../../assets/images/bf2.png'
import bfs3 from '../../../assets/images/bf3.png'
import test from '../../../assets/images/bg1.jpg'
import { Carousel } from 'react-bootstrap';
import { faBookOpen, faClock, faDollar, faDollarSign, faJournalWhills, faLaptop, faLayerGroup, faMessage, faMoneyBill, faMoneyBillTransfer, faMoneyCheckDollar, faQuoteLeft, faSearch, faSearchPlus, faStar, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const HomeUi = () => {

  const {categories, loading} = useCategories();
  const { courses } = useCourses({
    status:"published",
    limit:3,
  });
  const {i18n} = useTranslation();

    const myStyle = {
    backgroundImage: `url(${blackboard})`,
  };

      const myStyle1 = {
    backgroundImage: `url(${test})`,
  };
  
  return (
    <>

    <HeaderUi />
    {/* Hero Section  */}
    <div className='text-center hero'>
    <img src={hero} />
    </div>



    {/* Exams banner */}
    <div className="text-center mb-4">
      
        <div className="gradi">
          <div className='container'>
              <div className='p-4 text-center'>
                <br /><br />
                    <h3 className="fw-bold">
                      We Prepare You For Multiple <span className='span2'>Competetitive  Exams</span>
                    </h3>
                    <p>Structured courses designed for India’s top competitive exams</p>
              </div>
              <div className=" Exam-Section">

                <img src={exam} className='exampic'/>

                <div className="exams-block">
                  <img src={exam1} /><br />
                  <h3>UPPSC</h3>
                </div>

                <div className="exams-block">
                  <img src={exam4} /><br />
                  <h3>RRB</h3>
                </div>
                
                <div className="exams-block">
                  <img src={exam5} /><br />
                  <h3>PSC</h3>
                </div>
                
                <div className="exams-block">
                  <img src={exam2} /><br />
                  <h3>SSC</h3>
                </div>

                <div className="exams-block">
                  <img src={exam3} /><br />
                  <h3>JEE</h3>
                </div>

              </div>
          </div>
        </div>

    </div>



    {/* Category section */}
    <div className="text-center mb-4">
      
        <div className="gradi2">
          <div className='container'>
              <div className='p-4 text-center'>
                <br /><br />

                    <h3 className="fw-bold">
                      Explore <span className='span2'> Categories</span>
                    </h3>
                    <p>Learn from newly added courses by expert instructors</p>
                

              </div>
          </div>
        </div>

    </div>
    <section className="category-section container">
      <div className="category-scroll-container">

        {/* Left Arrow */}
        <button
          className="scroll-btn left"
          onClick={() =>
            document.querySelector(".category-chips-wrapper")
              .scrollBy({ left: -200, behavior: "smooth" })
          }
        >
          &lt; 
        </button>

        {/* Chips */}
        <div className="category-chips-wrapper">
          {categories.map((cat) => (
            <button key={cat.id} className="category-chip" type="button">
              <span className="chip-text">
                <img
                  src={logo}
                  alt=""
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 50,
                    marginRight: 8,
                  }}
                />
                {cat.name?.[i18n.language] ?? cat.name?.en}
              </span>
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          className="scroll-btn right"
          onClick={() =>
            document.querySelector(".category-chips-wrapper")
              .scrollBy({ left: 200, behavior: "smooth" })
          }
        >
          &gt;
        </button>

      </div>
    </section>
    

    {/* Latest Courses Section */}
    <div className="text-center mb-4">
      
        <div className="gradi2">
          <div className='container'>
              <div className='p-4 text-center'>
                <br /><br />

                    <h3 className="fw-bold">
                      Latest <span className='span2'> Courses</span>
                    </h3>
                    <p>Learn from newly added courses by expert instructors</p>
                

              </div>
          </div>
        </div>

    </div>
    <section className="Latest_Course_Section">
      <div className="row g-4">

        {loading && (
          <div className="text-center py-5">
            <p>Loading courses...</p>
          </div>
        )}

        {!loading &&
          courses.map((course) => (
            <div className="col-12 col-sm-6 col-lg-4" key={course.id}>
              <div className="card shadow h-100 course-card">
                
                <img
                  src={course.thumbnail ?? "/default-course.png"}
                  className="course-img"
                  alt={course.title?.en}
                />

                  <div className="card-header d-flex flex-row mt-auto">
                    <img
                      src={course.teacher.profile_pic ?? "/default-course.png"}
                      className="teacher-img"
                      alt={course.teacher.profile_pic?.en}
                    />
                    <h6 className="teacher-name">
                      {course.teacher.name}
                    </h6>                                    
                    <div className="ms-auto">
                      <Link className='category-button' to="#" >
                        {course.category?.name?.[i18n.language] ??
                          course.category?.name?.en}
                      </Link>
                    </div>
                  </div>

                <div className="card-body d-flex flex-column">
                  <h6 className="course-title">
                    {course.title?.[i18n.language] ?? course.title?.en}
                  </h6>

                  <p className="course-desc small flex-grow-1 mb-2">
                    {course.description?.[i18n.language] ??
                      course.description?.en}
                  </p>
                  <div className="lectures ">
                    <div className="rating">
                       <span>5</span> &nbsp;<FontAwesomeIcon icon={faStar} className='star'/>
                       <FontAwesomeIcon icon={faStar} className='star'/>
                       <FontAwesomeIcon icon={faStar} className='star'/>
                       <FontAwesomeIcon icon={faStar} className='star'/>
                       <FontAwesomeIcon icon={faStar} className='star'/>
                    </div>
                    <div className="book">
                    <FontAwesomeIcon icon={faBookOpen} className='book-icon'/>  &nbsp;
                    {course.lessons_count} <span>Lessons</span><br />
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-centers price-section">
                    <span className="fw-bold text-success price">
                      {course.price ? `₹${course.price}` : "Free"}
                    </span>

                    <Link
                      to={`/course/${course.id}`}
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

        {/* All Courses Button */}
        <div className="text-center mt-5">
          <Link to="/courses" className="view-course-btn py-2 px-4">
            All Courses
          </Link>
        </div>
    </section>


    {/* Why Choose Us Section */}
    <section className="why-choose ">

      <div className="row">
      <h2 >Why Choose Us</h2>
        <div className="col-12 col-sm-6  col-lg-3">
          <img src={why1}/>
          <div className="why-content ">
            <h3>Expert <span>Faculty</span></h3>
            <p>Learn from highly experienced educators and industry professionals dedicated to your success.</p>
          </div>
        </div>

        <div className="col-12 col-sm-6  col-lg-3">
          <img src={why2}  />
          <div className="why-content ">
            <h3>Structured <span>Curriculum</span></h3>
            <p>Well-organized courses designed to build concepts step-by-step for better understanding.</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <img src={why3} alt="" />
          <div className="why-content ">
            <h3>Affordable <span>Pricing</span></h3>
            <p>Quality education at budget-friendly prices, with free and premium course options.</p>
          </div>
        </div>

        <div className="col-12 col-sm-6  col-lg-3">
          <img src={why4} alt="" />
          <div className="why-content ">
            <h3>Verified <span>Certification</span></h3>
            <p>Receive trusted certificates that add real value to your academic and career profile.</p>
          </div>
        </div>
      </div>


    </section>


    {/*  Testimonials  */}
    <div className="text-center mb-4">
      
        <div className="gradi3">
          <div className='container'>
              <div className='p-4 text-center'>
                <br /><br />

      <h3 className="fw-bold">
        Student's <span className='span2'> Testimonials</span>
      </h3>
      <p>Hear From Our Students How We've Helped Them Succeed</p>
                

              </div>
          </div>
        </div>

    </div>
    <section className="testimonial-section" style={myStyle}>
      <div className="testimonial-overlay">
        <Carousel
          controls
          indicators={true}
          interval={7000}
          draggable={true}
        >
          {/* Slide 1 */}
          <Carousel.Item>
            <div className="testimonial-content container">
              <div className="row align-items-center crouzel-body">
                <div className="col-md-6 text-white">
                  <FontAwesomeIcon icon={faQuoteLeft} className='quote-icon'/>
                  <hr />
                  <p className="testimonial-text">
                    “The courses are well-structured, the explanations are clear, and the faculty truly understands exam requirements.
I especially liked the flexibility of learning anytime.”
                  </p>
                  <hr />
                  <div className="testimonial-name-role">
                  <h5 className='sname'>Priya Sharma</h5>
                  <span className='srole'>~   UPSC Aspirant</span>
                  </div>
                </div>

                <div className="col-md-6 text-center">
                  <img
                    src={student1}
                    className="testimonial-img"
                  />
                </div>
              </div>
            </div>
          </Carousel.Item>

          {/* Slide 2 */}
          <Carousel.Item>
            <div className="testimonial-content container">
              <div className="row align-items-center crouzel-body">
                <div className="col-md-7 text-white">
                <FontAwesomeIcon icon={faQuoteLeft} className='quote-icon'/>
                <hr />
                  <p className="testimonial-text">
                    “The lessons are simple, focused, and designed exactly for competitive exams.
What impressed me most is the balance between concept clarity and practice questions.”
                  </p>
                  <hr />
                  <div className="testimonial-name-role">                    
                  <h5 className='sname'>Rohan Mehta</h5>
                  <span className='srole'>~   SSC Candidate</span>
                  </div>
                </div>

                <div className="col-md-5 text-center">
                  <img
                    src={student3}
                    className="testimonial-img"
                  />
                </div>
              </div>
            </div>
          </Carousel.Item>

          {/* Slide 3  */}
          <Carousel.Item>
            <div className="testimonial-content container">
              <div className="row align-items-center crouzel-body">
                <div className="col-md-7 text-white">
                <FontAwesomeIcon icon={faQuoteLeft} className='quote-icon'/>
                  <hr />
                  <p className="testimonial-text">
                    “Each topic is explained step by step, making even difficult concepts easy to understand.
I gained confidence in problem-solving and improved my accuracy significantly”
                  </p>
                  <hr />
                  <div className="testimonial-name-role">                                    
                  <h5 className='sname'>Neha Verma</h5>
                  <span className='srole'>~   JEE Aspirant</span>
                  </div>
                </div>

                <div className="col-md-5 text-center">
                  <img
                    src={student5}
                    className="testimonial-img"
                  />
                </div>
              </div>
            </div>
          </Carousel.Item>

          {/* Slide 4  */}
          <Carousel.Item>
            <div className="testimonial-content container">
              <div className="row align-items-center crouzel-body">
                <div className="col-md-7 text-white">
                <FontAwesomeIcon icon={faQuoteLeft} className='quote-icon'/>
                  <hr />
                  <p className="testimonial-text">
                    “The faculty explains concepts deeply and provides enough practice to strengthen understanding.
Regular assessments helped me track my progress and improve continuously.”
                  </p>
                  <hr />
                  <div className="testimonial-name-role">                                    
                  <h5 className='sname'>Amit Kulkarni</h5>
                  <span className='srole'>~   JEE Aspirant</span>
                  </div>
                </div>

                <div className="col-md-5 text-center">
                  <img
                    src={student4}
                    className="testimonial-img"
                  />
                </div>
              </div>
            </div>
          </Carousel.Item>


          {/* Slide 5  */}
          <Carousel.Item>
            <div className="testimonial-content container">
              <div className="row align-items-center crouzel-body">
                <div className="col-md-7 text-white">
                <FontAwesomeIcon icon={faQuoteLeft} className='quote-icon'/>
                  <hr />
                  <p className="testimonial-text">
                    “The courses are easy to follow, and I could revise topics whenever needed.
It helped me manage my studies along with my college schedule effortlessly.”
                  </p>
                  <hr />
                  <div className="testimonial-name-role">                               
                  <h5 className='sname'>Sneha Patil</h5>
                  <span className='srole'>~ College Student</span>
                  </div>
                </div>

                <div className="col-md-5 text-center">
                  <img
                    src={student2}
                    className="testimonial-img"
                  />
                </div>
              </div>
            </div>
          </Carousel.Item>

        </Carousel>
      </div>
    </section>


    {/*  Benenfit Section  */}
    <div className="text-center mb-4">
      
        <div className="gradi2">
          <div className='container'>
              <div className='p-4 text-center'>
                <br /><br />

      <h3 className="fw-bold">
        Benefits Of Learning With <span className='span2'> Jigyasa Classes</span>
      </h3>
      <p>Your Learning Is Simplified With Us, Disgned for Serious Aspirants</p>
                

              </div>
          </div>
        </div>

    </div>
    <section className="Benefits-Zigzag">
      <div className="container-fluid gradi2">
        <div className="zigzag-wrapper d-flex justify-content-between">
          
          {/* LEFT COLUMN */}
          <div className="zigzag-col left">
            <div className="l1">
              <div className="benefit-card" tabIndex="0"  aria-labelledby="benefit-anytime">
                <div className="Benefit-Title">
                  <FontAwesomeIcon icon={faLaptop} className='icon'/>
                <h3 id="benefit-anytime">Learn Anytime, Anywhere</h3>
                </div>
                <p>
                  Access your courses on mobile or desktop and study at your own pace.
                </p>
              </div>
            </div>

            <div className="r1">
              <div className="benefit-card alt1" tabIndex="0" aria-labelledby="benefit-exam-focused">
                <div className="Benefit-Title">
                  <FontAwesomeIcon icon={faJournalWhills} className='icon'/>
                <h3 id="benefit-exam-focused">Exam-Focused & Practical</h3>
                </div>
                <p>
                  Courses designed to match real exam patterns with clarity.
                </p>
              </div>
            </div>      

          </div>

          <div className="zigzag-col d-flex flex-column justify-content-center">
            <div className="l2">          
              <div className="benefit-card center" tabIndex="0" aria-labelledby="benefit-multiple-exams">
                <div className="Benefit-Title">
                  <FontAwesomeIcon icon={faLayerGroup} className='icon'/>
                <h3 id="benefit-multiple-exams" >One Platform, Multiple Exams</h3>
                </div>
                <p>
                  Prepare for Multiple Compitative Exams like UPSC, SSC, JEE, Banking and more.
                </p>
              </div>
            </div>
            <img src={bfs1} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="zigzag-col right">
            <div className="r2">
              <div className="benefit-card alt2" tabIndex="0" aria-labelledby="benefit-flexible">
                <div className="Benefit-Title">
                  <FontAwesomeIcon icon={faClock} className='icon' />
                <h3 id='benefit-flexible'>Flexible & Pressure-Free Learning</h3>
                </div>
                <p>
                  Recorded lessons allow revision anytime without stress.
                </p>
              </div>
            </div>

            <div className="l3">
              <div className="benefit-card " tabIndex="0">
                <div className="Benefit-Title">
                  <FontAwesomeIcon icon={faMessage} className='icon'/>
                <h3>Interactive & Easy to Follow</h3>
                </div>
                <p>
                  Engaging lessons with practical examples and materials.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* Take Action Section */}

    <div className="text-center mb-4">
      
        <div className="gradi2">
          <div className='container'>
              <div className='p-4 text-center'>
                <br /><br />

      <h3 className="fw-bold">
        Start Learning in <span className='span2'> 3 Simple Steps </span>
      </h3>
      <p> Let's Start Your Leaning With Us </p>
                
              </div>
          </div>
        </div>

    </div>
    <section className="Take-Action-Section">
      <div className="action-cont gradi2">
        <div className="row gx-0">

          {/* Step 1 */}
          <div className="col-lg-4 step-wrap">
            <div className="p-5 text-center">
              <div className="action-card" tabIndex="0"  aria-labelledby="action-1">
                <div className="Action-Title">
                  <FontAwesomeIcon icon={faUserEdit} className='icon'/>
                  <h3 id="action-1">Create Your Account</h3>
                </div>
                <p>
                  Sign up in seconds using your valid email to get started.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="col-lg-4 step-wrap">
            <div className="  p-5  text-center">
              <div className="action-card" tabIndex="0"  aria-labelledby="action-2">
                <div className="Action-Title">
                  <FontAwesomeIcon icon={faSearch} className='icon'/>
                  <h3 id="action-2">Find Your Course </h3>
                </div>
                <p>
                 Browse courses by exam, category, or subject and choose what fits your goal.
                </p>
              </div>
            </div>      
          </div>

          {/* Step 3 */}
          <div className="col-lg-4 step-wrap">
            <div className=" p-5  text-center">
              <div className="action-card" tabIndex="0"  aria-labelledby="action-3">
                <div className="Action-Title">
                  <FontAwesomeIcon icon={faDollar} className='icon'/>
                  <h3 id="action-3">Enroll & Start Learning</h3>
                </div>
                <p>
                  Complete secure payment and access your course instantly on any device.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>


{/* Gradient Strips */}

          {/* gradi 1 */}
{/* <div className="gradi">
  <div className='container'>
      <div className='p-4 text-center'>
        <br /><br /><br /><br />
        
      </div>
  </div>

</div>
<br /><br /> */}

          {/* gradi 2 */}
{/* <div className="gradi2">
  <div className='container'>
      <div className='p-4 text-center'>
        <br /><br /><br /><br />
        
      </div>
  </div>

</div> */}

          {/* gradi 3 */}
{/* <br /><br />
<div className="gradi3">
  <div className='container'>
      <div className='p-4 text-center'>
        <br /><br /><br /><br />
        
      </div>
  </div>

</div> */}

  {/* Footer  */}
  <FooterUi />
  
    </>
  )
}

export default HomeUi