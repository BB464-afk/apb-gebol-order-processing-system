export type NotificationScenario =
  | 'batch_manual_review'
  | 'batch_processed_success'
  | 'processing_failure'
  | 'manual_review_required'
  | 'master_data_upload'
  | 'xml_generation_failure';

export interface AppNotification {
  id: string;
  scenario: NotificationScenario;
  title: string;
  titleDe?: string;
  message: string;
  messageDe?: string;
  timestamp: string;
  timestampDe?: string;
  createdAt: number;
  isRead: boolean;
  severity: 'error' | 'warning' | 'info' | 'success';
  relatedEntityId?: string;
  relatedEntityType?: 'order' | 'customer_master' | 'article_master' | 'xml' | 'intake';
  actionLabel?: string;
  actionLabelDe?: string;
  actionNav?: 'orders' | 'processing' | 'customer-master' | 'article-master' | 'user-management';
  actionPoId?: string;
  details?: string[];
}

export interface ScenarioMeta {
  label: string;
  labelDe: string;
  description: string;
  descriptionDe: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  badgeClass: string;
  dotClass: string;
}

export const SCENARIO_META: Record<NotificationScenario, ScenarioMeta> = {
  batch_manual_review: {
    label: 'Manual review required',
    labelDe: 'Prüfung erforderlich',
    description: 'Uploaded documents require manual operator review.',
    descriptionDe: 'Hochgeladene Dokumente erfordern manuelle Bearbeitung.',
    severity: 'warning',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  batch_processed_success: {
    label: 'Processed successfully',
    labelDe: 'Erfolgreich verarbeitet',
    description: 'Orders successfully extracted and processed.',
    descriptionDe: 'Aufträge erfolgreich extrahiert und verarbeitet.',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  processing_failure: {
    label: 'Processing failure',
    labelDe: 'Verarbeitungsfehler',
    description: 'Document processing encountered an issue and requires re-intake.',
    descriptionDe: 'Dokumentenverarbeitung fehlgeschlagen. Bitte erneut versuchen.',
    severity: 'error',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500',
  },
  manual_review_required: {
    label: 'Manual review',
    labelDe: 'Manuelle Prüfung',
    description: 'Order requires operator review before ERP release.',
    descriptionDe: 'Auftrag erfordert Prüfung vor ERP-Übertragung.',
    severity: 'warning',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  master_data_upload: {
    label: 'Master Data Upload',
    labelDe: 'Stammdaten-Upload',
    description: 'Master dataset successfully updated via Excel import.',
    descriptionDe: 'Stammdatensatz via Excel-Import erfolgreich aktualisiert.',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  xml_generation_failure: {
    label: 'XML generation failure',
    labelDe: 'XML-Fehler',
    description: 'XML generation timed out due to high system load.',
    descriptionDe: 'XML-Generierung wegen Systemauslastung abgebrochen.',
    severity: 'error',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};
