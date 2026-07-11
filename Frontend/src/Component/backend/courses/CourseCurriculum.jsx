import React, { useState } from 'react'
import Accordion from "react-bootstrap/Accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faClock,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';

const CourseCurriculum = ({ modules = [], lessonsCount = 0 }) => {

  const { i18n } = useTranslation();

  // only Module with lessons
  const visibleModules = modules.filter(
    module => module.lessons && module.lessons.length > 0
  );

  // Module open and  close 
  const [activeKeys, setActiveKeys] = useState(["0"]);

  // expannd and collapse function
  const toggleExpandAll = () => {

  if (activeKeys.length === visibleModules.length) {
      setActiveKeys([]);
    } else {
      setActiveKeys(
        visibleModules.map((_, index) => index.toString())
      );
    }
};

  

  return (
    <div className="course-curriculum">
 
      <div className="curriculum-header">

          <div>

              <h4>Course <span>Curriculum</span></h4>

              <p>
                  {visibleModules.length} Modules • {lessonsCount} Lessons • 10 Hours
              </p>

          </div>

        <button
            className="expand-btn"
            onClick={toggleExpandAll}
        >

            {
                activeKeys.length === visibleModules.length
                ? "Close All"
                : "Expand All"
            }

        </button>


      </div>


      <Accordion
        alwaysOpen
        activeKey={activeKeys}
        onSelect={setActiveKeys}
      >

        {visibleModules.map((module,index)=>(

          <Accordion.Item
              key={module.id}
              eventKey={index.toString()}
          >

            <Accordion.Header>

              <div className="section-header">

                <div className="module-info">

                    <h4 className='icon'>
                      <FontAwesomeIcon icon={faChevronRight}/>
                    </h4>

                    <div className="module-title">

                       <span className='title'>Module {index+1} : {module.title?.[i18n.language] || module.title?.en}</span>

                    <small className="lesson-count">

                        {module.lessons.length} Lectures • 42 min

                    </small>

                    </div>


                </div>

              </div>

            </Accordion.Header>

            <Accordion.Body>
            {
              module.lessons.length > 0 ? (
                module.lessons.map((lesson,idx)=>(

                  <div
                    className="lesson-item"
                    key={lesson.id || idx}
                  >

                    <div className="lesson-left">

                        <div className="lesson-icon">
                            <FontAwesomeIcon icon={faPlayCircle}/>
                        </div>

                        <div className="lesson-content">

                            <strong>
                                {lesson.title?.[i18n.language] || lesson.title?.en||"Untitled Lesson"}
                            </strong>

                            <small>

                                Preview Available

                            </small>

                        </div>

                    </div>

                    <div className="lesson-right">

                        <span className="lesson-duration">

                            <FontAwesomeIcon icon={faClock}/>

                            10:00

                        </span>

                    </div>

                  </div>

                ))):(
                  <>
                  <small className='text-success'>
                    No Lesson added  yet, Pleasse check after some time.
                  </small>
                  </>
                )}

            </Accordion.Body>

          </Accordion.Item>

        ))}


      </Accordion>
 
    </div>
  );
};

export default CourseCurriculum;