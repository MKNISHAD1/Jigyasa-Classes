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
    onRestore,
}) => {
 
  const {i18n} = useTranslation();

  // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

        return new Date(date).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"long",
            year:"numeric",
        });

    };  

  // Columns for DataTable
  const columns = [

    //  serial no.
    { 
      name: "#", 
      cell:(row,index) => index + 1, 
      width: "55px"
    },

    // Thumbnail 
    {
      name: "Thumbnail",
      cell: (row) => (
        <>
              <img
                src={row.thumbnail || "/default-course.png"}
                alt="thumbnail"
                width="90px"
                height="60px"
                className="rounded p-2 course-thumbnail"
              />
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
            <div
              className="course-title"
              title={row.title?.[i18n.language] || row.title?.en}
            >
              {row.title?.[i18n.language] || row.title?.en}
            </div>
        </>
      ),
      width:'160px',
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

    // Course Deleted by
    {
      name: "Deleted By",
      selector: (row) => row.deleted_by?.name || "N/A",
      cell : row => (
        <div className="teacher-name">
          {row.deleted_by?.name}
        </div>
      ),
      sortable: true,
      width:'120px'
    },

    // Course Deleted time
    {
      name: "Deleted  On",
      selector: (row) => row.deleted_at || "N/A",
      cell : row => (
        <div className="teacher-name">
          {formatDate(row.deleted_at)}
        </div>
      ),
      sortable: true,
      width:'120px'
    },



    // Course Action Buttons
    {
      name: "Actions",
      cell: (row) => (

        <ActionButtons
            onDelete={() => onDelete(row)}
            onRestore={() => onRestore(row)}
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