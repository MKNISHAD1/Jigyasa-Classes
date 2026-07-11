import React, { useEffect, useState } from 'react'
import { apiUrl, token } from '../../Common/http';
import { toast } from 'react-toastify';
import HeaderUi from '../../Common/CommonUI/HeaderUi';
import Sidebar from '../../Common/Sidebar';
import { Link } from 'react-router-dom';

const ContactMessages = () => {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {

    try {

      const res = await fetch(
        apiUrl + "contact-messages",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`
          }
        }
      );

      const result = await res.json();

      if (result.status) {

        setMessages(result.messages.data || []);

      } else {

        toast.error("Failed to load messages");

      }

    } catch (error) {

      console.error(error);
      toast.error("Something went wrong");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <>
      <HeaderUi />

      <main>
        <div className="container my-5">
          <div className="row">

            <div className="col-md-3">
              <Sidebar />
            </div>

            <div className="col-md-9">

              <div className="card shadow border-0 p-4">

                <h4 className="mb-4">
                  Contact Messages
                </h4>

                {loading ? (

                  <p>Loading...</p>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-bordered table-hover">

                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th width="120">Action</th>
                        </tr>
                      </thead>

                      <tbody>

                        {messages.length > 0 ? (

                          messages.map((msg) => (

                            <tr key={msg.id}>

                              <td>{msg.id}</td>

                              <td>{msg.name}</td>

                              <td>{msg.category}</td>

                              <td>{msg.subject}</td>

                              <td>
                                <span
                                  className={`badge ${
                                    msg.status === "new"
                                      ? "bg-danger"
                                      : msg.status === "read"
                                      ? "bg-warning text-dark"
                                      : "bg-success"
                                  }`}
                                >
                                  {msg.status}
                                </span>
                              </td>

                              <td>
                                {new Date(msg.created_at)
                                  .toLocaleDateString()}
                              </td>

                              <td>

                                <Link
                                  to={`/admin/contact-message/${msg.id}`}
                                  className="btn btn-sm btn-primary"
                                >
                                  View
                                </Link>

                              </td>

                            </tr>

                          ))

                        ) : (

                          <tr>
                            <td colSpan="7" className="text-center">
                              No messages found
                            </td>
                          </tr>

                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default ContactMessages