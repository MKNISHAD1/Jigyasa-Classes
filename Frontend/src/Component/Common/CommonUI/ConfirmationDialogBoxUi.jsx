import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'

const ConfirmationDialogBoxUi = ({
    open,
    title,
    children,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "danger",
    loading = false,
    onConfirm,
    onCancel,
}) => {

    if (!open) return null;

  return (

    <>
        <div className="confirm-overlay">

            <div className="confirm-dialog">

                {/* Header */}

                <div className="confirm-header text-center">

                    <h5 className='m-0 fw-semibold'><FontAwesomeIcon icon={faWarning} className={`text-${confirmVariant}`}/> {title}</h5>

                </div>

                {/* Body */}

                <div className="confirm-body text-center">

                    {children}

                </div>

                {/* Footer */}

                <div className="confirm-footer">

                    <button
                        className="btn btn-light"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        className={`btn btn-${confirmVariant}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 

                <>
                    <span
                    className="spinner-border spinner-border-sm me-2 text-light"
                    role="status"
                    />

                    <span className='text-light'>Please Wait... </span>

                </>

                : confirmText}
                    </button>

                </div>

            </div>

        </div>

    </>
  )
}

export default ConfirmationDialogBoxUi