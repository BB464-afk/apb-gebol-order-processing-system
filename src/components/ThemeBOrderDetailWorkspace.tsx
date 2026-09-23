import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Download,
  ArrowRight,
  Search as SearchIcon,
  X,
  Building2,
  Copy,
  Code2,
  ArrowLeft,
  Zap,
  User,
  Truck,
  Info,
  Trash2,
  Eye,
  EyeOff,
  FileCode,
  Calendar
} from 'lucide-react';
import {
  PurchaseOrderRecord,
  LineItem
} from '../types/po';
import { INITIAL_CUSTOMERS, CustomerMasterRecord } from './CustomerMasterView';
import { INITIAL_ARTICLES_DATASET, ArticleMasterRecord } from './ArticleMasterView';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { generateGebolErpXml } from '../utils/xmlGenerator';
import { formatDateToDDMMYYYY, formatDateOnly } from '../utils/dateUtils';

interface ThemeBOrderDetailWorkspaceProps {
  po: PurchaseOrderRecord;
  onUpdatePo: (updatedPo: PurchaseOrderRecord) => void;
  onOpenXmlModal: (po: PurchaseOrderRecord) => void;
  onBack?: () => void;
  onNavigateToCustomerMaster?: () => void;
}

export const ThemeBOrderDetailWorkspace: React.FC<ThemeBOrderDetailWorkspaceProps> = ({
  po,
  onUpdatePo,
  onOpenXmlModal,
  onBack,
  onNavigateToCustomerMaster,
}) => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const themeBDateInputRef = useRef<HTMLInputElement>(null);

  // Status check: XML Generated
  const isXmlGenerated = po.status === 'Completed' || (po.status as string) === 'XML Generated';

  // Active Tab: 'document' or 'xml' (only when XML Generated)
  const [activeTab, setActiveTab] = useState<'document' | 'xml'>('document');
  const [showOriginalPdf, setShowOriginalPdf] = useState<boolean>(true);

  useEffect(() => {
    if (!isXmlGenerated && activeTab === 'xml') {
      setActiveTab('document');
    }
  }, [isXmlGenerated, activeTab]);

  // Document type helper: strictly returns 'PDF', 'Excel', or 'XML'
  const getSimpleDocType = (docType?: string, sourceType?: string): 'PDF' | 'Excel' | 'XML' => {
    const combined = `${docType || ''} ${sourceType || ''}`.toLowerCase();
    if (combined.includes('excel') || combined.includes('xls') || combined.includes('xlsx') || combined.includes('csv')) {
      return 'Excel';
    }
    if (combined.includes('xml') || combined.includes('edi')) {
      return 'XML';
    }
    return 'PDF';
  };

  // Document Viewer Pagination & Zoom State
  const [docPage, setDocPage] = useState<number>(1);
  const [docZoom, setDocZoom] = useState<number>(100);
  const itemsPerPage = 5;
  const totalDocPages = Math.max(1, Math.ceil(po.lineItems.length / itemsPerPage));
  const currentDocPage = Math.min(docPage, totalDocPages);

  const currentDocPageItems = useMemo(() => {
    return po.lineItems.slice((currentDocPage - 1) * itemsPerPage, currentDocPage * itemsPerPage);
  }, [po.lineItems, currentDocPage, itemsPerPage]);

  const netSubtotal = useMemo(() => {
    return po.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [po.lineItems]);

  const vatRate = useMemo(() => {
    const c = (po.buyer.country || '').toLowerCase();
    return c === 'austria' || c === 'österreich' || c === 'at' ? 0.20 : 0.19;
  }, [po.buyer.country]);

  const vatAmount = netSubtotal * vatRate;
  const grossTotal = netSubtotal + vatAmount;

  const docBrand = useMemo(() => {
    const comp = ((po.buyer.companyName || '') + ' ' + (po.buyer.recipientName || '')).toLowerCase();
    const file = (po.sourceFileName || '').toLowerCase();
    if (comp.includes('bauking') || file.includes('bauking')) {
      return {
        id: 'bauking',
        name: 'BAUKING',
        logoRender: (
          <div className="inline-block bg-[#8B1E2D] text-white font-black text-xl px-2.5 py-0.5 tracking-wider rounded-xs shadow-2xs">
            BAUKING
          </div>
        ),
        companyName: 'BAUKING Ostfalen GmbH',
        street: 'Magdeburger Berg 3',
        city: '38350 Helmstedt',
        country: 'Deutschland',
        orderTitle: 'BESTELLUNG / AUFTRAG',
        orderSubtitle: 'Purchase Order / EDI 850',
        tableHeaderClass: 'bg-[#F4F5F7] border-b-2 border-[#8B1E2D] text-[#344054] font-semibold text-[10.5px]',
        tableBorderClass: 'border-2 border-[#8B1E2D]/30 rounded-lg overflow-hidden shadow-xs',
        rowHoverClass: 'hover:bg-[#8B1E2D]/5',
        accentColor: 'text-[#8B1E2D]',
        badgeBg: 'bg-[#8B1E2D]/10 text-[#8B1E2D] border border-[#8B1E2D]/20',
        artNoHeader: 'BAUKING Art.-Nr.',
        showEan: true,
        docBadge: 'EDI Standard Purchase Order',
        posPrefix: 'BK-',
      };
    }
    if (comp.includes('bauhaus') || file.includes('bauhaus')) {
      return {
        id: 'bauhaus',
        name: 'BAUHAUS',
        logoRender: (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#E30613] flex items-center justify-center text-white font-bold text-[9px] rounded-xs shadow-2xs">
              ⌂
            </div>
            <div className="inline-block bg-[#E30613] text-white font-black text-xl px-2.5 py-0.5 tracking-widest rounded-xs shadow-2xs">
              BAUHAUS
            </div>
          </div>
        ),
        companyName: 'BAUHAUS Depot GmbH Wien',
        street: 'Straubinggasse 25',
        city: '1210 Wien',
        country: 'Österreich',
        orderTitle: 'BESTELLUNG',
        orderSubtitle: 'Direct Store Delivery Order',
        tableHeaderClass: 'bg-[#FEF3F2] border-b-2 border-[#E30613] text-[#1D2939] font-bold text-[10.5px]',
        tableBorderClass: 'border-2 border-[#E30613]/30 rounded-lg overflow-hidden shadow-xs',
        rowHoverClass: 'hover:bg-[#E30613]/5',
        accentColor: 'text-[#E30613]',
        badgeBg: 'bg-[#FEF3F2] text-[#E30613] border border-[#FECDCA]',
        artNoHeader: 'Bauhaus Art.-Nr.',
        showEan: true,
        docBadge: 'Bauhaus Retail Order Form',
        posPrefix: 'BH-',
      };
    }
    if (comp.includes('hornbach') || file.includes('hornbach')) {
      return {
        id: 'hornbach',
        name: 'HORNBACH',
        logoRender: (
          <div className="inline-block bg-[#F58220] text-black font-black text-xl px-2.5 py-0.5 tracking-tight rounded-xs shadow-2xs border border-black/20">
            HORNBACH
          </div>
        ),
        companyName: 'Hornbach Baumarkt AG',
        street: 'Hornbachstraße 11',
        city: '76879 Bornheim',
        country: 'Deutschland',
        orderTitle: 'BESTELLUNG / ORDER',
        orderSubtitle: 'Central Hub Order / CDC-4',
        tableHeaderClass: 'bg-[#FFF6ED] border-b-2 border-[#F58220] text-[#1D2939] font-bold text-[10.5px]',
        tableBorderClass: 'border-2 border-[#F58220]/40 rounded-lg overflow-hidden shadow-xs',
        rowHoverClass: 'hover:bg-[#F58220]/5',
        accentColor: 'text-[#F58220]',
        badgeBg: 'bg-[#FFF6ED] text-[#B54708] border border-[#FEDF89]',
        artNoHeader: 'Hornbach Mat.-Nr.',
        showEan: true,
        docBadge: 'Hornbach Logistics Hub Order',
        posPrefix: 'HB-',
      };
    }
    if (comp.includes('würth') || comp.includes('wuerth') || file.includes('wuerth')) {
      return {
        id: 'wuerth',
        name: 'WÜRTH',
        logoRender: (
          <div className="inline-block bg-[#CC0000] text-white font-black text-lg px-2.5 py-0.5 tracking-wider rounded-xs shadow-2xs">
            WÜRTH
          </div>
        ),
        companyName: 'Würth Handelsges.m.b.H.',
        street: 'Würth Straße 1',
        city: '3071 Böheimkirchen',
        country: 'Österreich',
        orderTitle: 'BESTELLUNG / AUFTRAG',
        orderSubtitle: 'Industrial Division Purchase Order',
        tableHeaderClass: 'bg-neutral-800 border-b-2 border-neutral-900 text-white font-semibold text-[10.5px]',
        tableBorderClass: 'border-2 border-neutral-700 rounded-lg overflow-hidden shadow-xs',
        rowHoverClass: 'hover:bg-neutral-100',
        accentColor: 'text-[#CC0000]',
        badgeBg: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
        artNoHeader: 'Würth Art.-Nr.',
        showEan: true,
        docBadge: 'Würth Industrial Partner Order',
        posPrefix: 'W-',
      };
    }
    if (comp.includes('obi') || file.includes('obi')) {
      return {
        id: 'obi',
        name: 'OBI',
        logoRender: (
          <div className="inline-block bg-[#F26522] text-black font-black text-2xl px-2.5 py-0.5 tracking-wider border-2 border-black rounded-xs shadow-2xs">
            OBI
          </div>
        ),
        companyName: po.buyer.companyName || 'OBI Group Holding SE & Co. KGaA',
        street: 'Albert-Einstein-Str. 7-9',
        city: '42929 Wermelskirchen',
        country: 'Deutschland',
        orderTitle: 'Bestellung',
        orderSubtitle: 'EDIFACT ORDERS Digital Document',
        tableHeaderClass: 'bg-[#FFF4ED] border-b-2 border-[#F26522] text-gray-900 font-bold text-[10.5px]',
        tableBorderClass: 'border-2 border-[#F26522]/40 rounded-lg overflow-hidden shadow-xs',
        rowHoverClass: 'hover:bg-orange-50/50',
        accentColor: 'text-[#F26522]',
        badgeBg: 'bg-[#FFF4ED] text-[#C4320A] border border-[#FECDCA]',
        artNoHeader: 'OBI Art.-Nr.',
        showEan: true,
        docBadge: 'OBI Group Central Procurement',
        posPrefix: 'OBI-',
      };
    }
    return {
      id: 'default',
      name: po.buyer.companyName || 'Handelspartner',
      logoRender: (
        <div className="inline-block bg-[#262626] text-white font-bold text-base px-2.5 py-0.5 tracking-wide rounded-xs shadow-2xs">
          {(po.buyer.companyName || 'PURCHASE ORDER').substring(0, 16)}
        </div>
      ),
      companyName: po.buyer.companyName || 'Kundenunternehmen GmbH',
      street: po.buyer.billingAddress?.street || 'Hauptstraße 1',
      city: `${po.buyer.billingAddress?.postalCode || '1010'} ${po.buyer.billingAddress?.city || 'Wien'}`,
      country: po.buyer.billingAddress?.country || 'Österreich',
      orderTitle: 'Bestellung',
      orderSubtitle: 'Standard Trade Partner Purchase Order',
      tableHeaderClass: 'bg-gray-100 border-b-2 border-gray-400 text-gray-800 font-semibold text-[10.5px]',
      tableBorderClass: 'border border-gray-300 rounded-lg overflow-hidden shadow-xs',
      rowHoverClass: 'hover:bg-gray-50',
      accentColor: 'text-gray-900',
      badgeBg: 'bg-gray-100 text-gray-800 border border-gray-200',
      artNoHeader: 'Artikelnummer',
      showEan: true,
      docBadge: 'Commercial Purchase Order',
      posPrefix: 'POS-',
    };
  }, [po.buyer.companyName, po.buyer.recipientName, po.sourceFileName, po.buyer.billingAddress]);

  // XML Copy State
  const [hasCopiedXml, setHasCopiedXml] = useState<boolean>(false);

  // Modals State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [customerCountryFilter, setCustomerCountryFilter] = useState<string>('All');

  const [resolvingLineItemId, setResolvingLineItemId] = useState<string | null>(null);
  const [resolveSearchTerm, setResolveSearchTerm] = useState<string>('');
  const [resolveCategoryFilter, setResolveCategoryFilter] = useState<string>('All');

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [addItemSearchTerm, setAddItemSearchTerm] = useState<string>('');
  const [selectedArticleForAdd, setSelectedArticleForAdd] = useState<ArticleMasterRecord | null>(null);
  const [addItemQuantity, setAddItemQuantity] = useState<number>(100);
  const [addItemUnitPrice, setAddItemUnitPrice] = useState<number>(0);
  const [addItemUnit, setAddItemUnit] = useState<string>('PA');
  const [addItemPos, setAddItemPos] = useState<number>(po.lineItems.length + 1);

  // Line items filter & search in Extracted tab
  const [lineItemSearch, setLineItemSearch] = useState<string>('');
  const [lineItemFilter, setLineItemFilter] = useState<'all' | 'unmapped' | 'valid'>('all');

  // Additional Details State
  const [additionalDetailsText, setAdditionalDetailsText] = useState<string>(() => {
    if (po.order.customerNotes && po.order.customerNotes.includes('[')) {
      return po.order.customerNotes;
    }
    const sections: string[] = [];
    sections.push('[Delivery Terms & Instructions]');
    if (po.order.incoterms) sections.push(`Incoterms: ${po.order.incoterms}`);
    if (po.order.paymentTerms) sections.push(`Payment Terms: ${po.order.paymentTerms}`);
    sections.push('\n[Customer Representative]');
    if (po.buyer.contactPerson) sections.push(`Contact Person: ${po.buyer.contactPerson}`);
    if (po.buyer.email) sections.push(`Email: ${po.buyer.email}`);
    if (po.buyer.phone) sections.push(`Phone: ${po.buyer.phone}`);
    return sections.join('\n');
  });

  // Invalid Fields Tracker for enter-key input validation
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  const handleValidateOnEnter = (
    fieldKey: string,
    value: string | number,
    type: 'required' | 'positiveNumber' | 'articleNumber',
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      let isInvalid = false;
      let errorMsg = '';

      if (type === 'required' && (!value || String(value).trim() === '')) {
        isInvalid = true;
        errorMsg = 'This field cannot be empty.';
      } else if (type === 'positiveNumber' && (isNaN(Number(value)) || Number(value) <= 0)) {
        isInvalid = true;
        errorMsg = 'Value must be a positive number greater than 0.';
      } else if (type === 'articleNumber') {
        const str = String(value).trim();
        const exists = INITIAL_ARTICLES_DATASET.some(
          a => a.articleId.toLowerCase() === str.toLowerCase() || a.ean === str
        );
        if (!str || !exists) {
          isInvalid = true;
          errorMsg = `Article "${str}" not recognized in GEBOL catalog.`;
        }
      }

      setInvalidFields(prev => ({ ...prev, [fieldKey]: isInvalid }));

      if (isInvalid) {
        toast.error('Validation Error', errorMsg);
      } else {
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  // Calculation & Validation
  const poNumber = (po.order.poNumber || po.id).replace(/^#/, '');
  const orderNetTotal = po.lineItems.reduce(
    (sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)),
    0
  ) || po.order.orderTotalAmount || 0;

  const unmappedLineCount = po.lineItems.filter(
    (item) => !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo
  ).length;

  const generatedXmlString = useMemo(() => {
    return generateGebolErpXml(po);
  }, [po]);

  // Active validation issues
  const activeIssues = useMemo(() => {
    const issues: Array<{ id: string; title: string; description: string; severity: 'error' | 'warning'; lineItemId?: string }> = [];

    if (!po.buyer.customerNumber || po.buyer.customerNumber === 'UNKNOWN' || po.buyer.customerNumber === '100000') {
      issues.push({
        id: 'cust-unknown',
        title: 'Customer Link Incomplete',
        description: 'Customer master GP-Nr needs confirmation.',
        severity: 'error',
      });
    }

    if (!po.order.poNumber || po.order.poNumber.trim() === '') {
      issues.push({
        id: 'po-missing',
        title: 'Missing PO Number',
        description: 'Purchase Order number cannot be empty.',
        severity: 'error',
      });
    }

    po.lineItems.forEach((item, idx) => {
      if (!item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo) {
        issues.push({
          id: `unmapped-${item.id}`,
          title: `Unmapped Article at Pos #${item.positionNumber || idx + 1}`,
          description: `Item "${item.description}" (${item.customerArticleNo || 'No ArtNr'}) is not matched to GEBOL master catalog.`,
          severity: 'error',
          lineItemId: item.id,
        });
      }
    });

    if (po.validationResults?.ruleResults) {
      po.validationResults.ruleResults.forEach((rule) => {
        if (!rule.passed && !issues.some(i => i.title.toLowerCase().includes(rule.ruleName.toLowerCase()))) {
          issues.push({
            id: `rule-${rule.ruleId}`,
            title: rule.ruleName,
            description: rule.message,
            severity: (rule.severity as 'error' | 'warning') || 'warning',
          });
        }
      });
    }

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

  // Handler: Copy XML
  const handleCopyXml = () => {
    navigator.clipboard.writeText(generatedXmlString);
    setHasCopiedXml(true);
    toast.success('XML Copied', 'ERP XML copied to clipboard.');
    setTimeout(() => setHasCopiedXml(false), 2500);
  };

  // Handler: Download XML
  const handleDownloadXml = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedXmlString], { type: 'application/xml' });
    element.href = URL.createObjectURL(file);
    element.download = `EDI_${poNumber}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('XML Downloaded', `EDI_${poNumber}.xml downloaded.`);
  };

  // Handler: Download PDF
  const handleDownloadPdf = () => {
    const element = document.createElement('a');
    const file = new Blob([`Purchase Order Document for ${poNumber}`], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `PO_${poNumber}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('PDF Downloaded', `PO_${poNumber}.pdf downloaded.`);
  };

  // Handler: Generate XML
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
          details: `Order ${poNumber} processed and approved. Ready for ERP XML integration.`,
          category: 'StatusChange',
        },
        ...po.auditTrail,
      ],
    });
    setActiveTab('xml');
    toast.success('XML Generated Successfully', `PO ${poNumber} is now ready for ERP integration.`);
  };

  // Handler: Auto-Fix All Rules
  const handleAutoFixAll = () => {
    let fixCount = 0;
    const updatedLineItems = po.lineItems.map((item) => {
      if (!item.skuMatched || item.gebolArticleNo === 'UNMAPPED-ARTICLE' || item.gebolArticleNo === 'UNMAPPED-SKU' || !item.gebolArticleNo) {
        const found = INITIAL_ARTICLES_DATASET.find(
          (a) => a.ean === item.ean || a.articleId === item.customerArticleNo || a.description.toLowerCase() === item.description.toLowerCase()
        ) || INITIAL_ARTICLES_DATASET[0];

        if (found) {
          fixCount++;
          return {
            ...item,
            gebolArticleNo: found.articleId,
            description: found.description,
            unitPrice: item.unitPrice || 4.90,
            eanBarcode: found.ean,
            skuMatched: true,
          };
        }
      }
      return item;
    });

    const updatedPo: PurchaseOrderRecord = {
      ...po,
      lineItems: updatedLineItems,
      completenessScore: Math.min(100, po.completenessScore + 15),
      status: 'Ready for XML',
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'System Auto-Fix',
          action: 'Auto-Resolved Validation Issues',
          details: `Automatically resolved ${fixCount} item mapping and header validation issues.`,
          category: 'DataCorrection',
        },
        ...po.auditTrail,
      ],
    };

    onUpdatePo(updatedPo);
    toast.success('Auto-Fix Complete', `Resolved issues across order lines.`);
  };

  // Handler: Resolve Item
  const handleResolveArticleItem = (art: ArticleMasterRecord) => {
    if (!resolvingLineItemId) return;
    const updatedItems = po.lineItems.map((item) => {
      if (item.id === resolvingLineItemId) {
        return {
          ...item,
          gebolArticleNo: art.articleId,
          description: art.description,
          unitPrice: item.unitPrice || 4.90,
          eanBarcode: art.ean,
          skuMatched: true,
        };
      }
      return item;
    });

    onUpdatePo({
      ...po,
      lineItems: updatedItems,
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: po.uploadedBy || 'Lucas Platzer',
          action: 'Mapped Article SKU',
          details: `Manually linked article to GEBOL Art.Nr ${art.articleId} (${art.description}).`,
          category: 'Resolution',
        },
        ...po.auditTrail,
      ],
    });

    toast.success('Article Mapped', `Position mapped to ${art.articleId}.`);
    setResolvingLineItemId(null);
  };

  // Handler: Add Item Confirm
  const handleConfirmAddItem = () => {
    if (!selectedArticleForAdd) return;

    const unitPrice = addItemUnitPrice || 4.90;
    const lineTotal = addItemQuantity * unitPrice;

    const newItem: LineItem = {
      id: `li-new-${Date.now()}`,
      itemPos: addItemPos,
      customerArticleNo: selectedArticleForAdd.articleId,
      gebolArticleNo: selectedArticleForAdd.articleId,
      description: selectedArticleForAdd.description,
      quantity: addItemQuantity,
      unit: addItemUnit,
      unitPrice: unitPrice,
      contractPrice: unitPrice,
      taxRatePercentage: 20,
      lineTotal: lineTotal,
      skuMatched: true,
      priceVariance: false,
      eanBarcode: selectedArticleForAdd.ean,
    };

    const updatedLineItems = [...po.lineItems, newItem].sort((a, b) => (a.itemPos || 0) - (b.itemPos || 0));

    onUpdatePo({
      ...po,
      lineItems: updatedLineItems,
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: po.uploadedBy || 'Lucas Platzer',
          action: 'Added Line Item Position',
          details: `Added new line item pos #${addItemPos}: ${selectedArticleForAdd.articleId} (${selectedArticleForAdd.description}) x ${addItemQuantity}.`,
          category: 'DataCorrection',
        },
        ...po.auditTrail,
      ],
    });

    toast.success('Item Added', `Added ${selectedArticleForAdd.description} (Pos #${addItemPos}).`);
    setIsAddItemModalOpen(false);
    setSelectedArticleForAdd(null);
  };

  // Handler: Delete Line Item
  const handleDeleteLineItem = (itemId: string) => {
    const itemToDelete = po.lineItems.find((i) => i.id === itemId);
    const updatedLineItems = po.lineItems.filter((i) => i.id !== itemId);

    onUpdatePo({
      ...po,
      lineItems: updatedLineItems,
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: po.uploadedBy || 'Lucas Platzer',
          action: 'Deleted Line Item Position',
          details: `Removed position ${itemToDelete?.positionNumber || ''}: ${itemToDelete?.description || itemId}.`,
          category: 'DataCorrection',
        },
        ...po.auditTrail,
      ],
    });

    toast.info('Item Removed', 'Position removed from purchase order.');
  };

  // Handler: Customer selection
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
        currency: po.order.currency || 'EUR',
        incoterms: cust.incoterms || po.order.incoterms,
        paymentTerms: cust.paymentTerms || po.order.paymentTerms,
      },
      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: po.uploadedBy || 'Lucas Platzer',
          action: 'Customer Master Updated',
          details: `Selected customer master: ${cust.companyName} (${cust.gpNr}).`,
          category: 'DataCorrection',
        },
        ...po.auditTrail,
      ],
    });

    toast.success('Customer Selected', `Linked to ${cust.companyName} (${cust.gpNr}).`);
    setIsCustomerModalOpen(false);
  };

  // Section Header Renderer (Dark container-width background for Theme B)
  const renderSectionHeader = (title: string, rightElement?: React.ReactNode) => (
    <div className="bg-[#181B24] border-b border-[#2A2E3D] px-4 py-3 flex items-center justify-between">
      <span className="font-bold text-[17px] tracking-tight text-white">{title}</span>
      {rightElement}
    </div>
  );

  return (
    <div
      className="space-y-4 font-sans text-gray-900 pb-12"
      style={{ fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* 🔹 Top Header Bar (Shifted up with breadcrumbs removed) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0 pb-1">
        {/* Left: Back Arrow & Title + Status */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg cursor-pointer shadow-2xs transition-colors shrink-0"
              title="Return to Orders"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
          )}
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate">
              {po.buyer.companyName || 'Customer Order'} - PO {poNumber}
            </h1>
            {isXmlGenerated ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                XML Generated
              </span>
            ) : po.status === 'Ready for XML' || po.status === 'Ready For XML' ? (
              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-indigo-600" />
                Ready for XML
              </span>
            ) : (
              <span className="bg-[#FEF0C7] text-[#B54708] border border-[#FEDF89] text-xs font-semibold px-2.5 py-0.5 rounded">
                Needs Review
              </span>
            )}
          </div>
        </div>

        {/* Right: Hide/Show Original PDF Toggle & Generate XML */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowOriginalPdf(!showOriginalPdf)}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-3 py-1.5 rounded-lg text-xs border border-gray-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            {showOriginalPdf ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                <span>Hide original PDF</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                <span>Show original PDF</span>
              </>
            )}
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
            className={`font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
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

      {/* 🔹 Metadata Horizontal Strip */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 font-normal">Customer</div>
          <div className="text-sm font-bold text-gray-900 truncate" title={po.buyer.companyName}>
            {po.buyer.companyName}
          </div>
        </div>
        <div className="space-y-1 sm:pl-4">
          <div className="text-xs text-gray-500 font-normal">Customer No.</div>
          <div className="text-sm font-bold text-gray-900">{po.buyer.customerNumber || '109008'}</div>
        </div>
        <div className="space-y-1 sm:pl-4">
          <div className="text-xs text-gray-500 font-normal">Document Type</div>
          <div className="text-sm font-bold text-gray-900">{getSimpleDocType(po.documentType, po.sourceType)}</div>
        </div>
        <div className="space-y-1 sm:pl-4">
          <div className="text-xs text-gray-500 font-normal">Upload Date</div>
          <div className="text-sm font-bold text-gray-900">
            {formatDateOnly(po.receivedAt || po.createdAt, '.')}
          </div>
        </div>
        <div className="space-y-1 sm:pl-4">
          <div className="text-xs text-gray-500 font-normal">Uploaded By</div>
          <div className="text-sm font-bold text-gray-900">{po.uploadedBy || 'Lucas Platzer'}</div>
        </div>
        <div className="space-y-1 sm:pl-4">
          <div className="text-xs text-gray-500 font-normal">Status</div>
          <div>
            <span className="inline-block bg-[#FEF0C7] text-[#B54708] border border-[#FEDF89] text-xs font-semibold px-2.5 py-0.5 rounded">
              {isXmlGenerated ? 'XML Generated' : po.status === 'Needs Review' ? 'Needs Review' : po.status}
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 Horizontal Tabs (Only Document View & XML Output when generated) */}
      <div className="flex items-center gap-6 border-b border-gray-200 text-sm font-medium pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('document')}
          className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'document'
              ? 'border-b-2 border-[#F8B800] text-[#D99000] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Extracted Order Information</span>
        </button>

        {isXmlGenerated && (
          <button
            type="button"
            onClick={() => setActiveTab('xml')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'xml'
                ? 'border-b-2 border-[#F8B800] text-[#D99000] font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${activeTab === 'xml' ? 'text-[#D99000]' : 'text-gray-400'}`} />
            <span>XML Output</span>
          </button>
        )}
      </div>

      {/* 🔹 Tab 1: Document View */}
      {activeTab === 'document' && (
        <div className={`grid grid-cols-1 ${showOriginalPdf ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-5 items-start`}>
          {/* 📄 Left: PDF Viewer (Can be toggled via 'Hide original PDF') */}
          {showOriginalPdf && (
            <div className="lg:col-span-5 lg:sticky lg:top-4 self-start space-y-4">
              <div data-pdf-view="true" className="original-pdf-viewer bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
                {/* Red Title Bar with File name & Close button */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-800 bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-mono text-gray-800 truncate font-semibold">
                      PO_{poNumber}.pdf
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOriginalPdf(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 rounded hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* PDF Viewer Toolbar */}
                <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDocPage(Math.max(1, currentDocPage - 1))}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs px-1 text-gray-700">
                      {currentDocPage} / {totalDocPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocPage(Math.min(totalDocPages, currentDocPage + 1))}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-medium text-gray-700">{docZoom}%</span>
                    <button
                      type="button"
                      onClick={() => setDocZoom(Math.max(50, docZoom - 10))}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocZoom(Math.min(200, docZoom + 10))}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Authentic Purchase Order Document Canvas (Identical to Theme A) */}
                <div className="p-3 bg-gray-100/70 overflow-auto max-h-[640px] flex justify-center">
                  <div
                    style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                    className="pdf-document-page bg-white border border-gray-300 shadow-md p-4 sm:p-5 rounded text-[10px] text-gray-800 w-full max-w-[500px] min-h-[580px] font-sans transition-transform overflow-hidden box-border"
                  >
                    {/* Header Zone: Buyer & Order Header */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-3 gap-2">
                      <div className="flex-1 pr-1 min-w-0">
                        <div className="font-bold text-xs uppercase rounded p-0.5 transition-colors truncate hover:bg-gray-100">
                          {po.buyer.companyName || 'Kunde'}
                        </div>
                        <div className="text-[8.5px] text-gray-500 mt-0.5 leading-tight">
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
                          <div className="text-[8px] font-mono text-gray-500 mt-0.5 rounded p-0.5 truncate hover:bg-gray-100">
                            USt-IdNr: <span className="font-semibold text-gray-800">{po.buyer.vatId}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-xs text-gray-900">BESTELLUNG</div>
                        <div className="font-mono text-[11px] font-bold rounded p-0.5 transition-colors hover:bg-gray-100">
                          Nr. {(po.order.poNumber || po.id).replace(/^#/, '')}
                        </div>
                        <div className="text-[8.5px] text-gray-500 mt-0.5 rounded p-0.5 transition-colors hover:bg-gray-100">
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
                        <div className="font-semibold text-gray-900 rounded p-0.5 transition-colors truncate hover:bg-gray-100">
                          {po.delivery.recipientName || po.delivery.deliveryLocation || po.buyer.companyName}
                        </div>
                        <div className="rounded p-0.5 transition-colors text-gray-600 hover:bg-gray-100">
                          <div className="truncate">{po.delivery.deliveryAddress?.street || po.delivery.deliveryLocation || 'Lieferanschrift'}</div>
                          <div className="truncate">
                            {po.delivery.deliveryAddress?.postalCode} {po.delivery.deliveryAddress?.city}
                            {po.delivery.deliveryAddress?.country ? `, ${po.delivery.deliveryAddress?.country}` : ''}
                          </div>
                        </div>
                        <div className="mt-0.5 font-mono rounded p-0.5 transition-colors truncate hover:bg-gray-100">
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
                        <div className="mt-1 inline-block text-[7.5px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 max-w-full truncate">
                          CLV: <span className="underline font-bold">{po.buyer.gln || po.buyer.customerNumber || '109008'}</span>
                        </div>
                        {po.buyer.customerNumber && (
                          <div className="mt-0.5 text-[7.5px] text-gray-600 rounded p-0.5 truncate hover:bg-gray-100">
                            Kd-Nr: <span className="font-mono font-medium text-gray-900">{po.buyer.customerNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Items Table: STRICTLY CONTAINED AND IDENTICAL TO THEME A */}
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
                                className={`transition-colors ${
                                  isUnmapped ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'
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
                            <div className="text-gray-600 font-medium rounded p-0.5 truncate hover:bg-gray-100">
                              Zahlungsbedingungen: <span className="font-mono text-gray-800 font-normal">{po.order.paymentTerms || '30 Tage Netto'}</span>
                            </div>
                            <div className="text-gray-600 font-medium rounded p-0.5 truncate hover:bg-gray-100">
                              Lieferbedingungen: <span className="font-mono text-gray-800 font-normal">{po.order.incoterms || 'DDP'}</span>
                            </div>
                          </div>
                          <div className="text-right space-y-0.5 shrink-0">
                            <div className="text-gray-600">
                              Nettowert: <span className="font-mono font-medium text-gray-900">€ {netSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="text-gray-600">
                              MwSt ({(vatRate * 100).toFixed(0)}%): <span className="font-mono font-medium text-gray-900">€ {vatAmount.toFixed(2)}</span>
                            </div>
                            <div className="font-bold text-gray-900 border-t border-gray-200 pt-0.5">
                              Gesamt: <span className="font-mono text-gray-900">€ {grossTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📋 Right: Extracted Order Information & Items Table */}
          <div className={`${showOriginalPdf ? 'lg:col-span-7' : 'w-full'} space-y-4`}>
            {/* Section: Extracted Order Information */}
            <div className="space-y-3">
              {/* 4 Cards in 2x2 Grid (All fields in input boxes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Customer Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Customer Information</span>
                    </div>
                    {/* 🔹 "Customer Lookup" Button moved to Customer Information section */}
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-2 py-1 rounded text-[11px] border border-gray-300 flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Building2 className="w-3 h-3 text-blue-600" />
                      <span>Customer Lookup</span>
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        Customer Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={po.buyer.companyName || ''}
                        onChange={(e) => onUpdatePo({ ...po, buyer: { ...po.buyer, companyName: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        GP Nr. (Customer Account) <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={po.buyer.customerNumber || '109008'}
                        onChange={(e) => onUpdatePo({ ...po, buyer: { ...po.buyer, customerNumber: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        Customer GLN / ILN <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={po.buyer.gln || '4005371000006'}
                          onChange={(e) => onUpdatePo({ ...po, buyer: { ...po.buyer, gln: e.target.value } })}
                          className="w-full pl-2.5 pr-20 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white font-mono"
                        />
                        <span className="absolute right-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          Matched
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Order Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-900">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span>Order Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        Purchase Order No./ Bestellnummer <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={(e) => onUpdatePo({ ...po, order: { ...po.order, poNumber: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Order Date</label>
                      <input
                        type="text"
                        value={formatDateToDDMMYYYY(po.order.poDate) || '08/09/2026'}
                        onChange={(e) => onUpdatePo({ ...po, order: { ...po.order, poDate: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Document Type</label>
                      <select
                        value={getSimpleDocType(po.documentType, po.sourceType)}
                        onChange={(e) => onUpdatePo({ ...po, documentType: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white cursor-pointer"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Excel">Excel</option>
                        <option value="XML">XML</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Currency</label>
                      <input
                        type="text"
                        value={po.order.currency || 'EUR'}
                        onChange={(e) => onUpdatePo({ ...po, order: { ...po.order, currency: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Incoterms</label>
                      <input
                        type="text"
                        value={po.order.incoterms || 'DAP'}
                        onChange={(e) => onUpdatePo({ ...po, order: { ...po.order, incoterms: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        Requested Delivery Date <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          ref={themeBDateInputRef}
                          type="date"
                          value={
                            po.delivery.requestedDeliveryDate
                              ? (po.delivery.requestedDeliveryDate.includes('-') && po.delivery.requestedDeliveryDate.split('-')[0].length === 4
                                  ? po.delivery.requestedDeliveryDate
                                  : (po.delivery.requestedDeliveryDate.includes('.') ? po.delivery.requestedDeliveryDate.split('.').reverse().join('-') : ''))
                              : (po.order.requestedDeliveryDate && po.order.requestedDeliveryDate.includes('-') && po.order.requestedDeliveryDate.split('-')[0].length === 4
                                  ? po.order.requestedDeliveryDate
                                  : (po.order.requestedDeliveryDate && po.order.requestedDeliveryDate.includes('.') ? po.order.requestedDeliveryDate.split('.').reverse().join('-') : ''))
                          }
                          onChange={(e) => {
                            const newDate = e.target.value;
                            onUpdatePo({
                              ...po,
                              order: { ...po.order, requestedDeliveryDate: newDate },
                              delivery: { ...po.delivery, requestedDeliveryDate: newDate },
                            });
                          }}
                          className="w-full pl-2.5 pr-8 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            try {
                              themeBDateInputRef.current?.showPicker();
                            } catch {
                              themeBDateInputRef.current?.focus();
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F8B800] hover:text-[#d49b00] cursor-pointer p-0.5"
                          title="Select date"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Payment Terms</label>
                      <input
                        type="text"
                        value={po.order.paymentTerms || '30 days net'}
                        onChange={(e) => onUpdatePo({ ...po, order: { ...po.order, paymentTerms: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Delivery Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-900">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span>Delivery Information</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        Delivery Location / Site <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={po.delivery.deliveryLocation || po.delivery.recipientName || 'FH Oschersleben'}
                        onChange={(e) => onUpdatePo({
                          ...po,
                          delivery: { ...po.delivery, deliveryLocation: e.target.value, recipientName: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Delivery GLN</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={po.delivery.deliveryGln || '4005371001234'}
                          onChange={(e) => onUpdatePo({
                            ...po,
                            delivery: { ...po.delivery, deliveryGln: e.target.value }
                          })}
                          className="w-full pl-2.5 pr-20 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white font-mono"
                        />
                        <span className="absolute right-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          Matched
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">
                        Delivery Address <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={`${po.delivery.deliveryAddress?.street || 'Am Güterbahnhof 1'}, ${po.delivery.deliveryAddress?.postalCode || '39387'} ${po.delivery.deliveryAddress?.city || 'Oschersleben'}, ${po.delivery.deliveryAddress?.country || 'Germany'}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdatePo({
                            ...po,
                            delivery: {
                              ...po.delivery,
                              deliveryAddress: {
                                ...(po.delivery.deliveryAddress || {}),
                                street: val,
                              }
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[11px] font-normal mb-1">Delivery Recipient</label>
                      <input
                        type="text"
                        value={po.delivery.recipientName || ''}
                        onChange={(e) => onUpdatePo({ ...po, delivery: { ...po.delivery, recipientName: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-900 font-medium focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Additional Information Card (Big text area with content in it) */}
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-2.5 flex flex-col">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-900">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span>Additional Information</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-gray-500 text-[11px] font-normal mb-1">Notes & Order Details</label>
                    <textarea
                      rows={6}
                      value={additionalDetailsText}
                      onChange={(e) => {
                        setAdditionalDetailsText(e.target.value);
                        onUpdatePo({
                          ...po,
                          order: { ...po.order, customerNotes: e.target.value }
                        });
                      }}
                      className="w-full flex-1 px-2.5 py-2 rounded-lg text-xs border border-gray-300 text-gray-900 font-normal focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] bg-white resize-y font-mono leading-relaxed min-h-[140px]"
                      placeholder="Reference notes, contacts, and delivery terms..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Order Items */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Order Items ({po.lineItems.length})</h2>
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-2.5 py-1 rounded-lg text-xs border border-gray-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Order Items Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Article No.</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Price (EUR)</th>
                      <th className="py-2.5 px-3 text-right">Total (EUR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {po.lineItems.map((item, idx) => {
                      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-gray-900">
                            {item.customerArticleNo || item.gebolArticleNo || '340102'}
                          </td>
                          <td className="py-3 px-3 text-gray-800 font-medium">
                            {item.description}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 text-center font-medium text-gray-600">
                            {item.unit || 'PA'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-gray-900">
                            {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                            {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 XML Output Tab (Only visible when Order status is 'XML Generated'; contains 1 codeblock with final XML) */}
      {activeTab === 'xml' && isXmlGenerated && (
        <div className="space-y-4">
          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800 shadow-sm">
            <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between border-b border-gray-700 text-xs text-gray-300">
              <span className="font-mono font-medium">EDI_{poNumber}.xml</span>
              <button
                type="button"
                onClick={handleCopyXml}
                className="hover:text-white text-gray-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {hasCopiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedXml ? 'Copied' : 'Copy XML'}</span>
              </button>
            </div>
            <div className="p-4 text-emerald-400 font-mono text-xs overflow-x-auto select-text">
              <pre className="leading-relaxed whitespace-pre font-mono">{generatedXmlString}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔹 MODALS: CUSTOMER LOOKUP, RESOLVE UNMAPPED ITEM, ADD ITEM POSITION      */}
      {/* ========================================================================= */}

      {/* 1. Article Master Lookup Modal (Resolve Item) */}
      {resolvingLineItemId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                Assign GEBOL Article
              </h3>
              <button
                type="button"
                onClick={() => setResolvingLineItemId(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search articles by ID, description, or EAN..."
                  value={resolveSearchTerm}
                  onChange={(e) => setResolveSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-2">Article No.</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">EAN</th>
                    <th className="p-2 text-right">Price (€)</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {INITIAL_ARTICLES_DATASET
                    .filter((art) => {
                      const term = resolveSearchTerm.toLowerCase();
                      return !term || art.articleId.toLowerCase().includes(term) || art.description.toLowerCase().includes(term) || art.ean.includes(term);
                    })
                    .map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50">
                        <td className="p-2 font-mono font-bold text-gray-900">{art.articleId}</td>
                        <td className="p-2 text-gray-800">{art.description}</td>
                        <td className="p-2 font-mono text-gray-600">{art.ean}</td>
                        <td className="p-2 text-right font-mono">4.90</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleResolveArticleItem(art)}
                            className="bg-gray-900 hover:bg-black text-[#F8B800] font-bold px-3 py-1 rounded text-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Select</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setResolvingLineItemId(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Customer Master Catalog Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                Customer Master Catalog
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customers by Name, GP-Nr, City, Country, or GLN..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-2">GP-Nr</th>
                    <th className="p-2">Company Name</th>
                    <th className="p-2">City</th>
                    <th className="p-2">Country</th>
                    <th className="p-2">GLN</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {INITIAL_CUSTOMERS
                    .filter((c) => {
                      const term = customerSearchTerm.toLowerCase();
                      return !term || c.gpNr.toLowerCase().includes(term) || c.companyName.toLowerCase().includes(term) || c.city.toLowerCase().includes(term) || c.country.toLowerCase().includes(term);
                    })
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-2 font-mono font-bold text-gray-900">{c.gpNr}</td>
                        <td className="p-2 font-semibold text-gray-800">{c.companyName}</td>
                        <td className="p-2 text-gray-700">{c.city}</td>
                        <td className="p-2 text-gray-700">{c.country}</td>
                        <td className="p-2 font-mono text-gray-600">{c.gln}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectCustomer(c)}
                            className="bg-gray-900 hover:bg-black text-[#F8B800] font-bold px-3 py-1 rounded text-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Select</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Item Position Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-gray-200 bg-white">
              <h3 className="font-bold text-[17px] text-[#4f4f4e]">
                Add Item Position
              </h3>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search GEBOL article master catalog..."
                  value={addItemSearchTerm}
                  onChange={(e) => setAddItemSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-2">Article No.</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">EAN</th>
                    <th className="p-2 text-right">Price (€)</th>
                    <th className="p-2 text-center">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {INITIAL_ARTICLES_DATASET
                    .filter((art) => {
                      const term = addItemSearchTerm.toLowerCase();
                      return !term || art.articleId.toLowerCase().includes(term) || art.description.toLowerCase().includes(term) || art.ean.includes(term);
                    })
                    .map((art) => (
                      <tr
                        key={art.id}
                        onClick={() => {
                          setSelectedArticleForAdd(art);
                          setAddItemUnitPrice(4.90);
                        }}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedArticleForAdd?.id === art.id ? 'bg-[#F8B800]/15' : ''
                        }`}
                      >
                        <td className="p-2 font-mono font-bold text-gray-900">{art.articleId}</td>
                        <td className="p-2 text-gray-800">{art.description}</td>
                        <td className="p-2 font-mono text-gray-600">{art.ean}</td>
                        <td className="p-2 text-right font-mono">4.90</td>
                        <td className="p-2 text-center">
                          <input
                            type="radio"
                            checked={selectedArticleForAdd?.id === art.id}
                            onChange={() => {
                              setSelectedArticleForAdd(art);
                              setAddItemUnitPrice(4.90);
                            }}
                            className="text-[#F8B800] focus:ring-[#F8B800]"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Position & Quantity inputs */}
            {selectedArticleForAdd && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">Pos</label>
                  <input
                    type="number"
                    value={addItemPos}
                    onChange={(e) => setAddItemPos(parseInt(e.target.value) || 1)}
                    className="w-full p-1.5 border border-gray-300 rounded bg-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={addItemQuantity}
                    onChange={(e) => setAddItemQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full p-1.5 border border-gray-300 rounded bg-white text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={addItemUnit}
                    onChange={(e) => setAddItemUnit(e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded bg-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Unit Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addItemUnitPrice}
                    onChange={(e) => setAddItemUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 border border-gray-300 rounded bg-white text-right font-mono"
                  />
                </div>
              </div>
            )}

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedArticleForAdd}
                onClick={handleConfirmAddItem}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                  selectedArticleForAdd
                    ? 'bg-[#F8B800] hover:bg-[#e2a508] text-gray-900 cursor-pointer shadow-2xs'
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
