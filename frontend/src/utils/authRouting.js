import { ROLES } from './roles';

export const getDashboardPathByRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.HOSPITAL:
      return '/hospital';
    case ROLES.DONOR:
      return '/donor';
    case ROLES.BLOOD_REQUESTER:
      return '/requester';
    default:
      return '/';
  }
};
