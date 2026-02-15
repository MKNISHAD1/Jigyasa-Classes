import React, { useEffect, useState } from "react";
import { apiUrl, token } from "../../Common/http";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { toast } from "react-toastify";

const DeletedCourses = () => {
  const [courses, setCourses] = useState([]);

  // Fetch deleted courses
  const fetchDeleted = async () => {
    try {
      const res = await fetch(apiUrl + "deletedcourses", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });
      const result = await res.json();
      if (result.status) {
        setCourses(result.courses || []);
      } else {
        toast.error("Failed to fetch deleted courses");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  // Restore course
  const handleRestore = async (id) => {
    try {
      const res = await fetch(apiUrl + "restore-course/"+ id, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });
      const result = await res.json();
      if (result.status) {
        toast.success("Course restored successfully");
        fetchDeleted(); // refresh list
      } else {
        toast.error(result.message || "Restore failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // Permanent delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch(apiUrl + "force-delete-course/"+ id, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });
      const result = await res.json();
      if (result.status) {
        toast.success("Course permanently deleted");
        fetchDeleted();
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9 dashboard">
              <div className="card shadow border-0 p-4">
                <h4 className="mb-3 text-center">Deleted Courses</h4>

                {courses.length === 0 ? (
                  <p className="text-center">No deleted courses found.</p>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>{course.title?.en}</td>
                          <td>{course.price}</td>
                          <td>{course.status}</td>
                          <td>
                            <button
                              onClick={() => handleRestore(course.id)}
                              className="btn btn-success btn-sm me-2"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete Permanently
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DeletedCourses;
