import React, { useContext, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/Auth';
import { apiUrl } from '../Common/http';

const EmailVerified = () => {
const { search } = useLocation();
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const params = new URLSearchParams(search);
  const status = params.get('status');

  const messages = {
    'verified': '✅ Your email has been verified successfully.',
    'already-verified': 'ℹ Your email is already verified.',
    'invalid-signature': '❌ Invalid or expired verification link.',
    'invalid-hash': '❌ The verification link is not valid.',
  };

    useEffect(() => {
    const refreshUser = async () => {
      if (status === "verified" && user?.token) {
        try {
          const res = await fetch(apiUrl + "user", {
            headers: {
              Authorization: `Bearer ${user.token}`,
              Accept: "application/json",
            },
          });

          if (res.ok) {
            const freshUser = await res.json();
            // update AuthContext + localStorage
            login({ ...user, ...freshUser });
          }
        } catch (err) {
          console.error("Error refreshing user after verification:", err);
        }
      }
    };

    refreshUser();
  }, [status, user, login]);


  return (
    <div className="container my-5">
      <div className="card shadow border-0">
        <div className="card-body">
          <h3>Email Verification</h3>
          <p className="mt-3">{messages[status] || 'Something went wrong.'}</p>
          <button className='btn btn-success' onClick={() => navigate("/dash")}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );

}

export default EmailVerified