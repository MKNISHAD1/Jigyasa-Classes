import React, { useEffect, useState } from 'react'


const OtpResendTimer = ({
  initialTime = 60,
  onResend,
}) => {

    const [timeLeft, setTimeLeft] = useState(initialTime);
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    useEffect(() => {

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

    }, [timeLeft]);

  return (

    <div className="text-center mt-3">

      {timeLeft > 0 ? (

        <small className="text-muted">

          Resend OTP in
          <strong className="ms-1">
            {minutes}:{seconds}
          </strong>

        </small>

      ) : (

        <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => {
                setTimeLeft(initialTime);
                onResend?.();
            }}
        >
            Resend OTP
        </button>

      )}

    </div>
  );
};

export default OtpResendTimer;