import React from 'react'
import ActionButtons from '../../Common/CommonUI/ActionButtonsUi';
import DataTable from 'react-data-table-component';

const SuspendedUserTable = ({
    users,
    onLiftSuspension,
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
            hour: "numeric",
            minute: "2-digit",
        });

    };  

    // Columns for DataTable of users
    const columns = [

    { name: "#", 
      cell:(row,index) => index + 1, 
      width: "40px"
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

            <div className=" teacher-name"
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
        width:'100px'
    },

    // User Suspended by
    {
      name: "Suspended By",
      selector: (row) => row.suspended_by?.name || "System",
      cell : row => (
        <div className="teacher-name"
            title={row.suspended_by?.name || "System"}
        >
          {row.suspended_by?.name || "System"}
        </div>
      ),
      sortable: true,
      width:'120px'
    },

     // User Suspension Reason 
    {
      name: "Suspension Reason",
      selector: (row) => row.suspension_reason || "N/A",
      cell : row => (
        <div className="teacher-name"
            title={row.suspension_reason}
        >
          {row.suspension_reason}
        </div>
      ),
      sortable: true,
      width:'120px'
    },

    // User Suspension time
    {
      name: "Suspended  On",
      selector: (row) => row.suspended_at || "N/A",
      cell : row => (
        <div className="teacher-name" title={formatDate(row.suspended_at)}>
          {formatDate(row.suspended_at)}
        </div>
      ),
      sortable: true,
      width:'120px'
    },

    // User Suspensionn End
    {
      name: "Suspenison Till",
      selector: (row) => row.suspended_until || "N/A",
      cell : row => (
        <div className="teacher-name" title={formatDate(row.suspended_until)}>
          {formatDate(row.suspended_until)}
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
                onLiftSuspension={()=> onLiftSuspension(row)}
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
                paginationPerPage={10}
                highlightOnHover
                striped
                responsive
                />
        </div>
    
    </>  )
}

export default SuspendedUserTable