import React from 'react'
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';

const UserTable = ({
    users,
    onDelete,
}) => {

    // Badge based on Role
    const roleStyles = {
        student: "badge-student",
        teacher: "badge-teacher",
        moderator: "badge-moderator",
        admin: "badge-admin",
        super_admin: "badge-super-admin",
    };

    const formatRole = role =>
    role
        ?.replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    // Columns for DataTable of users
    const columns = [

    { name: "#", 
      cell:(row,index) => index + 1, 
      width: "55px"
    },

    // Thumbnail 
    {
      name: "Profile",
      cell: (row) => (
        <>
        
          <Link
            to={`/admin/users/view-user/${row.id}`}
            >
              <img
                src={row.profile_pic || "/default-course.png"}
                alt="thumbnail"
                height="50px"
                width="50px"
                className="p-1 course-thumbnail"
                style={{
                    borderRadius:'50%',
                }}
              />

          </Link>
        
        </>
      ),
      width: "100px",
    },

    { name: "Name", 
        selector: (row) => row.name, 

        cell: (row) =>(
        <>
            <Link
                to={`/admin/users/view-user/${row.id}`}
                className="course-title-link"
                >
                    <div className=" name"
                        title={row.name}
                        style={{textTransform:'capitalize',fontWeight:'500'}}
                    >
                        {row.name}
                    </div>
            </Link>
        </>
        ),

        sortable: true,
        
    },

    { name: "Email", 
        selector: (row) => row.email, 
        sortable: true 
    },

    { name: "Username", 
        selector: (row) => row.username, 
        sortable: true 
    },

    { name: "Role", 
        selector: (row) => row.role || "N/A", 

        cell:row => (
            <>
                <span className={`role-badge ${roleStyles[row.role]}`}
                      style={{
                        margin:'auto',
                        fontSize:'9px',
                        width:'70px',
                        borderRadius:'5px',
                        padding:'5px',
                        textAlign:'center',
                        textTransform:'capitalize'
                      }}
                >
                            {formatRole(row.role)}
                </span>
            </>
        ),
        sortable: true ,
        width:'120px'
    },

    {
        name: "Actions",
        cell: (row) => (
        <>
            <ActionButtons
                viewLink={`/admin/users/view-user/${row.id}`}
                editLink={`/admin/users/edit-user/${row.id}`}
                onDelete={()=> onDelete(row)}
                suspendLink={`/admin/users/${row.id}/suspend`}
            />
        </>
        ),
    },
    ];

return (
    <>
        <div className = "table-wrapper" >
        
            {/* DataTable */}
                <DataTable
                columns={columns}
                data={users}
                pagination
                paginationPerPage={25}
                highlightOnHover
                striped
                />
        </div>
    
    </>
  )
}

export default UserTable