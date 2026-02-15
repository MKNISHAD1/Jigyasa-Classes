import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";

const ChangeLessonOrder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch(`${apiUrl}courses/${courseId}/lessons`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        if (data.status) {
          // Sort lessons by current order
          const sorted = data.lessons.sort((a, b) => a.order - b.order);
          setLessons(sorted);
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
    fetchLessons();
  }, [courseId]);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedLessons = Array.from(lessons);
    const [removed] = updatedLessons.splice(result.source.index, 1);
    updatedLessons.splice(result.destination.index, 0, removed);

    // Update order property for display
    const reordered = updatedLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1,
    }));

    setLessons(reordered);
  };

  // Save new order to backend
  const saveOrder = async () => {
    try {
      setSaving(true);
      const payload = {
        orders: lessons.map((lesson) => ({ id: lesson.id, order: lesson.order })),
      };
      const res = await fetch(`${apiUrl}courses/${courseId}/lesson/Reorder-Lessons`, {
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
        navigate(`/admin/course/view-course/${courseId}`);
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
      <h4 className="mb-3">Reorder Lessons</h4>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lessons-droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="list-group"
            >
              {lessons.map((lesson, index) => (
                <Draggable
                  key={lesson.id}
                  draggableId={lesson.id.toString()}
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
                        {lesson.order}. {lesson.title?.en || lesson.title?.[0] || "Untitled"}
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

export default ChangeLessonOrder;