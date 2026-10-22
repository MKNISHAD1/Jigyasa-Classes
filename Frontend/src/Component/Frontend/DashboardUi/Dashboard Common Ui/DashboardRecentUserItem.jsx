import React from "react";

const DashboardRecentUserItem = ({ user, index }) => {
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatRole = (role) => {
        if (!role) return "Unknown";

        return role
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const roleClass = (user?.role || "unknown").toLowerCase();

    return (
        <tr>
            <td
                data-label="#"
                className="Dashboard_Recent_User_Index"
            >
                {index + 1}
            </td>

            <td data-label="Name">
                <div className="Dashboard_Recent_User_Name">
                    <img
                        src={user?.profile_pic || "/default-avatar.png"}
                        alt=""
                        loading="lazy"
                    />

                    <div className="Dashboard_Recent_User_Info">
                        <span className="Dashboard_Recent_User_Display_Name">
                            {user?.name || "Unknown User"}
                        </span>

                        <span className="Dashboard_Recent_User_Email">
                            {user?.email || "—"}
                        </span>

                        <span className="Dashboard_Recent_User_Date">
                            Joined {formatDate(user?.created_at)}
                        </span>
                    </div>
                </div>
            </td>

            <td data-label="Role">
                <span
                    className={`Dashboard_User_Role Dashboard_User_Role_${roleClass}`}
                >
                    {formatRole(user?.role)}
                </span>
            </td>

            <td
                data-label="Email"
                className="Dashboard_Recent_User_Desktop_Email"
            >
                {user?.email || "—"}
            </td>

            <td
                data-label="Joined At"
                className="Dashboard_Recent_User_Desktop_Date"
            >
                {formatDate(user?.created_at)}
            </td>
        </tr>
    );
};

export default DashboardRecentUserItem;