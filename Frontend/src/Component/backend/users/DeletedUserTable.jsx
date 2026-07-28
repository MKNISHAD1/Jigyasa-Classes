import React from 'react'
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import DataTable from 'react-data-table-component';

const DeletedUserTable = ({
    users,
    onDelete,
    onRestore,
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

  // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

        return new Date(date).toLocaleDateString("en-IN",{
            day:"numeric",
            month:"long",
            year:"numeric",
        });

    };  

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
        </>
      ),
      width: "70px",
    },

    // Name of User
    { name: "Name", 
        selector: (row) => row.name, 

        cell: (row) =>(
        <>

            <div className=" name"
                title={row.name}
                style={{textTransform:'capitalize',fontWeight:'500'}}
            >
                {row.name}
            </div>
        </>
        ),

        sortable: true,
        // width:'130px'
    },

    // Email
    { name: "Email", 
        selector: (row) => row.email, 
                cell: (row) =>(
        <>
            <div className='teacher-name' title={row.email}>
                {row.email}
            </div>
        </>),
        sortable: true ,
        // width: "130px"
    },

    // User Role
    { name: "Role", 
        selector: (row) => row.roles?.[0]?.name || "N/A", 

        cell:row => (
            <>
                <span className={`role-badge ${roleStyles[row.roles?.[0]?.name]}`}
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
                    {formatRole(row.roles?.[0]?.name)}
                </span>
            </>
        ),
        sortable: true ,
        width:'120px'
    },

    // Course Deleted by
    {
      name: "Deleted By",
      selector: (row) => row.deleted_by?.name || "N/A",
      cell : row => (
        <div className="teacher-name"
            title={row.deleted_by?.name}
        >
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
        <div className="teacher-name" title={formatDate(row.deleted_at)}>
          {formatDate(row.deleted_at)}
        </div>
      ),
      sortable: true,
      width:'120px'
    },

    // Action
    {
        name: "Actions",
        cell: (row) => (
        <>
            <ActionButtons
                onDelete={()=> onDelete(row)}
                onRestore={()=> onRestore(row)}
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
    
    </>  )
}

export default DeletedUserTable