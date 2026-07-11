import React, { useState } from 'react'

const RenderFilterUi = ({
  categories,
  i18n,
  search,
  setSearch,
  selectedCategories,
  handleCategoryChange,
  difficultyLevels,
  difficulty,
  handleDifficultyChange,
  setSelectedCategories,
  setDifficulty,
  setSortBy,
  setOrder
}) => {
  

    
  return (
    <>
            <h5 className='text-center  filter-group fw-semibold'>Filter Courses</h5>
              {/* Search */}
              <div className="filter-group">
                <label className='mb-2 fw-semibold'>Search</label>

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


              {/* Categories */}
              <div className="filter-group">
                <label className='mb-2 fw-semibold'>Categories</label>

              <div className="category-filter-list">
                {categories.map((category) => (
                  <div
                    className="form-check "
                    key={category.id}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedCategories.includes(
                        category.id
                      )}
                      onChange={() =>
                        handleCategoryChange(category.id)
                      }
                    />

                    <label className="form-check-label">
                      {category?.name?.[i18n.language] ??
                        category?.name?.en}
                    </label>
                  </div>
                ))}
              </div>
              
              </div>
              {/* Difficulty Level  */}

              
              <div className="filter-group">
                <label className="mb-2 fw-semibold">
                  Difficulty
                </label>

                {difficultyLevels.map((level) => (
                  <div
                    className="form-check"
                    key={level.value}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={difficulty.includes(level.value)}
                      onChange={() =>
                        handleDifficultyChange(level.value)
                      }
                    />

                    <label className="form-check-label">
                      {level.label}
                    </label>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  setSearch("");
                  setSelectedCategories([]);
                  setDifficulty([]);
                  setSortBy("created_at");
                  setOrder("desc");
                }}
              >
                Clear Filters
              </button>
    </>
  )
}

export default RenderFilterUi;