import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Check } from 'lucide-react';
import { ValidationRuleResult, PurchaseOrderRecord } from '../types/po';

interface ValidationPanelProps {
  po: PurchaseOrderRecord;
  onAutoFixRules: () => void;
  onMarkReady: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  po,
  onAutoFixRules,
  onMarkReady,
}) => {
  const errors = po.validationRules.filter((r) => r.severity === 'error' && !r.passed);
  const warnings = po.validationRules.filter((r) => r.severity === 'warning' && !r.passed);
  const errorCount = errors.length;
  const warningCount = warnings.length;
  const hasErrors = errorCount > 0;
  const hasWarnings = warningCount > 0;

  return (
    <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white px-4 py-3 flex items-center justify-between border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#F8B800]" />
          <h3 className="font-bold text-xs uppercase tracking-wider">
            System Rules & Business Validation Scorecard
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-gray-300">
            Completeness:
          </span>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              po.completenessScore === 100
                ? 'bg-[#2E7D32] text-white'
                : 'bg-[#ED6C02] text-white'
            }`}
          >
            {po.completenessScore}%
          </span>
        </div>
      </div>

      {/* Validation Summary Bar */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAFAFA] border-b border-[#E0E0E0]">
        <div className="bg-white p-2.5 rounded border border-[#E0E0E0] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Completeness</div>
          <div className="text-base font-extrabold font-mono text-[#1A1A1A] flex items-center justify-between">
            <span>{po.completenessScore}%</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                po.completenessScore === 100 ? 'bg-emerald-100 text-[#2E7D32]' : 'bg-amber-100 text-[#ED6C02]'
              }`}
            >
              {po.completenessScore === 100 ? 'Complete' : 'Incomplete'}
            </span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded border border-[#E0E0E0] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Errors</div>
          <div className="text-base font-extrabold font-mono flex items-center justify-between">
            <span className={errorCount > 0 ? 'text-[#D32F2F]' : 'text-gray-700'}>{errorCount}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                errorCount > 0 ? 'bg-red-100 text-[#D32F2F]' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {errorCount > 0 ? 'Action Needed' : 'Zero Errors'}
            </span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded border border-[#E0E0E0] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Warnings</div>
          <div className="text-base font-extrabold font-mono flex items-center justify-between">
            <span className={warningCount > 0 ? 'text-[#ED6C02]' : 'text-gray-700'}>{warningCount}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                warningCount > 0 ? 'bg-amber-100 text-[#ED6C02]' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {warningCount > 0 ? 'Review' : 'Zero Warnings'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Overall Status Banner */}
        {hasErrors ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between gap-3 text-[#D32F2F]">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Action Required: Outstanding Validation Errors detected before ERP export.</span>
            </div>
            <button
              onClick={onAutoFixRules}
              className="bg-[#D32F2F] text-white hover:bg-red-800 font-bold px-3 py-1 rounded text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Resolve Missing Fields</span>
            </button>
          </div>
        ) : hasWarnings ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-center justify-between gap-3 text-[#ED6C02]">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warnings Present: Review contract price variances before transmitting.</span>
            </div>
            <button
              onClick={onMarkReady}
              className="bg-[#ED6C02] text-white hover:bg-amber-700 font-bold px-3 py-1 rounded text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Override Warnings</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between gap-3 text-[#2E7D32]">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Order Fully Validated & Ready for GEBOL ERP Processing</span>
            </div>
            <span className="text-[10px] font-bold font-mono uppercase bg-emerald-100 text-[#2E7D32] px-2 py-0.5 rounded border border-emerald-300">
              PASSED 100%
            </span>
          </div>
        )}

        {/* Validation Rules Checklist */}
        <div className="border border-[#E0E0E0] rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F5F5] font-bold border-b border-[#E0E0E0] text-sm text-gray-700">
                <th className="py-2 px-3 w-20 font-bold">Rule Code</th>
                <th className="py-2 px-3 w-24 font-bold">Category</th>
                <th className="py-2 px-3 font-bold">Validation Condition / Rule Check</th>
                <th className="py-2 px-3 text-center w-24 font-bold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {po.validationRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono font-bold text-gray-600">
                    {rule.code}
                  </td>
                  <td className="py-2 px-3 font-semibold text-gray-700">
                    {rule.category}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-[#1A1A1A]">{rule.message}</div>
                    {rule.actionRequired && (
                      <div className="text-[11px] font-bold text-[#ED6C02] mt-0.5">
                        ↳ Action Required: {rule.actionRequired}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {rule.passed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-[#2E7D32]">
                        <CheckCircle2 className="w-3 h-3" /> PASS
                      </span>
                    ) : rule.severity === 'error' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-[#D32F2F]">
                        <AlertCircle className="w-3 h-3" /> ERROR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-[#ED6C02]">
                        <AlertTriangle className="w-3 h-3" /> WARN
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Toolbar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E0E0E0]">
          <div className="text-gray-500 font-mono text-[11px]">
            System Status: <strong className="text-[#1A1A1A]">{po.status}</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onAutoFixRules}
              className="px-3 py-1.5 border border-[#E0E0E0] hover:bg-gray-100 text-[#1A1A1A] rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F8B800]" />
              <span>Auto-Resolve Master Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
