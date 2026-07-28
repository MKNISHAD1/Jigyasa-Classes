import {
  DASHBOARD_ROUTES,
  USER_ROUTES,
  COURSE_ROUTES,
  LESSON_ROUTES,
  FAQ_ROUTES,
  CATEGORY_ROUTES,
  CONTACT_ROUTES,
} from "./routes";

import { faHouse,faUser,faLock,faUsers,faBookOpen,faCirclePlus,faTrash,faCircleQuestion,faGraduationCap,faGlobe,faFolderTree,faEnvelope,faShieldHalved, faQuestion, faUserPen, faBook, faBan } from "@fortawesome/free-solid-svg-icons";

import { ROLE_GROUPS } from "./roles";
import { FaBook } from "react-icons/fa";

export const DASHBOARD_LINKS = [
    {
        title: "Dashboard",
        path: DASHBOARD_ROUTES.DASHBOARD,
        icon: faHouse,
    },


];

export const SIDEBAR_SECTIONS = [


    
    // Self User Management
    {
        title: "Profile ",
        roles: ROLE_GROUPS.ALL_AUTH_USERS,
        icon: faUser,

        items: [
            {
                title: "View Profile",
                path: DASHBOARD_ROUTES.VIEW_PROFILE,
                icon: faUser,
            },
            
            {
                title: "Edit Profile",
                path: DASHBOARD_ROUTES.EDIT_PROFILE,
                icon: faUserPen,
            },

            {
                title: "Change Password",
                path: DASHBOARD_ROUTES.CHANGE_PASSWORD,
                icon: faLock,
            },
        ]

    },

    // Admin Access User Management

    {
        title: "User Management",
        roles: ROLE_GROUPS.ADMIN_ACCESS,
        icon: faUsers,

        items: [
            
            {
                title: "Manage Users",
                path: USER_ROUTES.LIST,
                icon: faUser,

            },
            {
                title: "Create User",
                path: USER_ROUTES.CREATE,
                icon: faCirclePlus,
            },
            {
                title: "Deleted Users",
                path: USER_ROUTES.DELETED,
                icon: faTrash,
            },
            {
                title: "Suspended User",
                path: USER_ROUTES.SUSPENDED,
                icon:faBan,
            },
        ],
    },

    //Course Management
    {
        title: "Course Management",
        roles: ROLE_GROUPS.COURSE_ACCESS,
        icon: faBookOpen,

        items: [

            {
                title: "My Courses",
                path: COURSE_ROUTES.MY_COURSE,
                icon: faBook,
            },
            
            {
                title: "Manage Courses",
                path: COURSE_ROUTES.LIST,
                icon: faBookOpen,
                roles: ROLE_GROUPS.ADMIN_ACCESS,

            },
            {
                title: "Create Course",
                path: COURSE_ROUTES.CREATE,
                icon: faCirclePlus,
            },
            {
                title: "Deleted Courses",
                path: COURSE_ROUTES.DELETED,
                icon: faTrash,
                roles: ROLE_GROUPS.ADMIN_ACCESS,
            },
            {
                title: "FAQ",
                path: FAQ_ROUTES.CREATE,
                icon:faQuestion
            },
        ],
    },

    // Lesson Management
    {
        title: "Lesson Management",
        roles: ROLE_GROUPS.COURSE_ACCESS,
        icon: faGraduationCap,

        items: [
            {
                title: "Create Lesson",
                path: LESSON_ROUTES.CREATE,
                icon:faCirclePlus,
            },
        ],
    },
    // Website

    {
        title: "Website",

        roles: ROLE_GROUPS.COURSE_ACCESS,
        icon:faGlobe,

        items: [
            {
                title: "Categories",
                path: CATEGORY_ROUTES.MANAGE,
                icon:faFolderTree,
                roles: ROLE_GROUPS.ADMIN_ACCESS,
            },
            {
                title: "Contact Messages",
                path: CONTACT_ROUTES.LIST,
                icon:faEnvelope,
            },
        ],
    },

    // Super Admin  Only
    {
        title: "Super Admin",

        roles: ROLE_GROUPS.SUPER_ADMIN_ONLY,
        icon:faShieldHalved,

        items: [
            {
                title: "Manage Admins",
                path: "#",
                icon:faUsers,
            },
            {
                title: "Deleted Admins",
                path: "#",
                icon:faTrash,
            },
        ],
    },

]