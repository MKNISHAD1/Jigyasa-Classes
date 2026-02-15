import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/Auth";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { Link, useParams } from "react-router-dom";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";

const DeletedLessons = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState([]);


  // Fetch deleted lessons
  const fetchTrashedLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}courses/${courseId}/lessons/trashed-by-teacher`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      const data = await res.json();
      if (data.status) setLessons(data.lessons);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch deleted lessons");
    }
    setLoading(false);
  };


  // Bulk restore action
  const restoreLessons = async (ids) => {
    if (!ids.length) return;

    if (!window.confirm(`Restore  ${ids.length}  lessons?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}courses/${courseId}/lessons/bulk-restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_ids: ids }),
      });

      const data = await res.json();
      if (data.status) {
        toast.success("All Seleced Lessons restored!");
        setLessons((prev) => prev.filter((l) => !ids.includes(l.id)));
        setSelectedLessons([]);
      } 
      else
         toast.error(data.message || "Failed to restore lesson");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Bulk permanently delete
  const permanentlyDeleteLessons = async (ids) => {
    if (!ids.length) return;

    if (!window.confirm(`Permanently delete selected ${ids.length} lessosn ? This cannot be undone!`)) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}courses/${courseId}/lessons/bulk-force-delete`, {
        method: "DELETE",
        headers: { Authorization:  `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_ids: ids }),
      });

      const data = await res.json();
      if (data.status) {
        toast.success(data.message || "Lessons permanently deleted!");
        setSelectedLessons([]);
        fetchTrashedLessons();
      } else toast.error(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user) fetchTrashedLessons();
  }, [user]);

  // Single restore/delete using bulk functions
  const restoreSingleLesson = async (id) => {
    restoreLessons([id]);
  };

  const deleteSingleLesson = async (id) => {
    permanentlyDeleteLessons([id]);
  };


  const columns = [
    { name: "ID", selector: (row) => row.id, width: "80px" },
    { name: "Title", selector: (row) => row.title?.en || row.title, wrap: true },
    { name: "Order", selector: (row) => row.order, width: "80px" },
    {
      name: "Deleted At",
      selector: (row) => new Date(row.deleted_at).toLocaleString(),
      width: "200px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-success" onClick={() => restoreSingleLesson(row.id)}>
            Restore
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => deleteSingleLesson(row.id)}>
            Delete Permanently
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3"><Sidebar /></div>
            <div className="col-md-9 dashboard">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="mb-3">🗑 Deleted Lessons</h3>
                <p className="text-muted">Manage and restore your deleted lessons.</p>

                {/* Bulk action buttons */}
                <div className="mb-3 d-flex gap-2">
                  <button
                    className="btn btn-success"
                    disabled={selectedLessons.length === 0}
                    onClick={() => restoreLessons(selectedLessons)}
                  >
                    Restore Selected
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={selectedLessons.length === 0}
                    onClick={() => permanentlyDeleteLessons(selectedLessons)}
                  >
                    Permanently Delete Selected
                  </button>
                </div>

                <DataTable
                  columns={columns}
                  data={lessons}
                  selectableRows
                  selectableRowsHighlight
                  onSelectedRowsChange={(state) => setSelectedLessons(state.selectedRows.map(r => r.id))}
                  progressPending={loading}
                  pagination
                  highlightOnHover
                  striped
                />

                <div className="mt-3">
                  <Link to={`/admin/course/view-course/${courseId}`} className="btn btn-secondary">
                    Back to Lessons
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DeletedLessons;

