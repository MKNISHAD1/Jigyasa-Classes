import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from 'react-toastify';
import { apiUrl, token } from '../../Common/http';
import { Link, useNavigate, useParams } from 'react-router-dom';
import i18n from '../../../i18n/i18n';
import HeaderUi from '../../Common/CommonUI/HeaderUi';
import FooterUi from '../../Common/CommonUI/FooterUi';
import { COURSE_ROUTES, DASHBOARD_ROUTES } from '../../../constants/nevigation/routes';
import { faAngleRight, faArrowLeft, faGripVertical, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CourseModuleReorder = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch Module
  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}course/${id}/modules`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        console.log(data);  
        console.log(data.modules);
        if (data.status) {
        console.log(data);

        const modulesData =
            data.modules ||
            data.course?.modules ||
            [];

        console.log(modulesData);

        setModules(modulesData);
        
        } else {
          toast.error(data.message || "Failed to fetch modules");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching modules");
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [id]);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedModules = Array.from(modules);
    const [removed] = updatedModules.splice(result.source.index, 1);
    updatedModules.splice(result.destination.index, 0, removed);

    // Update order property for display
    const reordered = updatedModules.map((module, idx) => ({
      ...module,
      order: idx + 1,
    }));

    setModules(reordered);
    setHasChanges(true);
  };

  // Save new order to backend
  const saveOrder = async () => {
    try {
      setSaving(true);
      const payload = {
        orders: modules.map((module) => ({ id: module.id, order: module.order })),
      };
      const res = await fetch(`${apiUrl}course/${id}/modules/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.message) {
        toast.success(data.message);
        setHasChanges(false);
        navigate(`/admin/course/${id}/course-modules`);
      } else {
        toast.error("Failed to save lesson order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while saving order");
    } finally {
      setSaving(false);
    }
  };

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

        <h5 className="mt-3 mb-1">Fetching Course Module...</h5>

        <small className="text-muted">
          Please wait while we fetch your course module.
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

              <Link className='bread-link' to=""><span>My Course</span></Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to={`/admin/course/${id}/course-modules`}><span>Module</span></Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to="">Module Reorder</Link>

          </section>

          <Link to={`/admin/course/${id}/course-modules`} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
          </Link>
      </div>

      <div className="dashboard-card my-4">
        <h4 className="mb-1 text-center"><span>Reorder</span> Modules </h4>
        <p className='text-muted text-center'>Kindly drag and drop modules to change their order</p>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules-droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="list-group"
              >
                {modules.map((module, index) => (
                  <Draggable
                    key={module.id}
                    draggableId={module.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className={`list-group-item d-flex justify-content-between align-items-center ${
                          snapshot.isDragging ? "bg-light border-primary" : ""
                        }`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <span className="text-capitalize">
                        <FontAwesomeIcon icon={faGripVertical} className='mx-2'/>  {module.order} . {module.title?.[i18n.language] || module.title?.en}
                        </span>

                        <span className="badge bg-primary module-lesson-count">
                          {module.lessons_count}{" "}
                          {module.lessons_count === 1 ? "Lesson" : "Lessons"}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          className="btn green-btn mt-3"
          onClick={saveOrder}
          disabled={saving || !hasChanges}
        >
          {saving ?  (
          
              <>
                <span
                  className="spinner-border spinner-border-sm me-2 text-light"
                  role="status"
                />

                  <span className='text-light'>Saving Order... </span>

                </>

                ) : (

                  <> 

                  <FontAwesomeIcon icon={faSave}/> Save Order
                  </>

              )}
        </button>
      </div>

    </>



  );
};


export default CourseModuleReorder