import React from 'react'
import Accordion from "react-bootstrap/Accordion";
import { useTranslation } from "react-i18next";

const CourseFaqs = ({ faqs = [] }) => {

  const { i18n } = useTranslation();


  return (
    <div className="course-faqs">

      <div className="section-title">
          <div>
              <h4>Frequently Asked <span>Questions</span></h4>
              <p>
                  Find answers to the most common questions about this course.
              </p>
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
              <div className="empty-faq">
                <h5>No FAQs Available</h5>
                <p>
                    Frequently asked questions will be added soon.
                </p>
              </div>
        )}

    </div>
  );
};

export default CourseFaqs