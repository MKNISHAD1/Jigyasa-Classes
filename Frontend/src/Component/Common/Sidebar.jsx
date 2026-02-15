import React, { useContext } from 'react'
import '../../assets/css/style.scss'
import { AuthContext } from '../backend/context/Auth'
import RefreshLink from './RefreshLink';


const Sidebar = () => {
const {user,logout,hasAnyRole} = useContext(AuthContext);

const roleNames = Array.isArray(user?.roles)
  ? user.roles.map(r => (r.name ? r.name : r))
  : [];


  return (
<>
    <div className="card sidebar shadow border-0">
                    <div className="card-body">
                        <h4 className='text-center'>Sidebar</h4>
                        <ul>
                            <li><RefreshLink to="/admin/Managecategories">Manage Categories</RefreshLink></li>
                            <li><RefreshLink to="/dash">Dashboard</RefreshLink></li>
                            <li><RefreshLink to="/viewprofile">View Profile</RefreshLink></li>
                            <li><RefreshLink to="/changepassword">Change Password</RefreshLink></li>

                            {/* Course RefreshLinks  */}

                            {hasAnyRole(["teacher","admin","moderator","super_admin"]) && (
                            <>
                            <li><RefreshLink to="/admin/courses">Manage Courses</RefreshLink></li>
                            <li><RefreshLink to="/admin/course/create">Create Course</RefreshLink></li>
                            <li><RefreshLink to="/admin/course/deleted-Courses/">Deleted Courses</RefreshLink></li>
                            <li><RefreshLink to="/admin/faq/create">FAQ Section</RefreshLink></li>
                                </>
                            )}

                            {/* Lesson RefreshLinks  */}

                            {hasAnyRole(["teacher","admin","moderator","super_admin"]) && (
                            <>
                            {/* <li><RefreshLink to="/admin/courses">Manage Courses</RefreshLink></li> */}
                            <li><RefreshLink to="/admin/lesson/create">Create Lesson</RefreshLink></li>
                            <li><RefreshLink to="/admin/lesson/deleted-lessons/">Deleted Lessons</RefreshLink></li>
                                </>
                            )}


                            {/* Admin sidebar RefreshLinks */}



                            {hasAnyRole(["admin","moderator","super_admin"]) && (
                            <>
                            <li><RefreshLink to="/admin/users">Manage Users</RefreshLink></li>
                            <li><RefreshLink to="/admin/users/deletedusers">Deleted Users</RefreshLink></li>
                            <li><RefreshLink to="/admin/users/suspended-users">Suspended Users</RefreshLink></li>
                                </>
                            )}


                            {/* SuperAdmin PAnel  */}
                            {hasAnyRole(["super_admin"]) && (
                            <>
                            <li><RefreshLink to="#">Manage admins</RefreshLink></li>
                            <li><RefreshLink to="#">Deleted Admins</RefreshLink></li>
                            <li><RefreshLink to="#">Suspended Admins</RefreshLink></li>
                                </>
                            )}
                            <li >
                                <button onClick={logout} className='btn btn-danger mt-3'>Logout</button>
                            </li>
                        </ul>
                    </div>

                </div>
    </>
  )
}

export default Sidebar