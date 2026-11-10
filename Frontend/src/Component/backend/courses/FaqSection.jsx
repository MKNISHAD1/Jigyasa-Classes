import React from 'react'
import Accordion from "react-bootstrap/Accordion";
import { useTranslation } from "react-i18next";

const FaqSection = ({ faqs = [],subtitle }) => {

  const { t, i18n } = useTranslation("contactuspage");

  return (
    <div className="Faq_Section">

      <div className="Section_Title">
          <div>
              <h4>{t("faq.title")} <span>{t("faq.highlight")}</span></h4>
              
              {subtitle && (
                  <p>
                      {subtitle}
                  </p>
              )}
          </div>
      </div>

    {faqs.length > 0 ? (

      <Accordion defaultActiveKey="0">

        {faqs.map((faq, index) => (

          <Accordion.Item
            eventKey={index.toString()}
            key={faq.id}
          >

            <Accordion.Header>

              {faq.question?.[i18n.language] ||
                faq.question?.en}

            </Accordion.Header>

            <Accordion.Body>

              {faq.answer?.[i18n.language] ||
                faq.answer?.en}

            </Accordion.Body>

          </Accordion.Item>
        ))}
          </Accordion>
        ):(
              <div className="Empty_Faq">
                <h5>No FAQs Available</h5>
                <p>
                    Frequently asked questions will be added soon.
                </p>
              </div>
        )}

    </div>
  );
};

export default FaqSection