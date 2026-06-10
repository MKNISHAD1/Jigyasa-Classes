import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Accordion from "react-bootstrap/Accordion";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CourseModule = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
    const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);


  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [creating, setCreating] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLessons, setSelectedLessons] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [editTitleEn, setEditTitleEn] = useState("");
  const [editTitleHi, setEditTitleHi] = useState("");

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeLessons, setRemoveLessons] = useState([]);
  const [selectedRemoveLessons, setSelectedRemoveLessons] = useState([]);
  const [selectedRemoveModule, setSelectedRemoveModule] = useState(null);

  const [selectedModules, setSelectedModules] = useState([]);
  const [showDeletedModules, setShowDeletedModules] = useState(false);
  const [deletedModules, setDeletedModules] = useState([]);
  const [selectedDeletedModules, setSelectedDeletedModules] = useState([]);


// Fetch Modules 

  const fetchCourse = async () => {
    try {
      const res = await fetch(apiUrl + `view-course/${id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const result = await res.json();

      if (result.status) {
        setCourse(result.course);
      } else {
        toast.error("Failed to load course");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading course");
    } finally {
      setLoading(false);
    }
  };

  // Create Module 

  const createModule = async (e) => {
  e.preventDefault();

  if (!titleEn.trim()) {
    toast.error("Module title is required");
    return;
  }

  try {
    setCreating(true);

    const res = await fetch(apiUrl + `module`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course_id: id,
        title_en: titleEn,
        title_hi: titleHi,
      }),
    });

    const result = await res.json();

    if (result.status) {
      toast.success(result.message);

      setTitleEn("");
      setTitleHi("");

      await  fetchCourse();
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    console.error("Create module errro :", error);
    toast.error("Failed to create module");
  } finally {
    setCreating(false);
  }
};

// Assign Lessons

  // 1. open assign model

  const openAssignModal = (module) => {
    setSelectedModule(module);
    setSelectedLessons([]);
    setShowAssignModal(true);
  };

  //2 . Toggle Lesson Selection

  const toggleLesson = (lessonId) => {
    setSelectedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // 3. Assign Lessons API

  const assignLessons = async () => {
  if (!selectedModule) return;

  try {
    const res = await fetch(apiUrl+ `modules/${selectedModule.id}/assign-lessons`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_ids: selectedLessons,
        }),
      }
    );

    const result = await res.json();

    if (result.status) {
      toast.success(result.message);

      setShowAssignModal(false);

      await fetchCourse();
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to assign lessons");
  }
  };


// Edit/Update Modules

  // 1. Open Edit model

  const openEditModal = (module) => {
    setEditingModule(module);

    setEditTitleEn(module.title?.en || "");
    setEditTitleHi(module.title?.hi || "");

    setShowEditModal(true);
  };

  // 2. Update Module
  const updateModule = async () => {

      if (!editingModule) return;

      try {

        const res = await fetch(apiUrl + `update-module/${editingModule.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title_en: editTitleEn,
              title_hi: editTitleHi,
            }),
          }
        );

        const result = await res.json();

        if (result.status) {

          toast.success(result.message);

          setShowEditModal(false);

          await fetchCourse();

        } else {

          toast.error(result.message);

        }

      } catch (error) {

        console.error(error);

        toast.error("Failed to update module");

      }

  };

// Delete modules 

  const deleteModule = async (module) => {

    if (
      !window.confirm(
        `Delete "${module.title?.en}" ?`
      )
    ) {
      return;
    }

    try {

      const res = await fetch(
        apiUrl + `modules/${module.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token()}`
          }
        }
      );

      const result = await res.json();

      if (result.status) {

        toast.success(result.message);

        await fetchCourse();

      } else {

        toast.error(result.message);

      }

    } catch (error) {

      console.error(error);

      toast.error("Failed to delete module");

    }

  };

// remove lessons from module

  // 1. Open Model 
  const openRemoveModal = (module) => {
    setSelectedRemoveModule(module);

    setRemoveLessons(module.lessons || []);

    setSelectedRemoveLessons([]);

    setShowRemoveModal(true);
  };

  // 2. toggle 
  const toggleRemoveLesson = (lessonId) => {
    setSelectedRemoveLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // 3. Remove lesson API

  const removeLessonsFromModule = async () => {

    if (!selectedRemoveModule) return;

    try {

      const res = await fetch(
        apiUrl +
        `modules/${selectedRemoveModule.id}/remove-lessons`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lesson_ids: selectedRemoveLessons,
          }),
        }
      );

      const result = await res.json();

      if (result.status) {

        toast.success(result.message);

        setShowRemoveModal(false);

        await fetchCourse();

      } else {

        toast.error(result.message);

      }

    } catch (error) {

      console.error(error);

      toast.error("Failed to remove lessons");

    }
  };

// Bulk Action Buttons

  // 1. Bulk Delete module 

    const bulkDeleteModules = async () => {

      if (
        !window.confirm(
          `Delete ${selectedModules.length} modules?`
        )
      ) return;

      try {

        const res = await fetch(
          apiUrl + "modules/bulk-delete",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token()}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              module_ids: selectedModules
            })
          }
        );

        const result = await res.json();

        if (result.status) {

          toast.success(result.message);

          setSelectedModules([]);

          await fetchCourse();

        } else {

          toast.error(result.message);

        }

      } catch (error) {

        toast.error("Failed to delete modules");

      }

    };

  // 2. Trashed Module 

    const fetchDeletedModules = async () => {

      try {

        const res = await fetch(
          apiUrl + "deleted-modules",
          {
            headers: {
              Authorization: `Bearer ${token()}`,
            },
          }
        );

        const result = await res.json();

        if (result.status) {

          setDeletedModules(result.modules || []);

        }

      } catch (error) {

        console.error(error);

      }

    };

  // 3. Restore Module
    const bulkRestoreModules = async () => {
      if (selectedDeletedModules.length === 0) {
        toast.error("Select modules first");
        return;
      }

      try {
        const res = await fetch(
          apiUrl + "modules/bulk-restore",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              module_ids: selectedDeletedModules,
            }),
          }
        );

        const result = await res.json();

        if (result.status) {
          toast.success(result.message);

          fetchDeletedModules();
          fetchCourse();

          setSelectedDeletedModules([]);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Restore failed");
      }
    };

  // 4. Permanent Delete Module
    const bulkForceDeleteModules = async () => {
      if (selectedDeletedModules.length === 0) {
        toast.error("Select modules first");
        return;
      }

      if (
        !window.confirm(
          "Permanently delete selected modules?"
        )
      ) {
        return;
      }

      try {
        const res = await fetch(
          apiUrl + "modules/bulk-force-delete",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              module_ids: selectedDeletedModules,
            }),
          }
        );

        const result = await res.json();

        if (result.status) {
          toast.success(result.message);

          fetchDeletedModules();

          setSelectedDeletedModules([]);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Permanent delete failed");
      }
    };


      // open model 
      const openDeletedModules = async () => {
        await fetchDeletedModules();
        setShowDeletedModules(true);
      };







  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container my-5">
          <h4>Loading...</h4>
        </div>
      </>
    );
  }

  console.log("showDeletedModule:",showDeletedModules);

  return (
    <>
      <Header />

      <main>
        <div className="container my-5">
          <div className="row">

            <div className="col-md-3">
              <Sidebar />
            </div>

            <div className="col-md-9">

              <div className="card shadow border-0 p-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3>Course Structure</h3>

                    <p className="text-muted mb-0">
                      {course?.title?.[i18n.language] ||
                        course?.title?.en}
                    </p>
                  </div>
                </div>

                {/* Create Module Card */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body">

                    <h5 className="mb-3">
                      Create Module
                    </h5>

                    <form onSubmit={createModule}>

                      <div className="row">

                        <div className="col-md-5 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Module Title (English)"
                            value={titleEn}
                            onChange={(e) =>
                              setTitleEn(e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-5 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="मॉड्यूल शीर्षक (Hindi)"
                            value={titleHi}
                            onChange={(e) =>
                              setTitleHi(e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-2 mb-3">
                          <button
                            type="submit"
                            className="btn btn-success w-100"
                            disabled={creating}
                          >
                            {creating
                              ? "Creating..."
                              : "Add Module"}
                          </button>
                        </div>

                      </div>

                    </form>

                  </div>
                </div>

                {/* Bulk Module Action Buttons */}

                <div className="mb-3 d-flex gap-2 flex-wrap">


                <input
                    type="checkbox"
                    checked={
                        course?.modules?.length > 0 &&
                        selectedModules.length === course.modules.length
                    }
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedModules(
                                course.modules.map(module => module.id)
                            );
                        } else {
                            setSelectedModules([]);
                        }
                    }}
                />

                <label className="ms-2">
                    Select All
                </label>


                  <button
                    className="btn btn-danger"
                    disabled={selectedModules.length === 0}
                    onClick={bulkDeleteModules}
                  >
                    Delete Selected
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={openDeletedModules}
                  >
                    Deleted Modules
                  </button>

                  <Link
                    to={`/admin/course/${id}/module-order`}
                    className="btn btn-warning"
                  >
                    Module Reorder
                  </Link>

                </div>

                {/* Modules List */}
                {/* <Accordion defaultActiveKey="0">

                {course?.modules?.map((module, index) => (

                    <Accordion.Item
                    eventKey={index.toString()}
                    key={module.id}
                    >

                    <Accordion.Header>

                        <div className="d-flex justify-content-between w-100 pe-3">

                        <span>
                            {module.title?.[i18n.language] ||
                            module.title?.en}
                        </span>

                        <span className="badge bg-primary">
                            {module.lessons_count} Lessons
                        </span>

                        </div>

                    </Accordion.Header>

                    <Accordion.Body>

                        {module.lessons?.length > 0 ? (

                        <ul className="list-group mb-3">

                            {module.lessons.map((lesson) => (

                            <li
                                key={lesson.id}
                                className="list-group-item d-flex justify-content-between"
                            >
                                <span>
                                {lesson.title?.[i18n.language] ||
                                    lesson.title?.en}
                                </span>

                                <span className="badge bg-secondary">
                                {lesson.status}
                                </span>
                            </li>

                            ))}

                        </ul>

                        ) : (

                        <div className="alert alert-light">
                            No lessons assigned
                        </div>

                        )}

                        <div className="d-flex gap-2 flex-wrap">

                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => openAssignModal(module)}
                        >
                          Assign Lessons
                        </button>

                        {module.title?.en !== "General" && (
                            <>
                            <button className="btn btn-warning btn-sm">
                                Edit
                            </button>

                            <button className="btn btn-danger btn-sm">
                                Delete
                            </button>
                            </>
                        )}

                        </div>

                    </Accordion.Body>

                    </Accordion.Item>

                ))}

                </Accordion> */}
                <Accordion defaultActiveKey="0">

                {course?.modules?.map((module, index) => (

                  <Accordion.Item
                    eventKey={index.toString()}
                    key={module.id}
                  >

                    <Accordion.Header>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedModules.includes(module.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      setSelectedModules((prev) =>
                        prev.includes(module.id)
                          ? prev.filter((id) => id !== module.id)
                          : [...prev, module.id]
                      );
                    }}
                  />

                      <div className="d-flex justify-content-between w-100 pe-3">
                        <span>
                          {module.title?.[i18n.language] ||
                            module.title?.en}
                        </span>

                        <span className="badge bg-primary">
                          {module.lessons_count} Lessons
                        </span>

                      </div>


                    </Accordion.Header>

                    <Accordion.Body>

                      {/* Action Buttons */}

                      <div className="d-flex gap-2 flex-wrap">

                        {/* Current Feature */}
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openAssignModal(module)}
                        >
                          Assign Lessons
                        </button>


                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openRemoveModal(module)}
                          disabled={module.lessons_count === 0}
                        >
                          Remove Lessons
                        </button>

                        {module.title?.en !== "General" && (
                          <>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => openEditModal(module)}
                          >
                            Edit Module
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteModule(module)}
                          >
                            Delete Module
                          </button>
                          </>
                        )}


                        <button
                          className="btn btn-info btn-sm"
                          onClick={() =>
                            navigate(
                              `/admin/course/${id}/module/${module.id}/reorder-lessons`
                            )
                          }
                        >
                          Reorder Lessons
                        </button>

                      </div>

                      <hr />

                      {/* Lesson List */}

                      {module.lessons?.length > 0 ? (

                        <ul className="list-group mb-3">

                          {module.lessons.map((lesson) => (

                            <li
                              key={lesson.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >

                              <span>
                                {lesson.title?.[i18n.language] ||
                                  lesson.title?.en}
                              </span>

                              <span className="badge bg-secondary">
                                {lesson.status}
                              </span>

                            </li>

                          ))}

                        </ul>

                      ) : (

                        <div className="alert alert-light mb-3">
                          No lessons assigned
                        </div>

                      )}



                      {/* Assign model code */}
                      {
                        showAssignModal && (
                          <div
                            className="modal d-block"
                            style={{ background: "rgba(0,0,0,.5)" }}
                          >
                            <div className="modal-dialog">
                              <div className="modal-content">

                                <div className="modal-header">
                                  <h5 className="modal-title">
                                    Assign Lessons
                                  </h5>

                                  <button
                                    className="btn-close"
                                    onClick={() =>
                                      setShowAssignModal(false)
                                    }
                                  />
                                </div>

                                <div className="modal-body">

                                  {course?.lessons?.map((lesson) => (

                                    <div
                                      key={lesson.id}
                                      className="form-check mb-2"
                                    >
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedLessons.includes(
                                          lesson.id
                                        )}
                                        onChange={() =>
                                          toggleLesson(lesson.id)
                                        }
                                      />

                                      <label className="form-check-label">
                                        {lesson.title?.[i18n.language] ||
                                          lesson.title?.en}
                                      </label>

                                    </div>

                                  ))}

                                </div>

                                <div className="modal-footer">

                                  <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                      setShowAssignModal(false)
                                    }
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    className="btn btn-success"
                                    onClick={assignLessons}
                                  >
                                    Assign
                                  </button>

                                </div>

                              </div>
                            </div>
                          </div>
                        )
                      }

                      {/* Edit model code */}

                      {showEditModal && (

                      <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,0.5)" }}
                      >

                        <div className="modal-dialog">

                          <div className="modal-content">

                            <div className="modal-header">

                              <h5>Edit Module</h5>

                              <button
                                className="btn-close"
                                onClick={() => setShowEditModal(false)}
                              />

                            </div>

                            <div className="modal-body">

                              <div className="mb-3">

                                <label>English Title</label>

                                <input
                                  type="text"
                                  className="form-control"
                                  value={editTitleEn}
                                  onChange={(e) =>
                                    setEditTitleEn(e.target.value)
                                  }
                                />

                              </div>

                              <div className="mb-3">

                                <label>Hindi Title</label>

                                <input
                                  type="text"
                                  className="form-control"
                                  value={editTitleHi}
                                  onChange={(e) =>
                                    setEditTitleHi(e.target.value)
                                  }
                                />

                              </div>

                            </div>

                            <div className="modal-footer">

                              <button
                                className="btn btn-secondary"
                                onClick={() => setShowEditModal(false)}
                              >
                                Cancel
                              </button>

                              <button
                                className="btn btn-primary"
                                onClick={updateModule}
                              >
                                Save Changes
                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                      )}

                      {/* Remove Lesson Model */}

                      {
                        showRemoveModal && (
                          <div
                            className="modal d-block"
                            style={{ background: "rgba(0,0,0,.5)" }}
                          >
                            <div className="modal-dialog">
                              <div className="modal-content">

                                <div className="modal-header">
                                  <h5 className="modal-title">
                                    Remove Lessons
                                  </h5>

                                  <button
                                    className="btn-close"
                                    onClick={() =>
                                      setShowRemoveModal(false)
                                    }
                                  />
                                </div>

                                <div className="modal-body">

                                  {removeLessons.length > 0 ? (

                                    removeLessons.map((lesson) => (

                                      <div
                                        key={lesson.id}
                                        className="form-check mb-2"
                                      >
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={selectedRemoveLessons.includes(
                                            lesson.id
                                          )}
                                          onChange={() =>
                                            toggleRemoveLesson(lesson.id)
                                          }
                                        />

                                        <label className="form-check-label">
                                          {lesson.title?.[i18n.language] ||
                                            lesson.title?.en}
                                        </label>

                                      </div>

                                    ))

                                  ) : (

                                    <p className="text-muted">
                                      No lessons assigned to this module
                                    </p>

                                  )}

                                </div>

                                <div className="modal-footer">

                                  <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                      setShowRemoveModal(false)
                                    }
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    className="btn btn-danger"
                                    disabled={
                                      selectedRemoveLessons.length === 0
                                    }
                                    onClick={removeLessonsFromModule}
                                  >
                                    Remove Selected
                                  </button>

                                </div>

                              </div>
                            </div>
                          </div>
                        )
                      }




                    </Accordion.Body>

                  </Accordion.Item>

                ))}

                </Accordion>

                
                      {/* Deleted Modules (Trashed)/ restore and Permanently Delete */}

                      {
                        showDeletedModules && (

                          <div
                            className="modal d-block"
                            style={{ background: "rgba(0,0,0,.5)" }}
                          >

                            <div className="modal-dialog modal-lg">

                              <div className="modal-content">

                                <div className="modal-header">

                                  <h5 className="modal-title">
                                    Deleted Modules
                                  </h5>

                                  <button
                                    className="btn-close"
                                    onClick={() =>
                                      setShowDeletedModules(false)
                                    }
                                  />

                                </div>

                                <div className="modal-body">

                                  {deletedModules.length > 0 ? (

                                    <table className="table">

                                      <thead>
    <tr>

        <th>
            <input
                type="checkbox"
                checked={
                    deletedModules.length > 0 &&
                    selectedDeletedModules.length === deletedModules.length
                }
                onChange={(e) => {

                    if (e.target.checked) {

                        setSelectedDeletedModules(
                            deletedModules.map(
                                module => module.id
                            )
                        );

                    } else {

                        setSelectedDeletedModules([]);

                    }

                }}
            />
        </th>

        <th>Module</th>

    </tr>
</thead>


                                      <tbody>

                                        {deletedModules.map((module) => (

                                          <tr key={module.id}>

                                            <td>

                                              <input
                                                type="checkbox"
                                                checked={selectedDeletedModules.includes(module.id)}
                                                onChange={() => {

                                                  setSelectedDeletedModules(prev =>
                                                    prev.includes(module.id)
                                                      ? prev.filter(id => id !== module.id)
                                                      : [...prev, module.id]
                                                  );

                                                }}
                                              />

                                            </td>

                                            <td>
                                              {module.title}
                                            </td>

                                          </tr>

                                        ))}

                                      </tbody>

                                    </table>

                                  ) : (

                                    <p>No deleted modules found.</p>

                                  )}

                                </div>

                                <div className="modal-footer">

                                  <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                      setShowDeletedModules(false)
                                    }
                                  >
                                    Close
                                  </button>

                                  <button
                                    className="btn btn-success"
                                    disabled={!selectedDeletedModules.length}
                                    onClick={bulkRestoreModules}
                                  >
                                    Restore
                                  </button>

                                  <button
                                    className="btn btn-danger"
                                    disabled={!selectedDeletedModules.length}
                                    onClick={bulkForceDeleteModules}
                                  >
                                    Delete Permanently
                                  </button>

                                </div>

                              </div>

                            </div>

                          </div>

                        )
                      }
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CourseModule