import React, { useEffect, useRef } from 'react'

const OtpInput = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {


const firstInputRef = useRef(null);

// taking input
const handleChange = (e, index) => {
  const input = e.target.value;

  // Allow only numbers
  if (!/^\d?$/.test(input)) return;

  const otpArray = value.split("");

  otpArray[index] = input;

  onChange(otpArray.join(""));

  // Move to next box automatically
  if (input && index < length - 1) {
    const nextInput = document.getElementById(`otp-${index + 1}`);
    nextInput?.focus();
  }
};

// backspace support
const handleKeyDown = (e, index) => {
  if (e.key === "Backspace") {

    // If current box already empty, move left
    if (!value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }
};

// Handle Paste 
const handlePaste = (e) => {
  e.preventDefault();

  const pastedData = e.clipboardData
    .getData("text")
    .replace(/\D/g, "") // Remove non-digits
    .slice(0, length);

  if (!pastedData) return;

  onChange(pastedData);

  // Focus last filled box
  const lastIndex = pastedData.length - 1;
  document.getElementById(`otp-${lastIndex}`)?.focus();
};


useEffect(() => {
  if (!disabled) {
    firstInputRef.current?.focus();
  }
}, [disabled]);

  return (
    <div className="d-flex justify-content-center gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          ref={index === 0 ? firstInputRef : null}
          id={`otp-${index}`}
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="form-control text-center"
          style={{
            width: "45px",
            height: "55px",
            fontSize: "22px",
            fontWeight: "600",
          }}
          value={value[index] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  )
}

export default OtpInput