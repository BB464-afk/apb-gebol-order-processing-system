import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Check,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Download,
  Building2,
  X,
  FileCode,
  CheckCircle,
  Search as SearchIcon,
  Calendar,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  PurchaseOrderRecord,
  BuyerObject,
  LineItem
} from '../types/po';
import { INITIAL_CUSTOMERS, CustomerMasterRecord } from './CustomerMasterView';
import { INITIAL_ARTICLES_DATASET, ArticleMasterRecord } from './ArticleMasterView';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { generateGebolErpXml } from '../utils/xmlGenerator';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

interface OrderDetailReviewWorkspaceProps {
  po: PurchaseOrderRecord;
  onUpdatePo: (updatedPo: PurchaseOrderRecord) => void;
  onOpenXmlModal?: (po: PurchaseOrderRecord) => void;
  onBack?: () => void;
  onNavigateToCustomerMaster?: () => void;
}

export const OrderDetailReviewWorkspace: React.FC<OrderDetailReviewWorkspaceProps> = ({
  po,
  onUpdatePo,
  onOpenXmlModal,
  onBack,
  onNavigateToCustomerMaster,
}) => {
  const toast = useToast();
  const { language, dict } = useLanguage();
  const isDe = language === 'de';

  // Working draft state for all editable order data
  const [draftPo, setDraftPo] = useState<PurchaseOrderRecord>(po);
  const [hasAttemptedXml, setHasAttemptedXml] = useState<boolean>(false);

  // Synchronize draft state when the active PO prop changes
  useEffect(() => {
    setDraftPo(po);
    setHasAttemptedXml(false);
    setAdditionalDetailsText(formatInitialAdditionalDetails(po));
  }, [po]);

  // Direct state updater that updates both local state and parent state
  const handleUpdateField = (updated: PurchaseOrderRecord) => {
    setDraftPo(updated);
    onUpdatePo(updated);
  };

  const isXmlGenerated = draftPo.status === 'Completed' || (draftPo.status as string) === 'XML Generated';

  // Document Viewer State & Dynamic Pagination
  const [docPage, setDocPage] = useState<number>(1);
  const [docZoom, setDocZoom] = useState<number>(100);
  const [isDocCollapsed, setIsDocCollapsed] = useState<boolean>(false);

  // Line item search filter in section 3
  const [lineItemSearchTerm, setLineItemSearchTerm] = useState<string>('');

  const itemsPerPage = 5;
  const totalDocPages = Math.max(1, Math.ceil(draftPo.lineItems.length / itemsPerPage));
  const currentDocPage = Math.min(docPage, totalDocPages);
  const orderNetTotal =
    draftPo.lineItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) ||
    0;

  // Table display state
  const [showAllItems, setShowAllItems] = useState<boolean>(true);

  // Additional Details Text Box Content
  const formatInitialAdditionalDetails = (record: PurchaseOrderRecord): string => {
    if (record.order.customerNotes && record.order.customerNotes.includes('[')) {
      return record.order.customerNotes;
    }
    const sections: string[] = [];

    sections.push('[Delivery Terms & Instructions]');
    if (record.order.incoterms) sections.push(`Incoterms: ${record.order.incoterms}`);
    if (record.order.paymentTerms) sections.push(`Payment Terms: ${record.order.paymentTerms}`);
    if (record.order.customerNotes) {
      sections.push(`Customer Notice: ${record.order.customerNotes}`);
    }

    if (record.buyer.contactPerson || record.buyer.email || record.buyer.phone) {
      sections.push('');
      sections.push('[Customer Representative]');
      if (record.buyer.contactPerson) sections.push(`Contact Person: ${record.buyer.contactPerson}`);
      if (record.buyer.email) sections.push(`Email: ${record.buyer.email}`);
      if (record.buyer.phone) sections.push(`Phone: ${record.buyer.phone}`);
    }

    if (record.delivery.shippingMethod || record.delivery.unloadingPoint) {
      sections.push('');
      sections.push('[Logistics & Shipping]');
      if (record.delivery.shippingMethod) sections.push(`Shipping Method: ${record.delivery.shippingMethod}`);
      if (record.delivery.unloadingPoint) sections.push(`Unloading Point: ${record.delivery.unloadingPoint}`);
    }

    return sections.join('\n');
  };

  const [additionalDetailsText, setAdditionalDetailsText] = useState<string>(() =>
    formatInitialAdditionalDetails(po)
  );

  // Article Resolution Modal State
  const [resolvingLineItemId, setResolvingLineItemId] = useState<string | null>(null);
  const [articleSearchTerm, setArticleSearchTerm] = useState<string>('');

  // Customer Master Selection Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [customerCountryFilter, setCustomerCountryFilter] = useState<string>('All');

  // Add Item Position Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [addItemSearchTerm, setAddItemSearchTerm] = useState<string>('');
  const [selectedArticleForAdd, setSelectedArticleForAdd] = useState<ArticleMasterRecord | null>(null);
  const [addItemQuantity, setAddItemQuantity] = useState<number>(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const unmappedLineCountDraft = draftPo.lineItems.filter(
    (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo?.trim()
  ).length;

  const isFieldEmpty = (val: string | undefined | null) => !val || !val.trim();

  // Field validation flags
  const isCompanyNameInvalid = hasAttemptedXml && isFieldEmpty(draftPo.buyer.companyName);
  const isCustomerNumberInvalid = hasAttemptedXml && isFieldEmpty(draftPo.buyer.customerNumber);
  const isGlnInvalid = hasAttemptedXml && isFieldEmpty(draftPo.buyer.gln);
  const isDeliveryLocationInvalid = hasAttemptedXml && isFieldEmpty(draftPo.delivery.deliveryLocation);
  const isDeliveryStreetInvalid =
    hasAttemptedXml &&
    isFieldEmpty(draftPo.delivery.deliveryAddress?.street) &&
    isFieldEmpty(draftPo.delivery.deliveryLocation);
  const isPoNumberInvalid = hasAttemptedXml && isFieldEmpty(draftPo.order.poNumber);
  const isDeliveryDateInvalid = hasAttemptedXml && isFieldEmpty(draftPo.delivery.requestedDeliveryDate);

  // Generate and Download XML directly (Acts as Save & Download)
  const handleGenerateXml = () => {
    // Perform full validation check
    const hasInvalidBuyer =
      isFieldEmpty(draftPo.buyer.companyName) ||
      isFieldEmpty(draftPo.buyer.customerNumber) ||
      isFieldEmpty(draftPo.buyer.gln);

    const hasInvalidDelivery =
      (isFieldEmpty(draftPo.delivery.deliveryAddress?.street) && isFieldEmpty(draftPo.delivery.deliveryLocation)) ||
      isFieldEmpty(draftPo.delivery.requestedDeliveryDate);

    const hasInvalidOrder = isFieldEmpty(draftPo.order.poNumber);

    const unmappedItems = draftPo.lineItems.filter(
      (item) =>
        !item.skuMatched ||
        item.gebolArticleNo === 'UNMAPPED-ARTICLE' ||
        item.gebolArticleNo === 'UNMAPPED-SKU' ||
        !item.gebolArticleNo?.trim()
    );

    const invalidQtyItems = draftPo.lineItems.filter((item) => !item.quantity || item.quantity <= 0);

    const hasErrors =
      hasInvalidBuyer ||
      hasInvalidDelivery ||
      hasInvalidOrder ||
      unmappedItems.length > 0 ||
      invalidQtyItems.length > 0;

    if (hasErrors) {
      setHasAttemptedXml(true);
      toast.error(
        isDe ? 'Validierungsfehler' : 'Validation Error',
        isDe
          ? dict.orderDetail.validationMessages.validationErrorsDetected
          : dict.orderDetail.validationMessages.validationErrorsDetected
      );
      return;
    }

    const rawOrderNo = draftPo.order.poNumber || draftPo.id;
    const customerOrderNo = rawOrderNo.replace(/^#/, '');
    const ediFilename = `EDI_${customerOrderNo}.xml`;

    // 1. Generate XML Content
    const xmlContent = generateGebolErpXml(draftPo);

    // 2. Direct XML File Download
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', ediFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 3. Update Order Status to XML Generated
    const updatedPo: PurchaseOrderRecord = {
      ...draftPo,
      status: 'XML Generated',
      completenessScore: 100,
      exportedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Operations Operator',
          action: 'XML Generated & Exported',
          details: `Generated EDI XML (${ediFilename}) for ERP transmission.`,
          category: 'Export',
        },
        ...draftPo.auditTrail,
      ],
    };

    handleUpdateField(updatedPo);
    toast.success(
      isDe ? 'XML erfolgreich generiert' : 'XML Generated Successfully',
      `${ediFilename} ${isDe ? 'wurde heruntergeladen.' : 'downloaded.'}`
    );
  };

  // Direct line item field edit
  const handleLineItemChange = (itemId: string, changes: Partial<LineItem>) => {
    const updatedItems = draftPo.lineItems.map((item) => {
      if (item.id === itemId) {
        const next = { ...item, ...changes };
        if (changes.gebolArticleNo && changes.gebolArticleNo !== 'UNMAPPED-ARTICLE' && changes.gebolArticleNo !== 'UNMAPPED-SKU') {
          next.skuMatched = true;
        }
        if (changes.quantity !== undefined || changes.unitPrice !== undefined) {
          next.lineTotal = (next.quantity || 0) * (next.unitPrice || 0);
        }
        return next;
      }
      return item;
    });

    const unmappedLeft = updatedItems.filter(
      (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
    ).length;

    const updatedPo = {
      ...draftPo,
      lineItems: updatedItems,
      completenessScore: unmappedLeft === 0 ? 100 : Math.max(60, 100 - unmappedLeft * 15),
    };

    handleUpdateField(updatedPo);
  };

  // Assign article from Article Master Catalog
  const handleResolveArticleItem = (article: ArticleMasterRecord) => {
    if (!resolvingLineItemId) return;

    const updatedItems = draftPo.lineItems.map((item) => {
      if (item.id === resolvingLineItemId) {
        return {
          ...item,
          gebolArticleNo: article.articleId,
          description: article.description,
          eanBarcode: article.ean || item.eanBarcode,
          skuMatched: true,
        };
      }
      return item;
    });

    const unmappedLeft = updatedItems.filter(
      (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
    ).length;

    const updatedPo: PurchaseOrderRecord = {
      ...draftPo,
      lineItems: updatedItems,
      completenessScore: unmappedLeft === 0 ? 100 : Math.max(60, 100 - unmappedLeft * 15),
    };

    handleUpdateField(updatedPo);
    setResolvingLineItemId(null);
    setArticleSearchTerm('');
    toast.success(
      isDe ? 'Artikel zugeordnet' : 'Article Assigned',
      `${article.articleId} ${isDe ? 'zugeordnet.' : 'assigned.'}`
    );
  };

  // Add Item Position Modal Action
  const handleOpenAddItemModal = () => {
    setSelectedArticleForAdd(null);
    setAddItemQuantity(1);
    setAddItemSearchTerm('');
    setIsAddItemModalOpen(true);
  };

  const handleConfirmAddItem = () => {
    if (!selectedArticleForAdd || addItemQuantity <= 0) {
      toast.warning(
        isDe ? 'Ungültige Auswahl' : 'Invalid Selection',
        isDe ? 'Bitte wählen Sie einen Artikel und eine Menge aus.' : 'Please select an article and a positive quantity.'
      );
      return;
    }

    const nextPos = (draftPo.lineItems.length + 1) * 10;
    const newItem: LineItem = {
      id: `li-manual-${Date.now()}`,
      itemPos: nextPos,
      customerArticleNo: selectedArticleForAdd.articleId,
      gebolArticleNo: selectedArticleForAdd.articleId,
      eanBarcode: selectedArticleForAdd.ean || '',
      description: selectedArticleForAdd.description,
      quantity: addItemQuantity,
      unit: 'Paa',
      unitPrice: 4.50,
      contractPrice: 4.50,
      taxRatePercentage: 19,
      lineTotal: addItemQuantity * 4.50,
      skuMatched: true,
      priceVariance: false,
    };

    const updatedItems = [...draftPo.lineItems, newItem];
    const updatedPo: PurchaseOrderRecord = {
      ...draftPo,
      lineItems: updatedItems,
    };

    handleUpdateField(updatedPo);
    setIsAddItemModalOpen(false);
    toast.success(
      isDe ? 'Position hinzugefügt' : 'Position Added',
      `${selectedArticleForAdd.articleId} (${addItemQuantity}x) ${isDe ? 'hinzugefügt.' : 'added.'}`
    );
  };

  const filteredArticles = useMemo(() => {
    const term = articleSearchTerm.toLowerCase().trim();
    if (!term) return INITIAL_ARTICLES_DATASET;
    return INITIAL_ARTICLES_DATASET.filter(
      (a) =>
        a.articleId.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.ean.toLowerCase().includes(term)
    );
  }, [articleSearchTerm]);

  const filteredArticlesForAdd = useMemo(() => {
    const term = addItemSearchTerm.toLowerCase().trim();
    if (!term) return INITIAL_ARTICLES_DATASET;
    return INITIAL_ARTICLES_DATASET.filter(
      (a) =>
        a.articleId.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.ean.toLowerCase().includes(term)
    );
  }, [addItemSearchTerm]);

  // Filtered Line Items in Section 3
  const filteredLineItems = useMemo(() => {
    const term = lineItemSearchTerm.toLowerCase().trim();
    const items = draftPo.lineItems;
    if (!term) {
      return showAllItems ? items : items.slice(0, 5);
    }
    return items.filter(
      (item) =>
        item.description?.toLowerCase().includes(term) ||
        item.gebolArticleNo?.toLowerCase().includes(term) ||
        item.customerArticleNo?.toLowerCase().includes(term) ||
        item.eanBarcode?.toLowerCase().includes(term) ||
        String(item.itemPos).includes(term)
    );
  }, [draftPo.lineItems, lineItemSearchTerm, showAllItems]);

  const renderSectionTitle = (title: string) => (
    <span className="font-bold tracking-tight text-[#4f4f4e] text-[15px]">
      {title}
    </span>
  );

  return (
    <div className="space-y-3.5 font-sans text-gray-900 pb-12">
      {/* 🔹 TOP TITLE & ACTION HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-0.5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-bold text-[#4f4f4e] tracking-tight page-header-title">
              {draftPo.buyer.companyName || 'Customer Order'} &bull; PO {(draftPo.order.poNumber || draftPo.id).replace(/^#/, '')}
            </h1>

            {/* Status Badge */}
            {isXmlGenerated ? (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {dict.status.xmlGenerated}
                </span>
              </div>
            ) : draftPo.status === 'Processing' ? (
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {dict.status.processing}
                </span>
              </div>
            ) : draftPo.status === 'Failed' ? (
              <div className="flex items-center gap-2">
                <span className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {dict.status.failed}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-[#FEF6EE] border border-[#F9DBAF] text-[#B54708] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {dict.status.needsReview}
                </span>
                {unmappedLineCountDraft > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-[#B54708] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F79009] inline-block" />
                    {unmappedLineCountDraft} {unmappedLineCountDraft === 1 ? (isDe ? 'offene Position' : 'issue pending') : (isDe ? 'offene Positionen' : 'issues pending')}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-[15px] text-[#8f9494] mt-0.5 font-light">
            {isDe
              ? 'Prüfen Sie Bestelldaten, verifizieren Sie Positionen und generieren Sie ERP-XML.'
              : 'Review purchase order details, verify line items, and generate ERP XML.'}
          </p>
        </div>

        {/* Right: Action Buttons (Generate XML - Always Enabled) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateXml}
            title={
              isXmlGenerated
                ? (isDe ? 'ERP-XML erneut herunterladen' : 'Re-download ERP XML')
                : (isDe ? 'ERP-XML generieren und herunterladen' : 'Generate and download ERP XML')
            }
            className="bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <FileCode className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-semibold">
              {isXmlGenerated ? (isDe ? 'XML herunterladen' : 'Download XML') : dict.orderDetail.generateXmlBtn}
            </span>
          </button>
        </div>
      </div>

      {/* 🔹 SPLIT SCREEN (IF DOC VISIBLE) OR SINGLE FRAME (IF COLLAPSED) */}
      <div className={isDocCollapsed ? "w-full space-y-4" : "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"}>
        
        {/* LEFT COLUMN: SOURCE DOCUMENT (PDF) */}
        {!isDocCollapsed ? (
          <div className="lg:col-span-5 lg:sticky lg:top-4 self-start space-y-4">
            <div data-pdf-view="true" className="original-pdf-viewer bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
              {/* Header with Document Name & Collapse Icon */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2 bg-gray-50/50">
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsDocCollapsed(true)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    title={isDe ? 'Dokument einklappen' : 'Collapse document'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="font-bold text-xs text-gray-900 font-mono truncate max-w-[280px]">
                    {po.sourceFileName || 'Purchase Order Document.pdf'}
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-xs text-gray-700 shadow-2xs shrink-0">
                  <button
                    onClick={() => setDocPage(Math.max(1, currentDocPage - 1))}
                    disabled={currentDocPage <= 1}
                    className="p-1.5 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 py-1 font-mono text-[10.5px] font-medium border-x border-gray-200">
                    {currentDocPage}/{totalDocPages}
                  </span>
                  <button
                    onClick={() => setDocPage(Math.min(totalDocPages, currentDocPage + 1))}
                    disabled={currentDocPage >= totalDocPages}
                    className="p-1.5 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Document Visual Body - Clean full width container */}
              <div className="p-2 sm:p-3 bg-gray-100/70 flex flex-col items-stretch justify-start min-h-[500px] overflow-auto">
                <div
                  style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                  className="w-full bg-white p-4 rounded-lg border border-gray-300 shadow-2xs text-gray-800 text-[11px] font-sans space-y-3 select-none"
                >
                  <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                    <div>
                      <div className="font-bold text-xs text-gray-900">{draftPo.buyer.companyName || 'BAUKING Ostfalen GmbH'}</div>
                      <div className="text-[10px] text-gray-500">Magdeburger Berg 3, 38350 Helmstedt</div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">PAGE {currentDocPage} / {totalDocPages}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">BESTELLUNG / PO</span>
                      <strong className="text-gray-900 font-mono text-[11px]">{draftPo.order.poNumber || '80635109'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">DATUM</span>
                      <span className="text-gray-700 font-mono">{draftPo.order.poDate || '2026-07-08'}</span>
                    </div>
                  </div>

                  <div className="border border-gray-100 bg-gray-50/70 p-2 rounded text-[10px] space-y-1">
                    <div className="text-gray-500 font-medium">Lieferanschrift:</div>
                    <div className="font-semibold text-gray-800">{draftPo.delivery.recipientName || 'FH Oschersleben'}</div>
                    <div className="text-gray-600">Schermcker Str. 17, 39387 Oschersleben</div>
                  </div>

                  {/* Line Items Preview */}
                  <div className="border-t border-gray-200 pt-2">
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 text-[9px]">
                          <th className="py-1">Pos</th>
                          <th className="py-1">Art.Nr</th>
                          <th className="py-1">Menge</th>
                          <th className="py-1 text-right">Betrag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {draftPo.lineItems.slice((currentDocPage - 1) * itemsPerPage, currentDocPage * itemsPerPage).map((it) => (
                          <tr key={it.id}>
                            <td className="py-1 font-mono">{it.itemPos}</td>
                            <td className="py-1 font-mono">{it.customerArticleNo || it.gebolArticleNo}</td>
                            <td className="py-1">{it.quantity} {it.unit}</td>
                            <td className="py-1 text-right font-mono">€{(it.lineTotal || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Document Toolbar */}
              <div className="p-2 border-t border-gray-200 flex items-center justify-between text-xs bg-white">
                <span className="text-gray-500 text-[11px] pl-1 font-mono">PDF Preview 100%</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDocZoom(Math.max(70, docZoom - 10))}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                    title={dict.orderDetail.zoomOut}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-gray-600 px-1">{docZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setDocZoom(Math.min(150, docZoom + 10))}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                    title={dict.orderDetail.zoomIn}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* RIGHT COLUMN (OR FULL WIDTH): EDITABLE BUSINESS OBJECTS */}
        <div className={isDocCollapsed ? "w-full space-y-4" : "lg:col-span-7 space-y-4"}>
          
          {/* Collapse Bar toggle if collapsed */}
          {isDocCollapsed && (
            <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-800">
                  {po.sourceFileName || 'Purchase Order Document.pdf'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDocCollapsed(false)}
                className="text-xs font-semibold text-[#ED6C02] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{dict.orderDetail.docPreview}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 👤 1. CUSTOMER & DELIVERY */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle(isDe ? '1. Kunde & Lieferung' : '1. Customer & Delivery')}
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title={isDe ? 'Kundenstamm durchsuchen' : 'Lookup customer from Customer Master'}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{isDe ? 'Kundenstamm-Suche' : 'Customer Lookup'}</span>
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Customer Name */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.companyName} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.buyer.companyName || ''}
                      onChange={(e) => handleUpdateField({ ...draftPo, buyer: { ...draftPo.buyer, companyName: e.target.value } })}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        isCompanyNameInvalid
                          ? 'bg-red-50/20 border border-red-500 text-red-950 focus:ring-1 focus:ring-red-500'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {isCompanyNameInvalid ? (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    ) : draftPo.buyer.companyName?.trim() ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : null}
                  </div>
                  {isCompanyNameInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.companyNameRequired}
                    </p>
                  )}
                </div>

                {/* Customer Number (GP Nr) */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.customerNumber} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.buyer.customerNumber || ''}
                      onChange={(e) => handleUpdateField({ ...draftPo, buyer: { ...draftPo.buyer, customerNumber: e.target.value } })}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        isCustomerNumberInvalid
                          ? 'bg-red-50/20 border border-red-500 text-red-950 focus:ring-1 focus:ring-red-500'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {isCustomerNumberInvalid ? (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    ) : draftPo.buyer.customerNumber?.trim() ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : null}
                  </div>
                  {isCustomerNumberInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.customerNumberRequired}
                    </p>
                  )}
                </div>

                {/* Customer GLN / ILN */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.gln} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className={`relative flex items-center rounded-lg px-3 py-1.5 ${
                    isGlnInvalid
                      ? 'bg-red-50/20 border border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                      : 'bg-white border border-gray-200 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-[#F8B800]'
                  }`}>
                    <input
                      type="text"
                      value={draftPo.buyer.gln || ''}
                      onChange={(e) => handleUpdateField({ ...draftPo, buyer: { ...draftPo.buyer, gln: e.target.value } })}
                      className="flex-1 bg-transparent text-[13px] font-normal text-[#4f4f4e] focus:outline-none min-w-0"
                    />
                    {isGlnInvalid ? (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : draftPo.buyer.gln?.trim() ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : null}
                  </div>
                  {isGlnInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.glnRequired}
                    </p>
                  )}
                </div>

                {/* Delivery Location / Site */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.deliveryLocation} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.delivery.deliveryLocation || ''}
                      onChange={(e) => handleUpdateField({ ...draftPo, delivery: { ...draftPo.delivery, deliveryLocation: e.target.value } })}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        isDeliveryLocationInvalid
                          ? 'bg-red-50/20 border border-red-500 text-red-950 focus:ring-1 focus:ring-red-500'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {isDeliveryLocationInvalid ? (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    ) : draftPo.delivery.deliveryLocation?.trim() ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : null}
                  </div>
                  {isDeliveryLocationInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.deliveryLocationRequired}
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.streetAddress} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        draftPo.delivery.deliveryAddress?.street
                          ? `${draftPo.delivery.deliveryAddress.street}${
                              draftPo.delivery.deliveryAddress.postalCode || draftPo.delivery.deliveryAddress.city
                                ? `, ${draftPo.delivery.deliveryAddress.postalCode || ''} ${draftPo.delivery.deliveryAddress.city || ''}`
                                : ''
                            }${draftPo.delivery.deliveryAddress.country ? `, ${draftPo.delivery.deliveryAddress.country}` : ''}`
                          : (draftPo.delivery.deliveryLocation || '')
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateField({
                          ...draftPo,
                          delivery: {
                            ...draftPo.delivery,
                            deliveryAddress: {
                              ...draftPo.delivery.deliveryAddress,
                              street: val,
                            },
                          },
                        });
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal focus:outline-none ${
                        isDeliveryStreetInvalid
                          ? 'bg-red-50/20 border border-red-500 text-red-950 focus:ring-1 focus:ring-red-500'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {isDeliveryStreetInvalid ? (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    ) : (draftPo.delivery.deliveryAddress?.street?.trim() || draftPo.delivery.deliveryLocation?.trim()) ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : null}
                  </div>
                  {isDeliveryStreetInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.deliveryStreetRequired}
                    </p>
                  )}
                </div>

                {/* Delivery Recipient */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.recipientName}
                  </label>
                  <input
                    type="text"
                    value={draftPo.delivery.recipientName || draftPo.delivery.deliveryLocation || 'FH Oschersleben'}
                    onChange={(e) => handleUpdateField({ ...draftPo, delivery: { ...draftPo.delivery, recipientName: e.target.value } })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 📋 2. ORDER INFORMATION */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle(isDe ? '2. Bestellinformationen' : '2. Order Information')}
              </div>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Purchase Order No. */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.poNumber} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.order.poNumber || ''}
                      onChange={(e) => handleUpdateField({ ...draftPo, order: { ...draftPo.order, poNumber: e.target.value } })}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        isPoNumberInvalid
                          ? 'bg-red-50/20 border border-red-500 text-red-950 focus:ring-1 focus:ring-red-500'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {isPoNumberInvalid ? (
                      <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    ) : draftPo.order.poNumber?.trim() ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : null}
                  </div>
                  {isPoNumberInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.poNumberRequired}
                    </p>
                  )}
                </div>

                {/* Requested Delivery Date */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    {dict.orderDetail.fields.requestedDeliveryDate} <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className={`relative flex items-center rounded-lg ${
                    isDeliveryDateInvalid
                      ? 'bg-red-50/20 border border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                      : 'bg-white border border-gray-200 focus-within:border-[#F8B800] focus-within:ring-1 focus-within:ring-[#F8B800]'
                  }`}>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={
                        draftPo.delivery.requestedDeliveryDate
                          ? draftPo.delivery.requestedDeliveryDate.includes('-') && draftPo.delivery.requestedDeliveryDate.split('-')[0].length === 4
                            ? draftPo.delivery.requestedDeliveryDate
                            : draftPo.delivery.requestedDeliveryDate.includes('.')
                            ? draftPo.delivery.requestedDeliveryDate.split('.').reverse().join('-')
                            : ''
                          : ''
                      }
                      onChange={(e) => handleUpdateField({ ...draftPo, delivery: { ...draftPo.delivery, requestedDeliveryDate: e.target.value } })}
                      className="w-full pl-3 pr-10 py-2 rounded-lg text-[13px] font-normal font-sans transition-colors cursor-pointer focus:outline-none bg-transparent text-[#4f4f4e]"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      {isDeliveryDateInvalid ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : draftPo.delivery.requestedDeliveryDate?.trim() ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : null}
                    </div>
                  </div>
                  {isDeliveryDateInvalid && (
                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {dict.orderDetail.validationMessages.requestedDeliveryDateRequired}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 📦 3. LINE ITEMS / POSITIONS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle(
                  `${isDe ? '3. Positionen' : '3. Line Items / Positions'} (${draftPo.lineItems.length} ${dict.orderDetail.lineItems.positionsCount})`
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={isDe ? 'Positionen durchsuchen...' : 'Search line items...'}
                    value={lineItemSearchTerm}
                    onChange={(e) => setLineItemSearchTerm(e.target.value)}
                    className="w-44 sm:w-52 pl-3 pr-8 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] transition-colors"
                  />
                  <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
                </div>

                {unmappedLineCountDraft > 0 && !isXmlGenerated && (
                  <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                    {unmappedLineCountDraft} {dict.orderDetail.lineItems.unmapped}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddItemModal}
                  className="bg-white hover:bg-gray-50 text-gray-800 font-medium px-3 py-1.5 rounded-lg text-xs border border-gray-300 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                  <span>{isDe ? 'Position hinzufügen' : 'Add Item Position'}</span>
                </button>
              </div>
            </div>

            {/* Editable Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2 px-2 w-14 text-center font-bold">{dict.orderDetail.lineItems.pos}</th>
                    <th className="py-2 px-2 min-w-[140px] font-bold">{dict.orderDetail.lineItems.eanBarcode} <span className="text-red-500">*</span></th>
                    <th className="py-2 px-2 min-w-[140px] font-bold">{dict.orderDetail.lineItems.gebolArtNo} <span className="text-red-500">*</span></th>
                    <th className="py-2 px-2 min-w-[120px] font-bold">{dict.orderDetail.lineItems.customerArtNo}</th>
                    <th className="py-2 px-2 min-w-[200px] font-bold">{dict.orderDetail.lineItems.description}</th>
                    <th className="py-2 px-2 text-right w-20 font-bold">{dict.orderDetail.lineItems.quantity} <span className="text-red-500">*</span></th>
                    <th className="py-2 px-2 text-center w-14 font-bold">{dict.orderDetail.lineItems.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#4f4f4e] text-xs">
                  {filteredLineItems.map((item) => {
                    const isUnmapped =
                      !item.skuMatched ||
                      item.gebolArticleNo === 'UNMAPPED-ARTICLE' ||
                      item.gebolArticleNo === 'UNMAPPED-SKU' ||
                      !item.gebolArticleNo?.trim();

                    const isInvalidQty = !item.quantity || item.quantity <= 0;
                    const showLineError = (hasAttemptedXml || isUnmapped) && isUnmapped && !isXmlGenerated;

                    const matchedMaster =
                      (item.gebolArticleNo && item.gebolArticleNo !== 'UNMAPPED-ARTICLE' && item.gebolArticleNo !== 'UNMAPPED-SKU'
                        ? INITIAL_ARTICLES_DATASET.find((a) => a.articleId.toLowerCase() === item.gebolArticleNo?.trim().toLowerCase())
                        : null) ||
                      (item.eanBarcode ? INITIAL_ARTICLES_DATASET.find((a) => a.ean === item.eanBarcode?.trim()) : null);

                    const effectiveEan = item.eanBarcode || matchedMaster?.ean || '';
                    const effectiveGebolArtNo =
                      item.gebolArticleNo && item.gebolArticleNo !== 'UNMAPPED-ARTICLE' && item.gebolArticleNo !== 'UNMAPPED-SKU' && !item.gebolArticleNo.startsWith('GEB-')
                        ? item.gebolArticleNo
                        : (matchedMaster?.articleId || '');

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          !isXmlGenerated && isUnmapped
                            ? 'bg-red-50/40 hover:bg-red-50/70 border-l-2 border-l-red-500'
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        {/* Pos */}
                        <td className="py-2 px-2 text-center align-top">
                          <input
                            type="number"
                            value={item.itemPos}
                            onChange={(e) => handleLineItemChange(item.id, { itemPos: Number(e.target.value) || 0 })}
                            className="w-12 text-center py-1 text-xs font-normal font-mono rounded focus:outline-none bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400"
                          />
                        </td>

                        {/* EAN / Barcode */}
                        <td className="py-2 px-2 align-top">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={item.eanBarcode || effectiveEan}
                              onChange={(e) => handleLineItemChange(item.id, { eanBarcode: e.target.value })}
                              placeholder="EAN / Barcode"
                              className={`w-full pl-2 pr-10 py-1 text-xs font-normal font-mono rounded transition-colors focus:outline-none ${
                                showLineError
                                  ? 'bg-red-50/20 border border-red-500 text-red-950 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                  : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                              }`}
                            />
                            <div className="absolute right-1 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => setResolvingLineItemId(item.id)}
                                className="text-gray-400 hover:text-amber-600 p-0.5 rounded cursor-pointer transition-colors"
                                title={dict.orderDetail.lineItems.lookupArticle}
                              >
                                <SearchIcon className="w-3.5 h-3.5" />
                              </button>
                              {(item.eanBarcode || effectiveEan) && matchedMaster ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* GEBOL Art.Nr. */}
                        <td className="py-2 px-2 align-top">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={item.gebolArticleNo || effectiveGebolArtNo}
                              onChange={(e) => handleLineItemChange(item.id, { gebolArticleNo: e.target.value })}
                              placeholder="Art.No."
                              className={`w-full pl-2 pr-10 py-1 text-xs font-normal font-mono rounded transition-colors focus:outline-none ${
                                showLineError
                                  ? 'bg-red-50/20 border border-red-500 text-red-950 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                  : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                              }`}
                            />
                            <div className="absolute right-1 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => setResolvingLineItemId(item.id)}
                                className="text-gray-400 hover:text-amber-600 p-0.5 rounded cursor-pointer transition-colors"
                                title={dict.orderDetail.lineItems.lookupArticle}
                              >
                                <SearchIcon className="w-3.5 h-3.5" />
                              </button>
                              {(item.gebolArticleNo || effectiveGebolArtNo) && matchedMaster ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              ) : null}
                            </div>
                          </div>
                          {showLineError && (
                            <p className="text-red-600 text-[10.5px] font-medium mt-1 flex items-center gap-1 whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{dict.orderDetail.validationMessages.articleMappingRequired}</span>
                            </p>
                          )}
                        </td>

                        {/* Customer Art.Nr. */}
                        <td className="py-2 px-2 align-top">
                          <input
                            type="text"
                            value={item.customerArticleNo || ''}
                            onChange={(e) => handleLineItemChange(item.id, { customerArticleNo: e.target.value })}
                            className="w-full px-2 py-1 text-xs font-normal font-mono bg-white border border-gray-200 rounded text-[#4f4f4e] focus:outline-none focus:border-gray-400"
                          />
                        </td>

                        {/* Description */}
                        <td className="py-2 px-2 align-top">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleLineItemChange(item.id, { description: e.target.value })}
                            className="w-full px-2 py-1 text-xs font-normal bg-white border border-gray-200 rounded text-[#4f4f4e] focus:outline-none focus:border-gray-400"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-2 text-right align-top">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, { quantity: Number(e.target.value) || 0 })}
                            className={`w-16 text-right py-1 px-1.5 text-xs font-mono font-bold rounded focus:outline-none ${
                              hasAttemptedXml && isInvalidQty
                                ? 'bg-red-50/20 border border-red-500 text-red-950 focus:ring-1 focus:ring-red-500'
                                : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                            }`}
                          />
                          {hasAttemptedXml && isInvalidQty && (
                            <p className="text-red-600 text-[10px] font-medium mt-1 text-right whitespace-nowrap">
                              <span>{dict.orderDetail.validationMessages.quantityRequired}</span>
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-2 text-center align-top">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedItems = draftPo.lineItems.filter((i) => i.id !== item.id);
                              handleUpdateField({ ...draftPo, lineItems: updatedItems });
                            }}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                            title={dict.common.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 📝 4. ADDITIONAL DETAILS & INSTRUCTIONS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle(isDe ? '4. Zusätzliche Hinweise & Bemerkungen' : '4. Additional Details & Instructions')}
              </div>
            </div>

            <div className="p-4">
              <textarea
                rows={5}
                value={additionalDetailsText}
                onChange={(e) => {
                  setAdditionalDetailsText(e.target.value);
                  handleUpdateField({
                    ...draftPo,
                    order: {
                      ...draftPo.order,
                      customerNotes: e.target.value,
                    },
                  });
                }}
                className="w-full p-3 bg-gray-50/60 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-[13px] font-normal font-sans text-[#4f4f4e] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800] transition-colors leading-relaxed"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 🔹 ARTICLE MASTER LOOKUP MODAL */}
      {resolvingLineItemId && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                {dict.orderDetail.articleModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setResolvingLineItemId(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catalog Search */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder={dict.orderDetail.articleModal.searchPlaceholder}
                  value={articleSearchTerm}
                  onChange={(e) => setArticleSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-lg bg-white text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Articles Table */}
            <div className="overflow-y-auto px-2 py-2 flex-1 max-h-[50vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2.5 px-3 w-28 font-bold text-gray-800">{dict.orderDetail.articleModal.artNo}</th>
                    <th className="py-2.5 px-3 font-bold text-gray-800">{dict.orderDetail.articleModal.name}</th>
                    <th className="py-2.5 px-3 w-44 font-bold text-gray-800">{dict.orderDetail.articleModal.ean}</th>
                    <th className="py-2.5 px-3 w-28 text-center font-bold text-gray-800">{dict.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        {dict.common.noDataFound}
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => (
                      <tr
                        key={art.id}
                        onClick={() => handleResolveArticleItem(art)}
                        className="hover:bg-amber-50/70 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {art.articleId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium whitespace-normal break-words text-xs">
                          {art.description}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap text-xs">
                          {art.ean}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveArticleItem(art);
                            }}
                            className="bg-[#F8B800] hover:bg-[#e0a400] text-gray-900 font-bold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-gray-900 stroke-[2.5]" />
                            <span>{dict.orderDetail.articleModal.selectBtn}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setResolvingLineItemId(null)}
                className="px-4 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-100 font-medium text-xs text-gray-700 cursor-pointer transition-colors"
              >
                {dict.orderDetail.articleModal.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 CUSTOMER MASTER CATALOG MODAL */}
      {isCustomerModalOpen && (() => {
        const isCurrentInUse = (c: CustomerMasterRecord) => {
          const currentGp = (draftPo.buyer.customerNumber || '').trim();
          const currentGln = (draftPo.buyer.gln || '').trim();
          const currentName = (draftPo.buyer.companyName || '').trim().toLowerCase();
          if (currentGp && currentGp === c.gpNr.trim()) return true;
          if (currentGln && currentGln === c.gln.trim()) return true;
          if (currentName && currentName === c.companyName.trim().toLowerCase()) return true;
          return false;
        };

        const filteredCustomers = INITIAL_CUSTOMERS.filter((c) => {
          if (isCurrentInUse(c)) return false;

          const term = customerSearchTerm.toLowerCase().trim();
          const matchesSearch =
            !term ||
            c.gpNr.toLowerCase().includes(term) ||
            c.companyName.toLowerCase().includes(term) ||
            c.postalCode.toLowerCase().includes(term) ||
            c.city.toLowerCase().includes(term) ||
            c.street.toLowerCase().includes(term) ||
            c.country.toLowerCase().includes(term) ||
            c.gln.toLowerCase().includes(term);
          const matchesCountry = customerCountryFilter === 'All' || c.country === customerCountryFilter;
          return matchesSearch && matchesCountry;
        });

        const handleSelectCustomer = (cust: CustomerMasterRecord) => {
          const updatedPo: PurchaseOrderRecord = {
            ...draftPo,
            buyer: {
              ...draftPo.buyer,
              companyName: cust.companyName,
              customerNumber: cust.gpNr,
              gln: cust.gln || draftPo.buyer.gln,
              vatId: cust.vatId || draftPo.buyer.vatId,
              billingAddress: {
                street: cust.street,
                postalCode: cust.postalCode,
                city: cust.city,
                country: cust.country,
              },
            },
            order: {
              ...draftPo.order,
              paymentTerms: cust.paymentTerms || draftPo.order.paymentTerms,
              incoterms: cust.incoterms || draftPo.order.incoterms,
            },
          };

          handleUpdateField(updatedPo);
          setIsCustomerModalOpen(false);
          toast.success(
            isDe ? 'Kunde zugewiesen' : 'Customer Assigned',
            `${cust.companyName} ${isDe ? 'wurde zugewiesen.' : 'assigned to order.'}`
          );
        };

        return (
          <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-6 sm:p-8 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh] mx-4 sm:mx-8">
              {/* Header */}
              <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
                <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                  {isDe ? 'Kundenstamm-Suche' : 'Customer Master Lookup'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Bar */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={dict.customerMaster.searchPlaceholder}
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-md bg-white text-[13px] text-gray-900 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
                  />
                  <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Country Filter */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <select
                    value={customerCountryFilter}
                    onChange={(e) => setCustomerCountryFilter(e.target.value)}
                    className="border border-gray-300 rounded-md bg-white py-2 px-3 text-xs text-gray-700 focus:outline-none focus:border-[#F8B800]"
                  >
                    <option value="All">{isDe ? 'Alle Länder' : 'All Countries'}</option>
                    <option value="DE">DE</option>
                    <option value="AT">AT</option>
                  </select>
                </div>
              </div>

              {/* Tabular Content */}
              <div className="px-6 py-3 overflow-x-auto overflow-y-auto flex-1 max-h-[58vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-gray-100/95 backdrop-blur-xs z-10 border-b border-gray-200 font-bold text-sm">
                    <tr className="text-sm font-bold text-gray-800">
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">{isDe ? 'GP-Nr.' : 'GPNr.'}</th>
                      <th className="py-2 px-2.5 font-bold">{isDe ? 'Firmenname' : 'Company Name'}</th>
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">{isDe ? 'PLZ' : 'ZIP Code'}</th>
                      <th className="py-2 px-2.5 font-bold">{isDe ? 'Ort' : 'City'}</th>
                      <th className="py-2 px-2.5 font-bold">{isDe ? 'Straße' : 'Street'}</th>
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">{isDe ? 'Land' : 'Country'}</th>
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">{isDe ? 'ILN / GLN' : 'ILN'}</th>
                      <th className="py-2 px-2.5 text-right whitespace-nowrap font-bold">{dict.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-gray-500">
                          <Building2 className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                          <p className="font-medium text-xs text-gray-800">{dict.common.noDataFound}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="hover:bg-amber-50/50 transition-colors cursor-pointer group text-xs"
                        >
                          <td className="py-2 px-2.5 whitespace-nowrap font-mono font-medium text-gray-900">
                            {cust.gpNr}
                          </td>
                          <td className="py-2 px-2.5 font-medium text-gray-900 whitespace-nowrap">
                            {cust.companyName}
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-mono text-gray-700">
                            {cust.postalCode}
                          </td>
                          <td className="py-2 px-2.5 text-gray-800 whitespace-nowrap">
                            {cust.city}
                          </td>
                          <td className="py-2 px-2.5 text-gray-700 whitespace-nowrap">
                            {cust.street}
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-medium text-gray-800">
                            {cust.country}
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-mono text-gray-800">
                            {cust.gln}
                          </td>
                          <td className="py-2 px-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(cust);
                              }}
                              className="bg-[#F8B800] hover:bg-[#e0a400] text-gray-900 font-bold px-3 py-1 rounded-md text-xs shrink-0 cursor-pointer inline-flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <Check className="w-3 h-3 text-gray-900 stroke-[2.5]" />
                              <span>{isDe ? 'Auswählen' : 'Select'}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-100 font-medium text-xs text-gray-700 cursor-pointer transition-colors"
                >
                  {dict.common.cancel}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🔹 ADD ITEM POSITION MODAL */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                {isDe ? 'Position hinzufügen' : 'Add Item Position'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catalog Search */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder={dict.orderDetail.articleModal.searchPlaceholder}
                  value={addItemSearchTerm}
                  onChange={(e) => setAddItemSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-lg bg-white text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Articles Table */}
            <div className="overflow-y-auto px-2 py-2 flex-1 max-h-[55vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2.5 px-3 w-28 font-bold text-gray-800">{dict.orderDetail.articleModal.artNo}</th>
                    <th className="py-2.5 px-3 font-bold text-gray-800">{dict.orderDetail.articleModal.name}</th>
                    <th className="py-2.5 px-3 w-44 font-bold text-gray-800">{dict.orderDetail.articleModal.ean}</th>
                    <th className="py-2.5 px-3 w-36 text-center font-bold text-gray-800">{dict.orderDetail.lineItems.quantity}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredArticlesForAdd.map((art) => {
                    const isSelected = selectedArticleForAdd?.id === art.id;
                    const rowQty = isSelected ? addItemQuantity : 0;

                    return (
                      <tr
                        key={art.id}
                        className={`transition-colors ${
                          isSelected && rowQty > 0
                            ? 'bg-amber-50/90 ring-1 ring-inset ring-[#F8B800]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            {art.articleId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium whitespace-normal break-words">
                          {art.description}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">
                          {art.ean}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newQty = Math.max(0, rowQty - 1);
                                if (newQty === 0) {
                                  if (isSelected) setSelectedArticleForAdd(null);
                                  setAddItemQuantity(0);
                                } else {
                                  setSelectedArticleForAdd(art);
                                  setAddItemQuantity(newQty);
                                }
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={rowQty}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                if (val === 0) {
                                  if (isSelected) setSelectedArticleForAdd(null);
                                  setAddItemQuantity(0);
                                } else {
                                  setSelectedArticleForAdd(art);
                                  setAddItemQuantity(val);
                                }
                              }}
                              className="w-12 text-center py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none border-x border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newQty = rowQty + 1;
                                setSelectedArticleForAdd(art);
                                setAddItemQuantity(newQty);
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg font-medium cursor-pointer border border-gray-300 bg-white transition-colors"
              >
                {dict.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmAddItem}
                className="bg-[#F8B800] hover:bg-[#E0A400] text-gray-900 px-5 py-2 text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isDe ? 'Position hinzufügen' : 'Add Position'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
