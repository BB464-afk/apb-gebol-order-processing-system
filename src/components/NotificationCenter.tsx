import React, { useState, useEffect } from 'react';
import {
  Bell,
  Eraser,
  X,
  ExternalLink,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { AppNotification, NotificationScenario, SCENARIO_META } from '../types/notification';

interface NotificationCenterProps {
  onNavigateToEntity?: (nav: 'orders' | 'processing' | 'customer-master' | 'article-master', poId?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateToEntity }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
    clearAll,
  } = useNotifications();
  const { isThemeB } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationScenario>('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.scenario === activeFilter;
  });

  const handleActionClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (!onNavigateToEntity) return;

    if (notification.actionLabel === 'Retry Processing' || notification.scenario === 'processing_failure') {
      // Direct user to Orders listing screen
      onNavigateToEntity('orders');
    } else if (notification.actionNav) {
      onNavigateToEntity(notification.actionNav, notification.actionPoId);
    }
  };

  return (
    <>
      {/* Bell Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        title="Notifications"
        style={isThemeB ? { color: '#ffffff' } : undefined}
        className={`relative p-1.5 rounded transition-colors cursor-pointer header-notification-btn ${
          isThemeB
            ? 'text-white hover:text-white hover:bg-white/10 active:bg-white/15'
            : 'text-gray-600 hover:text-[#1A1A1A] hover:bg-gray-100 active:bg-gray-200'
        }`}
        aria-label="Open notifications overlay"
        aria-expanded={isOpen}
      >
        <Bell
          className={`w-4 h-4 header-notification-icon ${isThemeB ? 'text-white text-[#ffffff]' : 'text-gray-600'}`}
          color={isThemeB ? '#ffffff' : undefined}
          style={isThemeB ? { color: '#ffffff', stroke: '#ffffff' } : undefined}
        />
        {unreadCount > 0 && (
          <span
            style={{ borderRadius: '50%' }}
            className={`absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ED6C02] text-white text-[9px] font-bold rounded-full flex items-center justify-center border ${
              isThemeB ? 'border-[#161922]' : 'border-white'
            } shadow-xs font-mono select-none shrink-0`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Right-Side Slide-in Overlay & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden notification-center-overlay">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 ${
              isThemeB ? 'bg-black/45 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
            } transition-opacity duration-300 animate-in fade-in`}
            aria-hidden="true"
          />

          {/* Slide-in Panel from the Right */}
          <div
            className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-drawer-title"
          >
            <div className="notification-center-drawer w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-gray-200 animate-in slide-in-from-right duration-300 ease-out">
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b shrink-0 bg-gray-50 text-gray-900 border-gray-200 notification-drawer-header">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-[#F8B800] fill-[#F8B800] shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        id="notifications-drawer-title"
                        className="font-bold text-sm text-gray-900 notification-drawer-title"
                      >
                        Notifications
                      </h2>
                      {unreadCount > 0 ? (
                        <span className="bg-[#ED6C02] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full notification-unread-badge">
                          {unreadCount} unread
                        </span>
                      ) : (
                        <span className="bg-emerald-600/20 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-300">
                          All caught up
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      title="Clear all notifications"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#ED6C02] hover:bg-gray-200 transition-colors cursor-pointer notification-action-btn"
                    >
                      <Eraser className="w-4 h-4 text-gray-500 hover:text-[#ED6C02]" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer notification-action-btn"
                  >
                    <X className="w-5 h-5 text-gray-500 hover:text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Filter Dropdown Section */}
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3 shrink-0 notification-filter-bar">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 notification-filter-label">
                  <Filter className="w-3.5 h-3.5 text-gray-500 notification-filter-icon" />
                  <span className="notification-filter-text">Filter by:</span>
                </div>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as 'all' | NotificationScenario)}
                  className="notification-filter-select text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 font-medium text-gray-800 hover:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#F8B800] focus:border-[#F8B800] cursor-pointer shadow-2xs"
                >
                  <option value="all">All Notifications ({notifications.length})</option>
                  <option value="processing_failure">
                    Processing failure ({notifications.filter((n) => n.scenario === 'processing_failure').length})
                  </option>
                  <option value="manual_review_required">
                    Manual review ({notifications.filter((n) => n.scenario === 'manual_review_required').length})
                  </option>
                  <option value="master_data_upload">
                    Master Data Upload ({notifications.filter((n) => n.scenario === 'master_data_upload').length})
                  </option>
                  <option value="xml_generation_failure">
                    XML generation failure ({notifications.filter((n) => n.scenario === 'xml_generation_failure').length})
                  </option>
                </select>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1 divide-y divide-gray-100 text-xs notification-list-container">
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 px-6 text-center text-gray-400 notification-empty-state">
                    <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-800 text-sm notification-empty-title">No notifications found</p>
                    <p className="text-xs text-gray-500 mt-1 notification-empty-desc">
                      There are no notifications matching the selected filter.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const meta = SCENARIO_META[notification.scenario] || {
                      label: 'Notification',
                      badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
                    };

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors notification-card ${
                          notification.isRead
                            ? 'bg-white hover:bg-gray-50/70 opacity-90'
                            : 'bg-amber-50/30 hover:bg-amber-50/50'
                        }`}
                      >
                        {/* Content Area - No scenario icon in front */}
                        <div className="w-full">
                          {/* Meta row */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border notification-badge ${meta.badgeClass}`}>
                              {meta.label}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 notification-timestamp">
                              <span>{notification.timestamp}</span>
                              {!notification.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#ED6C02]" title="Unread" />
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                title="Dismiss notification"
                                className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h3
                            className={`text-xs notification-title ${
                              notification.isRead ? 'font-semibold text-gray-800' : 'font-bold text-[#1A1A1A]'
                            } leading-snug`}
                          >
                            {notification.title}
                          </h3>

                          {/* Message */}
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed notification-desc">
                            {notification.message}
                          </p>

                          {/* Action Buttons Row - No line in between */}
                          {notification.actionLabel && (
                            <div className="mt-2.5 flex items-center justify-end">
                              <button
                                onClick={() => handleActionClick(notification)}
                                className="notification-action-button bg-[#f7b611] hover:bg-[#e2a508] text-gray-900 font-semibold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <span className="text-gray-900 font-semibold">{notification.actionLabel}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-900" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
