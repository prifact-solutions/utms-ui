export const UserRoles = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  LEARNER: 'LEARNER',
} as const;

export type UserRoleName = typeof UserRoles[keyof typeof UserRoles];