import React, { useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { Link } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { COURSE_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { faAngleRight, faFilter, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye } from "@fortawesome/free-regular-svg-icons";
import CourseTable from "./CourseTable";
import PageNotFound from "../../../assets/images/not-found.jpeg"
import MobileCourseCard from "./MobileCourseCard";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";

const MyCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const {i18n} = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      // fetch courses
      const res = await fetch(apiUrl + "my-courses", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();

      if (result.status) {
        setCourses(result.courses);
      } else {
        toast.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something went wrong while fetching courses");
    } finally {
      setLoading(false);
    }
  };

  // Delete Course
const handleDelete = async () => {

    if (!selectedCourse) return;

    setLoadingDelete(true);

    try{

      const res = await fetch(apiUrl + "delete-course/" + selectedCourse.id, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();

      if (result.status) {
        setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting course");
    } finally{

      setLoadingDelete(false);

      setDeleteOpen(false);

      setSelectedCourse(null);

    }

  };

  // helper function dialog
const openDeleteDialog = (course) => {
    setSelectedCourse(course);
    setDeleteOpen(true);
};
  useEffect(() => {
    fetchCourses();
  }, []);

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

        <h5 className="mt-3 mb-1">Loading Courses...</h5>

        <small className="text-muted">
          Please wait while we fetch your courses.
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

    const category =
      course.category?.name?.[i18n.language]?.toLowerCase() ||
      course.category?.name?.en?.toLowerCase() ||
      "";

    const subcategory =
      course.subcategory?.name?.[i18n.language]?.toLowerCase() ||
      course.subcategory?.name?.en?.toLowerCase() ||
      "";

    const teacher = course.teacher?.name?.toLowerCase() || "";
    const id = String(course.id);

    return (
      title.includes(search) ||
      category.includes(search) ||
      subcategory.includes(search) ||
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
                <h3>My <span>Courses</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>

                <Link className='bread-link' to=""><span>My Course</span></Link>

            </section>

            <Link to={COURSE_ROUTES.CREATE} className="edit-btn m-0">
            <FontAwesomeIcon icon={faPlus} className="icon"/>  Create Course
            </Link>
        </div>

            <hr className="mb-4"/>

        
        <p className="text-muted text-center">Manage courses you've created or that been assigned to you.</p>

        {/* <hr className="mb-4"/> */}
        
        {/* Search */}
        <div className="d-flex align-items-center gap-2 mb-3 search-toolbar">
            <div className="input-group flex-grow-1">

            <span className="input-group-text">
                <i className="fa-solid fa-search"></i>
            </span>
                <input
                type="text"
                placeholder="Search by title, category, subcategory, or ID"
                className="form-control"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                />
            </div>

            <button
                className="btn border-primary text-primary d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
                disabled
            >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filter</span>
            </button>
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

                    <h4>No Course Found</h4>

                    <p>You haven't created or been assigned any courses yet. Once you create a course or one is assigned to you, it will appear here.</p>
        
                    

                    <Link
                        className="edit-btn"
                        to={COURSE_ROUTES.CREATE}
                        >
                        <FontAwesomeIcon icon={faPlus} /> Create Course
                    </Link>
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
                <div className="d-none d-lg-block">
                    <CourseTable
                        courses={filteredCourses}
                        onDelete={openDeleteDialog}
                    />
                </div>

                  {/* Mobile */}
                  <div className=" d-block d-lg-none">
                    <MobileCourseCard
                      courses={filteredCourses}
                      onDelete={openDeleteDialog}
                    />
                  </div>
                </>

            )
            
        }

      </div>

            {/* Confirmation Dialog Box */}

      <ConfirmationDialogBoxUi

        open={deleteOpen}

        title="Delete Course"
        confirmText="Delete"
        confirmVariant="danger"

        loading={loadingDelete}

        onCancel={() => {
            setDeleteOpen(false);
            setSelectedCourse(null);
        }}

        onConfirm={handleDelete}
    >

        Are you sure you want to delete <br /> 

        <strong className="fw-bold" style={{textTransform:'capitalize'}}>

            {" "}
            {selectedCourse?.title?.en}

        </strong>

        ?

        <br /><br />

        <p className="text-danger" style={{fontSize:'12px'}}> This action cannot be undone.</p>

      </ConfirmationDialogBoxUi>
      
    </>
  );
};

export default MyCourse;