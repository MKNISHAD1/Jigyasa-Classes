import React, { useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { Link } from "react-router-dom";

const SuspendList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch suspended users
  const fetchSuspended = async () => {
    setLoading(true);
    try {
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
  const unsuspendUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to lift suspension from this user?"
      )
    )
      return;

    try {
      const res = await fetch(apiUrl + "user-unsuspended/" + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      console.log(res);

      if (!res.ok) throw new Error("Failed to unsuspend user");

      alert("✅ User unsuspended successfully");
      fetchSuspended(); // refresh list
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <>
      <Header />
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
                  <div className="d-flex justify-content-between">
                    <h4 className="h5">All Users</h4>
                    <Link
                      to="/admin/users/createuser"
                      className="btn btn-success"
                    >
                      Create User
                    </Link>
                  </div>
                  <hr />

                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Reason</th>
                        <th>Suspension End</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            Loading suspended users...
                          </td>
                        </tr>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <tr key={`user-${user.id}`}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.suspension_reason}</td>
                            <td>{user.suspended_until}</td>
                            <td>
                              {Array.isArray(user.roles) && user.roles.length > 0
                                ? user.roles[0].name
                                : "-"}
                            </td>
                            <td>
                              <button
                                onClick={() => unsuspendUser(user.id)}
                                className="btn btn-success btn-sm ms-2"
                              >
                                Lift Suspension
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            No suspended users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SuspendList;
