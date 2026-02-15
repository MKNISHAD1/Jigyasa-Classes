import React, { useState } from "react";
import Header from "../../Common/Header";
import Sidebar from "../../Common/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { apiUrl, token } from "../../Common/http";

const SuspendUser = () => {
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(2); // default 2 days
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: async () => {
      const res = await fetch(apiUrl + "view-user/" + params.id, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();
      setUser(result.user);
      return {
        name: result.user.name,
        email: result.user.email,
        username: result.user.username,
        mobile_no: result.user.mobile_no,
      };
    },
  });

  const onSubmit = async () => {
    setLoading(true);

    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + Number(days));

    try {
      const res = await fetch(apiUrl + "user-suspended/" + params.id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`, // if JWT
        },
        body: JSON.stringify({
          reason,
          until: untilDate.toISOString(),
          //   until: untilDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to suspend user");

      alert("✅ User suspended successfully");
      navigate("/admin/users");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (!user) {
    return (
      <main
        className="d-flex align-items-center justify-content-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
              {/* Sidebar Here  */}
              <Sidebar />
            </div>

            {/* Suspend Users */}

            <div className="col-md-9 dashboard">
              <div className="card shadow border-0">
                <div className="card-body d-flex justify-content-center align-items-center">
                  <div className="profile-section p-4">
                    <h1 className="mb-4 text-center">User Profile</h1>
                    <div className="p-3 text-center">
                      <img
                        src={user?.profile_pic}
                        alt="Profile"
                        className="rounded-circle mb-2"
                        width="120"
                        height="120"
                      />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row pt-4">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                              {...register("email")}
                              type="text"
                              className="form-control"
                              disabled
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                              {...register("name")}
                              type="text"
                              className="form-control"
                              disabled
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                              {...register("username")}
                              type="text"
                              className="form-control"
                              disabled
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Mobile</label>
                            <input
                              {...register("mobile_no")}
                              type="text"
                              className="form-control"
                              disabled
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Reason</label>
                            <textarea
                              className="form-control"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Enter suspension reason"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">
                              Duration (days)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={days}
                              min={1}
                              onChange={(e) => setDays(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      {!confirming ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setConfirming(true)}
                          disabled={loading}
                        >
                          Continue
                        </button>
                      ) : (
                        <div className="alert alert-warning">
                          <p>
                            <b>⚠ Confirm Suspension?</b>
                          </p>
                          <p>
                            <b>Reason:</b> {reason || "No reason provided"}
                          </p>
                          <p>
                            <b>Until:</b>{" "}
                            {new Date(
                              new Date().setDate(
                                new Date().getDate() + Number(days)
                              )
                            ).toLocaleString()}
                          </p>
                          <div className="d-flex gap-2">
                            <button
                              type="submit"
                              className="btn btn-danger w-50"
                              onClick={handleSubmit(onSubmit)}
                              disabled={loading}
                            >
                              {loading ? (
                                <span>
                                  <span className="spinner-border spinner-border-sm me-2" />{" "}
                                  Suspending...
                                </span>
                              ) : (
                                "Confirm Suspension"
                              )}
                            </button>

                            <button
                              className="btn btn-secondary w-50"
                              onClick={() => setConfirming(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* <button
                        type="submit"
                        className="btn btn-danger"
                        disabled={!isChanged || isSubmitting}
                      >
                        Suspend
                      </button> */}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SuspendUser;
