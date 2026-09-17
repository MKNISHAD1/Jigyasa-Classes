import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import LessonTable from './LessonTable';
import { toast } from 'react-toastify';
import ProtectedVideoPlayer from "./LessonViewer";
import { apiUrl, token } from '../../Common/http';
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import DataTable from 'react-data-table-component';
import nolesson from "../../../assets/images/not-found2.jpeg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faArrowLeft, faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { COURSE_ROUTES, DASHBOARD_ROUTES, LESSON_ROUTES } from '../../../constants/nevigation/routes';
import ConfirmationDialogBoxUi from '../../Common/CommonUI/ConfirmationDialogBoxUi';

const LessonManagement = () => {
    const { courseId } = useParams();
    const { i18n } = useTranslation();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [confirmation, setConfirmation] = useState({
        open: false,
        type: null,
        lesson: null,
        count: 0,
    });
    const [confirmationLoading, setConfirmationLoading] = useState(false);

    // Fetch Course
    const fetchCourse = async () => {
        try {
        setLoading(true);
        const res = await fetch(apiUrl + "view-course/" + courseId, {
            headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
            },
        });

        const result = await res.json();
        console.log(result);

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
    }, [courseId]);

    // Open Modal delete lesson
    const deleteLesson = (lesson) => {
        setConfirmation({
            open: true,
            type: "delete-lesson",
            lesson: lesson,
            count: 1,
        });
    };

    // Delete Lesson Handler
    const handleDeleteLesson = async () => {
    const lesson = confirmation.lesson;

    if (!lesson) return;

    try {
        setConfirmationLoading(true);

        const res = await fetch(
        `${apiUrl}courses/${courseId}/delete-lesson/${lesson.id}`,
        {
            method: "DELETE",
            headers: {
            Authorization: `Bearer ${token()}`,
            },
        }
        );

        const result = await res.json();

        if (result.status) {
        toast.success(result.message);

        setConfirmation({
            open: false,
            type: null,
            lesson: null,
            count: 0,
        });

        await fetchCourse();
        } else {
        toast.error(result.message);
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete lesson");
    } finally {
        setConfirmationLoading(false);
    }
    };

    // Open Bulk Delete Lesson

    const bulkDeleteLessons = () => {
        if (selectedLessons.length === 0) {
            toast.error("Select lessons first");
            return;
        }

        setConfirmation({
            open: true,
            type: "bulk-delete-lessons",
            lesson: null,
            count: selectedLessons.length,
        });
    };

    // Bulk Delete Handler

    const handleBulkDeleteLessons = async () => {
    try {
        setConfirmationLoading(true);

        const res = await fetch(
        `${apiUrl}courses/${courseId}/lessons/bulk-delete`,
        {
            method: "DELETE",
            headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            lesson_ids: selectedLessons,
            }),
        }
        );

        const result = await res.json();

        if (result.status) {
        toast.success(result.message);

        setSelectedLessons([]);

        setConfirmation({
            open: false,
            type: null,
            lesson: null,
            count: 0,
        });

        await fetchCourse();
        } else {
        toast.error(result.message);
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete lessons");
    } finally {
        setConfirmationLoading(false);
    }
    };

  const columns = [
    { name: "#", 
      cell:(row,index) => index + 1, 
      width: "55px"
    },

    {
      name: "Title",
      selector: (row) => row.title?.[i18n.language] || row.title?.en || "Untitled",
      cell:(row) => (
                <>
                  <Link
                      to={`/admin/course/${courseId}/lesson/${row.id}/lessonplayer`}
                      className="course-title-link"
                  >              
                    <div
                      className="course-title"
                      title={row.title?.[i18n.language] || row.title?.en || "Untitled"}
                    >
                      {row.title?.[i18n.language] || row.title?.en}
                    </div>
                  </Link>
                </>
      ),
      sortable: true,
      wrap: true,
    },
    // {
    //   name: "Video",
    //   cell: (row) =>
    //     row.video_url ? (
    //       <a href={row.video_url} target="_blank" rel="noreferrer" className="text-blue-500">
    //         View
    //       </a>
    //     ) : (
    //       <span className="text-gray-400">No video</span>
    //     ),
    // },
    {
      name: "Materials",
      cell: (row) =>
        row.materials?.length ? (
          row.materials.map((m, idx) => (
            <a key={idx} href={m.url} target="_blank" rel="noreferrer" className="block text-blue-500">
              File {idx + 1}
            </a>
          ))
        ) : (
          <span className="text-gray-400 text-dark"> - </span>
        ),
    },

    {
  name: "Status",
  selector: (row) => row.status || "draft",
  cell: (row) => {
    const statusColors = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      archived: "bg-red-100 text-red-700",
    };

    const label =
      row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || "Draft";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusColors[row.status] || "bg-gray-100 text-gray-600"
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
            viewLink={`/admin/course/${courseId}/lesson/${row.id}/lessonplayer`}
            editLink={`/admin/course/${courseId}/lesson/${row.id}/edit`}
            onDelete={() => deleteLesson(row)}
            />

      ),
    },
  ];
    if (loading) {
        return (
            <div className="dashboard-card mt-4">
            <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: "350px" }}
            >
                <div
                className="spinner-border text-success "
                style={{ width: "3rem", height: "3rem" }}
                />

                <h5 className="mt-3 mb-1">Fetching Course Information...</h5>

                <small className="text-muted">
                Please wait while we fetch your course information.
                </small>
            </div>
            </div>
        );
    }

  return (
    <>
          {/* Breadcrumbs */}
          <div className="d-flex justify-content-between align-items-center">
              <section className="breadcrumb-section">
                  <h3>Course  <span>Details</span></h3>
    
                  <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                  <span><FontAwesomeIcon icon={faAngleRight}/></span>
                  <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
                  <span><FontAwesomeIcon icon={faAngleRight}/></span>
                  <Link className='bread-link' to={`/admin/course/view-course/${courseId}`}>View Course</Link>
                  <span><FontAwesomeIcon icon={faAngleRight}/></span>
                  <Link className='bread-link' to=""><span>Lesson Management</span></Link>
    
              </section>
    
              <Link to={`/admin/course/view-course/${courseId}`} className="edit-btn">
              <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
              </Link>
          </div>

        <div className="dashboard-card my-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>{selectedLessons.length > 0 && `Selected: ${selectedLessons.length}`}</h6>

            <div className="d-flex gap-2">

                <Link to={`/admin/lesson/create`} className="btn green-btn">
                <FontAwesomeIcon icon={faPlus} /> Create Lesson
                </Link>
                <Link to={`/admin/course/${courseId}/lessons/trashed`} className="btn btn-outline-danger">
                <FontAwesomeIcon icon={faTrash} /> Deleted Lessons
                </Link>
                <button onClick={bulkDeleteLessons} className="btn btn-danger" disabled={selectedLessons.length === 0}>
                <FontAwesomeIcon icon={faCheck} /> Delete Selected
                </button>
            </div>
            </div>
            <div className = "table-wrapper" >
                <DataTable
                columns={columns} 
                data={course?.lessons || []}         
                selectableRows
                selectableRowsHighlight
                onSelectedRowsChange={(state) => setSelectedLessons(state.selectedRows.map(r => r.id))}
                pagination 
                highlightOnHover 
                striped 
                progressPending={loading}
                noDataComponent={
                <div className="text-center py-1">
                    <hr />
                    <img
                        src={nolesson}
                        alt="No lessons"
                        style={{ width: "180px" }}
                    />

                    <h6 className="mt-3">No lessons found</h6>

                    <p className="text-muted mb-3">
                        Start by creating your first lesson for this course.
                    </p>

                    <Link
                        to={LESSON_ROUTES.CREATE}
                        className="btn btn-style-1"
                    >
                        <FontAwesomeIcon icon={faPlus}/> Create Lesson
                    </Link>
                    <hr />
                </div>
                }
            />
            </div>
        </div>

        {/* Confirm Dialog Box */}
        <ConfirmationDialogBoxUi

        open={confirmation.open}

        title={
            confirmation.type === "delete-lesson"
            ? "Delete Lesson"
            : "Delete Lessons"
        }

        confirmText="Delete"

        confirmVariant="danger"

        loading={confirmationLoading}

        onCancel={() => {

            if (confirmationLoading) return;

            setConfirmation({
            open: false,
            type: null,
            lesson: null,
            count: 0,
            });

        }}

        onConfirm={() => {

            if (confirmation.type === "delete-lesson") {

            handleDeleteLesson();

            } else if (confirmation.type === "bulk-delete-lessons") {

            handleBulkDeleteLessons();

            }

        }}

        >

        {/* Single Lesson Delete */}
        {confirmation.type === "delete-lesson" && (
            <>
            Are you sure you want to delete <br />

            <strong>
                {confirmation.lesson?.title?.en}
            </strong>

            ?

            <br />
            <br />

            <p
                className="text-danger"
                style={{ fontSize: "12px" }}
            >
                This lesson will be moved to Deleted Lessons.
            </p>
            </>
        )}

        {/* Bulk Lesson Delete */}
        {confirmation.type === "bulk-delete-lessons" && (
            <>
            Are you sure you want to delete{" "}

            <strong>
                {confirmation.count}
            </strong>{" "}

            selected lessons?

            <br />
            <br />

            <p
                className="text-danger"
                style={{ fontSize: "12px" }}
            >
                The selected lessons will be moved to Deleted Lessons.
            </p>
            </>
        )}

        </ConfirmationDialogBoxUi>
    </>
  )
}

export default LessonManagement