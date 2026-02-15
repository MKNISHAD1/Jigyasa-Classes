import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { toast } from "react-toastify";

const UpdateCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isChanged, setIsChanged] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const selectedCategory = watch("category_id");

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(apiUrl + "view-course/" + id, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
        });
        const result = await res.json();

        if (result.status) {
          setCourse(result.course);
          // ✅ Use full URL directly
          setPreview(result.course.thumbnail ? result.course.thumbnail : null);


          // on 18 /9/25 can be use i above not work
          // setPreview(
          //   result.course.thumbnail
          //     ? `${apiUrl.replace("api/", "")}${result.course.thumbnail}`
          //     : null
          // );



          // Reset form values
          reset({
            title_en: result.course.title?.en || "",
            title_hi: result.course.title?.hi || "",
            description_en: result.course.description?.en || "",
            description_hi: result.course.description?.hi || "",
            price: result.course.price,
            category_id: result.course.category?.id || "",
            subcategory_id: result.course.subcategory?.id || "",
            teacher_id: result.course.teacher?.id || "",
            status: result.course.status,
          });

          // Fetch subcategories for this course
          if (result.course.category?.id) {
            const subRes = await fetch(
              apiUrl + `categories/${result.course.category?.id}/subcategories`,
              { headers: { Authorization: `Bearer ${token()}` } }
            );
            const subData = await subRes.json();
            if (subData.status) setSubcategories(subData.subcategories);
          }

          // ✅ make sure category_id triggers watch() correctly
          setValue("category_id", result.course.category?.id || "");

          console.log("✅ Course data fetched:", result.course);

        } else {
          toast.error("Failed to load course");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching course");
      }
    };

    fetchCourse();
  }, [id, reset,setValue]);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(apiUrl + "categories", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();

        if (data.status) {
          setCategories(data.categories);

          // ✅ re-sync once both course and categories are ready
          if (course) {
            reset((prev) => ({
              ...prev,
              category_id: course.category?.id || "",
              subcategory_id: course.subcategory?.id || "",
              teacher_id: course.teacher?.id || "",
              status: course.status,
            }));
          }

          console.log("✅ Categories fetched:", data.categories);
        }
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [course, reset]);



  // ✅ Fetch subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }

    const fetchSubs = async () => {
      try {
        const res = await fetch(apiUrl + `categories/${selectedCategory}/subcategories`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        if (data.status) setSubcategories(data.subcategories);
        console.log("✅ Subcategories fetched for category:", selectedCategory, data.subcategories);
      } catch (err) {
        console.error("❌ Error fetching subcategories:", err);
      }
    };

    fetchSubs();
  }, [selectedCategory]);


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
        const data = await res.json();
        if (data.status) setTeachers(data.teachers || []);
        console.log("✅ Teachers fetched:", data.teachers);
      } catch (err) {
        console.error("❌ Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);


  // Track form changes to enable Update button
  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type === "change") setIsChanged(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Handle file preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoadingPreview(true);
      const newPreview = URL.createObjectURL(file);
      setTimeout(() => {
        setPreview(newPreview);
        setLoadingPreview(false);
        setIsChanged(true);
      }, 300); // slight delay for smooth loading animation
    } else {
       setPreview(course?.thumbnail || null);
    }
  };


  // Update course
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    // Transaltion Field
    formData.append("title_en", data.title_en || "");
    formData.append("title_hi", data.title_hi || "");
    formData.append("description_en", data.description_en || "");
    formData.append("description_hi", data.description_hi || "");
    // Normal fields
    formData.append("price", data.price || "");
    formData.append("category_id", data.category_id || "");
    formData.append("subcategory_id", data.subcategory_id || "");
    formData.append("teacher_id", data.teacher_id || "");
    formData.append("status", data.status || "");



    // Append thumbnail if selected
    if (data.thumbnail && data.thumbnail[0]) {
      formData.append("thumbnail", data.thumbnail[0]);
    }


    try {
      const res = await fetch(apiUrl + "update-course/" + id, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (result.status) {
        toast.success("Course updated successfully");

        // Update UI immediately
        setCourse(result.course);
        setPreview(result.course.thumbnail || null);
        setIsChanged(false);

        setTimeout(() => {
          navigate("/admin/courses");
        }, 800);
      } else {

        toast.error(result.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
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
                <h4 className="mb-3 text-center">Update Course</h4>
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
                    <label className="form-label">Title (Hindi)</label>
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
                  {/* Price */}
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      {...register("price")}
                      className="form-control"
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select {...register("category_id")} className="form-control">
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name?.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div className="mb-3">
                    <label className="form-label">Subcategory</label>
                    <select {...register("subcategory_id")} className="form-control">
                      <option value="">-- Select Subcategory --</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name?.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Teacher */}
                  <div className="mb-3">
                    <label className="form-label">Teacher</label>
                    <select
                      {...register("teacher_id", { required: "Teacher is required" })}
                      className={`form-control ${errors.teacher_id && "is-invalid"}`}
                    >
                      <option value="">-- Select Teacher --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    {errors.teacher_id && (
                      <p className="invalid-feedback">{errors.teacher_id.message}</p>
                    )}
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


                  {/* Thumbnail */}
                  <div className="mb-3">
                    <label className="form-label">Thumbnail</label>
                    <input
                      type="file"
                      accept="image/*"
                      {...register("thumbnail")}
                      onChange={handleFileChange}
                      className="form-control"
                    />

                    <div className="mt-3 text-center position-relative">
                      {loadingPreview ? (
                        <div
                          className="spinner-border text-primary"
                          style={{ width: "3rem", height: "3rem" }}
                          role="status"
                        ></div>
                      ) : (
                        <>
                          <p className="mb-1 text-muted">
                            {preview
                              ? "Current / Selected Thumbnail:"
                              : course?.thumbnail
                              ? "Current Thumbnail:"
                              : "Default Thumbnail:"}
                          </p>
                          <img
                            src={
                              preview
                                ? preview
                                : course?.thumbnail
                                ? course.thumbnail
                                : "/images/default-thumbnail.jpg"
                            }
                            alt="Course Thumbnail"
                            className="rounded border"
                            width="180"
                            style={{ objectFit: "cover" }}
                          />

                          {watch("thumbnail")?.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={() => {
                              setPreview(course?.thumbnail || null);
                              setValue("thumbnail", null);
                              setIsChanged(false);
                              }}
                            >
                              Remove Thumbnail
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !isChanged}
                  >
                    {isSubmitting ? "Updating..." : "Update Course"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate("/admin/courses")}
                  >
                    Cancel
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

export default UpdateCourse;