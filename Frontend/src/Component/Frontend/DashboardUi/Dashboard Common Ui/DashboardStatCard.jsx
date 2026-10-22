import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DashboardStatCard = ({
    title,
    value,
    icon,
    variant = "blue",
    description,
    onClick,
}) => {
    return (
        <div
            className={`Dashboard_Stat_Card Dashboard_Stat_${variant}`}
            onClick={onClick}
        >
            <div className="Dashboard_Stat_Icon">
                <FontAwesomeIcon icon={icon} />
            </div>

            <div className="Dashboard_Stat_Content">
                <span className="Dashboard_Stat_Title">
                    {title}
                </span>

                <strong className="Dashboard_Stat_Value">
                    {value}
                </strong>

                {description && (
                    <small className="Dashboard_Stat_Description">
                        {description}
                    </small>
                )}
            </div>

            {onClick && (
                <div className="Dashboard_Stat_Arrow">
                    →
                </div>
            )}
        </div>
    );
};

export default DashboardStatCard;