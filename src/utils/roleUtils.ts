export const getRoleBasedRoute = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return '/admin/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'tourguide':
      return '/guide/dashboard';
    case 'user':
    default:
      return '/dashboard';
  }
};

export const getUserDisplayName = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrator';
    case 'staff':
      return 'Staff Member';
    case 'tourguide':
      return 'Tour Guide';
    case 'user':
    default:
      return 'User';
  }
};

export const isAuthorizedForRoute = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.map(role => role.toLowerCase()).includes(userRole.toLowerCase());
};
