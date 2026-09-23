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

  // Working draft state for all editable order data
  const [draftPo, setDraftPo] = useState<PurchaseOrderRecord>(po);

  // Synchronize draft state when the active PO prop changes
  useEffect(() => {
    setDraftPo(po);
    setAdditionalDetailsText(formatInitialAdditionalDetails(po));
  }, [po]);

  // Track if user has made unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(draftPo) !== JSON.stringify(po);
  }, [draftPo, po]);

  const isXmlGenerated = po.status === 'Completed' || (po.status as string) === 'XML Generated';

  // Document Viewer State & Dynamic Pagination
  const [docPage, setDocPage] = useState<number>(1);
  const [docZoom, setDocZoom] = useState<number>(100);
  const [isDocCollapsed, setIsDocCollapsed] = useState<boolean>(false);

  // Line item search filter in section 3
  const [lineItemSearchTerm, setLineItemSearchTerm] = useState<string>('');

  // Unsaved changes confirmation modal state
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const [pendingNavAction, setPendingNavAction] = useState<(() => void) | null>(null);

  const itemsPerPage = 5;
  const totalDocPages = Math.max(1, Math.ceil(draftPo.lineItems.length / itemsPerPage));
  const currentDocPage = Math.min(docPage, totalDocPages);
  const orderNetTotal =
    draftPo.lineItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) ||
    draftPo.order.orderTotalAmount ||
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

  // Count unmapped positions in saved PO vs working draft
  const unmappedLineCountSaved = po.lineItems.filter(
    (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
  ).length;

  const unmappedLineCountDraft = draftPo.lineItems.filter(
    (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
  ).length;

  // Handle Save draft changes
  const handleSaveChanges = () => {
    const unmappedLeft = draftPo.lineItems.filter(
      (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
    ).length;

    const nextStatus =
      draftPo.status === 'Completed' || draftPo.status === 'XML Generated'
        ? draftPo.status
        : unmappedLeft === 0
        ? 'Ready for XML'
        : 'Needs Review';

    const updatedPo: PurchaseOrderRecord = {
      ...draftPo,
      status: nextStatus,
      completenessScore: unmappedLeft === 0 ? 100 : Math.max(60, 100 - unmappedLeft * 15),
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Operations Operator',
          action: 'Manual Edit Saved',
          details: `Saved modifications to order data. Status: ${nextStatus}.`,
          category: 'ManualEdit',
        },
        ...draftPo.auditTrail,
      ],
    };

    onUpdatePo(updatedPo);
    setDraftPo(updatedPo);
    toast.success('Changes Saved', 'All order data edits have been saved.');
  };

  // Handle Cancel draft changes
  const handleCancelChanges = () => {
    setDraftPo(po);
    setAdditionalDetailsText(formatInitialAdditionalDetails(po));
    toast.info('Changes Discarded', 'Reverted all unsaved modifications.');
  };

  // Safe Back Navigation with dirty check
  const handleSafeBack = () => {
    if (isDirty) {
      setPendingNavAction(() => () => onBack?.());
      setShowUnsavedModal(true);
    } else {
      onBack?.();
    }
  };

  // Confirm Save & Exit from Modal
  const handleModalSaveAndExit = () => {
    handleSaveChanges();
    setShowUnsavedModal(false);
    if (pendingNavAction) {
      pendingNavAction();
      setPendingNavAction(null);
    }
  };

  // Confirm Discard & Exit from Modal
  const handleModalDiscardAndExit = () => {
    setDraftPo(po);
    setAdditionalDetailsText(formatInitialAdditionalDetails(po));
    setShowUnsavedModal(false);
    if (pendingNavAction) {
      pendingNavAction();
      setPendingNavAction(null);
    }
  };

  // Generate and Download XML directly
  const handleGenerateXml = () => {
    if (po.status !== 'Ready for XML' && po.status !== 'Ready For XML' && !isXmlGenerated) {
      toast.error('Cannot Generate XML', 'Order must be saved in status "Ready for XML" first.');
      return;
    }

    const unmapped = po.lineItems.filter(
      (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
    );
    if (unmapped.length > 0) {
      toast.error('Cannot Generate XML', `There are ${unmapped.length} unmapped positions. Please resolve and save them first.`);
      return;
    }

    const rawOrderNo = po.order.poNumber || po.id;
    const customerOrderNo = rawOrderNo.replace(/^#/, '');
    const ediFilename = `EDI_${customerOrderNo}.xml`;

    // 1. Generate XML Content
    const xmlContent = generateGebolErpXml(po);

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
      ...po,
      status: 'XML Generated',
      completenessScore: 100,
      exportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'GEBOL ERP Engine',
          action: 'XML Generated & Downloaded',
          details: `Generated and downloaded ${ediFilename} for PO ${customerOrderNo}.`,
          category: 'Export',
        },
        ...po.auditTrail,
      ],
    };

    onUpdatePo(updatedPo);
    setDraftPo(updatedPo);
    toast.success('XML Generated & Downloaded', `${ediFilename} downloaded successfully.`);
  };

  // Line Item Field Inline Change Handler (Updates draftPo)
  const handleLineItemChange = (id: string, updatedFields: Partial<LineItem>) => {
    const updatedItems = draftPo.lineItems.map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        merged.lineTotal = Number(((merged.quantity || 0) * (merged.unitPrice || 0)).toFixed(2));

        // When GEBOL Art.Nr. is typed
        if (updatedFields.gebolArticleNo !== undefined) {
          const typedArt = updatedFields.gebolArticleNo.trim();
          const matchedMaster = typedArt
            ? INITIAL_ARTICLES_DATASET.find(
                (a) => a.articleId.toLowerCase() === typedArt.toLowerCase()
              )
            : null;

          if (matchedMaster) {
            merged.gebolArticleNo = matchedMaster.articleId;
            merged.eanBarcode = matchedMaster.ean;
            if (!merged.description || merged.description === 'UNMAPPED-ARTICLE' || merged.description.startsWith('Logistikkosten')) {
              merged.description = matchedMaster.description;
            }
            merged.skuMatched = true;
          } else {
            merged.skuMatched = false;
          }
        }

        // When EAN / Barcode is typed
        if (updatedFields.eanBarcode !== undefined) {
          const typedEan = updatedFields.eanBarcode.trim();
          const matchedMaster = typedEan
            ? INITIAL_ARTICLES_DATASET.find((a) => a.ean === typedEan)
            : null;

          if (matchedMaster) {
            merged.gebolArticleNo = matchedMaster.articleId;
            merged.eanBarcode = matchedMaster.ean;
            if (!merged.description || merged.description === 'UNMAPPED-ARTICLE') {
              merged.description = matchedMaster.description;
            }
            merged.skuMatched = true;
          } else {
            const typedArt = (merged.gebolArticleNo || '').trim();
            const matchedByArt = typedArt
              ? INITIAL_ARTICLES_DATASET.find(
                  (a) => a.articleId.toLowerCase() === typedArt.toLowerCase()
                )
              : null;
            if (!matchedByArt) {
              merged.skuMatched = false;
            }
          }
        }

        return merged;
      }
      return item;
    });

    setDraftPo({
      ...draftPo,
      lineItems: updatedItems,
    });
  };

  // Resolve specific article item from modal
  const handleResolveArticleItem = (article: ArticleMasterRecord) => {
    if (!resolvingLineItemId) return;

    const updatedItems = draftPo.lineItems.map((item) => {
      if (item.id === resolvingLineItemId) {
        return {
          ...item,
          gebolArticleNo: article.articleId,
          eanBarcode: article.ean,
          description: article.description,
          contractPrice: item.contractPrice || item.unitPrice,
          unitPrice: item.unitPrice,
          skuMatched: true,
          priceVariance: false,
        };
      }
      return item;
    });

    setDraftPo({
      ...draftPo,
      lineItems: updatedItems,
    });

    setResolvingLineItemId(null);
    toast.success('Article Mapped', `Article ${article.articleId} selected. Click "Save" at bottom to apply.`);
  };

  // Open Add Line Item Modal
  const handleOpenAddItemModal = () => {
    setAddItemSearchTerm('');
    setSelectedArticleForAdd(null);
    setAddItemQuantity(0);
    setIsAddItemModalOpen(true);
  };

  // Confirm and Add Line Item from Article Master
  const handleConfirmAddItem = () => {
    if (!selectedArticleForAdd || addItemQuantity <= 0) {
      toast.error('Quantity Required', 'Please select an article and specify a quantity greater than 0.');
      return;
    }

    const nextPos = (draftPo.lineItems.length + 1) * 10;
    const qty = Math.max(1, addItemQuantity);
    const price = 3.50;

    const newItem: LineItem = {
      id: `li-new-${Date.now()}`,
      itemPos: nextPos,
      eanBarcode: selectedArticleForAdd.ean,
      customerArticleNo: selectedArticleForAdd.articleId,
      gebolArticleNo: selectedArticleForAdd.articleId,
      description: selectedArticleForAdd.description,
      quantity: qty,
      unit: 'St',
      unitPrice: price,
      contractPrice: price,
      taxRatePercentage: 19,
      lineTotal: Number((qty * price).toFixed(2)),
      skuMatched: true,
      priceVariance: false,
    };

    setDraftPo({
      ...draftPo,
      lineItems: [...draftPo.lineItems, newItem],
    });

    setIsAddItemModalOpen(false);
    setSelectedArticleForAdd(null);
    setAddItemQuantity(0);
    toast.success('Item Added', `Item ${nextPos} (${selectedArticleForAdd.articleId}) added to draft.`);
  };

  // Delete Line Item
  const handleDeleteLineItem = (id: string) => {
    const updatedItems = draftPo.lineItems.filter((item) => item.id !== id);
    setDraftPo({
      ...draftPo,
      lineItems: updatedItems,
    });
    toast.info('Item Removed', 'Item removed from draft.');
  };

  // Filtered Articles for Mappings modal
  const filteredArticles = INITIAL_ARTICLES_DATASET.filter((art) => {
    const term = articleSearchTerm.toLowerCase();
    return (
      art.articleId.toLowerCase().includes(term) ||
      art.description.toLowerCase().includes(term) ||
      art.ean.toLowerCase().includes(term)
    );
  });

  // Filtered Articles for Add Item Position Modal
  const filteredArticlesForAdd = INITIAL_ARTICLES_DATASET.filter((art) => {
    const term = addItemSearchTerm.toLowerCase();
    return (
      art.articleId.toLowerCase().includes(term) ||
      art.description.toLowerCase().includes(term) ||
      art.ean.toLowerCase().includes(term)
    );
  });

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

  // Reusable Section Header Formatter
  const renderSectionTitle = (title: string) => (
    <span className="font-bold tracking-tight text-[#4f4f4e] text-[15px]">
      {title}
    </span>
  );

  return (
    <div className="space-y-3.5 font-sans text-gray-900 pb-20">
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
                  XML Generated
                </span>
              </div>
            ) : po.status === 'Ready for XML' || po.status === 'Ready For XML' ? (
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Ready for XML
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-[#FEF6EE] border border-[#F9DBAF] text-[#B54708] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  Needs Review
                </span>
                {unmappedLineCountSaved > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-[#B54708] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F79009] inline-block" />
                    {unmappedLineCountSaved} {unmappedLineCountSaved === 1 ? 'issue pending' : 'issues pending'}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-[15px] text-[#8f9494] mt-0.5 font-light">
            Review purchase order details, verify line items, and generate ERP XML.
          </p>
        </div>

        {/* Right: Action Buttons (Generate XML) */}
        <div className="flex items-center gap-2">
          {/* Generate XML Button (Directly Generates & Downloads XML) */}
          <button
            type="button"
            disabled={po.status !== 'Ready for XML' && po.status !== 'Ready For XML' && !isXmlGenerated}
            onClick={handleGenerateXml}
            title={
              po.status === 'Ready for XML' || po.status === 'Ready For XML'
                ? 'Generate and download ERP XML'
                : isXmlGenerated
                ? 'Re-download ERP XML'
                : 'Order status must be saved as "Ready for XML" to generate XML (resolve issues first)'
            }
            className={`font-semibold px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all shadow-xs ${
              po.status === 'Ready for XML' || po.status === 'Ready For XML' || isXmlGenerated
                ? 'bg-[#f7b611] hover:bg-[#e2a508] text-white cursor-pointer'
                : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed select-none'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${po.status === 'Ready for XML' || po.status === 'Ready For XML' || isXmlGenerated ? 'text-white' : 'text-gray-400'}`} />
            <span className={po.status === 'Ready for XML' || po.status === 'Ready For XML' || isXmlGenerated ? 'text-white' : 'text-gray-400'}>
              {isXmlGenerated ? 'Download XML' : 'Generate XML'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔹 WORKSPACE: SPLIT SCREEN (IF DOC VISIBLE) OR SINGLE FRAME (IF COLLAPSED) */}
      {/* ========================================================================= */}
      <div className={isDocCollapsed ? "w-full space-y-4" : "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SOURCE DOCUMENT (PDF)                                        */}
        {/* ========================================================================= */}
        {!isDocCollapsed ? (
          <div className="lg:col-span-5 lg:sticky lg:top-4 self-start space-y-4">
            
            {/* 📄 SOURCE DOCUMENT (PDF) CARD */}
            <div data-pdf-view="true" className="original-pdf-viewer bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
              {/* Header with Document Name & Collapse Icon near file name */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2 bg-gray-50/50">
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsDocCollapsed(true)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    title="Collapse document"
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

              {/* Document Toolbar: Zoom Controls */}
              <div className="bg-gray-50/70 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <span>Page {currentDocPage} of {totalDocPages}</span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-xs text-gray-700 shadow-2xs">
                  <button
                    onClick={() => setDocZoom(Math.max(75, docZoom - 10))}
                    className="p-1 hover:bg-gray-50 cursor-pointer"
                    title="Zoom Out"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1.5 py-0.5 font-mono text-[10px] font-medium border-x border-gray-200">
                    {docZoom}%
                  </span>
                  <button
                    onClick={() => setDocZoom(Math.min(140, docZoom + 10))}
                    className="p-1 hover:bg-gray-50 cursor-pointer"
                    title="Zoom In"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* PDF Page Canvas */}
              <div className="p-3 bg-gray-100/70 overflow-auto max-h-[660px] flex justify-center">
                <div
                  style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                  className="pdf-document-page bg-white border border-gray-300 shadow-md p-4 sm:p-5 rounded text-[10px] text-gray-800 w-full max-w-[500px] min-h-[580px] font-sans transition-transform overflow-hidden box-border"
                >
                  {/* Header Zone: Buyer & Order Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-3 gap-2">
                    <div className="flex-1 pr-1 min-w-0">
                      <div className="font-bold text-xs uppercase truncate text-gray-900">
                        {draftPo.buyer.companyName || 'BAUKING Ostfalen GmbH'}
                      </div>
                      <div className="text-[8.5px] text-gray-500 mt-0.5 leading-tight">
                        <div className="truncate">{draftPo.buyer.billingAddress?.street || 'Magdeburger Berg 3'}</div>
                        <div className="truncate">
                          {draftPo.buyer.billingAddress?.postalCode || '38350'} {draftPo.buyer.billingAddress?.city || 'Helmstedt'}
                          {draftPo.buyer.billingAddress?.country ? `, ${draftPo.buyer.billingAddress.country}` : ', Germany'}
                        </div>
                      </div>
                      <div className="text-[8px] font-mono text-gray-500 mt-0.5 truncate">
                        USt-IdNr: <span className="font-semibold text-gray-800">{draftPo.buyer.vatId || 'DE296746712'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs text-gray-900">BESTELLUNG</div>
                      <div className="font-mono text-[11px] font-bold text-gray-800">
                        Nr. {(draftPo.order.poNumber || draftPo.id).replace(/^#/, '')}
                      </div>
                      <div className="text-[8.5px] text-gray-500 mt-0.5">
                        Datum: <span className="font-mono text-gray-800 font-medium">{formatDateToDDMMYYYY(draftPo.order.poDate)}</span>
                      </div>
                      <div className="text-[8.5px] text-gray-400 font-mono mt-0.5">
                        Seite {currentDocPage}/{totalDocPages}
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Supplier Info */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-[8.5px] bg-gray-50 p-2 rounded border border-gray-200">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-600 uppercase text-[7.5px] mb-0.5">Lieferadresse:</div>
                      <div className="font-semibold text-gray-900 truncate">
                        {draftPo.delivery.recipientName || draftPo.delivery.deliveryLocation || draftPo.buyer.companyName}
                      </div>
                      <div className="text-gray-600 truncate">
                        {draftPo.delivery.deliveryAddress?.street || draftPo.delivery.deliveryLocation || 'Schermcker Str. 17'}
                      </div>
                      <div className="truncate text-gray-600">
                        {draftPo.delivery.deliveryAddress?.postalCode || '39387'} {draftPo.delivery.deliveryAddress?.city || 'Oschersleben'}
                        {draftPo.delivery.deliveryAddress?.country ? `, ${draftPo.delivery.deliveryAddress?.country}` : ', Germany'}
                      </div>
                      <div className="mt-0.5 font-mono truncate text-gray-700">
                        Liefertermin: <strong>{formatDateToDDMMYYYY(draftPo.delivery.requestedDeliveryDate || draftPo.order.poDate)}</strong>
                      </div>
                      <div className="text-[7.5px] text-gray-500 mt-0.5 truncate">
                        Abladestelle: <span className="font-medium text-gray-700">{draftPo.delivery.unloadingPoint || draftPo.delivery.deliveryLocation || 'FH Oschersleben'}</span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-gray-600 uppercase text-[7.5px] mb-0.5">Lieferant:</div>
                      <div className="font-semibold text-gray-900 truncate">Gebol GmbH</div>
                      <div className="text-gray-600 truncate">Dr. Körner Str. 4</div>
                      <div className="text-gray-600 truncate">A-4470 Enns</div>
                      <div className="mt-1 inline-block text-[7.5px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 max-w-full truncate">
                        CLV: <span className="underline font-bold">{draftPo.buyer.gln || draftPo.buyer.customerNumber || '109008'}</span>
                      </div>
                      <div className="mt-0.5 text-[7.5px] text-gray-600 truncate">
                        Kd-Nr: <span className="font-mono font-medium text-gray-900">{draftPo.buyer.customerNumber || '148510'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Items Table */}
                  <div className="w-full overflow-hidden">
                    <table className="pdf-doc-table w-full text-left text-[8.5px] border-collapse table-fixed">
                      <thead>
                        <tr className="border-b border-gray-300 text-gray-600 font-bold">
                          <th className="py-1 px-1 w-[32px] text-left font-bold">Pos.</th>
                          <th className="py-1 px-1 w-[52px] text-left font-bold">Menge</th>
                          <th className="py-1 px-1 text-left font-bold">Artikelbezeichnung</th>
                          <th className="py-1 px-1 text-right w-[54px] font-bold">E-Preis</th>
                          <th className="py-1 px-1 text-right w-[58px] font-bold">Gesamt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-800">
                        {draftPo.lineItems.slice((currentDocPage - 1) * itemsPerPage, currentDocPage * itemsPerPage).map((li, idx) => {
                          const lineTotal = Number(((li.quantity || 0) * (li.unitPrice || 0)).toFixed(2));
                          const posNumber = li.itemPos || ((currentDocPage - 1) * itemsPerPage + idx + 1) * 10;
                          return (
                            <tr key={li.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-1 font-mono align-top">{posNumber}</td>
                              <td className="p-1 font-mono align-top whitespace-nowrap overflow-hidden">
                                {li.quantity} {li.unit || 'St'}
                              </td>
                              <td className="p-1 align-top min-w-0 overflow-hidden">
                                <div className="font-medium leading-snug line-clamp-2 break-words text-gray-900">
                                  {li.description}
                                </div>
                                <div className="text-[7.5px] font-mono mt-0.5 break-all text-gray-500">
                                  Art: {li.customerArticleNo || li.gebolArticleNo || '—'} {li.eanBarcode ? `/ EAN: ${li.eanBarcode}` : ''}
                                </div>
                              </td>
                              <td className="p-1 text-right font-mono align-top whitespace-nowrap overflow-hidden">
                                € {li.unitPrice.toFixed(2)}
                              </td>
                              <td className="p-1 text-right font-mono align-top whitespace-nowrap overflow-hidden">
                                € {lineTotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination Continuation Note or Totals */}
                    {currentDocPage < totalDocPages ? (
                      <div className="text-right text-[7.5px] text-gray-500 italic mt-2.5">
                        ... Fortsetzung auf Seite {currentDocPage + 1} ({draftPo.lineItems.length - (currentDocPage * itemsPerPage)} weitere Positionen)
                      </div>
                    ) : (
                      <div className="mt-2.5 pt-2 border-t border-gray-300 flex justify-between items-start text-[8.5px] gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-gray-600 font-medium truncate">
                            Zahlungsbedingungen: <span className="font-mono text-gray-800 font-normal">{draftPo.order.paymentTerms || '30 Tage Netto'}</span>
                          </div>
                          <div className="text-gray-600 font-medium truncate">
                            Lieferbedingungen: <span className="font-mono text-gray-800 font-normal">{draftPo.order.incoterms || 'DDP'}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-0.5 shrink-0">
                          <div className="text-gray-600">
                            Nettowert: <span className="font-mono font-medium text-gray-900">€ {orderNetTotal.toFixed(2)}</span>
                          </div>
                          <div className="text-gray-600">
                            MwSt (19%): <span className="font-mono font-medium text-gray-900">€ {(orderNetTotal * 0.19).toFixed(2)}</span>
                          </div>
                          <div className="font-bold text-gray-900 border-t border-gray-200 pt-0.5">
                            Gesamt: <span className="font-mono text-gray-900">€ {(orderNetTotal * 1.19).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* When collapsed: render top button to restore document */
          <div className="w-full">
            <button
              type="button"
              onClick={() => setIsDocCollapsed(false)}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Show Original Document"
            >
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Show Document: {po.sourceFileName || 'Purchase Order Document.pdf'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 1. CUSTOMER & DELIVERY, 2. ORDER INFO, 3. LINE ITEMS,       */}
        {/*               4. ADDITIONAL INFORMATION (EXPANDED TO FULL SPACE)          */}
        {/* ========================================================================= */}
        <div className={isDocCollapsed ? "w-full space-y-4" : "lg:col-span-7 space-y-4"}>
          
          {/* 👤 1. CUSTOMER & DELIVERY */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle('1. Customer & Delivery')}
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title="Lookup customer from Customer Master"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Lookup</span>
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Customer Name * */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Customer Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.buyer.companyName || ''}
                      onChange={(e) => setDraftPo({ ...draftPo, buyer: { ...draftPo.buyer, companyName: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !isXmlGenerated && !draftPo.buyer.companyName?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {draftPo.buyer.companyName?.trim() || isXmlGenerated ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    )}
                  </div>
                </div>

                {/* GP Nr. (Customer Account) * */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    GP Nr. (Customer Account) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.buyer.customerNumber || ''}
                      onChange={(e) => setDraftPo({ ...draftPo, buyer: { ...draftPo.buyer, customerNumber: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !isXmlGenerated && !draftPo.buyer.customerNumber?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {draftPo.buyer.customerNumber?.trim() || isXmlGenerated ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    )}
                  </div>
                </div>

                {/* Customer GLN / ILN * */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Customer GLN / ILN <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className={`relative flex items-center bg-white rounded-lg px-3 py-1.5 transition-colors ${
                    !isXmlGenerated && !draftPo.buyer.gln?.trim()
                      ? 'border border-red-400 bg-red-50/30'
                      : 'border border-gray-200 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-[#F8B800]'
                  }`}>
                    <input
                      type="text"
                      value={draftPo.buyer.gln || ''}
                      onChange={(e) => setDraftPo({ ...draftPo, buyer: { ...draftPo.buyer, gln: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="flex-1 bg-transparent text-[13px] font-normal text-[#4f4f4e] focus:outline-none min-w-0"
                    />
                    {draftPo.buyer.gln?.trim() || isXmlGenerated ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Delivery Location / Site * */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Delivery Location / Site <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.delivery.deliveryLocation || ''}
                      onChange={(e) => setDraftPo({ ...draftPo, delivery: { ...draftPo.delivery, deliveryLocation: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !isXmlGenerated && !draftPo.delivery.deliveryLocation?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {draftPo.delivery.deliveryLocation?.trim() || isXmlGenerated ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    )}
                  </div>
                </div>

                {/* Delivery Address * (Editable) */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Delivery Address <span className="text-red-500 font-bold">*</span>
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
                          : (draftPo.delivery.deliveryLocation || 'Schermcker Str. 17, 39387 Oschersleben, Germany')
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftPo({
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]"
                      placeholder="Street, Postal Code City, Country"
                    />
                    <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                {/* Delivery Recipient */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Delivery Recipient
                  </label>
                  <input
                    type="text"
                    value={draftPo.delivery.recipientName || draftPo.delivery.deliveryLocation || 'FH Oschersleben'}
                    onChange={(e) => setDraftPo({ ...draftPo, delivery: { ...draftPo.delivery, recipientName: e.target.value } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
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
                {renderSectionTitle('2. Order Information')}
              </div>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Purchase Order No./ Bestellnummer * */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Purchase Order No./ Bestellnummer <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={draftPo.order.poNumber || ''}
                      onChange={(e) => setDraftPo({ ...draftPo, order: { ...draftPo.order, poNumber: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !isXmlGenerated && !draftPo.order.poNumber?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {draftPo.order.poNumber?.trim() || isXmlGenerated ? (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                    )}
                  </div>
                </div>

                {/* Requested Delivery Date * */}
                <div>
                  <label className="block text-[13px] font-light text-[#8f9494] mb-1.5 field-header">
                    Requested Delivery Date <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
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
                      onClick={() => {
                        try {
                          dateInputRef.current?.showPicker();
                        } catch {}
                      }}
                      onChange={(e) => setDraftPo({ ...draftPo, delivery: { ...draftPo.delivery, requestedDeliveryDate: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-16 py-2 rounded-lg text-[13px] font-normal font-sans transition-colors cursor-pointer focus:outline-none ${
                        !isXmlGenerated && !draftPo.delivery.requestedDeliveryDate?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            dateInputRef.current?.showPicker();
                          } catch {
                            dateInputRef.current?.focus();
                          }
                        }}
                        className="p-1 rounded hover:bg-amber-50 text-[#F8B800] hover:text-[#d49b00] cursor-pointer transition-colors"
                        title="Open calendar date picker"
                      >
                        <Calendar className="w-4 h-4 text-[#F8B800]" />
                      </button>
                      {draftPo.delivery.requestedDeliveryDate?.trim() || isXmlGenerated ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📦 3. LINE ITEMS / POSITIONS (EDITABLE TABLE) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            {/* Header: Title, Search (icon on right), Add Position Button */}
            <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle(`3. Line Items / Positions (${draftPo.lineItems.length} Items)`)}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search Bar with Search Icon Shifted to the RIGHT */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search line items..."
                    value={lineItemSearchTerm}
                    onChange={(e) => setLineItemSearchTerm(e.target.value)}
                    className="w-44 sm:w-52 pl-3 pr-8 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] transition-colors"
                  />
                  <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
                </div>

                {unmappedLineCountDraft > 0 && !isXmlGenerated && (
                  <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                    {unmappedLineCountDraft} Unmapped
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddItemModal}
                  className="bg-white hover:bg-gray-50 text-gray-800 font-medium px-3 py-1.5 rounded-lg text-xs border border-gray-300 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                  <span>Add Item Position</span>
                </button>
              </div>
            </div>

            {/* Editable Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2 px-2 w-14 text-center font-bold">Pos.</th>
                    <th className="py-2 px-2 min-w-[140px] font-bold">EAN / Barcode <span className="text-red-500">*</span></th>
                    <th className="py-2 px-2 min-w-[140px] font-bold">GEBOL Art.Nr. <span className="text-red-500">*</span></th>
                    <th className="py-2 px-2 min-w-[120px] font-bold">Customer Art.Nr.</th>
                    <th className="py-2 px-2 min-w-[200px] font-bold">Description</th>
                    <th className="py-2 px-2 text-right w-20 font-bold">Qty. <span className="text-red-500">*</span></th>
                    <th className="py-2 px-2 text-center w-14 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#4f4f4e] text-xs">
                  {filteredLineItems.map((item) => {
                    const isUnmapped =
                      !item.skuMatched ||
                      item.gebolArticleNo === 'UNMAPPED-ARTICLE' ||
                      item.gebolArticleNo === 'UNMAPPED-SKU' ||
                      !item.gebolArticleNo;

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
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        {/* Pos */}
                        <td className="py-1.5 px-2 text-center">
                          <input
                            type="number"
                            value={item.itemPos}
                            onChange={(e) => handleLineItemChange(item.id, { itemPos: Number(e.target.value) || 0 })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                            }}
                            className={`w-12 text-center py-1 text-xs font-normal font-mono rounded focus:outline-none transition-colors ${
                              !isXmlGenerated && (!item.itemPos || item.itemPos <= 0)
                                ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 font-bold'
                                : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                            }`}
                          />
                        </td>

                        {/* EAN / Barcode */}
                        <td className="py-1.5 px-2">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={item.eanBarcode || effectiveEan}
                              onChange={(e) => handleLineItemChange(item.id, { eanBarcode: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              placeholder="EAN / Barcode"
                              className={`w-full pl-2 pr-10 py-1 text-xs font-normal font-mono rounded transition-colors focus:outline-none ${
                                !isXmlGenerated && isUnmapped && (!item.eanBarcode || !matchedMaster)
                                  ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                                  : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                              }`}
                            />
                            <div className="absolute right-1 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => setResolvingLineItemId(item.id)}
                                className="text-gray-400 hover:text-amber-600 p-0.5 rounded cursor-pointer transition-colors"
                                title="Lookup in Article Masters"
                              >
                                <SearchIcon className="w-3.5 h-3.5" />
                              </button>
                              {(item.eanBarcode || effectiveEan) && matchedMaster ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              ) : !isXmlGenerated && (item.eanBarcode || effectiveEan) ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* GEBOL Art.Nr. */}
                        <td className="py-1.5 px-2">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={item.gebolArticleNo || effectiveGebolArtNo}
                              onChange={(e) => handleLineItemChange(item.id, { gebolArticleNo: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              placeholder="Art.No."
                              className={`w-full pl-2 pr-10 py-1 text-xs font-normal font-mono rounded transition-colors focus:outline-none ${
                                !isXmlGenerated && isUnmapped
                                  ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                                  : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                              }`}
                            />
                            <div className="absolute right-1 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => setResolvingLineItemId(item.id)}
                                className="text-gray-400 hover:text-amber-600 p-0.5 rounded cursor-pointer transition-colors"
                                title="Lookup in Article Masters"
                              >
                                <SearchIcon className="w-3.5 h-3.5" />
                              </button>
                              {(item.gebolArticleNo || effectiveGebolArtNo) && matchedMaster ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              ) : !isXmlGenerated ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* Customer Art.Nr. */}
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={item.customerArticleNo || ''}
                            onChange={(e) => handleLineItemChange(item.id, { customerArticleNo: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                            }}
                            className="w-full px-2 py-1 text-xs font-normal font-mono text-[#4f4f4e] bg-white border border-gray-200 rounded focus:border-gray-400 focus:outline-none"
                          />
                        </td>

                        {/* Description */}
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleLineItemChange(item.id, { description: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                            }}
                            className="w-full px-2 py-1 text-xs font-normal text-[#4f4f4e] bg-white border border-gray-200 rounded focus:border-gray-400 focus:outline-none"
                          />
                        </td>

                        {/* Qty */}
                        <td className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, { quantity: Number(e.target.value) || 0 })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                            }}
                            className={`w-14 px-1.5 py-1 text-right text-xs font-normal rounded focus:outline-none transition-colors ${
                              !isXmlGenerated && (!item.quantity || item.quantity <= 0)
                                ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 font-bold'
                                : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                            }`}
                          />
                        </td>

                        {/* Action */}
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteLineItem(item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors inline-flex items-center justify-center"
                            title="Delete Item Position"
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

            {/* Show All Toggle Link */}
            {!lineItemSearchTerm && draftPo.lineItems.length > 5 && (
              <div className="p-2.5 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="text-xs font-medium text-gray-700 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAllItems ? 'Show fewer items' : `Show all ${draftPo.lineItems.length} items`}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllItems ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* 📝 4. ADDITIONAL INFORMATION (EXPANDED TO FULL AVAILABLE WIDTH, NO SCROLLBAR WHEN DOC HIDDEN) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/75 border-gray-200">
              <div className="flex items-center gap-2">
                {renderSectionTitle('4. Additional Information')}
              </div>
            </div>

            {/* Text Box with formatted sectionized data inside */}
            <div className="p-4 space-y-1.5">
              <textarea
                rows={isDocCollapsed ? 12 : 7}
                value={additionalDetailsText}
                onChange={(e) => {
                  const newText = e.target.value;
                  setAdditionalDetailsText(newText);
                  setDraftPo({
                    ...draftPo,
                    order: {
                      ...draftPo.order,
                      customerNotes: newText,
                    },
                  });
                }}
                placeholder="[Delivery Terms & Instructions]&#10;Incoterms: ...&#10;Payment Terms: ...&#10;&#10;[Customer Representative]&#10;Contact Person: ...&#10;Email: ...&#10;Phone: ..."
                className={`w-full p-3.5 bg-gray-50/60 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-[13px] font-normal font-sans text-[#4f4f4e] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800] transition-colors leading-relaxed ${
                  isDocCollapsed ? 'min-h-[260px] overflow-hidden' : 'resize-y'
                }`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 🔹 STICKY BOTTOM SAVE & CANCEL ACTION BAR (Sticks to bottom, spreads across full workspace, NO "Unsaved changes" label, NO icons) */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0E0E0] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-6 py-3 flex items-center justify-end gap-3 animate-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={handleCancelChanges}
            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-5 py-2 rounded text-xs transition-colors cursor-pointer border border-[#E0E0E0] shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold px-6 py-2 rounded text-xs shadow-xs transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      )}

      {/* 🔹 ARTICLE MASTER LOOKUP MODAL (Standardized CTA button) */}
      {resolvingLineItemId && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <div>
                <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                  Assign GEBOL Article
                </h3>
              </div>
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
                  placeholder="Search GEBOL catalog by Art.Nr, description, or barcode..."
                  value={articleSearchTerm}
                  onChange={(e) => setArticleSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-lg bg-white text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Compact Articles Table */}
            <div className="overflow-y-auto px-2 py-2 flex-1 max-h-[50vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2.5 px-3 w-28 font-bold text-gray-800">Art.Nr.</th>
                    <th className="py-2.5 px-3 font-bold text-gray-800">Article Description</th>
                    <th className="py-2.5 px-3 w-44 font-bold text-gray-800">EAN / Barcode</th>
                    <th className="py-2.5 px-3 w-28 text-center font-bold text-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No matching GEBOL articles found.
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
                          {/* Standardized Primary Yellow CTA button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveArticleItem(art);
                            }}
                            className="bg-[#F8B800] hover:bg-[#e0a400] text-gray-900 font-bold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-gray-900 stroke-[2.5]" />
                            <span>Select</span>
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
                Cancel
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
          setDraftPo({
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
          });
          setIsCustomerModalOpen(false);
          toast.success('Customer Master Selected', `${cust.companyName} linked to draft. Click "Save" at bottom to commit.`);
        };

        return (
          <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-6 sm:p-8 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh] mx-4 sm:mx-8">
              {/* Header */}
              <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
                <div>
                  <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                    Customer Master Lookup
                  </h3>
                </div>
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
                    placeholder="Search by GPNr, company name, ZIP code, city, street, or ILN..."
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
                    <option value="All">All Countries</option>
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
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">GPNr.</th>
                      <th className="py-2 px-2.5 font-bold">Company Name</th>
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">ZIP Code</th>
                      <th className="py-2 px-2.5 font-bold">City</th>
                      <th className="py-2 px-2.5 font-bold">Street</th>
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">Country</th>
                      <th className="py-2 px-2.5 whitespace-nowrap font-bold">ILN</th>
                      <th className="py-2 px-2.5 text-right whitespace-nowrap font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-gray-500">
                          <Building2 className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                          <p className="font-medium text-xs text-gray-800">No matching customer master records found</p>
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
                              <span>Select</span>
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
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🔹 ADD ITEM POSITION MODAL (QUANTITY STEPPER IN TABLE) */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <div>
                <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                  Add Item Position
                </h3>
              </div>
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
                  placeholder="Search GEBOL catalog by Art.Nr, description, or barcode..."
                  value={addItemSearchTerm}
                  onChange={(e) => setAddItemSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 border border-gray-300 rounded-lg bg-white text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Compact Articles Table */}
            <div className="overflow-y-auto px-2 py-2 flex-1 max-h-[55vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2.5 px-3 w-28 font-bold text-gray-800">Art.Nr.</th>
                    <th className="py-2.5 px-3 font-bold text-gray-800">Article Description</th>
                    <th className="py-2.5 px-3 w-44 font-bold text-gray-800">EAN / Barcode</th>
                    <th className="py-2.5 px-3 w-36 text-center font-bold text-gray-800">Quantity</th>
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
                          {/* Stepper with plus, minus, and quantity input */}
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
                              title="Decrease quantity"
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
                              title="Increase quantity"
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddItem}
                className="bg-[#F8B800] hover:bg-[#E0A400] text-gray-900 px-5 py-2 text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 UNSAVED CHANGES CONFIRMATION MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-900">
                  Unsaved Changes
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You have unsaved changes in this order. Do you want to save your modifications before leaving?
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleModalDiscardAndExit}
                className="px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                Discard &amp; Exit
              </button>
              <button
                type="button"
                onClick={handleModalSaveAndExit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#f7b611] hover:bg-[#e2a508] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Save &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
