import React, { useContext, useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { useForm } from "react-hook-form";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { AuthContext } from "../context/Auth";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faAngleRight, faArrowLeft, faChartSimple, faFile, faFileEdit, faFlag, faFolderClosed, faFolderTree, faGlobe, faIndianRupee, faPlug, faPlus, faRupee, faStar, faTrash, faUpload, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { COURSE_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { availabilityValidator } from "../../../utilities/validators";

const CreateCourse = () => { 
  const { hasAnyRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const {i18n} = useTranslation();

  const [highlights, setHighlights] = useState([ { en: "", hi: ""} ]);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ 
      mode:"onChange", // onBlur  = after leaving the field and debounce validator 
      reValidateMode:"onChange",
    });

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

  // Add Highlight
  const addHighlight = () => {

    setHighlights([
      ...highlights,
      {
        en: "",
        hi: ""
      }
    ]);

  };

  // Remove Highlights
  const removeHighlight = (index) => {

    setHighlights(
      highlights.filter(
        (_, i) => i !== index
      )
    );

  };

  // Update Hughlights

  const updateHighlight = (
    index,
    field,
    value
  ) => {

    const updated = [...highlights];

    updated[index][field] = value;

    setHighlights(updated);

  };



  // ✅ Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
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
      } finally{
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Fetch categories
  useEffect(() => {
    try{
      setLoading(true);
      fetch(apiUrl + "categories", {
        headers: { Authorization: `Bearer ${token()}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) setCategories(data.categories);
        });
    } catch {
      toast.error("Something Went Wrong, Please Try Again")
    } finally{
      setLoading(false);
    }
  }, []);

  // ✅ Fetch subcategories based on category
  useEffect(() => {
    if (!selectedCategory) return;
    try{
      setLoading(true);
      fetch(`${apiUrl}categories/${selectedCategory}/subcategories`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) setSubcategories(data.subcategories);
        });
    } catch{
      toast.error("Something Went Wrong, Please Try Again")
    } finally{
      setLoading(false);
    }
  }, [selectedCategory]);


  const onSubmit = async (formData) => {
    setLoading(true);

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

    highlights.forEach(
      (highlight, index) => {

        if (
          highlight.en.trim()
        ) {
          payload.append(
            `highlights[${index}]`,
            highlight.en.trim()
          );
        }

        if (
          highlight.hi.trim()
        ) {
          payload.append(
            `highlights_hi[${index}]`,
            highlight.hi.trim()
          );
        }

      }
    );


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
        navigate(COURSE_ROUTES.MY_COURSE);
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
      toast.error("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <> 

    {/* Breadcrumbs */}
    <div className="d-flex justify-content-between align-items-center">
      <section className="breadcrumb-section">
        <h3>Create <span>Course</span></h3>

        <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
        <span><FontAwesomeIcon icon={faAngleRight}/></span>
        

        <Link className='bread-link' to=""><span>Create Course</span></Link>
      </section>

      <Link to={COURSE_ROUTES.MY_COURSE} className="edit-btn">
      <FontAwesomeIcon icon={faArrowLeft} className="icon"/> Return
      </Link>
    </div>


    <div className="dashboard-card my-4">

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Title */}
          <div className="row mb-3">

              {/* Title Eng */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label"> 
                  <FontAwesomeIcon icon={faA} className="icon" />
                  Course Title (English) <b className="text-danger">*</b>
                </label>
                <input
                  {...register("title_en", { 
                      required: "This field is required",
                      minLength: {
                            value: 5,
                            message: "Course Title atleast be minimum 8 characters"
                        },
                      maxLength : {
                        value : 255,
                        message: "Course Title length exceeded, Kindly make it with in 255 characters"
                      },
                      validate :availabilityValidator(
                        "courses", // Model name
                        "title", // Feild Name
                        null,
                        null,
                        "Course Name" // lable Name
                      ) })}
                  type="text"
                  disabled={loading}
                  className={`form-control ${errors.title_en && "is-invalid"}`}
                  placeholder="Enter course title in english"
                />
                {errors.title_en && (
                  <p className="invalid-feedback">{errors.title_en.message}</p>
                )}

              </div>            
            </div>

              {/* Title Hi */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faA} className="icon" />
                  Course Title (Hindi) </label>
                <input
                  {...register("title_hi",{
                    minLength: {
                      value: 5,
                            message: "Course Title atleast be minimum 8 characters"
                        },
                      maxLength : {
                        value : 255,
                        message: "Course Title length exceeded, Kindly make it with in 255 characters"
                      }
                  })}
                  type="text"
                  disabled={loading}
                  className={`form-control ${errors.title_hi && "is-invalid"}`}
                  placeholder="कोर्स का शीर्षक"
                />
                {errors.title_hi && (
                  <p className="invalid-feedback">{errors.title_hi.message}</p>
                )}
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="row mb-3">

            {/* Description Eng */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faFileEdit} className="icon" />
                  Course Description (English) <b className="text-danger">*</b>
                </label>
                <textarea
                  {...register("description_en", {
                    required: "This field is required",
                  })}
                  rows={5}
                  className={`form-control ${
                    errors.description_en && "is-invalid"
                  }`}
                  placeholder="Enter course description in english"
                  disabled={loading}
                />
                {errors.description_en && (
                  <p className="invalid-feedback">
                    {errors.description_en.message}
                  </p>
                )}
              </div>              
            </div>

            {/* Description Hi */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faFileEdit} className="icon" />
                  Course Description (Hindi)
                </label>
                <textarea
                  {...register("description_hi")}
                  className={`form-control ${
                    errors.description_hi && "is-invalid"
                  }`}
                  rows={5}
                  disabled={loading}
                  placeholder="कोर्स विवरण (हिंदी)"
                />
                {errors.description_hi && (
                  <p className="invalid-feedback">
                    {errors.description_hi.message}
                  </p>
                )}
              </div>              
            </div>

          </div>

          {/* Category & Subcategory */}        
          <div className="row mb-3">
            {/* Category */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faFolderClosed} className="icon" />
                Category <b className="text-danger">*</b>
              </label>
              <select
                {...register("category_id", {
                  required: "Select a category",
                })}
                disabled={loading}
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
              </select>
              {errors.category_id && (
                <p className="invalid-feedback">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            {/* Sub Category */}
            <div className="col-md-6 mb-e">
              <label className="form-label">
                <FontAwesomeIcon icon={faFolderTree} className="icon" />
                Subcategory (Optional)
                </label>
              <select {...register("subcategory_id")} 
              className="form-control"
              disabled={loading}
              >
                <option value="">-- Select Subcategory --</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name[i18n.language] ?? sub.name?.en} {/* pick en/hi dynamically */}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Language and Difficulty Level */}
          <div className="row mb-3">

            {/* Language */}
            <div className="col-md-6">
              <div className="mb-3">

                <label className="form-label">
                <FontAwesomeIcon icon={faGlobe} className="icon" />

                  Language <b className="text-danger">*</b>
                </label>

                <select
                  {...register("language", {
                    required: "Language is required"
                  })}
                  disabled={loading}
                  className={`form-control ${
                    errors.language && "is-invalid"
                  }`}
                >

                  <option value="">
                    Select Language
                  </option>

                  <option value="English">
                    English
                  </option>

                  <option value="Hindi">
                    Hindi
                  </option>

                  <option value="Both">
                    Both
                  </option>

                </select>

                {errors.language && (
                  <p className="invalid-feedback">
                    {errors.language.message}
                  </p>
                )}

              </div>              
            </div>

              {/* Difficulty Level */}
            <div className="col-md-6">
              <div className="mb-3">

                <label className="form-label">
                <FontAwesomeIcon icon={faChartSimple} className="icon" />
                  Difficulty Level <b className="text-danger">*</b>
                </label>

                <select
                  {...register("difficulty_level", {
                    required:
                      "Difficulty level is required"
                  })}
                  className={`form-control ${
                    errors.difficulty_level &&
                    "is-invalid"
                  }`}
                  disabled={loading}
                >

                  <option value="">
                    Select Difficulty
                  </option>

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>

                  <option value="All Levels">
                    All Levels
                  </option>

                </select>

                {errors.difficulty_level && (
                  <p className="invalid-feedback">
                    {errors.difficulty_level.message}
                  </p>
                )}

              </div>              
            </div>
          </div>


          {/* Highlights */}
          <label className="form-label">
            <FontAwesomeIcon icon={faStar} className="icon" />
             Course Highlights
          </label>
          <div className="box mb-4" style={{
            backgroundColor:'#ebf1f5',
            padding:'15px',
            borderRadius:'10px'
          }}>
            <div className="mb-3">

              {highlights.map(
                (highlight, index) => (

                <div
                  className="row mb-2"
                  key={index}
                >
                  {/* Enter Highlight  */}
                  <div className="col-md-11">
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Highlight (English)"
                            value={highlight.en}
                            disabled={loading}
                            onChange={(e) =>
                              updateHighlight(
                                index,
                                "en",
                                e.target.value
                              )
                            }
                          />
                      </div>

                      <div className="col-md-6">

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Highlight (Hindi)"
                          value={highlight.hi}
                          disabled={loading}
                          onChange={(e) =>
                            updateHighlight(
                              index,
                              "hi",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                  </div>

                  {/* Remove Hightlight */}
                  {highlights.length > 1 && (
                    <div className="col-md-1">

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() =>
                          removeHighlight(index)
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} className=" text-danger" />
                      </button>

                    </div>
                  )}
                </div>


              ))}

              {/* Add Highlights */}
              <button
                type="button"
                className="btn w-100 mt-3"
                style={{
                  borderRadius:'5px',
                  border:'2px dashed #1363b8'
                }}
                onClick={addHighlight}
              >
                <small className="text-primary fw-bold">
                  <FontAwesomeIcon icon={faPlus}  /> Add Highlights
                </small>
              </button>

            </div>
          </div>

          {/* Teacher */}

          {hasAnyRole(["moderator","admin","super_admin"]) 
            && (
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faUserTie} className="icon" />
                  Assign Teacher (Optional)</label>
                <select
                  {...register("teacher_id")}
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
          )}

          {/* Price & Status*/}
          <div className=" row mb-4">

            {/* Price */}
            <div className="col-md-6">
              <label className="form-label">
                <FontAwesomeIcon icon={faIndianRupee} className="icon" />
                Price (Optional)</label>
              <input
                {...register("price")}
                type="number"
                min={0}
                max={999999}
                step={1}
                disabled={loading}
                className="form-control"
                placeholder="leave empty for free course"
              />
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faFlag} className="icon" />
                Course Status <b className="text-danger">*</b></label>
              <select
                {...register("status", { required: "Select status" })}
                className={`form-control ${errors.status && "is-invalid"}`}
              >
                <option value="">-- Select Status --</option>
                <option value="draft"> Draft</option>
                <option value="published">Published</option>
              </select>
              {errors.status && (
                <p className="invalid-feedback">{errors.status.message}</p>
              )}
            </div>

          </div>

          {/* Thumbnail */}
          <div className="mb-4">
            <label className="form-label"> 
              <FontAwesomeIcon icon={faUpload} className="icon" />
              Upload Thumbnail</label>
            <input
              {...register("thumbnail")}
              id="thumbnail-input"
              type="file"
              disabled={loading}
              className="form-control"
              accept="image/*"
            />
            <small className="text-muted">Allowed Formate : JPG, PNG, JPEG (Max Size : 2 MB)</small>

            {thumbnailPreview && (
              <div className="mt-3 text-center">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  style={{ maxHeight: "200px", borderRadius: "10px" }}
                /> <br />

                <button
                  type="button"
                  className="btn btn-sm btn-danger mt-2"
                  onClick={removeThumbnail}
                >
                  <FontAwesomeIcon icon={faTrash}/> Remove Thumbnail
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
              type="submit"
              className="btn submit-btn"
              disabled={loading || isSubmitting}  
          >
              {loading ? (

                <>
                  <span
                    className="spinner-border spinner-border-sm me-2 text-primary"
                    role="status"
                  />

                    <span className='text-primary'>Creating Course... </span>

                  </>

                  ) : (

                    <>
                    <FontAwesomeIcon icon={faPlus}/> Create Course
                    </>

                )}
          </button>

        </form>

        </div>



    </>
  );
};

export default CreateCourse;


