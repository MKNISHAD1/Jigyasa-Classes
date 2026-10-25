import React, { useContext, useEffect, useState } from "react";
import { apiUrl, token } from "../Common/http";
import { toast } from "react-toastify";
import { Accordion } from "react-bootstrap";
import { DASHBOARD_ROUTES } from "../../constants/nevigation/routes";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faFolderTree, faMagnifyingGlass, faPen, faPlug, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialogBoxUi from "../Common/CommonUI/ConfirmationDialogBoxUi";
import { AuthContext } from "./context/Auth";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Editing mode
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingSub, setIsEditingSub] = useState(false);

  // Form data
  const [categoryForm, setCategoryForm] = useState({ id: null, name_en: "", name_hi: "" });
  const [subForm, setSubForm] = useState({ id: null, category_id: "", name_en: "", name_hi: "" });
  const [formErrors, setFormErrors] = useState({});

  // duplicate check and errors
  const normalizeName = (value) => value.trim().toLocaleLowerCase();
  const getNameErrors = (form, type, editing) => {
    const errors = {};
    const currentId = form.id;

    if (!form.name_en.trim()) {
      errors.name_en = "English name is required.";
    }

    if (!form.name_hi.trim()) {
      errors.name_hi = "Hindi name is required.";
    }

    if (type === "category") {
      const duplicateEn = categories.some(
        (cat) =>
          (!editing || cat.id !== currentId) &&
          normalizeName(cat.name.en) === normalizeName(form.name_en)
      );

      const duplicateHi = categories.some(
        (cat) =>
          (!editing || cat.id !== currentId) &&
          normalizeName(cat.name.hi) === normalizeName(form.name_hi)
      );

      if (form.name_en.trim() && duplicateEn) {
        errors.name_en = "This English category name already exists.";
      }

      if (form.name_hi.trim() && duplicateHi) {
        errors.name_hi = "This Hindi category name already exists.";
      }
    } else {
      const parent = categories.find(
        (cat) => String(cat.id) === String(form.category_id)
      );

      const subcategories = parent?.subcategories ?? [];

      const duplicateEn = subcategories.some(
        (sub) =>
          (!editing || sub.id !== currentId) &&
          normalizeName(sub.name.en) === normalizeName(form.name_en)
      );

      const duplicateHi = subcategories.some(
        (sub) =>
          (!editing || sub.id !== currentId) &&
          normalizeName(sub.name.hi) === normalizeName(form.name_hi)
      );

      if (form.name_en.trim() && duplicateEn) {
        errors.name_en = "This English subcategory name already exists in this category.";
      }

      if (form.name_hi.trim() && duplicateHi) {
        errors.name_hi = "This Hindi subcategory name already exists in this category.";
      }
    }

    return errors;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Check Role for Delete Action
  const isAdmin = user?.roles?.some((role) =>
    ["admin","super_admin"].includes(
      typeof role === "string" ? role : role.name
    )
  );

  // Load categories
  const loadCategories = async (initial = false) => {
    try {
      if (initial) setInitialLoading(true);

      const res = await fetch(`${apiUrl}categories`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(data.categories);
    } catch (err) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      if (initial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(true);
  }, []);

  // -----------------------------------
  // CATEGORY ACTIONS
  // -----------------------------------
  const openAddCategoryModal = () => {
    setIsEditingCategory(false);
    setCategoryForm({ id: null, name_en: "", name_hi: "" });
    setShowCategoryModal(true);
    setFormErrors({});
  };

  const openEditCategoryModal = (cat) => {
    setIsEditingCategory(true);
    setCategoryForm({
      id: cat.id,
      name_en: cat.name.en,
      name_hi: cat.name.hi,
    });
    setShowCategoryModal(true);
    setFormErrors({});

  };

  const submitCategory = async () => {

    const errors = getNameErrors(
      categoryForm,
      "category",
      isEditingCategory
    );

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const url = isEditingCategory
        ? `${apiUrl}category/update/${categoryForm.id}`
        : `${apiUrl}category/create`;

      const res = await fetch(url, {
        method: isEditingCategory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${token()}`,
        },
        body: JSON.stringify(categoryForm),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        if (data.errors) {
          setFormErrors((prev) => ({ ...prev, ...Object.fromEntries(
            Object.entries(data.errors).map(([key, messages]) => [
              key,
              messages[0],
            ])
          ) }));
        }

        toast.error(data.message || "Please correct the validation errors.");
        return;
      }

      // Success
      setFormErrors({});
      setShowCategoryModal(false);

      toast.success(data.message || "Category saved successfully.");
      await loadCategories();

    } catch (error) {
      toast.error("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // SUBCATEGORY ACTIONS
  // -----------------------------------

  const openAddSubModal = (category_id) => {
    setIsEditingSub(false);
    setSubForm({ id: null, category_id, name_en: "", name_hi: "" });
    setShowSubModal(true);
    setFormErrors({});

  };

  const openEditSubModal = (sub, category_id) => {
    setIsEditingSub(true);
    setSubForm({
      id: sub.id,
      category_id,
      name_en: sub.name.en,
      name_hi: sub.name.hi,
    });
    setShowSubModal(true);
    setFormErrors({});

  };

  const submitSubcategory = async () => {
    const errors = getNameErrors(
      subForm,
      "subcategory",
      isEditingSub
    );

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const url = isEditingSub
        ? `${apiUrl}subcategory/update/${subForm.id}`
        : `${apiUrl}subcategory/create`;

      const res = await fetch(url, {
        method: isEditingSub ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(subForm),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        if (data.errors) {
          setFormErrors((prev) => ({ ...prev, ...Object.fromEntries(
            Object.entries(data.errors).map(([key, messages]) => [
              key,
              messages[0],
            ])
          ) }));
        }

        toast.error(data.message || "Please correct the validation errors.");
        return;
      }

      // Success
      setFormErrors({});
      setShowSubModal(false);

      toast.success(data.message || "Subcategory saved successfully.");
      await loadCategories();

    } catch (error) {
      toast.error("Error saving subcategory");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // Delete ACTIONS
  // -----------------------------------

  // Open delete confirmation
  const openDeleteDialog = (type, item) => {
    setSelectedDelete({ type, item });
    setDeleteOpen(true);
  };

  // Delete category or subcategory
  const handleDelete = async () => {
    if (!selectedDelete) return;

    const { type, item } = selectedDelete;

    const isCategory = type === "category";

    const url = isCategory
      ? `${apiUrl}category/delete/${item.id}`
      : `${apiUrl}subcategory/delete/${item.id}`;

    try {
      setLoadingDelete(true);

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        toast.error(data.message || `Failed to delete ${type}`);
        return;
      }

      toast.success(data.message);

      // Close the dialog and refresh the list
      setDeleteOpen(false);
      setSelectedDelete(null);

      await loadCategories();
    } catch (error) {
      console.error(`Delete ${type} error:`, error);
      toast.error(`Something went wrong while deleting ${type}`);
    } finally {
      setLoadingDelete(false);
    }
  };

  /// search avbd filtering
  const filteredCategories = categories.filter((cat) => {
    const query = searchTerm.trim().toLocaleLowerCase();

    if (!query) return true;

    return (
      cat.name.en.toLocaleLowerCase().includes(query) ||
      cat.name.hi.toLocaleLowerCase().includes(query) ||
      (cat.subcategories ?? []).some(
        (sub) =>
          sub.name.en.toLocaleLowerCase().includes(query) ||
          sub.name.hi.toLocaleLowerCase().includes(query)
      )
    );
  });

  // loading screen
  if (initialLoading) {
    return (
      <div className="dashboard-card mt-4">
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "350px" }}
        >
          <div
            className="spinner-border text-primary "
            style={{ width: "3rem", height: "3rem" }}
          />

          <h5 className="mt-3 mb-1">Fetching Category Information...</h5>

          <small className="text-muted">
            Please wait while fetching category information.
          </small>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // UI STARTS HERE
  // --------------------------------------------------------

  return (
    <>
      <section className="category-page">
        {/* Breadcrumbs */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section px-4 pt-3 ">
                <h3>Manage <span>Category</span></h3>

                <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link to=""><span>Manage Category</span></Link>

            </section>
        </div>

        <div className="category-manager  my-4 mx-2">
          {/* Card header */}
          <div className="category-manager__header">
            <div className="category-manager__title">
              <div className="category-manager__title-icon">
                <FontAwesomeIcon icon={faFolderTree} />
              </div>

              <div>
                <h4>Categories &amp; Subcategories</h4>
                <p>Organize course categories and subcategories in one place.</p>
              </div>
            </div>

            <div className="category-manager__toolbar">
              <div className="category-search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  aria-label="Search categories and subcategories"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="category-search__clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn blue-btn"
                onClick={openAddCategoryModal}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Category 
              </button>
            </div>
          </div>

          <div className="category-manager__divider" />

          {/* Category accordion */}
          {filteredCategories.length > 0 ? (
            <Accordion
              alwaysOpen
              className="category-accordion"
            >
              {filteredCategories.map((cat) => {
                const originalIndex = categories.findIndex(
                  (item) => item.id === cat.id
                );

                const subcategories = (cat.subcategories ?? []).filter((sub) => {
                  const query = searchTerm.trim().toLocaleLowerCase();

                  if (!query) return true;

                  return (
                    cat.name.en.toLocaleLowerCase().includes(query) ||
                    cat.name.hi.toLocaleLowerCase().includes(query) ||
                    sub.name.en.toLocaleLowerCase().includes(query) ||
                    sub.name.hi.toLocaleLowerCase().includes(query)
                  );
                });

                return (
                  <Accordion.Item
                    eventKey={String(cat.id)}
                    key={cat.id}
                    className="category-accordion-item"
                  >
                    <Accordion.Header>
                      <div className="category-accordion-title">
                        <span className="category-accordion-title__name">
                          <span className="category-accordion-title__number">
                            {originalIndex + 1}.
                          </span>
                          <strong>{cat.name.en}</strong>
                          <span className="category-accordion-title__hindi">
                            ({cat.name.hi})
                          </span>
                        </span>

                        <span className="category-count category-count--primary">
                          {Number(cat.courses_count ?? 0)}{" "}
                          {Number(cat.courses_count ?? 0) === 1
                            ? "Course"
                            : "Courses"}
                        </span>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <div className="category-actions">
                        <button
                          type="button"
                          className=" btn btn-sm  yellow-btn"
                          onClick={() => openEditCategoryModal(cat)}
                        >
                          <FontAwesomeIcon icon={faPen} /> Edit
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-sm red-btn"
                            onClick={() => openDeleteDialog("category", cat)}
                            disabled={
                              Number(cat.courses_count) > 0 ||
                              (cat.subcategories?.length ?? 0) > 0
                            }
                            title={
                              Number(cat.courses_count) > 0
                                ? "Cannot delete: courses are linked to this category."
                                : (cat.subcategories?.length ?? 0) > 0
                                  ? "Delete its subcategories first."
                                  : "Delete category"
                            }
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-sm green-btn"
                          onClick={() => openAddSubModal(cat.id)}
                        >
                          <FontAwesomeIcon icon={faPlus} /> Add Subcategory
                        </button>
                      </div>

                      {subcategories.length > 0 ? (
                        <div className="subcategory-list">
                          {subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              className="subcategory-row"
                            >
                              <div className="subcategory-row__icon">
                                <FontAwesomeIcon icon={faFolderTree} />
                              </div>

                              <div className="subcategory-row__info">
                                <strong>{sub.name.en}</strong>
                                <span className="subcategory-row__hindi">
                                  {sub.name.hi}
                                </span>
                              </div>

                              <span className="category-count category-count--primary">
                                {Number(sub.courses_count ?? 0)}{" "}
                                {Number(sub.courses_count ?? 0) === 1
                                  ? "Course"
                                  : "Courses"}
                              </span>

                              <div className="subcategory-row__actions">
                                <button
                                  type="button"
                                  className="btn btn-sm yellow-btn"
                                  onClick={() =>
                                    openEditSubModal(sub, cat.id)
                                  }
                                  aria-label={`Edit ${sub.name.en}`}
                                >
                                  <FontAwesomeIcon icon={faPen} /> Edit
                                </button>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    className="btn btn-sm red-btn"
                                    onClick={() =>
                                      openDeleteDialog("subcategory", sub)
                                    }
                                    disabled={Number(sub.courses_count) > 0}
                                    title={
                                      Number(sub.courses_count) > 0
                                        ? "Cannot delete: courses are linked to this subcategory."
                                        : "Delete subcategory"
                                    }
                                    aria-label={`Delete ${sub.name.en}`}
                                  >
                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="category-empty-subcategories">
                          <FontAwesomeIcon icon={faFolderTree} />
                          <span>
                            {searchTerm.trim()
                              ? "No matching subcategories."
                              : "No subcategories added yet."}
                          </span>
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          ) : (
            <div className="category-empty-state">
              <FontAwesomeIcon icon={faFolderTree} />
              <h5>
                {searchTerm.trim()
                  ? "No matching categories found"
                  : "No categories yet"}
              </h5>
              <p>
                {searchTerm.trim()
                  ? "Try another search term."
                  : "Create your first category to get started."}
              </p>
              {searchTerm.trim() ? (
                <button
                  type="button"
                  className="btn blue-btn"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  className="category-btn category-btn--primary"
                  onClick={openAddCategoryModal}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Category
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- CATEGORY MODAL ---------------- */}
      {showCategoryModal && (
        <div className="modal fade show d-block" style={{ background: "#00000055", backdropFilter: "blur(4px)" }} tabIndex="-1" >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditingCategory ? "Edit Category" : "Add Category"}
                </h5>
                <button className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
              </div>

              <div className="modal-body">
                <label>Name (English)</label>
                <input
                  className={`form-control mb-1 ${
                    formErrors.name_en ? "is-invalid" : ""
                  }`}
                  required
                  maxLength={255}
                  value={categoryForm.name_en}
                  onChange={(e) => {
                    setCategoryForm({
                      ...categoryForm,
                      name_en: e.target.value,
                    });
                    setFormErrors((prev) => ({ ...prev, name_en: undefined }));
                  }}
                />

                {formErrors.name_en && (
                  <div className="invalid-feedback d-block mb-2">
                    {formErrors.name_en}
                  </div>
                )}

                <label>Name (Hindi)</label>
                <input
                  className={`form-control ${
                    formErrors.name_hi ? "is-invalid" : ""
                  }`}
                  required
                  maxLength={255}
                  value={categoryForm.name_hi}
                  onChange={(e) => {
                    setCategoryForm({
                      ...categoryForm,
                      name_hi: e.target.value,
                    });
                    setFormErrors((prev) => ({ ...prev, name_hi: undefined }));
                  }}
                />

                {formErrors.name_hi && (
                  <div className="invalid-feedback d-block">
                    {formErrors.name_hi}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn gray-btn" onClick={() => setShowCategoryModal(false)} disabled={loading}>
                  Close
                </button>
                <button className="btn blue-btn" onClick={submitCategory} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUBCATEGORY MODAL ---------------- */}
      {showSubModal && (
        <div className="modal fade show d-block" style={{ background: "#00000055", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditingSub ? "Edit Subcategory" : "Add Subcategory"}
                </h5>
                <button className="btn-close" onClick={() => setShowSubModal(false)}></button>
              </div>

              <div className="modal-body">
                <label>Subcategory Name (English)</label>
                <input
                  className={`form-control mb-1 ${
                    formErrors.name_en ? "is-invalid" : ""
                  }`}
                  required
                  maxLength={255}
                  value={subForm.name_en}
                  onChange={(e) => {
                    setSubForm({
                      ...subForm,
                      name_en: e.target.value,
                    });
                    setFormErrors((prev) => ({ ...prev, name_en: undefined }));
                  }}
                />

                {formErrors.name_en && (
                  <div className="invalid-feedback d-block mb-2">
                    {formErrors.name_en}
                  </div>
                )}

                <label>Subcategory Name (Hindi)</label>
                <input
                  className={`form-control ${
                    formErrors.name_hi ? "is-invalid" : ""
                  }`}
                  required
                  maxLength={255}
                  value={subForm.name_hi}
                  onChange={(e) => {
                    setSubForm({
                      ...subForm,
                      name_hi: e.target.value,
                    });
                    setFormErrors((prev) => ({ ...prev, name_hi: undefined }));
                  }}
                />

                {formErrors.name_hi && (
                  <div className="invalid-feedback d-block">
                    {formErrors.name_hi}
                  </div>
                )}

                {/* <label>Who can enroll (English)</label>
                <textarea
                  className="form-control mb-2"
                  value={subForm.who_enroll_en}
                  onChange={(e) => setSubForm({ ...subForm, who_enroll_en: e.target.value })}
                />

                <label>Who can enroll (Hindi)</label>
                <textarea
                  className="form-control"
                  value={subForm.who_enroll_hi}
                  onChange={(e) => setSubForm({ ...subForm, who_enroll_hi: e.target.value })}
                /> */}
              </div>

              <div className="modal-footer">
                <button className="btn gray-btn" onClick={() => setShowSubModal(false)} disabled={loading}>
                  Close
                </button>
                <button className="btn blue-btn" onClick={submitSubcategory} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <ConfirmationDialogBoxUi
        open={deleteOpen}
        title={
          selectedDelete?.type === "category"
            ? "Delete Category"
            : "Delete Subcategory"
        }
        confirmText="Delete"
        confirmVariant="danger"
        loading={loadingDelete}
        onCancel={() => {
          if (loadingDelete) return;

          setDeleteOpen(false);
          setSelectedDelete(null);
        }}
        onConfirm={handleDelete}
      >
        Are you sure you want to delete{" "}
        <strong>
          {selectedDelete?.type === "category"
            ? selectedDelete?.item?.name?.en
            : selectedDelete?.item?.name?.en}
        </strong>
        ?

        <br />
        <br />

        <p className="text-danger" style={{ fontSize: "12px" }}>
          This action cannot be undone.
        </p>
      </ConfirmationDialogBoxUi>
    </>
  );
};

export default ManageCategory;