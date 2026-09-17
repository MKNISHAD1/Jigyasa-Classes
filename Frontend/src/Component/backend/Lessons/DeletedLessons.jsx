import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/Auth";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { Link, useParams } from "react-router-dom";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import ActionButtons from "../../Common/CommonUI/ActionButtonsUi";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";
import { faAngleRight, faArrowLeft, faRotate, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { COURSE_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";

const DeletedLessons = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [confirmation, setConfirmation] = useState({
    open: false,
    type: null,
    lesson: null,
    count: 0,
  });

const [confirmationLoading, setConfirmationLoading] = useState(false);


  // Fetch deleted lessons
  const fetchTrashedLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}courses/${courseId}/lessons/trashed-by-teacher`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      const data = await res.json();
      if (data.status) setLessons(data.lessons);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch deleted lessons");
    }
    setLoading(false);
  };


  // Open Bulk restore modal
  const restoreLessons = (ids) => {
    if (!ids.length) {
      toast.error("Select lessons first");
      return;
    }

    setConfirmation({
      open: true,
      type: ids.length === 1
        ? "restore-lesson"
        : "bulk-restore-lessons",
      lesson: ids.length === 1
        ? lessons.find((lesson) => lesson.id === ids[0])
        : null,
      count: ids.length,
    });
  };

  // Bulk Restore Handler
  const handleRestoreLessons = async () => {

    let ids = [];

    if (confirmation.type === "restore-lesson") {
      ids = [confirmation.lesson.id];
    } else {
      ids = selectedLessons;
    }

    try {

      setConfirmationLoading(true);

      const res = await fetch(
        `${apiUrl}courses/${courseId}/lessons/bulk-restore`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lesson_ids: ids,
          }),
        }
      );

      const data = await res.json();

      if (data.status) {

        toast.success(data.message || "Lessons restored successfully");

        setLessons((prev) =>
          prev.filter((lesson) => !ids.includes(lesson.id))
        );

        setSelectedLessons([]);

        closeConfirmation();

      } else {

        toast.error(data.message || "Failed to restore lessons");

      }

    } catch (error) {

      console.error(error);
      toast.error("Server error");

    } finally {

      setConfirmationLoading(false);

    }
  };


  // Open Bulk permanently delete
  const permanentlyDeleteLessons = (ids) => {

    if (!ids.length) {
      toast.error("Select lessons first");
      return;
    }

    setConfirmation({
      open: true,
      type: ids.length === 1
        ? "force-delete-lesson"
        : "bulk-force-delete-lessons",
      lesson: ids.length === 1
        ? lessons.find((lesson) => lesson.id === ids[0])
        : null,
      count: ids.length,
    });
  };

  // Bulk Permanently Delete Lessons Handler
  const handlePermanentlyDeleteLessons = async () => {

    let ids = [];

    if (confirmation.type === "force-delete-lesson") {
      ids = [confirmation.lesson.id];
    } else {
      ids = selectedLessons;
    }

    try {

      setConfirmationLoading(true);

      const res = await fetch(
        `${apiUrl}courses/${courseId}/lessons/bulk-force-delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lesson_ids: ids,
          }),
        }
      );

      const data = await res.json();

      if (data.status) {

        toast.success(
          data.message || "Lessons permanently deleted"
        );

        setLessons((prev) =>
          prev.filter((lesson) => !ids.includes(lesson.id))
        );

        setSelectedLessons([]);

        closeConfirmation();

      } else {

        toast.error(
          data.message || "Failed to permanently delete lessons"
        );

      }

    } catch (error) {

      console.error(error);
      toast.error("Server error");

    } finally {

      setConfirmationLoading(false);

    }
  };

  // closse confirmation 
  const closeConfirmation = () => {

    if (confirmationLoading) return;

    setConfirmation({
      open: false,
      type: null,
      lesson: null,
      count: 0,
    });

  };



  useEffect(() => {
    if (user) fetchTrashedLessons();
  }, [user. courseId]);


  const columns = [
    { name: "#", 
      cell:(row,index) => index + 1, 
      width: "55px"
    },
    { name: "Title", selector: (row) => row.title?.en || row.title, wrap: true },
    {
      name: "Deleted At",
      selector: (row) => new Date(row.deleted_at).toLocaleString(),
      width: "200px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <ActionButtons
          onDelete={() => permanentlyDeleteLessons([row.id])}
          onRestore={() => restoreLessons([row.id])}
        />
      ),
    },
  ];

  return (
    <>
        {/* Breadcrumbs */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section">
                <h3>Lesson <span>Management</span></h3>
  
                <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to={`/admin/course/view-course/${courseId}`}>View Course</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to={`/admin/lesson/${courseId}/course-lessons`}>Lesson Management</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to=""><span>Deleted Lesson</span></Link>
  
            </section>
  
            <Link to={`/admin/lesson/${courseId}/course-lessons`} className="edit-btn">
            <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
            </Link>
        </div>

        <div className="dashboard-card my-4">
        <div className="card-header-custom">
          <div className="header">
              <FontAwesomeIcon icon={faTrash} className="icon"/>
              <span>Deleted Lesson</span>
          </div>
        </div>  
          <p className="text-muted text-center">Manage and restore your deleted lessons.</p>

          <hr />

          {/* Bulk action buttons */}
          <div className="my-4 d-flex gap-2">

            <button
              className="btn btn-success"
              disabled={selectedLessons.length === 0}
              onClick={() => restoreLessons(selectedLessons)}
            >
              <FontAwesomeIcon icon={faRotate} />
              {" "}Restore Selected
            </button>

            <button
              className="btn btn-danger"
              disabled={selectedLessons.length === 0}
              onClick={() => permanentlyDeleteLessons(selectedLessons)}
            >
              <FontAwesomeIcon icon={faTrash} />
              {" "}Permanently Delete Selected
            </button>

          </div>


          <DataTable
            columns={columns}
            data={lessons}
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={(state) => setSelectedLessons(state.selectedRows.map(r => r.id))}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
          />

          <div className="mt-3">
            <Link to={`/admin/lesson/${courseId}/course-lessons`}  className="btn btn-secondary">
              Back to Lessons
            </Link>
          </div>
        </div>

        {/* Confirmation Dialog Box */}
        <ConfirmationDialogBoxUi

          open={confirmation.open}

          title={
            confirmation.type === "restore-lesson" ||
            confirmation.type === "bulk-restore-lessons"
              ? "Restore Lessons"
              : "Permanently Delete Lessons"
          }

          confirmText={
            confirmation.type === "restore-lesson" ||
            confirmation.type === "bulk-restore-lessons"
              ? "Restore"
              : "Delete Permanently"
          }

          confirmVariant={
            confirmation.type === "restore-lesson" ||
            confirmation.type === "bulk-restore-lessons"
              ? "success"
              : "danger"
          }

          loading={confirmationLoading}

          onCancel={closeConfirmation}

          onConfirm={() => {

            if (
              confirmation.type === "restore-lesson" ||
              confirmation.type === "bulk-restore-lessons"
            ) {
              handleRestoreLessons();

            } else if (
              confirmation.type === "force-delete-lesson" ||
              confirmation.type === "bulk-force-delete-lessons"
            ) {
              handlePermanentlyDeleteLessons();
            }

          }}

        >

          {/* Single Restore */}
          {confirmation.type === "restore-lesson" && (
            <>
              Are you sure you want to restore <br />

              <strong>
                {confirmation.lesson?.title?.en || confirmation.lesson?.title  || "this lesson"}
              </strong>

              ?

              <br />
              <br />

              <p
                className="text-success"
                style={{ fontSize: "12px" }}
              >
                This lesson will be restored and returned to the course.
              </p>
            </>
          )}

          {/* Bulk Restore */}
          {confirmation.type === "bulk-restore-lessons" && (
            <>
              Are you sure you want to restore{" "}

              <strong>
                {confirmation.count}
              </strong>{" "}

              selected lessons?

              <br />
              <br />

              <p
                className="text-success"
                style={{ fontSize: "12px" }}
              >
                The selected lessons will be restored and returned to the course.
              </p>
            </>
          )}

          {/* Single Permanent Delete */}
          {confirmation.type === "force-delete-lesson" && (
            <>
              Are you sure you want to permanently delete <br />

              <strong>
                {confirmation.lesson?.title?.en ||  confirmation.lesson?.title || "this lesson"}
              </strong>

              ?

              <br />
              <br />

              <p
                className="text-danger"
                style={{ fontSize: "12px" }}
              >
                This action cannot be undone. The lesson and its associated files
                will be permanently removed.
              </p>
            </>
          )}

          {/* Bulk Permanent Delete */}
          {confirmation.type === "bulk-force-delete-lessons" && (
            <>
              Are you sure you want to permanently delete{" "}

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
                This action cannot be undone. The selected lessons and their
                associated files will be permanently removed.
              </p>
            </>
          )}

        </ConfirmationDialogBoxUi>

    </>
  );
};

export default DeletedLessons;

