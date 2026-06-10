import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import LessonTable from "../Lessons/LessonTable";

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const res = await fetch(apiUrl + "view-course/" + id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();

      if (result.status) {
        setCourse(result.course);
      } else {
        toast.error("Failed to fetch course details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong while fetching course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

    const handleLessonDeleted = (lessonId) => {
      setCourse((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((l) => l.id !== lessonId),
      }));
    };

  if (loading) return <p className="text-center my-5">Loading course...</p>;
  if (!course) return <p className="text-center my-5">Course not found!</p>;

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9">
              <div className="card shadow border-0 p-4">
                <h4 className="mb-3">Course Details</h4>

                {/* Basic Info */}

                <div className="mb-3">
                  <strong>Title:</strong> {course.title?.[i18n.language] || course.title?.en}
                </div>

                <div className="mb-3">
                  <strong>Description:</strong> {course.description?.[i18n.language] || course.description?.en}
                </div>

                <div className="mb-3">
                  <strong>Category:</strong> {course.category?.name?.[i18n.language] || course.category?.name?.en}
                </div>

                <div className="mb-3">
                  <strong>Subcategory:</strong> {course.subcategory?.name?.[i18n.language] || course.subcategory?.name?.en}
                </div>

                <div className="mb-3">
                  <strong>Teacher:</strong> {course.teacher?.name || "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Status:</strong> {course.status}
                </div>
                <div className="mb-3">
                  <strong>Price:</strong>{" "}
                  {course.price ? `$${course.price}` : "Free"}
                </div>

                {/* Thumbnail */}
                <div className="mb-3">
                  <strong>Thumbnail:</strong>
                  <br />
                  <img
                    src={course.thumbnail || "/images/default-thumbnail.jpg"}
                    alt="Course Thumbnail"
                    style={{ width: "200px", borderRadius: "5px", objectFit: "cover" }}
                  />
                </div>


              {/* ✅ Lesson Table Section */}
              <LessonTable
                lessons={course.lessons}
                courseId={course.id}
                onLessonDeleted={handleLessonDeleted}
                reloadLessons={fetchCourse}
              />


                {/* Buttons */}
                <div className="d-flex gap-3 mt-4">
                  <Link
                    to={`/admin/course/${course.id}/course-modules`}
                    className="btn btn-success"
                  >
                    Manage Structure
                  </Link>

                  <Link
                    to={`/admin/course/update-Course/${course.id}`}
                    className="btn btn-primary"
                  >
                    Update Course
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin/courses")}
                  >
                    Back to Course List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CourseView;
