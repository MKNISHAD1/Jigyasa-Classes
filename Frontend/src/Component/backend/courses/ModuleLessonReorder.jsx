import React, { useEffect, useState } from "react";
import {DragDropContext,Droppable,Draggable} from "@hello-pangea/dnd";
import {useParams,useNavigate, Link} from "react-router-dom";
import {apiUrl,token} from "../../Common/http";
import { toast } from "react-toastify";
import i18n from "../../../i18n/i18n";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { faAngleRight, faArrowLeft, faGripVertical, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ModuleLessonReorder = () => {

  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  

  useEffect(() => {

    const fetchLessons = async () => {

      try {
        setLoading(true);
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
  setHasChanges(true);

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
      setHasChanges(false);
      
      navigate(`/admin/course/${id}/course-modules`);


    }

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed while saving lesson order"
    );

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

        <h5 className="mt-3 mb-1">Fetching Course Lessons...</h5>

        <small className="text-muted">
          Please wait while we fetch your lessons.
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
              <Link className='bread-link' to="">Lesson Reorder</Link>

          </section>

          <Link to={`/admin/course/${id}/course-modules`} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
          </Link>
      </div>

    <div className="dashboard-card my-4">
      <h4 className="mb-1 text-center"><span>Reorder</span> Lessons </h4>
      <p className='text-muted text-center'>Kindly drag and drop lessons to change their order</p>

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
                    <span className="text-capitalize">
                      <FontAwesomeIcon icon={faGripVertical} className='mx-2'/> 
                      {lesson.order} . 
                      {" "}
                      {lesson.title?.[i18n.language] || lesson.title?.en}
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
export default ModuleLessonReorder;