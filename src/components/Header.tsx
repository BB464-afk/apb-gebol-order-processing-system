import React, { useState, useRef, useEffect } from 'react';
import { Upload, LogOut, ShieldCheck, Mail, User } from 'lucide-react';
import { getUserProfile, UserRole } from '../types/user';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNewIntake: () => void;
  activeNavTitle?: string;
  activeNav?: 'processing' | 'orders' | 'customer-master' | 'article-master';
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  userEmail?: string;
  userRole?: UserRole;
  isNormalUser?: boolean;
  onLogout?: () => void;
  onNavigateToEntity?: (nav: 'orders' | 'processing' | 'customer-master' | 'article-master', poId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewIntake,
  activeNavTitle = 'Order Details',
  activeNav,
  isSidebarCollapsed = false,
  onToggleSidebar,
  userEmail = 'Lucas.Platzer@gebol.at',
  userRole,
  isNormalUser = false,
  onLogout,
  onNavigateToEntity,
}) => {
  const { isThemeB } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isUploadOrder = activeNav === 'processing';
  const user = getUserProfile(userEmail, userRole);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isProfileOpen]);

  return (
    <header
      className={`h-14 min-h-[56px] max-h-[56px] shrink-0 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-all border-b select-none ${
        isThemeB
          ? 'bg-[#161922] border-[#262A36] text-white'
          : 'bg-[#F9FAFB] border-gray-200 text-[#4f4f4e]'
      }`}
    >
      {/* Left side: Show Gebol logo ONLY when sidebar is collapsed (or for normal users) */}
      <div className="flex items-center space-x-3">
        {(isSidebarCollapsed || isNormalUser) && (
          <div className="flex items-center py-1 animate-in fade-in duration-150">
            {isThemeB ? (
              <img
                src="/B%20Logo.png"
                alt="GEBOL"
                className="h-7 w-auto max-w-[155px] object-contain"
              />
            ) : (
              <img
                src="/expanded.png"
                alt="GEBOL"
                className="h-7 w-auto max-w-[155px] object-contain transition-all"
              />
            )}
          </div>
        )}

        {activeNavTitle &&
          activeNav !== 'processing' &&
          activeNav !== 'orders' &&
          activeNav !== 'customer-master' &&
          activeNav !== 'article-master' &&
          activeNavTitle !== 'Upload Order' &&
          activeNavTitle !== 'Orders' &&
          activeNavTitle !== 'Master Data' && (
            <h1
              className={`text-base font-bold tracking-tight page-header-title ${
                isThemeB ? 'text-white' : 'text-[#4f4f4e]'
              }`}
            >
              {activeNavTitle}
            </h1>
          )}
      </div>

      {/* Right side: Notification Center & Profile Menu */}
      <div className="flex items-center space-x-2.5">
        {/* Notification Center */}
        <NotificationCenter onNavigateToEntity={onNavigateToEntity} />

        {/* Profile Avatar & Corner Dropdown Section */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            title={`User Profile (${user.name})`}
            style={{ borderRadius: '50%', color: '#ffffff' }}
            className="w-7 h-7 rounded-full bg-[#262626] text-white hover:bg-[#383838] active:scale-95 border-2 border-[#F8B800] flex items-center justify-center font-bold text-[11px] shadow-xs transition-all cursor-pointer select-none shrink-0 header-profile-btn"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <span className="header-profile-initials text-white" style={{ color: '#ffffff' }}>
              {user.initials}
            </span>
          </button>

          {/* Profile Dropdown Corner Card */}
          {isProfileOpen && (
            <div className="profile-dropdown-card absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E0E0E0] py-3 px-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Header / Avatar & Name */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 profile-dropdown-header">
                <div
                  style={{ borderRadius: '50%', color: '#ffffff' }}
                  className="w-10 h-10 rounded-full bg-[#262626] text-white border-2 border-[#F8B800] flex items-center justify-center font-bold text-sm shrink-0"
                >
                  <span className="header-profile-initials text-white" style={{ color: '#ffffff' }}>
                    {user.initials}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#1A1A1A] profile-text-dark profile-user-name truncate">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 profile-user-email font-medium truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* User Details */}
              <div className="py-2.5 space-y-2 text-xs profile-details-body">
                <div className="flex items-start gap-2 text-gray-600 profile-detail-row">
                  <Mail className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0 profile-detail-icon" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-medium profile-detail-label">Email ID</span>
                    <span className="text-xs text-[#1A1A1A] profile-text-dark profile-detail-value font-medium break-all select-all">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-gray-600 profile-detail-row">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0 profile-detail-icon" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-medium profile-detail-label">Role</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-[#1A1A1A] profile-text-dark profile-role-badge">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <div className="pt-2 border-t border-gray-100 profile-dropdown-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer profile-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
