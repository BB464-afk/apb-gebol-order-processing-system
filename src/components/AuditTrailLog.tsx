import React from 'react';
import { History, UserCheck, Bot, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuditLogEntry } from '../types/po';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

interface AuditTrailLogProps {
  auditTrail: AuditLogEntry[];
}

export const AuditTrailLog: React.FC<AuditTrailLogProps> = ({ auditTrail }) => {
  return (
    <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#F8B800]" />
          <h3 className="font-bold text-xs uppercase tracking-wider">
            Human-in-the-Loop Audit Trail & Traceability
          </h3>
        </div>

        <span className="text-[10px] font-mono bg-[#333333] px-2 py-0.5 rounded text-gray-300">
          COMPLIANCE LOGGED
        </span>
      </div>

      {/* Log Entries */}
      <div className="p-4 space-y-3 max-h-60 overflow-y-auto text-xs">
        {auditTrail.length === 0 ? (
          <p className="text-gray-500 italic text-center py-2">No activity logged yet.</p>
        ) : (
          auditTrail.map((entry) => {
            const isAi = entry.user.toLowerCase().includes('ai') || entry.user.toLowerCase().includes('engine') || entry.user.toLowerCase().includes('system');

            return (
              <div
                key={entry.id}
                className="p-2.5 bg-[#FAFAFA] rounded border border-[#E0E0E0] flex items-start gap-3 text-[#1A1A1A]"
              >
                <div className={`p-1.5 rounded shrink-0 ${isAi ? 'bg-amber-100 text-[#1A1A1A]' : 'bg-blue-100 text-blue-900'}`}>
                  {isAi ? <Bot className="w-3.5 h-3.5 text-[#F8B800]" /> : <UserCheck className="w-3.5 h-3.5 text-blue-700" />}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1A1A1A]">
                      {entry.action}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {formatDateToDDMMYYYY(entry.timestamp)}
                    </span>
                  </div>

                  <p className="text-gray-700 text-xs">{entry.details}</p>

                  <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2 pt-0.5">
                    <span>Operator: <strong className="text-[#1A1A1A]">{entry.user}</strong></span>
                    <span>• Category: {entry.category}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
