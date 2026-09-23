import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppNotification, NotificationScenario } from '../types/notification';

interface AddNotificationParams {
  scenario: NotificationScenario;
  title: string;
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  relatedEntityId?: string;
  relatedEntityType?: 'order' | 'customer_master' | 'article_master' | 'xml' | 'intake';
  actionLabel?: string;
  actionNav?: 'orders' | 'processing' | 'customer-master' | 'article-master';
  actionPoId?: string;
  details?: string[];
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (params: AddNotificationParams) => void;
  triggerScenario: (scenario: NotificationScenario, customDetails?: Partial<AddNotificationParams>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Initial realistic dataset demonstrating the notification scenarios
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-proc-fail-1',
    scenario: 'processing_failure',
    title: 'Order document processing failed',
    message: 'We were unable to process the uploaded order document. Please check the document format and retry processing.',
    timestamp: '12 min ago',
    createdAt: Date.now() - 12 * 60 * 1000,
    isRead: false,
    severity: 'error',
    relatedEntityId: 'PO-2026-88106',
    relatedEntityType: 'intake',
    actionLabel: 'Retry Processing',
    actionNav: 'orders',
  },
  {
    id: 'notif-man-rev-1',
    scenario: 'manual_review_required',
    title: 'Manual review required: PO-2026-80635109',
    message: '2 of the line items could not be mapped to existing articles. Manual review is required before releasing this order.',
    timestamp: '28 min ago',
    createdAt: Date.now() - 28 * 60 * 1000,
    isRead: false,
    severity: 'warning',
    relatedEntityId: 'PO-2026-80635109',
    relatedEntityType: 'order',
    actionLabel: 'Review',
    actionNav: 'orders',
    actionPoId: 'PO-2026-80635109',
  },
  {
    id: 'notif-mdu-1',
    scenario: 'master_data_upload',
    title: 'Master Data Upload',
    message: 'Customer Master dataset was successfully updated via Excel import.',
    timestamp: '2 hours ago',
    createdAt: Date.now() - 120 * 60 * 1000,
    isRead: true,
    severity: 'success',
    relatedEntityId: 'Customer Master',
    relatedEntityType: 'customer_master',
    actionLabel: 'View Master Data',
    actionNav: 'customer-master',
  },
  {
    id: 'notif-xml-fail-1',
    scenario: 'xml_generation_failure',
    title: 'XML generation failed: EDI_88104.xml',
    message: 'XML generation timed out due to high system load. The EDI file could not be generated.',
    timestamp: '3 hours ago',
    createdAt: Date.now() - 180 * 60 * 1000,
    isRead: false,
    severity: 'error',
    relatedEntityId: 'PO-2026-88104',
    relatedEntityType: 'xml',
    actionLabel: 'Review',
    actionNav: 'orders',
    actionPoId: 'PO-2026-88104',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((params: AddNotificationParams) => {
    const defaultSeverity: Record<NotificationScenario, 'error' | 'warning' | 'info' | 'success'> = {
      processing_failure: 'error',
      manual_review_required: 'warning',
      master_data_upload: 'success',
      xml_generation_failure: 'error',
    };

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      scenario: params.scenario,
      title: params.title,
      message: params.message,
      timestamp: 'Just now',
      createdAt: Date.now(),
      isRead: false,
      severity: params.severity || defaultSeverity[params.scenario],
      relatedEntityId: params.relatedEntityId,
      relatedEntityType: params.relatedEntityType,
      actionLabel: params.actionLabel,
      actionNav: params.actionNav,
      actionPoId: params.actionPoId,
      details: params.details,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const triggerScenario = useCallback((scenario: NotificationScenario, customDetails?: Partial<AddNotificationParams>) => {
    switch (scenario) {
      case 'processing_failure':
        addNotification({
          scenario: 'processing_failure',
          title: customDetails?.title || 'Order document processing failed',
          message:
            customDetails?.message ||
            'We were unable to process the uploaded order document. Please check the document format and retry processing.',
          severity: 'error',
          relatedEntityId: customDetails?.relatedEntityId || 'PO-2026-88106',
          relatedEntityType: 'intake',
          actionLabel: 'Retry Processing',
          actionNav: 'orders',
        });
        break;

      case 'manual_review_required':
        addNotification({
          scenario: 'manual_review_required',
          title: customDetails?.title || 'Manual review required: PO-2026-80635109',
          message:
            customDetails?.message ||
            '2 of the line items could not be mapped to existing articles. Manual review is required before releasing this order.',
          severity: 'warning',
          relatedEntityId: customDetails?.relatedEntityId || 'PO-2026-80635109',
          relatedEntityType: 'order',
          actionLabel: 'Review',
          actionNav: 'orders',
          actionPoId: 'PO-2026-80635109',
        });
        break;

      case 'master_data_upload':
        addNotification({
          scenario: 'master_data_upload',
          title: customDetails?.title || 'Master Data Upload',
          message:
            customDetails?.message ||
            'Customer Master dataset was successfully updated via Excel import.',
          severity: 'success',
          relatedEntityId: customDetails?.relatedEntityId || 'Customer Master',
          relatedEntityType: 'customer_master',
          actionLabel: 'View Master Data',
          actionNav: 'customer-master',
        });
        break;

      case 'xml_generation_failure':
        addNotification({
          scenario: 'xml_generation_failure',
          title: customDetails?.title || 'XML generation failed: EDI_88104.xml',
          message:
            customDetails?.message ||
            'XML generation timed out due to high system load. The EDI file could not be generated.',
          severity: 'error',
          relatedEntityId: customDetails?.relatedEntityId || 'PO-2026-88104',
          relatedEntityType: 'xml',
          actionLabel: 'Review',
          actionNav: 'orders',
          actionPoId: 'PO-2026-88104',
        });
        break;
    }
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        dismissNotification,
        clearAll,
        addNotification,
        triggerScenario,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
