import React from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import student from '../../../assets/images/aboutstudent.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBullseye, faCircleCheck, faEye, faGraduationCap,  } from '@fortawesome/free-solid-svg-icons'
import why1 from '../../../assets/images/why-1.jpeg';
import why2 from '../../../assets/images/why-2.jpeg';
import why3 from '../../../assets/images/why-3.jpeg';
import why4 from '../../../assets/images/why-4.jpeg';
import img1 from '../../../assets/images/aboutpage1.jpg';
import hat from '../../../assets/images/aboutpage3.png';
import PageHero from '../../Common/CommonUI/PageHeroUi'

const AboutUi = () => {
  return (
    <>
    {/* Header component  */}
    <HeaderUi />

    {/* Hero Section  */}
    <div className="about-hero container ">
      <div className="row">
        <div className="col-md-6 p-4">
          {/* <div className="about-heading">
          <h4>About Us</h4>
          <h1>
            Empowering <span>Asprints.</span> <br/>
            Building <span>Futures.</span>
          </h1>
          <div className="line"></div>
          </div> */}

          <PageHero
            tag="About Us"
            title="Building"
            highlight="Aspirants."
            title2="Empowering"
            highlight2="Futures."
            linePosition="afterHeading"
            description="
            Jigyasa Classes is an online learning platform created
            to help students prepare for Competitive exams with
            clarity, confidence and the right guidance.
            "
            buttonText="Explore Courses"
            buttonIcon={faArrowRight}
          />

          {/* <div className="about-body pt-3">
          <small >Jigyasa Classes is an online learning platform created to help students prepare for Competetitive exams with clarity, confidence and the right guidance. </small> <br /> <br />
          <button className='Button_Style p-3'> Explore Courses <FontAwesomeIcon icon={faArrowRight}/> </button>
          </div> */}


        </div>
        <div className="col-md-6 text-center">
          <img src={student} alt="" height="100%" width="300px" />
        </div>
      </div>
    </div>

    {/* Mission-Vision Section  */}

    <div className="about-mission-vision container d-flex p-3">
      <div className="about-mission d-flex">
        <div className="Mission-Icon p-2">
          <FontAwesomeIcon icon={faBullseye}/>
        </div>
        <div className="Mission-Body">
          <h5>Our Mission</h5>
          <small>To Provide affordable, high-quality and stuctured education that helps every aspirants achieve their dreams through effective learning.</small>
        </div>
      </div>
      
      <div className="lineh"></div>

      <div className="about-vision d-flex">
        <div className="Vision-Icon p-2">
          <FontAwesomeIcon icon={faEye}/>
        </div>
        <div className="Vision-Body">
          <h5>Our Vision</h5>
          <small>To become a trusted platform that empowers millions of students across india to crack competitive exams and build a better future.</small>
        </div>
      </div>
    </div>
    <br />

    {/* Why student choose ?  */}

    <section className="why-choose container">

      <div className="row">
      <h5 className='pb-4 pt-2' >Why Students Choose <span> Jigyasa Classes ?</span><br /><div className="line"></div> </h5>          
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
    <br />

    {/* Our Approach Section  */}

    <div className="Approach-Section container">
      <div className="row">
        <div className="col-md-6">
          <div className="about-heading">
          <h4>Our Approach</h4>
          <h1>Learning Made <span>Simple</span> <br/>
            And <span>Effective.</span>
          </h1>
          </div>

          <div className="approch-body pt-3">
          <small >We believe that the right guidance, regular practice and <br />consistent effort can help any student succeed. </small><br /><br />

          <div className="iconbody">
        <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Concept-based learning with clear explanation</small>
          <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Practice with tests and real exam questions</small>
          <small className='icon-text'><FontAwesomeIcon icon={faCircleCheck} className='check-icon'/>Continuous support and doubt clarification</small>
          </div>
          </div>
        </div>

        <div className="col-md-6 text-center">
          <img src={img1} alt="" width="450px" height="100%"/>
        </div>
      </div>
    </div>

    <br />


    {/* CTA button  */}

    {/* <div className="CTA-Section container d-flex p-3">
      <div className="hat-icon">
        <FontAwesomeIcon icon={faGraduationCap}/>
      </div>
      <div className="cta-body">
        <h3>Start your journay with Jigyasa Classess Toady!!!</h3>
        <p>Take the first step towards your dream career.</p>
      </div>
      <div className="cta-button">
        <button className='test'>Explore Now <FontAwesomeIcon icon={faArrowRight}/></button>
      </div>
    </div>
    <br /> */}
    
    {/* testing  */}
    <div className="CTA-Section container d-flex">
      <div className="cta-body">
        <h3>Start your journay with Jigyasa Classess Toady !</h3>
        <p>Take the first step towards your dream career.</p>
        <button className='Button-opposite'>Explore Now <FontAwesomeIcon icon={faArrowRight}/></button>
      </div>
      <div className="hat-img">
        <img src={hat} alt="" width="200px" height="100%"/>
      </div>
    </div>
    <br />

    {/* footer component  */}
    <FooterUi />
    </>
  )
}

export default AboutUi