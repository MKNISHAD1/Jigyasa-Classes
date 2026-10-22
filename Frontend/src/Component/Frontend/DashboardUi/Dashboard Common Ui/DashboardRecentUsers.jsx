import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import DashboardRecentUserItem from "./DashboardRecentUserItem";
import DashboardSectionHeader from "./DashboardSectionHeader";

const DashboardRecentUsers = ({
    users = [],
    limit = 5,
    viewAllLink = "#",
}) => {
    const recentUsers = users.slice(0, limit);

    return (
        <section className="Dashboard_Recent_Users">
            <DashboardSectionHeader
                title="Recent Users"
                icon={faUsers}
                viewAllLink={viewAllLink}
            />

            <div className="Dashboard_Recent_Users_Table_Wrapper">
                <table className="Dashboard_Recent_Users_Table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Joined At</th>
                        </tr>
                    </thead>

                    <tbody>
                        {recentUsers.length > 0 ? (
                            recentUsers.map((user, index) => (
                                <DashboardRecentUserItem
                                    key={user.id}
                                    user={user}
                                    index={index}
                                />
                            ))
                        ) : (
                            <tr className="Dashboard_Recent_Users_Empty_Row">
                                <td
                                    colSpan={5}
                                    className="Dashboard_Recent_Users_Empty"
                                >
                                    No recent users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default DashboardRecentUsers;