import React, { useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { Link } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import HeaderUi from "../../Common/CommonUI/HeaderUi";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const {i18n} = useTranslation();

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(apiUrl + "courses", {
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
  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(apiUrl + "delete-course/" + id, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();

      if (result.status) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting course");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <p className="text-center my-5">Loading courses...</p>;

  // Columns for DataTable
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "60px" },
    {
      name: "Thumbnail",
      cell: (row) => (
        <img
          src={row.thumbnail || "/default-course.png"}
          alt="thumbnail"
          width="50"
          height="50"
          className="rounded"
        />
      ),
      width: "80px",
    },
    {
      name: "Title",
      selector: (row) => row.title?.[i18n.language] || row.title?.en,
      sortable: true,
      wrap: true,
    },
    {
      name: "Category",
      selector: (row) => row.category?.name?.[i18n.language] || row.category?.name?.en || "N/A",
      sortable: true,
    },
    {
      name: "Subcategory",
      selector: (row) => row.subcategory?.name?.[i18n.language] || row.subcategory?.name?.en || "N/A",
      sortable: true,
    },
    {
      name: "Teacher",
      selector: (row) => row.teacher?.name || "N/A",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "published" ? "bg-success" : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => (row.price ? `$${parseFloat(row.price).toFixed(2)}` : "Free"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Link
            to={`/admin/course/view-course/${row.id}`}
            className="btn btn-sm btn-info"
          >
            View
          </Link>
          <Link
            to={`/admin/course/update-course/${row.id}`}
            className="btn btn-sm btn-primary"
          >
            Update
          </Link>
          <button
            onClick={() => deleteCourse(row.id)}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

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
      <HeaderUi />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9">
              <div className="card shadow border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="h5">All Courses</h4>
                    <Link
                      to="/admin/course/create"
                      className="btn btn-success"
                    >
                      Create Course
                    </Link>
                  </div>
                  <hr />

                  {/* Search */}
                  <div className="d-flex mb-3 gap-3">
                    <input
                      type="text"
                      placeholder="Search by title, category, subcategory, or ID"
                      className="form-control"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>

                  {/* DataTable */}
                  <DataTable
                    columns={columns}
                    data={filteredCourses}
                    pagination
                    paginationPerPage={25}
                    highlightOnHover
                    striped
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CourseList;