import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, RefreshCw, FileCode, Trash2, Info } from 'lucide-react';
import { PurchaseOrderRecord } from '../types/po';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

interface POIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderAdded: (newOrder: PurchaseOrderRecord) => void;
  onOrdersAdded?: (newOrders: PurchaseOrderRecord[]) => void;
}

export const POIntakeModal: React.FC<POIntakeModalProps> = ({
  isOpen,
  onClose,
  onOrderAdded,
  onOrdersAdded,
}) => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state whenever opening or closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setErrorMessage('');
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf('.'));

    // 1. Format check
    const supportedExts = ['.pdf', '.xls', '.xlsx', '.xml'];
    if (!supportedExts.includes(ext)) {
      return `Unsupported format: "${file.name}" is not supported. Please upload PDF, Excel (.xls, .xlsx), or XML files.`;
    }

    // 2. Corrupted file check
    if (file.size === 0 || fileName.includes('corrupt')) {
      return `Corrupted file: "${file.name}" appears to be corrupted or unreadable.`;
    }

    // 3. Password-protected file check
    if (fileName.includes('protected') || fileName.includes('password') || fileName.includes('encrypted')) {
      return `Password-protected file: "${file.name}" is encrypted. Please remove password protection before uploading.`;
    }

    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    setErrorMessage('');
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        addNotification({
          scenario: 'processing_failure',
          title: 'Order document processing failed',
          message: `We were unable to process the uploaded order document (${file.name}). Please check the document format and retry processing.`,
          severity: 'error',
          relatedEntityId: file.name,
          relatedEntityType: 'intake',
          actionLabel: 'Retry Processing',
          actionNav: 'orders',
        });
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUploadSubmit = () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select or drop at least one purchase order document to upload.');
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    // Simulate batch ingestion
    setTimeout(() => {
      const createdOrders: PurchaseOrderRecord[] = selectedFiles.map((file, index) => {
        const uniqueId = `PO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const fname = file.name;
        
        let sType: 'PDF' | 'Email' | 'EDI' | 'Scan' = 'PDF';
        if (fname.endsWith('.xml')) sType = 'EDI';

        let buyerName = 'BAUKING Ostfalen GmbH';
        let customerNumber = '148510';
        let gln = '109008';
        let vatId = 'DE296746712';
        let deliveryLocation = 'FH Oschersleben';

        if (fname.toUpperCase().includes('OBI')) {
          buyerName = 'OBI Group Holding GmbH';
          customerNumber = '104820';
          gln = '4012345000018';
          vatId = 'DE123456789';
          deliveryLocation = 'OBI Markt Wien-Nord';
        } else if (fname.toUpperCase().includes('BAUHAUS')) {
          buyerName = 'Bauhaus AG';
          customerNumber = '119402';
          gln = '4004567000029';
          vatId = 'DE987654321';
          deliveryLocation = 'Bauhaus Zentrallager';
        }

        const poNum = fname.includes('80635109') ? '80635109' : `PO-${Math.floor(100000 + Math.random() * 900000)}`;

        return {
          id: uniqueId,
          sourceType: sType,
          sourceFileName: fname,
          uploadedBy: 'Bhoomi Barot',
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
            deliveryAddress: {
              street: 'Schermcker Str. 17',
              city: 'Oschersleben',
              postalCode: '39387',
              country: 'Germany',
            },
            requestedDeliveryDate: '2026-07-08',
            shippingMethod: 'Lieferant zum Lager',
            unloadingPoint: deliveryLocation,
          },
          lineItems: [
            {
              id: `li-up-${index}-1`,
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
              id: `li-up-${index}-2`,
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
              id: `li-up-${index}-3`,
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
              id: `vr-up-${index}-1`,
              code: 'VAL-01',
              category: 'Buyer',
              severity: 'info',
              passed: true,
              message: `Customer ${customerNumber} verified in GEBOL Master Account (${buyerName})`,
            },
            {
              id: `vr-up-${index}-2`,
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
              id: `at-up-${index}-1`,
              timestamp: nowStr,
              user: 'Bhoomi Barot',
              action: 'Document Upload (Batch)',
              details: `Uploaded ${fname} to processing queue.`,
              category: 'Extraction',
            },
          ],
        };
      });

      if (onOrdersAdded) {
        onOrdersAdded(createdOrders);
      } else {
        createdOrders.forEach((o) => onOrderAdded(o));
      }

      // Trigger scenario notifications based on ingested orders
      createdOrders.forEach((o) => {
        if (o.extractionConfidence < 95) {
          addNotification({
            scenario: 'manual_review_required',
            title: `Manual review required: ${o.id}`,
            message: `2 of the line items could not be mapped to existing articles. Manual review is required before releasing this order.`,
            severity: 'warning',
            relatedEntityId: o.id,
            relatedEntityType: 'order',
            actionLabel: 'Review',
            actionNav: 'orders',
            actionPoId: o.id,
          });
        }
      });

      setIsUploading(false);
      onClose();
      toast.success(
        'Upload Successful',
        `${selectedFiles.length} purchase order(s) added for processing.`
      );
    }, 600);
  };

  const { isThemeB } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
      } flex items-center justify-center p-4 overflow-y-auto`}
    >
      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-xl overflow-hidden my-8">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isThemeB
              ? 'bg-[#262626] text-white border-[#383838]'
              : 'bg-gray-50 text-gray-900 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#F8B800]" />
            <h3
              className={`text-base font-bold tracking-tight ${
                isThemeB ? 'text-white' : 'text-gray-900'
              }`}
            >
              Upload Order
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`p-1 rounded cursor-pointer transition-colors ${
              isThemeB
                ? 'text-gray-400 hover:text-white hover:bg-[#333333]'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Small info text above dotted section */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Uploaded orders will appear in the Orders list for processing and review.</span>
          </div>

          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-[#F8B800] bg-amber-50/50'
                : 'border-[#E0E0E0] hover:border-[#F8B800] bg-[#FAFAFA]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-[#F8B800] mx-auto mb-2" />
            <span className="text-xs font-bold text-[#262626] block">
              Drag & Drop Purchase Orders here or click to browse
            </span>
            <p className="text-[11px] text-gray-500 mt-1 font-light">
              Supports multiple files (PDF, XML, Excel .xlsx)
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 border-t border-[#E0E0E0] pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A1A1A]">
                  Documents ({selectedFiles.length}):
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between text-xs bg-amber-50/60 border border-amber-200/80 hover:border-[#F8B800] hover:ring-2 hover:ring-[#F8B800] px-3 py-1.5 rounded transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[340px]">
                      {file.name.endsWith('.xml') ? (
                        <FileCode className="w-4 h-4 text-blue-600 group-hover:text-yellow-600 shrink-0 transition-colors" />
                      ) : (
                        <FileText className="w-4 h-4 text-amber-700 group-hover:text-yellow-600 shrink-0 transition-colors" />
                      )}
                      <span className="truncate text-[#1A1A1A] font-medium font-mono text-[11px] group-hover:text-yellow-600 transition-colors">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-500 text-[10px] font-mono group-hover:text-yellow-600 transition-colors">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                        className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#D32F2F] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Uploading Progress */}
          {isUploading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Adding {selectedFiles.length} order(s) to processing queue...</span>
            </div>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="bg-[#F5F5F5] px-6 py-4 border-t border-[#E0E0E0] flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 border border-[#E0E0E0] text-gray-700 hover:bg-gray-200 rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={isUploading || selectedFiles.length === 0}
            className="bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold px-5 py-2 rounded text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white">Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
