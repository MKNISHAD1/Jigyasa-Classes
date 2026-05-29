import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../../hooks/useCategories';
import { useCourses } from '../../../hooks/useCourses';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faStar } from '@fortawesome/free-solid-svg-icons';

const CourseCardUi = () => {

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
                      to={`/course/${course.id}`}
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

    </>
  )
}

export default CourseCardUi