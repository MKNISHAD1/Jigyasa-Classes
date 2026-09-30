import React, { useEffect, useRef, useState } from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-regular-svg-icons'
import { faAngleLeft, faAngleRight, faClockRotateLeft, faClose, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import herocourses from '../../../assets/images/courses1.png'
import PageNotFound from '../../../assets/images/not-found.jpeg'
import { useTranslation } from 'react-i18next'
import { useCourses } from '../../../hooks/useCourses'
import { useCategories } from '../../../hooks/useCategories'
import { useSearchParams } from 'react-router-dom'
import { Offcanvas } from 'react-bootstrap'
import RenderFilterUi from '../../Common/CommonUI/RenderFilterUi'
import { PUBLIC_ROUTES } from '../../../constants/nevigation/routes'
import CourseCardUi from '../../Common/CommonUI/CourseCardUi'
import CourseDiscoverySectionUi from '../../Common/CommonUI/CourseDiscoverySectionUi'
import { toast } from 'react-toastify'

const AllCoursesUi = () => {

const { i18n } = useTranslation();
const { categories } = useCategories();
const { courses,loading } = useCourses({ status: "published" });
const [searchParams, setSearchParams] = useSearchParams();
const [sortBy, setSortBy] = useState( searchParams.get("sort") || "created_at" );
const [order, setOrder] = useState( searchParams.get("order") || "desc" );
const [search, setSearch] = useState("");

const categoryParam = searchParams.get("category");
const [selectedCategories, setSelectedCategories] = useState(() => {
    if (!categoryParam) {
        return [];
    }

    const categoryId = Number(categoryParam);
    return Number.isInteger(categoryId) && categoryId > 0
        ? [categoryId]
        : [];
});

const catalogMode = searchParams.get("view") === "catalog";
const coursesSectionRef = useRef(null);
const featuredCourses =[];


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


//Pagination 
const [currentPage, setCurrentPage] = useState(1);
const coursesPerPage = 9;

// Discovery Mode
const isDiscoveryMode =
    !catalogMode &&
    search.trim() === "" &&
    selectedCategories.length === 0 &&
    difficulty.length === 0;

// reset pagination
useEffect(() => {
    setCurrentPage(1);
}, [
    search,
    selectedCategories,
    difficulty,
    sortBy,
    order,
]);


// Smooth Scroll on Page change
const changePage = (page) => {
    setCurrentPage(page);

    coursesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};

// update parameters from url
useEffect(() => {
    const urlSort = searchParams.get("sort");
    const urlOrder = searchParams.get("order");

    if (urlSort) {
        setSortBy(urlSort);
    }

    if (urlOrder) {
        setOrder(urlOrder);
    }
}, [searchParams]);

// Update category filter from URL
useEffect(() => {
  const categoryParam = searchParams.get("category");

  if (!categoryParam) {
      setSelectedCategories([]);
      return;
  }

  const categoryId = Number(categoryParam);

  if (Number.isInteger(categoryId) && categoryId > 0) {
      setSelectedCategories([categoryId]);

      const category = categories.find(
          (item) => item.id === categoryId
      );

      if (category) {
          const categoryName =
              category.name?.[i18n.language] ??
              category.name?.en;

          // toast.success(`${categoryName} filter applied`);

          coursesSectionRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
          });
      }
  } else {
      setSelectedCategories([]);
  }
}, [searchParams, categories, i18n.language]);

// Freshly Added Lesson Section
const freshlyAddedCourses = [...courses]
    .sort(
        (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
    );

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

// Clear Filter
const handleClearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setDifficulty([]);

    setSortBy("created_at");
    setOrder("desc");

    setSearchParams({});
    handleFilterClose();

    coursesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};

//Sort and  Filter Locallly 
const filteredCourses = [...courses]
    //filtering
    .filter((course) => {

        const matchSearch =
            course.title?.en
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(course.category?.id);

        const matchDifficulty =
            difficulty.length === 0 ||
            difficulty.includes(course.difficulty_level);

        return (
            matchSearch &&
            matchCategory &&
            matchDifficulty
        );
    })
    //sorting
    .sort((a, b) => {

        let valueA = a?.[sortBy];
        let valueB = b?.[sortBy];

        if (
            sortBy === "created_at" ||
            sortBy === "updated_at" ||
            sortBy === "published_at"
        ) {
            valueA = valueA
                ? new Date(valueA).getTime()
                : 0;

            valueB = valueB
                ? new Date(valueB).getTime()
                : 0;
        }

        if (sortBy === "price") {
            valueA = Number(valueA || 0);
            valueB = Number(valueB || 0);
        }

        return order === "asc"
            ? valueA - valueB
            : valueB - valueA;
    });

//reset page and  pagination on user filter
const totalPages = Math.ceil(
    filteredCourses.length / coursesPerPage
);

const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
);

const courseFrom =
    filteredCourses.length === 0
        ? 0
        : (currentPage - 1) * coursesPerPage + 1;

const courseTo = Math.min(
    currentPage * coursesPerPage,
    filteredCourses.length
);

  return (
    <>

      {/* Header  */}
      <HeaderUi/>

      {/* Hero Section  */}
      <section className="Hero_Section" >
        <div className="container-fluid Hero_Body">
          <div className="row">

            {/* LEFT CONTENT */}
            <div className="col-lg-6 Hero_Content pb-2">

              <small className="Hero_Tag">
                Our Courses
              </small>

              <h1>
                Explore Our<span> Courses </span>
              </h1>

              <p>
                High Quality Courses designed by experts, Learn from expert instructor and prepare for your dream career.
              </p>


              <div className="Hero_Features">

                <div className="Feature_Item">
                  <FontAwesomeIcon icon={faClockRotateLeft} /> Updated Content
                </div>

                <div className="Feature_Item">
                  <FontAwesomeIcon icon={faUserGroup}/> Expert Faculty
                </div>


                <div className="Feature_Item">
                  <FontAwesomeIcon icon={faFile} /> Study Material
                </div>

              </div>

            </div>

            {/* RIGHT IMAGE */}
            <div className="col-lg-6 Hero_Img text-center">
              <img
                src={herocourses}
                alt="Student"
                className="Student_Img"
              />

            </div>

          </div>

        </div>
      </section>

      {/* Filter and Courses Section */}
      <section className="All_Courses_Section"> 
        <div className="container-fluid" ref={coursesSectionRef}>

          {/* Search Bar for Mobile */}
          <div className="Mobile_Search d-lg-none mb-3" >
            <div className="input-group">

              <span className="Input_Group_Text">
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

          {/* Mobile Filter + Sorting in Mobile */}
          <div className="Mobile_Actions d-lg-none mb-3">

            <button
              // className="btn btn-outline-primary"
              className="Primary_Button"
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
          
          {/* Desktop Filter and Result */}
          <div className="row">

            {/* LEFT SIDE FILTERS */}
            <div className="col-lg-3  d-none d-lg-block">
              <div className="Filter_Sidebar shadow ">
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
                  handleClearFilters={handleClearFilters}
                  />
              </div>
            </div>

            {/* RIGHT SIDE COURSES*/}
            <div className="col-lg-9">

              {/* Course Loading */}
              {loading && (
                <div className="m-4">
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ minHeight: "300px" }}
                  >
                    <div
                      className="spinner-border text-primary "
                      style={{ width: "3rem", height: "3rem" }}
                    />

                    <h5 className="mt-3 mb-1">Loading Courses...</h5>

                    <small className="text-muted">
                      Please wait while we fetch courses..
                    </small>
                  </div>
                </div>          
              )}

              {/* Discovery Mode No Active Filter and Empty Search */}
              {isDiscoveryMode && !loading && (
                <>
                  <CourseDiscoverySectionUi
                      title="Featured Courses"
                      subtitle="Handpicked courses to help you learn and grow."
                      courses={featuredCourses}
                      viewAllLink={PUBLIC_ROUTES.COURSES}
                      />

                  <CourseDiscoverySectionUi
                      title="Newly <span> Added Courses </span>"
                      subtitle="Explore the latest courses added to Jigyasa Classes."
                      courses={freshlyAddedCourses}
                      viewAllLink={`${PUBLIC_ROUTES.COURSES}?view=catalog&sort=created_at&order=desc`}
                  />
                </>
              )}

              {/* Catalog Mode Filter is active */}
              {!isDiscoveryMode && !loading && (
                <>
                  {/* Result Count and Sort */}
                  <div className="Courses_Topbar">

                    {/* Result Count */}
                    <p className="Courses_Count">
                      Showing matching <strong>{filteredCourses.length}</strong>  course
                      {filteredCourses.length !== 1 ? "s" : ""} 
                    </p>
                    
                    {/* Sort Button Desktop */}
                    <select
                      className="form-select d-none d-lg-block"
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
                  </div>
                  
                  {/* Courses Card Result */}
                  <div className="row g-4">

                    {/* Filter Not  Match */}
                    {!loading && filteredCourses.length === 0 && (
                      <div className="Empty_Courses text-center py-5">
                        <img
                          src={PageNotFound}
                          alt="No courses found"
                          className="Empty_Img"
                        />

                        <h4>No Courses Match Your Filters</h4>

                        <p>
                          Try another search or clear your filters to see all courses.
                        </p>

                        <button
                          className="btn blue-btn"
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}

                    {/* Filter Match Courses */}
                    {!loading &&
                      paginatedCourses.map((course) => (
                        <div className="col-12 col-sm-6 col-md-4 col-xl-4 Course_List" key={course.id}>
                          <CourseCardUi course={course} />
                        </div>
                      ))
                    }

                    {/* Pagination control */}
                    {!loading && filteredCourses.length > 0 && (
                      <div className="Course_Pagination">

                        <span className="Course_Pagination_Info">
                            Showing{" "}
                            <strong>{courseFrom} - {courseTo}</strong>{" "}
                            of{" "}
                            <strong>{filteredCourses.length}</strong>{" "}
                            Course{filteredCourses.length !==1 ? "s":""}
                        </span>

                        {totalPages > 1 && (
                            <div className="Course_Pagination_Controls d-flex align-items-center">

                                <button
                                    type="button"
                                    className="Primary_Button"
                                    disabled={currentPage === 1}
                                    onClick={() => changePage(currentPage - 1)}
                                    aria-label="Previous page"
                                >
                                  <small className="d-none d-md-block mx-2"> Previous Page</small>
                                  <FontAwesomeIcon icon={faAngleLeft} className='d-block d-md-none Icon'/>
                                </button>

                                <small className="Course_Pagination_Page mx-2">
                                    {currentPage} / {totalPages}
                                </small>

                                <button
                                    type="button"
                                    className="Primary_Button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => changePage(currentPage + 1)}
                                    aria-label="Next page"
                                >
                                  <small className="d-none d-md-block mx-2"> Next Page</small>
                                  <FontAwesomeIcon icon={faAngleRight} className='d-block d-md-none Icon' />
                                </button>

                            </div>
                        )}

                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Offcanvas for filter on Mobile  */}
          <Offcanvas
            show={showFilter}
            onHide={handleFilterClose}
            placement="start"
          >
            {/* Header Section*/}
            <Offcanvas.Header className="Offcanvas_Header d-flex align-items-center">

              <h3 className="Offcanvas_Header_Title"><span>Filter</span> Course</h3>

              {/* Canvas Close Button */}
              <button className="Offcanvas_Close_Btn" onClick={handleFilterClose}>
                  <FontAwesomeIcon icon={faClose} className='Offcanvas_Close_Btn_Icon'/>
              </button>

            </Offcanvas.Header>

            <Offcanvas.Body>
              <div className="Filter_Sidebar">
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
                  handleClearFilters={handleClearFilters}
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