import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Copy,
  Download,
  CheckCircle2,
  FileCode,
  Check,
  Code2,
  AlertTriangle,
} from 'lucide-react';
import { PurchaseOrderRecord } from '../types/po';
import { generateGebolErpXml } from '../utils/xmlGenerator';

interface XmlOutputModalProps {
  po: PurchaseOrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onTransmissionSuccess?: (poId: string, transmissionId: string) => void;
}

export const XmlOutputModal: React.FC<XmlOutputModalProps> = ({
  po,
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !po) return null;

  const xmlContent = generateGebolErpXml(po);
  const rawPoNumber = po.order.poNumber || po.id;
  const poNumber = rawPoNumber.replace(/^#/, '');

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    toast.success('XML Copied', 'XML copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute Flags if any
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

  const handleDownloadXml = () => {
    const ediFilename = `EDI_${poNumber}.xml`;
    if (flags.length > 0) {
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

    const blob = new Blob([xmlContent], { type: 'text/xml;charset=iso-8859-1;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', ediFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (flags.length > 0) {
      toast.warning('XML Downloaded with Warnings', `${ediFilename} contains compliance flags. Logged XML generation failure alert.`);
    } else {
      toast.success('XML Downloaded', `${ediFilename} downloaded successfully.`);
    }
  };

  const { isThemeB } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isThemeB ? 'bg-black/70 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
      } flex items-center justify-center p-3 sm:p-6 font-sans`}
    >
      <div
        className={`${
          isThemeB
            ? 'bg-[#1A1A1A] text-white border-[#333333]'
            : 'bg-white text-gray-900 border-gray-200'
        } rounded-xl border shadow-2xl w-full max-w-5xl overflow-hidden my-auto h-[88vh] max-h-[88vh] flex flex-col`}
      >
        {/* 🔹 HEADER SECTION */}
        <div
          className={`${
            isThemeB
              ? 'bg-[#222222] border-[#333333]'
              : 'bg-gray-50 border-gray-200'
          } px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b shrink-0`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F8B800] text-[#1A1A1A] rounded-lg flex items-center justify-center font-extrabold shadow-xs shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-base sm:text-lg font-bold tracking-tight ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  EDI {poNumber}
                </h2>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isThemeB ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {po.buyer.companyName}
              </p>
            </div>
          </div>

          {/* Top Actions: Copy, Download, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyXml}
              title="Copy XML payload to clipboard"
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                isThemeB
                  ? 'bg-[#333333] hover:bg-[#444444] text-gray-200'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-400" />
                  <span>Copy XML</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadXml}
              title="Download GEBOL XML document"
              className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-white" />
              <span className="text-white">Download XML</span>
            </button>

            <button
              onClick={onClose}
              title="Close XML view"
              className={`p-2 rounded-lg cursor-pointer ml-1 transition-colors ${
                isThemeB
                  ? 'text-gray-400 hover:text-white hover:bg-[#333333]'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body - Single clean vertical scroll */}
        <div
          className={`p-5 overflow-y-auto flex-1 space-y-4 text-xs ${
            isThemeB
              ? 'text-gray-300 bg-[#141414]'
              : 'text-gray-700 bg-gray-50/50'
          }`}
        >
          {/* 🚩 FLAGS DISPLAY (ONLY IF FLAGS DETECTED) */}
          {flags.length > 0 && (
            <div
              className={`rounded-lg p-3.5 flex items-start gap-3 text-xs border ${
                isThemeB
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div
                  className={`font-bold flex items-center gap-2 ${
                    isThemeB ? 'text-amber-100' : 'text-amber-900'
                  }`}
                >
                  <span>Flags Detected ({flags.length})</span>
                  <span
                    className={`text-[11px] font-normal ${
                      isThemeB ? 'text-amber-300/80' : 'text-amber-700'
                    }`}
                  >
                    Review required before ERP transmission
                  </span>
                </div>
                <ul
                  className={`mt-1.5 list-disc list-inside space-y-0.5 text-[11px] ${
                    isThemeB ? 'text-amber-300/90' : 'text-amber-800'
                  }`}
                >
                  {flags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 🔹 XML CODE VIEWER */}
          <div
            className={`rounded-xl border overflow-hidden shadow-2xs ${
              isThemeB
                ? 'bg-[#1F1F1F] border-[#333333]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono ${
                isThemeB
                  ? 'bg-[#282828] border-[#333333] text-gray-300'
                  : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#F8B800]" />
                <span
                  className={`font-semibold ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  XML Source Code
                </span>
                <span
                  className={`text-[10px] font-sans ${
                    isThemeB ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  ({(xmlContent.length / 1024).toFixed(1)} KB)
                </span>
              </div>

              <button
                onClick={handleCopyXml}
                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                  isThemeB
                    ? 'hover:text-white text-gray-400'
                    : 'hover:text-gray-900 text-gray-500'
                }`}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div
              className={`p-4 font-mono text-xs overflow-x-auto leading-relaxed select-all ${
                isThemeB
                  ? 'bg-[#0D0D0D] text-amber-200/90'
                  : 'bg-[#F8F9FA] text-[#1E293B]'
              }`}
            >
              <pre className="whitespace-pre">{xmlContent}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
