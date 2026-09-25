import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppNotification, NotificationScenario } from '../types/notification';

interface AddNotificationParams {
  scenario: NotificationScenario;
  title: string;
  titleDe?: string;
  message: string;
  messageDe?: string;
  timestamp?: string;
  timestampDe?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  relatedEntityId?: string;
  relatedEntityType?: 'order' | 'customer_master' | 'article_master' | 'xml' | 'intake';
  actionLabel?: string;
  actionLabelDe?: string;
  actionNav?: 'orders' | 'processing' | 'customer-master' | 'article-master' | 'user-management';
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

// Initial realistic dataset including the grouped batch upload examples
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-batch-review-1',
    scenario: 'batch_manual_review',
    title: '3 documents need manual review',
    titleDe: '3 Dokumente erfordern manuelle Prüfung',
    message: '3 documents (PO-2026-80635109, PO-2026-88102, PO-2026-88107) need manual review due to unmapped articles or validation warnings.',
    messageDe: '3 Dokumente (PO-2026-80635109, PO-2026-88102, PO-2026-88107) erfordern eine manuelle Prüfung aufgrund nicht zugeordneter Artikel.',
    timestamp: '5 min ago',
    timestampDe: 'vor 5 Min.',
    createdAt: Date.now() - 5 * 60 * 1000,
    isRead: false,
    severity: 'warning',
    relatedEntityId: 'PO-2026-80635109',
    relatedEntityType: 'order',
    actionLabel: 'Review Orders',
    actionLabelDe: 'Aufträge prüfen',
    actionNav: 'orders',
  },
  {
    id: 'notif-batch-success-1',
    scenario: 'batch_processed_success',
    title: '3 orders processed successfully',
    titleDe: '3 Aufträge erfolgreich verarbeitet',
    message: '3 orders (PO-2026-88101, PO-2026-88103, PO-2026-88105) are processed successfully and ready for ERP integration.',
    messageDe: '3 Aufträge (PO-2026-88101, PO-2026-88103, PO-2026-88105) wurden erfolgreich verarbeitet und sind bereit für die ERP-Übertragung.',
    timestamp: '8 min ago',
    timestampDe: 'vor 8 Min.',
    createdAt: Date.now() - 8 * 60 * 1000,
    isRead: false,
    severity: 'success',
    relatedEntityId: 'PO-2026-88101',
    relatedEntityType: 'order',
    actionLabel: 'View Orders',
    actionLabelDe: 'Aufträge anzeigen',
    actionNav: 'orders',
  },
  {
    id: 'notif-mdu-1',
    scenario: 'master_data_upload',
    title: 'Master Data Upload',
    titleDe: 'Stammdaten-Upload',
    message: 'Customer Master dataset was successfully updated via Excel import.',
    messageDe: 'Der Kundenstammdatensatz wurde erfolgreich via Excel-Import aktualisiert.',
    timestamp: '2 hours ago',
    timestampDe: 'vor 2 Std.',
    createdAt: Date.now() - 120 * 60 * 1000,
    isRead: true,
    severity: 'success',
    relatedEntityId: 'Customer Master',
    relatedEntityType: 'customer_master',
    actionLabel: 'View Master Data',
    actionLabelDe: 'Stammdaten anzeigen',
    actionNav: 'customer-master',
  },
  {
    id: 'notif-xml-fail-1',
    scenario: 'xml_generation_failure',
    title: 'XML generation failed: EDI_88104.xml',
    titleDe: 'XML-Generierung fehlgeschlagen: EDI_88104.xml',
    message: 'XML generation timed out due to high system load. The EDI file could not be generated.',
    messageDe: 'Die XML-Generierung wurde aufgrund hoher Systemauslastung abgebrochen. Die EDI-Datei konnte nicht erstellt werden.',
    timestamp: '3 hours ago',
    timestampDe: 'vor 3 Std.',
    createdAt: Date.now() - 180 * 60 * 1000,
    isRead: false,
    severity: 'error',
    relatedEntityId: 'PO-2026-88104',
    relatedEntityType: 'xml',
    actionLabel: 'Review Order',
    actionLabelDe: 'Auftrag prüfen',
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
      batch_manual_review: 'warning',
      batch_processed_success: 'success',
      processing_failure: 'error',
      manual_review_required: 'warning',
      master_data_upload: 'success',
      xml_generation_failure: 'error',
    };

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      scenario: params.scenario,
      title: params.title,
      titleDe: params.titleDe,
      message: params.message,
      messageDe: params.messageDe,
      timestamp: params.timestamp || 'Just now',
      timestampDe: params.timestampDe || 'Gerade eben',
      createdAt: Date.now(),
      isRead: false,
      severity: params.severity || defaultSeverity[params.scenario],
      relatedEntityId: params.relatedEntityId,
      relatedEntityType: params.relatedEntityType,
      actionLabel: params.actionLabel,
      actionLabelDe: params.actionLabelDe,
      actionNav: params.actionNav,
      actionPoId: params.actionPoId,
      details: params.details,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const triggerScenario = useCallback((scenario: NotificationScenario, customDetails?: Partial<AddNotificationParams>) => {
    switch (scenario) {
      case 'batch_manual_review':
        addNotification({
          scenario: 'batch_manual_review',
          title: customDetails?.title || '3 documents need manual review',
          titleDe: customDetails?.titleDe || '3 Dokumente erfordern manuelle Prüfung',
          message:
            customDetails?.message ||
            '3 documents (PO-2026-80635109, PO-2026-88102, PO-2026-88107) need manual review due to unmapped articles.',
          messageDe:
            customDetails?.messageDe ||
            '3 Dokumente (PO-2026-80635109, PO-2026-88102, PO-2026-88107) erfordern eine manuelle Prüfung.',
          severity: 'warning',
          actionLabel: 'Review Orders',
          actionLabelDe: 'Aufträge prüfen',
          actionNav: 'orders',
        });
        break;

      case 'batch_processed_success':
        addNotification({
          scenario: 'batch_processed_success',
          title: customDetails?.title || '3 orders processed successfully',
          titleDe: customDetails?.titleDe || '3 Aufträge erfolgreich verarbeitet',
          message:
            customDetails?.message ||
            '3 orders (PO-2026-88101, PO-2026-88103, PO-2026-88105) are processed successfully and ready for ERP integration.',
          messageDe:
            customDetails?.messageDe ||
            '3 Aufträge (PO-2026-88101, PO-2026-88103, PO-2026-88105) wurden erfolgreich verarbeitet.',
          severity: 'success',
          actionLabel: 'View Orders',
          actionLabelDe: 'Aufträge anzeigen',
          actionNav: 'orders',
        });
        break;

      case 'processing_failure':
        addNotification({
          scenario: 'processing_failure',
          title: customDetails?.title || 'Order document processing failed',
          titleDe: customDetails?.titleDe || 'Auftragsverarbeitung fehlgeschlagen',
          message:
            customDetails?.message ||
            'We were unable to process the uploaded order document. Please check the document format and retry processing.',
          messageDe:
            customDetails?.messageDe ||
            'Das hochgeladene Bestelldokument konnte nicht verarbeitet werden. Bitte prüfen Sie das Dateiformat.',
          severity: 'error',
          relatedEntityId: customDetails?.relatedEntityId || 'PO-2026-88106',
          relatedEntityType: 'intake',
          actionLabel: 'Retry Processing',
          actionLabelDe: 'Verarbeitung wiederholen',
          actionNav: 'orders',
        });
        break;

      case 'manual_review_required':
        addNotification({
          scenario: 'manual_review_required',
          title: customDetails?.title || 'Manual review required: PO-2026-80635109',
          titleDe: customDetails?.titleDe || 'Manuelle Prüfung erforderlich: PO-2026-80635109',
          message:
            customDetails?.message ||
            '2 of the line items could not be mapped to existing articles. Manual review is required before releasing this order.',
          messageDe:
            customDetails?.messageDe ||
            '2 Positionen konnten nicht automatisch zugeordnet werden. Manuelle Prüfung vor Freigabe erforderlich.',
          severity: 'warning',
          relatedEntityId: customDetails?.relatedEntityId || 'PO-2026-80635109',
          relatedEntityType: 'order',
          actionLabel: 'Review',
          actionLabelDe: 'Prüfen',
          actionNav: 'orders',
          actionPoId: 'PO-2026-80635109',
        });
        break;

      case 'master_data_upload':
        addNotification({
          scenario: 'master_data_upload',
          title: customDetails?.title || 'Master Data Upload',
          titleDe: customDetails?.titleDe || 'Stammdaten-Upload',
          message:
            customDetails?.message ||
            'Customer Master dataset was successfully updated via Excel import.',
          messageDe:
            customDetails?.messageDe ||
            'Der Kundenstammdatensatz wurde erfolgreich via Excel-Import aktualisiert.',
          severity: 'success',
          relatedEntityId: customDetails?.relatedEntityId || 'Customer Master',
          relatedEntityType: 'customer_master',
          actionLabel: 'View Master Data',
          actionLabelDe: 'Stammdaten anzeigen',
          actionNav: 'customer-master',
        });
        break;

      case 'xml_generation_failure':
        addNotification({
          scenario: 'xml_generation_failure',
          title: customDetails?.title || 'XML generation failed: EDI_88104.xml',
          titleDe: customDetails?.titleDe || 'XML-Generierung fehlgeschlagen: EDI_88104.xml',
          message:
            customDetails?.message ||
            'XML generation timed out due to high system load. The EDI file could not be generated.',
          messageDe:
            customDetails?.messageDe ||
            'Die XML-Generierung wurde aufgrund hoher Systemauslastung abgebrochen.',
          severity: 'error',
          relatedEntityId: customDetails?.relatedEntityId || 'PO-2026-88104',
          relatedEntityType: 'xml',
          actionLabel: 'Review',
          actionLabelDe: 'Prüfen',
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
