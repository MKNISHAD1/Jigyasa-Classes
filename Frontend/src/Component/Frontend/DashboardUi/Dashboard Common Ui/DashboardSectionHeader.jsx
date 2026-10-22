import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const DashboardSectionHeader = ({
    title,
    icon,
    viewAllLink,
    onViewAll,
}) => {
    return (
        <div className="Dashboard_Recent_Section_Header">
            <div className="Dashboard_Recent_Section_Title">
                <FontAwesomeIcon
                    icon={icon}
                    className="Dashboard_Recent_Section_Icon"
                />

                <h5>{title}</h5>
            </div>

            {(viewAllLink || onViewAll) && (
                <a
                    href={viewAllLink || "#"}
                    className="Dashboard_Recent_View_All"
                    onClick={
                        onViewAll
                            ? (event) => {
                                  event.preventDefault();
                                  onViewAll();
                              }
                            : undefined
                    }
                >
                    View All

                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className="Icon"
                    />
                </a>
            )}
        </div>
    );
};

export default DashboardSectionHeader;