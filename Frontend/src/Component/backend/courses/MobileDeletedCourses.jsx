import { faChalkboard, faClock, faTrash, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react'
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import { useTranslation } from 'react-i18next';

const MobileDeletedCourses = ({

  courses,
  onDelete,
  onRestore,
}) => {

  const { i18n } = useTranslation();
  const [activeMenu,setActiveMenu] = useState(null);

  // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

        return new Date(date).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"long",
            year:"numeric",
        });

    };  

  
return (
        <>
            {courses.map((course,index) => (

            <div 
              key={course.id}
              className="course-mobile-card p-3"
            >

                {/* Card */}

                <div className="course-mobile-body-left">
                    <span className="course-no" style={{fontSize:'12px'}}>
                        {index+1}
                    </span>

                        <img
                            src={course.thumbnail || "/default-course.png" }
                            alt={course.title?.[i18n.language] || course.title?.en}
                            className="course-mobile-thumbnail"
                            style={{
                                height:'60px',
                                width:'90px',
                                aspectRatio:'16/9'
                            }}
                        />


                    <div className="course-info" style={{gap:'1px'}}>
  
                        <h6 className="course-mobile-title fw-bold">
                            {course.title?.[i18n.language] || course.title?.en}
                        </h6>

                        <p className="course-mobile-teacher" style={{fontWeight:'470'}}>
                            <FontAwesomeIcon icon={faUserTie} className='icon' style={{padding:0}}/> {course.teacher?.name || "N/A"}
                        </p>

                        <p className="course-mobile-category fw-semibold">
                          <FontAwesomeIcon icon={faTrash} className='icon' style={{padding:0}}/> 
                          
                            {` Deleted By : ${course.deleted_by?.name}`}
                            </p>

                          {/* <span className='mx-2'>•</span> */}
                        <p className="course-mobile-category fw-semibold">
                          <FontAwesomeIcon icon={faClock} className=' icon ' style={{padding:0}}/>

                            {` Deleted On : ${formatDate(course.deleted_at)}`}
                          
                        </p>



                    </div>

{/* 
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
                      "badge-draft text-secondary"
                      }`}>
                         {course.status}
                      </span>
                    </div>

                </div> */}
                    {/* Action button */}

                    <ActionButtons
                      mobile
                      menuOpen={activeMenu === course.id}
                      toggleMenu={() =>
                          setActiveMenu(activeMenu === course.id ? null : course.id)
                      }
                      closeMenu={() => setActiveMenu(null)}
                      onDelete={() =>onDelete(course)}
                      onRestore={() =>onRestore(course)}

                      />

                </div>

            </div>



            ))}
        </>
  )
}

export default MobileDeletedCourses