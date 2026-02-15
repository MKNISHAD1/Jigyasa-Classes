import React, { useEffect, useState } from "react";
import { apiUrl, token } from "../Common/http";
import { toast } from "react-toastify";

// ⭐ Bootstrap modal requires window.bootstrap
const bs = window.bootstrap;

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Editing mode
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingSub, setIsEditingSub] = useState(false);

  // Form data
  const [categoryForm, setCategoryForm] = useState({ id: null, name_en: "", name_hi: "" });
  const [subForm, setSubForm] = useState({ id: null, category_id: "", name_en: "", name_hi: "", who_enroll_en: "", who_enroll_hi: "" });

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}categories`,{
          headers : {
          Authorization:`Bearer ${token()}`,
        },
      }
      );
      const data = await res.json();

      if (data.status) {
        setCategories(data.categories);
      }
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // -----------------------------------
  // CATEGORY ACTIONS
  // -----------------------------------
  const openAddCategoryModal = () => {
    setIsEditingCategory(false);
    setCategoryForm({ id: null, name_en: "", name_hi: "" });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setIsEditingCategory(true);
    setCategoryForm({
      id: cat.id,
      name_en: cat.name.en,
      name_hi: cat.name.hi,
    });
    setShowCategoryModal(true);
  };

  const submitCategory = async () => {
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
      if (data.status) {
        toast.success(data.message);
        setShowCategoryModal(false);
        loadCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = (id) => {
    toast.info(
      <div>
        <p>Delete this category?</p>
        <button
          className="btn btn-danger btn-sm me-2"
          onClick={async () => {
            try {
              const res = await fetch(`${apiUrl}category/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
              });

              const data = await res.json();
              if (data.status) {
                toast.success(data.message);
                loadCategories();
              }
            } catch {
              toast.error("Failed to delete");
            }
          }}
        >
          Confirm
        </button>
      </div>,
      { autoClose: 5000 }
    );
  };

  // -----------------------------------
  // SUBCATEGORY ACTIONS
  // -----------------------------------
  const openAddSubModal = (category_id) => {
    setIsEditingSub(false);
    setSubForm({ id: null, category_id, name_en: "", name_hi: "", who_enroll_en: "", who_enroll_hi: "" });
    setShowSubModal(true);
  };

  const openEditSubModal = (sub, category_id) => {
    setIsEditingSub(true);
    setSubForm({
      id: sub.id,
      category_id,
      name_en: sub.name.en,
      name_hi: sub.name.hi,
      who_enroll_en: sub.who_can_enroll.en,
      who_enroll_hi: sub.who_can_enroll.hi,
    });
    setShowSubModal(true);
  };

  const submitSubcategory = async () => {
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
      if (data.status) {
        toast.success(data.message);
        setShowSubModal(false);
        loadCategories();
      } else toast.error(data.message);
    } catch (error) {
      toast.error("Error saving subcategory");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = (id) => {
    toast.warning(
      <div>
        <p>Delete this subcategory?</p>
        <button
          className="btn btn-danger btn-sm"
          onClick={async () => {
            try {
              const res = await fetch(`${apiUrl}subcategory/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
              });

              const data = await res.json();
              if (data.status) {
                toast.success(data.message);
                loadCategories();
              }
            } catch {
              toast.error("Failed to delete");
            }
          }}
        >
          Confirm
        </button>
      </div>,
      { autoClose: 5000 }
    );
  };

  // --------------------------------------------------------
  // UI STARTS HERE
  // --------------------------------------------------------
  return (
    <div className="container mt-4">

      {/* ADD CATEGORY BUTTON */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={openAddCategoryModal}>
          Add Category
        </button>
      </div>

      {/* ACCORDION LIST */}
      <div className="accordion" id="categoryAccordion">
        {categories.map((cat, idx) => (
          <div className="accordion-item" key={cat.id}>
            <h2 className="accordion-header" id={`heading${idx}`}>
              <button
                className="accordion-button collapsed"
                data-bs-toggle="collapse"
                data-bs-target={`#cat${cat.id}`}
              >
                <strong>{cat.name.en}</strong> <span className="ms-2 text-muted">({cat.name.hi})</span>
              </button>
            </h2>

            <div id={`cat${cat.id}`} className="accordion-collapse collapse">
              <div className="accordion-body">

                {/* CATEGORY ACTIONS */}
                <div className="mb-3">
                  <button className="btn btn-sm btn-warning me-2" onClick={() => openEditCategoryModal(cat)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(cat.id)}>
                    Delete
                  </button>
                  <button className="btn btn-sm btn-success ms-2" onClick={() => openAddSubModal(cat.id)}>
                    Add Subcategory
                  </button>
                </div>

                {/* SUBCATEGORY LIST */}
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  cat.subcategories.map((sub) => (
                    <div key={sub.id} className="ps-3 border-start mb-2">
                      <strong>- {sub.name.en}</strong> ({sub.name.hi})
                      <br />
                      <small className="text-muted">Who can enroll: {sub.who_can_enroll.en}</small>

                      <div className="mt-1">
                        <button className="btn btn-sm btn-warning me-2" onClick={() => openEditSubModal(sub, cat.id)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteSubcategory(sub.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No subcategories yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- CATEGORY MODAL ---------------- */}
      {showCategoryModal && (
        <div className="modal fade show d-block" style={{ background: "#00000055" }}>
          <div className="modal-dialog">
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
                  className="form-control mb-2"
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                />

                <label>Name (Hindi)</label>
                <input
                  className="form-control"
                  value={categoryForm.name_hi}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_hi: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={submitCategory} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUBCATEGORY MODAL ---------------- */}
      {showSubModal && (
        <div className="modal fade show d-block" style={{ background: "#00000055" }}>
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditingSub ? "Edit Subcategory" : "Add Subcategory"}
                </h5>
                <button className="btn-close" onClick={() => setShowSubModal(false)}></button>
              </div>

              <div className="modal-body">
                <label>Name (English)</label>
                <input
                  className="form-control mb-2"
                  value={subForm.name_en}
                  onChange={(e) => setSubForm({ ...subForm, name_en: e.target.value })}
                />

                <label>Name (Hindi)</label>
                <input
                  className="form-control mb-2"
                  value={subForm.name_hi}
                  onChange={(e) => setSubForm({ ...subForm, name_hi: e.target.value })}
                />

                <label>Who can enroll (English)</label>
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
                />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSubModal(false)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={submitSubcategory} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageCategory;