import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/Auth";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { useTranslation } from "react-i18next";

const CreateLesson = () => {
  const { user } = useContext(AuthContext);
  const { i18n } = useTranslation();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState([
    {
      title: "",
      description: "",
      titleHi: "",
      descriptionHi: "",
      videoFile: null,
      materials: [],
      uploadProgress: 0,
      isUploading: false,
      isUploaded: false,
      collapsed: false,
    },
  ]);

  const uploadingRef = useRef(false);

  // Warn user on page leave
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (uploadingRef.current) {
        e.preventDefault();
        e.returnValue =
          "An upload is still in progress. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Fetch courses for logged-in user
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(apiUrl + "my-courses", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        });
        const data = await res.json();
        if (data.status && data.courses) setCourses(data.courses);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  // 🔹 Utility: handle lesson field change
  const handleLessonChange = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...lessons];
    updated[index].videoFile = file;
    setLessons(updated);
  };

  const handleMaterialChange = (index, files) => {
    const updated = [...lessons];
    updated[index].materials = files;
    setLessons(updated);
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: "",
        description: "",
        titleHi: "",
        descriptionHi: "",
        videoFile: null,
        materials: [],
        uploadProgress: 0,
        isUploading: false,
        isUploaded: false,
        collapsed: false,
      },
    ]);
  };

  // 🧩 Upload to Bunny
  const uploadToBunny = async (lesson, index) => {
    if (!selectedCourse) return toast.error("Please select a course first");
    if (!lesson.videoFile) return toast.error("Please select a video file");

    uploadingRef.current = true;
    setLessons((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, isUploading: true, uploadProgress: 0 } : l
      )
    );

    try {
    // Step 1: Create lesson metadata
    const formData = new FormData();
    //English field
    formData.append("title_en", lesson.title);
    formData.append("description_en", lesson.description);
    // Hindi Field
    formData.append("title_hi", lesson.titleHi || "");
    formData.append("description_hi", lesson.descriptionHi || "");

    const metaRes = await fetch(`${apiUrl}courses/${selectedCourse}/create-lesson`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: formData,
    });

    const metaData = await metaRes.json();
    if (!metaData?.lesson?.id) throw new Error("Failed to create lesson metadata");
    const lessonId = metaData.lesson.id;


   // Step 2: Upload video via proxy
    const proxyUploadUrl = `${apiUrl}lessons/${lessonId}/proxy-upload`;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", proxyUploadUrl, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token()}`);
    const safeFileName = encodeURIComponent(lesson.videoFile.name.replace(/[^\w.-]+/g, "_"));
    xhr.setRequestHeader("X-File-Name", safeFileName);
    xhr.setRequestHeader("X-File-Type", lesson.videoFile.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setLessons((prev) =>
          prev.map((l, i) =>
            i === index ? { ...l, uploadProgress: percent } : l
          )
        );
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        toast.success(`Lesson ${index + 1} video uploaded successfully!`);
        await finalizeUpload(lessonId);


        // ✅ Step 3: Upload materials (if any)
        if (lesson.materials && lesson.materials.length > 0) {
          const matForm = new FormData();
          lesson.materials.forEach((file) => matForm.append("materials[]", file));

          try {
            const matRes = await fetch(`${apiUrl}lessons/${lessonId}/upload-materials`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token()}` },
              body: matForm,
            });

            const matData = await matRes.json();
            if (matData.status) {
              toast.success("Materials uploaded successfully!");
            } else {
              toast.warn("Video uploaded, but materials failed.");
            }
          } catch (err) {
            console.error("Error uploading materials:", err);
            toast.warn("Network issue during materials upload.");
          }
        }
            // ✅ Step 4: Finalize UI
            setLessons((prev) =>
              prev.map((l, i) =>
                i === index
                  ? {
                      ...l,
                      isUploading: false,
                      isUploaded: true,
                      collapsed: true,
                      uploadProgress: 100,
                    }
                  : l
              )
            );
          } else {
            toast.error("Upload failed. Please retry.");
          }
          uploadingRef.current = false;
        };

        xhr.onerror = () => {
          toast.error("Upload failed due to network error.");
          uploadingRef.current = false;
        };

        xhr.send(lesson.videoFile);
      } catch (err) {
        console.error(err);
        toast.error("Error during upload.");
        uploadingRef.current = false;
      }
    };


  // ✅ Finalize upload after success
  const finalizeUpload = async (lessonId) => {
    await fetch(`${apiUrl}lessons/${lessonId}/finalize-upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    });
  };

  // 🔹 Toggle collapse for each lesson
  const toggleCollapse = (index) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index ? { ...lesson, collapsed: !lesson.collapsed } : lesson
      )
    );
  };

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9 dashboard">
              <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">Upload Lessons</h2>

                {/* Select Course */}
                <div className="mb-6">
                  <label className="block text-sm font-medium">Select Course</label>
                  <select
                    className="w-full border rounded p-2"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title?.[i18n.language] || course.title?.en}
                      </option>
                    ))}
                  </select>
                </div>
                <br />

                {/* Lessons List */}
                {selectedCourse &&
                  lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 mb-5 shadow-sm transition-all duration-300 ${
                        lesson.collapsed ? "bg-gray-100 opacity-80" : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg text-center">
                          Lesson {index + 1}
                        </h3>
                        {lesson.isUploaded && (
                          <span
                            className="text-green-600 text-sm font-medium cursor-pointer"
                            onClick={() => toggleCollapse(index)}
                          >
                            ✅ Uploaded (click to expand)
                          </span>
                        )}
                      </div>

                      {!lesson.collapsed && (
                        <>
                          {/* Title */}
                          <label className="block mb-1 font-medium">
                            Lesson Title
                          </label>
                          <br />
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              handleLessonChange(index, "title", e.target.value)
                            }
                            className="w-full border rounded p-2 mb-3"
                            placeholder="Enter lesson title"
                          />
                          <br />
                          <label className="block mb-1 font-medium">Lesson Title (Hindi - Optional)</label>
                          <br />
                          <input
                            type="text"
                            value={lesson.titleHi}
                            onChange={(e) => handleLessonChange(index, "titleHi", e.target.value)}
                            className="w-full border rounded p-2 mb-3"
                            placeholder="हिंदी शीर्षक दर्ज करें (optional)"
                          />
                          <br />
                          <label className="block mb-1 font-medium">Description (Hindi – Optional)</label><br />
                          <textarea
                            value={lesson.descriptionHi}
                            onChange={(e) =>
                              handleLessonChange(index, "descriptionHi", e.target.value)
                            }
                            className="w-full border rounded p-2 mb-3"
                            rows={3}
                            placeholder="हिंदी विवरण दर्ज करें (optional)"
                          />
                          <br />

                          {/* Description */}
                          <label className="block mb-1 font-medium">
                            Description
                          </label><br />
                          <textarea
                            value={lesson.description}
                            onChange={(e) =>
                              handleLessonChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2 mb-3"
                            rows={3}
                            placeholder="Enter lesson description"
                          /><br />

                          {/* Video Upload */}
                          <label className="block mb-1 font-medium">
                            Upload Video
                          </label><br />
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) =>
                              handleFileChange(index, e.target.files[0])
                            }
                            className="w-full border rounded p-2 mb-3"
                          /><br />

                          {/* Upload Progress */}
                          {lesson.uploadProgress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                              <div
                                className="bg-green-600 h-3 rounded-full"
                                style={{
                                  width: `${lesson.uploadProgress}%`,
                                  transition: "width 0.3s ease",
                                }}
                              ></div>
                            </div>
                          )}

                          {/* Materials Upload */}
                          <label className="block mb-1 font-medium">
                            Add Study Materials (optional)
                          </label><br />
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleMaterialChange(
                                index,
                                Array.from(e.target.files)
                              )
                            }
                            className="w-full border rounded p-2 mb-3"
                          /><br />

                          {/* Upload Button */}
                          <button
                            disabled={lesson.isUploading}
                            onClick={() => uploadToBunny(lesson, index)}
                            className={`w-full py-2 rounded text-white  bg-success ${
                              lesson.isUploading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {lesson.isUploading
                              ? `Uploading... ${lesson.uploadProgress}%`
                              : "Upload Lesson"}
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                {/* Add Lesson Button */}
                <button
                  type="button"
                  onClick={addLesson}
                  disabled={lessons.some((l) => l.isUploading)}
                  className={`mt-3 w-full py-2 rounded text-white bg-primary  ${
                    lessons.some((l) => l.isUploading)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  + Add Another Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateLesson;