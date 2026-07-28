import { useEffect, useState } from "react";
import { apiUrl, token } from "../../Common/http";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageNotFound from "../../../assets/images/not-found.jpeg"
import DeletedUserTable from "./DeletedUserTable";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";
import MobileDeletedUsers from "./MobileDeletedUsers";
// import UserTable from './UserTable';



const Deletedusers = () => {
  
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [restoreOpen, setRestoreOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

  // Fetching User in Trashed or deleted (soft delete)
    const fetchDeletedUsers = async () => {
        try{
          setLoading(true);
          // Fetch User List

            const res = await fetch(apiUrl +'deleted-users',{
                'method':'GET',
                'headers' : {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
                }
            });
            const result = await res.json();
            setUsers(result.user);// user after result iss variable name defined in backend API
          } catch (error) {
              console.error('Fetch error:', error);
              toast.error('Something went wrong while fetching users');
          } finally {
              setLoading(false);
        }
    }


useEffect(() => {
    fetchDeletedUsers();
}, []);

    // Restore User 
    const handleRestore = async () =>{

    if (!selectedUser) return;

    setLoadingDelete(true);

    try{
            const res = await fetch(apiUrl+'user-restore/'+ selectedUser.id,{
            'method':'POST',
            'headers' : {
                'Content-type' : 'application/json',
                'Accept' : 'application/json',
                'Authorization' : `Bearer ${token()}`
            }
        });

        const result = await res.json();
        
        if(result.status==true){
            const restoreUser = users.filter(user => user.id != selectedUser.id)
            setUsers(restoreUser);
            toast.success("User restored successfully");
            fetchDeletedUsers(); // refresh list
        } else {
            toast.error(result.message || "Restore failed");
        }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            
            setLoadingDelete(false);
    
            setRestoreOpen(false);
    
            setSelectedUser(null);
        }

    }

    // Permanent Delete User
    const handlePermanentDelete = async () =>{

    if (!selectedUser) return;

    setLoadingDelete(true);

    try{
        const res = await fetch(apiUrl+'user-force-delete/'+ selectedUser.id,{
            'method':'DELETE',
            'headers' : {
                'Content-type' : 'application/json',
                'Accept' : 'application/json',
                'Authorization' : `Bearer ${token()}`
            }
        });
        const result = await res.json();
        
        if(result.status==true){
            const newUser = users.filter(user => user.id != selectedUser.id)
            setUsers(newUser);
            toast.success(result.message)
            fetchDeletedUsers();
        } else {
            toast.error(result.message)
        }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally{
    
            setLoadingDelete(false);
    
            setDeleteOpen(false);
    
            setSelectedUser(null);
    
        }
    }

  // helper function delete dialog
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  // helper function restore dialog
  const openRestoreDialog = (user) => {
    setSelectedUser(user);
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

          <h5 className="mt-3 mb-1">Loading Deleted User List...</h5>

          <small className="text-muted">
            Please wait while we fetching Deleted users.
          </small>
        </div>
      </div>
    );
  }


  // Apply search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      user.email?.toLowerCase().includes(filterText.toLowerCase()) ||
      user.username?.toLowerCase().includes(filterText.toLowerCase()) ||
      String(user.id).includes(filterText);

    const matchesRole =
      selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

//   console.log(selectedUser?.roles?.[0]?.name);

    




  return (
    <>

    
      <div className="dashboard-card mt-4">
        
        {/* header */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section m-0">
                <h3>Deleted <span>users</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

                <Link className='bread-link' to=""><span>Deleted Users</span></Link>

            </section>
        </div>

        <hr className="mb-4"/>

        
        <p className="text-muted text-center mb-4 course-list-heading">Manage all Deleted Users </p>

        {/* Search And Role sort*/}
        <div className="d-flex mb-3 gap-3">
          <input
            type="text"
            placeholder="Search by name, email, username, or ID"
            className="form-control"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <select
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>


        {
            users.length === 0 ? (
                
                // if no courses created yet
                <div className="empty-courses text-center py-5">
                    <img
                        src={PageNotFound}
                        alt="No courses found"
                        className="empty-img"
                    />

                    <h4>No Deleted Users</h4>

                    <p> Once any user get deleted it will appear here.</p>
        
                </div>

            ) : filteredUsers.length === 0 ? (

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
                    <DeletedUserTable
                      users={filteredUsers}
                      onDelete={openDeleteDialog}
                      onRestore={openRestoreDialog}
                    />
                  </div>

                  {/* Mobile */}
                  <div className=" d-block d-lg-none">
                    <MobileDeletedUsers
                      users={filteredUsers}
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

        title="Permanently Delete User"
        confirmText="Permanent Delete"
        confirmVariant="danger"

        loading={loadingDelete}

        onCancel={() => {
            setDeleteOpen(false);
            setSelectedUser(null);
        }}

        onConfirm={handlePermanentDelete}
    >

        Are you sure you want to permanently delete this<br />

        <strong>

            {" "}
            {selectedUser?.name}

        </strong>

        ?

        <br /><br />

        <p className="text-danger" style={{fontSize:'12px'}}> This action cannot be undone.</p>

      </ConfirmationDialogBoxUi>

      {/* Confirmation Dialog Box for Restore Button */}
      
      <ConfirmationDialogBoxUi

        open={restoreOpen}

        title="Restore User"
        confirmText="Restore User"
        confirmVariant="success"

        loading={loadingDelete}

        onCancel={() => {
            setRestoreOpen(false);
            setSelectedUser(null);
        }}

        onConfirm={handleRestore}
    >

        Are you sure you want to restore this <br />

        <strong>

            {" "}
            {selectedUser?.name}

        </strong>

        ?

      </ConfirmationDialogBoxUi>


    </>
  );
};

export default Deletedusers;