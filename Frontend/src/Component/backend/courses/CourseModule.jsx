import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Accordion from "react-bootstrap/Accordion";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { COURSE_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faArrowDownShortWide, faArrowLeft, faBook, faCheck, faCircleMinus, faCirclePlay, faCircleXmark, faPen, faPlus, faTractor, faTrash } from "@fortawesome/free-solid-svg-icons";
import PageNotFound from '../../../assets/images/not-found.jpeg';
import ConfirmationDialogBoxUi from '../../Common/CommonUI/ConfirmationDialogBoxUi';
import { faFile, faFileAlt } from "@fortawesome/free-regular-svg-icons";


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

  const [confirmation, setConfirmation] = useState({
    open: false,
    type: null,
    module: null,
    count: 0,
  });
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  // Accordon Lessoon pagination
  const LESSONS_PER_PAGE = 2;
  const [lessonPages, setLessonPages] = useState({});

  const getLessonPage = (moduleId) => {
    return lessonPages[moduleId] || 1;
  };

  const changeLessonPage = (moduleId, page) => {
    setLessonPages((prev) => ({
      ...prev,
      [moduleId]: page,
    }));
  };

  // Module pagination Home Screen
  const MODULES_PER_PAGE = 15;
  const [modulePage, setModulePage] = useState(1);
  const modules = course?.modules || [];
  const totalModules = modules.length;

  const totalModulePages = Math.ceil(
    totalModules / MODULES_PER_PAGE
  );

  const moduleStartIndex =
    (modulePage - 1) * MODULES_PER_PAGE;

  const paginatedModules = modules.slice(
    moduleStartIndex,
    moduleStartIndex + MODULES_PER_PAGE
  );

  const moduleFrom =
    totalModules === 0 ? 0 : moduleStartIndex + 1;

  const moduleTo = Math.min(
    moduleStartIndex + MODULES_PER_PAGE,
    totalModules
  );

// Assign Lesson Pagination

const [assignLessonPage, setAssignLessonPage] = useState(1);
const assignLessonsList = course?.lessons || [];

const assignTotalPages = Math.ceil(
  assignLessonsList.length / LESSONS_PER_PAGE
);

const assignStartIndex =
  (assignLessonPage - 1) * LESSONS_PER_PAGE;

const paginatedAssignLessons = assignLessonsList.slice(
  assignStartIndex,
  assignStartIndex + LESSONS_PER_PAGE
);

const assignFrom =
  assignLessonsList.length === 0
    ? 0
    : assignStartIndex + 1;

const assignTo = Math.min(
  assignStartIndex + LESSONS_PER_PAGE,
  assignLessonsList.length
);

const currentAssignPageIds =
  paginatedAssignLessons.map(lesson => lesson.id);


// Remove  Lessons Pagination

const [removeLessonPage, setRemoveLessonPage] = useState(1);

const removeTotalPages = Math.ceil(
  removeLessons.length / LESSONS_PER_PAGE
);

const removeStartIndex =
  (removeLessonPage - 1) * LESSONS_PER_PAGE;

const paginatedRemoveLessons = removeLessons.slice(
  removeStartIndex,
  removeStartIndex + LESSONS_PER_PAGE
);

const removeFrom =
  removeLessons.length === 0
    ? 0
    : removeStartIndex + 1;

const removeTo = Math.min(
  removeStartIndex + LESSONS_PER_PAGE,
  removeLessons.length
);

const currentRemovePageIds =
  paginatedRemoveLessons.map(lesson => lesson.id);

// Trashed Module Pagination 

const [deletedModulePage, setDeletedModulePage] = useState(1);

const deletedModulesPerPage = 5;

const deletedModuleTotalPages = Math.ceil(
  deletedModules.length / deletedModulesPerPage
);

const deletedModuleStartIndex =
  (deletedModulePage - 1) * deletedModulesPerPage;

const paginatedDeletedModules =
  deletedModules.slice(
    deletedModuleStartIndex,
    deletedModuleStartIndex + deletedModulesPerPage
  );

const deletedModuleFrom =
  deletedModules.length === 0
    ? 0
    : deletedModuleStartIndex + 1;

const deletedModuleTo = Math.min(
  deletedModuleStartIndex + deletedModulesPerPage,
  deletedModules.length
);

const currentDeletedModuleIds =
  paginatedDeletedModules.map(module => module.id);


// Fetch Modules 

  const fetchCourse = async () => {
    try {
      setLoading(true);
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

    setAssignLessonPage(1);

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

  if (!editTitleEn.trim()) {
    toast.error("Module title is required");
    return;
  }

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

  const deleteModule = (module) => {
    setConfirmation({
      open: true,
      type: "delete-module",
      module: module,
      count: 1,
    });
  };

  const handleDeleteModule = async () => {
    const module = confirmation.module;

    if (!module) return;

    try {
      setConfirmationLoading(true);

      const res = await fetch(
        apiUrl + `modules/${module.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const result = await res.json();

      if (result.status) {
        toast.success(result.message);

        setConfirmation({
          open: false,
          type: null,
          module: null,
          count: 0,
        });

        await fetchCourse();
      } else {
        toast.error(result.message);
      }

    } catch (error) {

      console.error(error);

      toast.error("Failed to delete module");

    } finally {

      setConfirmationLoading(false);

    }
  };


// remove lessons from module

  // 1. Open Model 
  const openRemoveModal = (module) => {

    setSelectedRemoveModule(module);

    setRemoveLessons(module.lessons || []);

    setSelectedRemoveLessons([]);

    setRemoveLessonPage(1);

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

  const bulkDeleteModules = () => {

    if (selectedModules.length === 0) {
      toast.error("Select modules first");
      return;
    }

    setConfirmation({
      open: true,
      type: "bulk-delete",
      module: null,
      count: selectedModules.length,
    });
  };

  // BuldDeleteHandler

  const handleBulkDeleteModules = async () => {

    try {

      setConfirmationLoading(true);

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
        setModulePage(1);

        setConfirmation({
          open: false,
          type: null,
          module: null,
          count: 0,
        });

        await fetchCourse();

      } else {

        toast.error(result.message);

      }

    } catch (error) {

      console.error(error);

      toast.error("Failed to delete modules");

    } finally {

      setConfirmationLoading(false);

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

  const bulkForceDeleteModules = () => {

    if (selectedDeletedModules.length === 0) {
      toast.error("Select modules first");
      return;
    }

    setConfirmation({
      open: true,
      type: "force-delete",
      module: null,
      count: selectedDeletedModules.length,
    });
  };

  // Permanent Delete  Module Handler
  const handleBulkForceDeleteModules = async () => {

    try {

      setConfirmationLoading(true);

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

        setConfirmation({
          open: false,
          type: null,
          module: null,
          count: 0,
        });

      } else {

        toast.error(result.message);

      }

    } catch (error) {

      console.error(error);

      toast.error("Permanent delete failed");

    } finally {

      setConfirmationLoading(false);

    }
  };

    // open model 
    const openDeletedModules = async () => {

      setDeletedModulePage(1);

      setSelectedDeletedModules([]);

      await fetchDeletedModules();

      setShowDeletedModules(true);
    };



useEffect(() => {
  if (totalModulePages > 0 && modulePage > totalModulePages) {
    setModulePage(totalModulePages);
  }
}, [totalModulePages, modulePage]);

useEffect(() => {
  setLessonPages((prev) => {
    const updated = { ...prev };

    Object.keys(updated).forEach((moduleId) => {
      const module = modules.find(
        (m) => m.id.toString() === moduleId.toString()
      );

      if (!module) {
        delete updated[moduleId];
        return;
      }

      const totalPages = Math.ceil(
        (module.lessons?.length || 0) / LESSONS_PER_PAGE
      );

      if (totalPages > 0 && updated[moduleId] > totalPages) {
        updated[moduleId] = totalPages;
      }
    });

    return updated;
  });
}, [modules]);

// Lodaing 
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

        <h5 className="mt-3 mb-1">Please wait...</h5>

        <small className="text-muted">
          Please wait while we fetch course module information.
        </small>
      </div>
    </div>
  );
}

  return (
    <>

      {/* Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center">
          <section className="breadcrumb-section">
              <h3>Course <span>Structure</span></h3>

              <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to=""><span>Modules</span></Link>

          </section>

          <Link to={`/admin/course/view-course/${course.id}`} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
          </Link>
      </div>

      <div className="dashboard-card my-4">  

        {/* Course Title */}
        <div className="course-module-title">
          <FontAwesomeIcon icon={faBook}  className="icon"/>
          <div className="body">
            <span>Course Name</span>
            <p>{course?.title?.[i18n.language] || course?.title?.en}</p>
          </div>


        </div>

        <hr className="mt-4"/>

        {/* Create Module Card */}
        <div className="my-4">

            <form onSubmit={createModule}>

              <label className="form-label my-3"> 
                <FontAwesomeIcon icon={faPen} className="icon" />
                Create Module
              </label>

              <div className="row">

                {/* Eng Title For Module */}
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

                {/* Hi Title For Module */}
                <div className="col-md-5 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="मॉड्यूल शीर्षक (हिन्दी)"
                    value={titleHi}
                    onChange={(e) =>
                      setTitleHi(e.target.value)
                    }
                  />
                </div>

                {/* Create Button */}
                <div className="col-md-2 mb-3">
                  <button
                    type="submit"
                    className="btn green-btn w-100"
                    disabled={creating}
                  >
                    {creating ?  (
                    
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2 text-light"
                            role="status"
                          />
          
                            <span className='text-light'>Adding... </span>
          
                          </>
          
                          ) : (
          
                            <> 

                            <FontAwesomeIcon icon={faPlus}/> Add
                            </>
          
                        )}
                  </button>
                </div>

              </div>

            </form>              
        </div>

        <hr className="my-4"/>

        {/* Bulk Module Action Buttons */}
        <div className="module-bulk-actions my-3">

          {/* Select All Checkbox */}
          <div className="select-all">
            
            <input
              type="checkbox"
              className="form-check-input"
              checked={
                course?.modules?.some(
                  module => module.title?.en !== "General"
                ) &&
                selectedModules.length ===
                  course.modules.filter(
                    module => module.title?.en !== "General"
                  ).length
              }
              onChange={(e) => {

                const deletableModules =
                  course?.modules?.filter(
                    module => module.title?.en !== "General"
                  ) || [];

                if (e.target.checked) {

                  setSelectedModules(
                    deletableModules.map(module => module.id)
                  );

                } else {

                  setSelectedModules([]);

                }
              }}
            />

            <label> Select All </label>
          </div>

          {/* Bulk Delete button */}
          <button
            className="btn red-btn"
            disabled={selectedModules.length === 0}
            onClick={bulkDeleteModules}
          >
            <FontAwesomeIcon icon={faCheck}/> Delete Selected
          </button>

          {/* Trashed Module Button */}
          <button
            className="btn green-btn"
            onClick={openDeletedModules}
          >
            <FontAwesomeIcon icon={faTrash} /> Deleted Modules
          </button>

          {/* Module Reorder Button */}
          <Link
            to={`/admin/course/${id}/module-order`}
            className="btn yellow-btn"
          >
            <FontAwesomeIcon icon={faArrowDownShortWide} /> Module Reorder
          </Link>

        </div>

        {/* Accordion  */}

        <Accordion defaultActiveKey="0">

        {paginatedModules.map((module, index) => (

          <Accordion.Item
            eventKey={index.toString()}
            key={module.id}
          >

            <Accordion.Header>
              <input
                type="checkbox"
                className="form-check-input me-2"
                disabled={module.title?.en === "General"}
                checked={
                  module.title?.en !== "General" &&
                  selectedModules.includes(module.id)
                }
                onClick={(e) => e.stopPropagation()}
                onChange={() => {
                  if (module.title?.en === "General") return;

                  setSelectedModules((prev) =>
                    prev.includes(module.id)
                      ? prev.filter((id) => id !== module.id)
                      : [...prev, module.id]
                  );
                }}
              />

              <div className="module-header-content">
                <span className="module-title text-capitalize fw-semibold">
                  {module.title?.[i18n.language] ||
                    module.title?.en}
                </span>

                <span className="badge bg-primary module-lesson-count">
                  {module.lessons_count}{" "}
                  {module.lessons_count === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>


            </Accordion.Header>

            <Accordion.Body>

              {/* Action Buttons */}

              <div className="module-actions">

                {/* Current Feature */}
                <button
                  className="btn btn-sm blue-btn-opp"
                  onClick={() => openAssignModal(module)}
                >
                  <FontAwesomeIcon icon={faPlus} /> Assign Lessons
                </button>


                <button
                  className="btn gray-btn-opp btn-sm"
                  onClick={() => openRemoveModal(module)}
                  disabled={module.lessons_count === 0}
                >
                  <FontAwesomeIcon icon={faCircleMinus} /> Remove Lessons
                </button>

                {module.title?.en !== "General" && (
                  <>
                  <button
                    className="btn yellow-btn-opp btn-sm"
                    onClick={() => openEditModal(module)}
                  >
                    <FontAwesomeIcon icon={faPen} /> Edit Module
                  </button>

                  <button
                    className="btn red-btn-opp btn-sm"
                    onClick={() => deleteModule(module)}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} /> Delete Module
                  </button>
                  </>
                )}


                <button
                  className="btn lightblue-btn-opp btn-sm"
                  onClick={() =>
                    navigate(
                      `/admin/course/${id}/module/${module.id}/reorder-lessons`
                    )}
                  disabled={module.lessons_count === 0}
                >
                  <FontAwesomeIcon icon={faArrowDownShortWide} /> Reorder Lessons
                </button>

              </div>

              <hr />

              {/* Lesson List */}

              {module.lessons?.length > 0 ? (

                <>
                  {(() => {

                    const currentPage = getLessonPage(module.id);

                    const totalLessons = module.lessons.length;

                    const totalPages = Math.ceil(
                      totalLessons / LESSONS_PER_PAGE
                    );

                    const startIndex =
                      (currentPage - 1) * LESSONS_PER_PAGE;

                    const endIndex =
                      startIndex + LESSONS_PER_PAGE;

                    const currentLessons =
                      module.lessons.slice(
                        startIndex,
                        endIndex
                      );

                    return (
                      <>
                        {/* Lessons */}

                        <ul className="list-group mb-2">

                          {currentLessons.map((lesson) => (

                            <li
                              key={lesson.id}
                              className="list-group-item lesson-row"
                            >

                              <span className="lesson-title">

                                <FontAwesomeIcon
                                  icon={faCirclePlay}
                                  className="mx-2"
                                />

                                {lesson.title?.[i18n.language] ||
                                  lesson.title?.en}

                              </span>

                              <span
                                className={`badge course-status mb-2 ${
                                  lesson.status === "published"
                                    ? "badge-published text-success"
                                    : "badge-draft"
                                }`}
                              >
                                {lesson.status}
                              </span>

                            </li>

                          ))}

                        </ul>


                        {/* Lesson Pagination */}

                        {totalPages > 1 && (

                        <div className="modal-pagination">

                          <span>
                            Showing <strong>{startIndex + 1} - {Math.min(endIndex, totalLessons)}</strong>{" "}
                            of <strong>{totalLessons}</strong> Lessons
                          </span>

                            <div className="pagination-buttons">

                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                changeLessonPage(
                                  module.id,
                                  currentPage - 1
                                )}
                              >
                                <FontAwesomeIcon icon={faAngleLeft} />
                              </button>

                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                  changeLessonPage(
                                    module.id,
                                    currentPage + 1
                                  )
                                }
                              >
                                <FontAwesomeIcon icon={faAngleRight} />
                              </button>

                            </div>

                        </div>
                        )}

                      </>
                    );

                  })()}

                </>

              ) : (
                <>
                  <div className="d-flex justify-content-center py-2">
                    <div className="d-flex align-items-center">

                        <img
                            src={PageNotFound}
                            alt="No courses found"
                            height="100px"
                            width="140px"
                        />

                        <div className="text-body mx-4">
                          <h6 className="text">No Lesson Assigned</h6>

                          <small className="text-muted ">Start by assigning lessons to this module.</small>
          
                        </div>

                    
                    </div>
                  </div>
                </>

              )}



              {/* Assign model code */}
              {
                showAssignModal && (
                  <div
                    className="modal d-block custom-module-modal"
                    style={{ background: "rgba(5, 15, 45, .55)" }}
                  > 
                  <div className="modal-dialog">
                      <div className="modal-content">

                        <div className="modal-header module-modal-header">

                          <div className="module-modal-heading">

                            <div className="form-check">

                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={
                                  currentAssignPageIds.length > 0 &&
                                  currentAssignPageIds.every(id =>
                                    selectedLessons.includes(id)
                                  )
                                }
                                onChange={(e) => {

                                  if (e.target.checked) {

                                    setSelectedLessons(prev => [
                                      ...new Set([
                                        ...prev,
                                        ...currentAssignPageIds
                                      ])
                                    ]);

                                  } else {

                                    setSelectedLessons(prev =>
                                      prev.filter(
                                        id => !currentAssignPageIds.includes(id)
                                      )
                                    );

                                  }

                                }}
                              />

                              <label className="form-check-label">
                                Select All
                              </label>
                            </div>

                            <h5 className="modal-title text-capitalize">
                              Assign Lessons to{" "}
                              {module.title?.[i18n.language] || module.title?.en}
                            </h5>

                            {selectedLessons.length > 0 && (
                              <span className="selection-count">
                                {/* Only Count */}
                                {selectedLessons.length} selected

                                {/* Count from Out of total no.*/}
                                {/* {selectedLessons.length} selected of {assignLessonsList.length} */}
                              </span>
                            )}

                          </div>

                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowAssignModal(false)}
                          />

                        </div>

                        <div className="modal-body">

                          {paginatedAssignLessons.map((lesson) => (
                            
                            <div
                              key={lesson.id}
                              className="lesson-select-row"
                              onClick={() =>
                                toggleLesson(lesson.id)
                              } >

                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedLessons.includes(lesson.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() =>
                                    toggleLesson(lesson.id)
                                  }
                                />

                                <label className="form-check-label text-capitalize">
                                  {lesson.title?.[i18n.language] ||
                                    lesson.title?.en}
                                </label>
                              </div>
                            
                          ))}

                          {/* Pagination  */}

                          {assignLessonsList.length > LESSONS_PER_PAGE && (
                            <div className="modal-pagination">

                              <span>
                                Showing <strong>{assignFrom} - {assignTo}</strong>{" "}
                                of <strong>{assignLessonsList.length}</strong> Lessons
                              </span>

                              <div className="pagination-buttons">

                                <button
                                  type="button"
                                  disabled={assignLessonPage === 1}
                                  onClick={() =>
                                    setAssignLessonPage(page => page - 1)
                                  }
                                >
                                  <FontAwesomeIcon icon={faAngleLeft} />
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    assignLessonPage === assignTotalPages
                                  }
                                  onClick={() =>
                                    setAssignLessonPage(page => page + 1)
                                  }
                                >
                                  <FontAwesomeIcon icon={faAngleRight} />
                                </button>

                              </div>

                            </div>
                          )}
                        </div>

                        <div className="modal-footer">

                          <button
                            className="btn gray-btn"
                            onClick={() =>
                              setShowAssignModal(false)
                            }
                          >
                            Cancel
                          </button>

                          <button
                            className="btn green-btn"
                            onClick={assignLessons}
                            disabled={selectedLessons.length === 0}
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
                className="modal d-block custom-module-modal"
                style={{ background: "rgba(5, 15, 45, .55)" }}
              > 

                <div className="modal-dialog">

                  <div className="modal-content">

                        <div className="modal-header module-modal-header">

                          <div className="module-modal-heading ">

                            <h5 className="modal-title">
                              Edit Module
                            </h5>

                          </div>

                          <button
                            type="button"
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
                        className="btn gray-btn"
                        onClick={() => setShowEditModal(false)}
                      >
                        Cancel
                      </button>

                      <button
                        className="btn blue-btn"
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
                    className="modal d-block custom-module-modal"
                    style={{ background: "rgba(5, 15, 45, .55)" }}
                  > 
                    <div className="modal-dialog">
                      <div className="modal-content">


                        <div className="modal-header module-modal-header">

                          <div className="module-modal-heading">

                            <div className="form-check">

                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={
                                  currentRemovePageIds.length > 0 &&
                                  currentRemovePageIds.every(id =>
                                    selectedRemoveLessons.includes(id)
                                  )
                                }
                                onChange={(e) => {

                                  if (e.target.checked) {

                                    setSelectedRemoveLessons(prev => [
                                      ...new Set([
                                        ...prev,
                                        ...currentRemovePageIds
                                      ])
                                    ]);

                                  } else {

                                    setSelectedRemoveLessons(prev =>
                                      prev.filter(
                                        id => !currentRemovePageIds.includes(id)
                                      )
                                    );

                                  }

                                }}
                              />


                              <label className="form-check-label">
                                Select All
                              </label>
                            </div>

                            <h5 className="modal-title text-capitalize">
                              Remove Lessons From {" "}
                              {module.title?.[i18n.language] || module.title?.en}
                            </h5>

                          </div>

                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowRemoveModal(false)}
                          />

                        </div>


                        <div className="modal-body">

                          {removeLessons.length > 0 ? (

                            paginatedRemoveLessons.map((lesson) => (

                            <div
                              key={lesson.id}
                              className="lesson-select-row"
                              onClick={() =>
                                toggleRemoveLesson(lesson.id)
                              }
                            >


                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedRemoveLessons.includes(
                                  lesson.id
                                )}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() =>
                                  toggleRemoveLesson(lesson.id)
                                }
                              />

                              <label className="form-check-label text-capitalize">
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

                        {/* Pagination */}
                        {removeLessons.length > LESSONS_PER_PAGE && (
                          <div className="modal-pagination">

                            <span>
                              Showing <strong>{removeFrom} - {removeTo}</strong>{" "}
                              of <strong>{removeLessons.length}</strong> Lessons
                            </span>

                            <div className="pagination-buttons">

                              <button
                                type="button"
                                disabled={removeLessonPage === 1}
                                onClick={() =>
                                  setRemoveLessonPage(page => page - 1)
                                }
                              >
                                <FontAwesomeIcon icon={faAngleLeft} />
                              </button>

                              <button
                                type="button"
                                disabled={
                                  removeLessonPage === removeTotalPages
                                }
                                onClick={() =>
                                  setRemoveLessonPage(page => page + 1)
                                }
                              >
                                <FontAwesomeIcon icon={faAngleRight} />
                              </button>

                            </div>

                          </div>
                        )}

                        <div className="modal-footer">

                          <button
                            className="btn gray-btn"
                            onClick={() =>
                              setShowRemoveModal(false)
                            }
                          >
                            Cancel
                          </button>

                          <button
                            className="btn red-btn"
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

        <div className="module-pagination">

          <span className="module-pagination-info">
            Showing <strong>{moduleFrom} - {moduleTo}</strong> of{" "}
            <strong>{totalModules}</strong> modules
          </span>

          <div className="module-pagination-buttons">

            <button
              type="button"
              className="pagination-arrow"
              disabled={modulePage === 1}
              onClick={() =>
                setModulePage((page) => page - 1)
              }
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            <button
              type="button"
              className="pagination-arrow"
              disabled={modulePage === totalModulePages}
              onClick={() =>
                setModulePage((page) => page + 1)
              }
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>

          </div>

        </div>


                
                  {/* Deleted Modules (Trashed)/ restore and Permanently Delete */}

                  {
                    showDeletedModules && (
                      
                      <div
                        className="modal d-block custom-module-modal"
                        style={{ background: "rgba(5, 15, 45, .55)" }}
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

                                <table className="table deleted-module-table mb-0">
                                  <thead>
                                    <tr>
                                        <th>
                                          <input
                                            type="checkbox"
                                            checked={
                                              currentDeletedModuleIds.length > 0 &&
                                              currentDeletedModuleIds.every(id =>
                                                selectedDeletedModules.includes(id)
                                              )
                                            }
                                            onChange={(e) => {

                                              if (e.target.checked) {

                                                setSelectedDeletedModules(prev => [
                                                  ...new Set([
                                                    ...prev,
                                                    ...currentDeletedModuleIds
                                                  ])
                                                ]);

                                              } else {

                                                setSelectedDeletedModules(prev =>
                                                  prev.filter(
                                                    id => !currentDeletedModuleIds.includes(id)
                                                  )
                                                );

                                              }

                                            }}
                                          />
                                        </th>

                                        <th>Module Name</th>

                                    </tr>
                                </thead>


                                  <tbody>

                                    {paginatedDeletedModules.map((module) => (

                                      <tr
                                        key={module.id}
                                        className="deleted-module-row"
                                        onClick={() => {

                                          setSelectedDeletedModules(prev =>
                                            prev.includes(module.id)
                                              ? prev.filter(id => id !== module.id)
                                              : [...prev, module.id]
                                          );

                                        }}
                                      >
                                        <td>
                                          <input
                                            type="checkbox"
                                            checked={selectedDeletedModules.includes(
                                              module.id
                                            )}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => {}}
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

                                <div className="empty-module-state">
                                
                                  <div className="empty-icon">
                                    <FontAwesomeIcon icon={faTrash} />
                                  </div>

                                  <h6>No Deleted Modules</h6>

                                  <p>
                                    Deleted modules will appear here.
                                  </p>

                                </div>

                              )}

                            {/* Pagination */}

                            {deletedModules.length > deletedModulesPerPage && (
                              <div className="modal-pagination">

                                <span>
                                  Showing{" "}
                                  <strong>
                                    {deletedModuleFrom} - {deletedModuleTo}
                                  </strong>{" "}
                                  of{" "}
                                  <strong>{deletedModules.length}</strong>{" "}
                                  Modules
                                </span>

                                <div className="pagination-buttons">

                                  <button
                                    type="button"
                                    disabled={deletedModulePage === 1}
                                    onClick={() =>
                                      setDeletedModulePage(page => page - 1)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faAngleLeft} />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      deletedModulePage === deletedModuleTotalPages
                                    }
                                    onClick={() =>
                                      setDeletedModulePage(page => page + 1)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faAngleRight} />
                                  </button>

                                </div>

                              </div>
                            )}
                            </div>


                            <div className="modal-footer">

                              <button
                                className="btn gray-btn"
                                onClick={() =>
                                  setShowDeletedModules(false)
                                }
                              >
                                Close
                              </button>

                              <button
                                className="btn green-btn"
                                disabled={!selectedDeletedModules.length}
                                onClick={bulkRestoreModules}
                              >
                                Restore
                              </button>

                              <button
                                className="btn red-btn"
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

        {/* Confirm Dialog Box */}
        <ConfirmationDialogBoxUi

          open={confirmation.open}

          title={
            confirmation.type === "delete-module"
              ? "Delete Module"
              : confirmation.type === "bulk-delete"
              ? "Delete Modules"
              : "Permanently Delete Modules"
          }

          confirmText={
            confirmation.type === "force-delete"
              ? "Delete Permanently"
              : "Delete"
          }

          confirmVariant="danger"

          loading={confirmationLoading}

          onCancel={() => {

            if (confirmationLoading) return;

            setConfirmation({
              open: false,
              type: null,
              module: null,
              count: 0,
            });

          }}

          onConfirm={() => {

            if (confirmation.type === "delete-module") {

              handleDeleteModule();

            } else if (confirmation.type === "bulk-delete") {

              handleBulkDeleteModules();

            } else if (confirmation.type === "force-delete") {

              handleBulkForceDeleteModules();

            }

          }}

        >

          {confirmation.type === "delete-module" && (
            <>
              Are you sure you want to delete <br />

              <strong>
                {confirmation.module?.title?.en}
              </strong>

              ?

              <br />
              <br />

              <p
                className="text-danger"
                style={{ fontSize: "12px" }}
              >
                This module will be moved to Deleted Modules.
              </p>
            </>
          )}

          {confirmation.type === "bulk-delete" && (
            <>
              Are you sure you want to delete{" "}

              <strong>
                {confirmation.count}
              </strong>{" "}

              selected modules?

              <br />
              <br />

              <p
                className="text-danger"
                style={{ fontSize: "12px" }}
              >
                The selected modules will be moved to Deleted Modules.
              </p>
            </>
          )}

          {confirmation.type === "force-delete" && (
            <>
              Are you sure you want to permanently delete{" "}

              <strong>
                {confirmation.count}
              </strong>{" "}

              selected modules?

              <br />
              <br />

              <p
                className="text-danger"
                style={{ fontSize: "12px" }}
              >
                This action cannot be undone. The modules will be permanently
                removed.
              </p>
            </>
          )}

        </ConfirmationDialogBoxUi>
</>
  );
};

export default CourseModule