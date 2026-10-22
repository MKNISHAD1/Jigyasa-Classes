import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBolt,
    faBook,
    faCirclePlay,
    faGear,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";

import DashboardQuickAction from "./DashboardQuickAction";
import DashboardSectionHeader from "./DashboardSectionHeader";


const DashboardQuickActionsSection = () => {

    const actions = [
        {
            title: "Create New Course",
            icon: faBook,
            variant: "blue",
        },
        {
            title: "Upload Lesson",
            icon: faCirclePlay,
            variant: "green",
        },
        {
            title: "Manage Courses",
            icon: faGear,
            variant: "purple",
        },
        {
            title: "View Students",
            icon: faUsers,
            variant: "orange",
        },
    ];


    return (
        <section className="Dashboard_Quick_Actions">

            {/* Section Header */}
            <DashboardSectionHeader
                title="Quick Actions"
                icon={faBolt}
            />

            <div className="Dashboard_Quick_Actions_List">

                {actions.map((action) => (
                    <DashboardQuickAction
                        key={action.title}
                        title={action.title}
                        icon={action.icon}
                        variant={action.variant}
                    />
                ))}

            </div>

        </section>
    );
};


export default DashboardQuickActionsSection;