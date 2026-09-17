import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import ClipLoader from "react-spinners/ClipLoader";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { COURSE_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faAngleRight, faArrowLeft, faCalendarDay, faCalendarTimes, faCalendarWeek, faCheck, faCirclePause, faCirclePlus, faClose, faEdit, faFileCirclePlus, faFlag, faPen, faPlugCirclePlus, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { faCalendarDays, faFileAlt } from "@fortawesome/free-regular-svg-icons";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";
import { FaCalendarDay } from "react-icons/fa";

const UpdateLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removedMaterials, setRemovedMaterials] = useState([]);

  const [removeMaterialOpen, setRemoveMaterialOpen] = useState(false);
  const [materialToRemove, setMaterialToRemove] = useState(null);  

  const [isDirty, setIsDirty] = useState(false);
  const [newMaterials, setNewMaterials] = useState([]);

  const [downloadingMaterialId, setDownloadingMaterialId] = useState(null);


  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const watchedFields = watch();

  // ✅ Detect form changes
useEffect(() => {
  if (lesson) {
    const normalize = (val) => (val === true || val === "true" ? true : val === false || val === "false" ? false : val ?? "");

    const isFormChanged =
      (watchedFields.title_en ?? "") !== (lesson.title?.en ?? "") ||
      (watchedFields.title_hi ?? "") !== (lesson.title?.hi ?? "") ||
      (watchedFields.description_en ?? "") !== (lesson.description?.en ?? "") ||
      (watchedFields.description_hi ?? "") !== (lesson.description?.hi ?? "") ||
      normalize(watchedFields.is_free_preview) !== normalize(lesson.is_free_preview) ||
      (watchedFields.status ?? "") !== (lesson.status ?? "") ||
      (watchedFields.published_at ?? "") !==
        (lesson.published_at
          ? new Date(lesson.published_at).toISOString().slice(0, 10)
          : "");

    setIsDirty(isFormChanged || removedMaterials.length > 0 || newMaterials.length > 0);
  }
}, [watchedFields, lesson, removedMaterials, newMaterials]);

  // ✅ Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(
          `${apiUrl}courses/${courseId}/view-lesson/${lessonId}`,
          {
            headers: { Authorization: `Bearer ${token()}`,
                        Accept : "application/json",
                      },
          }
        );
        const data = await res.json();

        if (data.status) {
          setLesson(data.lesson);
          reset({
            title_en: data.lesson.title?.en || "",
            description_en: data.lesson.description?.en || "",
            title_hi: data.lesson.title?.hi || "",
            description_hi: data.lesson.description?.hi || "",
            is_free_preview: data.lesson.is_free_preview || false,
            status: data.lesson.status || "draft",
            published_at: data.lesson.published_at
              ? new Date(data.lesson.published_at).toISOString().slice(0, 10)
              : "",
          });
        } else toast.error(data.message || "Failed to fetch lesson");
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching lesson");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, lessonId, reset]);

  // ✅ Confirm remove modal
  const confirmRemove = (material) => {
    setMaterialToRemove(material);
    setRemoveMaterialOpen(true);
  };

  const handleRemoveConfirmed = () => {
    if (materialToRemove) {
      setRemovedMaterials((prev) => [
        ...prev,
        materialToRemove.id
      ]);

      setLesson((prev) => ({
        ...prev,
        materials: prev.materials.filter(
          (m) => m.id !== materialToRemove.id
        ),
      }));

      toast.info(`Removed ${materialToRemove.name}`);
    }

    setRemoveMaterialOpen(false);
    setMaterialToRemove(null);
    setIsDirty(true);
  };

    // Formatdate helper
  const formatDate = (date)=>{

    if(!date) return "-";

      return new Date(date).toLocaleDateString("en-IN",{
          day:"numeric",
          month:"numeric",
          year:"numeric",
          hour: "numeric",
          minute: "2-digit",
      });

    };



  // ✅ Download lesson material
  const downloadMaterial = async (material) => {
    try {
      setDownloadingMaterialId(material.id);

      const response = await fetch(
        `${apiUrl}courses/${courseId}/download-material/${material.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/octet-stream",
          },
        }
      );

      if (!response.ok) {
        let message = "Failed to download material.";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = material.name || "download";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Material download error:", error);

      toast.error(
        error.message || "Failed to download material."
      );
    } finally {
      setDownloadingMaterialId(null);
    }
  };

  // ✅ Submit handler
  const onSubmit = async (formData) => {
      try {
          setUploading(true);

          // -----------------------------------------
          // 1. Update lesson information
          // -----------------------------------------

          const payload = new FormData();

          payload.append("_method", "PUT");

          payload.append("title_en", formData.title_en || "");
          payload.append("title_hi", formData.title_hi || "");
          payload.append("description_en", formData.description_en || "");
          payload.append("description_hi", formData.description_hi || "");

          payload.append(
              "is_free_preview",
              formData.is_free_preview ? 1 : 0
          );

          payload.append(
              "status",
              formData.status || "draft"
          );

          if (formData.published_at) {
              payload.append(
                  "published_at",
                  formData.published_at
              );
          }

          // Existing materials selected for removal
          if (removedMaterials.length > 0) {
              removedMaterials.forEach((id) => {
                  payload.append(
                      "removed_materials[]",
                      id
                  );
              });
          }

          const updateResponse = await fetch(
              `${apiUrl}courses/${courseId}/update-lesson/${lessonId}`,
              {
                  method: "POST",
                  headers: {
                      Authorization: `Bearer ${token()}`,
                      Accept: "application/json",
                  },
                  body: payload,
              }
          );

          const updateData = await updateResponse.json();

          if (!updateResponse.ok || !updateData.status) {
              throw new Error(
                  updateData.message ||
                  "Failed to update lesson."
              );
          }


          // -----------------------------------------
          // 2. Upload newly selected materials
          // -----------------------------------------

          if (newMaterials.length > 0) {
              const materialPayload = new FormData();

              newMaterials.forEach((file) => {
                  materialPayload.append(
                      "materials[]",
                      file
                  );
              });

              const materialResponse = await fetch(
                  `${apiUrl}lessons/${lessonId}/upload-materials`,
                  {
                      method: "POST",
                      headers: {
                          Authorization: `Bearer ${token()}`,
                          Accept: "application/json",
                      },
                      body: materialPayload,
                  }
              );

              const materialData =
                  await materialResponse.json();

              if (
                  !materialResponse.ok ||
                  !materialData.status
              ) {
                  throw new Error(
                      materialData.message ||
                      "Lesson updated, but material upload failed."
                  );
              }

              console.log(
                  "Materials uploaded successfully:",
                  materialData
              );
          }


          // -----------------------------------------
          // 3. Reset local state
          // -----------------------------------------

          toast.success(
              "Lesson updated successfully"
          );

          setNewMaterials([]);
          setRemovedMaterials([]);
          setIsDirty(false);

          navigate(
              `/admin/lesson/${courseId}/course-lessons`
          );

      } catch (err) {
          console.error(err);

          toast.error(
              err.message ||
              "Server error while updating lesson."
          );
      } finally {
          setUploading(false);
      }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <ClipLoader color="#007bff" size={50} />
      </div>
    );

  return (
    <>

        {/* Breadcrumbs */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section">
                <h3>Lesson <span>Update</span></h3>
  
                <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to={`/admin/course/view-course/${courseId}`}>View Course</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to={`/admin/lesson/${courseId}/course-lessons`}>Lesson Management</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to=""><span>Update Lesson</span></Link>
  
            </section>
  
            <Link to={`/admin/lesson/${courseId}/course-lessons`} className="edit-btn">
            <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
            </Link>
        </div>

        <div className="dashboard-card my-4">
          {uploading && (
            <div className="position-absolute top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center bg-white bg-opacity-75">
              <ClipLoader color="#007bff" size={40} />
            </div>
          )}

        <div className="card-header-custom">
          <div className="header">
              <FontAwesomeIcon icon={faPen} className="icon"/>
              <span>Update Lesson</span>
          </div>
        </div>  

        <hr />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faA} className="icon" />
                Lesson Title (English)
              </label>
              <input
                {...register("title_en", { required: "Title is required" })}
                className={`form-control ${errors.title_en && "is-invalid"}`}
              />
              {errors.title_en && (
                <p className="invalid-feedback">{errors.title_en.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faA} className="icon" />
                Lesson Title (Hindi)
              </label>
              <input
                {...register("title_hi")}
                className={`form-control ${errors.title_hi && "is-invalid"}`}
              />
              {errors.title_hi && (
                <p className="invalid-feedback">{errors.title_hi.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faFileAlt} className="icon" />
                Description (English)
              </label>
              <textarea
                {...register("description_en")}
                className="form-control"
                rows="4"
              />
            </div>
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faFileAlt} className="icon" />
                Description (Hindi)
              </label>
              <textarea
                {...register("description_hi")}
                className="form-control"
                rows="4"
              />
            </div>

            {/* Free Preview */}
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faCheck} className="icon" />
                Free Lesson / Demo Lesson
              </label>
              <input
                type="checkbox"
                {...register("is_free_preview")}
                className="form-check-input me-2"
                id="isFreePreview"
              />
              <label
                className="form-check-label"
                htmlFor="isFreePreview"
              >
                Free Preview
              </label>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faFlag} className="icon" />
                Status
              </label>              
              <select {...register("status")} className="form-control">
                <option value="draft"> Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Publish Date */}
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faCalendarWeek} className="icon" />
                Published Date
              </label>
              <input
                  type="date"
                  value={
                      lesson?.published_at
                          ? new Date(lesson.published_at)
                                .toISOString()
                                .slice(0, 10)
                          : ""
                  }
                  className="form-control"
                  disabled
              />
            </div>

            {/* Last Change Date */}
            <div className="mb-4">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faCalendarDay} className="icon" />
                Last Updated On
              </label>
              <input
                  type="text"
                  value={formatDate(lesson?.updated_at)}
                  className="form-control"
                  disabled
                  readOnly
              />
            </div>

            {/* Materials */}
            <div className="mb-3">

              <label className="form-label">
                <FontAwesomeIcon icon={faUpload} className="icon" />
                Upload Material
              </label>

              <small className="text-muted d-block">
                Supported Formats: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, JPEG, PNG, ZIP, RAR, 7Z
              </small>

              {/* Hidden native file input */}
              <input
                id="lesson_materials"
                type="file"
                multiple
                hidden
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar,.7z"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  setNewMaterials((prev) => [...prev, ...files]);
                  setIsDirty(true);

                  // Allows selecting the same file again
                  e.target.value = "";
                }}
              />

              {/* Custom upload button */}
              <label
                htmlFor="lesson_materials"
                className="btn blue-btn mt-3"
              >
                <FontAwesomeIcon icon={faFileCirclePlus} className="me-2" />
                Add Materials
              </label>


              {/* Newly selected materials */}
              {newMaterials.length > 0 && (
                <div className="mt-3">

                  <p>New Materials:</p>

                  {newMaterials.map((file, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center justify-content-between border p-2 mb-2 rounded"
                    >
                      <span>{file.name}</span>

                      <button
                        type="button"
                        className="btn btn-sm red-btn"
                        onClick={() => {
                          setNewMaterials((prev) =>
                            prev.filter((_, i) => i !== index)
                          );

                          setIsDirty(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faClose} />
                      </button>
                    </div>
                  ))}

                </div>
              )}


              {/* Existing materials */}
              {lesson?.materials?.length > 0 && (
                <div className="mt-3">

                  <strong>Existing Materials:</strong>

                  {lesson.materials.map((m) => (
                    <div
                      key={m.id}
                      className="d-flex align-items-center justify-content-between border p-2 my-2 rounded"
                    >

                      <span>{m.name}</span>

                      <div>

                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          View
                        </a>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => downloadMaterial(m)}
                          disabled={downloadingMaterialId === m.id}
                        >
                          {downloadingMaterialId === m.id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                              />
                              Downloading...
                            </>
                          ) : (
                            "Download"
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmRemove(m)}
                        >
                          Remove
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn gray-btn-opp me-2"
                onClick={() =>
                  navigate(`/admin/lesson/${courseId}/course-lessons`)
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn blue-btn d-flex align-items-center gap-2"
                disabled={!isDirty || isSubmitting || uploading}
              >
                {uploading ?  (
                                    
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2 text-primary"
                        role="status"
                      />
      
                        <span className='text-primary'><FontAwesomeIcon icon={faSave}/> Saving... </span>
      
                      </>
      
                      ) : (
      
                        <> 

                        <FontAwesomeIcon icon={faSave}/> Save Changes
                        </>
      
                    )}
              </button>
            </div>
          </form>
        </div>

        {/* Confirmation Dialog Box */}

        <ConfirmationDialogBoxUi
          open={removeMaterialOpen}
          title="Remove Material"
          confirmText="Remove"
          confirmVariant="danger"

          onCancel={() => {
            setRemoveMaterialOpen(false);
            setMaterialToRemove(null);
          }}

          onConfirm={handleRemoveConfirmed}
        >
          Are you sure you want to remove <br />

          <strong>
            {materialToRemove?.name}
          </strong>
          ?

          <br /><br />

                <p className="text-danger" style={{fontSize:'12px'}}> This action cannot be undone. File will be permanently deleted from server.</p>



        </ConfirmationDialogBoxUi>

    </>
  );
};

export default UpdateLesson;