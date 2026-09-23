import React, { useState } from 'react';
import { FileCode, Download, Copy, CheckCircle2, ChevronDown, ChevronUp, Code2, Server } from 'lucide-react';
import { PurchaseOrderRecord } from '../types/po';
import { generateGebolErpXml } from '../utils/xmlGenerator';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';

interface ErpOutputSectionProps {
  po: PurchaseOrderRecord;
  onOpenXmlModal: () => void;
}

export const ErpOutputSection: React.FC<ErpOutputSectionProps> = ({ po, onOpenXmlModal }) => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const xmlContent = generateGebolErpXml(po);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    toast.success('XML Copied', 'ERP XML copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customerOrderNo = po.order.poNumber || po.id;
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
    }
  };

  return (
    <div className="bg-white rounded-lg border border-emerald-300 shadow-2xs overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-emerald-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-emerald-950 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#F8B800] text-[#262626] p-2 rounded font-bold text-xs flex items-center gap-1.5 shadow-2xs">
            <FileCode className="w-4 h-4" />
            <span>ERP Output</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">
                GEBOL SAP S/4HANA ERP XML Integration Payload
              </h3>
              <span className="text-[10px] font-mono uppercase bg-emerald-800 text-emerald-200 border border-emerald-600 px-2 py-0.5 rounded font-bold">
                VALIDATED & READY
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 font-mono mt-0.5">
              Schema v4.2 • Target: Direct SAP RFC Gateway • PO #{po.order.poNumber || po.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenXmlModal();
            }}
            className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View XML</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Download XML</span>
          </button>

          <div className="text-emerald-300 pl-2">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Preview */}
      {isExpanded && (
        <div className="border-t border-emerald-200 bg-[#0F0F0F]">
          <div className="bg-[#1A1A1A] px-4 py-2 border-b border-[#333333] flex items-center justify-between text-xs text-gray-300 font-mono">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>EDI_{po.order.poNumber || po.id}.xml Preview (ISO-8859-1 XML)</span>
            </div>
            <button
              onClick={handleCopy}
              className="hover:text-white flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333333] px-2.5 py-1 rounded text-gray-200 transition-colors cursor-pointer font-sans text-[11px] font-semibold"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-64 leading-relaxed select-all">
            <pre>{xmlContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
