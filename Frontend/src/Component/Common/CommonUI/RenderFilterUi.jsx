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
  setOrder,
  handleClearFilters,
}) => {
  

    
  return (
    <>
      <h5 className='text-center Filter_Group fw-semibold d-none d-lg-block'> <span>Filter</span> Courses</h5>
        {/* Search */}
        <div className="Filter_Group">
          <label className='Filter_Group_Title'>Search</label>

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
        <div className="Filter_Group">
          <label className='Filter_Group_Title'>Categories</label>

            {categories.map((category) => (
              <label
                  htmlFor={`category-${category.id}`}
                  className="form-check Filter_Item"
              >
                <input
                    id={`category-${category.id}`}
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() =>
                        handleCategoryChange(category.id)
                    }
                />

                <span className="form-check-label">
                    {category?.name?.[i18n.language] ??
                        category?.name?.en}
                </span>
              </label>
            ))}
        
        </div>

        {/* Difficulty Level  */}
        <div className="Filter_Group">
          <label className="Filter_Group_Title"> Difficulty </label>

          {difficultyLevels.map((level) => (
              <label
                key={level.value}
                htmlFor={`difficulty-${level.value}`}
                className="form-check Filter_Item"
              >
                <input
                  id={`difficulty-${level.value}`}
                  type="checkbox"
                  className="form-check-input"
                  checked={difficulty.includes(level.value)}
                  onChange={() =>
                      handleDifficultyChange(level.value)
                  }
                />

                <span className="form-check-label">
                    {level.label}
                </span>
              </label>
          ))}
        </div>

        {/* Clear Filter */}
        <button
          className="Primary_Button w-100 mt-4"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
    </>
  )
}

export default RenderFilterUi;