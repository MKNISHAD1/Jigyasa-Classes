import React, { useContext, useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { useForm } from "react-hook-form";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { AuthContext } from "../context/Auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CreateCourse = () => {
  const { hasAnyRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [isDisable, setIsDisable] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const {i18n} = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm();

  const selectedCategory = watch("category_id");
  const thumbnailFile = watch("thumbnail");

  // ✅ Handle thumbnail preview
  useEffect(() => {
    if (thumbnailFile && thumbnailFile.length > 0) {
      const file = thumbnailFile[0];
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);

      return () => URL.revokeObjectURL(url); // cleanup
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  // Handle remove thumbnail
  const removeThumbnail = () => {
    setThumbnailPreview(null);
    reset((formValues) => ({
      ...formValues,
      thumbnail: null,
    }));

    // Also clear the file input element directly
    document.getElementById("thumbnail-input").value = "";
  };


  // ✅ Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(apiUrl + "teachers", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        });
        const result = await res.json();
        if (result.status) setTeachers(result.teachers);
      } catch (err) {
        console.error("Failed to load teachers", err);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Fetch categories
  useEffect(() => {
    fetch(apiUrl + "categories", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) setCategories(data.categories);
      });
  }, []);

  // ✅ Fetch subcategories based on category
  useEffect(() => {
    if (!selectedCategory) return;
    fetch(`${apiUrl}categories/${selectedCategory}/subcategories`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) setSubcategories(data.subcategories);
      });
  }, [selectedCategory]);


  const onSubmit = async (formData) => {
    setIsDisable(true);

    const payload = new FormData();
    for (const key in formData) {
      if (key === "thumbnail") {
        if (formData.thumbnail && formData.thumbnail.length > 0) {
          payload.append("thumbnail", formData.thumbnail[0]);
        }
      } else {
        payload.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch(apiUrl + "create-course", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: payload,
      });

      const result = await res.json();

      if (result.status) {
        toast.success(result.message);
        reset(); // clear form
        setThumbnailPreview(null);
        navigate("/admin/courses");
      } else {
        if (result.error) {
          for (const key in result.error) {
            setError(key, { type: "server", message: result.error[key][0] });
          }
        } else {
          toast.error(result.message || "Something went wrong!");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error, please try again later.");
    } finally {
      setIsDisable(false);
    }
  };

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
              <div className="card shadow border-0 p-4">
                <h4>Create New Course</h4>
                <form onSubmit={handleSubmit(onSubmit)}>

                  
                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label">Course Title (English) </label>
                    <input
                      {...register("title_en", { required: "This field is required" })}
                      type="text"
                      className={`form-control ${errors.title_en && "is-invalid"}`}
                      placeholder="Enter course title in english"
                    />
                    {errors.title_en && (
                      <p className="invalid-feedback">{errors.title_en.message}</p>
                    )}
                  </div>
                   <div className="mb-3">
                    <label className="form-label">Course Title (Hindi) </label>
                    <input
                      {...register("title_hi")}
                      type="text"
                      className={`form-control ${errors.title_hi && "is-invalid"}`}
                      placeholder="कोर्स का शीर्षक"
                    />
                    {errors.title_hi && (
                      <p className="invalid-feedback">{errors.title_hi.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label">Course Description (English)</label>
                    <textarea
                      {...register("description_en", {
                        required: "This field is required",
                      })}
                      className={`form-control ${
                        errors.description_en && "is-invalid"
                      }`}
                      placeholder="Enter course description in english"
                    />
                    {errors.description_en && (
                      <p className="invalid-feedback">
                        {errors.description_en.message}
                      </p>
                    )}
                  </div>
                    <div className="mb-3">
                    <label className="form-label">Course Description (Hindi)</label>
                    <textarea
                      {...register("description_hi")}
                      className={`form-control ${
                        errors.description_hi && "is-invalid"
                      }`}
                      placeholder="कोर्स विवरण (हिंदी)"
                    />
                    {errors.description_hi && (
                      <p className="invalid-feedback">
                        {errors.description_hi.message}
                      </p>
                    )}
                  </div>

                  {/* Category & Subcategory */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        {...register("category_id", {
                          required: "Select a category",
                        })}
                        className={`form-control ${
                          errors.category_id && "is-invalid"
                        }`}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name[i18n.language] ?? cat.name?.en} {/* pick en/hi dynamically */}
                          </option>
                        ))}

                        {/* this is react safe  gaurd logic will always rensder string value
                        
                        <option key={cat.id} value={cat.id}>
                          {typeof cat.name[i18n.language] === "string"
                          
                            ? cat.name[i18n.language]
                            : cat.name.en}
                        </option> */}
                      </select>
                      {errors.category_id && (
                        <p className="invalid-feedback">
                          {errors.category_id.message}
                        </p>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Subcategory (Optional)</label>
                      <select {...register("subcategory_id")} className="form-control">
                        <option value="">-- Select Subcategory --</option>
                        {subcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name[i18n.language] ?? sub.name?.en} {/* pick en/hi dynamically */}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <label className="form-label">Price (Optional)</label>
                    <input
                      {...register("price")}
                      type="number"
                      className="form-control"
                      placeholder="Enter price in INR"
                    />
                  </div>

                  {/* Teacher */}
                  <div className="mb-3">
                    <label className="form-label">Assign Teacher</label>
                    <select
                      {...register("teacher_id", {
                        required: "Teacher is required",
                      })}
                      className={`form-control ${
                        errors.teacher_id && "is-invalid"
                      }`}
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                    {errors.teacher_id && (
                      <p className="invalid-feedback">
                        {errors.teacher_id.message}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      {...register("status", { required: "Select status" })}
                      className={`form-control ${errors.status && "is-invalid"}`}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    {errors.status && (
                      <p className="invalid-feedback">{errors.status.message}</p>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="mb-3">
                    <input
                      {...register("thumbnail")}
                      id="thumbnail-input"
                      type="file"
                      className="form-control"
                      accept="image/*"
                    />

                    {thumbnailPreview && (
                      <div className="mt-2">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          style={{ maxHeight: "150px", borderRadius: "8px" }}
                        />

                        <button
                          type="button"
                          className="btn btn-sm btn-danger mt-2"
                          onClick={removeThumbnail}
                        >
                          Remove Thumbnail
                        </button>
                      </div>
                    )}
                    </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={isDisable}
                  >
                    {isDisable ? "Creating..." : "Create Course"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateCourse;


