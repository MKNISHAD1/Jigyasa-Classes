import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye } from "@fortawesome/free-regular-svg-icons";
import { faBan, faEllipsisVertical, faPen, faRotate, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";

const ActionButtons = ({
  viewLink,
  editLink,
  onEdit,
  onDelete,
  suspendLink,
  onSuspend,
  onRestore,
  onLiftSuspension,
  showLabel = false,

  mobile = false,
  menuOpen,
  toggleMenu,
  closeMenu,
}) => {

  const menuRef = useRef(null);

useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target)
        ) {
            closeMenu();
        }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
        document.removeEventListener("pointerdown", handleClickOutside);
    };
}, [menuOpen, closeMenu]);

// mobile dropdown

if (mobile) {
    return (
        <div className="action-menu-wrapper " ref={menuRef}>

            <button
                className="action-menu-btn bg-white border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu();
                  }}
            >
                <FontAwesomeIcon icon={faEllipsisVertical}  />
            </button>

            {menuOpen && (

                <div className="action-dropdown">

                  {/* view button */}
                  {viewLink && (
                    <Link
                      to={viewLink}
                      className="dropdown-action btn-view"
                      onClick={closeMenu}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>View</span>
                    </Link>
                  )}

                  {/* Edit Button */}

                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => {
                        onEdit();
                        closeMenu?.();
                      }}
                    >
                      <FontAwesomeIcon icon={faPen} />
                      Edit
                    </button>
                  ) : editLink ? (
                    <Link
                      to={editLink}
                      onClick={closeMenu}
                    >
                      <FontAwesomeIcon icon={faPen} />
                      Edit
                    </Link>
                  ) : null}

                  {/* Delete Button */}

                  {onDelete && (
                    <button
                      className="dropdown-action btn-delete"
                      onClick={() => {
                          onDelete();
                          closeMenu();
                      }}

                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete</span>
                    </button>
                  )}

                  {/* Restore Button */}

                  {onRestore && (
                    <button
                      className="dropdown-action btn-restore"
                      onClick={() => {
                          onRestore();
                          closeMenu();
                      }}

                    >
                      <FontAwesomeIcon icon={faRotate} />
                      <span>Restore</span>
                    </button>
                  )}

                  {/* Lift Suspension Button */}

                  {onLiftSuspension && (
                    <button
                      className="dropdown-action btn-restore"
                      onClick={() => {
                          onLiftSuspension();
                          closeMenu();
                      }}

                    >
                      <FontAwesomeIcon icon={faRotate} />
                      <span>Lift Suspenison</span>
                    </button>
                  )}

                  {/* Redirect Suspension Link */}
                  {suspendLink && (
                    <Link
                      to={suspendLink}
                      className="dropdown-action btn-suspend"
                      title="Suspend"
                    >
                      <FontAwesomeIcon icon={faBan} /> 
                      <span>Suspend</span>
                    </Link>
                  )}     

                </div>

            )}

        </div>
    );
}


  return (


    
    <div className="action-buttons">

      {viewLink && (
        <Link
          to={viewLink}
          className="action-btn btn-view"
          title="View"
        >
          <FontAwesomeIcon icon={faEye}  /> {showLabel && <span>View</span>}
        </Link>
      )}

      {onEdit ? (
        <button
          type="button"
          className="action-btn btn-edit"
          title="Edit"
          onClick={onEdit}
        >
          <FontAwesomeIcon icon={faPen} />
          {showLabel && " Edit"}
        </button>
      ) : editLink ? (
        <Link
          to={editLink}
          className="action-btn btn-edit"
          title="Edit"
        >
          <FontAwesomeIcon icon={faPen} />
          {showLabel && " Edit"}
        </Link>
      ) : null}

      {onDelete && (
        <button
          onClick={onDelete}
          className="action-btn btn-delete"
          title="Delete"
        >
          <FontAwesomeIcon icon={faTrash} /> {showLabel && <span>Delete</span>}
        </button>
      )}


      {suspendLink && (
        <Link
          to={suspendLink}
          className="action-btn btn-suspend"
          title="Suspend"
        >
          <FontAwesomeIcon icon={faBan} /> {showLabel && <span>Suspend</span>}
        </Link>
      )}      

      {onSuspend && (
        <button
          onClick={onSuspend}
          className="action-btn btn-suspend"
          title="Suspend"
        >
          <FontAwesomeIcon icon={faBan} /> {showLabel && <span>Suspend</span>}
        </button>
      )}

      {onRestore && (
        <button
          onClick={onRestore}
          className="action-btn btn-restore"
          title="Restore"
        >
          <FontAwesomeIcon icon={faRotate} /> {showLabel && <span>Restort</span>}
        </button>
      )}

      {onLiftSuspension && (
        <button
          onClick={onLiftSuspension}
          className="action-btn btn-restore"
          title="List Suspension"
        >
          <FontAwesomeIcon icon={faRotate} /> {showLabel && <span>Lift Suspension</span>}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;