export type NotificationScenario =
  | 'processing_failure'
  | 'manual_review_required'
  | 'master_data_upload'
  | 'xml_generation_failure';

export interface AppNotification {
  id: string;
  scenario: NotificationScenario;
  title: string;
  message: string;
  timestamp: string;
  createdAt: number;
  isRead: boolean;
  severity: 'error' | 'warning' | 'info' | 'success';
  relatedEntityId?: string;
  relatedEntityType?: 'order' | 'customer_master' | 'article_master' | 'xml' | 'intake';
  actionLabel?: string;
  actionNav?: 'orders' | 'processing' | 'customer-master' | 'article-master';
  actionPoId?: string;
  details?: string[];
}

export interface ScenarioMeta {
  label: string;
  description: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  badgeClass: string;
  dotClass: string;
}

export const SCENARIO_META: Record<NotificationScenario, ScenarioMeta> = {
  processing_failure: {
    label: 'Processing failure',
    description: 'Document processing encountered an issue and requires re-intake.',
    severity: 'error',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500',
  },
  manual_review_required: {
    label: 'Manual review',
    description: 'Order requires operator review before ERP release.',
    severity: 'warning',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  master_data_upload: {
    label: 'Master Data Upload',
    description: 'Master dataset successfully updated via Excel import.',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  xml_generation_failure: {
    label: 'XML generation failure',
    description: 'XML generation timed out due to high system load.',
    severity: 'error',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};
