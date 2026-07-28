import React, { useState } from 'react'
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import { faAt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';

const MobileDeletedUsers = ({
    users,
    onDelete,
    onRestore,
}) => {

  const [activeMenu,setActiveMenu] = useState(null);

    // Badge based on Role
    const roleStyles = {
        student: "badge-student",
        teacher: "badge-teacher",
        moderator: "badge-moderator",
        admin: "badge-admin",
        super_admin: "badge-super-admin",
    };

    //role formater
    const formatRole = role =>
    role
        ?.replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());


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
            {users.map((user,index) => (

            <div 
              key={user.id}
              className="course-mobile-card"
            >

                {/* Card */}

                <div className="course-mobile-body-left">
                    <span className="course-no">
                        {index+1}
                    </span>

                        <img
                            src={user.profile_pic || "/default-course.png" }
                            alt={user.name}
                            className="course-mobile-thumbnail"
                        />


                    <div className="course-info" style={{gap:'1px'}}>
  
                        <h6 className="course-mobile-title fw-bold">
                            {user?.name}
                        </h6>

                        <p className="course-mobile-teacher" style={{fontWeight:'470'}}>
                            <FontAwesomeIcon icon={faAt} className='icon' style={{padding:0}}/> {user?.email}
                        </p>

                        <p className="course-mobile-category fw-semibold">
                          <FontAwesomeIcon icon={faTrash} className='icon' style={{padding:0}}/> 
                          
                            {` Deleted By : ${user.deleted_by?.name}`}
                            </p>

                          {/* <span className='mx-2'>•</span> */}
                        <p className="course-mobile-category fw-semibold">
                          <FontAwesomeIcon icon={faClock} className=' icon ' style={{padding:0}}/>

                            {` Deleted On : ${formatDate(user.deleted_at)}`}
                          
                        </p>



                    </div>


                <div className="course-mobile-body-right">

                    <div className="course-status">
                        <span className={`role-badge ${roleStyles[user.roles?.[0]?.name]}`}
                            style={{
                                margin:'auto',
                                fontSize:'9px',
                                width:'70px',
                                borderRadius:'5px',
                                padding:'5px',
                                textAlign:'center',
                                textTransform:'capitalize'
                            }}
                        >
                                    {formatRole(user.roles?.[0]?.name)}
                        </span>
                    </div>

                </div>
                    {/* Action button */}

                    <ActionButtons
                      mobile
                      menuOpen={activeMenu === user.id}
                      toggleMenu={() =>
                          setActiveMenu(activeMenu === user.id ? null : user.id)
                      }
                      closeMenu={() => setActiveMenu(null)}
                      onDelete={()=> onDelete(user)}
                      onRestore={()=> onRestore(user)}

/>

                </div>

            </div>



            ))}
        </>
  )
}

export default MobileDeletedUsers