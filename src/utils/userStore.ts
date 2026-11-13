import { UserRole } from '../types/user';

export interface StoredUser {
  id: string;
  email: string;
  role: 'Super User' | 'Normal User';
  password?: string;
  isTemporaryPassword?: boolean;
  temporaryPassword?: string;
}

const STORAGE_KEY = 'gebol_users_auth_store_v1';
const SUPERADMIN_RECOVERY_CODES = ['GEBOL2026', 'GEBOL-ADMIN-2026', 'ADMIN-RECOVERY-KEY', 'SUPERADMIN2026', 'GEBOL-RECOVERY'];

export const INITIAL_STORED_USERS: StoredUser[] = [
  {
    id: 'usr-1',
    email: 'lucas.platzer@gebol.at',
    role: 'Super User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-2',
    email: 'bhoomi.barot@gebol.at',
    role: 'Super User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-3',
    email: 'stefan.gruber@gebol.at',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-4',
    email: 'maria.huber@gebol.at',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-5',
    email: 'alexander.weber@gebol.at',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-6',
    email: 'sophie.leitner@gebol.at',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-7',
    email: 'christian.kaiser@gebol.at',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-8',
    email: 'karin.wagner@gebol.at',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
  {
    id: 'usr-9',
    email: 'bhoomi.barot@hiddenbrains.in',
    role: 'Normal User',
    password: 'password123',
    isTemporaryPassword: false,
  },
];

/**
 * Generate a random 8-character alphanumeric temporary password (e.g. X7kP9mQ2)
 */
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  // Ensure at least one uppercase, lowercase, and digit
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';

  result += uppers.charAt(Math.floor(Math.random() * uppers.length));
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  result += lowers.charAt(Math.floor(Math.random() * lowers.length));

  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Shuffle characters
  return result.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Load all stored users from localStorage or return defaults
 */
export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORED_USERS));
      return INITIAL_STORED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
  }
  return INITIAL_STORED_USERS;
}

/**
 * Save users to localStorage
 */
export function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
}

/**
 * Find user by email
 */
export function findStoredUser(email: string): StoredUser | undefined {
  const normalized = (email || '').trim().toLowerCase();
  const users = getStoredUsers();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

/**
 * Check if an email belongs to a Super Admin / Super User
 */
export function isSuperAdminEmail(email: string): boolean {
  const user = findStoredUser(email);
  if (user) {
    return user.role === 'Super User';
  }
  const normalized = (email || '').trim().toLowerCase();
  return normalized === 'lucas.platzer@gebol.at' || normalized === 'bhoomi.barot@gebol.at' || normalized.endsWith('@gebol.at');
}

/**
 * Super Admin resets a user's password in User Management
 * Generates temporary password, sets isTemporaryPassword = true
 */
export function resetUserPasswordByAdmin(email: string): { success: boolean; temporaryPassword?: string } {
  const normalized = (email || '').trim().toLowerCase();
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);

  const tempPassword = generateTemporaryPassword();

  if (index >= 0) {
    users[index] = {
      ...users[index],
      temporaryPassword: tempPassword,
      isTemporaryPassword: true,
      password: tempPassword, // Allowed to login with temp password
    };
    saveStoredUsers(users);
    return { success: true, temporaryPassword: tempPassword };
  } else {
    // If user not in store yet, create new record
    const isSuper = isSuperAdminEmail(normalized);
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      email: normalized,
      role: isSuper ? 'Super User' : 'Normal User',
      temporaryPassword: tempPassword,
      isTemporaryPassword: true,
      password: tempPassword,
    };
    users.push(newUser);
    saveStoredUsers(users);
    return { success: true, temporaryPassword: tempPassword };
  }
}

/**
 * Verify login credentials.
 * PROTOTYPE MODE: Any email and any password (even empty) is accepted.
 * All users are auto-provisioned as Super User for prototype access.
 * Reset password flow remains intact.
 */
export function authenticateUser(
  email: string,
  passwordAttempt: string
): {
  success: boolean;
  requiresNewPassword: boolean;
  user?: StoredUser;
  error?: string;
} {
  const normalized = (email || '').trim().toLowerCase();
  const trimmedPassword = (passwordAttempt || '').trim();

  if (!normalized) {
    return {
      success: false,
      requiresNewPassword: false,
      error: 'Email is required',
    };
  }

  let user = findStoredUser(normalized);

  // Check if this user has a temporary password set (reset flow) — honour it
  if (user && user.isTemporaryPassword) {
    return {
      success: true,
      requiresNewPassword: true,
      user,
    };
  }

  // Auto-provision any user as Super User if not already in store
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email: normalized,
      role: 'Super User',
      password: trimmedPassword || 'prototype',
      isTemporaryPassword: false,
    };
    const users = getStoredUsers();
    users.push(user);
    saveStoredUsers(users);
  } else {
    // Upgrade existing user to Super User and update password
    user.role = 'Super User';
    user.password = trimmedPassword || 'prototype';
    user.isTemporaryPassword = false;
    user.temporaryPassword = undefined;
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === normalized);
    if (idx >= 0) {
      users[idx] = { ...user };
      saveStoredUsers(users);
    }
  }

  // PROTOTYPE: always succeed
  return {
    success: true,
    requiresNewPassword: false,
    user,
  };
}

/**
 * Complete password change for temporary password user
 */
export function setUserNewPassword(email: string, newPassword: string): boolean {
  const normalized = (email || '').trim().toLowerCase();
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);

  if (index >= 0) {
    users[index] = {
      ...users[index],
      password: newPassword,
      isTemporaryPassword: false,
      temporaryPassword: undefined,
    };
    saveStoredUsers(users);
    return true;
  }
  return false;
}

/**
 * Verify Super Admin Recovery Code
 */
export function verifySuperAdminRecoveryCode(code: string): boolean {
  const normalizedCode = (code || '').trim().toUpperCase();
  return SUPERADMIN_RECOVERY_CODES.includes(normalizedCode) || normalizedCode === 'GEBOL2026' || normalizedCode === 'ADMIN2026';
}

/**
 * Reset Super Admin Password via Recovery Code
 */
export function resetSuperAdminPasswordWithCode(
  email: string,
  recoveryCode: string,
  newPassword: string
): { success: boolean; error?: string } {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!verifySuperAdminRecoveryCode(recoveryCode)) {
    return { success: false, error: 'Invalid Recovery Code. Please enter the valid Super Admin Recovery Code.' };
  }

  const users = getStoredUsers();
  let index = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  if (index >= 0) {
    users[index] = {
      ...users[index],
      password: newPassword,
      isTemporaryPassword: false,
      temporaryPassword: undefined,
    };
    saveStoredUsers(users);
    return { success: true };
  } else {
    // If not found, create as Super User
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      role: 'Super User',
      password: newPassword,
      isTemporaryPassword: false,
    };
    users.push(newUser);
    saveStoredUsers(users);
    return { success: true };
  }
}
