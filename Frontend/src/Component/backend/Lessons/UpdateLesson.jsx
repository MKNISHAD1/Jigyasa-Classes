import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import ClipLoader from "react-spinners/ClipLoader";

const UpdateLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removedMaterials, setRemovedMaterials] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materialToRemove, setMaterialToRemove] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [newMaterials, setNewMaterials] = useState([]);


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
            headers: { Authorization: `Bearer ${token()}` },
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
    setShowConfirmModal(true);
  };

  const handleRemoveConfirmed = () => {
    if (materialToRemove) {
      setRemovedMaterials((prev) => [...prev, materialToRemove.id]);
      setLesson((prev) => ({
        ...prev,
        materials: prev.materials.filter((m) => m.id !== materialToRemove.id),
      }));
      toast.info(`Removed ${materialToRemove.name}`);
    }
    setShowConfirmModal(false);
    setMaterialToRemove(null);
    setIsDirty(true);
  };

  // ✅ Submit handler
  const onSubmit = async (formData) => {
    try {
      setUploading(true);
      const payload = new FormData();
      payload.append("_method", "PUT");

      if (formData.title_en) payload.append("title_en", formData.title_en);
      if (formData.title_hi) payload.append("title_hi", formData.title_hi);
      if (formData.description_en)
        payload.append("description_en", formData.description_en);
      if (formData.description_hi)
        payload.append("description_hi", formData.description_hi);

      payload.append("is_free_preview", formData.is_free_preview ? 1 : 0);
      if (formData.status) payload.append("status", formData.status);
      if (formData.published_at)
        payload.append("published_at", formData.published_at);

      // Files
      if (newMaterials.length > 0) {
        newMaterials.forEach((file) => payload.append("materials[]", file));
      }


      // Removed materials
      if (removedMaterials.length > 0) {
        removedMaterials.forEach((id) =>
          payload.append("removed_materials[]", id)
        );
      }

      const res = await fetch(
        `${apiUrl}courses/${courseId}/update-lesson/${lessonId}`,
        {
          method: "POST",
          headers: { Authorization:`Bearer ${token()}` },
          body: payload,
        }
      );

      const data = await res.json();
      if (data.status) {
        toast.success("Lesson updated successfully");
        setNewMaterials([]);
        setRemovedMaterials([]);
        setIsDirty(false);
        navigate(`/admin/course/view-course/${courseId}`);
      } else toast.error(data.message || "Failed to update lesson");
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating lesson");
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
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9 dashboard">
              <div className="card shadow border-0 p-4 position-relative">
                {uploading && (
                  <div className="position-absolute top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center bg-white bg-opacity-75">
                    <ClipLoader color="#007bff" size={40} />
                  </div>
                )}

                <h4 className="mb-3 text-center">Update Lesson</h4>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      {...register("title_en", { required: "Title is required" })}
                      className={`form-control ${errors.title_en && "is-invalid"}`}
                    />
                    {errors.title_en && (
                      <p className="invalid-feedback">{errors.title_en.message}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title (Hindi) </label>
                    <input
                      {...register("title_hi")}
                      className={`form-control ${errors.title_hi && "is-invalid"}`}
                    />
                    {errors.title_hi && (
                      <p className="invalid-feedback">{errors.title_hi.message}</p>
                    )}
                  </div>
                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      {...register("description_en")}
                      className="form-control"
                      rows="4"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description (Hindi)</label>
                    <textarea
                      {...register("description_hi")}
                      className="form-control"
                      rows="4"
                    />
                  </div>
                  {/* Free Preview */}
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      {...register("is_free_preview")}
                      className="form-check-input"
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
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select {...register("status")} className="form-control">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Publish Date */}
                  <div className="mb-3">
                    <label className="form-label">Publish Date</label>
                    <input
                      type="date"
                      {...register("published_at")}
                      className="form-control"
                    />
                  </div>

                  {/* Materials */}
                  <div className="mb-3">
                    <label className="form-label">Upload Materials</label>
                    <input
                      type="file"
                      multiple
                      className="form-control"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setNewMaterials((prev) => [...prev, ...files]); // append new ones
                        setIsDirty(true);
                      }}
                    />
                    {newMaterials.length > 0 && (
                    <div className="mt-3">
                      <p>New Materials (to upload):</p>
                      {newMaterials.map((file, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center justify-content-between border p-2 mb-2 rounded"
                        >
                          <span>{file.name}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setNewMaterials((prev) => prev.filter((_, i) => i !== index));
                              setIsDirty(true);
                            }}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}


                    {/* Alredy uploaded Media materials */}
                    {lesson?.materials?.length > 0 && (
                      <div className="mt-3">
                        <p>Existing Materials:</p>
                        {lesson.materials.map((m) => (
                          <div
                            key={m.id}
                            className="d-flex align-items-center justify-content-between border p-2 mb-2 rounded"
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
                              <a
                                href={m.url}
                                download
                                className="btn btn-sm btn-outline-success me-2"
                              >
                                Download
                              </a>
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

                  {/* Buttons */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() =>
                        navigate(`/admin/course/view-course/${courseId}`)
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary d-flex align-items-center gap-2"
                      disabled={!isDirty || isSubmitting || uploading}
                    >
                      {uploading && (
                        <ClipLoader size={18} color="#fff" speedMultiplier={0.7} />
                      )}
                      {uploading ? "Updating..." : "Update Lesson"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Removal</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowConfirmModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to remove{" "}
                  <strong>{materialToRemove?.name}</strong>?
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleRemoveConfirmed}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default UpdateLesson;