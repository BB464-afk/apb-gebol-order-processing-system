export type UserRole = 'Super User' | 'Superadmin' | 'Normal User';

export interface UserProfile {
  email: string;
  name: string;
  initials: string;
  role: UserRole;
  canAccessMasterData: boolean;
}

export function getUserProfile(email?: string, selectedRole?: UserRole): UserProfile {
  const normalized = (email || '').trim().toLowerCase();

  // If a role was explicitly selected in the login dropdown, honor it directly!
  if (selectedRole) {
    const isSuper = selectedRole === 'Super User' || selectedRole === 'Superadmin';
    const emailToUse = normalized || (isSuper ? 'lucas.platzer@gebol.at' : 'bhoomi.barot@gebol.at');
    const namePart = emailToUse.split('@')[0].replace(/[._-]/g, ' ');
    const capitalizedName = namePart
      .split(' ')
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    const parts = capitalizedName.split(' ');
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : capitalizedName.slice(0, 2).toUpperCase() || (isSuper ? 'LP' : 'NU');

    return {
      email: email?.trim() || emailToUse,
      name: capitalizedName || (isSuper ? 'Super User' : 'Normal User'),
      initials,
      role: selectedRole,
      canAccessMasterData: isSuper,
    };
  }

  // Specifically check for Bhoomi Barot: Normal User with NO access to Master Data
  if (normalized === 'bhoomi.barot@hiddenbrains.in') {
    return {
      email: 'bhoomi.barot@hiddenbrains.in',
      name: 'Bhoomi Barot',
      initials: 'BB',
      role: 'Normal User',
      canAccessMasterData: false,
    };
  }

  // Specifically check for Lucas Platzer: Super User with full access
  if (normalized === 'lucas.platzer@gebol.at') {
    return {
      email: 'Lucas.Platzer@gebol.at',
      name: 'Lucas Platzer',
      initials: 'LP',
      role: 'Super User',
      canAccessMasterData: true,
    };
  }

  // Default if empty or generic super user
  if (!normalized) {
    return {
      email: 'Lucas.Platzer@gebol.at',
      name: 'Lucas Platzer',
      initials: 'LP',
      role: 'Super User',
      canAccessMasterData: true,
    };
  }

  // Any other gebol.at address is treated as Super User, all others are Normal Users
  if (normalized.endsWith('@gebol.at')) {
    const namePart = normalized.split('@')[0].replace(/[._-]/g, ' ');
    const capitalizedName = namePart
      .split(' ')
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    const parts = capitalizedName.split(' ');
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : capitalizedName.slice(0, 2).toUpperCase() || 'SU';

    return {
      email: email?.trim() || normalized,
      name: capitalizedName || 'Super User',
      initials,
      role: 'Super User',
      canAccessMasterData: true,
    };
  }

  // Other standard users: Normal User (cannot access Master Data)
  const namePart = normalized.split('@')[0].replace(/[._-]/g, ' ');
  const capitalizedName = namePart
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
  const parts = capitalizedName.split(' ');
  const initials =
    parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : capitalizedName.slice(0, 2).toUpperCase() || 'NU';

  return {
    email: email?.trim() || normalized,
    name: capitalizedName || 'Normal User',
    initials,
    role: 'Normal User',
    canAccessMasterData: false,
  };
}

