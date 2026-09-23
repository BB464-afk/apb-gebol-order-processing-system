import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Download,
  Users,
  FileSpreadsheet,
  Package,
  MoreVertical,
  Calendar,
  ArrowRight,
  Search as SearchIcon,
  X,
  Building2,
  Shield,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Layers,
  Trash2,
  Copy,
  Code2,
  FileCode,
  CheckCircle,
  MapPin,
  Filter,
  Upload,
  ArrowLeft,
  Zap,
  User,
  Truck,
  Info,
  Edit
} from 'lucide-react';
import {
  PurchaseOrderRecord,
  BuyerObject,
  LineItem
} from '../types/po';
import { INITIAL_CUSTOMERS, CustomerMasterRecord } from './CustomerMasterView';
import { INITIAL_ARTICLES_DATASET, ArticleMasterRecord } from './ArticleMasterView';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { generateGebolErpXml } from '../utils/xmlGenerator';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import { ValidationPanel } from './ValidationPanel';
import { ErpOutputSection } from './ErpOutputSection';
import { AuditTrailLog } from './AuditTrailLog';
import { ThemeBOrderDetailWorkspace } from './ThemeBOrderDetailWorkspace';

interface OrderDetailReviewWorkspaceProps {
  po: PurchaseOrderRecord;
  onUpdatePo: (updatedPo: PurchaseOrderRecord) => void;
  onOpenXmlModal: (po: PurchaseOrderRecord) => void;
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
  const { addNotification } = useNotifications();
  const { isThemeB } = useTheme();

  if (isThemeB) {
    return (
      <ThemeBOrderDetailWorkspace
        po={po}
        onUpdatePo={onUpdatePo}
        onOpenXmlModal={onOpenXmlModal}
        onBack={onBack}
        onNavigateToCustomerMaster={onNavigateToCustomerMaster}
      />
    );
  }

  const isXmlGenerated = po.status === 'Completed' || (po.status as string) === 'XML Generated';

  // Active view tab: 'review' (split-screen doc + form) or 'xml' (generated ERP XML)
  // The 'xml' tab is only accessible/visible for orders with status "XML Generated"
  const [activeTab, setActiveTab] = useState<'review' | 'xml'>(
    isXmlGenerated ? 'xml' : 'review'
  );
  const effectiveTab = isXmlGenerated ? activeTab : 'review';

  // Sync activeTab if order status changes
  useEffect(() => {
    if (!isXmlGenerated && activeTab === 'xml') {
      setActiveTab('review');
    }
  }, [isXmlGenerated, activeTab]);

  // Document Viewer State & Dynamic Pagination
  const [docPage, setDocPage] = useState<number>(1);
  const [docZoom, setDocZoom] = useState<number>(100);
  const [isDocCollapsed, setIsDocCollapsed] = useState<boolean>(false);
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);

  // Actual PDF Upload and View Mode
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [pdfViewMode, setPdfViewMode] = useState<'simulated' | 'actual'>('simulated');
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please select a valid PDF file.');
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      setUploadedPdfUrl(fileUrl);
      setPdfViewMode('actual');
      toast.success(`Loaded actual PDF: ${file.name}`);
    }
  };

  const itemsPerPage = 5;
  const totalDocPages = Math.max(1, Math.ceil(po.lineItems.length / itemsPerPage));
  const currentDocPage = Math.min(docPage, totalDocPages);
  const orderNetTotal = po.lineItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) || po.order.orderTotalAmount || 0;

  // Table and Search State
  const [showAllItems, setShowAllItems] = useState<boolean>(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [themeBActiveTab, setThemeBActiveTab] = useState<'document' | 'extracted' | 'validation' | 'xml' | 'history'>('document');

  const handleDownloadPdf = () => {
    const element = document.createElement('a');
    const file = new Blob([`Purchase Order Document for ${(po.order.poNumber || po.id)}`], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `PO_${(po.order.poNumber || po.id).replace(/^#/, '')}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('PDF Downloaded', `PO_${(po.order.poNumber || po.id).replace(/^#/, '')}.pdf downloaded.`);
  };

  const handleGenerateXml = () => {
    if (po.status !== 'Ready for XML' && po.status !== 'Ready For XML') {
      toast.error('Cannot Generate XML', 'Order must be in status "Ready for XML" first.');
      return;
    }
    const unmapped = po.lineItems.filter(
      (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
    );
    if (unmapped.length > 0) {
      toast.error('Cannot Generate XML', `There are ${unmapped.length} unmapped positions. Please resolve them first.`);
      return;
    }
    onUpdatePo({
      ...po,
      status: 'XML Generated',
      completenessScore: 100,
      exportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: po.uploadedBy || 'Lucas Platzer',
          action: 'XML Generated',
          details: `ERP XML generated successfully for Order ${(po.order.poNumber || po.id).replace(/^#/, '')}.`,
          category: 'StatusChange',
        },
        ...po.auditTrail,
      ],
    });
    setActiveTab('xml');
    toast.success('XML Generated Successfully', `ERP XML has been generated for PO ${(po.order.poNumber || po.id).replace(/^#/, '')}.`);
  };

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

  // Sync state if po changes
  useEffect(() => {
    setAdditionalDetailsText(formatInitialAdditionalDetails(po));
    if (po.status === 'Completed' || (po.status as string) === 'XML Generated') {
      setActiveTab('xml');
    }
    if (docPage > totalDocPages) {
      setDocPage(1);
    }
  }, [po.id, po.status, totalDocPages]);

  // Article Resolution Modal State
  const [resolvingLineItemId, setResolvingLineItemId] = useState<string | null>(null);
  const [articleSearchTerm, setArticleSearchTerm] = useState<string>('');
  const resolvingLineItem = po.lineItems.find((i) => i.id === resolvingLineItemId);

  // Customer Master Selection Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [customerCountryFilter, setCustomerCountryFilter] = useState<string>('All');

  // Add Item Position Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [addItemSearchTerm, setAddItemSearchTerm] = useState<string>('');
  const [selectedArticleForAdd, setSelectedArticleForAdd] = useState<ArticleMasterRecord | null>(null);
  const [addItemQuantity, setAddItemQuantity] = useState<number>(1);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Copy XML state
  const [hasCopiedXml, setHasCopiedXml] = useState(false);

  // Unmapped Article positions check
  const unmappedLineCount = po.lineItems.filter(
    (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
  ).length;

  // Highlight Field in Left Document with Auto-Scroll & Page Switching
  const handleSelectField = (fieldKey: string) => {
    setActiveHighlightField(fieldKey);

    // If it's a lineItem, switch to its corresponding page
    if (fieldKey.startsWith('lineItem-')) {
      const idx = po.lineItems.findIndex((i) => `lineItem-${i.id}` === fieldKey);
      if (idx >= 0) {
        const targetPage = Math.floor(idx / itemsPerPage) + 1;
        if (docPage !== targetPage) {
          setDocPage(targetPage);
        }
      }
    } else {
      // Header fields are on page 1
      if (docPage !== 1) setDocPage(1);
    }

    setTimeout(() => {
      const el = document.getElementById(`doc-zone-${fieldKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Line Item Field Inline Change Handler with automatic Master Data lookup
  const handleLineItemChange = (id: string, updatedFields: Partial<LineItem>) => {
    const updatedItems = po.lineItems.map((item) => {
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
            // Value is wrong / not in master catalog
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
            // Check if current GEBOL Art.Nr. is valid
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

    const unmappedLeft = updatedItems.filter(
      (i) => !i.skuMatched || i.gebolArticleNo === 'UNMAPPED-ARTICLE' || i.gebolArticleNo === 'UNMAPPED-SKU' || !i.gebolArticleNo
    ).length;

    // Transition to Ready for XML if all items are mapped, otherwise Needs Review
    const nextStatus = unmappedLeft === 0 ? 'Ready for XML' : 'Needs Review';

    onUpdatePo({
      ...po,
      lineItems: updatedItems,
      status: nextStatus,
      completenessScore: unmappedLeft === 0 ? 100 : Math.min(po.completenessScore, 85),
    });
  };

  // Auto-Fix All / Auto-Resolve
  const handleAutoFixAll = () => {
    const fixedLineItems = po.lineItems.map((item) => {
      if (!item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo) {
        return {
          ...item,
          gebolArticleNo: '100315',
          eanBarcode: '9002701100332',
          description: 'Sprühkleber 400 ml',
          unitPrice: 0.00,
          contractPrice: 0.00,
          lineTotal: 0.00,
          skuMatched: true,
          priceVariance: false,
        };
      }
      return item;
    });

    const fixedBuyer: BuyerObject = {
      ...po.buyer,
      vatId: po.buyer.vatId || 'DE296746712',
    };

    const updatedRules = po.validationRules.map((r) => ({ ...r, passed: true }));

    const updatedPo: PurchaseOrderRecord = {
      ...po,
      buyer: fixedBuyer,
      lineItems: fixedLineItems,
      status: 'Ready for XML', // All data validated, no errors, XML ready to generate
      completenessScore: 100,
      validationRules: updatedRules,
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'GEBOL Auto-Resolve Engine',
          action: 'Auto-Resolved Unmapped Articles',
          details: 'Mapped unassigned logistics fee article and verified customer VAT registration',
          category: 'Resolution',
        },
        ...po.auditTrail,
      ],
    };

    onUpdatePo(updatedPo);
    toast.success('Auto-Resolution Complete', 'All unmapped articles have been resolved.');
  };

  // Resolve specific article item from modal
  const handleResolveArticleItem = (article: ArticleMasterRecord) => {
    if (!resolvingLineItemId) return;

    const updatedItems = po.lineItems.map((item) => {
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

    const unmappedLeft = updatedItems.filter(
      (i) => !i.skuMatched || i.gebolArticleNo === 'UNMAPPED-ARTICLE' || i.gebolArticleNo === 'UNMAPPED-SKU' || !i.gebolArticleNo
    ).length;

    const nextStatus = unmappedLeft === 0 ? 'Ready for XML' : 'Needs Review';

    onUpdatePo({
      ...po,
      lineItems: updatedItems,
      status: nextStatus,
      completenessScore: unmappedLeft === 0 ? 100 : po.completenessScore,
    });

    setResolvingLineItemId(null);
    toast.success('Article Mapped', `Article ${article.articleId} assigned successfully.`);
  };

  // Copy XML to clipboard
  const handleCopyXml = () => {
    const xmlContent = generateGebolErpXml(po);
    navigator.clipboard.writeText(xmlContent);
    setHasCopiedXml(true);
    toast.success('XML Copied', 'ERP XML copied to clipboard.');
    setTimeout(() => setHasCopiedXml(false), 2500);
  };

  // Download XML file
  const handleDownloadXml = () => {
    const rawOrderNo = po.order.poNumber || po.id;
    const customerOrderNo = rawOrderNo.replace(/^#/, '');
    const ediFilename = `EDI_${customerOrderNo}.xml`;

    const unmapped = po.lineItems.filter(
      (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
    );
    const failedRules = po.validationRules.filter((r) => !r.passed && r.severity === 'error');

    if (unmapped.length > 0 || failedRules.length > 0) {
      addNotification({
        scenario: 'xml_generation_failure',
        title: `XML generation failed: ${ediFilename}`,
        message: 'XML generation timed out due to high system load. The EDI file could not be generated.',
        severity: 'error',
        relatedEntityId: po.id,
        relatedEntityType: 'xml',
        actionLabel: 'Review',
        actionNav: 'orders',
        actionPoId: po.id,
      });
    }

    if (po.status !== 'Completed' && unmapped.length === 0 && failedRules.length === 0) {
      onUpdatePo({
        ...po,
        status: 'Completed',
        exportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        auditTrail: [
          {
            id: `at-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: 'GEBOL ERP Interface',
            action: 'XML Generated & Transmitted',
            details: `Compiled and validated GEBOL ERP XML v4.2 payload for PO ${po.order.poNumber || po.id}`,
            category: 'Export',
          },
          ...po.auditTrail,
        ],
      });
    }

    const xmlContent = generateGebolErpXml(po);
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', ediFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (unmapped.length > 0 || failedRules.length > 0) {
      toast.warning('XML Downloaded with Warnings', `${ediFilename} contains compliance issues. Logged XML generation failure alert.`);
    } else {
      toast.success('XML Downloaded', `${ediFilename} downloaded successfully.`);
      setActiveTab('xml');
    }
  };

  // Open Add Line Item Modal
  const handleOpenAddItemModal = () => {
    setAddItemSearchTerm('');
    setSelectedArticleForAdd(null);
    setAddItemQuantity(1);
    setIsAddItemModalOpen(true);
  };

  // Confirm and Add Line Item from Article Master
  const handleConfirmAddItem = () => {
    if (!selectedArticleForAdd) return;

    const nextPos = (po.lineItems.length + 1) * 10;
    const qty = Math.max(1, addItemQuantity || 1);
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

    const newItems = [...po.lineItems, newItem];
    const unmappedLeft = newItems.filter(
      (i) => !i.skuMatched || i.gebolArticleNo === 'UNMAPPED-ARTICLE' || i.gebolArticleNo === 'UNMAPPED-SKU' || !i.gebolArticleNo
    ).length;

    const nextStatus = unmappedLeft === 0 ? 'Ready for XML' : 'Needs Review';

    onUpdatePo({
      ...po,
      lineItems: newItems,
      status: nextStatus,
      completenessScore: unmappedLeft === 0 ? 100 : po.completenessScore,
    });

    setIsAddItemModalOpen(false);
    setSelectedArticleForAdd(null);
    toast.success('Item Added', `Item ${nextPos} (${selectedArticleForAdd.articleId}) added.`);
  };

  // Delete Line Item
  const handleDeleteLineItem = (id: string) => {
    const updatedItems = po.lineItems.filter((item) => item.id !== id);
    const unmappedLeft = updatedItems.filter(
      (i) => !i.skuMatched || i.gebolArticleNo === 'UNMAPPED-ARTICLE' || i.gebolArticleNo === 'UNMAPPED-SKU' || !i.gebolArticleNo
    ).length;
    const nextStatus = unmappedLeft === 0 ? 'Ready for XML' : 'Needs Review';

    onUpdatePo({
      ...po,
      lineItems: updatedItems,
      status: nextStatus,
      completenessScore: unmappedLeft === 0 ? 100 : po.completenessScore,
    });
    toast.info('Item Removed', 'Item removed from the order.');
  };

  // Filtered Articles for Mappings
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

  const generatedXmlString = generateGebolErpXml(po);

  // Determine active issues dynamically for the selected PO
  const activeIssues = useMemo(() => {
    const issues: Array<{
      id: string;
      title: string;
      description: string;
      lineItemId?: string;
      severity: 'error' | 'warning';
    }> = [];

    // 1. Check unmapped line items
    po.lineItems.forEach((item) => {
      const isUnmapped =
        !item.skuMatched ||
        item.gebolArticleNo === 'UNMAPPED-ARTICLE' ||
        item.gebolArticleNo === 'UNMAPPED-SKU' ||
        !item.gebolArticleNo;

      if (isUnmapped) {
        issues.push({
          id: `unmapped-${item.id}`,
          title: `Position ${item.itemPos} • Missing Article Mapping`,
          description: `GEBOL Article mapping missing for ${
            item.customerArticleNo
              ? `Customer Article "${item.customerArticleNo}"`
              : item.description || 'Position'
          }. Requires GEBOL catalog linkage.`,
          lineItemId: item.id,
          severity: 'error',
        });
      } else if (item.priceVariance) {
        issues.push({
          id: `price-${item.id}`,
          title: `Position ${item.itemPos} • Price Variance Flag`,
          description: `PO Price (€${item.unitPrice.toFixed(2)}) deviates from GEBOL ERP contract price (€${item.contractPrice?.toFixed(2) || '0.00'}).`,
          lineItemId: item.id,
          severity: 'warning',
        });
      }
    });

    // 2. Check failed validation rules
    (po.validationRules || []).forEach((rule) => {
      if (!rule.passed) {
        const alreadyIncluded = issues.some(
          (i) => i.description.includes(rule.message) || rule.message.includes(i.title)
        );
        if (!alreadyIncluded) {
          issues.push({
            id: rule.id,
            title: rule.category ? `${rule.category} Validation` : 'Review Required',
            description: rule.message,
            severity: (rule.severity as 'error' | 'warning') || 'warning',
          });
        }
      }
    });

    if (issues.length === 0 && po.status === 'Needs Review') {
      issues.push({
        id: 'generic-review',
        title: 'Review Required',
        description: 'One or more order fields require verification before XML generation.',
        severity: 'warning',
      });
    }

    return issues;
  }, [po]);

  const totalIssueCount = activeIssues.length;

  // Reusable Section Header Formatter (Theme A: 15px - one size smaller, Theme B: 17px)
  const renderSectionTitle = (title: string) => (
    <span
      className={`font-bold tracking-tight ${
        isThemeB ? 'text-white text-[17px]' : 'text-[#4f4f4e] text-[15px]'
      }`}
    >
      {title}
    </span>
  );

  // XML Readiness Cards component
  const renderXmlReadinessCards = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isThemeB ? 'bg-[#181B24] border-[#2A2E3D]' : 'bg-gray-50/75 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {renderSectionTitle('4. XML Readiness')}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Customer Resolved */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="text-emerald-800 font-semibold text-xs">
              Customer Resolved
            </div>
          </div>

          {/* Header Data Valid */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="text-emerald-800 font-semibold text-xs">
              Header Data Valid
            </div>
          </div>

          {/* Line Items Resolved */}
          <div className={unmappedLineCount > 0 ? "bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2 text-xs" : "bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs"}>
            <div className={unmappedLineCount > 0 ? "w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0" : "w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"}>
              {unmappedLineCount > 0 ? <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </div>
            <div className={unmappedLineCount > 0 ? "text-amber-800 font-semibold text-xs" : "text-emerald-800 font-semibold text-xs"}>
              {`${po.lineItems.length - unmappedLineCount}/${po.lineItems.length} Line Items Resolved`}
            </div>
          </div>

          {/* XML Ready (Only possible when 0 issues) */}
          <div className={unmappedLineCount > 0 ? "bg-red-50/80 border border-red-200 rounded-lg p-2.5 flex items-center gap-2 text-xs" : "bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs"}>
            <div className={unmappedLineCount > 0 ? "w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-700 shrink-0" : "w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"}>
              {unmappedLineCount > 0 ? <X className="w-3.5 h-3.5 stroke-[2.5]" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </div>
            <div className={unmappedLineCount > 0 ? "text-red-800 font-semibold text-xs" : "text-emerald-800 font-semibold text-xs"}>
              {unmappedLineCount > 0 ? 'XML Not Ready' : 'XML Ready'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 font-sans text-gray-900">
      
      {/* 🔹 TOP TITLE & ACTION HEADER BAR (NO WHITE BOX BEHIND) */}
      <div className="px-1 py-1 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Document Title, Status Pill (NO "0 issues" tag) */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-base sm:text-lg font-bold text-[#4f4f4e] tracking-tight page-header-title">
            {po.buyer.companyName || 'Customer Order'} &bull; PO {(po.order.poNumber || po.id).replace(/^#/, '')}
          </h1>

          {/* Status Badge */}
          {po.status === 'Completed' || (po.status as string) === 'XML Generated' ? (
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                XML Generated
              </span>
            </div>
          ) : po.status === 'Needs Review' || totalIssueCount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="bg-[#FEF6EE] border border-[#F9DBAF] text-[#B54708] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                Needs Review
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#B54708] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F79009] inline-block" />
                {totalIssueCount} {totalIssueCount === 1 ? 'issue requires attention' : 'issues require attention'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                Ready for XML
              </span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tab Switcher: Review Form vs Generated XML (Only visible for orders with status "XML Generated") */}
          {isXmlGenerated && (
            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  effectiveTab === 'review'
                    ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document &amp; Form</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('xml')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  effectiveTab === 'xml'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Generated XML</span>
              </button>
            </div>
          )}

          {/* Original Document Button */}
          <button
            type="button"
            onClick={() => {
              if (effectiveTab === 'xml') {
                setActiveTab('review');
                setIsDocCollapsed(false);
              } else {
                setIsDocCollapsed(!isDocCollapsed);
              }
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-2 rounded-lg text-xs border border-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Original Document"
          >
            {isDocCollapsed ? (
              <Eye className="w-3.5 h-3.5 text-gray-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-gray-600" />
            )}
            <span>Original Document</span>
          </button>

          {/* Generate XML Button (Only enabled when status is Ready for XML) */}
          <button
            type="button"
            disabled={po.status !== 'Ready for XML' && po.status !== 'Ready For XML'}
            onClick={handleGenerateXml}
            title={
              po.status === 'Ready for XML' || po.status === 'Ready For XML'
                ? 'Generate ERP XML for this order'
                : isXmlGenerated
                ? 'XML already generated'
                : 'Order status must be "Ready for XML" to generate XML (resolve issues first)'
            }
            className={`font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
              po.status === 'Ready for XML' || po.status === 'Ready For XML'
                ? 'bg-[#F8B800] hover:bg-[#e2a508] text-gray-900 cursor-pointer'
                : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed select-none'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${po.status === 'Ready for XML' || po.status === 'Ready For XML' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span>Generate XML</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔹 IF ACTIVE TAB IS 'XML' (GENERATED XML SCREEN)                          */}
      {/* ========================================================================= */}
      {effectiveTab === 'xml' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
          
          {/* Header & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F8B800] text-[#1A1A1A] rounded-lg flex items-center justify-center font-bold shadow-2xs shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">
                    EDI {(po.order.poNumber || po.id).replace(/^#/, '')}
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {po.buyer.companyName}
                </p>
              </div>
            </div>

            {/* Action Buttons: Download */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadXml}
                className="bg-[#F8B800] hover:bg-[#e0a400] text-[#1A1A1A] font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title="Download XML file"
              >
                <Download className="w-4 h-4" />
                <span>Download XML</span>
              </button>
            </div>
          </div>

          {/* 🚩 FLAGS DISPLAY (IF ANY) */}
          {(() => {
            const flags: string[] = [];
            const unmapped = po.lineItems.filter(
              (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
            );
            if (unmapped.length > 0) {
              flags.push(`${unmapped.length} unmapped line item${unmapped.length > 1 ? 's' : ''} (missing GEBOL Article ID)`);
            }
            const variances = po.lineItems.filter(
              (item) => item.priceVariance || (item.contractPrice && item.contractPrice > 0 && Math.abs(item.unitPrice - item.contractPrice) > 0.01)
            );
            if (variances.length > 0) {
              flags.push(`${variances.length} line item${variances.length > 1 ? 's' : ''} with price variance against contract`);
            }
            if (!po.buyer.gln && !po.buyer.customerNumber) {
              flags.push('Missing customer GLN / ILN identifier');
            }
            if (!po.buyer.vatId) {
              flags.push('Missing buyer VAT ID');
            }
            if (!po.delivery.requestedDeliveryDate) {
              flags.push('Missing requested delivery date');
            }

            if (flags.length > 0) {
              return (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2">
                      <span>Flags Detected ({flags.length})</span>
                      <span className="text-[11px] font-normal text-amber-700">Review required prior to ERP posting</span>
                    </div>
                    <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                      {flags.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab('review')}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-2.5 py-1 rounded text-xs shrink-0 cursor-pointer transition-colors"
                  >
                    Fix in Review
                  </button>
                </div>
              );
            }

            return null;
          })()}

          {/* XML Code Viewer */}
          <div className="border border-gray-300 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-gray-900 text-gray-200 px-4 py-2 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#F8B800]" />
                <span className="font-semibold text-white">XML Source Code</span>
                <span className="text-[10px] text-gray-400 font-sans">({(generatedXmlString.length / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyXml}
                className="hover:text-white text-gray-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {hasCopiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedXml ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="bg-[#1e1e1e] p-4 text-emerald-400 font-mono text-xs overflow-x-auto select-text">
              <pre className="leading-relaxed whitespace-pre font-mono">
                {generatedXmlString}
              </pre>
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 🔹 WORKSPACE: SPLIT SCREEN (IF DOC VISIBLE) OR SINGLE FRAME (IF COLLAPSED) */
        /* ========================================================================= */
        <div className={isDocCollapsed ? "w-full space-y-4" : "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"}>
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: SOURCE DOCUMENT (PDF) & 4. XML READINESS                    */}
          {/* ========================================================================= */}
          {!isDocCollapsed && (
            <div className="lg:col-span-5 lg:sticky lg:top-4 self-start space-y-4">
              
              {/* 📄 SOURCE DOCUMENT (PDF) CARD */}
              <div data-pdf-view="true" className="original-pdf-viewer bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
                {/* Header with Document Name */}
                <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDocCollapsed(true)}
                    className="flex items-center gap-1.5 hover:opacity-75 cursor-pointer text-left group min-w-0"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-700 group-hover:text-[#1A1A1A] transition-colors shrink-0" />
                    <span className="font-bold text-xs text-gray-900 font-mono truncate max-w-[280px] group-hover:underline">
                      {po.sourceFileName || 'Purchase Order Document.pdf'}
                    </span>
                  </button>
                </div>

                {/* Document Toolbar: Page & Zoom Controls (No Extraction Map / Actual PDF toggle) */}
                <div className="bg-gray-50/70 px-3 py-2 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    <span>Original Document (Page {currentDocPage}/{totalDocPages})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pagination Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-xs text-gray-700 shadow-2xs">
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

                    {/* Zoom Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-xs text-gray-700 shadow-2xs">
                      <button
                        onClick={() => setDocZoom(Math.max(75, docZoom - 10))}
                        className="p-1.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1.5 py-1 font-mono text-[10.5px] font-medium border-x border-gray-200">
                        {docZoom}%
                      </span>
                      <button
                        onClick={() => setDocZoom(Math.min(140, docZoom + 10))}
                        className="p-1.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Page Canvas / Actual PDF Embed */}
                {uploadedPdfUrl ? (
                  <div className="p-3 bg-gray-100/80 flex flex-col items-center">
                    <div className="w-full h-[620px] bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
                      <iframe
                        src={`${uploadedPdfUrl}#toolbar=1&navpanes=0`}
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100/70 overflow-auto max-h-[640px] flex justify-center">
                    <div
                      style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                      className="pdf-document-page bg-white border border-gray-300 shadow-md p-4 sm:p-5 rounded text-[10px] text-gray-800 w-full max-w-[500px] min-h-[580px] font-sans transition-transform overflow-hidden box-border"
                    >
                      {/* Header Zone: Buyer & Order Header */}
                      <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-3 gap-2">
                        <div className="flex-1 pr-1 min-w-0">
                          <div
                            id="doc-zone-buyer.companyName"
                            onClick={() => handleSelectField('buyer.companyName')}
                            className={`font-bold text-xs uppercase cursor-pointer rounded p-0.5 transition-colors truncate ${
                              activeHighlightField === 'buyer.companyName'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {po.buyer.companyName || 'Kunde'}
                          </div>
                          <div
                            id="doc-zone-buyer.billingAddress"
                            onClick={() => handleSelectField('buyer.companyName')}
                            className="text-[8.5px] text-gray-500 mt-0.5 leading-tight"
                          >
                            {po.buyer.billingAddress?.street ? (
                              <>
                                <div className="truncate">{po.buyer.billingAddress.street}</div>
                                <div className="truncate">
                                  {po.buyer.billingAddress.postalCode} {po.buyer.billingAddress.city}
                                  {po.buyer.billingAddress.country ? `, ${po.buyer.billingAddress.country}` : ''}
                                </div>
                              </>
                            ) : (
                              <div className="truncate">{po.buyer.companyName}</div>
                            )}
                          </div>
                          {po.buyer.vatId && (
                            <div
                              id="doc-zone-buyer.vatId"
                              onClick={() => handleSelectField('buyer.vatId')}
                              className={`text-[8px] font-mono text-gray-500 mt-0.5 cursor-pointer rounded p-0.5 truncate ${
                                activeHighlightField === 'buyer.vatId' ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]' : 'hover:bg-gray-100'
                              }`}
                            >
                              USt-IdNr: <span className="font-semibold text-gray-800">{po.buyer.vatId}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-xs text-gray-900">BESTELLUNG</div>
                          <div
                            id="doc-zone-order.poNumber"
                            onClick={() => handleSelectField('order.poNumber')}
                            className={`font-mono text-[11px] font-bold cursor-pointer rounded p-0.5 transition-colors ${
                              activeHighlightField === 'order.poNumber'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            Nr. {(po.order.poNumber || po.id).replace(/^#/, '')}
                          </div>
                          <div
                            id="doc-zone-order.poDate"
                            onClick={() => handleSelectField('order.poDate')}
                            className={`text-[8.5px] text-gray-500 mt-0.5 cursor-pointer rounded p-0.5 transition-colors ${
                              activeHighlightField === 'order.poDate'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            Datum: <span className="font-mono text-gray-800 font-medium">{formatDateToDDMMYYYY(po.order.poDate)}</span>
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
                          <div
                            id="doc-zone-delivery.deliveryLocation"
                            onClick={() => handleSelectField('delivery.deliveryLocation')}
                            className={`font-semibold text-gray-900 cursor-pointer rounded p-0.5 transition-colors truncate ${
                              activeHighlightField === 'delivery.deliveryLocation'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {po.delivery.recipientName || po.delivery.deliveryLocation || po.buyer.companyName}
                          </div>
                          <div
                            id="doc-zone-delivery.deliveryAddress"
                            onClick={() => handleSelectField('delivery.deliveryAddress')}
                            className={`cursor-pointer rounded p-0.5 transition-colors text-gray-600 ${
                              activeHighlightField === 'delivery.deliveryAddress'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="truncate">{po.delivery.deliveryAddress?.street || po.delivery.deliveryLocation || 'Lieferanschrift'}</div>
                            <div className="truncate">
                              {po.delivery.deliveryAddress?.postalCode} {po.delivery.deliveryAddress?.city}
                              {po.delivery.deliveryAddress?.country ? `, ${po.delivery.deliveryAddress?.country}` : ''}
                            </div>
                          </div>
                          <div
                            id="doc-zone-delivery.requestedDeliveryDate"
                            onClick={() => handleSelectField('delivery.requestedDeliveryDate')}
                            className={`mt-0.5 font-mono cursor-pointer rounded p-0.5 transition-colors truncate ${
                              activeHighlightField === 'delivery.requestedDeliveryDate'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            Liefertermin: <strong>{formatDateToDDMMYYYY(po.delivery.requestedDeliveryDate || po.order.poDate)}</strong>
                          </div>
                          {po.delivery.unloadingPoint && (
                            <div className="text-[7.5px] text-gray-500 mt-0.5 truncate">
                              Abladestelle: <span className="font-medium text-gray-700">{po.delivery.unloadingPoint}</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-gray-600 uppercase text-[7.5px] mb-0.5">Lieferant:</div>
                          <div className="font-semibold text-gray-900 truncate">Gebol GmbH</div>
                          <div className="text-gray-600 truncate">Dr. Körner Str. 4</div>
                          <div className="text-gray-600 truncate">A-4470 Enns</div>
                          <div
                            id="doc-zone-buyer.gln"
                            onClick={() => handleSelectField('buyer.gln')}
                            className={`mt-1 inline-block text-[7.5px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 cursor-pointer max-w-full truncate ${
                              activeHighlightField === 'buyer.gln'
                                ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]'
                                : 'hover:bg-emerald-50'
                            }`}
                          >
                            CLV: <span className="underline font-bold">{po.buyer.gln || po.buyer.customerNumber || '109008'}</span>
                          </div>
                          {po.buyer.customerNumber && (
                            <div
                              id="doc-zone-buyer.customerNumber"
                              onClick={() => handleSelectField('buyer.customerNumber')}
                              className={`mt-0.5 text-[7.5px] text-gray-600 cursor-pointer rounded p-0.5 truncate ${
                                activeHighlightField === 'buyer.customerNumber' ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]' : 'hover:bg-gray-100'
                              }`}
                            >
                              Kd-Nr: <span className="font-mono font-medium text-gray-900">{po.buyer.customerNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Items Table: STRICTLY CONTAINED */}
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
                            {po.lineItems.slice((currentDocPage - 1) * itemsPerPage, currentDocPage * itemsPerPage).map((li, idx) => {
                              const isUnmapped = !li.skuMatched || li.gebolArticleNo === 'UNMAPPED-ARTICLE' || li.gebolArticleNo === 'UNMAPPED-SKU' || !li.gebolArticleNo;
                              const lineTotal = Number(((li.quantity || 0) * (li.unitPrice || 0)).toFixed(2));
                              const posNumber = li.itemPos || ((currentDocPage - 1) * itemsPerPage + idx + 1) * 10;
                              return (
                                <tr
                                  key={li.id}
                                  id={`doc-zone-lineItem-${li.id}`}
                                  onClick={() => handleSelectField(`lineItem-${li.id}`)}
                                  className={`transition-colors cursor-pointer ${
                                    activeHighlightField === `lineItem-${li.id}`
                                      ? 'bg-[#F8B800]/25 font-semibold text-gray-900'
                                      : isUnmapped
                                      ? 'bg-red-50/50 hover:bg-red-50'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <td className={`p-1 font-mono align-top ${isUnmapped ? 'text-red-600 font-bold' : ''}`}>
                                    {posNumber}
                                  </td>
                                  <td className="p-1 font-mono align-top whitespace-nowrap overflow-hidden">
                                    {li.quantity} {li.unit || 'St'}
                                  </td>
                                  <td className="p-1 align-top min-w-0 overflow-hidden">
                                    <div className={`font-medium leading-snug line-clamp-2 break-words ${isUnmapped ? 'text-red-700 font-semibold' : 'text-gray-900'}`}>
                                      {li.description}
                                    </div>
                                    <div className={`text-[7.5px] font-mono mt-0.5 break-all ${isUnmapped ? 'text-red-600' : 'text-gray-500'}`}>
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
                            ... Fortsetzung auf Seite {currentDocPage + 1} ({po.lineItems.length - (currentDocPage * itemsPerPage)} weitere Positionen)
                          </div>
                        ) : (
                          <div className="mt-2.5 pt-2 border-t border-gray-300 flex justify-between items-start text-[8.5px] gap-2">
                            <div className="min-w-0 flex-1">
                              <div
                                id="doc-zone-order.paymentTerms"
                                onClick={() => handleSelectField('order.paymentTerms')}
                                className={`text-gray-600 font-medium cursor-pointer rounded p-0.5 truncate ${
                                  activeHighlightField === 'order.paymentTerms' ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]' : 'hover:bg-gray-100'
                                }`}
                              >
                                Zahlungsbedingungen: <span className="font-mono text-gray-800 font-normal">{po.order.paymentTerms || '30 Tage Netto'}</span>
                              </div>
                              <div
                                id="doc-zone-order.incoterms"
                                onClick={() => handleSelectField('order.incoterms')}
                                className={`text-gray-600 font-medium cursor-pointer rounded p-0.5 truncate ${
                                  activeHighlightField === 'order.incoterms' ? 'bg-[#F8B800]/30 ring-1 ring-[#F8B800]' : 'hover:bg-gray-100'
                                }`}
                              >
                                Lieferbedingungen: <span className="font-mono text-gray-800 font-normal">{po.order.incoterms || 'DDP'}</span>
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
                )}
              </div>

              {/* 🛡️ 4. XML READINESS CARD */}
              {renderXmlReadinessCards()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: 1. CUSTOMER & DELIVERY, 2. ORDER INFO, 3. LINE ITEMS, ETC.  */}
          {/* ========================================================================= */}
          <div className={isDocCollapsed ? "w-full space-y-4" : "lg:col-span-7 space-y-4"}>
            {/* 👤 1. CUSTOMER & DELIVERY */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              <div
                className={`px-4 py-3 border-b flex items-center justify-between ${
                  isThemeB ? 'bg-[#181B24] border-[#2A2E3D]' : 'bg-gray-50/75 border-gray-200'
                }`}
              >
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
                      value={po.buyer.companyName || ''}
                      onFocus={() => handleSelectField('buyer.companyName')}
                      onClick={() => handleSelectField('buyer.companyName')}
                      onChange={(e) => onUpdatePo({ ...po, buyer: { ...po.buyer, companyName: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !po.buyer.companyName?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {po.buyer.companyName?.trim() ? (
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
                      value={po.buyer.customerNumber || ''}
                      onFocus={() => handleSelectField('buyer.customerNumber')}
                      onClick={() => handleSelectField('buyer.customerNumber')}
                      onChange={(e) => onUpdatePo({ ...po, buyer: { ...po.buyer, customerNumber: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !po.buyer.customerNumber?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {po.buyer.customerNumber?.trim() ? (
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
                    !po.buyer.gln?.trim()
                      ? 'border border-red-400 bg-red-50/30'
                      : 'border border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500'
                  }`}>
                    <input
                      type="text"
                      value={po.buyer.gln || ''}
                      onFocus={() => handleSelectField('buyer.gln')}
                      onClick={() => handleSelectField('buyer.gln')}
                      onChange={(e) => onUpdatePo({ ...po, buyer: { ...po.buyer, gln: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="flex-1 bg-transparent text-[13px] font-normal text-[#4f4f4e] focus:outline-none min-w-0"
                    />
                    {po.buyer.gln?.trim() ? (
                      <>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded mr-1.5 shrink-0">
                          <Check className="w-3 h-3" />
                          Matched
                        </span>
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      </>
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
                      value={po.delivery.deliveryLocation || ''}
                      onFocus={() => handleSelectField('delivery.deliveryLocation')}
                      onClick={() => handleSelectField('delivery.deliveryLocation')}
                      onChange={(e) => onUpdatePo({ ...po, delivery: { ...po.delivery, deliveryLocation: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !po.delivery.deliveryLocation?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {po.delivery.deliveryLocation?.trim() ? (
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
                        po.delivery.deliveryAddress?.street
                          ? `${po.delivery.deliveryAddress.street}${
                              po.delivery.deliveryAddress.postalCode || po.delivery.deliveryAddress.city
                                ? `, ${po.delivery.deliveryAddress.postalCode || ''} ${po.delivery.deliveryAddress.city || ''}`
                                : ''
                            }${po.delivery.deliveryAddress.country ? `, ${po.delivery.deliveryAddress.country}` : ''}`
                          : (po.delivery.deliveryLocation || '')
                      }
                      onFocus={() => handleSelectField('delivery.deliveryAddress')}
                      onClick={() => handleSelectField('delivery.deliveryAddress')}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdatePo({
                          ...po,
                          delivery: {
                            ...po.delivery,
                            deliveryAddress: {
                              ...po.delivery.deliveryAddress,
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
                    value={po.delivery.recipientName || ''}
                    onFocus={() => handleSelectField('delivery.deliveryLocation')}
                    onClick={() => handleSelectField('delivery.deliveryLocation')}
                    onChange={(e) => onUpdatePo({ ...po, delivery: { ...po.delivery, recipientName: e.target.value } })}
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
              <div
                className={`px-4 py-3 border-b flex items-center justify-between ${
                  isThemeB ? 'bg-[#181B24] border-[#2A2E3D]' : 'bg-gray-50/75 border-gray-200'
                }`}
              >
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
                      value={po.order.poNumber || ''}
                      onFocus={() => handleSelectField('order.poNumber')}
                      onClick={() => handleSelectField('order.poNumber')}
                      onChange={(e) => onUpdatePo({ ...po, order: { ...po.order, poNumber: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg text-[13px] font-normal transition-colors focus:outline-none ${
                        !po.order.poNumber?.trim()
                          ? 'bg-red-50/40 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800]'
                      }`}
                    />
                    {po.order.poNumber?.trim() ? (
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
                      value={po.delivery.requestedDeliveryDate ? (po.delivery.requestedDeliveryDate.includes('-') && po.delivery.requestedDeliveryDate.split('-')[0].length === 4 ? po.delivery.requestedDeliveryDate : (po.delivery.requestedDeliveryDate.includes('.') ? po.delivery.requestedDeliveryDate.split('.').reverse().join('-') : '')) : ''}
                      onFocus={() => handleSelectField('delivery.requestedDeliveryDate')}
                      onClick={() => {
                        handleSelectField('delivery.requestedDeliveryDate');
                        try {
                          dateInputRef.current?.showPicker();
                        } catch {}
                      }}
                      onChange={(e) => onUpdatePo({ ...po, delivery: { ...po.delivery, requestedDeliveryDate: e.target.value } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className={`w-full pl-3 pr-16 py-2 rounded-lg text-[13px] font-normal font-sans transition-colors cursor-pointer focus:outline-none ${
                        !po.delivery.requestedDeliveryDate?.trim()
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
                      {po.delivery.requestedDeliveryDate?.trim() ? (
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
              {/* Header */}
              <div
                className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
                  isThemeB ? 'bg-[#181B24] border-[#2A2E3D]' : 'bg-gray-50/75 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {renderSectionTitle(`3. Line Items / Positions (${po.lineItems.length} Items)`)}
                </div>

                <div className="flex items-center gap-2">
                  {unmappedLineCount > 0 && (
                    <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                      {unmappedLineCount} Unmapped Item
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddItemModal}
                    className="bg-white hover:bg-gray-50 text-gray-800 font-medium px-3 py-1 rounded-lg text-xs border border-gray-300 flex items-center gap-1 shadow-2xs cursor-pointer"
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
                    {(showAllItems ? po.lineItems : po.lineItems.slice(0, 5)).map((item, index) => {
                      const isUnmapped = !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo;
                      const isHighlighted = activeHighlightField === `lineItem-${item.id}`;

                      // Lookup matching master article from INITIAL_ARTICLES_DATASET
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
                          onClick={() => handleSelectField(`lineItem-${item.id}`)}
                          className={`transition-colors cursor-pointer ${
                            isHighlighted
                              ? 'bg-amber-50/90 ring-1 ring-[#F8B800]'
                              : isUnmapped
                              ? 'bg-red-50/40 hover:bg-red-50/70'
                              : 'hover:bg-gray-50/60'
                          }`}
                        >
                          {/* Pos (Editable) */}
                          <td className="py-1.5 px-2 text-center">
                            <input
                              type="number"
                              value={item.itemPos}
                              onClick={(e) => { e.stopPropagation(); handleSelectField(`lineItem-${item.id}`); }}
                              onFocus={() => handleSelectField(`lineItem-${item.id}`)}
                              onChange={(e) => handleLineItemChange(item.id, { itemPos: Number(e.target.value) || 0 })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              className={`w-12 text-center py-1 text-xs font-normal font-mono rounded focus:outline-none transition-colors ${
                                !item.itemPos || item.itemPos <= 0
                                  ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 font-bold'
                                  : isUnmapped
                                  ? 'bg-white border border-red-300 text-red-600 font-bold focus:border-red-400'
                                  : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                              }`}
                            />
                          </td>

                          {/* EAN / Barcode (Editable + Master Lookup) */}
                          <td className="py-1.5 px-2">
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                value={item.eanBarcode || effectiveEan}
                                onClick={(e) => { e.stopPropagation(); handleSelectField(`lineItem-${item.id}`); }}
                                onFocus={() => handleSelectField(`lineItem-${item.id}`)}
                                onChange={(e) => handleLineItemChange(item.id, { eanBarcode: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                }}
                                placeholder="EAN / Barcode"
                                className={`w-full pl-2 pr-10 py-1 text-xs font-normal font-mono rounded transition-colors focus:outline-none ${
                                  isUnmapped && (!item.eanBarcode || !matchedMaster)
                                    ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                                    : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                                }`}
                              />
                              <div className="absolute right-1 flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setResolvingLineItemId(item.id);
                                  }}
                                  className="text-gray-400 hover:text-amber-600 p-0.5 rounded cursor-pointer transition-colors"
                                  title="Lookup in Article Masters"
                                >
                                  <SearchIcon className="w-3.5 h-3.5" />
                                </button>
                                {(item.eanBarcode || effectiveEan) && matchedMaster ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                                ) : (item.eanBarcode || effectiveEan) ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
                                ) : null}
                              </div>
                            </div>
                          </td>

                          {/* GEBOL Art.Nr. (Editable + Lookup Modal Trigger) */}
                          <td className="py-1.5 px-2">
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                value={item.gebolArticleNo || effectiveGebolArtNo}
                                onClick={(e) => { e.stopPropagation(); handleSelectField(`lineItem-${item.id}`); }}
                                onFocus={() => handleSelectField(`lineItem-${item.id}`)}
                                onChange={(e) => handleLineItemChange(item.id, { gebolArticleNo: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                }}
                                placeholder="Art.No."
                                className={`w-full pl-2 pr-10 py-1 text-xs font-normal font-mono rounded transition-colors focus:outline-none ${
                                  isUnmapped
                                    ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                                    : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                                }`}
                              />
                              <div className="absolute right-1 flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setResolvingLineItemId(item.id);
                                  }}
                                  className="text-gray-400 hover:text-amber-600 p-0.5 rounded cursor-pointer transition-colors"
                                  title="Lookup in Article Masters (Art.No.)"
                                >
                                  <SearchIcon className="w-3.5 h-3.5" />
                                </button>
                                {(item.gebolArticleNo || effectiveGebolArtNo) && matchedMaster ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Customer Art.Nr. (Editable) */}
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={item.customerArticleNo || ''}
                              onClick={(e) => { e.stopPropagation(); handleSelectField(`lineItem-${item.id}`); }}
                              onFocus={() => handleSelectField(`lineItem-${item.id}`)}
                              onChange={(e) => handleLineItemChange(item.id, { customerArticleNo: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              className="w-full px-2 py-1 text-xs font-normal font-mono text-[#4f4f4e] bg-white border border-gray-200 rounded focus:border-gray-400 focus:outline-none"
                            />
                          </td>

                          {/* Description (Editable) */}
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={item.description || ''}
                              onClick={(e) => { e.stopPropagation(); handleSelectField(`lineItem-${item.id}`); }}
                              onFocus={() => handleSelectField(`lineItem-${item.id}`)}
                              onChange={(e) => handleLineItemChange(item.id, { description: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              className="w-full px-2 py-1 text-xs font-normal text-[#4f4f4e] bg-white border border-gray-200 rounded focus:border-gray-400 focus:outline-none"
                            />
                          </td>

                          {/* Qty (Editable) */}
                          <td className="py-1.5 px-2 text-right">
                            <input
                              type="number"
                              value={item.quantity}
                              onClick={(e) => { e.stopPropagation(); handleSelectField(`lineItem-${item.id}`); }}
                              onFocus={() => handleSelectField(`lineItem-${item.id}`)}
                              onChange={(e) => handleLineItemChange(item.id, { quantity: Number(e.target.value) || 0 })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              className={`w-14 px-1.5 py-1 text-right text-xs font-normal rounded focus:outline-none transition-colors ${
                                !item.quantity || item.quantity <= 0
                                  ? 'bg-red-50/60 border border-red-400 text-red-700 focus:border-red-500 font-bold'
                                  : 'bg-white border border-gray-200 text-[#4f4f4e] focus:border-gray-400'
                              }`}
                            />
                          </td>

                          {/* Action */}
                          <td className="py-1.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLineItem(item.id);
                              }}
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
              <div className="p-2.5 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="text-xs font-medium text-gray-700 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAllItems ? 'Show fewer items' : `Show all ${po.lineItems.length} items`}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllItems ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* 🛡️ 4. XML READINESS CARD (Positioned below section 3 when original document is hidden) */}
            {isDocCollapsed && renderXmlReadinessCards()}

            {/* 🔹 BOTTOM ROW: ISSUE BANNER (LEFT) & 5. ADDITIONAL DETAILS (TEXT BOX WITH SECTIONIZING INSIDE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Issue Attention Banner */}
              <div className="bg-[#FFF9F5] border border-[#FECDCA] rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center font-bold text-[10px] shrink-0">
                      !
                    </div>
                    <span className="font-bold text-[15px] text-[#B42318]">
                      {activeIssues.length > 0
                        ? `${activeIssues.length} ${activeIssues.length === 1 ? 'issue requires' : 'issues require'} your attention`
                        : 'All issues resolved'}
                    </span>
                  </div>

                  {activeIssues.length > 0 ? (
                    <div className="space-y-2">
                      {activeIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-center justify-between gap-3 p-2.5 bg-white/80 rounded-lg border border-[#FECDCA]/70"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-[14px] font-semibold text-[#B42318]">
                              {issue.title}
                            </div>
                            <div className="text-[14px] text-[#4f4f4e] font-normal truncate">
                              {issue.description}
                            </div>
                          </div>
                          {issue.lineItemId && (
                            <button
                              type="button"
                              onClick={() => setResolvingLineItemId(issue.lineItemId!)}
                              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                            >
                              <span>Resolve</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[15px] text-[#4f4f4e] font-normal">
                      All line items and master customer linkages verified.
                    </p>
                  )}
                </div>
              </div>

              {/* Right: 5. ADDITIONAL INFORMATION (TEXT BOX WITH SECTIONIZING INSIDE) */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    isThemeB ? 'bg-[#181B24] border-[#2A2E3D]' : 'bg-gray-50/75 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {renderSectionTitle('5. Additional Information')}
                  </div>
                </div>

                {/* Text Box with formatted sectionized data inside */}
                <div className="p-4 space-y-1.5">
                  <textarea
                    rows={6}
                    value={additionalDetailsText}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setAdditionalDetailsText(newText);
                      onUpdatePo({
                        ...po,
                        order: {
                          ...po.order,
                          customerNotes: newText,
                        },
                      });
                    }}
                    placeholder="[Delivery Terms & Instructions]&#10;Incoterms: ...&#10;Payment Terms: ...&#10;&#10;[Customer Representative]&#10;Contact Person: ...&#10;Email: ...&#10;Phone: ..."
                    className="w-full p-3 bg-gray-50/60 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-[13px] font-normal font-sans text-[#4f4f4e] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-[#F8B800] transition-colors leading-relaxed resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 ARTICLE MASTER LOOKUP SELECTION MODAL (SAME TABLE FORMAT AS ADD ITEM POSITION) */}
      {resolvingLineItemId && (
        <div
          className={`fixed inset-0 ${
            isThemeB ? 'bg-black/50 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 z-50`}
        >
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
            <div className="px-2.5 py-2 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search GEBOL catalog by Art.Nr, description, or barcode..."
                  value={articleSearchTerm}
                  onChange={(e) => setArticleSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg bg-white text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-[#F8B800]"
                />
              </div>
            </div>

            {/* Compact Articles Table */}
            <div className="overflow-y-auto px-1 py-1 flex-1 max-h-[50vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2 px-2.5 w-28 font-bold text-gray-800">Art.Nr.</th>
                    <th className="py-2 px-2.5 font-bold text-gray-800">Article Description</th>
                    <th className="py-2 px-2.5 w-44 font-bold text-gray-800">EAN / Barcode</th>
                    <th className="py-2 px-2.5 w-24 text-center font-bold text-gray-800">Action</th>
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
                        <td className="py-2 px-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {art.articleId}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-gray-800 font-medium whitespace-normal break-words text-xs">
                          {art.description}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-gray-600 whitespace-nowrap text-xs">
                          {art.ean}
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveArticleItem(art);
                            }}
                            className="bg-gray-900 hover:bg-black text-[#F8B800] font-semibold px-3 py-1.5 rounded-md text-xs cursor-pointer shadow-2xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3 text-[#F8B800]" />
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
          const currentGp = (po.buyer.customerNumber || '').trim();
          const currentGln = (po.buyer.gln || '').trim();
          const currentName = (po.buyer.companyName || '').trim().toLowerCase();
          if (currentGp && currentGp === c.gpNr.trim()) return true;
          if (currentGln && currentGln === c.gln.trim()) return true;
          if (currentName && currentName === c.companyName.trim().toLowerCase()) return true;
          return false;
        };

        const filteredCustomers = INITIAL_CUSTOMERS.filter((c) => {
          // Exclude customer currently in use
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
          onUpdatePo({
            ...po,
            buyer: {
              ...po.buyer,
              companyName: cust.companyName,
              customerNumber: cust.gpNr,
              gln: cust.gln || po.buyer.gln,
              vatId: cust.vatId || po.buyer.vatId,
              billingAddress: {
                street: cust.street,
                postalCode: cust.postalCode,
                city: cust.city,
                country: cust.country,
              },
            },
            order: {
              ...po.order,
              paymentTerms: cust.paymentTerms || po.order.paymentTerms,
              incoterms: cust.incoterms || po.order.incoterms,
            },
          });
          setIsCustomerModalOpen(false);
          toast.success('Customer Master Selected', `${cust.companyName} (GP: ${cust.gpNr}) linked to purchase order.`);
        };

        return (
          <div
            className={`fixed inset-0 ${
              isThemeB ? 'bg-black/50 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
            } flex items-center justify-center p-6 sm:p-8 z-50 animate-in fade-in duration-150`}
          >
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
                  <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by GPNr, company name, ZIP code, city, street, or ILN..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-md bg-white text-[13px] text-gray-900 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
                  />
                  {customerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearchTerm('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Country Filter */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <select
                    value={customerCountryFilter}
                    onChange={(e) => setCustomerCountryFilter(e.target.value)}
                    className="border border-gray-300 rounded-md bg-white py-1.5 px-2.5 text-xs text-gray-700 focus:outline-none focus:border-[#F8B800]"
                  >
                    <option value="All">All Countries</option>
                    <option value="DE">DE</option>
                    <option value="AT">AT</option>
                  </select>
                </div>

                {(customerSearchTerm || customerCountryFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSearchTerm('');
                      setCustomerCountryFilter('All');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-900 underline font-medium cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Compact Tabular Content with side margins */}
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
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Try adjusting your search criteria or clearing active filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="hover:bg-amber-50/50 transition-colors cursor-pointer group text-xs"
                        >
                          {/* GPNr. */}
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-mono font-medium text-gray-900">
                            {cust.gpNr}
                          </td>

                          {/* Company Name */}
                          <td className="py-1.5 px-2.5 font-medium text-gray-900 whitespace-nowrap">
                            {cust.companyName}
                          </td>

                          {/* ZIP Code */}
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-mono text-gray-700">
                            {cust.postalCode}
                          </td>

                          {/* City */}
                          <td className="py-1.5 px-2.5 text-gray-800 whitespace-nowrap">
                            {cust.city}
                          </td>

                          {/* Street */}
                          <td className="py-1.5 px-2.5 text-gray-700 whitespace-nowrap">
                            {cust.street}
                          </td>

                          {/* Country */}
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-medium text-gray-800">
                            {cust.country}
                          </td>

                          {/* ILN */}
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-mono text-gray-800">
                            {cust.gln}
                          </td>

                          {/* Action */}
                          <td className="py-1.5 px-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(cust);
                              }}
                              className="bg-gray-900 hover:bg-black text-[#F8B800] font-medium px-2.5 py-1 rounded text-xs shrink-0 cursor-pointer inline-flex items-center gap-1 transition-colors shadow-2xs group-hover:bg-black"
                            >
                              <Check className="w-3 h-3 text-[#F8B800]" />
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

      {/* 🔹 ADD ITEM POSITION MODAL */}
      {isAddItemModalOpen && (
        <div
          className={`fixed inset-0 ${
            isThemeB ? 'bg-black/50 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 z-50`}
        >
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
            <div className="px-2.5 py-2 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search GEBOL catalog by Art.Nr, description, or barcode..."
                  value={addItemSearchTerm}
                  onChange={(e) => setAddItemSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg bg-white text-[13px] font-normal text-[#4f4f4e] focus:outline-none focus:border-[#F8B800]"
                />
              </div>
            </div>

            {/* Compact Articles Table */}
            <div className="overflow-y-auto px-1 py-1 flex-1 max-h-[50vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 text-xs">
                    <th className="py-2 px-2.5 w-28 font-bold text-gray-800">Art.Nr.</th>
                    <th className="py-2 px-2.5 font-bold text-gray-800">Article Description</th>
                    <th className="py-2 px-2.5 w-44 font-bold text-gray-800">EAN / Barcode</th>
                    <th className="py-2 px-2.5 w-24 text-center font-bold text-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredArticlesForAdd.map((art) => {
                    const isSelected = selectedArticleForAdd?.id === art.id;
                    return (
                      <tr
                        key={art.id}
                        onClick={() => setSelectedArticleForAdd(art)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 ring-1 ring-inset ring-[#F8B800]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-2 px-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            {art.articleId}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-gray-800 font-medium whitespace-normal break-words">
                          {art.description}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-gray-600 whitespace-nowrap">
                          {art.ean}
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedArticleForAdd(art);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#F8B800] text-gray-900 shadow-2xs font-bold'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Article & Quantity */}
            <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-[#8f9494] block font-light">Selected Article</span>
                <span className="text-[14px] font-bold text-[#4f4f4e] block whitespace-normal break-words">
                  {selectedArticleForAdd
                    ? `${selectedArticleForAdd.articleId} • ${selectedArticleForAdd.description}`
                    : 'None selected yet (click a row in the table above)'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-[13px] font-light text-[#8f9494] field-header">Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={addItemQuantity}
                  onChange={(e) => setAddItemQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-[13px] font-normal text-[#4f4f4e] text-right"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedArticleForAdd}
                onClick={handleConfirmAddItem}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                  selectedArticleForAdd
                    ? 'bg-[#F8B800] hover:bg-[#E0A400] text-gray-900'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
