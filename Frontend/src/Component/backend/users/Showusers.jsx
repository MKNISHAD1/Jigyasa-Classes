import React, { useEffect, useState } from 'react'
import Header from '../../Common/Header'
import Sidebar from '../../Common/Sidebar'
import { Link } from 'react-router-dom';
import { apiUrl, token } from '../../Common/http';
import { toast } from 'react-toastify';
import DataTable from "react-data-table-component";

const Showusers = () => {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");


    // Fetch Users
    const fetchUsers = async () => {
        try{
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
    }  finally {
       setLoading(false);
        }

    }


    // soft delete users api

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(apiUrl + 'delete-user/' + id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token()}`
        }
      });

      const result = await res.json();

      if (result.status) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong while deleting user');
    }
  };


    useEffect(() => {
        fetchUsers();
    },[]);

    if (loading) return <p className="text-center my-5">Loading users...</p>;

  // Columns for DataTable of users
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width:"60px" },
    { name: "Name", selector: (row) => row.name, sortable: true, },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Username", selector: (row) => row.username, sortable: true },
    { name: "Role", selector: (row) => row.role || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <>
        <div className="actions-cell">
          <Link
            to={`/admin/users/edituser/${row.id}`}
            className="btn btn-primary btn-sm"
            >Edit
          </Link>
          <button
            onClick={() => deleteUser(row.id)}
            className="btn btn-warning btn-sm"
            >
            Delete
          </button>
          <Link
            to={`/admin/users/${row.id}/suspend`}
            className="btn btn-danger btn-sm"
            >
            Suspend
          </Link>
           </div>
        </>
      ),
    },
  ];

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
    <Header/>
    <main>
        <div className="container my-5">
        <div className="row">
            <div className="col-md-3">
                {/* Sidebar Here  */}
                <Sidebar />
            </div>
            <div className="col-md-9">
                {/* Show Users */}

                <div className="card shadow border-0">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className='h5'>All Users</h4>
                            <Link to="/admin/users/createuser" className='btn btn-success'>Create User</Link>
                        </div>
                        <hr />
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

                          {/* DataTable */}
                          <DataTable
                            columns={columns}
                            data={filteredUsers}
                            progressPending={loading}
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
  )
}

export default Showusers