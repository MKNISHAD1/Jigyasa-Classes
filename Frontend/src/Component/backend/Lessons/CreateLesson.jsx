import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/Auth";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { faA, faAngleRight, faArrowLeft, faCircleCheck, faCirclePlus, faClose, faFileAlt, faFileCirclePlus, faPhotoFilm, faPlus, faUpload, faVideo } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";


const CreateLesson = () => {
  const { user } = useContext(AuthContext);
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const createEmptyLesson = () => ({
    title: "",
    description: "",
    titleHi: "",
    descriptionHi: "",
    videoFile: null,
    materials: [],

    uploadProgress: 0,
    uploadStage: "idle",

    // Backend queue status
    uploadStatus: "idle",

    isUploading: false,
    isUploaded: false,
    collapsed: false,
  });

  const [lessons, setLessons] = useState([createEmptyLesson()]);

  const uploadingRef = useRef(false);
  const activeXhrRef = useRef(null);
  const activeUploadRef = useRef(null);  
  const cancelRequestedRef = useRef(false);
  const pollTimeoutRef = useRef(null);

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
  setLessons((prev) =>
    prev.map((lesson, i) =>
      i === index
        ? {
            ...lesson,
            materials: [...lesson.materials, ...files],
          }
        : lesson
    )
  );
};

const requestLeave = (navigationAction) => {
  if (uploadingRef.current) {
    setPendingNavigation(() => navigationAction);
    setLeaveOpen(true);
    return;
  }

  navigationAction();
};

const addLesson = () => {
  setLessons((prev) => [
    ...prev,
    createEmptyLesson(),
  ]);
};

// 🧩 Upload lesson video to Bunny
const uploadToBunny = async (lesson, index) => {
  if (!selectedCourse) {
    return toast.error("Please select a course first");
  }

  if (!lesson.title.trim()) {
    return toast.error(
      `Please enter a title for Lesson ${index + 1}`
    );
  }

  if (!lesson.videoFile) {
    return toast.error(
      `Please select a video for Lesson ${index + 1}`
    );
  }

  uploadingRef.current = true;
  cancelRequestedRef.current = false;

  const uploadUuid = crypto.randomUUID();

  try {
    /*
    |--------------------------------------------------------------------------
    | STEP 0: Create upload session
    |--------------------------------------------------------------------------
    */

    const startRes = await fetch(
      `${apiUrl}lessons/start-upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upload_uuid: uploadUuid,
          course_id: selectedCourse,

          title_en: lesson.title,
          description_en: lesson.description || "",

          title_hi: lesson.titleHi || "",
          description_hi: lesson.descriptionHi || "",

          original_filename: lesson.videoFile.name,
          mime_type:
            lesson.videoFile.type ||
            "application/octet-stream",
        }),
      }
    );

    const startData = await startRes.json();

    if (
      !startRes.ok ||
      !startData.status ||
      !startData.upload_uuid
    ) {
      throw new Error(
        startData.message ||
          "Failed to create upload session."
      );
    }

    const confirmedUploadUuid =
      startData.upload_uuid;

    /*
    |--------------------------------------------------------------------------
    | Store active upload information
    |--------------------------------------------------------------------------
    */

    activeUploadRef.current = {
      uploadUuid: confirmedUploadUuid,
      index,
    };

    /*
    |--------------------------------------------------------------------------
    | Update UI
    |--------------------------------------------------------------------------
    */

    setLessons((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              ...l,
              isUploading: true,
              uploadProgress: 0,
              uploadStage: "uploading",
              uploadStatus : "uploading",
            }
          : l
      )
    );

    /*
    |--------------------------------------------------------------------------
    | STEP 1: Upload video
    |--------------------------------------------------------------------------
    */

    const proxyUploadUrl =
      `${apiUrl}lessons/proxy-upload`;

    const xhr = new XMLHttpRequest();

    activeXhrRef.current = xhr;

    xhr.open(
      "POST",
      proxyUploadUrl,
      true
    );

    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${token()}`
    );

    xhr.setRequestHeader(
      "Accept",
      "application/json"
    );

    xhr.setRequestHeader(
      "X-Course-Id",
      selectedCourse
    );

    xhr.setRequestHeader(
      "X-Upload-UUID",
      confirmedUploadUuid
    );

    xhr.setRequestHeader(
      "X-Title-En",
      encodeURIComponent(lesson.title)
    );

    xhr.setRequestHeader(
      "X-Description-En",
      encodeURIComponent(
        lesson.description || ""
      )
    );

    xhr.setRequestHeader(
      "X-Title-Hi",
      encodeURIComponent(
        lesson.titleHi || ""
      )
    );

    xhr.setRequestHeader(
      "X-Description-Hi",
      encodeURIComponent(
        lesson.descriptionHi || ""
      )
    );

    const safeFileName =
      encodeURIComponent(
        lesson.videoFile.name.replace(
          /[^\w.-]+/g,
          "_"
        )
      );

    xhr.setRequestHeader(
      "X-File-Name",
      safeFileName
    );

    xhr.setRequestHeader(
      "X-File-Type",
      lesson.videoFile.type ||
        "application/octet-stream"
    );

    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) {
        return;
      }

      const percent = Math.round(
        (e.loaded / e.total) * 100
      );

      setLessons((prev) =>
        prev.map((l, i) =>
          i === index
            ? {
                ...l,
                uploadProgress: percent,
              }
            : l
        )
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Laravel upload completed
    |--------------------------------------------------------------------------
    */

    xhr.onload = async () => {
      console.log(
        "Temporary upload XHR completed:",
        xhr.status
      );

      if (cancelRequestedRef.current) {
        console.log(
          "Upload was cancelled. Ignoring XHR completion."
        );
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        uploadingRef.current = false;
        activeXhrRef.current = null;
        activeUploadRef.current = null;

        setLessons((prev) =>
          prev.map((l, i) =>
            i === index
              ? {
                  ...l,
                  isUploading: false,
                  uploadStage: "idle",
                }
              : l
          )
        );

        toast.error(
          "Video upload failed. Please retry."
        );

        return;
      }

      try {
        const uploadData =
          JSON.parse(
            xhr.responseText || "{}"
          );

        console.log(
          "Temporary upload response:",
          uploadData
        );

        if (!uploadData.status) {
          throw new Error(
            uploadData.message ||
              "Temporary upload failed."
          );
        }

        if (
          uploadData.upload_uuid &&
          uploadData.upload_uuid !==
            confirmedUploadUuid
        ) {
          throw new Error(
            "Upload session UUID mismatch."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 2: Queue HLS processing
        |--------------------------------------------------------------------------
        */

        setLessons((prev) =>
          prev.map((l, i) =>
            i === index
              ? {
                  ...l,
                  uploadProgress: 100,
                  uploadStage: "queued",
                  uploadStatus: "queued",
                }
              : l
          )
        );

        if (cancelRequestedRef.current) {
          console.log(
            "Cancellation requested. Skipping HLS processing."
          );

          return;
        }

        const hlsRes = await fetch(
          `${apiUrl}lessons/${confirmedUploadUuid}/process-hls`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          }
        );

        const hlsData = await hlsRes.json();

        console.log(
          "HLS queue response:",
          hlsData
        );

        if (!hlsRes.ok || !hlsData.status) {
          throw new Error(
            hlsData.message ||
              "Failed to queue video processing."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 2.1: Poll queue/job status
        |--------------------------------------------------------------------------
        */

        setLessons((prev) =>
          prev.map((l, i) =>
            i === index
              ? {
                  ...l,
                  uploadStage: "processing",
                  uploadStatus:
                    hlsData.upload_status ||
                    "queued",
                }
              : l
          )
        );

        const processingResult =
          await pollUploadStatus(
            confirmedUploadUuid,
            index
          );

        /*
        |--------------------------------------------------------------------------
        | Processing was cancelled
        |--------------------------------------------------------------------------
        */

        if (processingResult === "cancelled") {
          console.log(
            "Upload processing was cancelled."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | HLS processing completed
        |--------------------------------------------------------------------------
        */

        if (processingResult !== "processed") {
          throw new Error(
            "Video processing did not complete."
          );
        }

        console.log(
          "HLS processing completed successfully."
        );

        setLessons((prev) =>
        prev.map((l, i) =>
          i === index
            ? {
                ...l,
                uploadStage: "creating-lesson",
                uploadStatus: "processed",
              }
            : l
        )
      );


        /*
        |--------------------------------------------------------------------------
        | STEP 3: Create Lesson
        |--------------------------------------------------------------------------
        |
        | HLS processing is complete.
        | Now create the actual Lesson record.
        |--------------------------------------------------------------------------
        */

        const lessonRes = await fetch(
          `${apiUrl}courses/${selectedCourse}/create-lesson`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token()}`,

              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              upload_uuid:
                confirmedUploadUuid,

              title_en:
                lesson.title,

              title_hi:
                lesson.titleHi || "",

              description_en:
                lesson.description || "",

              description_hi:
                lesson.descriptionHi || "",

              status:
                "draft",

              is_free_preview:
                false,
            }),
          }
        );


        const lessonData =
          await lessonRes.json();


        console.log(
          "Create lesson response:",
          lessonData
        );


        if (
          !lessonRes.ok ||
          !lessonData.status ||
          !lessonData.lesson_id
        ) {
          throw new Error(
            lessonData.message ||
              "Failed to create lesson."
          );
        }


        /*
        |--------------------------------------------------------------------------
        | Store Lesson ID
        |--------------------------------------------------------------------------
        */

        const lessonId =
          lessonData.lesson_id;


        console.log(
          "Lesson created successfully. ID:",
          lessonId
        );

        if (lesson.materials && lesson.materials.length > 0) {

          setLessons((prev) =>

            prev.map((l, i) =>

              i === index

                ? {

                    ...l,

                    uploadStage: "uploading-materials",

                  }

                : l

            )

          );

        }


        /*
        |--------------------------------------------------------------------------
        | STEP 4: Materials
        |--------------------------------------------------------------------------
        */

        if (
          lesson.materials &&
          lesson.materials.length > 0
        ) {       
          const matForm =
            new FormData();

          lesson.materials.forEach(
            (file) => {
              matForm.append(
                "materials[]",
                file
              );
            }
          );

          const matRes =
            await fetch(
              `${apiUrl}lessons/${lessonId}/upload-materials`,
              {
                method: "POST",
                headers: {
                  Authorization:
                    `Bearer ${token()}`,
                },
                body: matForm,
              }
            );

          const matData =
            await matRes.json();

            console.log(
              "Material upload response:",
              matData
            );

          if (
            !matRes.ok ||
            !matData.status
          ) {
            toast.warn(
              "Video uploaded, but some materials failed."
            );
          } else {
            toast.success(
              "Materials uploaded successfully!"
            );
          }
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 4: Finished
        |--------------------------------------------------------------------------
        */

        setLessons((prev) =>
          prev.map((l, i) =>
            i === index
              ? {
                  ...l,
                  isUploading: false,
                  isUploaded: true,
                  collapsed: true,
                  uploadProgress: 100,
                  uploadStage: "completed",
                }
              : l
          )
        );

        toast.success(
          `Lesson ${index + 1} uploaded successfully!`
        );

      } catch (err) {
        console.error(
          "Lesson upload/completion error:",
          err
        );

        setLessons((prev) =>
          prev.map((l, i) =>
            i === index
              ? {
                  ...l,
                  isUploading: false,
                  uploadStage: "idle",
                }
              : l
          )
        );

        toast.error(
          err.message ||
            "Error during lesson upload."
        );

      } finally {
        if (
          !cancelRequestedRef.current
        ) {
          uploadingRef.current = false;
          activeXhrRef.current = null;
          activeUploadRef.current = null;
        }
      }
    };

    /*
    |--------------------------------------------------------------------------
    | XHR abort
    |--------------------------------------------------------------------------
    */

    xhr.onabort = () => {
      console.log(
        "XHR temporary upload aborted."
      );

      if (
        cancelRequestedRef.current
      ) {
        console.log(
          "XHR abort expected because upload was cancelled."
        );
        return;
      }

      uploadingRef.current = false;
      activeXhrRef.current = null;
      activeUploadRef.current = null;

      setLessons((prev) =>
        prev.map((l, i) =>
          i === index
            ? {
                ...l,
                isUploading: false,
                uploadStage: "idle",
              }
            : l
        )
      );

      toast.error(
        "Upload was interrupted."
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Network error
    |--------------------------------------------------------------------------
    */

    xhr.onerror = () => {
      if (
        cancelRequestedRef.current
      ) {
        console.log(
          "XHR error ignored because cancellation is in progress."
        );
        return;
      }

      console.error(
        "XHR upload network error."
      );

      uploadingRef.current = false;
      activeXhrRef.current = null;
      activeUploadRef.current = null;

      setLessons((prev) =>
        prev.map((l, i) =>
          i === index
            ? {
                ...l,
                isUploading: false,
                uploadStage: "idle",
              }
            : l
        )
      );

      toast.error(
        "Upload failed due to network error."
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Start upload
    |--------------------------------------------------------------------------
    */

    xhr.send(
      lesson.videoFile
    );

  } catch (err) {
    console.error(
      "Lesson upload error:",
      err
    );

    uploadingRef.current = false;
    activeXhrRef.current = null;
    activeUploadRef.current = null;

    setLessons((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              ...l,
              isUploading: false,
              uploadStage: "idle",
            }
          : l
      )
    );

    toast.error(
      err.message ||
        "Error during lesson upload."
    );
  }
};

//  check hls  proccessing status
const pollUploadStatus = (uploadUuid, index) => {
  return new Promise((resolve, reject) => {
    const check = async () => {
      if (
        cancelRequestedRef.current ||
        activeUploadRef.current?.uploadUuid !== uploadUuid
      ) {
        resolve("cancelled");
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}lessons/${uploadUuid}/upload-status`,
          {
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        console.log(
          "Upload status:",
          uploadUuid,
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to check upload status."
          );
        }

        const status = data.upload_status;

        /*
        |--------------------------------------------------------------------------
        | Save backend status into lesson state
        |--------------------------------------------------------------------------
        */

        setLessons((prev) =>
          prev.map((lesson, i) =>
            i === index
              ? {
                  ...lesson,
                  uploadStatus: status,
                }
              : lesson
          )
        );

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        if (status === "processed") {
          resolve("processed");
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | FAILURE
        |--------------------------------------------------------------------------
        */

        if (status === "failed") {
          reject(
            new Error(
              data.message ||
                "Video processing failed."
            )
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | CANCELLED
        |--------------------------------------------------------------------------
        */

        if (
          status === "cancelling" ||
          status === "cancelled"
        ) {
          resolve("cancelled");
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | QUEUED / PROCESSING / OTHER ACTIVE STATUS
        |--------------------------------------------------------------------------
        */

        pollTimeoutRef.current = setTimeout(
          check,
          3000
        );
      } catch (error) {
        console.error(
          "Upload status check failed:",
          error
        );

        /*
        | Temporary network/status error.
        | Keep checking.
        */

        if (
          !cancelRequestedRef.current &&
          activeUploadRef.current?.uploadUuid ===
            uploadUuid
        ) {
          pollTimeoutRef.current = setTimeout(
            check,
            5000
          );
        }
      }
    };

    check();
  });
};

// Cancel upload
const cancelUpload = async () => {

  const activeUpload =
    activeUploadRef.current;

  if (!activeUpload) {
    toast.error(
      "No active upload session found."
    );

    return false;
  }

  const {
    uploadUuid,
    index,
  } = activeUpload;

  /*
  |--------------------------------------------------------------------------
  | Tell XHR completion handler to ignore completion
  |--------------------------------------------------------------------------
  */

  cancelRequestedRef.current = true;

  /*
  |--------------------------------------------------------------------------
  | Show cancelling state
  |--------------------------------------------------------------------------
  */

  setLessons((prev) =>
    prev.map((lesson, i) =>
      i === index
        ? {
            ...lesson,
            uploadStage: "cancelling",
          }
        : lesson
    )
  );

  try {

    console.log(
      "Requesting upload cancellation:",
      uploadUuid
    );

    /*
    |--------------------------------------------------------------------------
    | FIRST: Tell backend to cancel
    |--------------------------------------------------------------------------
    */

    const res = await fetch(
      `${apiUrl}lessons/${uploadUuid}/cancel-upload`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token()}`,

          Accept:
            "application/json",
        },
      }
    );

    const data =
      await res.json();

    if (
      !res.ok ||
      !data.status
    ) {
      throw new Error(
        data.message ||
          "Failed to cancel upload."
      );
    }

    console.log(
      "Backend cancellation successful:",
      uploadUuid
    );

    /*
    |--------------------------------------------------------------------------
    | SECOND: Abort browser → Laravel XHR
    |--------------------------------------------------------------------------
    */

    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
    }

    /*
    |--------------------------------------------------------------------------
    | Reset UI
    |--------------------------------------------------------------------------
    */

    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index
          ? {
              ...lesson,

              isUploading: false,

              isUploaded: false,

              uploadProgress: 0,

              uploadStage: "idle",

              uploadStatus : "cancelled",

              videoFile: null,
            }
          : lesson
      )
    );

    /*
    |--------------------------------------------------------------------------
    | Clear refs
    |--------------------------------------------------------------------------
    */

    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    uploadingRef.current = false;
    activeXhrRef.current = null;
    activeUploadRef.current = null;
    cancelRequestedRef.current = false;

    toast.info(
      "Lesson upload cancelled."
    );

    return true;

  } catch (err) {

    console.error(
      "Cancel upload error:",
      err
    );

    cancelRequestedRef.current = false;

    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index
          ? {
              ...lesson,

              uploadStage:
                "uploading",
            }
          : lesson
      )
    );

    toast.error(
      err.message ||
        "Unable to cancel the upload."
    );

    return false;
  }
};

useEffect(() => {
  return () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
  };
}, []);

// Protect browser Back / Forward while uploading
useEffect(() => {
  // Create a guard history entry for this page
  window.history.pushState(
    { lessonUploadGuard: true },
    "",
    window.location.href
  );

const handlePopState = (event) => {
    // Nothing is uploading → allow normal browser navigation
    if (!uploadingRef.current) {
      return;
    }

    // Restore the guard entry immediately
    window.history.pushState(
      { lessonUploadGuard: true },
      "",
      window.location.href
    );

    // Ask user what to do
    setPendingNavigation(() => () => {
      window.history.back();
    });

    setLeaveOpen(true);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

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
      {/* Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center">
          <section className="breadcrumb-section">
              <h3>Lesson <span>Create</span></h3>

              <Link
                className="bread-link"
                to={DASHBOARD_ROUTES.DASHBOARD}
                onClick={(e) => {
                  if (uploadingRef.current) {
                    e.preventDefault();

                    requestLeave(() =>
                      navigate(DASHBOARD_ROUTES.DASHBOARD)
                    );
                  }
                }}
              >
                Home
              </Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to="">Lesson Management</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to=""><span>Create Lesson</span></Link>


          </section>
            <button
              type="button"
              className="edit-btn"
              onClick={() =>
                requestLeave(() => navigate(-1))
              }
            >
              <FontAwesomeIcon icon={faArrowLeft} className="icon" />
              Return
            </button>
      </div>
      <div className="dashboard-card my-4">

        {/* Header */}
        <div className="card-header-custom">
          <div className="header">
            <FontAwesomeIcon icon={faCirclePlus} className="icon" />
            <span>Create New Lessons</span>
          </div>
        </div>

        <hr />

        {/* Course Selection */}
        <div className="mb-4">
          <label className="form-label">
            Select Course
          </label>

          <select
            className="form-control text-capitalize"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={lessons.some((l) => l.isUploading)}
          >
            <option value="" >-- Select Course --</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id} className="text-capitalize">
                {course.title?.[i18n.language] || course.title?.en}
              </option>
            ))}
          </select>

          {!selectedCourse && (
            <small className="text-muted d-block mt-2">
              Select the course where you want to add lessons.
            </small>
          )}
        </div>


        {/* Lessons */}
        {selectedCourse &&
          lessons.map((lesson, index) => (
            <div
              key={index}
              className={`border rounded p-4 mb-4 ${
                lesson.collapsed ? "bg-light" : "bg-white"
              }`}
            >

              {/* Lesson Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">

                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "#f1f5ff",
                      fontWeight: "600",
                    }}
                  >
                    <span>{index + 1}</span>
                  </div>

                  <div className="d-flex gap-4">
                    <h5 className="mb-0 fw-semibold">
                      Lesson {index + 1}
                    </h5>

                    {lesson.isUploaded && (
                      <small className="text-success ">
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="me-1"
                        />
                        Uploaded successfully
                      </small>
                    )}
                  </div>
                </div>


                {/* Uploaded / Collapse */}
                {lesson.isUploaded && (
                  <button
                    type="button"
                    className="btn btn-sm gray-btn-opp"
                    onClick={() => toggleCollapse(index)}
                  >
                    {lesson.collapsed ? "Open" : "Collapse"}
                  </button>
                )}

              </div>


              {!lesson.collapsed && (
                <>

                  {/* ---------------- TITLE ---------------- */}
                  <div className="mb-4">
                    <label className="form-label">
                        <FontAwesomeIcon icon={faA} className="icon" />
                        Lesson Title (English)
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) =>
                        handleLessonChange(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      className="form-control"
                      placeholder="Enter lesson title"
                      disabled={lesson.isUploading || lesson.isUploaded}
                    />
                  </div>


                  {/* ---------------- HINDI TITLE ---------------- */}
                  <div className="mb-4">
                    <label className="form-label">
                        <FontAwesomeIcon icon={faA} className="icon" />
                        Lesson Title (Hindi)
                      <small className="text-muted ms-2">
                        Optional
                      </small>
                    </label>

                    <input
                      type="text"
                      value={lesson.titleHi}
                      onChange={(e) =>
                        handleLessonChange(
                          index,
                          "titleHi",
                          e.target.value
                        )
                      }
                      className="form-control"
                      placeholder="हिंदी शीर्षक दर्ज करें"
                      disabled={lesson.isUploading || lesson.isUploaded}
                    />
                  </div>


                  {/* ---------------- DESCRIPTION ---------------- */}
                  <div className="mb-4">
                    <label className="form-label">
                        <FontAwesomeIcon icon={faFileAlt} className="icon" />
                        Description (English)
                      <small className="text-muted ms-2">
                        Optional
                      </small>
                    </label>

                    <textarea
                      value={lesson.description}
                      onChange={(e) =>
                        handleLessonChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="form-control"
                      rows={4}
                      placeholder="Enter lesson description"
                      disabled={lesson.isUploading || lesson.isUploaded}
                    />
                  </div>


                  {/* ---------------- HINDI DESCRIPTION ---------------- */}
                  <div className="mb-4">
                    <label className="form-label">
                        <FontAwesomeIcon icon={faFileAlt} className="icon" />
                        Description (Hindi)
                      <small className="text-muted ms-2">
                        Optional
                      </small>
                    </label>

                    <textarea
                      value={lesson.descriptionHi}
                      onChange={(e) =>
                        handleLessonChange(
                          index,
                          "descriptionHi",
                          e.target.value
                        )
                      }
                      className="form-control"
                      rows={4}
                      placeholder="हिंदी विवरण दर्ज करें"
                      disabled={lesson.isUploading || lesson.isUploaded}
                    />
                  </div>


                  {/* ---------------- VIDEO ---------------- */}
                  <div className="mb-4">

                    <label className="form-label">
                      <FontAwesomeIcon
                        icon={faVideo}
                        className="icon me-1"
                      />
                      Lesson Video
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <small className="text-muted d-block my-2">
                      Select the video file for this lesson.
                    </small>

                    <div className="d-flex align-items-center flex-wrap gap-3">

                      <input
                        id={`lesson-video-${index}`}
                        type="file"
                        accept="video/*"
                        hidden
                        disabled={lesson.isUploading || lesson.isUploaded}
                        onChange={(e) =>
                          handleFileChange(
                            index,
                            e.target.files[0]
                          )
                        }
                      />

                      <label
                        htmlFor={`lesson-video-${index}`}
                        className={`btn ${
                          lesson.isUploaded || lesson.isUploading
                            ? "gray-btn disabled"
                            : "blue-btn"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="me-2"
                        />

                      {lesson.isUploaded ? "Video Uploaded" : lesson.videoFile ? "Change Video" : "Choose Video"}
                      </label>


                      {lesson.videoFile && (
                        <div className="small text-success">
                          <strong>
                            {lesson.videoFile.name}
                          </strong>

                          <span className="text-muted ms-2">
                            (
                            {(
                              lesson.videoFile.size /
                              (1024 * 1024)
                            ).toFixed(1)}
                            {" "}MB)
                          </span>
                        </div>
                      )}

                    </div>

                  </div>


                  {/* ---------------- PROGRESS ---------------- */}
                  {lesson.isUploading && (
                    <div className="mb-4">

                      <div className="d-flex justify-content-between mb-2">
                        <small className="fw-semibold">

                          {lesson.uploadStage === "uploading"
                            ? "Uploading video..."

                            : lesson.uploadStage === "queued"
                            ? "Video uploaded. Waiting for processing..."

                            : lesson.uploadStage === "processing"
                            ? "Processing video..."

                            : lesson.uploadStage === "creating-lesson"
                            ? "Creating lesson..."

                            : lesson.uploadStage === "uploading-materials"
                            ? "Uploading materials..."

                            : lesson.uploadStage === "cancelling"
                            ? "Cancelling upload..."

                            : "Processing video..."}

                        </small>
                        {lesson.isUploading
                          ? lesson.uploadStage === "uploading"
                            ? `Uploading... ${lesson.uploadProgress}%`
                            : lesson.uploadStage === "queued"
                            ? "Waiting..."
                            : lesson.uploadStage === "processing"
                            ? "Processing..."
                            : lesson.uploadStage === "creating-lesson"
                            ? "Creating lesson..."
                            : lesson.uploadStage === "uploading-materials"
                            ? "Uploading materials..."
                            : "Processing..."
                          : "Upload Lesson"}
                      </div>

                        {lesson.uploadStage === "uploading" ? (
                          <div
                            className="progress"
                            style={{ height: "8px" }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${lesson.uploadProgress}%`,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>

                        ) : lesson.uploadStage === "cancelling" ? (

                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="spinner-border spinner-border-sm text-danger"
                              role="status"
                            />

                            <small className="text-danger">
                              Cancelling upload. Please wait...
                            </small>
                          </div>

                        ) : lesson.uploadStage === "queued" ? (

                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            />

                            <small className="text-muted">
                              Video uploaded. Waiting for processing to start...
                            </small>
                          </div>

                        ) : lesson.uploadStage === "processing" ? (

                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            />

                            <small className="text-muted">
                              Processing video. Please wait...
                            </small>
                          </div>

                        ) : lesson.uploadStage === "creating-lesson" ? (

                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            />

                            <small className="text-muted">
                              Creating lesson. Please wait...
                            </small>
                          </div>

                        ) : lesson.uploadStage === "uploading-materials" ? (

                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            />

                            <small className="text-muted">
                              Uploading study materials. Please wait...
                            </small>
                          </div>

                        ) : null}

                    </div>
                  )}

  <hr />

                  {/* ---------------- MATERIALS ---------------- */}
                  <div className="mb-4">

                    <label className="form-label">
                      <FontAwesomeIcon
                        icon={faPhotoFilm}
                        className="icon me-1"
                      />
                      Study Materials
                      <small className="text-muted ms-2">
                        Optional
                      </small>
                    </label>

                    <small className="text-muted d-block mt-2 mb-2">
                      PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG,
                      ZIP, RAR and 7Z files are supported.
                    </small>

                    <div>

                      <input
                        id={`lesson-materials-${index}`}
                        type="file"
                        multiple
                        hidden
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar,.7z"
                        disabled={lesson.isUploading || lesson.isUploaded}
                        onChange={(e) => {
                          handleMaterialChange(
                            index,
                            Array.from(e.target.files)
                          );

                          // Allows selecting the same file again later
                          e.target.value = "";
                        }}
                      />

                      <label
                        htmlFor={`lesson-materials-${index}`}
                        className={`btn ${
                          lesson.isUploaded || lesson.isUploading
                            ? "gray-btn disabled"
                            : "blue-btn"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={faFileCirclePlus}
                          className="me-2"
                        />
                        Add Materials
                      </label>

                    </div>


                    {/* Selected materials */}
                    {lesson.materials.length > 0 && (
                      <div className="mt-3">

                        <small className="fw-semibold d-block mb-2">
                          Selected Materials
                        </small>

                        {lesson.materials.map(
                          (file, materialIndex) => (
                            <div
                              key={`${file.name}-${materialIndex}`}
                              className="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
                            >

                              <div className="d-flex align-items-center gap-2 text-truncate">

                                <FontAwesomeIcon
                                  icon={faFileAlt}
                                  className="text-primary"
                                />

                                <span className="text-truncate">
                                  {file.name}
                                </span>

                                <small className="text-muted">
                                  (
                                  {(
                                    file.size /
                                    (1024 * 1024)
                                  ).toFixed(1)}
                                  MB)
                                </small>

                              </div>


                              <button
                                type="button"
                                className="btn btn-sm red-btn ms-2"
                                disabled={lesson.isUploading || lesson.isUploaded}
                                onClick={() => {
                                  setLessons((prev) =>
                                    prev.map((l, i) =>
                                      i === index
                                        ? {
                                            ...l,
                                            materials:
                                              l.materials.filter(
                                                (_, mi) =>
                                                  mi !==
                                                  materialIndex
                                              ),
                                          }
                                        : l
                                    )
                                  );
                                }}
                              >
                                <FontAwesomeIcon icon={faClose} />
                              </button>

                            </div>
                          )
                        )}

                      </div>
                    )}



                  </div>
  <hr />

                  {/* ---------------- UPLOAD BUTTON ---------------- */}
                  <div className="d-flex justify-content-end">

                    {/* upload button */}
                    {!lesson.isUploaded && (
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          disabled={lesson.isUploading}
                          onClick={() => uploadToBunny(lesson, index)}
                          className="btn blue-btn d-flex align-items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faUpload} />

                        {lesson.isUploading
                          ? lesson.uploadStage === "uploading"
                            ? `Uploading... ${lesson.uploadProgress}%`
                            : "Processing..."
                          : "Upload Lesson"}
                        </button>
                      </div>
                    )}

                    {/* cancel button */}
                    {lesson.isUploading &&
                      ["uploading", "processing"].includes(lesson.uploadStage) && (
                        <div className="d-flex justify-content-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger mx-2"
                            onClick={() => setCancelOpen(true)}
                            disabled={lesson.uploadStage === "cancelling"}
                          >
                            {lesson.uploadStage === "cancelling"
                              ? "Cancelling..."
                              : "Cancel Upload"}
                          </button>
                        </div>
                      )}

                  </div>

                </>
              )}

            </div>
          ))}


        {/* ---------------- ADD LESSON ---------------- */}
        {selectedCourse && (
          <div className="text-center mt-4">

            <button
              type="button"
              onClick={addLesson}
              disabled={lessons.some(
                (lesson) => lesson.isUploading
              )}
              className="btn gray-btn-opp"
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="me-2"
              />

              Add Another Lesson
            </button>

            <small className="text-muted d-block mt-2">
              You can add multiple lessons and upload them one
              by one.
            </small>

          </div>
        )}

      </div>

      {/* Leave Page Confirmation */}
      <ConfirmationDialogBoxUi
        open={leaveOpen}
        title="Leave Lesson Creation?"
        confirmText="Leave Page"
        confirmVariant="danger"
        onCancel={() => {
          setLeaveOpen(false);
          setPendingNavigation(null);
        }}
        onConfirm={async () => {

          setLeaveOpen(false);

          if (uploadingRef.current) {

            const cancelled =
              await cancelUpload();

            if (!cancelled) {
              return;
            }
          }

          const action =
            pendingNavigation;

          setPendingNavigation(null);

          if (action) {
            action();
          }
        }}
      >
        A lesson upload is currently in progress.
        <br />
        <br />

        <strong>
          If you leave this page, the current upload will be cancelled.
        </strong>

        <br />
        <br />

        <p
          className="text-danger mb-0"
          style={{ fontSize: "12px" }}
        >
          The uploaded video will be removed and the lesson will not
          be completed.
        </p>
      </ConfirmationDialogBoxUi>


      {/* Cancel Upload Confirmation Video */}
      <ConfirmationDialogBoxUi
        open={cancelOpen}
        title="Cancel Lesson Upload?"
        confirmText="Cancel Upload"
        confirmVariant="danger"
        onCancel={() => setCancelOpen(false)}
        onConfirm={async () => {
          setCancelOpen(false);
          await cancelUpload();
        }}
      >
        The lesson video is currently being uploaded or processed.
        <br />
        <br />

        <strong>
          Are you sure you want to cancel this upload?
        </strong>

        <br />
        <br />

        <p
          className="text-danger mb-0"
          style={{ fontSize: "12px" }}
        >
          The current upload will be stopped and all uploaded video
          files will be removed.
        </p>
      </ConfirmationDialogBoxUi>

  </>
);
};

export default CreateLesson;