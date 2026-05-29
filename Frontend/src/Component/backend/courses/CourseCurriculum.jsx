import React from 'react'
import Accordion from "react-bootstrap/Accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const CourseCurriculum = ({ lessons = [] }) => {

  // TEMP grouping
  const sections = [
    {
      title: "Getting Started",
      lessons: lessons.slice(0, 5),
    },
    {
      title: "Advanced Concepts",
      lessons: lessons.slice(5, 10),
    },
  ];

  return (
    <div className="course-curriculum">

      <div className="curriculum-header">
        <h4>Course Curriculum</h4>

        <span>
          {sections.length} Sections • {lessons.length} Lectures
        </span>
      </div>

      <Accordion defaultActiveKey="0">

        {sections.map((section, index) => (

          <Accordion.Item
            eventKey={index.toString()}
            key={index}
          >

            <Accordion.Header>

              <div className="section-header">

                <span>{section.title}</span>

                <small>
                  {section.lessons.length} Lectures
                </small>

              </div>

            </Accordion.Header>

            <Accordion.Body>

              {section.lessons.map((lesson, idx) => (

                <div
                  className="lesson-item"
                  key={lesson.id || idx}
                >

                  <div className="lesson-left">

                    <FontAwesomeIcon icon={faPlayCircle} />

                    <span>
                      {lesson.title?.en || "Untitled Lesson"}
                    </span>

                  </div>

                  <div className="lesson-right">

                    <FontAwesomeIcon icon={faClock} />

                    <small>10 min</small>

                  </div>

                </div>

              ))}

            </Accordion.Body>

          </Accordion.Item>

        ))}

      </Accordion>

    </div>
  );
};

export default CourseCurriculum;