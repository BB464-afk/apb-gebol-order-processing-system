import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Database,
  ChevronDown,
  ChevronRight,
  Users,
  Package,
  Menu,
  UserCog,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export type NavItem =
  | 'processing'
  | 'orders'
  | 'customer-master'
  | 'article-master'
  | 'user-management';

interface SidebarProps {
  activeNav: NavItem;
  onNavigate: (item: NavItem) => void;
  needsReviewCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  canAccessMasterData?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  needsReviewCount = 0,
  isCollapsed,
  onToggleCollapse,
  canAccessMasterData = true,
}) => {
  const { isThemeB } = useTheme();
  const { dict } = useLanguage();
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(
    activeNav === 'customer-master' || activeNav === 'article-master'
  );

  const isMasterDataActive =
    activeNav === 'customer-master' || activeNav === 'article-master';

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } ${
        isThemeB
          ? 'bg-[#161922] text-white border-[#262A36]'
          : 'bg-[#F9FAFB] text-gray-700 border-gray-200'
      } flex flex-col shrink-0 h-screen sticky top-0 border-r select-none z-30 transition-all duration-200 ease-in-out font-['Open_Sans']`}
      style={{ fontFamily: "'Open Sans', sans-serif" }}
    >
      {/* Top Sidebar Header with Gebol Logo & Hamburger Menu Button */}
      {isCollapsed ? (
        <div
          className={`h-14 px-2 flex items-center justify-center transition-all ${
            isThemeB ? 'bg-[#161922]' : 'bg-[#F9FAFB]'
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isThemeB
                ? 'text-gray-300 hover:bg-[#262A36] hover:text-white'
                : 'text-gray-700 hover:bg-gray-200/60 hover:text-gray-900'
            }`}
            title={dict.nav.expandSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          className={`h-14 px-3 flex items-center justify-between gap-2 transition-all border-b ${
            isThemeB
              ? 'bg-[#161922] border-[#262A36]'
              : 'bg-[#F9FAFB] border-gray-100'
          }`}
        >
          <div className="flex items-center overflow-hidden flex-1">
            <img
              src="/expanded.png"
              alt="GEBOL Enterprise Logo"
              className="h-7 max-w-[155px] w-auto object-contain transition-all select-none"
            />
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isThemeB
                ? 'text-gray-300 hover:bg-[#262A36] hover:text-white'
                : 'text-gray-700 hover:bg-gray-200/60 hover:text-gray-900'
            }`}
            title={dict.nav.collapseSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 w-full px-2 py-4 space-y-1.5 overflow-y-auto text-[14px] font-medium">
        {/* Orders (Contains Notification Badge) */}
        <button
          onClick={() => onNavigate('orders')}
          title={isCollapsed ? `${dict.nav.orders} (${needsReviewCount} ${dict.nav.pendingCount})` : undefined}
          className={`w-full flex items-center relative ${
            isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
          } rounded text-[14px] transition-colors text-left cursor-pointer overflow-hidden ${
            activeNav === 'orders'
              ? isThemeB
                ? 'text-[#262626] font-bold shadow-xs'
                : 'text-gray-900 font-bold'
              : isThemeB
              ? 'text-gray-300 hover:bg-[#262A36] hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {activeNav === 'orders' && (
            <>
              {/* Selected background with brand styling */}
              <motion.div
                layoutId="sidebar-active-bg"
                className={`absolute inset-0 ${
                  isThemeB ? 'bg-[#F8B800]' : 'bg-[#F8B800]/15'
                } rounded`}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
              {/* Yellow line indicator */}
              {!isThemeB && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#F8B800] rounded-r-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </>
          )}
          {isCollapsed ? (
            <div className="w-5 h-5 flex items-center justify-center relative z-10">
              <FileText
                className={`w-4 h-4 shrink-0 ${
                  activeNav === 'orders'
                    ? isThemeB
                      ? 'text-[#262626]'
                      : 'text-[#D97706]'
                    : ''
                }`}
              />
              {needsReviewCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-[#ED6C02] text-white text-[9px] font-bold font-mono flex items-center justify-center rounded-full border border-white/60 shadow-xs pointer-events-none">
                  {needsReviewCount}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 relative z-10">
                <FileText
                  className={`w-4 h-4 shrink-0 ${
                    activeNav === 'orders'
                      ? isThemeB
                        ? 'text-[#262626]'
                        : 'text-[#D97706]'
                      : ''
                  }`}
                />
                <span>{dict.nav.orders}</span>
              </div>
              {needsReviewCount > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 font-bold rounded font-mono relative z-10 ${
                    activeNav === 'orders'
                      ? isThemeB
                        ? 'bg-[#161922] text-[#F8B800]'
                        : 'bg-[#ED6C02] text-white'
                      : 'bg-[#ED6C02] text-white'
                  }`}
                >
                  {needsReviewCount}
                </span>
              )}
            </>
          )}
        </button>

        {/* Master Data Navigation Item - Only accessible for Superadmin */}
        {canAccessMasterData && (
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  onToggleCollapse();
                  setIsMasterDataOpen(true);
                  onNavigate('customer-master');
                } else {
                  setIsMasterDataOpen(!isMasterDataOpen);
                }
              }}
              title={isCollapsed ? dict.nav.masterData : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
              } rounded text-[14px] transition-colors text-left cursor-pointer ${
                isMasterDataActive && isCollapsed
                  ? isThemeB
                    ? 'bg-[#F8B800] text-[#262626] font-bold shadow-xs'
                    : 'bg-[#F8B800]/15 text-gray-900 font-bold'
                  : isThemeB
                  ? 'text-gray-300 hover:bg-[#262A36] hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {isCollapsed ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <Database
                    className={`w-4 h-4 shrink-0 ${
                      isMasterDataActive
                        ? isThemeB
                          ? 'text-[#262626]'
                          : 'text-[#D97706]'
                        : ''
                    }`}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Database
                      className={`w-4 h-4 shrink-0 ${
                        isMasterDataActive
                          ? isThemeB
                            ? 'text-[#F8B800]'
                            : 'text-[#D97706]'
                          : ''
                      }`}
                    />
                    <span>{dict.nav.masterData}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 text-gray-400 ${
                      isMasterDataOpen ? 'rotate-180 text-gray-600' : ''
                    }`}
                  />
                </>
              )}
            </button>

            {/* Sub-menu (Customer & Article Master) */}
            {isMasterDataOpen && !isCollapsed && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-gray-200 ml-4">
                {/* Customer Master */}
                <button
                  onClick={() => onNavigate('customer-master')}
                  className={`w-full flex items-center relative justify-between px-3 py-2 rounded text-[13px] transition-colors text-left cursor-pointer overflow-hidden ${
                    activeNav === 'customer-master'
                      ? isThemeB
                        ? 'text-[#262626] font-bold shadow-xs'
                        : 'text-gray-900 font-bold'
                      : isThemeB
                      ? 'text-gray-400 hover:bg-[#262A36] hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {activeNav === 'customer-master' && (
                    <>
                      <motion.div
                        layoutId="sidebar-sub-active-bg"
                        className={`absolute inset-0 ${
                          isThemeB ? 'bg-[#F8B800]' : 'bg-[#F8B800]/15'
                        } rounded`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                      {!isThemeB && (
                        <motion.div
                          layoutId="sidebar-sub-active-indicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#F8B800] rounded-r-sm"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-2.5 relative z-10">
                    <Users
                      className={`w-3.5 h-3.5 shrink-0 ${
                        activeNav === 'customer-master'
                          ? isThemeB
                            ? 'text-[#262626]'
                            : 'text-[#D97706]'
                          : ''
                      }`}
                    />
                    <span>{dict.nav.customerMaster}</span>
                  </div>
                </button>

                {/* Article Master */}
                <button
                  onClick={() => onNavigate('article-master')}
                  className={`w-full flex items-center relative justify-between px-3 py-2 rounded text-[13px] transition-colors text-left cursor-pointer overflow-hidden ${
                    activeNav === 'article-master'
                      ? isThemeB
                        ? 'text-[#262626] font-bold shadow-xs'
                        : 'text-gray-900 font-bold'
                      : isThemeB
                      ? 'text-gray-400 hover:bg-[#262A36] hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {activeNav === 'article-master' && (
                    <>
                      <motion.div
                        layoutId="sidebar-sub-active-bg"
                        className={`absolute inset-0 ${
                          isThemeB ? 'bg-[#F8B800]' : 'bg-[#F8B800]/15'
                        } rounded`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                      {!isThemeB && (
                        <motion.div
                          layoutId="sidebar-sub-active-indicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#F8B800] rounded-r-sm"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-2.5 relative z-10">
                    <Package
                      className={`w-3.5 h-3.5 shrink-0 ${
                        activeNav === 'article-master'
                          ? isThemeB
                            ? 'text-[#262626]'
                            : 'text-[#D97706]'
                          : ''
                      }`}
                    />
                    <span>{dict.nav.articleMaster}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Management Navigation Item - Only accessible for Super User */}
        {canAccessMasterData && (
          <button
            onClick={() => onNavigate('user-management')}
            title={isCollapsed ? dict.nav.userManagement : undefined}
            className={`w-full flex items-center relative ${
              isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
            } rounded text-[14px] transition-colors text-left cursor-pointer overflow-hidden ${
              activeNav === 'user-management'
                ? isThemeB
                  ? 'text-[#262626] font-bold shadow-xs'
                  : 'text-gray-900 font-bold'
                : isThemeB
                ? 'text-gray-300 hover:bg-[#262A36] hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {activeNav === 'user-management' && (
              <>
                <motion.div
                  layoutId="sidebar-active-bg"
                  className={`absolute inset-0 ${
                    isThemeB ? 'bg-[#F8B800]' : 'bg-[#F8B800]/15'
                  } rounded`}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
                {!isThemeB && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#F8B800] rounded-r-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </>
            )}
            {isCollapsed ? (
              <div className="w-5 h-5 flex items-center justify-center relative z-10">
                <UserCog
                  className={`w-4 h-4 shrink-0 ${
                    activeNav === 'user-management'
                      ? isThemeB
                        ? 'text-[#262626]'
                        : 'text-[#D97706]'
                      : ''
                  }`}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 relative z-10">
                <UserCog
                  className={`w-4 h-4 shrink-0 ${
                    activeNav === 'user-management'
                      ? isThemeB
                        ? 'text-[#262626]'
                        : 'text-[#D97706]'
                      : ''
                  }`}
                />
                <span>{dict.nav.userManagement}</span>
              </div>
            )}
          </button>
        )}
      </nav>
    </aside>
  );
};
