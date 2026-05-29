import React from 'react'
import Accordion from "react-bootstrap/Accordion";
import { useTranslation } from "react-i18next";

const CourseFaqs = ({ faqs = [] }) => {

  const { i18n } = useTranslation();


  

  return (
    <div className="course-faqs">

      <div className="section-title">
        <h4>Frequently Asked Questions</h4>
      </div>

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

    </div>
  );
};

export default CourseFaqs