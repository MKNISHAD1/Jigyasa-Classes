import React, { useEffect, useState } from "react";
import {DragDropContext,Droppable,Draggable} from "@hello-pangea/dnd";
import {useParams,useNavigate} from "react-router-dom";
import {apiUrl,token} from "../../Common/http";
import { toast } from "react-toastify";
import i18n from "../../../i18n/i18n";

const ModuleLessonReorder = () => {

  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {

    const fetchLessons = async () => {

      try {

        const res = await fetch(
          `${apiUrl}course/${id}/module/${moduleId}/lessons`,
          {
            headers: {
              Authorization: `Bearer ${token()}`
            }
          }
        );

        const data = await res.json();

        if (data.status) {

          const sorted =
            data.lessons.sort(
              (a, b) => a.order - b.order
            );

          setLessons(sorted);

        }

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load lessons"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchLessons();

  }, [id, moduleId]);

  const handleDragEnd = (result) => {

  if (!result.destination) return;

  const updated = Array.from(lessons);

  const [removed] =
    updated.splice(
      result.source.index,
      1
    );

  updated.splice(
    result.destination.index,
    0,
    removed
  );

  const reordered =
    updated.map(
      (lesson, idx) => ({
        ...lesson,
        order: idx + 1
      })
    );

  setLessons(reordered);

};

const saveOrder = async () => {

  try {

    setSaving(true);

    const payload = {
      orders: lessons.map(
        lesson => ({
          id: lesson.id,
          order: lesson.order
        })
      )
    };

    const res = await fetch(
      `${apiUrl}course/${id}/module/${moduleId}/reorder-lessons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (data.status) {

      toast.success(data.message);

      navigate(
        `/admin/course/${id}/course-modules`
      );

    }

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to save order"
    );

  } finally {

    setSaving(false);

  }

};

if (loading)
  return <p>Loading lessons...</p>;

return (
  <div className="container my-5">

    <h4 className="mb-3">
      Reorder Lessons
    </h4>

    <DragDropContext
      onDragEnd={handleDragEnd}
    >

      <Droppable
        droppableId="lesson-order"
      >

        {(provided) => (

          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="list-group"
          >

            {lessons.map(
              (lesson, index) => (

              <Draggable
                key={lesson.id}
                draggableId={lesson.id.toString()}
                index={index}
              >

                {(provided) => (

                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="list-group-item"
                  >

                    {lesson.order}.
                    {" "}
                    {lesson.title?.[i18n.language] || lesson.title?.en}

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
      {saving
        ? "Saving..."
        : "Save Order"}
    </button>

  </div>
);
};
export default ModuleLessonReorder;