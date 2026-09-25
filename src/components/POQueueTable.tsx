import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  FileCode,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Building2,
  Calendar,
  User,
} from 'lucide-react';
import { PurchaseOrderRecord, POStatus } from '../types/po';
import { formatDateToDDMMYYYY, formatDateOnly } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { SearchableMultiSelect } from './SearchableMultiSelect';

interface POQueueTableProps {
  orders: PurchaseOrderRecord[];
  onSelectPo: (po: PurchaseOrderRecord) => void;
  onNewIntake: () => void;
  onOpenXmlModal: (po: PurchaseOrderRecord) => void;
}

const normalizeStatus = (status: string): string => {
  if (status === 'Failed') return 'Failed';
  if (status === 'Processing') return 'Processing';
  if (status === 'Needs Review') return 'Needs Review';
  if (
    status === 'Completed' ||
    status === 'Exported' ||
    status === 'XML Generated' ||
    status === 'Processed' ||
    status === 'Ready' ||
    status === 'Ready for XML' ||
    status === 'Ready For XML'
  )
    return 'XML Generated';
  return status;
};

const STATUS_OPTIONS = ['Processing', 'Needs Review', 'XML Generated', 'Failed'];

const formatIsoToDisplay = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
};

export const POQueueTable: React.FC<POQueueTableProps> = ({
  orders,
  onSelectPo,
  onNewIntake,
  onOpenXmlModal,
}) => {
  const { isThemeB } = useTheme();
  const { language, dict } = useLanguage();
  const isDe = language === 'de';

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedUploadedBys, setSelectedUploadedBys] = useState<string[]>([]);

  // Only show .pdf, .xlsx, .xml files
  const validOrders = useMemo(() => {
    const allowed = ['.pdf', '.xlsx', '.xml'];
    return orders.filter((o) => {
      const fn = (o.sourceFileName || '').toLowerCase();
      return allowed.some((ext) => fn.endsWith(ext));
    });
  }, [orders]);

  // Date selection state (Specific Date or Date Range)
  const [selectedUploadDate, setSelectedUploadDate] = useState<string>('');
  const [selectedUploadDateFrom, setSelectedUploadDateFrom] = useState<string>('');
  const [selectedUploadDateTo, setSelectedUploadDateTo] = useState<string>('');
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

  // Filter popup modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([]);
  const [tempSelectedCustomers, setTempSelectedCustomers] = useState<string[]>([]);
  const [tempSelectedUploadedBys, setTempSelectedUploadedBys] = useState<string[]>([]);
  const [tempUploadDate, setTempUploadDate] = useState<string>('');
  const [tempUploadDateFrom, setTempUploadDateFrom] = useState<string>('');
  const [tempUploadDateTo, setTempUploadDateTo] = useState<string>('');
  const [tempDateMode, setTempDateMode] = useState<'single' | 'range'>('single');

  const handleOpenFilterModal = () => {
    setTempSelectedStatuses([...selectedStatuses]);
    setTempSelectedCustomers([...selectedCustomers]);
    setTempSelectedUploadedBys([...selectedUploadedBys]);
    setTempUploadDate(selectedUploadDate);
    setTempUploadDateFrom(selectedUploadDateFrom);
    setTempUploadDateTo(selectedUploadDateTo);
    setTempDateMode(dateMode);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedStatuses([...tempSelectedStatuses]);
    setSelectedCustomers([...tempSelectedCustomers]);
    setSelectedUploadedBys([...tempSelectedUploadedBys]);
    if (tempDateMode === 'single') {
      setSelectedUploadDate(tempUploadDate);
      setSelectedUploadDateFrom('');
      setSelectedUploadDateTo('');
    } else {
      setSelectedUploadDate('');
      setSelectedUploadDateFrom(tempUploadDateFrom);
      setSelectedUploadDateTo(tempUploadDateTo);
    }
    setDateMode(tempDateMode);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const handleResetFiltersInModal = () => {
    setTempSelectedStatuses([]);
    setTempSelectedCustomers([]);
    setTempSelectedUploadedBys([]);
    setTempUploadDate('');
    setTempUploadDateFrom('');
    setTempUploadDateTo('');
  };

  const handleClearAllActiveFilters = () => {
    setSelectedStatuses([]);
    setSelectedCustomers([]);
    setSelectedUploadedBys([]);
    setSelectedUploadDate('');
    setSelectedUploadDateFrom('');
    setSelectedUploadDateTo('');
    setTempSelectedStatuses([]);
    setTempSelectedCustomers([]);
    setTempSelectedUploadedBys([]);
    setTempUploadDate('');
    setTempUploadDateFrom('');
    setTempUploadDateTo('');
    setCurrentPage(1);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Processing':
        return dict.status.processing;
      case 'Needs Review':
        return dict.status.needsReview;
      case 'XML Generated':
      case 'Completed':
      case 'Exported':
        return dict.status.xmlGenerated;
      case 'Failed':
        return dict.status.failed;
      default:
        return status;
    }
  };

  // Available filter options derived from valid orders
  const availableStatuses = useMemo(() => {
    const counts: Record<string, number> = {
      'Processing': 0,
      'Needs Review': 0,
      'XML Generated': 0,
      'Failed': 0,
    };
    validOrders.forEach((o) => {
      const s = normalizeStatus(o.status);
      counts[s] = (counts[s] || 0) + 1;
    });
    return STATUS_OPTIONS.map((status) => ({
      status,
      label: getStatusLabel(status),
      count: counts[status] || 0,
    }));
  }, [validOrders, language]);

  const availableCustomers = useMemo(() => {
    const counts: Record<string, number> = {};
    validOrders.forEach((o) => {
      const name = o.buyer.companyName;
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        count: counts[name],
      }));
  }, [validOrders]);

  const availableUploadedBys = useMemo(() => {
    const counts: Record<string, number> = {};
    validOrders.forEach((o) => {
      const u = o.uploadedBy || 'System Gateway';
      counts[u] = (counts[u] || 0) + 1;
    });
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        count: counts[name],
      }));
  }, [validOrders]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedStatuses.length > 0) count += selectedStatuses.length;
    if (selectedCustomers.length > 0) count += selectedCustomers.length;
    if (selectedUploadedBys.length > 0) count += selectedUploadedBys.length;
    if (selectedUploadDate) count += 1;
    if (selectedUploadDateFrom || selectedUploadDateTo) count += 1;
    return count;
  }, [
    selectedStatuses,
    selectedCustomers,
    selectedUploadedBys,
    selectedUploadDate,
    selectedUploadDateFrom,
    selectedUploadDateTo,
  ]);

  const tempFilterCount = useMemo(() => {
    let count = 0;
    if (tempSelectedStatuses.length > 0) count += tempSelectedStatuses.length;
    if (tempSelectedCustomers.length > 0) count += tempSelectedCustomers.length;
    if (tempSelectedUploadedBys.length > 0) count += tempSelectedUploadedBys.length;
    if (tempUploadDate) count += 1;
    if (tempUploadDateFrom || tempUploadDateTo) count += 1;
    return count;
  }, [
    tempSelectedStatuses,
    tempSelectedCustomers,
    tempSelectedUploadedBys,
    tempUploadDate,
    tempUploadDateFrom,
    tempUploadDateTo,
  ]);

  // Combined Multi-Filter and Search Logic
  const filteredOrders = useMemo(() => {
    return validOrders.filter((order) => {
      // 1. Search Query Match
      const matchesSearch =
        !searchTerm ||
        (order.order.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.buyer.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.sourceFileName || '').toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Status Match
      const orderStatusNorm = normalizeStatus(order.status);
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(orderStatusNorm);

      // 3. Customer Match
      const matchesCustomer =
        selectedCustomers.length === 0 ||
        selectedCustomers.includes(order.buyer.companyName);

      // 4. Uploaded By Match
      const uploader = order.uploadedBy || 'System Gateway';
      const matchesUploadedBy =
        selectedUploadedBys.length === 0 || selectedUploadedBys.includes(uploader);

      // 5. Date Match
      let matchesDate = true;
      const orderDateIso = (order.receivedAt || '').substring(0, 10);
      if (selectedUploadDate) {
        matchesDate = orderDateIso === selectedUploadDate;
      } else if (selectedUploadDateFrom || selectedUploadDateTo) {
        if (selectedUploadDateFrom && selectedUploadDateTo) {
          matchesDate =
            orderDateIso >= selectedUploadDateFrom && orderDateIso <= selectedUploadDateTo;
        } else if (selectedUploadDateFrom) {
          matchesDate = orderDateIso >= selectedUploadDateFrom;
        } else if (selectedUploadDateTo) {
          matchesDate = orderDateIso <= selectedUploadDateTo;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCustomer &&
        matchesUploadedBy &&
        matchesDate
      );
    });
  }, [
    validOrders,
    searchTerm,
    selectedStatuses,
    selectedCustomers,
    selectedUploadedBys,
    selectedUploadDate,
    selectedUploadDateFrom,
    selectedUploadDateTo,
  ]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, safeCurrentPage, rowsPerPage]);

  const getStatusBadge = (status: POStatus) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'Failed':
        return (
          <span className={`inline-flex items-center gap-1 ${isThemeB ? 'px-2 py-0.2 text-[10.5px]' : 'px-2.5 py-0.5 text-[11px]'} rounded font-semibold bg-red-100 text-[#C62828] border border-red-300`}>
            {!isThemeB && <XCircle className="w-3.5 h-3.5 text-[#C62828]" />}
            {dict.status.failed}
          </span>
        );
      case 'XML Generated':
        return (
          <span className={`inline-flex items-center gap-1 ${isThemeB ? 'px-2 py-0.2 text-[10.5px]' : 'px-2.5 py-0.5 text-[11px]'} rounded font-semibold bg-emerald-100 text-[#2E7D32] border border-emerald-300`}>
            {!isThemeB && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />}
            {dict.status.xmlGenerated}
          </span>
        );
      case 'Needs Review':
        return (
          <span className={`inline-flex items-center gap-1 ${isThemeB ? 'px-2 py-0.2 text-[10.5px]' : 'px-2.5 py-0.5 text-[11px]'} rounded font-semibold bg-amber-50 text-amber-700 border border-amber-300`}>
            {!isThemeB && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
            {dict.status.needsReview}
          </span>
        );
      case 'Processing':
      default:
        return (
          <span className={`inline-flex items-center gap-1 ${isThemeB ? 'px-2 py-0.2 text-[10.5px]' : 'px-2.5 py-0.5 text-[11px]'} rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200`}>
            {!isThemeB && <Clock className="w-3.5 h-3.5 animate-spin text-blue-600" />}
            {dict.status.processing}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 🔹 1. TOP HEADER WITH TITLE & ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-0.5">
        <div>
          <h1 className="text-[22px] font-bold text-[#4f4f4e] tracking-tight page-header-title">
            {dict.orders.title}
          </h1>
          <p className="text-[15px] text-[#8f9494] mt-0.5 font-light">
            {dict.orders.subtitle}
          </p>
        </div>

        {/* Right side: Expandable Search Icon, Filter Icon, and Upload Order */}
        <div className="flex items-center gap-2">
          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {isSearchOpen || searchTerm ? (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder={dict.orders.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-48 sm:w-60 pl-8 pr-7 py-1.5 border border-[#E0E0E0] rounded text-xs bg-white text-[#262626] placeholder-gray-400 focus:outline-none focus:border-[#F8B800] transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(false);
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title={dict.common.search}
                className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${
                  isThemeB
                    ? 'bg-[#262626] border-[#383838] text-white hover:bg-[#333333]'
                    : 'bg-white border-[#E0E0E0] text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={handleOpenFilterModal}
            title={dict.common.filter}
            className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs relative flex items-center justify-center ${
              activeFilterCount > 0
                ? isThemeB
                  ? 'bg-[#262626] border-[#F8B800] text-white ring-1 ring-[#F8B800]/50'
                  : 'bg-amber-50 border-[#F8B800] text-[#1A1A1A] ring-1 ring-[#F8B800]/40'
                : isThemeB
                ? 'bg-[#262626] border-[#383838] text-white hover:bg-[#333333]'
                : 'bg-white border-[#E0E0E0] text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter
              className={`w-4 h-4 ${
                activeFilterCount > 0
                  ? isThemeB
                    ? 'text-[#F8B800]'
                    : 'text-amber-600'
                  : isThemeB
                  ? 'text-white'
                  : 'text-gray-600'
              }`}
            />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#ED6C02] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Upload Order CTA */}
          <button
            onClick={onNewIntake}
            className={`bg-[#f7b611] hover:bg-[#e2a508] ${
              isThemeB ? 'text-black' : 'text-white'
            } font-semibold px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs`}
          >
            <Upload className={`w-3.5 h-3.5 ${isThemeB ? 'text-black' : 'text-white'}`} />
            <span className={isThemeB ? 'text-black' : 'text-white'}>{dict.orders.uploadOrderBtn}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {(selectedStatuses.length > 0 ||
        selectedCustomers.length > 0 ||
        selectedUploadDate ||
        selectedUploadDateFrom ||
        selectedUploadDateTo ||
        selectedUploadedBys.length > 0 ||
        searchTerm) && (
        <div className="flex items-center flex-wrap gap-1.5 py-1 text-xs">
          <span className="text-gray-400 text-[11px] font-medium mr-1">{dict.common.activeFilters}</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 rounded-full text-[11px] font-medium">
              Search: <strong>&quot;{searchTerm}&quot;</strong>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatuses.map((st) => (
            <span
              key={st}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-[11px] font-medium"
            >
              Status: <strong>{getStatusLabel(st)}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatuses((prev) => prev.filter((s) => s !== st));
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedCustomers.map((cust) => (
            <span
              key={cust}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[11px] font-medium"
            >
              Customer: <strong>{cust}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomers((prev) => prev.filter((c) => c !== cust));
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove customer filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedUploadDate && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-[11px] font-medium"
            >
              Date: <strong>{formatIsoToDisplay(selectedUploadDate)}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedUploadDate('');
                  setTempUploadDate('');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(selectedUploadDateFrom || selectedUploadDateTo) && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-[11px] font-medium"
            >
              Date Range:{' '}
              <strong>
                {selectedUploadDateFrom ? formatIsoToDisplay(selectedUploadDateFrom) : 'Any'} →{' '}
                {selectedUploadDateTo ? formatIsoToDisplay(selectedUploadDateTo) : 'Any'}
              </strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedUploadDateFrom('');
                  setSelectedUploadDateTo('');
                  setTempUploadDateFrom('');
                  setTempUploadDateTo('');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove date range filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedUploadedBys.map((u) => (
            <span
              key={u}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full text-[11px] font-medium"
            >
              Uploaded By: <strong>{u}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedUploadedBys((prev) => prev.filter((item) => item !== u));
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove uploader filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAllActiveFilters}
            className="text-xs text-gray-500 hover:text-red-700 underline font-semibold cursor-pointer ml-1"
          >
            {dict.common.clearFilters}
          </button>
        </div>
      )}

      {/* 🔹 3. MAIN TABLE LISTING */}
      <div className="bg-white rounded-none border border-[#E0E0E0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px] border-collapse">
            <thead>
              <tr
                className={`${
                  isThemeB
                    ? 'bg-[#161922] text-white border-[#262A36] text-[11px]'
                    : 'bg-gray-100/90 text-gray-700 border-gray-200 text-xs'
                } font-bold border-b`}
              >
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} font-bold`}>
                  {dict.orders.table.orderId}
                </th>
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} font-bold`}>
                  {dict.orders.table.customer}
                </th>
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} font-bold`}>
                  {dict.orders.table.sourceFile}
                </th>
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} text-center font-bold`}>
                  {dict.orders.table.status}
                </th>
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} font-bold`}>
                  {dict.orders.table.receivedDate}
                </th>
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} font-bold`}>
                  {isDe ? 'Hochgeladen von' : 'Uploaded By'}
                </th>
                <th className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} text-center font-bold`}>
                  {dict.orders.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-[11.5px]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8f9494]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-[#4f4f4e]">{dict.common.noDataFound}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isProcessing = order.status === 'Processing';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      {/* 1. Customer Order No. (Clickable to enter Order Details) */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} whitespace-nowrap`}>
                        <button
                          type="button"
                          onClick={() => onSelectPo(order)}
                          className="font-mono font-bold text-[#4f4f4e] hover:text-[#d49b00] hover:underline flex items-center gap-2 text-xs transition-colors cursor-pointer text-left"
                          title={`Open Order Details (${order.order.poNumber || order.id})`}
                        >
                          {!isThemeB && <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                          <span>{order.order.poNumber || order.id}</span>
                        </button>
                      </td>

                      {/* 2. Customer */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'}`}>
                        <div className="font-bold text-[#4f4f4e] text-xs">
                          {order.buyer.companyName}
                        </div>
                      </td>

                      {/* 3. Uploaded Document */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} whitespace-nowrap`}>
                        <div className="font-medium text-[#4f4f4e] text-xs flex items-center gap-1.5">
                          {order.sourceFileName?.toLowerCase().endsWith('.xlsx') ? (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : order.sourceFileName?.toLowerCase().endsWith('.xml') ? (
                            <FileCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                          <span>{order.sourceFileName || 'Purchase_Order.pdf'}</span>
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} text-center whitespace-nowrap`}>
                        {getStatusBadge(order.status)}
                      </td>

                      {/* 5. Upload Date */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} whitespace-nowrap text-[#8f9494] font-mono font-medium text-[11.5px]`}>
                        {formatDateOnly(order.receivedAt, '/')}
                      </td>

                      {/* 6. Uploaded By */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} whitespace-nowrap font-medium text-[#8f9494] text-xs`}>
                        {order.uploadedBy || 'System Gateway'}
                      </td>

                      {/* 7. Actions */}
                      <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2 px-3'} text-center whitespace-nowrap`}>
                        <div className="flex items-center justify-center gap-1.5">
                          {isProcessing ? (
                            <button
                              disabled={true}
                              title="Processing Purchase Order"
                              className={`bg-gray-100 border border-gray-200 text-gray-400 font-medium ${
                                isThemeB ? 'w-6 h-6 p-1 justify-center' : 'px-2.5 py-1 text-xs'
                              } rounded flex items-center gap-1 cursor-not-allowed select-none`}
                            >
                              {!isThemeB && <span>{dict.status.processing}</span>}
                              <Clock className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                            </button>
                          ) : order.status === 'Failed' ? (
                            null
                          ) : (
                            <button
                              onClick={() => onSelectPo(order)}
                              title="Review Purchase Order"
                              className={`bg-[#f7b611] hover:bg-[#e2a508] ${
                                isThemeB ? 'text-black w-6 h-6 p-1 justify-center' : 'text-white px-2.5 py-1 text-xs'
                              } font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs`}
                            >
                              {!isThemeB && <span className="text-white">{isDe ? 'Prüfen' : 'Review'}</span>}
                              <ArrowRight className={`w-3.5 h-3.5 ${isThemeB ? 'text-black stroke-[2.5]' : 'text-white'}`} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 5. PAGINATION & FOOTER CONTROLS */}
        <div className="bg-[#FAFAFA] border-t border-[#E0E0E0] px-4 py-3 flex items-center justify-end gap-2 text-xs text-gray-600">
          <button
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] rounded-none font-semibold text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{dict.common.back}</span>
          </button>

          <span className="font-mono font-bold text-[#1A1A1A] px-2 py-0.5 bg-gray-100 rounded-none border border-gray-200">
            {dict.common.page} {safeCurrentPage} {dict.common.of} {totalPages}
          </span>

          <button
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] rounded-none font-semibold text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
          >
            <span>{dict.common.next}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🔹 FILTER POPUP MODAL WITH SEARCHABLE MULTISELECT DROPDOWNS */}
      {isFilterModalOpen && (
        <div
          onClick={() => setIsFilterModalOpen(false)}
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="filter-popup-modal rounded-none border border-[#E0E0E0] shadow-2xl w-full max-w-2xl overflow-visible animate-in fade-in zoom-in-95 duration-150 flex flex-col bg-white text-gray-900"
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-3.5 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#161922] text-white border-[#383838]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold text-[15px] ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {dict.orders.filterModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left column (Status, Customer, Uploaded By), Right column (Upload Date) */}
            <div className="p-6 text-xs bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Left Column: Status, Customer, Uploaded By */}
                <div className="space-y-4">
                  {/* 1. Status Dropdown */}
                  <div>
                    <SearchableMultiSelect
                      isFullWidth
                      forceLightMode={true}
                      label={dict.orders.filterModal.statusLabel}
                      options={availableStatuses.map((s) => ({
                        label: s.label,
                        value: s.status,
                        count: s.count,
                      }))}
                      selectedValues={tempSelectedStatuses}
                      onChange={(newVal) => setTempSelectedStatuses(newVal)}
                      searchPlaceholder={dict.orders.filterModal.statusLabel + '...'}
                    />
                  </div>

                  {/* 2. Customer Dropdown */}
                  <div>
                    <SearchableMultiSelect
                      isFullWidth
                      forceLightMode={true}
                      label={dict.orders.filterModal.customerLabel}
                      options={availableCustomers.map((c) => ({
                        label: c.name,
                        value: c.name,
                        count: c.count,
                      }))}
                      selectedValues={tempSelectedCustomers}
                      onChange={(newVal) => setTempSelectedCustomers(newVal)}
                      searchPlaceholder={dict.orders.filterModal.customerLabel + '...'}
                    />
                  </div>

                  {/* 3. Uploaded By Dropdown */}
                  <div>
                    <SearchableMultiSelect
                      isFullWidth
                      forceLightMode={true}
                      label={dict.orders.filterModal.uploadedByLabel}
                      options={availableUploadedBys.map((u) => ({
                        label: u.name,
                        value: u.name,
                        count: u.count,
                      }))}
                      selectedValues={tempSelectedUploadedBys}
                      onChange={(newVal) => setTempSelectedUploadedBys(newVal)}
                      searchPlaceholder={dict.orders.filterModal.uploadedByLabel + '...'}
                    />
                  </div>
                </div>

                {/* Right Column: Upload Date Selection (Specific Date or Date Range) */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                        <span>{dict.orders.filterModal.dateLabel}</span>
                      </label>
                      {(tempUploadDate || tempUploadDateFrom || tempUploadDateTo) && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempUploadDate('');
                            setTempUploadDateFrom('');
                            setTempUploadDateTo('');
                          }}
                          className="text-[11px] text-gray-500 hover:text-red-600 underline cursor-pointer"
                        >
                          {dict.common.reset}
                        </button>
                      )}
                    </div>

                    <div className="border border-gray-200 bg-gray-50/50 p-2.5 space-y-2">
                      {/* Mode Selector */}
                      <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded">
                        <button
                          type="button"
                          onClick={() => setTempDateMode('single')}
                          className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
                            tempDateMode === 'single'
                              ? 'bg-white text-gray-900 shadow-2xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {dict.orders.filterModal.singleDate}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempDateMode('range')}
                          className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
                            tempDateMode === 'range'
                              ? 'bg-white text-gray-900 shadow-2xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {dict.orders.filterModal.dateRange}
                        </button>
                      </div>

                      {tempDateMode === 'single' ? (
                        <div className="space-y-1">
                          <input
                            type="date"
                            value={tempUploadDate}
                            onChange={(e) => setTempUploadDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] cursor-pointer"
                          />
                          {tempUploadDate && (
                            <p className="text-[10.5px] text-gray-600">
                              Selected: <strong className="text-gray-900">{formatIsoToDisplay(tempUploadDate)}</strong>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[10px] text-gray-500 mb-0.5 font-medium">
                                {dict.orders.filterModal.fromDate}
                              </span>
                              <input
                                type="date"
                                value={tempUploadDateFrom}
                                onChange={(e) => setTempUploadDateFrom(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] cursor-pointer"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-500 mb-0.5 font-medium">
                                {dict.orders.filterModal.toDate}
                              </span>
                              <input
                                type="date"
                                value={tempUploadDateTo}
                                onChange={(e) => setTempUploadDateTo(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800] cursor-pointer"
                              />
                            </div>
                          </div>
                          {(tempUploadDateFrom || tempUploadDateTo) && (
                            <p className="text-[10.5px] text-gray-600">
                              Range:{' '}
                              <strong className="text-gray-900">
                                {tempUploadDateFrom ? formatIsoToDisplay(tempUploadDateFrom) : 'Any'} →{' '}
                                {tempUploadDateTo ? formatIsoToDisplay(tempUploadDateTo) : 'Any'}
                              </strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-200 bg-gray-50 text-gray-900">
              <button
                type="button"
                onClick={handleResetFiltersInModal}
                disabled={tempFilterCount === 0}
                className={`text-xs font-semibold cursor-pointer ${
                  tempFilterCount > 0
                    ? 'text-red-600 hover:text-red-800 underline'
                    : 'text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                {dict.orders.filterModal.resetBtn}
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-none border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {dict.orders.filterModal.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-5 py-1.5 bg-[#f7b611] hover:bg-[#e2a508] text-black font-bold rounded-none text-xs cursor-pointer shadow-xs transition-colors"
                >
                  {dict.orders.filterModal.applyBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
