import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const DashboardQuickAction = ({
    title,
    icon,
    variant = "blue",
    onClick,
}) => {

    return (
        <button
            type="button"
            className={`Dashboard_Quick_Action Dashboard_Quick_Action_${variant}`}
            onClick={onClick}
        >
            <span className="Dashboard_Quick_Action_Icon">
                <FontAwesomeIcon icon={icon} />
            </span>

            <span className="Dashboard_Quick_Action_Title">
                {title}
            </span>
        </button>
    );
};


export default DashboardQuickAction;