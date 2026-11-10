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
import { useTranslation } from 'react-i18next'
import WhyChooseUs from '../../Common/CommonUI/WhyChooseUs'

const AboutUi = () => {

  const { t, i18n } = useTranslation("aboutpage");
  
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

              <small className="Hero_Tag">{t("hero.tag")}</small>

              <h1>
                {t("hero.title")}
                <span> {t("hero.highlight1")} </span>
                <br /> {t("hero.subtitle")}
                <span> {t("hero.highlight2")}</span>
              </h1>

              <p>{t("hero.description")}</p>

              <div className="Hero_Buttons">
                <Link to={PUBLIC_ROUTES.COURSES} className="Primary_Button_2">
                {t("hero.exploreCourses")}  <FontAwesomeIcon icon={faArrowRight} className='Icon'/>
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
                          {t("story.tag")}
                      </span>

                      <h2 className="Section_Title">
                        {i18n.language === "hi" ? (
                          <>
                           <span> {t("story.title")} </span>
                             {t("story.highlight1")}
                            <br />
                            {t("story.middle")}{" "}
                            <span>{t("story.highlight2")}</span>
                          </>
                        ) : (
                          <>
                            {t("story.title")} <span>{t("story.highlight1")}</span>
                            <br />
                            {t("story.middle")} <span>{t("story.highlight2")}</span>
                          </>
                        )}
                      </h2>

                      <p className="Story_Text">
                        {t("story.paragraph1")}
                      </p>

                      <p className="Story_Text">
                        {t("story.paragraph2")}
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

                                  <h4>{t("story.mission.title")}</h4>

                                  <p>
                                     {t("story.mission.description")}
                                  </p>

                              </div>

                          </div>

                          <div className="col-md-6">

                              <div className="Story_Card">

                                  <div className="Story_Icon">
                                      <FontAwesomeIcon icon={faEye}/>
                                  </div>

                                  <h4>{t("story.vision.title")}</h4>

                                  <p>
                                      {t("story.vision.description")}
                                  </p>

                              </div>

                          </div>

                      </div>

                  </div>

              </div>

          </div>
      </section>

      {/* [3.] Why Choose Us Section  */}

      <WhyChooseUs />

      <br />

      {/* [4.] Our Approach Section  */}

      <div className="Approach_Section">
        <div className="row align-items-center">
          <div className="col-md-6 Approach_Body">

            <span className="Section_Tag">
                {t("approach.tag")}
            </span>

            <h2 className="Section_Title">
                {t("approach.title")} <span>{t("approach.highlight1")}</span> <br />
                {t("approach.middle")} <span>{t("approach.highlight2")}</span>
            </h2>

                    
            <p className="Story_Text">
              {t("approach.description")}
            </p>

            <div className="Approach_List">
              {/* <div className="Icon_Body"> */}
                <small className='Text_Icon'><FontAwesomeIcon icon={faCircleCheck} className='Check_Icon'/>{t("approach.points.concept")}</small>
                <small className='Text_Icon'><FontAwesomeIcon icon={faCircleCheck} className='Check_Icon'/>{t("approach.points.practice")}</small>
                <small className='Text_Icon'><FontAwesomeIcon icon={faCircleCheck} className='Check_Icon'/>{t("approach.points.support")}</small>
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
              <h3>{t("cta.title")}</h3>

              <p>
                {t("cta.description")}
              </p>

              <Link  to={PUBLIC_ROUTES.COURSES} className="Primary_Button_Opposite_2">
                {t("cta.exploreCourses")}
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