import { PREFIX } from "./prefixes";

const USERS = `${PREFIX.ADMIN}/users`;
const COURSE = `${PREFIX.ADMIN}/course`;
const LESSON = `${PREFIX.ADMIN}/lesson`;

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  ABOUT: "/about-us",
  CONTACT: "/contact-us",
  COURSES: "/courses",
  COURSE_CARD: "/coursecard",
  COURSE_VIEW: "/courseview/:id/:title",
};

// Authenticaton
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  TWO_FACTOR: "/two-factor",
  EMAIL_VERIFIED: "/email-verified",
  UNAUTHORIZED: "/unauthorized",
};

// Dashboard
export const DASHBOARD_ROUTES = {
  DASHBOARD: PREFIX.DASHBOARD,
  VIEW_PROFILE: "/view-profile",
  EDIT_PROFILE: "/edit-profile",
  CHANGE_PASSWORD: "/changepassword",
};

//User Management
export const USER_ROUTES = {
  LIST: `${USERS}/list`,
  CREATE: `${USERS}/create-user`,
  VIEW: `${USERS}/view-user/:id`,
  EDIT: `${USERS}/edit-user/:id`,
  DELETED: `${USERS}/deleted-users`,
  SUSPENDED: `${USERS}/suspended-users`,
  SUSPEND: `${USERS}/:id/suspend`,
};

//Course Routes
export const COURSE_ROUTES = {

  LIST: `${PREFIX.ADMIN}/courses`,
  MY_COURSE: `${COURSE}/my-courses`,
  CREATE: `${COURSE}/create`,
  VIEW: `${COURSE}/view-course/:id`,
  UPDATE: `${COURSE}/update-course/:id`,
  DELETED: `${COURSE}/deleted-courses`,
  MODULES: `${COURSE}/:id/course-modules`,
  MODULE_ORDER: `${COURSE}/:id/module-order`,
  MODULE_LESSON_REORDER: `${COURSE}/:id/module/:moduleId/reorder-lessons`,
};

// Lesson Rotes
export const LESSON_ROUTES = {
  CREATE: `${LESSON}/create`,
  TRASH: `${COURSE}/:courseId/lessons/trashed`,
  ORDER: `${COURSE}/:courseId/lesson/changelessonorder`,
  EDIT: `${COURSE}/:courseId/lesson/:lessonId/edit`,
  PLAYER: `${COURSE}/:courseId/lesson/:lessonId/lessonplayer`,
};

// Faq
export const FAQ_ROUTES = {
    CREATE: `${PREFIX.ADMIN}/faq/create`,
};

// Caategory Routes
export const CATEGORY_ROUTES = {
    MANAGE: `${PREFIX.ADMIN}/managecategories`,
};

//Contact Us Routes
export const CONTACT_ROUTES = {
    LIST: `${PREFIX.ADMIN}/contact-messages`,
    VIEW: `${PREFIX.ADMIN}/contact-message/:id`,
};

//Super  Admin
export const SUPERADMIN_ROUTES = {
    HOME: PREFIX.SUPER_ADMIN,
};

//  Utility Routes
export const UTILITY_ROUTES = {
    VIDEO_TEST: "/videoplay",
};