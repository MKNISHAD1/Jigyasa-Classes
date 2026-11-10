import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation("allcourses");
  
  const allCategoriesSelected =
    categories.length > 0 &&
    selectedCategories.length === categories.length;

  const handleSelectAllCategories = () => {
    if (allCategoriesSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category.id));
    }
  };

  const allDifficultySelected =
    difficultyLevels.length > 0 &&
    difficulty.length === difficultyLevels.length;

  const handleSelectAllDifficulty = () => {
    if (allDifficultySelected) {
      setDifficulty([]);
    } else {
      setDifficulty(difficultyLevels.map((level) => level.value));
    }
  };
    
  return (
    <>
      <h5 className='text-center Filter_Group fw-semibold d-none d-lg-block'>
         <span>{t("filters.title")}</span> {t("filters.course")}
      </h5>
        {/* Search */}
        <div className="Filter_Group">
          <label className='Filter_Group_Title'>{t("filters.search")}</label>

          <input
            type="text"
            className="form-control"
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Categories */}
        <div className="Filter_Group">
          <label className='Filter_Group_Title'>{t("filters.categories")}</label>

          {/* Select All checkbox  */}
          <label className="form-check Filter_Item">
            <input
              type="checkbox"
              className="form-check-input"
              checked={allCategoriesSelected}
              onChange={handleSelectAllCategories}
            />

            <span className="form-check-label">
              {t("filters.selectAll")}
            </span>
          </label>

          {/* Categories check box */}
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
          <label className="Filter_Group_Title"> {t("filters.difficulty")} </label>

          {/* Select All checkbox  */}
          <label className="form-check Filter_Item">
            <input
              type="checkbox"
              className="form-check-input"
              checked={allDifficultySelected}
              onChange={handleSelectAllDifficulty}
            />

            <span className="form-check-label">
              {t("filters.selectAll")}
            </span>
          </label>

          {/* Difficulty check box */}
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
          {t("filters.clear")}
        </button>
    </>
  )
}

export default RenderFilterUi;