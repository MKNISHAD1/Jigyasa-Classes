import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { toast } from "react-toastify";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { faA, faAngleRight, faArrowLeft, faCamera, faChartSimple, faFileEdit, faFlag, faFloppyDisk, faFolderClosed, faFolderTree, faGlobe, faIndianRupee, faL, faPlus, faStar, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { COURSE_ROUTES, DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { availabilityValidator } from "../../../utilities/validators";
import { AuthContext } from "../context/Auth";

const UpdateCourse = () => {
  
  const { hasAnyRole } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [originalHighlights, setOriginalHighlights] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [highlights, setHighlights] = useState([]);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
      mode:"onChange", // onBlur  = after leaving the field and debounce validator 
      reValidateMode:"onChange",
    });

  const selectedCategory = watch("category_id");

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
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
            language: result.course.language || "",
            difficulty_level: result.course.difficulty_level || "",
            category_id: result.course.category?.id || "",
            subcategory_id: result.course.subcategory?.id || "",
            teacher_id: result.course.teacher?.id || "",
            status: result.course.status,
          });

          // Set Highlight function
          const fetchedHighlights =
              result.course.highlights?.en?.length
                  ? result.course.highlights.en.map((enText, index) => ({
                      en: enText,
                      hi: result.course.highlights?.hi?.[index] || ""
                  }))
                  : [];

          setHighlights(fetchedHighlights);
          setOriginalHighlights(fetchedHighlights);


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
        toast.error("Something went wrong while fetching course");
      } finally{
        setLoading(false);
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

const highlightsChanged =
    JSON.stringify(highlights) !==
    JSON.stringify(originalHighlights);

const thumbnailChanged = selectedFile !== null;


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

// Destructer for profile img
const {
    onChange : thumbnailOnChange,
    ...thumbnailRegister
} = register("thumbnail");

  // Handle file preview
const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    setSelectedFile(null);
    setPreview(course?.thumbnail || null);

    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Only JPG, JPEG and PNG files are allowed.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error("Maximum thumbnail size is 2 MB.");
    return;
  }
  
  setSelectedFile(file);

  if (preview?.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }

  setLoadingPreview(true);

  const newPreview = URL.createObjectURL(file);

  setTimeout(() => {
    setPreview(newPreview);
    setLoadingPreview(false);
  }, 300);
};


  // Highlights Functions 

  const addHighlight = () => {

    setHighlights([
      ...highlights,
      {
        en: "",
        hi: ""
      }
    ]);

  };

  const removeHighlight = (index) => {

    setHighlights(
      highlights.filter(
        (_, i) => i !== index
      )
    );

  };

  const updateHighlight = (
    index,
    field,
    value
  ) => {

    const updated = [...highlights];

    updated[index][field] = value;

    setHighlights(updated);

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

    // Highlights 
    formData.append("language", data.language || "");
    formData.append("difficulty_level", data.difficulty_level || "");

    highlights.forEach(
      (highlight, index) => {

        if (highlight.en.trim()) {

          formData.append(
            `highlights[${index}]`,
            highlight.en.trim()
          );

        }

        if (highlight.hi.trim()) {

          formData.append(
            `highlights_hi[${index}]`,
            highlight.hi.trim()
          );

        }

      }
    );

    // Append thumbnail if selected
    if (data.thumbnail && data.thumbnail[0]) {
      formData.append("thumbnail", data.thumbnail[0]);
    }


    try {
      setSaving(true);
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

        setTimeout(() => {
          navigate(COURSE_ROUTES.MY_COURSE);
        }, 800);
      } else {

        toast.error(result.message || "Update failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
    finally{
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

        <h5 className="mt-3 mb-1">Fetching Course Information...</h5>

        <small className="text-muted">
          Please wait while we fetch your course information.
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
              <h3>Edit <span>Course</span></h3>

              <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to=""><span>Edit Course</span></Link>

          </section>

          <Link to={COURSE_ROUTES.MY_COURSE} className="edit-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
          </Link>
      </div>


      <div className="dashboard-card my-4">                
        <form onSubmit={handleSubmit(onSubmit)}>


          {/* Thumbnail */}
          <div className="my-4">

            <label className="form-label"> 
              <FontAwesomeIcon icon={faUpload} className="icon" />
              Update Thumbnail</label>

            <small className="text-muted">Supported Formates : JPG, PNG, JPEG • Maximum size : 2 MB</small>

            <div className="mt-3 text-center position-relative">
              {loadingPreview ? (
                <div
                  className="spinner-border text-primary"
                  style={{ width: "3rem", height: "3rem" }}
                  role="status"
                ></div>
              ) : (
                <>
                  <p className="mb-2 fw-semibold text-secondary">
                    {selectedFile
                      ? "Selected Thumbnail"
                      : "Current Thumbnail"}
                  </p>

                  {/* Thumbnail img */}
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

                  {/* Show File Name */}
                  {selectedFile && (
                    <small className="text-success d-block mt-2">
                      Selected File: {selectedFile.name}
                    </small>
                  )}

                  {/* Remove  thumbnail button */}
                  {selectedFile && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"

                      onClick={() => {
                          if (preview?.startsWith("blob:")) {
                              URL.revokeObjectURL(preview);
                          }

                          setSelectedFile(null);

                          setPreview(course?.thumbnail || null);

                          setValue("thumbnail", null, {
                              shouldDirty: false,
                          });
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Remove Thumbnail
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="text-center">
              <input
              id="course_thumbnail"
                type="file"
                hidden
                accept="image/*"
                {...thumbnailRegister}
                onChange={(e) => {
                  thumbnailOnChange(e);
                  handleFileChange(e);
                }}
                className="form-control"
                disabled={saving}
              />
              <label
                  htmlFor="course_thumbnail"
                  className="btn btn-primary my-3"
              >
                <FontAwesomeIcon icon={faCamera} className="me-2"/>
                {selectedFile ? "Change Thumbnail" : "Choose Thumbnail"}
              </label> <br />
            </div>

          </div>

          {/* Title Eng*/}
          <div className="mb-4">
            <label className="form-label"> 
              <FontAwesomeIcon icon={faA} className="icon" />
              Course Title (English)
            </label>            
            <input
              {...register("title_en", { required: "Title is required",

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
                  course.id, // self id 
                  course.title, // self title
                  "Course Name" // lable Name
                ) })}
              className={`form-control ${errors.title_en && "is-invalid"}`}
              disabled={saving}
            />
            {errors.title_en && (
              <p className="invalid-feedback">{errors.title_en.message}</p>
            )}
          </div>

          {/* Title Hindi */}

          <div className="mb-4">
            <label className="form-label"> 
              <FontAwesomeIcon icon={faA} className="icon" />
              Course Title (Hindi)
            </label>              
            <input
              {...register("title_hi")}
              className={`form-control ${errors.title_hi && "is-invalid"}`}
              disabled={saving}
            />
            {errors.title_hi && (
              <p className="invalid-feedback">{errors.title_hi.message}</p>
            )}
          </div>


          {/* Description Eng */}
          <div className="mb-4">
              <label className="form-label">
                <FontAwesomeIcon icon={faFileEdit} className="icon" />
                Course Description (English)
              </label>            
              <textarea
                {...register("description_en")}
                className="form-control"
                rows={5}
                disabled={saving}
              />
          </div>

          {/* Description Hindi */}
          <div className="mb-4">
            <label className="form-label">                
              <FontAwesomeIcon icon={faFileEdit} className="icon" />
                Course Description (Hindi)
            </label>
            <textarea
              {...register("description_hi")}
              className="form-control"
              rows={5}
              disabled={saving}
            />
          </div>

          {/* Highlights */}          
          <label className="form-label mb-2">
            <FontAwesomeIcon icon={faStar} className="icon" />
            Course Highlights
          </label>

          <div className="box mb-4" style={{
            backgroundColor:'#ebf1f5',
            padding:'15px',
            borderRadius:'10px'
          }}>
            <div className="mb-4">

              {
                highlights.length === 0 ? (
                    <>
                    <div className="text-center py-2">

                      <FontAwesomeIcon 
                        icon={faStar}
                        className="text-warning mb-3"
                        size="2x"/>

                        <h6>No Highlights Added Yet</h6>

                        <p className="text-muted mb-3">
                          Add key leaning, outcomes or important features of this course.
                        </p>

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

                    </>
                ) : (
                      <>
                        {highlights.map(
                          (highlight, index) => (
          
                            <div
                              className="row mb-2"
                              key={index}
                            >
          
                            {/* Enter Highlight  */}
                            <div className="col-md-11">
                              <div className="row">
          
                                {/* English Highlights */}
                                <div className="col-md-6">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Highlight (English)"
                                    value={highlight.en}
                                    disabled={saving}
                                    onChange={(e) =>
                                      updateHighlight(
                                        index,
                                        "en",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
          
                                {/* Hindi Highlights */}
                                <div className="col-md-6">
          
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Highlight (Hindi)"
                                    value={highlight.hi}
                                    disabled={saving}
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
                              <FontAwesomeIcon icon={faPlus}  /> Add Another Highlights
                            </small>
                          </button>
                      </>
                )
              }



            </div>
          </div>

          {/* Category & Subcategory*/}
          <div className="row mb-4">

            {/* Category */}
            <div className="col-md-6">
              <label className="form-label">
                <FontAwesomeIcon icon={faFolderClosed} className="icon" />
                Category 
              </label>
              <select {...register("category_id")} disabled={saving} className="form-control">
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name?.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div className="col-md-6">
              <label className="form-label">
                <FontAwesomeIcon icon={faFolderTree} className="icon" />
                Subcategory 
              </label>
                <select {...register("subcategory_id")} disabled={saving} className="form-control">
                  <option value="">-- Select Subcategory --</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name?.en}
                    </option>
                  ))}
                </select>
            </div>
          </div>

          {/* Languages & Difficulty level*/}
          <div className="row mb-4">
            
            {/* Language */}
            <div className="col-md-6">
              <label className="form-label">
              <FontAwesomeIcon icon={faGlobe} className="icon" />
                Language 
              </label>

              <select
                {...register("language")}
                className="form-control"
                disabled={saving}
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
            </div>

            {/* Difficulty Level */}
            <div className="col-md-6">
                <label className="form-label">
                <FontAwesomeIcon icon={faChartSimple} className="icon" />
                  Difficulty Level 
                </label>

              <select
                {...register("difficulty_level")}
                className="form-control"
                disabled={saving}
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
            </div>
          </div>
            

          {/* Assign Teacher Only for Admin Access Role*/}

          {hasAnyRole(["moderator","admin","super_admin"]) 
            && (
                <div className="mb-3">
                  <label className="form-label">Teacher</label>
                  <select
                    {...register("teacher_id", { required: "Teacher is required" })}
                    className={`form-control ${errors.teacher_id && "is-invalid"}`}
                    disabled={saving}
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
            )}


          {/* Price & Status */}
          <div className=" row mb-4">

            {/* Price */}
            <div className="col-md-6">
              <label className="form-label">
                <FontAwesomeIcon icon={faIndianRupee} className="icon" />
                Course Price</label>            
              <input
                type="number"
                min={0}
                max={999999}
                step={1}
                disabled={saving}
                {...register("price")}
                className="form-control"
              />
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label className="form-label"> 
                <FontAwesomeIcon icon={faFlag} className="icon" />
                Course Status 
              </label>
              <select {...register("status")} disabled={saving} className="form-control">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn green-btn"
            disabled={ saving || isSubmitting || (!isDirty && !highlightsChanged && !thumbnailChanged)}
          >
            {saving ? (

              <>
                <span
                  className="spinner-border spinner-border-sm me-2 text-light"
                  role="status"
                />

                  <span className='text-light'>Saving Changes... </span>

                </>

                ) : (

                  <>
                  <FontAwesomeIcon icon={faFloppyDisk}/> Save Changes
                  </>

              )}
          </button>

          {/* Cancel  Button */}
          <button
            type="button"
            className="btn gray-btn mx-4"
            onClick={() => navigate(COURSE_ROUTES.MY_COURSE)}
          >
            Cancel
          </button>
        </form>
      </div>

    </>
  );
};

export default UpdateCourse;