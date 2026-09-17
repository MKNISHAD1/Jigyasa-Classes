import React, { useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";
import { Modal, Button, OverlayTrigger, Popover } from "react-bootstrap";
import HeaderUi from "../../Common/CommonUI/HeaderUi";
import FooterUi from "../../Common/CommonUI/FooterUi";
import { faAngleRight, faBook, faCircleQuestion, faFileAlt, faFilter, faFlag, faList, faMagnifyingGlass, faPlus, faQuestion, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DASHBOARD_ROUTES } from "../../../constants/nevigation/routes";
import { Link } from "react-router-dom";
import { faQuora } from "@fortawesome/free-brands-svg-icons";
import ConfirmationDialogBoxUi from "../../Common/CommonUI/ConfirmationDialogBoxUi";
import ActionButtons from "../../Common/CommonUI/ActionButtonsUi";

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
    type: "course",
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [editFaq, setEditFaq] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const { i18n } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      const res = await fetch(apiUrl + "list-faqs", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await res.json();
      if (result.status) setFaqs(result.faqs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch FAQs");
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
  const handleClickOutside = (event) => {
    // If click is not on a popover trigger or inside popover, close it
    if (
      !event.target.closest(".popover") &&
      !event.target.closest(".popover-trigger")
    ) {
      setOpenPopoverId(null);
    }
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);

  // Add FAQ
  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("Question and Answer are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl + "create-faqs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFaq),
      });
      const result = await res.json();
      if (result.status) {
        toast.success("FAQ created successfully");
        setNewFaq({ question: "", answer: "", type: "course", status: true });
        fetchFaqs();
      } else toast.error(result.message || "Failed to add FAQ");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ

  const deleteFaq = (faq) => {
    setSelectedFaq(faq);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {

    if (!selectedFaq) return;

    try {

      setLoadingDelete(true);

      const res = await fetch(
        apiUrl + "delete-faqs/" + selectedFaq.id,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const result = await res.json();

      if (result.status) {

        toast.success("FAQ deleted");

        setFaqs((prev) =>
          prev.filter((faq) => faq.id !== selectedFaq.id)
        );

        setDeleteOpen(false);
        setSelectedFaq(null);

      } else {

        toast.error(result.message || "Delete failed");

      }

    } catch (err) {

      console.error(err);
      toast.error("Server error");

    } finally {

      setLoadingDelete(false);

    }
  };

  // Update FAQ
const updateFaq = async () => {

  const question = editFaq?.question?.en?.trim();
  const answer = editFaq?.answer?.en?.trim();

  if (!question || !answer) {
    toast.error("Question and Answer are required");
    return;
  }

  const body = {
    type: editFaq.type,
    status: Boolean(editFaq.status),
    question,
    answer,
  };

  try {
    setLoading(true);
    const res = await fetch(
      `${apiUrl}update-faqs/${editFaq.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await res.json();

    console.log("FAQ UPDATE RESPONSE:", result);

    if (result.status) {

      toast.success("FAQ updated successfully");

      setEditFaq(null);

      await fetchFaqs();

    } else {

      toast.error(result.message || "Update failed");

    }

  } catch (err) {

    console.error("FAQ UPDATE ERROR:", err);
    toast.error("Server error");

  } finally{
    setLoading(false);
  }
};

  // Columns for DataTable
  const columns = [
    //  serial no.
    { name: "#", 
      cell:(row,index) => index + 1, 
      width: "55px"
    },

    {
      name: "Question",
      selector: (row) => row.question?.[i18n.language] || row.question?.en,
      cell: (row) => (
        <>
          <div
              className="course-title"
              title={row.question?.[i18n.language] || row.question?.en}
            >
              {row.question?.[i18n.language] || row.question?.en}
          </div>
        
        </>
      ),
      sortable: true,
      wrap: true,
    },

    {
      name: "Answer",
      cell: (row) => {
        const ans = row.answer?.[i18n.language] || row.answer?.en;
        const truncated = ans.length > 30 ? ans.substring(0, 30) + "..." : ans;

        return (
          <OverlayTrigger
            trigger="click"
            placement="right"
            show={openPopoverId === row.id}
            overlay={
              <Popover>
                <Popover.Header>Full Answer</Popover.Header>
                <Popover.Body>{ans}</Popover.Body>
              </Popover>
            }
          >
          <span
            className="popover-trigger course-title"
            // style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent this click from triggering the outside click handler
              setOpenPopoverId(openPopoverId === row.id ? null : row.id);
            }}
          >
            {truncated}
          </span>
          </OverlayTrigger>
        );
      },
      sortable: false,
      wrap: true,
    },
    { 
      name: "Type", 
      selector: (row) => row.type, sortable: true,
      cell: (row) => (
        <div className="course-title text-capitalize">
          {row.type}
        </div>
      )
    },

    // FAQ Status
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <span
          className={`badge ${
            row.status
              ? "badge-published text-success"
              : "badge-draft"
          }`}
        >
          {row.status ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
      width: "100px",
    },

    {
      name: "Actions",
      cell: (row) => (

          <ActionButtons

            onEdit={() => {
              setEditFaq({
                id: row.id,
                type: row.type,
                status: row.status,
                question: { ...row.question },
                answer: { ...row.answer },
              });
            }}

            onDelete={() => deleteFaq(row)}

            showLabel={false}

          />
      ),
    },
  ];

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const ans = faq.answer?.[i18n.language] || faq.answer?.en;
    const que = faq.question?.[i18n.language] || faq.question?.en;
    return (
      (filterType ? faq.type === filterType : true) &&
      (String(faq.id).includes(filterText) ||
        que.toLowerCase().includes(filterText.toLowerCase()) ||
        ans.toLowerCase().includes(filterText.toLowerCase()))
    );
  });

const faqTableStyles = {
  headCells: {
    style: {
      fontWeight: "600",
      fontSize: "14px",
      color: "#1f2937",
      backgroundColor: "transparent",
    },
  },

  cells: {
    style: {
      fontSize: "14px",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },

  rows: {
    style: {
      minHeight: "55px",
    },
  },

  pagination: {
    style: {
      borderTop: "1px solid #eee",
      paddingTop: "10px",
      paddingBottom: "5px",
    },
  },
};
  return (
    <>

      {/* Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center">
          <section className="breadcrumb-section">
              <h3>Manage <span>FAQ</span></h3>

              <Link className='bread-link' to={DASHBOARD_ROUTES.DASHBOARD}>Home</Link>
              <span><FontAwesomeIcon icon={faAngleRight}/></span>
              <Link className='bread-link' to=""><span>manage FAQ</span></Link>

          </section>

      </div>
         
          <div className="my-4">

            {/* Create FAQ */}

            <div className="dashboard-card my-4">

              <div className="card-header-custom">

                  <div className="header">
                      <span>Create New FAQ</span>
                      <FontAwesomeIcon icon={faCircleQuestion} className="icon mx-2"/>
                  </div>

              </div> 

              <div className="faq-form">

                <div className="mb-3">

                  <div className="input-with-icon">

                    <FontAwesomeIcon
                      icon={faCircleQuestion}
                      className="input-icon"
                    />

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Question (English)"
                      value={newFaq.question}
                      onChange={(e) =>
                        setNewFaq({
                          ...newFaq,
                          question: e.target.value
                        })
                      }
                    />

                  </div>

                </div>


                <div className="mb-3">

                  <div className="input-with-icon align-items-start">

                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="input-icon mt-2"
                    />

                    <textarea
                      className="form-control"
                      placeholder="Answer (English)"
                      rows="3"
                      value={newFaq.answer}
                      onChange={(e) =>
                        setNewFaq({
                          ...newFaq,
                          answer: e.target.value
                        })
                      }
                    />

                  </div>

                </div>


                <div className="mb-3">

                  <div className="input-with-icon">

                    <FontAwesomeIcon
                      icon={faBook}
                      className="input-icon"
                    />

                    <select
                      className="form-control"
                      value={newFaq.type}
                      onChange={(e) =>
                        setNewFaq({
                          ...newFaq,
                          type: e.target.value
                        })
                      }
                    >

                      <option value="general">General</option>
                      <option value="payment">Payment</option>
                      <option value="course">Course</option>
                      <option value="other">Other</option>

                    </select>

                  </div>

                </div>


                <div className="mb-4">

                  <div className="input-with-icon">

                    <FontAwesomeIcon
                      icon={faFlag}
                      className="input-icon"
                    />

                    <select
                      className="form-control"
                      value={newFaq.status ? "active" : "inactive"}
                      onChange={(e) =>
                        setNewFaq({
                          ...newFaq,
                          status: e.target.value === "active"
                        })
                      }
                    >

                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>

                    </select>

                  </div>

                </div>

              <div className="d-flex justify-content-end">
                <button
                  className="btn blue-btn"
                  onClick={addFaq}
                  disabled={loading}
                  >
                    {loading ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2 text-primary"
                          role="status"
                        />

                          <span className='text-primary'>Adding... </span>

                        </>

                        ) : (

                          <>
                          <FontAwesomeIcon icon={faPlus}/> Add FAQ
                          </>

                      )}
                </button>
              </div>

              </div>

            </div>

            {/* FAQ List */}

            <div className="dashboard-card">
              
              <div className="card-header-custom">

                  <div className="header">
                      <span>FAQ List</span>
                      <FontAwesomeIcon icon={faList} className="icon mx-2"/>
                  </div>

              </div> 

              {/* Filters */}

              <div className="faq-filters mb-3">

                <div className="faq-filter-type">

                  <FontAwesomeIcon icon={faFilter} />

                  <select
                    className="form-control"
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(e.target.value)
                    }
                  >

                    <option value="">All Types</option>
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="course">Course</option>
                    <option value="other">Other</option>

                  </select>

                </div>


                <div className="faq-search">

                  <FontAwesomeIcon icon={faMagnifyingGlass} />

                  <input
                    type="text"
                    placeholder="Search by ID, question, answer..."
                    className="form-control"
                    value={filterText}
                    onChange={(e) =>
                      setFilterText(e.target.value)
                    }
                  />

                </div>

              </div>



                <DataTable
                  columns={columns}
                  data={filteredFaqs}
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 15, 20, 30]}
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                    noRowsPerPage: false,
                  }}
                  highlightOnHover
                  striped
                  responsive
                  persistTableHead
                  customStyles={faqTableStyles}
                />

              {/* Edit FAQ Modal */}

              {editFaq && (

                <div
                  className="modal d-block custom-module-modal"
                  style={{ background: "rgba(5, 15, 45, .55)" }}
                >

                  <div className="modal-dialog">

                    <div className="modal-content">

                      {/* Header */}

                      <div className="modal-header module-modal-header">

                        <div className="module-modal-heading">

                          <h5 className="modal-title">
                            Edit FAQ
                          </h5>

                        </div>

                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setEditFaq(null)}
                        />

                      </div>


                      {/* Body */}

                      <div className="modal-body">

                        {/* Question */}

                        <div className="mb-3">

                          <label>
                            Question (English)
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={editFaq?.question?.en || ""}
                            onChange={(e) =>
                              setEditFaq((prev) => ({
                                ...prev,
                                question: {
                                  ...prev.question,
                                  en: e.target.value,
                                },
                              }))
                            }
                          />

                        </div>


                        {/* Answer */}

                        <div className="mb-3">

                          <label>
                            Answer (English)
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            value={editFaq?.answer?.en || ""}
                            onChange={(e) =>
                              setEditFaq((prev) => ({
                                ...prev,
                                answer: {
                                  ...prev.answer,
                                  en: e.target.value,
                                },
                              }))
                            }
                          />

                        </div>


                        {/* Type */}

                        <div className="mb-3">

                          <label>
                            FAQ Type
                          </label>

                          <select
                            className="form-control"
                            value={editFaq?.type || "course"}
                            onChange={(e) =>
                              setEditFaq((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                          >

                            <option value="general">
                              General
                            </option>

                            <option value="payment">
                              Payment
                            </option>

                            <option value="course">
                              Course
                            </option>

                            <option value="other">
                              Other
                            </option>

                          </select>

                        </div>


                        {/* Status */}

                        <div className="mb-3">

                          <label>
                            Status
                          </label>

                          <select
                            className="form-control"
                            value={
                              editFaq?.status
                                ? "active"
                                : "inactive"
                            }
                            onChange={(e) =>
                              setEditFaq((prev) => ({
                                ...prev,
                                status:
                                  e.target.value === "active",
                              }))
                            }
                          >

                            <option value="active">
                              Active
                            </option>

                            <option value="inactive">
                              Inactive
                            </option>

                          </select>

                        </div>

                      </div>


                      {/* Footer */}

                      <div className="modal-footer">

                        <button
                          className="btn gray-btn"
                          onClick={() => setEditFaq(null)}
                        >
                          Cancel
                        </button>

                        <button
                          className="btn blue-btn"
                          onClick={updateFaq}
                          disabled={loading}
                          >
                            {loading ? (

                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2 text-primary"
                                  role="status"
                                />

                                  <span className='text-primary'>Saving... </span>

                                </>

                                ) : (

                                  <>
                                  <FontAwesomeIcon icon={faSave}/> Save Changes
                                  </>

                              )}

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              )}
            </div>
          </div>

          {/* Confirmation Dialog Box */}

            <ConfirmationDialogBoxUi

              open={deleteOpen}

              title="Delete FAQ"

              confirmText="Delete"

              confirmVariant="danger"

              loading={loadingDelete}

              onCancel={() => {
                setDeleteOpen(false);
                setSelectedFaq(null);
              }}

              onConfirm={handleDelete}
            >

              Are you sure you want to delete this FAQ?

              <br />

              <strong>
                {selectedFaq?.question?.en}
              </strong>

              <br />
              <br />

              <p
                className="text-danger"
                style={{ fontSize: "12px" }}
              >
                This action cannot be undone.
              </p>

            </ConfirmationDialogBoxUi>

    </>
  );
};

export default Faqs;