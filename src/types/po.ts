export type POStatus = 'Processing' | 'Needs Review' | 'Ready for XML' | 'Ready For XML' | 'Processed' | 'Completed' | 'Ready' | 'Exported' | 'Failed' | 'XML Generated';

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface BuyerObject {
  companyName: string;
  customerNumber: string; // GEBOL ERP Customer ID / GP Nr
  gln?: string; // GLN / ILN
  vatId: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: Address;
}

export interface OrderObject {
  poNumber: string;
  poDate: string; // YYYY-MM-DD
  currency: 'EUR' | 'USD' | 'GBP' | string;
  paymentTerms: string; // e.g., "30 Days Net", "14 Days 2% Discount"
  incoterms: string; // e.g., "DDP Linz", "EXW"
  orderReference?: string;
  customerNotes?: string;
}

export interface DeliveryObject {
  recipientName: string;
  deliveryLocation?: string; // Site / Facility name e.g. FH Oschersleben
  deliveryAddress: Address;
  requestedDeliveryDate: string;
  shippingMethod: string; // e.g., "GEBOL Logistics Freight", "Standard Express"
  unloadingPoint?: string;
  gln?: string;
}

export interface LineItem {
  id: string;
  itemPos: number;
  eanBarcode?: string; // EAN / Barcode e.g. 9002701050446
  customerArticleNo: string;
  gebolArticleNo: string; // Internal GEBOL Material ID
  description: string;
  quantity: number;
  unit: 'PAIR' | 'PCC' | 'BOX' | 'CTN' | 'PAL' | 'St' | 'Bli' | 'Paa' | 'SET' | 'PKG' | 'Paar' | string;
  unitPrice: number; // Customer PO price
  contractPrice: number; // GEBOL Master Price List
  taxRatePercentage: number; // e.g., 20
  lineTotal: number;
  skuMatched: boolean;
  priceVariance: boolean;
}

export interface ValidationRuleResult {
  id: string;
  code: string;
  category: 'Buyer' | 'Order' | 'Delivery' | 'LineItems' | 'System';
  severity: 'error' | 'warning' | 'info';
  message: string;
  passed: boolean;
  actionRequired?: string;
  autoFixAvailable?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string; // System AI or User Name
  action: string;
  details: string;
  category: 'Extraction' | 'RuleCheck' | 'ManualEdit' | 'Resolution' | 'Export';
}

export interface PurchaseOrderRecord {
  id: string;
  sourceType: 'PDF' | 'Email' | 'EDI' | 'Scan';
  sourceFileName?: string;
  documentType?: string;
  uploadedBy?: string;
  receivedAt: string;
  status: POStatus;
  extractionConfidence: number; // 0 to 100
  completenessScore: number; // 0 to 100
  buyer: BuyerObject;
  order: OrderObject;
  delivery: DeliveryObject;
  lineItems: LineItem[];
  validationRules: ValidationRuleResult[];
  auditTrail: AuditLogEntry[];
  rawContentText?: string;
  erpTransmissionId?: string;
  exportedAt?: string;
}
