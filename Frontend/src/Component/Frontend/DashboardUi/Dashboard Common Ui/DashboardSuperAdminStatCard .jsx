import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DashboardAdminStatCard = ({
    title,
    value,
    icon,
    variant = "blue",
    details = [],
    trend,
    onClick,
}) => {
    return (
        <div
            className={`Dashboard_Admin_Stat_Card Dashboard_Admin_Stat_Card_${variant}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="Dashboard_Admin_Stat_Top">
                <div className="Dashboard_Admin_Stat_Icon">
                    <FontAwesomeIcon icon={icon} />
                </div>

                <div className="Dashboard_Admin_Stat_Main">
                    <span className="Dashboard_Admin_Stat_Title">
                        {title}
                    </span>

                    <strong className="Dashboard_Admin_Stat_Value">
                        {value ?? "0"}
                    </strong>
                </div>

                {trend && (
                    <span className="Dashboard_Admin_Stat_Trend">
                        {trend}
                    </span>
                )}
            </div>

            {details.length > 0 && (
                <div className="Dashboard_Admin_Stat_Details">
                    {details.map((detail, index) => (
                        <span key={`${detail.label}-${index}`}>
                            <strong>{detail.value}</strong>
                            <small>{detail.label}</small>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardAdminStatCard;