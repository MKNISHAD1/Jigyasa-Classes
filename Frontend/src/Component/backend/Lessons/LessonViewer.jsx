import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import ClipLoader from "react-spinners/ClipLoader";
import { useTranslation } from "react-i18next";

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all lessons of the course to manage prev/next navigation
  const fetchLessons = async () => {
    try {
      const res = await fetch(`${apiUrl}courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.lessons)) {
        setLessons(data.lessons);
      } else {
        toast.error("Failed to load lessons list");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while loading lessons");
    }
  };

  // ✅ Fetch current lesson
  const fetchCurrentLesson = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}courses/${courseId}/view-lesson/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.status) {
        setCurrentLesson(data.lesson);
      } else toast.error(data.message || "Failed to fetch lesson");
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching lesson");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchLessons();
    fetchCurrentLesson(lessonId);
  }, [courseId, lessonId]);

  // ✅ Navigation logic
  const getLessonIndex = () =>
    lessons.findIndex((l) => String(l.id) === String(currentLesson?.id));

  const handlePrev = () => {
    const index = getLessonIndex();
    if (index > 0) {
      const prev = lessons[index - 1];
      navigate(`/admin/course/${courseId}/lesson/${prev.id}/lessonplayer`);
    }
  };

  const handleNext = () => {
    const index = getLessonIndex();
    if (index < lessons.length - 1) {
      const next = lessons[index + 1];
      navigate(`/admin/course/${courseId}/lesson/${next.id}/lessonplayer`);
    }
  };

  if (loading || !currentLesson) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <ClipLoader color="#007bff" size={50} />
      </div>
    );
  }

  const index = getLessonIndex();
  const isFirst = index === 0;
  const isLast = index === lessons.length - 1;

  return (
    <>
      <Header />
      <main>
        <div className="container my-4">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9">
              <div className="card shadow border-0 p-4">
                <h3 className="fw-bold text-center mb-4">
                  {currentLesson.title?.[i18n.language] || currentLesson.title?.en || "Untitled"}
                </h3>

                {/* Bunny video playback */}
                <div className="ratio ratio-16x9 mb-4">
                  <iframe
                    src={currentLesson.bunny_signed_url}
                    title={currentLesson.title?.[i18n.language] || currentLesson.title?.en || "Lesson Video"}
                    allowFullScreen
                    className="rounded"
                  ></iframe>
                </div>

                {/* Description and teacher info */}
                <div className="mb-4">
                  <h5>Description</h5>
                  <p>{currentLesson.description?.[i18n.language] || currentLesson.description?.en || "No description"}</p>

                  {currentLesson.teacher && (
                    <p className="text-muted">
                      <strong>Teacher:</strong> {currentLesson.teacher.name}
                    </p>
                  )}
                </div>

                {/* Materials */}
                {currentLesson.materials?.length > 0 && (
                  <div className="mb-4">
                    <h5>Lesson Materials</h5>
                    <ul className="list-group">
                      {currentLesson.materials.map((m) => (
                        <li
                          key={m.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{m.name}</span>
                          <div>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              View
                            </a>
                            <a
                              href={m.url}
                              download
                              className="btn btn-sm btn-outline-success"
                            >
                              Download
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handlePrev}
                    disabled={isFirst}
                  >
                    ⬅ Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleNext}
                    disabled={isLast}
                  >
                    Next ➡
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

export default LessonViewer;