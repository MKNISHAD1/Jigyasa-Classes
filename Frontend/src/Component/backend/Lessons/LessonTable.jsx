import React, { useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { apiUrl, token } from "../../Common/http";
import { useTranslation } from "react-i18next";
import ProtectedVideoPlayer from "./LessonViewer";

const LessonTable = ({ lessons = [], courseId, onLessonDeleted, reloadLessons}) => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState([]);

  // ✅ For video modal
  const [selectedLesson, setSelectedLesson] = useState(null);
  const handleViewLesson = (lesson) => setSelectedLesson(lesson);
  const handleClosePlayer = () => setSelectedLesson(null);



  const deleteLesson = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}courses/${courseId}/delete-lesson/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });


      // Some backends return empty response for 204 — guard it safely
      const text = await res.text();
      const data = text ? JSON.parse(text) : { status: false, message: "Invalid server response" };

      if (data.status) {
        toast.success(data.message || "Lesson deleted");
        if (onLessonDeleted) onLessonDeleted([id]);


      // ✅ Re-fetch lessons (refresh table automatically)
      if (typeof reloadLessons === "function") {
        await reloadLessons();
      } 
      } else toast.error(data.message || "Failed to delete lesson");
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting lesson");
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteLessons = async () => {
    if (selectedLessons.length === 0) return;

    if (!window.confirm(`Delete ${selectedLessons.length} selected lessons?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}courses/${courseId}/lessons/bulk-delete`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ lesson_ids: selectedLessons }),
      });
      const data = await res.json();
      if (data.status) {
        toast.success(data.message || "Lessons deleted!");

      if (onLessonDeleted) onLessonDeleted(selectedLessons);
        setSelectedLessons([]);

      // ✅ Re-fetch lessons (refresh table automatically)
      if (typeof reloadLessons === "function") {
        await reloadLessons();
      } 
      } else toast.error(data.message || "Failed to delete selected lessons");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { name: "Order", selector: (row) => row.order || "-", sortable: true, width: "80px" },
    {
      name: "Title",
      selector: (row) => row.title?.[i18n.language] || row.title?.en || "Untitled",
      sortable: true,
      wrap: true,
    },
    {
      name: "Description",
      selector: (row) => row.description?.[i18n.language] || row.description?.en || "-",
      wrap: true,
    },
    // {
    //   name: "Video",
    //   cell: (row) =>
    //     row.video_url ? (
    //       <a href={row.video_url} target="_blank" rel="noreferrer" className="text-blue-500">
    //         View
    //       </a>
    //     ) : (
    //       <span className="text-gray-400">No video</span>
    //     ),
    // },
    {
      name: "Materials",
      cell: (row) =>
        row.materials?.length ? (
          row.materials.map((m, idx) => (
            <a key={idx} href={m.url} target="_blank" rel="noreferrer" className="block text-blue-500">
              File {idx + 1}
            </a>
          ))
        ) : (
          <span className="text-gray-400">No files</span>
        ),
    },

    {
  name: "Status",
  selector: (row) => row.status || "draft",
  cell: (row) => {
    const statusColors = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      archived: "bg-red-100 text-red-700",
    };

    const label =
      row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || "Draft";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusColors[row.status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {label}
      </span>
    );
  },
  sortable: true,
  width: "120px",
},
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
        {/* ✅ View Button triggers modal */}
          <Link
            to={`/admin/course/${courseId}/lesson/${row.id}/lessonplayer`}
            className="btn btn-sm btn-success"
          > View
          </Link>


          <Link
            to={`/admin/course/${courseId}/lesson/${row.id}/edit`}
            className="btn btn-sm btn-primary"
          > Edit
          </Link>
          <button
            disabled={loading}
            onClick={() => deleteLesson(row.id)}
            className="btn btn-sm btn-danger"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>

      ),
    },
  ];

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h5">Lessons {selectedLessons.length > 0 && `(Selected: ${selectedLessons.length})`}</h4>

        <div className="d-flex gap-2">
          <Link to={`/admin/course/${courseId}/lesson/ChangeLessonOrder`} className="btn btn-warning">
            Change Order
          </Link>
          <Link to={`/admin/lesson/create`} className="btn btn-success">
            Create Lesson
          </Link>
          <Link to={`/admin/course/${courseId}/lessons/trashed`} className="btn btn-outline-danger">
            View Deleted Lessons
          </Link>
          <button onClick={bulkDeleteLessons} className="btn btn-danger" disabled={selectedLessons.length === 0}>
            Delete Selected
          </button>
        </div>
      </div>
      <DataTable 
      columns={columns} 
      data={lessons}         
      selectableRows
      selectableRowsHighlight
      onSelectedRowsChange={(state) => setSelectedLessons(state.selectedRows.map(r => r.id))}
      pagination 
      highlightOnHover 
      striped 
      progressPending={loading}
    />
      {/* ✅ Modal player (only shown when lesson selected) */}
      {selectedLesson && (
        <ProtectedVideoPlayer
          lesson={selectedLesson}
          onClose={handleClosePlayer}
        />
      )}

    </div>
  );
};

export default LessonTable;