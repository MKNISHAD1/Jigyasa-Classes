import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Registration from "./Component/backend/Registration";
import Login from "./Component/backend/Login";
import { ToastContainer } from "react-toastify";
import Dashboard from "./Component/backend/Dashboard";
import RequireAuth from "./Component/Common/RequireAuth";
import Test from "./Component/Common/test";
import Profile from "./Component/backend/ViewProfile";
import Changepassword from "./Component/backend/Changepassword";
import Showusers from "./Component/backend/users/Showusers";
import Createuser from "./Component/backend/users/Createuser";
import Edituser from "./Component/backend/users/Edituser";
import Deletedusers from "./Component/backend/users/Deletedusers";
import Resetpassword from "./Component/backend/Resetpassword";
import Forgotpassword from "./Component/backend/Forgotpassword";
import { useContext, useEffect, useState } from "react";
import { apiUrl, token } from "./Component/Common/http";
import EmailVerified from "./Component/backend/EmailVerified";
import { AuthContext } from "./Component/backend/context/Auth";
import TwofactOTP from "./Component/backend/TwofactOTP";
import SuspendUser from "./Component/backend/users/SuspendUser";
import SuspendList from "./Component/backend/users/SuspendList";
import SuperAdmin from "./Component/backend/SuperAdmin";
import CourseList from "./Component/backend/courses/CourseList";
import CreateCourse from "./Component/backend/courses/CreateCourse";
import ViewCourse from "./Component/backend/courses/ViewCourse";
import UpdateCourse from "./Component/backend/courses/UpdateCourse";
import DeletedCourses from "./Component/backend/courses/DeletedCourses";
import Faqs from "./Component/backend/courses/Faqs";
import CreateLesson from "./Component/backend/Lessons/CreateLesson";
import DeletedLessons from "./Component/backend/Lessons/DeletedLessons";
import ChangeLessonOrder from "./Component/backend/Lessons/ChangeLessonOrder";
import UpdateLesson from "./Component/backend/Lessons/UpdateLesson";
import Videotest from "./Component/Common/videotest";
import LessonViewer from "./Component/backend/Lessons/LessonViewer";
import ManageCategory from "./Component/backend/ManageCategory";
import HomeUi from "./Component/Frontend/Ui for Frontend/HomeUi";
import AboutUi from "./Component/Frontend/Ui for Frontend/AboutUi";
import ContactUi from "./Component/Frontend/Ui for Frontend/ContactUi";
import AllCoursesUi from "./Component/Frontend/Ui for Frontend/AllCoursesUi";
import CourseCardUi from "./Component/Common/CommonUI/CourseCardUi";
import ViewCourseUi from "./Component/Frontend/Ui for Frontend/ViewCourseUi";
import CourseModule from "./Component/backend/courses/CourseModule";
import CourseModuleReorder from "./Component/backend/courses/CourseModuleReorder";
import ModuleLessonReorder from "./Component/backend/courses/ModuleLessonReorder";
import ContactMessages from "./Component/backend/users/ContactMessages";
import ContactMessageView from "./Component/backend/users/ContactMessageView";
import { AUTH_ROUTES, CATEGORY_ROUTES, CONTACT_ROUTES, COURSE_ROUTES, DASHBOARD_ROUTES, FAQ_ROUTES, LESSON_ROUTES, PUBLIC_ROUTES, USER_ROUTES, UTILITY_ROUTES } from "./constants/nevigation/routes";
import { ROLE_GROUPS } from "./constants/nevigation/roles";
import ScrollToTop from "./Component/Common/CommonUI/ScrollToTop";
import DashboardLayout from "./Component/Frontend/DashboardUi/DashboardLayout";
import EditProfile from "./Component/backend/EditProfile";
import MyCourse from "./Component/backend/courses/MyCourse";
import ViewUserProfile from "./Component/backend/users/ViewUserProfile";


function App() {
  const {user, logout, login} = useContext(AuthContext);

  const resendVerification = () => {
    fetch(apiUrl + "email/verification-notification", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => alert(data.message || "Verification email sent ✅"))
      .catch(() => alert("Error sending verification link ❌"));
  };

  return (
    <>
        <BrowserRouter>

        {/* Scroll to page top */}
        <ScrollToTop/>

          <div>
            {/* Email verification Banner Section */}
            {user && !user.email_verified_at && (
              <div className="bg-warning p-2 text-center">
                Please verify your email. Check your inbox or 
                <button
                  onClick={resendVerification}
                  className="btn btn-success m-1"
                >
                  Resend link
                </button>
              </div>
            )}

            <Routes>
      {/* Public Routes */}

              {/* <Route path="/" element={<Home />} /> */}
              <Route path={PUBLIC_ROUTES.HOME} element={<HomeUi />} />
              {/* <Route path="/" element={<HomeUi />} /> */}
              <Route path={PUBLIC_ROUTES.ABOUT} element={<AboutUi />} />
              {/* <Route path="/About" element={<AboutUi />} /> */}
              <Route path={PUBLIC_ROUTES.CONTACT} element={<ContactUi />}/>
              {/* <Route path="Contact-Us" element={<ContactUi />}/> */}
              <Route path={PUBLIC_ROUTES.COURSES} element={<AllCoursesUi />}/>
              {/* <Route path="/Courses" element={<AllCoursesUi />}/> */}
              <Route path={PUBLIC_ROUTES.COURSE_CARD} element={<CourseCardUi />}/>
              {/* <Route path="/CourseCard" element={<CourseCardUi />}/> */}
              <Route path={PUBLIC_ROUTES.COURSE_VIEW} element={<ViewCourseUi />}/>
              {/* <Route path="/CourseView/:id/:title" element={<ViewCourseUi />}/> */}

      {/* Authentication */}

              <Route path={AUTH_ROUTES.REGISTER} element={<Registration handleLogin={login} />} />
              {/* <Route path="/register" element={<Registration handleLogin={login} />} /> */}
              <Route path={AUTH_ROUTES.LOGIN} element={<Login />} />
              {/* <Route path="/login" element={<Login />} /> */}
              <Route path={AUTH_ROUTES.FORGOT_PASSWORD} element={<Forgotpassword />} />
              {/* <Route path="/forgot-password" element={<Forgotpassword />} /> */}
              <Route path={AUTH_ROUTES.RESET_PASSWORD} element={<Resetpassword />} />
              {/* <Route path="/reset-password" element={<Resetpassword />} /> */}
              <Route path={AUTH_ROUTES.EMAIL_VERIFIED} element={<EmailVerified />} />
              {/* <Route path="/email-verified" element={<EmailVerified />} /> */}
              <Route path={AUTH_ROUTES.TWO_FACTOR} element={<TwofactOTP />} />
              {/* <Route path="/two-factor" element={<TwofactOTP />} /> */}
              <Route path={AUTH_ROUTES.UNAUTHORIZED} element={<HomeUi />} />
              {/* <Route path="/unauthorized" element={<HomeUi />} /> */}
              <Route path={UTILITY_ROUTES.VIDEO_TEST} element={<Videotest />} />
              {/* <Route path="/videoplay" element={<Videotest />} /> */}

      {/* Dashboard Pages  */}

      <Route
        element={
            <RequireAuth>
                <DashboardLayout />
            </RequireAuth>
        }
    >
      {/* Dashboard */}
      <Route path={DASHBOARD_ROUTES.DASHBOARD}
        element={
          <RequireAuth>
            <Dashboard handleLogout={logout} />
          </RequireAuth>
        }
      />

      {/* View  Profile */}
      <Route path={DASHBOARD_ROUTES.VIEW_PROFILE}
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* Edit  Profile */}
        <Route path={DASHBOARD_ROUTES.EDIT_PROFILE}
            element={
              <RequireAuth>
                <EditProfile />
              </RequireAuth>
            }
          />
        
        {/* Change Password page  */}
        <Route path={DASHBOARD_ROUTES.CHANGE_PASSWORD}
          element={
            <RequireAuth>
              <Changepassword />
            </RequireAuth>
          }
        />

        {/* Testing role based redirect for admin */}
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <Test />
            </RequireAuth>
          }
        />

        <Route
          path="/superadmin"
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.SUPER_ADMIN_ONLY}>
              <SuperAdmin />
            </RequireAuth>
          }
        />


        {/* Manage Users by admin only  */}
        <Route
          path={USER_ROUTES.LIST}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <Showusers />
            </RequireAuth>
          }
        />

        {/* Create Users by admin only  */}
        <Route
          path={USER_ROUTES.CREATE}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <Createuser />
            </RequireAuth>
          }
        />

        {/* View Users by admin only  */}
          <Route
            path={USER_ROUTES.VIEW}
            element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <ViewUserProfile />
            </RequireAuth>
          }
        />

        {/* Edit Users by admin only  */}
        <Route
          path={USER_ROUTES.EDIT}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <Edituser />
            </RequireAuth>
          }
        />

        {/* Tarshed User List  */}
        <Route
          path={USER_ROUTES.DELETED}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <Deletedusers />
            </RequireAuth>
          }
        />


        {/* Suspend Users */}
        <Route
          path={USER_ROUTES.SUSPEND}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <SuspendUser />
            </RequireAuth>
          }
        />

        {/* Suspended Users List and Unsuspend Action Button*/}
        <Route
            path={USER_ROUTES.SUSPENDED}
            element={
              <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
                <SuspendList />
              </RequireAuth>
            }
        />

        {/* My Course Only  */}
        <Route
          path={COURSE_ROUTES.MY_COURSE}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <MyCourse />
            </RequireAuth>
          }
        />

        {/* All Courses List and Action Button*/}
        <Route
          path={COURSE_ROUTES.LIST}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <CourseList />
            </RequireAuth>
          }
        />

        {/* Create Course */}
        <Route
          path={COURSE_ROUTES.CREATE}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <CreateCourse />
            </RequireAuth>
          }
        />

        {/* View Courses */}
        <Route
          path={COURSE_ROUTES.VIEW}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <ViewCourse />
            </RequireAuth>
          }
        />

        
        {/* Update Courses */}
        <Route
          path={COURSE_ROUTES.UPDATE}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <UpdateCourse />
            </RequireAuth>
          }
        />

        {/* Deleted Courses */}
        <Route
          path={COURSE_ROUTES.DELETED}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <DeletedCourses />
            </RequireAuth>
          }
        />

        {/* Create FAQ */}
        <Route
        path={FAQ_ROUTES.CREATE}
        element={
          <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
            <Faqs />
          </RequireAuth>
        }
        />


        {/* Course Module */}
        <Route path={COURSE_ROUTES.MODULES} 
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <CourseModule />
            </RequireAuth>
          } />

        {/* Reorder Course Module */}
        <Route path={COURSE_ROUTES.MODULE_ORDER} 
          element={
          <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
            <CourseModuleReorder />
          </RequireAuth>
          } />

        {/* Reordder Lessons Inside Module  */}
        <Route path={COURSE_ROUTES.MODULE_LESSON_REORDER} 
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <ModuleLessonReorder />
            </RequireAuth>
          } />

        {/* Create Lesson */}
        <Route
          path={LESSON_ROUTES.CREATE}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <CreateLesson />
            </RequireAuth>
          }
        />


        {/* update lesson */}
        <Route
        path={LESSON_ROUTES.EDIT}
        element={
          <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
            <UpdateLesson />
          </RequireAuth>
        }
        />

        {/* View lesson UI Page*/}
        <Route
        path={LESSON_ROUTES.PLAYER}
        element={
          <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
            <LessonViewer />
          </RequireAuth>
        }
      />
        
        {/* Change Lesson Order in course by user */}
        <Route
        path={LESSON_ROUTES.ORDER}
        element={
          <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
            <ChangeLessonOrder />
          </RequireAuth>
        }
        />
        
        {/* Deleted Lessons in course by user */}
        <Route
        path={LESSON_ROUTES.TRASH}
        element={
          <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
            <DeletedLessons />
          </RequireAuth>
        }
        />

        {/* manage Categoty Page*/}
        <Route
          path={CATEGORY_ROUTES.MANAGE}
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.COURSE_ACCESS}>
              <ManageCategory />
            </RequireAuth>
          }
        />

       {/* Contact Message List  */}
        <Route path={CONTACT_ROUTES.LIST} 
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <ContactMessages />
            </RequireAuth>
          } />

       {/* Contact Message View  */}

        <Route path={CONTACT_ROUTES.VIEW} 
          element={
            <RequireAuth allowedRoles={ROLE_GROUPS.ADMIN_ACCESS}>
              <ContactMessageView />
            </RequireAuth>
          } />
</Route>


              {/* <Route path="/dash" 
                element={
                  <RequireAuth>
                    <Dashboard handleLogout={logout} />
                  </RequireAuth>
                }
              />              */}

              {/* View profile page  */}


              {/* <Route
                path="/viewprofile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />               */}

              {/* <Route
                path="/changepassword"
                element={
                  <RequireAuth>
                    <Changepassword />
                  </RequireAuth>
                }
              /> */}


              {/* <Route
                path="/admin"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Test />
                  </RequireAuth>
                }
              />              */}


              {/* <Route
                path="/superadmin"
                element={
                  <RequireAuth allowedRoles={["super_admin"]}>
                    <SuperAdmin />
                  </RequireAuth>
                }
              />               */}


              {/* <Route
                path="/admin/users"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Showusers />
                  </RequireAuth>
                }
              /> */}

              {/* <Route
                path="/admin/users/createuser"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Createuser />
                  </RequireAuth>
                }
              /> */}


              {/* <Route
                path="/admin/users/edituser/:id"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Edituser />
                  </RequireAuth>
                }
              /> */}

              {/* <Route
                path="/admin/users/deletedusers"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Deletedusers />
                  </RequireAuth>
                }
              /> */}

            {/* <Route
                path="/admin/users/:id/suspend"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <SuspendUser />
                  </RequireAuth>
                }
                /> */}


                            {/* <Route
                path="/admin/users/suspended-users"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <SuspendList />
                  </RequireAuth>
                }
                /> */}


{/* 
                                <Route
                path="/admin/courses"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin","teacher"]}>
                    <CourseList />
                  </RequireAuth>
                }
                /> */}


                                {/* <Route
                path="/admin/course/create"
                element={
                  <RequireAuth allowedRoles={["moderator","admin","super_admin","teacher"]}>
                    <CreateCourse />
                  </RequireAuth>
                }
                /> */}




                                {/* <Route
                path="/admin/course/view-Course/:id"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <ViewCourse />
                  </RequireAuth>
                }
                /> */}

                {/* <Route
                path="/admin/course/update-Course/:id"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <UpdateCourse />
                  </RequireAuth>
                }
                /> */}


                {/* <Route
                path="/admin/course/deleted-Courses/"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <DeletedCourses />
                  </RequireAuth>
                }
                /> */}

              {/* <Route path="/admin/course/:id/course-modules" element={<CourseModule />} /> */}
              {/* <Route path="admin/course/:id/module-order" element={<CourseModuleReorder />} /> */}
            
              {/* <Route path="/admin/course/:id/module/:moduleId/reorder-lessons" element={<ModuleLessonReorder />} /> */}


                {/* <Route
                path="/admin/lesson/create"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <CreateLesson />
                  </RequireAuth>
                }
                /> */}

              {/* <Route
                path="/admin/course/:courseId/lessons/trashed"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <DeletedLessons />
                  </RequireAuth>
                }
                /> */}

                                {/* <Route
                path="/admin/course/:courseId/lesson/ChangeLessonOrder"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <ChangeLessonOrder />
                  </RequireAuth>
                }
                /> */}

                                {/* <Route
                path="/admin/course/:courseId/lesson/:lessonId/edit"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <UpdateLesson />
                  </RequireAuth>
                }
                /> */}

 
              {/* <Route
                path="/admin/course/:courseId/lesson/:lessonId/lessonplayer"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <LessonViewer />
                  </RequireAuth>
                }
              /> */}


                                {/* <Route
                  path="/admin/ManageCategories"
                  element={
                    <RequireAuth allowedRoles={["super_admin","teacher","admin"]}>
                      <ManageCategory />
                    </RequireAuth>
                  }
                /> */}

              


                {/* <Route
                path="/admin/faq/create"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <Faqs />
                  </RequireAuth>
                }
                /> */}

              
              {/* <Route path="admin/contact-messages" element={<ContactMessages />} /> */}

              {/* <Route path="/admin/contact-message/:id" element={<ContactMessageView />} /> */}



              </Routes>
          </div>
        </BrowserRouter>

        {/* Toaster */}
        <ToastContainer position="top-center" />
    </>
  );
}

export default App;
