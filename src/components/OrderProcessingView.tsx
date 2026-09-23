import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRight,
  Trash2,
  Layers,
  Clock,
  Info,
} from 'lucide-react';
import { PurchaseOrderRecord } from '../types/po';

interface OrderProcessingViewProps {
  orders: PurchaseOrderRecord[];
  onOrderAdded: (newPo: PurchaseOrderRecord) => void;
  onOrdersAdded?: (newPos: PurchaseOrderRecord[]) => void;
  onUpdateOrder: (updatedPo: PurchaseOrderRecord) => void;
  onOpenXmlModal: (po: PurchaseOrderRecord) => void;
  onNavigateToOrders?: () => void;
}

export const OrderProcessingView: React.FC<OrderProcessingViewProps> = ({
  orders,
  onOrderAdded,
  onOrdersAdded,
  onNavigateToOrders,
}) => {
  const toast = useToast();
  const { isThemeB } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingCount = orders.filter((o) => o.status === 'Processing').length;

  const validateFile = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const supportedExts = ['.pdf', '.xls', '.xlsx', '.xml'];

    if (!supportedExts.includes(ext)) {
      return `Unsupported format: "${file.name}". Please upload PDF, Excel (.xls, .xlsx), or XML files.`;
    }
    if (file.size === 0 || fileName.includes('corrupt')) {
      return `Corrupted file: "${file.name}" appears to be empty or corrupted.`;
    }
    if (fileName.includes('protected') || fileName.includes('password') || fileName.includes('encrypted')) {
      return `Password-protected file: "${file.name}" is encrypted.`;
    }
    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        return;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Start batch processing and immediately navigate to Orders list
  const handleStartProcessing = () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select or drag & drop at least one purchase order document to process.');
      return;
    }

    setIsProcessingBatch(true);
    setErrorMessage(null);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newOrders: PurchaseOrderRecord[] = selectedFiles.map((file, index) => {
      const fname = file.name;
      const uniqueId = `PO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const poNumRandom = Math.floor(100000 + Math.random() * 900000);

      let sType: 'PDF' | 'Email' | 'EDI' | 'Scan' = 'PDF';
      if (fname.endsWith('.xml')) sType = 'EDI';

      let buyerName = 'BAUKING Ostfalen GmbH';
      let customerNumber = '148510';
      let gln = '109008';
      let vatId = 'DE296746712';
      let deliveryLocation = 'FH Oschersleben';
      let deliveryAddress = {
        street: 'Schermcker Str. 17',
        city: 'Oschersleben',
        postalCode: '39387',
        country: 'Germany',
      };

      if (fname.toUpperCase().includes('OBI')) {
        buyerName = 'OBI Group Holding GmbH';
        customerNumber = '104820';
        gln = '4012345000018';
        vatId = 'DE123456789';
        deliveryLocation = 'OBI Markt Wien-Nord';
        deliveryAddress = {
          street: 'Albert-Einstein-Str. 1',
          city: 'Wermelskirchen',
          postalCode: '42929',
          country: 'Germany',
        };
      } else if (fname.toUpperCase().includes('BAUHAUS')) {
        buyerName = 'Bauhaus AG';
        customerNumber = '119402';
        gln = '4004567000029';
        vatId = 'DE987654321';
        deliveryLocation = 'Bauhaus Zentrallager';
        deliveryAddress = {
          street: 'Guthofstraße 12',
          city: 'Mannheim',
          postalCode: '68167',
          country: 'Germany',
        };
      }

      const poNum = fname.includes('80635109') ? '80635109' : `PO-${poNumRandom}`;
      const UPLOAD_NAMES = ['Lucas Platzer', 'Matthias Rosenberger', 'Bhoomi Barot', 'Stefan Gruber', 'Florian Weber', 'Anna Huber'];
      const assignedUploadedBy = UPLOAD_NAMES[(index + Math.floor(Math.random() * 3)) % UPLOAD_NAMES.length];

      return {
        id: uniqueId,
        sourceType: sType,
        sourceFileName: fname,
        uploadedBy: assignedUploadedBy,
        receivedAt: nowStr,
        status: 'Processing' as const,
        extractionConfidence: 94,
        completenessScore: 88,
        buyer: {
          companyName: buyerName,
          customerNumber: customerNumber,
          gln: gln,
          vatId: vatId,
          contactPerson: 'Stefan Germer (03949 9452-44)',
          email: 'stefan.germer@bauking.de',
          phone: '03949 9452-44',
          billingAddress: {
            street: 'Magdeburger Berg 3',
            city: 'Helmstedt',
            postalCode: '38350',
            country: 'Germany',
          },
        },
        order: {
          poNumber: poNum,
          poDate: '2026-07-08',
          orderReference: '—',
          currency: 'EUR',
          paymentTerms: 'Lieferung durch Lieferant zum Lager',
          incoterms: 'DDP Oschersleben',
          customerNotes: 'Ges.-Nr. 148510, FH Oschersleben. Bitte buchen Sie ab 3 ldm Ihre verbindliche Anlieferzeit unter www.cargoclix.com/bauking',
        },
        delivery: {
          recipientName: deliveryLocation,
          deliveryLocation: deliveryLocation,
          deliveryAddress: deliveryAddress,
          requestedDeliveryDate: '2026-07-08',
          shippingMethod: 'Lieferant zum Lager',
          unloadingPoint: deliveryLocation,
        },
        lineItems: [
          {
            id: `li-bk-${index}-1`,
            itemPos: 10,
            eanBarcode: '9002701050446',
            customerArticleNo: '730504',
            gebolArticleNo: '004649',
            description: 'Schutzmaske FFP2 Comfort SB mit Ventil Gebol 2 St/Bli',
            quantity: 10,
            unit: 'Bli',
            unitPrice: 3.63,
            contractPrice: 3.63,
            taxRatePercentage: 19,
            lineTotal: 36.30,
            skuMatched: true,
            priceVariance: false,
          },
          {
            id: `li-bk-${index}-2`,
            itemPos: 20,
            eanBarcode: '9002701025789',
            customerArticleNo: '709534_10',
            gebolArticleNo: '009552',
            description: 'Handschuh Top Flex 80% Nylon 20% Elasthan Gebol 10',
            quantity: 12,
            unit: 'Paa',
            unitPrice: 1.67,
            contractPrice: 1.67,
            taxRatePercentage: 19,
            lineTotal: 20.04,
            skuMatched: true,
            priceVariance: false,
          },
          {
            id: `li-bk-${index}-3`,
            itemPos: 30,
            eanBarcode: '2400000030492',
            customerArticleNo: '91032',
            gebolArticleNo: 'UNMAPPED-ARTICLE',
            description: 'Logistikkosten des Lieferanten per St',
            quantity: 1,
            unit: 'St',
            unitPrice: 0.00,
            contractPrice: 0.00,
            taxRatePercentage: 19,
            lineTotal: 0.00,
            skuMatched: false,
            priceVariance: false,
          },
        ],
        validationRules: [
          {
            id: `vr-1`,
            code: 'VAL-01',
            category: 'Buyer',
            severity: 'info',
            passed: true,
            message: `Customer ${customerNumber} verified in GEBOL Master Account (${buyerName})`,
          },
          {
            id: `vr-2`,
            code: 'VAL-02',
            category: 'LineItems',
            severity: 'error',
            passed: false,
            message: 'Unmapped Customer Article "91032" (Logistikkosten) - Requires GEBOL Article No. mapping',
            autoFixAvailable: true,
          },
        ],
        auditTrail: [
          {
            id: `at-1`,
            timestamp: nowStr,
            user: 'System Ingestion AI',
            action: 'Document Uploaded',
            details: `Injected file "${fname}" and assigned status "Processing" in queue`,
            category: 'Extraction',
          },
        ],
      };
    });

    // Batch add to state and navigate to Orders queue immediately
    if (onOrdersAdded) {
      onOrdersAdded(newOrders);
    } else {
      newOrders.forEach((o) => onOrderAdded(o));
      if (onNavigateToOrders) onNavigateToOrders();
    }

    toast.success(
      'Orders Uploaded',
      `${newOrders.length} order(s) added for processing.`
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner - kept out in grey without white bg container, shifted to left */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1 py-1">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight page-header-title upload-order-header text-[#262626]">
            Upload Order
          </h2>
          <p className="text-[14px] mt-1 font-light text-gray-500">
            Upload purchase orders for automatic extraction, resolution, and validation.
          </p>
        </div>

        {processingCount > 0 && (
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors shadow-2xs"
            title="View processing orders in Orders listing"
          >
            <Clock className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>{processingCount} Order(s) Currently Processing</span>
          </button>
        )}
      </div>

      {/* Main Upload Box */}
      <div className="bg-white rounded-none border border-[#E0E0E0] shadow-2xs p-6 space-y-4">
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded text-xs text-red-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Small info text above dotted section */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
          <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Uploaded orders will appear in the Orders list for processing and review.</span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-none p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-[#F8B800] bg-amber-50/80 scale-[1.01]'
              : selectedFiles.length > 0
              ? 'border-emerald-500 bg-emerald-50/30'
              : 'border-gray-300 hover:border-[#F8B800] hover:bg-gray-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 text-[#F8B800] flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="font-bold text-sm text-[#262626]">
              Click to select or drag &amp; drop purchase order documents here
            </p>
            <p className="text-xs text-gray-500 font-light">
              Supports (PDF (.pdf) , XML (.xml), Excel (.xlsx))
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xml,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3 border-t border-[#E0E0E0] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#262626] flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-600" />
                <span>Documents ({selectedFiles.length}):</span>
              </span>
              
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-red-600 hover:text-red-700 font-semibold text-xs cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between p-2.5 bg-[#FAFAFA] border border-[#E0E0E0] hover:border-[#F8B800] hover:ring-2 hover:ring-[#F8B800] rounded-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[280px]">
                    {file.name.endsWith('.xml') ? (
                      <FileCode className="w-4 h-4 text-blue-600 group-hover:text-yellow-600 shrink-0 transition-colors" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-600 group-hover:text-yellow-600 shrink-0 transition-colors" />
                    )}
                    <div className="truncate">
                      <div className="font-mono text-xs font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono group-hover:text-yellow-600 transition-colors">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="text-gray-400 hover:text-red-600 p-1 rounded cursor-pointer transition-colors"
                    title="Remove file from stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#E0E0E0] flex items-center justify-end">
          <button
            onClick={handleStartProcessing}
            disabled={selectedFiles.length === 0 || isProcessingBatch}
            title="Upload and send to Orders processing queue"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#f7b611] hover:bg-[#e2a508] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
          >
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white">
              {selectedFiles.length > 0
                ? `Upload & Process ${selectedFiles.length} Order${selectedFiles.length > 1 ? 's' : ''}`
                : 'Upload & Process Orders'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
