import React, { useEffect, useState } from "react";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";
import DeletedCourseTable from "./DeletedCourseTable";
import { DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import PageNotFound from "../../../assets/images/not-found.jpeg"
import { Link } from "react-router-dom";
import MobileDeletedCourses from "./MobileDeletedCourses";


const DeletedCourses = () => {

    const {i18n} = useTranslation();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [filterText, setFilterText] = useState("")
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [restoreOpen, setRestoreOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

  // Fetch deleted courses
  const fetchDeleted = async () => {
    try {
      setLoading(true);

      // fetch deleted courses
      const res = await fetch(apiUrl + "deletedcourses", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });
      const result = await res.json();
      if (result.status) {
        setCourses(result.courses || []);
      } else {
        toast.error("Failed to fetch deleted courses");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);


  // Restore course
  const handleRestore = async () => {

    if (!selectedCourse) return;

    setLoadingDelete(true);

    try{

      const res = await fetch(apiUrl + "restore-course/"+ selectedCourse.id, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });
      const result = await res.json();
      if (result.status) {
        toast.success("Course restored successfully");
        fetchDeleted(); // refresh list
      } else {
        toast.error(result.message || "Restore failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      
      setLoadingDelete(false);

      setRestoreOpen(false);

      setSelectedCourse(null);
    }
  };

  // Permanent delete
  const handlePermanentDelete = async () => {

    if (!selectedCourse) return;

    setLoadingDelete(true);

    try{
      const res = await fetch(apiUrl + "force-delete-course/"+ selectedCourse.id, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });
      const result = await res.json();
      if (result.status) {
        toast.success("Course permanently deleted");
        fetchDeleted();
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally{

      setLoadingDelete(false);

      setDeleteOpen(false);

      setSelectedCourse(null);

    }
  };

  // helper function delete dialog
  const openDeleteDialog = (course) => {
    setSelectedCourse(course);
    setDeleteOpen(true);
  };

  // helper function restore dialog
  const openRestoreDialog = (course) => {
    setSelectedCourse(course);
    setRestoreOpen(true);
  };

  // Loading 
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

          <h5 className="mt-3 mb-1">Loading Deleted Courses...</h5>

          <small className="text-muted">
            Please wait while we fetching deleted courses.
          </small>
        </div>
      </div>
    );
  }

  // Apply search filter
  const filteredCourses = courses.filter((course) => {
  const search = filterText.toLowerCase();

    const title =
      course.title?.[i18n.language]?.toLowerCase() ||
      course.title?.en?.toLowerCase() ||
      "";

    const teacher = course.teacher?.name?.toLowerCase() || "";
    const id = String(course.id);

    return (
      title.includes(search) ||
      teacher.includes(search) ||
      id.includes(search)
    );

  });




  return (
    <>

    
      <div className="dashboard-card mt-4">
        
        {/* header */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section m-0">
                <h3>Deleted <span>Courses</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

                <Link className='bread-link' to=""><span>Deleted Courses</span></Link>

            </section>
        </div>

        <hr className="mb-4"/>

        
        <p className="text-muted text-center mb-4 course-list-heading">Manage all Deleted courses </p>

        {/* Search */}
        <div className="d-flex align-items-center gap-2 mb-4 search-toolbar">
            <div className="input-group flex-grow-1">

            <span className="input-group-text">
                <i className="fa-solid fa-search"></i>
            </span>
                <input
                type="text"
                placeholder="Search by title,teach name"
                className="form-control"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
        </div>


        {
            courses.length === 0 ? (
                
                // if no courses created yet
                <div className="empty-courses text-center py-5">
                    <img
                        src={PageNotFound}
                        alt="No courses found"
                        className="empty-img"
                    />

                    <h4>No Deleted Found</h4>

                    <p> Once any course get deleted it will appear here.</p>
        
                </div>

            ) : filteredCourses.length === 0 ? (

                // if no search result  match found
                <div className="empty-courses text-center py-5">
                    <img
                    src={PageNotFound}
                    alt="No courses found"
                    className="empty-img"
                    />

                    <h4>No Match Found</h4>

                    <p> Try Another search keyword. </p>

                </div>

            ) : (

                // Search result  
                <>
                  {/* Desktop */}
                  <div className="d-none d-lg-block">
                    <DeletedCourseTable
                      courses={filteredCourses}
                      onDelete={openDeleteDialog}
                      onRestore={openRestoreDialog}
                    />
                  </div>

                  {/* Mobile */}
                  <div className=" d-block d-lg-none">
                    <MobileDeletedCourses
                      courses={filteredCourses}
                      onDelete={openDeleteDialog}
                      onRestore={openRestoreDialog}
                    />
                  </div>
                </>

            )
            
        }

      </div>

      {/* Confirmation Dialog Box for Delete */}

      <ConfirmationDialogBoxUi

        open={deleteOpen}

        title="Permanently Delete Course"
        confirmText="Permanent Delete"
        confirmVariant="danger"

        loading={loadingDelete}

        onCancel={() => {
            setDeleteOpen(false);
            setSelectedCourse(null);
        }}

        onConfirm={handlePermanentDelete}
    >

        Are you sure you want to permanently delete this<br />

        <strong>

            {" "}
            {selectedCourse?.title?.en}

        </strong>

        ?

        <br /><br />

        <p className="text-danger" style={{fontSize:'12px'}}> This action cannot be undone.</p>

      </ConfirmationDialogBoxUi>

      {/* Confirmation Dialog Box for Restore Button */}
      
      <ConfirmationDialogBoxUi

        open={restoreOpen}

        title="Restore Course"
        confirmText="Restore Course"
        confirmVariant="success"

        loading={loadingDelete}

        onCancel={() => {
            setRestoreOpen(false);
            setSelectedCourse(null);
        }}

        onConfirm={handleRestore}
    >

        Are you sure you want to restore this course <br />

        <strong>

            {" "}
            {selectedCourse?.title?.en}

        </strong>

        ?

      </ConfirmationDialogBoxUi>


    </>
  );
};

export default DeletedCourses;
