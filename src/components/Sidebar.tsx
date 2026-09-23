import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Database,
  ChevronDown,
  ChevronRight,
  Users,
  Package,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export type NavItem =
  | 'processing'
  | 'orders'
  | 'customer-master'
  | 'article-master';

interface SidebarProps {
  activeNav: NavItem;
  onNavigate: (item: NavItem) => void;
  needsReviewCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  canAccessMasterData?: boolean;
}

const GebolLogo: React.FC<{ isCollapsed: boolean; onLogoClick?: () => void }> = ({ isCollapsed, onLogoClick }) => {
  const [imgError, setImgError] = useState(false);
  const { isThemeB } = useTheme();

  if (isCollapsed) {
    return (
      <div
        onClick={onLogoClick}
        title="Click to expand menu"
        className="flex items-center justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
      >
        {!imgError ? (
          <img
            src="/collapse.png"
            alt="GEBOL G Logo"
            className={`${isThemeB ? 'w-12 h-12' : 'w-8 h-8'} object-contain rounded transition-all`}
            onError={() => setImgError(true)}
            onLoad={(e) => {
              if (e.currentTarget.naturalWidth === 0) {
                setImgError(true);
              }
            }}
          />
        ) : (
          <div
            className={`${
              isThemeB ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-lg'
            } bg-[#F8B800] text-[#262626] font-extrabold rounded flex items-center justify-center shadow-xs select-none`}
          >
            G
          </div>
        )}
      </div>
    );
  }

  // Expanded Sidebar Logo:
  // In Theme B: /B%20Logo.png (or /%20B%20Login.png)
  // In Theme A: /expanded.png
  const expandedLogo = isThemeB
    ? '/B%20Logo.png'
    : '/expanded.png';

  return (
    <div className="flex items-center justify-center w-full gap-2 overflow-hidden select-none">
      {!imgError ? (
        <img
          key={expandedLogo}
          src={expandedLogo}
          alt="GEBOL Enterprise Logo"
          className={`${
            isThemeB ? 'h-16 max-w-[240px]' : 'h-8 max-w-[170px]'
          } w-auto object-contain mx-auto transition-all`}
          onError={() => setImgError(true)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth === 0) {
              setImgError(true);
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center gap-2.5 mx-auto">
          <div
            className={`${
              isThemeB ? 'w-12 h-12 text-2xl' : 'w-8 h-8 text-lg'
            } bg-[#F8B800] text-[#262626] font-black rounded flex items-center justify-center shadow-xs shrink-0 select-none`}
          >
            G
          </div>
          <div className="overflow-hidden">
            <div
              className={`font-black ${
                isThemeB ? 'text-lg' : 'text-sm'
              } tracking-widest text-[#F8B800] leading-none uppercase`}
            >
              GEBOL
            </div>
            <div className="text-[9px] text-gray-400 tracking-wider mt-0.5 uppercase truncate font-semibold">
              Order Processing v4.2
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  needsReviewCount = 0,
  isCollapsed,
  onToggleCollapse,
  canAccessMasterData = true,
}) => {
  const { isThemeB } = useTheme();
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
      {/* Top Sidebar Brand - Click to expand when collapsed (Same background as menu, no dividing line) */}
      <div
        className={`${
          isThemeB ? (isCollapsed ? 'h-20 py-2' : 'h-24 py-3') : 'h-16'
        } px-3 flex items-center justify-center transition-all ${
          isThemeB
            ? 'bg-[#161922]'
            : 'bg-[#F9FAFB]'
        } ${
          isCollapsed
            ? isThemeB
              ? 'cursor-pointer hover:bg-[#262A36]'
              : 'cursor-pointer hover:bg-gray-200/50'
            : ''
        }`}
        onClick={() => {
          if (isCollapsed) {
            onToggleCollapse();
          }
        }}
      >
        <div className="flex items-center justify-center overflow-hidden w-full">
          <GebolLogo
            isCollapsed={isCollapsed}
            onLogoClick={() => {
              if (isCollapsed) {
                onToggleCollapse();
              }
            }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 w-full px-2 py-4 space-y-1.5 overflow-y-auto text-[14px] font-medium"
      >
        {/* Orders (Contains Notification Badge) */}
        <button
          onClick={() => onNavigate('orders')}
          title={isCollapsed ? `Orders (${needsReviewCount} pending)` : undefined}
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
              {/* Selected background with less opacity */}
              <motion.div
                layoutId="sidebar-active-bg"
                className={`absolute inset-0 ${
                  isThemeB ? 'bg-[#F8B800]' : 'bg-[#F8B800]/15'
                } rounded`}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
              {/* Yellow line on the leftmost corner that travels along with menu item selection */}
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
                <span>Orders</span>
              </div>
              {needsReviewCount > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 font-bold rounded font-mono relative z-10 ${
                    activeNav === 'orders'
                      ? isThemeB
                        ? 'bg-[#262626] text-[#F8B800]'
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

        {/* Master Data - Accessible only if canAccessMasterData is true */}
        {canAccessMasterData && (
          <div className="w-full">
            <button
              onClick={() => {
                if (isCollapsed) {
                  // When collapsed: expand the sidebar with Master Data expanded
                  setIsMasterDataOpen(true);
                  onToggleCollapse();
                } else {
                  setIsMasterDataOpen(!isMasterDataOpen);
                }
              }}
              title={isCollapsed ? 'Master Data' : undefined}
              className={`w-full flex items-center relative ${
                isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
              } rounded text-[14px] transition-colors text-left cursor-pointer overflow-hidden ${
                isMasterDataActive
                  ? isThemeB
                    ? 'text-white font-semibold bg-[#262A36]/60'
                    : 'text-gray-900 font-bold'
                  : isThemeB
                  ? 'text-gray-300 hover:bg-[#262A36] hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {isMasterDataActive && (
                <>
                  {/* Selected background for Theme A */}
                  {!isThemeB && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 bg-[#F8B800]/15 rounded"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {/* Yellow line on the leftmost corner that travels along with menu item selection */}
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
                  <Database
                    className={`w-4 h-4 shrink-0 ${
                      isMasterDataActive
                        ? isThemeB
                          ? 'text-white'
                          : 'text-[#D97706]'
                        : isThemeB
                        ? 'text-gray-300'
                        : ''
                    }`}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 relative z-10">
                  <Database
                    className={`w-4 h-4 shrink-0 ${
                      isMasterDataActive
                        ? isThemeB
                          ? 'text-white'
                          : 'text-[#D97706]'
                        : isThemeB
                        ? 'text-gray-300'
                        : ''
                    }`}
                  />
                  <span className={isThemeB && isMasterDataActive ? 'text-white' : ''}>Master Data</span>
                </div>
              )}
              {!isCollapsed && (
                isMasterDataOpen ? (
                  <ChevronDown className={`w-4 h-4 relative z-10 ${isThemeB && isMasterDataActive ? 'text-white' : isThemeB ? 'text-gray-400' : ''}`} />
                ) : (
                  <ChevronRight className={`w-4 h-4 relative z-10 ${isThemeB && isMasterDataActive ? 'text-white' : isThemeB ? 'text-gray-400' : ''}`} />
                )
              )}
            </button>

            {/* Sub menu when expanded */}
            {!isCollapsed && isMasterDataOpen && (
              <div
                className={`ml-4 mt-1 pl-3 border-l space-y-1 ${
                  isThemeB ? 'border-[#333333]' : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => onNavigate('customer-master')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] transition-colors text-left cursor-pointer relative overflow-hidden ${
                    activeNav === 'customer-master'
                      ? isThemeB
                        ? 'text-[#262626] font-bold shadow-xs'
                        : 'text-gray-900 font-bold'
                      : isThemeB
                      ? 'text-gray-400 hover:bg-[#262A36] hover:text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {activeNav === 'customer-master' && (
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
                  <Users
                    className={`w-4 h-4 shrink-0 relative z-10 ${
                      activeNav === 'customer-master'
                        ? isThemeB
                          ? 'text-[#262626]'
                          : 'text-[#D97706]'
                        : ''
                    }`}
                  />
                  <span className="relative z-10">Customer Master</span>
                </button>

                <button
                  onClick={() => onNavigate('article-master')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] transition-colors text-left cursor-pointer relative overflow-hidden ${
                    activeNav === 'article-master'
                      ? isThemeB
                        ? 'text-[#262626] font-bold shadow-xs'
                        : 'text-gray-900 font-bold'
                      : isThemeB
                      ? 'text-gray-400 hover:bg-[#262A36] hover:text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {activeNav === 'article-master' && (
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
                  <Package
                    className={`w-4 h-4 shrink-0 relative z-10 ${
                      activeNav === 'article-master'
                        ? isThemeB
                          ? 'text-[#262626]'
                          : 'text-[#D97706]'
                        : ''
                    }`}
                  />
                  <span className="relative z-10">Article Master</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

