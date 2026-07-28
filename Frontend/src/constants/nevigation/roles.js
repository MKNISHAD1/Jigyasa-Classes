export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  TEACHER: "teacher",
  STUDENT: "student",
};

// User Groups


export const ROLE_GROUPS = {

  ADMIN_ACCESS: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MODERATOR,
  ],

  COURSE_ACCESS: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MODERATOR,
    ROLES.TEACHER,
  ],

  SUPER_ADMIN_ONLY: [
    ROLES.SUPER_ADMIN,
  ],

  ALL_AUTH_USERS: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MODERATOR,
    ROLES.TEACHER,
    ROLES.STUDENT,
  ],
};