import React from "react";

const DashboardSection = ({
    title,
    icon,
    children,
    action,
    className = "",
}) => {
    return (
        <section className={`Dashboard_Section ${className}`}>
            <div className="Dashboard_Section_Header">
                <div className="Dashboard_Section_Title">
                    {icon && (
                        <span className="Dashboard_Section_Icon">
                            {icon}
                        </span>
                    )}

                    <h2>{title}</h2>
                </div>

                {action && (
                    <div className="Dashboard_Section_Action">
                        {action}
                    </div>
                )}
            </div>

            <div className="Dashboard_Section_Body">
                {children}
            </div>
        </section>
    );
};

export default DashboardSection;