import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from 'react-toastify';
import { apiUrl, token } from '../../Common/http';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../../../i18n/i18n';

const CourseModuleReorder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch lessons
  useEffect(() => {
    const fetchModule = async () => {
      try {
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
          toast.error(data.message || "Failed to fetch lessons");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching lessons");
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

  if (loading) return <p>Loading lessons...</p>;

  return (
    <div className="container my-5">
      <h4 className="mb-3">Reorder Modules </h4>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lessons-droppable">
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
                      <span>
                        {module.order}. {module.title?.[i18n.language] || module.title?.en}
                      </span>

                      <span className="badge bg-primary ">
                        {module.lessons_count} Lessons
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
        className="btn btn-success mt-3"
        onClick={saveOrder}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Order"}
      </button>
    </div>
  );
};


export default CourseModuleReorder