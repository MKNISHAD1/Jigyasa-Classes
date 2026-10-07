import React, { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/Auth';
import { apiUrl, token } from '../Common/http';
import { DASHBOARD_ROUTES } from '../../constants/nevigation/routes';
import HeaderUi from '../Common/CommonUI/HeaderUi';
import FooterUi from '../Common/CommonUI/FooterUi';
import emailverifyimg from '../../assets/images/email-verify.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/Logo2.png';


const EmailVerified = () => {
const { search } = useLocation();
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const params = new URLSearchParams(search);
  const status = params.get('status');

  const messages = {
    verified: "Your email has been verified successfully.",
    "already-verified": "Your email is already verified.",
    "invalid-signature": "Your verification link is Invalid or has expired.",
    "invalid-hash": "The verification link is not valid.",
  };

    useEffect(() => {
    const refreshUser = async () => {
      if (status === "verified" && user?.token) {
        try {
          const res = await fetch(apiUrl + "user", {
            headers: {
              Authorization: `Bearer ${token()}`,
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

  const isSuccess = 
    status === "verified" || 
    status === "already-verified" ;

  return (
    <>
      {/*Header */}
      <HeaderUi/>

      <div className="container-fluid Form_Section">

          <div className="row">

              {/* Illustration */}
              <div className="col-lg-6 d-none d-lg-flex Illustration_Img">

                  <img
                      src={emailverifyimg}
                      alt="Email verification"
                  />

              </div>

              {/* Verification Result */}
              <div className="col-lg-6 col-12">

                  <div className="Form_Body">

                      {/* Mobile Logo */}
                      <div className="d-flex d-lg-none Logo_Emblemb">
                          <img
                            src={logo}
                            alt="Jigyasa Classes"
                          />
                      </div>

                      {/* Title */}
                      <div className="Form_Title">

                          <h1>
                            Email <span>Verification</span>
                          </h1>

                          <small className="text-muted">
                            Confirm your email to continue your
                            <span> learning journey.</span>
                          </small>

                      </div>

                      {/* Divider */}
                      <div className="Divider_Line">

                          <div className="Line"></div>

                          <FontAwesomeIcon
                            icon={faGraduationCap}
                            className="Icon"
                          />

                          <div className="Line"></div>

                      </div>


                      {/* Status */}
                      <div className="text-center Email_Verification_Status">

                          <FontAwesomeIcon
                              icon={
                                isSuccess
                                    ? faCheckCircle
                                    : faCircleExclamation
                              }
                              className={`Status_Icon ${
                                isSuccess
                                    ? "Success_Icon"
                                    : "Error_Icon"
                              }`}
                          />


                          <h3 className="mt-4">

                            {isSuccess
                                ? "Email Verified!"
                                : "Verification Failed"}

                          </h3>


                          <p className="text-muted">

                            {messages[status] ||
                                "Something went wrong with your verification link."}

                          </p>


                          <button
                            type="button"
                            className="btn blue-btn w-100 mt-4"
                            onClick={() =>
                                navigate(
                                    DASHBOARD_ROUTES.DASHBOARD
                                )
                            }
                          >
                            Back to Dashboard
                          </button>

                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Footer */}
      <FooterUi/>
    </>
  );

}

export default EmailVerified