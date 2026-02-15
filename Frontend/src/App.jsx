import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./Component/Frontend/Home";
import About from "./Component/Frontend/About";
import Registration from "./Component/backend/Registration";
import Login from "./Component/backend/Login";
import { ToastContainer } from "react-toastify";
import Dashboard from "./Component/backend/Dashboard";
import RequireAuth from "./Component/Common/RequireAuth";
import Test from "./Component/Common/test";
import Profile from "./Component/backend/Profile";
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
          <div>
            {/* 🔹 Banner Section */}
            {user && !user.email_verified_at && (
              <div className="bg-warning p-2 text-center">
                Please verify your email. Check your inbox or
                <button
                  onClick={resendVerification}
                  className="btn btn-success ml-2"
                >
                  Resend link
                </button>
              </div>
            )}

            <Routes>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/" element={<HomeUi />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/register"
                element={<Registration handleLogin={login} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<Forgotpassword />} />
              <Route path="/reset-password" element={<Resetpassword />} />
              {/* Email Verification Link  */}
              <Route path="/email-verified" element={<EmailVerified />} />

              <Route path="/unauthorized" element={<Home />} />

              <Route path="/two-factor" element={<TwofactOTP />} />

              <Route path="/videoplay" element={<Videotest />} />

              {/* Dashboard Page  */}
              <Route
                path="/dash"
                element={
                  <RequireAuth>
                    <Dashboard handleLogout={logout} />
                  </RequireAuth>
                }
              />

              {/* View profile page  */}
              <Route
                path="/viewprofile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />

              {/* Change Password page  */}
              <Route
                path="/changepassword"
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
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Test />
                  </RequireAuth>
                }
              />
              <Route
                path="/superadmin"
                element={
                  <RequireAuth allowedRoles={["super_admin"]}>
                    <SuperAdmin />
                  </RequireAuth>
                }
              />
              {/* Manage Users by admin only  */}
              <Route
                path="/admin/users"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Showusers />
                  </RequireAuth>
                }
              />

              {/* Create Users by admin only  */}
              <Route
                path="/admin/users/createuser"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Createuser />
                  </RequireAuth>
                }
              />

              {/* Edit Users by admin only  */}
              <Route
                path="/admin/users/edituser/:id"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Edituser />
                  </RequireAuth>
                }
              />
 
              {/* Tarshhed User List  */}
              <Route
                path="/admin/users/deletedusers"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <Deletedusers />
                  </RequireAuth>
                }
              />

            {/* Suspend Users */}
            <Route
                path="/admin/users/:id/suspend"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <SuspendUser />
                  </RequireAuth>
                }
                />

              {/* Suspended Users List and Unsuspend Action Button*/}
            <Route
                path="/admin/users/suspended-users"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin"]}>
                    <SuspendList />
                  </RequireAuth>
                }
                />
              {/* Course List and Action Button*/}
                <Route
                path="/admin/courses"
                element={
                  <RequireAuth allowedRoles={["admin", "moderator","super_admin","teacher"]}>
                    <CourseList />
                  </RequireAuth>
                }
                />

                {/* Create Course */}
                <Route
                path="/admin/course/create"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <CreateCourse />
                  </RequireAuth>
                }
                />

               {/* Create FAQ */}
                <Route
                path="/admin/faq/create"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <Faqs />
                  </RequireAuth>
                }
                />

                {/* View Courses */}
                <Route
                path="/admin/course/view-Course/:id"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <ViewCourse />
                  </RequireAuth>
                }
                />
                
                {/* Update Courses */}
                <Route
                path="/admin/course/update-Course/:id"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <UpdateCourse />
                  </RequireAuth>
                }
                />

                {/* Update Courses */}
                <Route
                path="/admin/course/deleted-Courses/"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher"]}>
                    <DeletedCourses />
                  </RequireAuth>
                }
                />

                {/* Create Lesson */}
                <Route
                path="/admin/lesson/create"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <CreateLesson />
                  </RequireAuth>
                }
                />

                {/* Deleted Lessons in course by user */}
                <Route
                path="/admin/course/:courseId/lessons/trashed"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <DeletedLessons />
                  </RequireAuth>
                }
                />

                {/* Change Lesson Order in course by user */}
                <Route
                path="/admin/course/:courseId/lesson/ChangeLessonOrder"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <ChangeLessonOrder />
                  </RequireAuth>
                }
                />

                {/* update lesson */}
                <Route
                path="/admin/course/:courseId/lesson/:lessonId/edit"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <UpdateLesson />
                  </RequireAuth>
                }
                />

                {/* View lesson UI Page*/}
                <Route
                path="/admin/course/:courseId/lesson/:lessonId/lessonplayer"
                element={
                  <RequireAuth allowedRoles={["moderator","super_admin","teacher","admin"]}>
                    <LessonViewer />
                  </RequireAuth>
                }
              />

                {/* manage Categoty Page*/}
                <Route
                path="/admin/ManageCategories"
                element={
                  <RequireAuth allowedRoles={["super_admin","teacher","admin"]}>
                    <ManageCategory />
                  </RequireAuth>
                }
              />


              </Routes>
          </div>
        </BrowserRouter>

        {/* Toaster */}
        <ToastContainer position="top-center" />
    </>
  );
}

export default App;
