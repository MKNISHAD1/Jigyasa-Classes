import React, { useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { Link } from "react-router-dom";
import { DASHBOARD_ROUTES, USER_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import PageNotFound from "../../../assets/images/not-found.jpeg"
import SuspendedUserTable from "./SuspendedUserTable";
import MobileSuspendedUsers from "./MobileSuspendedUsers";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";
import { toast } from "react-toastify";


const SuspendList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [liftSuspensionOpen, setLiftSuspensionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingLiftSuspension, setLoadingLiftSuspension] = useState(false);

  // fetch suspended users
  const fetchSuspended = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl + "suspended-users-list", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();
      setUsers(result.users || []);
    } catch (err) {
      console.error("❌ Error fetching suspended users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspended();
  }, []);


  
  // unsuspend user manually
  const handleLiftSuspension = async () => {

    if (!selectedUser) return;

    setLoadingLiftSuspension(true);

    try{
          
      const res = await fetch(apiUrl + "user-unsuspended/" + selectedUser.id , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      
      const result = await res.json();

      console.log(result);

        if(result.status==true){
            const unsuspendedUser = users.filter(user => user.id != selectedUser.id)
            setUsers(unsuspendedUser);
            toast.success("Suspension Lifted successfully From User ");
            fetchSuspended(); // refresh list
        } else {
            toast.error(result.message || "Suspension Removal failed");
        }
        } catch (error) {
            toast.error('Something went wrong while deleting user');
        } finally{

      setLoadingLiftSuspension(false);

      setLiftSuspensionOpen(false);

      setSelectedUser(null);

    }
  };

  // helper function dialog
  const openLiftSuspensionDialog = (user) => {
      setSelectedUser(user);
      setLiftSuspensionOpen(true);
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

          <h5 className="mt-3 mb-1">Loading Suspended User List...</h5>

          <small className="text-muted">
            Please wait while we fetching suspended users.
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
  



  return (
    <>
      <div className="dashboard-card mt-4">
        
        {/* header */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section m-0">
                <h3>Suspended <span>Users</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

                <Link className='bread-link' to=""><span>Suspended Users</span></Link>

            </section>

            <Link to={USER_ROUTES.CREATE} className="edit-btn m-0">
            <FontAwesomeIcon icon={faPlus} className="icon"/>  Create User
            </Link>
        </div>

        <hr className="mb-4"/>
      
        <p className="text-muted text-center mb-4 course-list-heading">Manage all suspended users present in system. </p>

        {/* Search + Filter */}
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

                    <h4>No Suspended Users Found</h4>

                    <p> Once any user get suspended it will appear here.</p>
        
                </div>

            ) : filteredUsers.length === 0 ? (

                // if no search result  match found
                <div className="empty-courses text-center py-5">
                    <img
                    src={PageNotFound}
                    alt="No User found"
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
                    <SuspendedUserTable
                      users={filteredUsers}
                      onLiftSuspension={openLiftSuspensionDialog}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="d-block d-lg-none">
                    <MobileSuspendedUsers
                      users={filteredUsers}
                      onLiftSuspension={openLiftSuspensionDialog}
                    />
                  </div>
                </>

            )
            
        }

      </div>

      {/* Confirmation Dialog Box */}

      <ConfirmationDialogBoxUi

        open={liftSuspensionOpen}

        title="Lift Suspension"
        confirmText="Lift Suspension"
        confirmVariant="success"

        loading={loadingLiftSuspension}

        onCancel={() => {
            setLiftSuspensionOpen(false);
            setSelectedUser(null);
        }}

        onConfirm={handleLiftSuspension}
    >

        Are you sure you want to lift suspension from this<br />

        <strong>

            
            {selectedUser?.name}

        </strong>

        ?

        <br /><br />

      </ConfirmationDialogBoxUi>


    </>
  );
};

export default SuspendList;
