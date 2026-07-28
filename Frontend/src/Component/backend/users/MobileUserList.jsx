import React, { useState } from 'react'
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt, faChalkboardTeacher, faEllipsisVertical, faEnvelope, faFolder, faFolderClosed, faFolderTree, faTag, faUser, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { faFolderBlank, faFolderOpen, faUserCircle } from '@fortawesome/free-regular-svg-icons';
import { FaFolderOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MobileUserList = ({
    users,
    onDelete,
}) => {

    // Badge based on Role
    const roleStyles = {
        student: "badge-student",
        teacher: "badge-teacher",
        moderator: "badge-moderator",
        admin: "badge-admin",
        super_admin: "badge-super-admin",
    };

    const formatRole = role =>
    role
        ?.replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

  const [activeMenu,setActiveMenu] = useState(null);
  

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


                    <Link to={`/admin/users/view-user/${user.id}`}>
                        <img
                            src={user.profile_pic || "/default-course.png" }
                            alt={user.name}
                            className="course-mobile-thumbnail"
                        />
                    </Link>


                    <div className="course-info">
                        <Link
                            to={`/admin/users/view-user/${user.id}`}
                            className="course-title-link"
                        >
                          <h6 className="course-mobile-title">
                              {user.name}
                          </h6>
                        </Link>

                        <p className="course-mobile-category" style={{textTransform:'none'}}>
                          <FontAwesomeIcon icon={faAt} className='icon' style={{padding:'0'}}/> {user.username}

                        </p>

                        <p className="course-mobile-teacher">
                            <FontAwesomeIcon icon={faEnvelope} className='icon' style={{padding:'0'}} /> {user.email}
                        </p>

                    </div>


                <div className="course-mobile-body-right">

                    <div className="course-status">
                        <span className={`role-badge ${roleStyles[user.role]}`}
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
                                    {formatRole(user.role)}
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
                      viewLink={`/admin/users/view-user/${user.id}`}
                      editLink={`/admin/users/edit-user/${user.id}`}
                      onDelete={()=> onDelete(user)}
                      suspendLink={`/admin/users/${user.id}/suspend`}
                      />

                </div>

            </div>



            ))}
        </>
  )
}

export default MobileUserList