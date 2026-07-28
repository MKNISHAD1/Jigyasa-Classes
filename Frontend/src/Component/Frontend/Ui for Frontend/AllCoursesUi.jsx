import React, { useEffect, useState } from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import PageHero from '../../Common/CommonUI/PageHeroUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faClock, faFile, faUser } from '@fortawesome/free-regular-svg-icons'
import { faArrowRight, faBook, faBookOpen, faBookOpenReader, faCheck, faCheckSquare, faCheckToSlot, faClockRotateLeft, faDesktop, faDoorOpen, faStar, faTimeline, faTimes, faUserAltSlash, faUserCircle, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons'
import { FaCalendarTimes, FaTimesCircle } from 'react-icons/fa'
import hat from '../../../assets/images/aboutpage3.png';
import bgImage from '../../../assets/images/herobg1.png'
import herocourses from '../../../assets/images/courses.jpeg'
import PageNotFound from '../../../assets/images/not-found.jpeg'
import InfoItemUi from '../../Common/CommonUI/InfoItemUi'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../../Common/http'
import { useCourses } from '../../../hooks/useCourses'
import { useCategories } from '../../../hooks/useCategories'
import { Link } from 'react-router-dom'
import { Offcanvas } from 'react-bootstrap'
import RenderFilterUi from '../../Common/CommonUI/RenderFilterUi'
import { PUBLIC_ROUTES } from '../../../constants/nevigation/routes'

const AllCoursesUi = () => {


const { i18n } = useTranslation();

const {categories,loading: loadingCategories,} = useCategories();

const [selectedCategory, setSelectedCategory] = useState(null);
const [sortBy, setSortBy] = useState("created_at");
const [order, setOrder] = useState("desc");

const [search, setSearch] = useState("");
const [selectedCategories, setSelectedCategories] = useState([]);
const [viewMode, setViewMode] = useState("grid");

// Offcanvas Filters
const [showFilter, setShowFilter] = useState(false);
const handleFilterClose = () =>setShowFilter(false);
const handleFilterShow = () =>setShowFilter(true);

const [difficulty, setDifficulty] = useState([]);
const difficultyLevels = [
  {
    value: "Beginner",
    label: "Beginner",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
  },
  {
    value: "Advanced",
    label: "Advanced",
  },
  {
    value: "All Levels",
    label: "All Levels",
  },
];

const {
  courses,
  loading,
} = useCourses({
  status: "published",
  categoryId: selectedCategory,
  sortBy,
  order,
});

//  force grid on mobile 
useEffect(() => {
  if (window.innerWidth < 768) {
    setViewMode("grid");
  }
}, []);


// Category  Change handler

const handleCategoryChange = (id) => {
  setSelectedCategories((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};

// Difficulty change handler

const handleDifficultyChange = (level) => {
  setDifficulty((prev) =>
    prev.includes(level)
      ? prev.filter((item) => item !== level)
      : [...prev, level]
  );
};

// Filter Locallly 

const filteredCourses =
  courses.filter((course) => {

    const matchSearch =
      course.title?.en
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(
        course.category?.id
      );

    const matchDifficulty =
    difficulty.length === 0 ||
    difficulty.includes(
      course.difficulty_level
    );


    return (
      matchSearch &&
      matchCategory &&
      matchDifficulty
    );
  });

  return (
    <>

{/* Header  */}
<HeaderUi/>

    {/* Hero Section  */}
    <section className="course-hero-section">
      <div className="container-fluid hero-body">
        <div className="row">

          {/* LEFT CONTENT */}
          <div className="col-lg-6 hero-content pb-2">

            <small className="hero-tag">
              OUR COURSES
            </small>

            <h1>
              Explore Our<span> Courses </span>
            </h1>

            <p>
              High Quality Courses designed by experts, Learn from expert instructor and prepare for your dream career.
            </p>

            <div className="hero-features">

              <div className="feature-item">
                <FontAwesomeIcon icon={faClockRotateLeft} /> Updated Content
              </div>

              <div className="feature-item">
                <FontAwesomeIcon icon={faUserGroup}/> Expert Faculty
              </div>


              <div className="feature-item">
                <FontAwesomeIcon icon={faFile} /> Study Material
              </div>

            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="col-lg-6 hero-img text-center">
            <img
              src={herocourses}
              alt="Courses"
              className="courses-img"
            />

          </div>

        </div>

      </div>
    </section>



    <section className="all-courses-section"> 
      <div className="container-fluid">

      {/* Search Bar for Mobile */}
      <div className="mobile-search d-lg-none mb-3">
        <div className="input-group">

          <span className="input-group-text">
            <i className="fa-solid fa-search"></i>
          </span>

          <input
            type="text"
            className="form-control"
            placeholder="Search courses..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>
      </div>

      {/* Filter and Sorting in Mobile */}

      <div className="mobile-actions d-lg-none mb-3">

        <button
          className="btn btn-outline-primary"
          onClick={handleFilterShow}
        >
          <i className="fa-solid fa-filter me-2"></i>
          Filter
        </button>

        <select
          className="form-select"
          onChange={(e) => {
            const value = e.target.value;

            if (value === "newest") {
              setSortBy("created_at");
              setOrder("desc");
            }

            if (value === "price-low") {
              setSortBy("price");
              setOrder("asc");
            }

            if (value === "price-high") {
              setSortBy("price");
              setOrder("desc");
            }
          }}
        >
          <option value="newest">Newest</option>
          <option value="price-low">
            Price: Low to High
          </option>
          <option value="price-high">
            Price: High to Low
          </option>
        </select>

      </div>


        <div className="row">

          {/* LEFT FILTERS */}
          <div className="col-lg-3  d-none d-lg-block">
            <div className="filter-sidebar shadow ">
              <RenderFilterUi 
                categories={categories}
                i18n={i18n}
                search={search}
                setSearch={setSearch}
                selectedCategories={selectedCategories}
                handleCategoryChange={handleCategoryChange}
                difficultyLevels={difficultyLevels}
                difficulty={difficulty}
                handleDifficultyChange={handleDifficultyChange}
                setSelectedCategories={setSelectedCategories}
                setDifficulty={setDifficulty}
                setSortBy={setSortBy}
                setOrder={setOrder}
                />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-9">

            <div className="courses-topbar">

              <p className="courses-count">
                Showing {filteredCourses.length} course
                {filteredCourses.length !== 1 ? "s" : ""} 
              </p>

              <select
                className="form-select sort-select d-none d-lg-block"
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "newest") {
                    setSortBy("created_at");
                    setOrder("desc");
                  }

                  if (value === "price-low") {
                    setSortBy("price");
                    setOrder("asc");
                  }

                  if (value === "price-high") {
                    setSortBy("price");
                    setOrder("desc");
                  }
                }}
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>


              {/* Change View  */}
              <div className="view-buttons d-none d-lg-flex gap-2">

                <button
                  className={`btn ${
                    viewMode === "grid"
                      ? "btn-primary"
                      : "btn-light"
                  }`}
                  onClick={() =>
                    setViewMode("grid")
                  }
                >
                  <i className="fa-solid fa-grip"></i>
                </button>

                <button
                  className={`btn ${
                    viewMode === "list"
                      ? "btn-primary"
                      : "btn-light"
                  }`}
                  onClick={() =>
                    setViewMode("list")
                  }
                >
                  <i className="fa-solid fa-list"></i>
                </button>

              </div>
            </div>


            <div className="row g-4">
              {/* Courses Card  */}
              <section className="Latest_Course_Section">
                <div className="row g-4">

                  {loading && (
                    <div className="text-center py-5">
                      <p>Loading courses...</p>
                    </div>
                  )}

                  {/* Filter Not  Match */}
                  {!loading && filteredCourses.length === 0 && (
                    <div className="empty-courses text-center py-5">
                      <img
                        src={PageNotFound}
                        alt="No courses found"
                        className="empty-img"
                      />

                      <h4>No Courses Match Your Filters</h4>

                      <p>
                        Try another search or clear your filters to see all courses.
                      </p>

                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSearch("");
                          setSelectedCategories([]);
                          setDifficulty([]);
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* Courses */}
                  {!loading &&
                    filteredCourses.map((course) => (
                      viewMode === "grid" ? (
                        <div className="col-12 col-md-6 col-xl-4" key={course.id}
                        
                        >
                        <div className="card shadow h-100 course-card ">
  
                          <img
                            src={course.thumbnail ?? "/default-course.png"}
                            className="course-img"
                            alt={course.title?.en}
                            />

                          <div className="card-header">
                            <h6 className="course-title">
                            {course.title?.[i18n.language] ?? course.title?.en}
                          </h6>
                          </div>
                          <div className="container d-flex flex-row">
                            <img
                              src={course.teacher.profile_pic ?? "/default-course.png"}
                              className="teacher-img"
                              alt={course.teacher.profile_pic?.en}
                            />
                            <h6 className="teacher-name">
                              {course.teacher.name}
                            </h6>                                    
                            <div className="ms-auto"> 
                              <Link className='category-button' to="#" >
                                {course.category?.name?.[i18n.language] ??
                                  course.category?.name?.en}
                              </Link>
                            </div>
                          </div>

                          <div className="card-body d-flex flex-column h-100">

                            {/* <p className="course-desc small flex-grow-1 mb-2">
                              {course.description?.[i18n.language] ??
                              course.description?.en}
                              </p> */}

                            <div className="course-meta">
                              <span>
                                <FontAwesomeIcon icon={faBook} className='icon'/> {course.lessons_count || 0} Lessons
                              </span>

                              {/* Future Data */}
                              <span><FontAwesomeIcon icon={faClock} className='icon'/> 18 Hours</span> <br />
                              {/* <span><FontAwesomeIcon icon={faStar}/> 4.8</span>
                              <span><FontAwesomeIcon icon={faUserGroup}/> 245</span> */}

                            </div>
                            <div className="d-flex card-footer justify-content-between align-items-centers price-section">
                              <span className="fw-bold text-success price">
                                {course.price ? `₹${course.price}` : "Free"} 
                              </span>

                              <Link
                                to={PUBLIC_ROUTES.COURSE_VIEW
                                    .replace(":id",course.id)
                                    .replace(":title", course.title?.en)
                                  } 
                                // to={`/CourseView/${course.id}/${course.title?.en}`}
                                className="view-course-btn"
                                >
                                View Course 
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                  ):(
                    <div className="container-fluid list-view-card">
                      <div className="row g-0" key={course.id}>
                        <div className="col-md-4">
                          <img
                            src={course.thumbnail ?? "/default-course.png"}
                            className="course-img"
                            alt={course.title?.en}
                            />
                        </div>
                        <div className="col-md-8">
                            <div className="card-body">
                              <h6 className="course-title">
                                {course.title?.[i18n.language] ?? course.title?.en}
                              </h6>

                              <Link className='category-button' to="#" >
                                  {course.category?.name?.[i18n.language] ??
                                    course.category?.name?.en}
                                </Link>

                              <div className="d-flex mt-2">
                                <img
                                  src={course.teacher.profile_pic ?? "/default-course.png"}
                                  className="teacher-img"
                                  alt={course.teacher.profile_pic?.en}
                                  />
                                <h6 className="teacher-name">
                                  {course.teacher.name}
                                </h6>                                    
                              </div>
                        
                            </div>
                            <div className="card-body d-flex flex-column h-100">
                            

                            {/* <p className="course-desc small flex-grow-1 mb-2">
                              {course.description?.[i18n.language] ??
                              course.description?.en}
                              </p> */}

                            <div className="course-meta">
                              <span>
                                <FontAwesomeIcon icon={faBook} className='icon'/> 42 Lessons
                              </span>

                              {/* Future Data */}
                              <span><FontAwesomeIcon icon={faClock} className='icon'/> 18 Hours</span> <br />
                              {/* <span><FontAwesomeIcon icon={faStar}/> 4.8</span>
                              <span><FontAwesomeIcon icon={faUserGroup}/> 245</span> */}

                            </div>
                            <div className="d-flex align-items-centers price-section">
                              <span className="fw-bold text-success price">
                                {course.price ? `₹${course.price}` : "Free"} 
                              </span>

                              <Link
                                to={`/CourseView/${course.id}/${course.title?.en}`}
                                className="view-course-btn"
                                >
                                View Course 
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )
                    ))}
                    </div>
                    
              </section>
            </div>

          </div>

        </div>

          {/* Offcanvas for filter on Mobile  */}
          <Offcanvas
            show={showFilter}
            onHide={handleFilterClose}
            placement="start"
          >
            <Offcanvas.Header closeButton>
            </Offcanvas.Header>

            <Offcanvas.Body>
              <div className="filter-sidebar">
                <RenderFilterUi
                  categories={categories}
                  i18n={i18n}
                  search={search}
                  setSearch={setSearch}
                  selectedCategories={selectedCategories}
                  handleCategoryChange={handleCategoryChange}
                  difficultyLevels={difficultyLevels}
                  difficulty={difficulty}
                  handleDifficultyChange={handleDifficultyChange}
                  setSelectedCategories={setSelectedCategories}
                  setDifficulty={setDifficulty}
                  setSortBy={setSortBy}
                  setOrder={setOrder}
                />
              </div>
            </Offcanvas.Body>
          </Offcanvas>
      </div>
    </section>



{/* footer  */}
<FooterUi/>
    </>
  )
}

export default AllCoursesUi