import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faCheck,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";

import { apiUrl, token } from "../../Common/http";
import ActionButtons from "../../Common/CommonUI/ActionButtonsUi";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";

import {
  DASHBOARD_ROUTES,
  LESSON_ROUTES,
} from "../../../constants/nevigation/routes";

import nolesson from "../../../assets/images/not-found2.jpeg";

const SidebarLessonManagement = () => {
  const { i18n } = useTranslation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [course, setCourse] = useState(null);

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedLessons, setSelectedLessons] = useState([]);

  const [confirmation, setConfirmation] = useState({
    open: false,
    type: null,
    lesson: null,
    count: 0,
  });

  const [confirmationLoading, setConfirmationLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch teacher courses
  |--------------------------------------------------------------------------
  */

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);

      const res = await fetch(
        apiUrl + "my-courses",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const result = await res.json();

      if (result.status && result.courses) {
        setCourses(result.courses);
      } else {
        toast.error(
          result.message ||
            "Failed to fetch courses."
        );
      }

    } catch (error) {
      console.error(
        "Fetch courses error:",
        error
      );

      toast.error(
        "Something went wrong while fetching courses."
      );

    } finally {
      setCoursesLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch selected course
  |--------------------------------------------------------------------------
  */

  const fetchCourse = async (courseId) => {

    if (!courseId) {
      setCourse(null);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        apiUrl + "view-course/" + courseId,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const result = await res.json();

      console.log(
        "Selected course:",
        result
      );

      if (result.status) {
        setCourse(result.course);
        setSelectedLessons([]);
      } else {
        setCourse(null);

        toast.error(
          result.message ||
            "Failed to fetch course details."
        );
      }

    } catch (error) {

      console.error(
        "Fetch course error:",
        error
      );

      setCourse(null);

      toast.error(
        "Something went wrong while fetching course."
      );

    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial courses
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCourses();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Course dropdown change
  |--------------------------------------------------------------------------
  */

  const handleCourseChange = (e) => {

    const courseId = e.target.value;

    setSelectedCourse(courseId);

    fetchCourse(courseId);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete lesson confirmation
  |--------------------------------------------------------------------------
  */

  const deleteLesson = (lesson) => {

    setConfirmation({
      open: true,
      type: "delete-lesson",
      lesson: lesson,
      count: 1,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Delete single lesson
  |--------------------------------------------------------------------------
  */

  const handleDeleteLesson = async () => {

    const lesson =
      confirmation.lesson;

    if (!lesson || !selectedCourse) {
      return;
    }

    try {

      setConfirmationLoading(true);

      const res = await fetch(
        `${apiUrl}courses/${selectedCourse}/delete-lesson/${lesson.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token()}`,
          },
        }
      );

      const result =
        await res.json();

      if (result.status) {

        toast.success(
          result.message
        );

        setConfirmation({
          open: false,
          type: null,
          lesson: null,
          count: 0,
        });

        await fetchCourse(
          selectedCourse
        );

      } else {

        toast.error(
          result.message
        );
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to delete lesson."
      );

    } finally {

      setConfirmationLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Bulk delete confirmation
  |--------------------------------------------------------------------------
  */

  const bulkDeleteLessons = () => {

    if (
      selectedLessons.length === 0
    ) {
      toast.error(
        "Select lessons first."
      );

      return;
    }

    setConfirmation({
      open: true,
      type: "bulk-delete-lessons",
      lesson: null,
      count: selectedLessons.length,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Bulk delete lessons
  |--------------------------------------------------------------------------
  */

  const handleBulkDeleteLessons = async () => {

    if (!selectedCourse) {
      return;
    }

    try {

      setConfirmationLoading(true);

      const res = await fetch(
        `${apiUrl}courses/${selectedCourse}/lessons/bulk-delete`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token()}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            lesson_ids:
              selectedLessons,
          }),
        }
      );

      const result =
        await res.json();

      if (result.status) {

        toast.success(
          result.message
        );

        setSelectedLessons([]);

        setConfirmation({
          open: false,
          type: null,
          lesson: null,
          count: 0,
        });

        await fetchCourse(
          selectedCourse
        );

      } else {

        toast.error(
          result.message
        );
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to delete lessons."
      );

    } finally {

      setConfirmationLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Table columns
  |--------------------------------------------------------------------------
  */

  const columns = [

    {
      name: "#",

      cell: (row, index) =>
        index + 1,

      width: "55px",
    },

    {
      name: "Title",

      selector: (row) =>
        row.title?.[i18n.language] ||
        row.title?.en ||
        "Untitled",

      cell: (row) => {

        const title =
          row.title?.[i18n.language] ||
          row.title?.en ||
          "Untitled";

        return (
          <Link
            to={`/admin/course/${selectedCourse}/lesson/${row.id}/lessonplayer`}
            className="course-title-link"
          >

            <div
              className="course-title"
              title={title}
            >
              {title}
            </div>

          </Link>
        );
      },

      sortable: true,
      wrap: true,
    },

    {
      name: "Materials",

      cell: (row) =>
        row.materials?.length ? (

          row.materials.map(
            (material, index) => (

              <a
                key={index}
                href={material.url}
                target="_blank"
                rel="noreferrer"
                className="block text-blue-500"
              >
                File {index + 1}
              </a>

            )
          )

        ) : (

          <span className="text-gray-400 text-dark">
            -
          </span>
        ),
    },

    {
      name: "Status",

      selector: (row) =>
        row.status || "draft",

      cell: (row) => {

        const statusColors = {
          published:
            "bg-green-100 text-green-700",

          draft:
            "bg-yellow-100 text-yellow-700",

          archived:
            "bg-red-100 text-red-700",
        };

        const label =
          row.status
            ?.charAt(0)
            .toUpperCase() +
            row.status?.slice(1) ||
          "Draft";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              statusColors[row.status] ||
              "bg-gray-100 text-gray-600"
            }`}
          >
            {label}
          </span>
        );
      },

      sortable: true,
      width: "120px",
    },

    {
      name: "Actions",

      cell: (row) => (

        <ActionButtons

          viewLink={`/admin/course/${selectedCourse}/lesson/${row.id}/lessonplayer`}

          editLink={`/admin/course/${selectedCourse}/lesson/${row.id}/edit`}

          onDelete={() =>
            deleteLesson(row)
          }

        />

      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Loading courses
  |--------------------------------------------------------------------------
  */

  if (coursesLoading) {

    return (
      <div className="dashboard-card mt-4">

        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{
            minHeight: "350px",
          }}
        >

          <div
            className="spinner-border text-success"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          />

          <h5 className="mt-3 mb-1">
            Fetching Courses...
          </h5>

          <small className="text-muted">
            Please wait while we fetch your courses.
          </small>

        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>

      {/* Breadcrumbs */}

      <section className="breadcrumb-section">

        <h3>
          Lesson{" "}
          <span>Management</span>
        </h3>

        <Link
          className="bread-link"
          to={DASHBOARD_ROUTES.DASHBOARD}
        >
          Home
        </Link>

        <span>
          <FontAwesomeIcon
            icon={faAngleRight}
          />
        </span>

        <Link
          className="bread-link"
          to=""
        >
          Lesson Management
        </Link>

      </section>


      {/* Course selector */}

      <div className="dashboard-card my-4">

        <div className="row align-items-end">

          <div className="col-md-6">

            <label className="form-label">
              Select Course
            </label>

            <select
              className="form-select text-capitalize"
              value={selectedCourse}
              onChange={
                handleCourseChange
              }
              
            >

              <option value="" >
                Select a course
              </option>

              {courses.map(
                (item) => (

                  <option 
                    key={item.id}
                    value={item.id}
                  >
                    {item.title?.[i18n.language] ||
                      item.title?.en ||
                      `Course ${item.id}`}
                  </option>

                )
              )}

            </select>

          </div>

        </div>

      </div>


      {/* No course selected */}

      {!selectedCourse && (

        <div className="dashboard-card my-4 text-center py-5">

          <h5>
            Select a course to manage lessons
          </h5>

          <p className="text-muted mb-0">
            Choose a course from the dropdown above
            to view and manage its lessons.
          </p>

        </div>
      )}


      {/* Course selected */}

      {selectedCourse && (

        <div className="dashboard-card my-4">

          {/* Header */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h6>
              {selectedLessons.length > 0 &&
                `Selected: ${selectedLessons.length}`}
            </h6>

            <div className="d-flex gap-2">

              <Link
                to={LESSON_ROUTES.CREATE}
                className="btn green-btn"
              >
                <FontAwesomeIcon
                  icon={faPlus}
                />{" "}
                Create Lesson
              </Link>

              <Link
                to={`/admin/course/${selectedCourse}/lessons/trashed`}
                className="btn btn-outline-danger"
              >
                <FontAwesomeIcon
                  icon={faTrash}
                />{" "}
                Deleted Lessons
              </Link>

              <button
                onClick={
                  bulkDeleteLessons
                }
                className="btn btn-danger"
                disabled={
                  selectedLessons.length ===
                  0
                }
              >
                <FontAwesomeIcon
                  icon={faCheck}
                />{" "}
                Delete Selected
              </button>

            </div>

          </div>


          {/* Table */}

          <div className="table-wrapper">

            <DataTable

              columns={columns}

              data={
                course?.lessons || []
              }

              selectableRows

              selectableRowsHighlight

              onSelectedRowsChange={(
                state
              ) =>
                setSelectedLessons(
                  state.selectedRows.map(
                    (row) => row.id
                  )
                )
              }

              pagination

              highlightOnHover

              striped

              progressPending={
                loading
              }

              noDataComponent={

                <div className="text-center py-1">

                  <hr />

                  <img
                    src={nolesson}
                    alt="No lessons"
                    style={{
                      width: "180px",
                    }}
                  />

                  <h6 className="mt-3">
                    No lessons found
                  </h6>

                  <p className="text-muted mb-3">
                    Start by creating your
                    first lesson for this course.
                  </p>

                  <Link
                    to={
                      LESSON_ROUTES.CREATE
                    }
                    className="btn btn-style-1"
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                    />{" "}
                    Create Lesson
                  </Link>

                  <hr />

                </div>
              }

            />

          </div>

        </div>
      )}


      {/* Confirmation dialog */}

      <ConfirmationDialogBoxUi

        open={
          confirmation.open
        }

        title={
          confirmation.type ===
          "delete-lesson"
            ? "Delete Lesson"
            : "Delete Lessons"
        }

        confirmText="Delete"

        confirmVariant="danger"

        loading={
          confirmationLoading
        }

        onCancel={() => {

          if (
            confirmationLoading
          ) {
            return;
          }

          setConfirmation({
            open: false,
            type: null,
            lesson: null,
            count: 0,
          });

        }}

        onConfirm={() => {

          if (
            confirmation.type ===
            "delete-lesson"
          ) {

            handleDeleteLesson();

          } else if (
            confirmation.type ===
            "bulk-delete-lessons"
          ) {

            handleBulkDeleteLessons();

          }

        }}

      >

        {/* Single */}

        {confirmation.type ===
          "delete-lesson" && (

          <>

            Are you sure you want to delete{" "}
            <br />

            <strong>
              {
                confirmation.lesson
                  ?.title?.en
              }
            </strong>

            ?

            <br />
            <br />

            <p
              className="text-danger"
              style={{
                fontSize: "12px",
              }}
            >
              This lesson will be moved
              to Deleted Lessons.
            </p>

          </>
        )}


        {/* Bulk */}

        {confirmation.type ===
          "bulk-delete-lessons" && (

          <>

            Are you sure you want to delete{" "}

            <strong>
              {
                confirmation.count
              }
            </strong>{" "}

            selected lessons?

            <br />
            <br />

            <p
              className="text-danger"
              style={{
                fontSize: "12px",
              }}
            >
              The selected lessons will be
              moved to Deleted Lessons.
            </p>

          </>
        )}

      </ConfirmationDialogBoxUi>

    </>
  );
};

export default SidebarLessonManagement;