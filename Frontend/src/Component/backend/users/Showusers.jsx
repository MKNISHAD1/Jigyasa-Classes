import React, { useEffect, useState } from 'react'
import Header from '../../Common/Header'
import Sidebar from '../../Common/Sidebar'
import { Link, useParams } from 'react-router-dom';
import { apiUrl, token } from '../../Common/http';
import { toast } from 'react-toastify';
import DataTable from "react-data-table-component";
import { DASHBOARD_ROUTES, USER_ROUTES } from '../../../constants/nevigation/routes';
import { faAngleRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import PageNotFound from "../../../assets/images/not-found.jpeg"
import UserTable from './UserTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConfirmationDialogBoxUi from '../../Common/CommonUI/ConfirmationDialogBoxUi';
import MobileUserList from './MobileUserList';

const Showusers = () => { 
 
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);


    // Fetch Users
    const fetchUsers = async () => {
        try{

          setLoading(true);
          // Fetch User List

          const res = await fetch(apiUrl +'get-users',{
              'method':'GET',
              'headers' : {
                  'Content-type' : 'application/json',
                  'Accept' : 'application/json',
                  'Authorization' : `Bearer ${token()}`
              }
          });

          // Ensure response is JSON
          const result = await res.json();
          
          if (result.status) {
              setUsers(result.user);
          } else {
              toast.error('Failed to fetch users');
          }
      } catch (error) {
          console.error('Fetch error:', error);
          toast.error('Something went wrong while fetching users');
      } finally {
          setLoading(false);
        }
    }


    // soft delete users api

    const handleDelete = async () => {

        if (!selectedUser) return;

        setLoadingDelete(true);

        try{
          
          const res = await fetch(apiUrl + 'delete-user/' + selectedUser.id, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token()}`
            }
          });

          const result = await res.json();


          if (result.status) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
            toast.success(result.message);
          } else {
            toast.error(result.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Something went wrong while deleting user');
        }finally{

          setLoadingDelete(false);

          setDeleteOpen(false);

          setSelectedUser(null);

        }
    };

  // helper function dialog
  const openDeleteDialog = (user) => {
      setSelectedUser(user);
      setDeleteOpen(true);
  };


    useEffect(() => {
        fetchUsers();
    },[]);

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

          <h5 className="mt-3 mb-1">Loading User List...</h5>

          <small className="text-muted">
            Please wait while we fetching users.
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
                <h3>Manage <span>Users</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                <span><FontAwesomeIcon icon={faAngleRight} className="icon"/></span>

                <Link className='bread-link' to=""><span>All Users</span></Link>

            </section>

            <Link to={USER_ROUTES.CREATE} className="edit-btn m-0">
            <FontAwesomeIcon icon={faPlus} className="icon"/>  Create User
            </Link>
        </div>

        <hr className="mb-4"/>
      
        <p className="text-muted text-center mb-4 course-list-heading">Manage all users present in system. </p>

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
            <option value="super_admin">Super Admin</option>
          </select>
        </div>


        {
           filteredUsers.length === 0 ? (

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
                    <UserTable
                      users={filteredUsers}
                      onDelete={openDeleteDialog}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="d-block d-lg-none">
                    <MobileUserList
                      users={filteredUsers}
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

        title="Delete User"
        confirmText="Delete User"
        confirmVariant="danger"

        loading={loadingDelete}

        onCancel={() => {
            setDeleteOpen(false);
            setSelectedUser(null);
        }}

        onConfirm={handleDelete}
    >

        Are you sure you want to delete this user <br />

        <strong>

            
            {selectedUser?.name}

        </strong>

        ?

        <br /><br />

        <p className="text-danger" style={{fontSize:'12px'}}> This action cannot be undone.</p>

      </ConfirmationDialogBoxUi>


    </>
  )
}

export default Showusers