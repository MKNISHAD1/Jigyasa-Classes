import React from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import student from '../../../assets/images/aboutstudimg.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBullseye, faCircleCheck, faEye, faGraduationCap, faRoute,  } from '@fortawesome/free-solid-svg-icons'

import ProfessorIcon from "../../../assets/images/professor2.svg?react";
import VideoIcon from "../../../assets/images/video2.svg?react";
import MoneyIcon from "../../../assets/images/money.svg?react";
import CertificateIcon from "../../../assets/images/certificate3.svg?react";
import BullseyeIcon from "../../../assets/images/bullseye.svg?react";


import img1 from '../../../assets/images/aboutpage1.jpg';
import hat from '../../../assets/images/aboutpage3.png';
import bgImage from '../../../assets/images/herobg6.png'
import PageHero from '../../Common/CommonUI/PageHeroUi'
import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '../../../constants/nevigation/routes'
import SectionHeading from '../../Common/CommonUI/SectionHeading'

const AboutUi = () => {
  return (
    <>
      {/* Header component  */}
      <HeaderUi />

      {/* [1.] Hero Section  */}
      <section className="Hero_Section" >

        <div className="container-fluid Hero_Body">

          <div className="row">

            {/* LEFT CONTENT */}
            <div className="col-lg-6 Hero_Content pb-2">

              <small className="Hero_Tag">ABOUT US </small>

              <h1>
                Building
                <span> Aspirants. </span>
                <br /> Empowering
                <span> Futures.</span>
              </h1>

              <p>
                Helping thousands of students prepare for <br />
                competitive exams with structured courses, <br />
                expert guidance and practical learning.            
                </p>

              <div className="Hero_Buttons">
                <Link to={PUBLIC_ROUTES.COURSES} className="Primary_Button_2">
                  Explore Courses  <FontAwesomeIcon icon={faArrowRight} className='Icon'/>
                </Link>
              </div>


            </div>

            {/* RIGHT IMAGE */}
            <div className="col-lg-6 Hero_Img text-center">
              <img
                className='Student_Img'
                src={student}
                alt="Student"

              />

            </div>

          </div>

        </div>
      </section>

      {/* [2.] Mission-Vision Section  */}

      <section className="Our_Story">
          <div className="container">

              <div className="row align-items-center">

                  {/* Left Content */}
                  <div className="col-lg-5 Heading">

                      <span className="Section_Tag">
                          OUR STORY
                      </span>

                      <h2 className="Section_Title">
                          A Journey Of <span>Trust</span> <br />
                          And <span>Excellence</span>
                      </h2>

                      <p className="Story_Text">
                          Jigyasa Classes was created with one simple goal —
                          to make quality competitive exam preparation accessible,
                          affordable, and effective for every student.
                      </p>

                      <p className="Story_Text">
                          We believe success comes from consistency,
                          expert guidance and structured learning.
                          Every course is designed to help aspirants
                          confidently achieve their dream career.
                      </p>

                  </div>

                  {/* Right Cards */}
                  <div className="col-lg-7">

                      <div className="row g-4">

                          <div className="col-md-6">

                              <div className="Story_Card">

                                  <div className="Story_Icon" >
                                      <FontAwesomeIcon icon={faRoute} />
                                  </div>

                                  <h4>Our Mission</h4>

                                  <p>
                                      To provide affordable, high-quality,
                                      structured education that helps every
                                      aspirant achieve success through effective learning.
                                  </p>

                              </div>

                          </div>

                          <div className="col-md-6">

                              <div className="Story_Card">

                                  <div className="Story_Icon">
                                      <FontAwesomeIcon icon={faEye}/>
                                  </div>

                                  <h4>Our Vision</h4>

                                  <p>
                                      To become India's trusted online learning
                                      platform that empowers millions of students
                                      preparing for competitive exams.
                                  </p>

                              </div>

                          </div>

                      </div>

                  </div>

              </div>

          </div>
      </section>

      {/* [3.1] Why Choose Us Section */}
      <SectionHeading 
        title={
          <>
            Why Choose <span className='span2'> Jigyasa Classes ?</span>
          </>
        }
        subtitle="Here Reason Why aspirants Choosen Jigyasa Classes"
      />

      {/* [3.2] Why Choose Us Section */}
      <section className="Why_Choose">
        <div className="row ">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="Why_Item">
              <div className="Icon_Wrapper">
                <ProfessorIcon className="Why_Icon" />
              </div>

              <div className="Why_Content">
                <h3>Expert <span>Faculty</span></h3>
                <p>
                  Learn from experienced teachers with proven success in competitive
                  exam preparation.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="Why_Item">
              <div className="Icon_Wrapper">
                <VideoIcon className="Why_Icon" />
              </div>

              <div className="Why_Content">
                <h3>Structured <span>Curriculum</span></h3>
                <p>
                  Step-by-step learning paths designed according to the latest exam
                  patterns.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="Why_Item">
              <div className="Icon_Wrapper">
                <MoneyIcon className="Why_Icon" />
              </div>

              <div className="Why_Content">
                <h3>Affordable <span>Pricing</span></h3>
                <p>
                  Quality education at student-friendly prices with both free and
                  premium options.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="Why_Item">
              <div className="Icon_Wrapper">
                <CertificateIcon className="Why_Icon" />
              </div>

              <div className="Why_Content">
                <h3>Verified <span>Certification</span></h3>
                <p>
                  Earn certificates that showcase your learning achievements and
                  skills.
                </p>
              </div>
            </div>
          </div>

        </div>

      </section>

      <br />

      {/* [4.] Our Approach Section  */}

      <div className="Approach_Section">
        <div className="row align-items-center">
          <div className="col-md-6 Approach_Body">

            <span className="Section_Tag">
                OUR APPROACH
            </span>

            <h2 className="Section_Title">
                Learning Made <span>Simple</span> <br />
                And <span>Effective</span>
            </h2>

                    
            <p className="Story_Text">
              We believe that the right guidance, regular practice and consistent effort can help any student succeed.
            </p>

            <div className="Approach_List">
              {/* <div className="Icon_Body"> */}
                <small className='Text_Icon'><FontAwesomeIcon icon={faCircleCheck} className='Check_Icon'/>Concept-based learning with clear explanation</small>
                <small className='Text_Icon'><FontAwesomeIcon icon={faCircleCheck} className='Check_Icon'/>Practice with tests and real exam questions</small>
                <small className='Text_Icon'><FontAwesomeIcon icon={faCircleCheck} className='Check_Icon'/>Continuous support and doubt clarification</small>
              {/* </div> */}
            </div>
          </div>

          <div className="col-md-6 Approach_Img">
            <img src={img1} className='Study_Img' alt="Students doing Study"/>
          </div>
        </div>
      </div>

      {/* CTA button  */}
      <div className="CTA_Section">
        <div className="row align-items-center CTA_Body">

          <div className="col-lg-7 col-md-7 col-12">
            <div className="CTA_Info">
              <h3>Ready To Start Your Learning Journey?</h3>

              <p>
                Join thousands of aspirants preparing for competitive
                exams with Jigyasa Classes.
              </p>

              <Link  to={PUBLIC_ROUTES.COURSES} className="Primary_Button_Opposite_2">
                Explore Courses
                <FontAwesomeIcon icon={faArrowRight} className="Icon" />
              </Link>
            </div>
          </div>

          <div className="col-lg-5 col-md-5 col-12">
            <div className="Hat_Img">
              <img src={hat} alt="Graduation Cap" />
            </div>
          </div>

        </div>
      </div>
      <br />

      {/* footer component  */}
      <FooterUi />
    </>
  )
}

export default AboutUi