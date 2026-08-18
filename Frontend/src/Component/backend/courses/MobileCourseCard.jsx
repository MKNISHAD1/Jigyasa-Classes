import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faEllipsisVertical, faFolder, faFolderClosed, faFolderTree, faTag, faUser, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { faFolderBlank, faFolderOpen, faUserCircle } from '@fortawesome/free-regular-svg-icons';
import { FaFolderOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MobileCourseCard = ({
  courses,
  onDelete
}) => {

  const { i18n } = useTranslation();
  const [activeMenu,setActiveMenu] = useState(null);
  

  return (
            <>
            {courses.map((course,index) => (

            <div 
              key={course.id}
              className="course-mobile-card"
            >

                {/* Card */}

                <div className="course-mobile-body-left">
                    <span className="course-no">
                        {index+1}
                    </span>


                    <Link to={`/admin/course/view-course/${course.id}`}>
                        <img
                            src={course.thumbnail || "/default-course.png" }
                            alt={course.title?.[i18n.language] || course.title?.en}
                            className="course-mobile-thumbnail"
                        />
                    </Link>


                    <div className="course-info">
                        <Link
                            to={`/admin/course/view-course/${course.id}`}
                            className="course-title-link"
                        >
                          <h6 className="course-mobile-title">
                              {course.title?.[i18n.language] || course.title?.en}
                          </h6>
                        </Link>

                        <p className="course-mobile-category">
                          <FontAwesomeIcon icon={faFolderClosed} className='icon'/> {course.category?.name?.[i18n.language] ||
                          course.category?.name?.en}

                          <span className='mx-2'>•</span><FontAwesomeIcon icon={faFolderTree} className=' icon'/> 

                          {course.subcategory?.name?.[i18n.language] ||
                          course.subcategory?.name?.en ||
                          "General"}
                        </p>

                        <p className="course-mobile-teacher">
                            <FontAwesomeIcon icon={faUser} className='icon'/> {course.teacher?.name || "N/A"}
                        </p>

                    </div>


                <div className="course-mobile-body-right">

                    <div className=" text-dark course-mobile-price">
                       {  course.price ? `₹ ${course.price}` : "Free"  }
                    </div>

                    <div className="course-status">
                      <span className={`badge ${
                      course.status==="published"
                      ?
                      "badge-published text-success"
                      :
                      "badge-draft"
                      }`}>
                         {course.status}
                      </span>
                    </div>

                </div>
                    {/* Action button */}

                    <ActionButtons
                      mobile
                      menuOpen={activeMenu === course.id}
                      toggleMenu={() =>
                          setActiveMenu(activeMenu === course.id ? null : course.id)
                      }
                      closeMenu={() => setActiveMenu(null)}
                      viewLink={`/admin/course/view-course/${course.id}`}
                      editLink={`/admin/course/update-course/${course.id}`}
                      onDelete={() =>onDelete(course)}
                      />

                </div>

            </div>



            ))}
        </>
  )
}

export default MobileCourseCard