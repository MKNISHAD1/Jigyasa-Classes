import React, { use, useState } from 'react'
import { faEdit, faEye } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';

const CourseTable = ({
    courses,
    onDelete,
}) => {
 
  const {i18n} = useTranslation();
  

  // Columns for DataTable
  const columns = [

    //  serial no.
    { name: "#", 
      cell:(row,index) => index + 1, 
      width: "55px"
    },

    // Thumbnail 
    {
      name: "Thumbnail",
      cell: (row) => (
        <>
          <Link
            to={`/admin/course/view-course/${row.id}`}
            >
              <img
                src={row.thumbnail || "/default-course.png"}
                alt="thumbnail"
                width="100%"
                height="100%"
                className="rounded course-thumbnail"
              />

          </Link>
        
        </>
      ),
      width: "100px",
    },

    // Course title
    {
      name: "Title",
      selector: (row) =>
        row.title?.[i18n.language] || row.title?.en || "",
      sortable: true,

      cell: (row) => (
        <>
          <Link
              to={`/admin/course/view-course/${row.id}`}
              className="course-title-link"
          >              
            <div
              className="course-title"
              title={row.title?.[i18n.language] || row.title?.en}
            >
              {row.title?.[i18n.language] || row.title?.en}
            </div>
          </Link>
        </>
      ),
      width:'130px'
    },
    
    // category and subcategory
    {
      name: "Category",

      selector: (row) =>
        row.category?.name?.[i18n.language] ||
        row.category?.name?.en ||
        "",

      sortable: true,

      cell: (row) => (
        <div>
          <div className="course-category">
            {row.category?.name?.[i18n.language] ||
              row.category?.name?.en}
          </div>

          <small className="text-muted">
            {row.subcategory?.name?.[i18n.language] ||
              row.subcategory?.name?.en ||
              "General"}
          </small>
        </div>
      ),
      width:'120px'
    },

    // Teacher Name
    {
      name: "Teacher",
      selector: (row) => row.teacher?.name || "N/A",
      cell : row => (
        <div className="teacher-name">
          {row.teacher?.name}
        </div>
      ),
      sortable: true,
      width:'120px'
    },

    // Course Status
    {
      name: "Status",
      selector: row => row.status,
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "published" ? "badge-published text-success" : "badge-draft"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
      width:'90px'
    },

    // Course price
    {
      name: "Price",
      selector: (row) => (row.price ? `₹ ${row.price}` : "Free"),
      cell : row => (
        <div className="course-price text-success fw-semibold">
          {row.price ? `₹ ${row.price}` : "Free"}
        </div>
      ),
      sortable: true,
      width:'110px'
    },

    // Course Action Buttons
    {
      name: "Actions",
      cell: (row) => (

        <ActionButtons
            viewLink={`/admin/course/view-course/${row.id}`}
            editLink={`/admin/course/update-course/${row.id}`}
            onDelete={() => onDelete(row)}
            />
      ),
      width:'130px'
    },

  ];

  return (
    <>
    <div className = "table-wrapper" >
        <DataTable
            columns={columns}
            data={courses}
            pagination
            paginationPerPage={25}
            highlightOnHover
            striped
            responsive
        />
</div>
    </>
  )
}

export default CourseTable