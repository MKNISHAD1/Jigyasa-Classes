import React from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import student from '../../../assets/images/aboutstudimg.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBullseye, faCircleCheck, faEye, faGraduationCap,  } from '@fortawesome/free-solid-svg-icons'

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

const AboutUi = () => {
  return (
    <>
    {/* Header component  */}
    <HeaderUi />

    {/* Hero Section  */}

    <section className="hero-section" 
      style={{backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'}}>

      <div className="container-fluid hero-body">

        <div className="row">

          {/* LEFT CONTENT */}
          <div className="col-lg-6 hero-content pb-2">

            <small className="hero-tag">
        ABOUT US
            </small>

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

            <div className="hero-btns">
              <Link to={PUBLIC_ROUTES.COURSES} className="primary-btn">
                Explore Courses  <FontAwesomeIcon icon={faArrowRight} className='icon'/>
              </Link>
            </div>


          </div>

          {/* RIGHT IMAGE */}
          <div className="col-lg-6 hero-img text-center">
            <img
              src={student}
              alt="Student"
              width="80%" 
              height="100%"
            />

          </div>

        </div>

      </div>
    </section>

    {/* Mission-Vision Section  */}

  <section className="our-story">
      <div className="container">

          <div className="row align-items-center g-5">

              {/* Left Content */}
              <div className="col-lg-5">

                  <span className="section-tag">
                      OUR STORY
                  </span>

                  <h2 className="section-title">
                      A Journey Of <span>Trust</span> <br />
                      And <span>Excellence</span>
                  </h2>

                  <p className="story-text">
                      Jigyasa Classes was created with one simple goal —
                      to make quality competitive exam preparation accessible,
                      affordable, and effective for every student.
                  </p>

                  <p className="story-text">
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

                          <div className="story-card">

                              <div className="story-icon" >
                                  <BullseyeIcon className="why-icon" />
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

                          <div className="story-card">

                              <div className="story-icon">
                                  <FontAwesomeIcon icon={faEye} className='why-icon'/>
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

    {/* Why student choose ?  */}

    <section className="why-choose">

      <div className="row">
        <h2 className="title">
          Why Aspirants Choose <span>Jigyasa Classes</span>
        </h2>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="why-item">
            <div className="icon-wrapper">
              <ProfessorIcon className="why-icon" />
            </div>

            <div className="why-content">
              <h3>Expert <span>Faculty</span></h3>
              <p>
                Learn from experienced teachers with proven success in competitive
                exam preparation.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="why-item">
            <div className="icon-wrapper">
              <VideoIcon className="why-icon" />
            </div>

            <div className="why-content">
              <h3>Structured <span>Curriculum</span></h3>
              <p>
                Step-by-step learning paths designed according to the latest exam
                patterns.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="why-item">
            <div className="icon-wrapper">
              <MoneyIcon className="why-icon" />
            </div>

            <div className="why-content">
              <h3>Affordable <span>Pricing</span></h3>
              <p>
                Quality education at student-friendly prices with both free and
                premium options.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="why-item">
            <div className="icon-wrapper">
              <CertificateIcon className="why-icon" />
            </div>

            <div className="why-content">
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

    {/* Our Approach Section  */}

    <div className="Approach-Section container">
      <div className="row">
        <div className="col-md-6">

                  <span className="section-tag">
                      OUR APPROACH
                  </span>

                  <h2 className="section-title">
                      Learning Made <span>Simple</span> <br />
                      And <span>Effective</span>
                  </h2>

                  
                  <p className="story-text">
          We believe that the right guidance, regular practice and <br />consistent effort can help any student succeed.
                  </p>

          <div className="approch-body ">


          <div className="iconbody">
        <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Concept-based learning with clear explanation</small>
          <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Practice with tests and real exam questions</small>
          <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Continuous support and doubt clarification</small>
          </div>
          </div>
        </div>

        <div className="col-md-6 text-center">
          <img src={img1} alt="" width="90%" height="100%"/>
        </div>
      </div>
    </div>

    <br />

    
    {/* CTA button  */}
    <div className="CTA-Section container">
      <div className="row align-items-center">

        <div className="col-lg-7 col-md-7 col-12">
          <div className="cta-body">
            <h3>Ready To Start Your Learning Journey?</h3>

            <p>
              Join thousands of aspirants preparing for competitive
              exams with Jigyasa Classes.
            </p>

            <Link  to={PUBLIC_ROUTES.COURSES} className="primary-btn-rev">
              Explore Courses
              <FontAwesomeIcon icon={faArrowRight} className="icon" />
            </Link>
          </div>
        </div>

        <div className="col-lg-5 col-md-5 col-12">
          <div className="hat-img">
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