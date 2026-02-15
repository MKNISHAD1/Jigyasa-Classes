import React, { useEffect, useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";
import { Modal, Button, OverlayTrigger, Popover } from "react-bootstrap";

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
  const deleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(apiUrl + "delete-faqs/" + id, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await res.json();
      if (result.status) {
        toast.success("FAQ deleted");
        setFaqs(faqs.filter((f) => f.id !== id));
      } else toast.error(result.message || "Delete failed");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Update FAQ
  const updateFaq = async () => {
    if (!editFaq.question.en.trim() || !editFaq.answer.en.trim()) {
      toast.error("Question and Answer are required");
      return;
    }

    // Prepare request body for backend
    const body = {
      type: editFaq.type,
      status: editFaq.status,
      question: editFaq.question.en,
      answer: editFaq.answer.en,
    };

    try {
      const res = await fetch(`${apiUrl}update-faqs/${editFaq.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.status) {
        toast.success("FAQ updated successfully");
        setEditFaq(null);
        fetchFaqs();
      } else toast.error(result.message || "Update failed");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Columns for DataTable
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "60px" },
    {
      name: "Question",
      selector: (row) => row.question?.[i18n.language] || row.question?.en,
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
            className="popover-trigger"
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
    { name: "Type", selector: (row) => row.type, sortable: true },
    { name: "Status", cell: (row) => (row.status ? "Active" : "Inactive"), sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() =>
              setEditFaq({
                id: row.id,
                type: row.type,
                status: row.status,
                question: { ...row.question },
                answer: { ...row.answer },
              })
            }
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => deleteFaq(row.id)}
          >
            Delete
          </button>
        </div>
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

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              <Sidebar />
            </div>
            <div className="col-md-9 dashboard">
              <div className="card shadow border-0 p-4">
                <h4>Create New FAQ</h4>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Question (English)"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                  <textarea
                    className="form-control mb-2"
                    placeholder="Answer (English)"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  />
                  <select
                    className="form-control mb-2"
                    value={newFaq.type}
                    onChange={(e) => setNewFaq({ ...newFaq, type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="course">Course</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    className="form-control mb-2"
                    value={newFaq.status ? "active" : "inactive"}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, status: e.target.value === "active" })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={addFaq}
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add FAQ"}
                  </button>
                </div>

                <hr />
                <h4>FAQ List</h4>

                <div className="d-flex gap-2 mb-3">
                  <select
                    className="form-control w-auto"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="course">Course</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search by ID, question, answer"
                    className="form-control"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>

                <DataTable
                  columns={columns}
                  data={filteredFaqs}
                  pagination
                  highlightOnHover
                  striped
                />

                {/* Edit Modal */}
                <Modal show={!!editFaq} onHide={() => setEditFaq(null)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Edit FAQ ID {editFaq?.id}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Question (English)"
                      value={editFaq?.question?.en || ""}
                      onChange={(e) =>
                        setEditFaq({
                          ...editFaq,
                          question: { ...editFaq.question, en: e.target.value },
                        })
                      }
                    />
                    <textarea
                      className="form-control mb-2"
                      placeholder="Answer (English)"
                      value={editFaq?.answer?.en || ""}
                      onChange={(e) =>
                        setEditFaq({
                          ...editFaq,
                          answer: { ...editFaq.answer, en: e.target.value },
                        })
                      }
                    />
                    <select
                      className="form-control mb-2"
                      value={editFaq?.type || "course"}
                      onChange={(e) =>
                        setEditFaq({ ...editFaq, type: e.target.value })
                      }
                    >
                      <option value="general">General</option>
                      <option value="payment">Payment</option>
                      <option value="course">Course</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      className="form-control mb-2"
                      value={editFaq?.status ? "active" : "inactive"}
                      onChange={(e) =>
                        setEditFaq({ ...editFaq, status: e.target.value === "active" })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditFaq(null)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={updateFaq}>
                      Save Changes
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Faqs;