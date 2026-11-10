import React from 'react'
import SectionHeading from './SectionHeading'
import ProfessorIcon from "../../../assets/images/professor2.svg?react";
import VideoIcon from "../../../assets/images/video2.svg?react";
import MoneyIcon from "../../../assets/images/money.svg?react";
import CertificateIcon from "../../../assets/images/certificate3.svg?react";
import { useTranslation } from 'react-i18next';

const WhyChooseUs = () => {
    const { t } =useTranslation("homepage")
  return (
    <>

        {/* [4.1] Why Choose Us Section */}
        <SectionHeading 
          title={
            <>
              {t("whyChoose.title")} <span className='span2'> {t("whyChoose.highlight")}</span>
            </>
          }
          subtitle={t("whyChoose.subtitle")}
        />

        
        {/* [4.2] Why Choose Us Section */}
        <section className="Why_Choose">
          <div className="row ">

            {/* Expert faculty */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="Why_Item">
                <div className="Icon_Wrapper">
                  <ProfessorIcon className="Why_Icon" />
                </div>

                <div className="Why_Content">
                  <h3>{t("whyChoose.items.faculty.title")} <span>{t("whyChoose.items.faculty.highlight")}</span></h3>
                  <p> {t("whyChoose.items.faculty.description")} </p>
                </div>
              </div>
            </div>

            {/* Structered  Curriculum */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="Why_Item">
                <div className="Icon_Wrapper">
                  <VideoIcon className="Why_Icon" />
                </div>

                <div className="Why_Content">
                  <h3>{t("whyChoose.items.curriculum.title")} <span>{t("whyChoose.items.curriculum.highlight")}</span></h3>
                  <p>{t("whyChoose.items.curriculum.description")}</p>
                </div>
              </div>
            </div>

            {/* Affordable Price */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="Why_Item">
                <div className="Icon_Wrapper">
                  <MoneyIcon className="Why_Icon" />
                </div>

                <div className="Why_Content">
                  <h3>{t("whyChoose.items.pricing.title")} <span>{t("whyChoose.items.pricing.highlight")}</span></h3>
                  <p>{t("whyChoose.items.pricing.description")}</p>
                </div>
              </div>
            </div>

            {/* Certificate */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="Why_Item">
                <div className="Icon_Wrapper">
                  <CertificateIcon className="Why_Icon" />
                </div>

                <div className="Why_Content">
                  <h3>{t("whyChoose.items.certification.title")} <span>{t("whyChoose.items.certification.highlight")}</span></h3>
                  <p>{t("whyChoose.items.certification.description")}</p>
                </div>
              </div>
            </div>

          </div>

        </section>
    </>
  )
}

export default WhyChooseUs