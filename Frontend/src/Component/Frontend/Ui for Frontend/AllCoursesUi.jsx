import React, { useEffect, useState } from 'react'
import HeaderUi from '../../Common/CommonUI/HeaderUi'
import FooterUi from '../../Common/CommonUI/FooterUi'
import PageHero from '../../Common/CommonUI/PageHeroUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faUser } from '@fortawesome/free-regular-svg-icons'
import { faBook, faBookOpen, faBookOpenReader, faCheck, faCheckSquare, faCheckToSlot, faClockRotateLeft, faDoorOpen, faStar, faTimeline, faTimes, faUserAltSlash, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons'
import { FaCalendarTimes, FaTimesCircle } from 'react-icons/fa'
import hat from '../../../assets/images/aboutpage3.png';
import InfoItemUi from '../../Common/CommonUI/InfoItemUi'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../../Common/http'
import { useCourses } from '../../../hooks/useCourses'
import { useCategories } from '../../../hooks/useCategories'
import { Link } from 'react-router-dom'

const AllCoursesUi = () => {

const { i18n } = useTranslation();

const {
  categories,
  loading: loadingCategories,
} = useCategories();

const [selectedCategory, setSelectedCategory] = useState(null);
const [sortBy, setSortBy] = useState("created_at");
const [order, setOrder] = useState("desc");

const {
  courses,
  loading,
} = useCourses({
  status: "published",
  categoryId: selectedCategory,
  sortBy,
  order,
});



  return (
    <>

{/* Header  */}
<HeaderUi/>

{/* Courses Hero Section  */}
<div className="Courses-Hero p-4">
    <div className="row">
        <div className="col-md-6">
        <PageHero
            tag="Our Courses"
            title="Explore Our"
            highlight="Courses"
            linePosition="afterDescription"
            description="
            High quality courses designed by experts faculty <br> to help you crack your dream exam."
          />

          <br />

        <div className="d-flex">
            <InfoItemUi
                icon={faUser}
                title="Expert Faculty"
                className="p-2"
            />

            <InfoItemUi 
                icon={faClockRotateLeft}
                title="Updated Content"
                className="p-2"
            />

            <InfoItemUi 
                icon={faDoorOpen}
                title="Lifetime Access"
                className="p-2"
            />
        </div>
        </div>

        <div className="col-md-6 text-center">
            <img src={hat} height="100%" width="300px" />
        </div>

    </div>
</div>

{/* CATEGORY STRIP */}
<section className="course-category-strip">
  <div className="container">

    <div className="category-strip-wrapper">

      {/* LEFT SIDE */}

<div className="category-list">

  {/* ALL COURSES */}
  <button
    className={`category-btn ${selectedCategory === null ? "active" : ""}`}
    onClick={() => setSelectedCategory(null)}
  >
    <i className="fa-solid fa-layer-group"></i>
    All Courses
  </button>


  {/* DYNAMIC CATEGORIES */}
  {!loadingCategories &&
    categories.map((category) => (
      <button
        key={category.id}
        className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
        onClick={() => setSelectedCategory(category.id)}
      >
        <i className="fa-solid fa-book"></i>

        {category?.name?.[i18n.language] ||
          category?.name?.en}
      </button>
    ))}

</div>


      {/* RIGHT SIDE */}
      <div className="sort-wrapper">
<select
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
  }} >
    <option value="newest">Newest</option>
<option value="price-low">Price: Low to High</option>
<option value="price-high">Price: High to Low</option>
  </select>
      </div>

    </div>

  </div>
</section>

{/* Courses Card  */}
    <section className="Latest_Course_Section">
      <div className="row g-4">

        {loading && (
          <div className="text-center py-5">
            <p>Loading courses...</p>
          </div>
        )}

        {!loading &&
          courses.map((course) => (
            <div className="col-12 col-sm-6 col-lg-4" key={course.id}>
              <div className="card shadow h-100 course-card">
                
                <img
                  src={course.thumbnail ?? "/default-course.png"}
                  className="course-img"
                  alt={course.title?.en}
                />

                  <div className="card-header d-flex flex-row mt-auto">
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

                <div className="card-body d-flex flex-column">
                  <h6 className="course-title">
                    {course.title?.[i18n.language] ?? course.title?.en}
                  </h6>

                  <p className="course-desc small flex-grow-1 mb-2">
                    {course.description?.[i18n.language] ??
                      course.description?.en}
                  </p>
                  <div className="lectures ">
                    <div className="rating">
                       <span>5</span> &nbsp;<FontAwesomeIcon icon={faStar} className='star'/>
                    </div>
                    <div className="book">
                    <FontAwesomeIcon icon={faBook} className='book-icon'/>  &nbsp;
                    {course.lessons_count} <span>Lessons</span><br />
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-centers price-section">
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
          ))}
      </div>

        {/* All Courses Button */}
        <div className="text-center mt-5">
          <Link to="/courses" className="view-course-btn py-2 px-4">
            All Courses
          </Link>
        </div>
    </section>



{/* footer  */}
<FooterUi/>
    </>
  )
}

export default AllCoursesUi