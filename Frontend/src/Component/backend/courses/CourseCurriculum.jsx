import React, { useState } from 'react'
import Accordion from "react-bootstrap/Accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faClock,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';

const CourseCurriculum = ({ modules = [], lessonsCount = 0, course }) => {

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

// Duration Formatter
const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds || 0);

    if (!totalSeconds) return "0 Min";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return minutes > 0
            ? `${hours} hr ${minutes} min`
            : `${hours} hr`;
    }

    return `${minutes} min`;
};

// Lesson duraytion player style
const formatLessonDuration = (seconds) => {
    const totalSeconds = Number(seconds || 0);

    if (!totalSeconds) return "0:00";

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

  

  return (
    <div className="Course_Curriculum">
 
      <div className="Curriculum_Header">

          <div>

              <h4>Course <span>Curriculum</span></h4>

              <p>
                  {visibleModules.length} Modules • {lessonsCount} Lessons • {formatDuration(course.total_duration)}
              </p>

          </div>

        <button
            className="Expand_Button"
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

        {visibleModules.map((module,index)=>{
          const moduleDuration = module.lessons.reduce(
              (total, lesson) => total + Number(lesson.duration || 0),
              0
          );

          return (
                <Accordion.Item
                    key={module.id}
                    eventKey={index.toString()}
                >

                  <Accordion.Header>

                    <div className="Section_Header">

                      <div className="Module_Info">

                          <h4 className='Icon'>
                            <FontAwesomeIcon icon={faChevronRight}/>
                          </h4>

                          <div className="Module_Title">

                            <span className='Title'>Module {index+1} : {module.title?.[i18n.language] || module.title?.en}</span>

                            <small className="Lesson_Count">
                                {module.lessons.length} Lectures • {formatDuration(moduleDuration)}
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
                          className="Lesson_Item"
                          key={lesson.id || idx}
                        >

                          <div className="Lesson_Left_Part">

                              <div className="Lesson_Icon">
                                  <FontAwesomeIcon icon={faPlayCircle}/>
                              </div>

                              <div className="Lesson_Content">

                                  <strong>
                                      {lesson.title?.[i18n.language] || lesson.title?.en||"Untitled Lesson"}
                                  </strong>

                                  <small>

                                      Preview Available

                                  </small>

                              </div>

                          </div>

                          <div className="Lesson_Right_Part">

                            <span className="Lesson_Duration">
                                <FontAwesomeIcon icon={faClock}/>
                                {formatLessonDuration(lesson.duration)}
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
          );

        })}


      </Accordion>
 
    </div>
  );
};

export default CourseCurriculum;