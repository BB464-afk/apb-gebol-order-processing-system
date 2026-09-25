import React, { useState, useMemo, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  X,
  Check,
  Edit2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';

export interface UserRecord {
  id: string;
  email: string;
  role: 'Super User' | 'Normal User';
}

interface ImportedUserPreview {
  raw: {
    email: string;
    role: string;
  };
  normalizedRole: 'Super User' | 'Normal User';
  isValid: boolean;
  errors: string[];
}

export const INITIAL_USERS: UserRecord[] = [
  { id: 'usr-1', email: 'lucas.platzer@gebol.at', role: 'Super User' },
  { id: 'usr-2', email: 'bhoomi.barot@gebol.at', role: 'Super User' },
  { id: 'usr-3', email: 'stefan.gruber@gebol.at', role: 'Normal User' },
  { id: 'usr-4', email: 'maria.huber@gebol.at', role: 'Normal User' },
  { id: 'usr-5', email: 'alexander.weber@gebol.at', role: 'Normal User' },
  { id: 'usr-6', email: 'sophie.leitner@gebol.at', role: 'Normal User' },
  { id: 'usr-7', email: 'christian.kaiser@gebol.at', role: 'Normal User' },
  { id: 'usr-8', email: 'karin.wagner@gebol.at', role: 'Normal User' },
];

const DEFAULT_USER_IMPORT_ROWS = [
  ['Email Address', 'Role'],
  ['lucas.platzer@gebol.at', 'Super User'],
  ['bhoomi.barot@gebol.at', 'Super User'],
  ['stefan.gruber@gebol.at', 'Normal User'],
  ['maria.huber@gebol.at', 'Normal User'],
  ['alexander.weber@gebol.at', 'Normal User'],
  ['sophie.leitner@gebol.at', 'Normal User'],
];

export const UserManagementView: React.FC = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const { isThemeB } = useTheme();
  const { language, dict } = useLanguage();
  const isDe = language === 'de';

  // Master Users State
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'Super User' | 'Normal User'>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempRoleFilter, setTempRoleFilter] = useState<'all' | 'Super User' | 'Normal User'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Change Role Modal State
  const [userToChangeRole, setUserToChangeRole] = useState<UserRecord | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<'Super User' | 'Normal User'>('Normal User');

  // Import Modal State (2-step workflow identical to Article Master)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [hasParsedImport, setHasParsedImport] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [importPreviews, setImportPreviews] = useState<ImportedUserPreview[]>([]);
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchTerm ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // 🔹 Handlers for Filter Modal
  const handleOpenFilterModal = () => {
    setTempRoleFilter(roleFilter);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = () => {
    setRoleFilter(tempRoleFilter);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const handleResetFilter = () => {
    setTempRoleFilter('all');
    setRoleFilter('all');
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  // 🔹 Handlers for Change Role
  const handleOpenChangeRoleModal = (user: UserRecord) => {
    setUserToChangeRole(user);
    setSelectedNewRole(user.role);
  };

  const handleSaveRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToChangeRole) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userToChangeRole.id ? { ...u, role: selectedNewRole } : u))
    );

    toast.success(
      dict.userManagement.changeRoleModal.successToast,
      `${userToChangeRole.email} → ${
        selectedNewRole === 'Super User'
          ? dict.userManagement.roles.superUser
          : dict.userManagement.roles.normalUser
      }`
    );

    setUserToChangeRole(null);
  };

  // 🔹 Handlers for Export
  const handleExportUsers = () => {
    const dataToExport = filteredUsers.length > 0 ? filteredUsers : users;
    const csvHeader = 'Email Address,Role\n';
    const csvContent = dataToExport
      .map((u) => `"${u.email}","${u.role}"`)
      .join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GEBOL_Users_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      dict.userManagement.exportSuccessToast,
      `${dataToExport.length} ${isDe ? 'Benutzer exportiert.' : 'users exported.'}`
    );
  };

  // 🔹 Sample Template Download (.xlsx)
  const handleDownloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Email Address', 'Role'],
      ['lucas.platzer@gebol.at', 'Super User'],
      ['bhoomi.barot@gebol.at', 'Super User'],
      ['stefan.gruber@gebol.at', 'Normal User'],
      ['maria.huber@gebol.at', 'Normal User'],
      ['alexander.weber@gebol.at', 'Normal User'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'GEBOL_User_Template.xlsx');
  };

  // 🔹 Process Raw Rows for Import
  const processImportRows = (rows: any[][], fileName: string) => {
    if (!rows || rows.length <= 1) {
      setImportPreviews([]);
      return;
    }

    // Skip header row
    const dataRows = rows.slice(1);
    const seenEmails = new Set<string>();

    const previews: ImportedUserPreview[] = dataRows
      .map((row) => {
        const rawEmail = String(row[0] || '').trim();
        const rawRole = String(row[1] || '').trim();

        if (!rawEmail && !rawRole) return null;

        const errors: string[] = [];
        if (!rawEmail) {
          errors.push(isDe ? 'E-Mail-Adresse fehlt' : 'Email address is required');
        } else if (!rawEmail.includes('@') || !rawEmail.includes('.')) {
          errors.push(isDe ? 'Ungültiges E-Mail-Format' : 'Invalid email format');
        } else if (seenEmails.has(rawEmail.toLowerCase())) {
          errors.push(isDe ? 'Doppelte E-Mail in Datei' : 'Duplicate email in file');
        }

        if (rawEmail) {
          seenEmails.add(rawEmail.toLowerCase());
        }

        const normalizedRole: 'Super User' | 'Normal User' =
          rawRole.toLowerCase().includes('super') || rawRole.toLowerCase().includes('admin')
            ? 'Super User'
            : 'Normal User';

        return {
          raw: { email: rawEmail, role: rawRole || 'Normal User' },
          normalizedRole,
          isValid: errors.length === 0,
          errors,
        };
      })
      .filter((p): p is ImportedUserPreview => p !== null);

    setImportPreviews(previews);
    setSelectedFileName(fileName);
    setHasParsedImport(true);
  };

  // 🔹 Parse CSV / Text / Excel Import Trigger
  const handleParseImport = () => {
    if (selectedFileName && selectedFileName.endsWith('.csv') && importText.trim()) {
      const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
      const rows = lines.map((line) => {
        return line.includes('\t')
          ? line.split('\t')
          : line.includes(';')
          ? line.split(';')
          : line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      });
      processImportRows(rows, selectedFileName);
    } else {
      processImportRows(DEFAULT_USER_IMPORT_ROWS, selectedFileName || 'GEBOL_User_Template.xlsx');
    }
  };

  // 🔹 File Upload Handler for Import (supporting .xlsx, .xls, and .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          processImportRows(rows, file.name);
        } catch (err) {
          toast.error('File Error', 'Failed to parse Excel spreadsheet.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setImportText(content);
          const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
          const rows = lines.map((line) => {
            return line.includes('\t')
              ? line.split('\t')
              : line.includes(';')
              ? line.split(';')
              : line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          });
          processImportRows(rows, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  // 🔹 Confirm and Apply Import
  const handleConfirmImport = () => {
    const hasInvalid = importPreviews.some((p) => !p.isValid);
    if (hasInvalid || importPreviews.length === 0) {
      toast.error('Import Failed', dict.userManagement.importModal.errorNoValidRows);
      return;
    }

    const newRecords: UserRecord[] = importPreviews.map((r, idx) => ({
      id: `usr-imp-${Date.now()}-${idx}`,
      email: r.raw.email,
      role: r.normalizedRole,
    }));

    // REPLACES/UPDATES user list with imported data
    setUsers(newRecords);
    setIsImportModalOpen(false);
    setHasParsedImport(false);
    setImportPreviews([]);
    setSelectedFileName('');
    setImportText('');

    toast.success(
      dict.userManagement.importModal.successToast,
      `${newRecords.length} ${isDe ? 'Benutzer erfolgreich eingespielt.' : 'users saved.'}`
    );

    addNotification({
      scenario: 'master_data_upload',
      title: isDe ? 'Benutzerstamm aktualisiert' : 'User Master Upload',
      message: isDe
        ? `${newRecords.length} Benutzer wurden erfolgreich über die Vorlage importiert.`
        : `${newRecords.length} users were successfully updated via template import.`,
      severity: 'success',
      relatedEntityId: 'User Management',
      relatedEntityType: 'user_management',
      actionLabel: 'View Users',
      actionLabelDe: 'Benutzer anzeigen',
      actionNav: 'user-management',
    });
  };

  const activeFilterCount = roleFilter !== 'all' ? 1 : 0;

  return (
    <div className="space-y-3.5 font-sans">
      {/* 🔹 1. HEADER & TOP-RIGHT TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-0.5">
        <div>
          <h1 className="text-[22px] font-bold text-[#4f4f4e] tracking-tight page-header-title">
            {dict.userManagement.title}
          </h1>
          <p className="text-[15px] text-[#8f9494] mt-0.5 font-light">
            {dict.userManagement.subtitle}
          </p>
        </div>

        {/* Top Right Actions: Search, Filter, Import, Export */}
        <div className="flex items-center gap-2">
          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {isSearchOpen || searchTerm ? (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder={dict.userManagement.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-52 sm:w-64 pl-8 pr-7 py-1.5 border border-[#E0E0E0] rounded text-xs bg-white text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F8B800] transition-all shadow-2xs"
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
                title={isDe ? 'Benutzer suchen' : 'Search users'}
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
            title={dict.userManagement.filterBtn}
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
                  ? 'text-[#ED6C02]'
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

          {/* Import Button */}
          <button
            onClick={() => {
              setSelectedFileName('GEBOL_User_Template.xlsx');
              setImportPreviews([]);
              setHasParsedImport(false);
              setIsImportModalOpen(true);
            }}
            title={dict.userManagement.importBtn}
            className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${
              isThemeB
                ? 'bg-[#262626] border-[#383838] hover:bg-[#333333]'
                : 'bg-white border-[#E0E0E0] hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportUsers}
            title={dict.userManagement.exportBtn}
            className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${
              isThemeB
                ? 'bg-[#262626] border-[#383838] hover:bg-[#333333]'
                : 'bg-white border-[#E0E0E0] hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* 🔹 2. ACTIVE FILTERS CHIPS BAR */}
      {(roleFilter !== 'all' || searchTerm) && (
        <div className="flex items-center flex-wrap gap-1.5 py-1 text-xs">
          <span className="text-gray-400 text-[11px] font-medium mr-1">
            {isDe ? 'Aktive Filter:' : 'Active filters:'}
          </span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 rounded-full text-[11px] font-medium">
              {isDe ? 'Suche:' : 'Search:'} <strong>&quot;{searchTerm}&quot;</strong>
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

          {roleFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[11px] font-medium">
              {isDe ? 'Rolle:' : 'Role:'}{' '}
              <strong>
                {roleFilter === 'Super User'
                  ? dict.userManagement.roles.superUser
                  : dict.userManagement.roles.normalUser}
              </strong>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('all');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove role filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setCurrentPage(1);
            }}
            className="text-xs text-gray-500 hover:text-[#1A1A1A] underline font-semibold cursor-pointer ml-2"
          >
            {isDe ? 'Alle löschen' : 'Clear all'}
          </button>
        </div>
      )}

      {/* 🔹 3. MAIN TABLE (Email Address | Role | Action) */}
      <div className="bg-white rounded-none border border-[#E0E0E0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse text-[#8f9494]">
            <thead>
              <tr
                className={`${
                  isThemeB
                    ? 'bg-[#161922] text-white border-[#262A36] text-xs'
                    : 'bg-gray-100/90 text-gray-700 border-gray-200 text-xs'
                } font-bold border-b`}
              >
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>
                  {dict.userManagement.table.email}
                </th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>
                  {dict.userManagement.table.role}
                </th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold text-right pr-4`}>
                  {dict.userManagement.table.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-xs">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#8f9494]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-[#4f4f4e]">
                        {isDe ? 'Keine Benutzer gefunden' : 'No users found'}
                      </p>
                      <p className="text-xs text-[#8f9494]">
                        {isDe
                          ? 'Passen Sie Ihre Suchanfrage oder Filter an.'
                          : 'Try adjusting your search query or reset active filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isSuper = user.role === 'Super User';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      {/* 1. Email Address */}
                      <td className={`${isThemeB ? 'py-2 px-3' : 'py-2 px-3'} font-mono font-medium text-[#4f4f4e] text-xs`}>
                        {user.email}
                      </td>

                      {/* 2. Role Badge */}
                      <td className={`${isThemeB ? 'py-2 px-3' : 'py-2 px-3'} text-xs`}>
                        {isSuper ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            {dict.userManagement.roles.superUser}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                            {dict.userManagement.roles.normalUser}
                          </span>
                        )}
                      </td>

                      {/* 3. Action ("Change Role" button) */}
                      <td className={`${isThemeB ? 'py-2 px-3' : 'py-2 px-3'} text-right pr-4`}>
                        <button
                          type="button"
                          onClick={() => handleOpenChangeRoleModal(user)}
                          title={dict.userManagement.changeRoleBtn}
                          className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded text-xs border border-gray-300 cursor-pointer shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-gray-500" />
                          <span>{dict.userManagement.changeRoleBtn}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="bg-[#FAFAFA] border-t border-[#E0E0E0] px-4 py-3 flex items-center justify-end gap-2 text-xs text-gray-600">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] rounded-none font-semibold text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{isDe ? 'Zurück' : 'Previous'}</span>
          </button>

          <span className="font-mono font-bold text-[#1A1A1A] px-2 py-0.5 bg-gray-100 rounded-none border border-gray-200">
            {isDe ? 'Seite' : 'Page'} {currentPage} {isDe ? 'von' : 'of'} {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] rounded-none font-semibold text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
          >
            <span>{isDe ? 'Weiter' : 'Next'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🔹 4. CHANGE ROLE MODAL */}
      {userToChangeRole && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 font-sans`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F8B800]" />
                <h3 className="font-bold text-[15px] tracking-tight">
                  {dict.userManagement.changeRoleModal.title}
                </h3>
              </div>
              <button
                onClick={() => setUserToChangeRole(null)}
                className="cursor-pointer p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRoleChange} className="p-5 space-y-4 text-xs">
              {/* User Email (Read-Only) */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {dict.userManagement.changeRoleModal.emailLabel}
                </label>
                <input
                  type="text"
                  readOnly
                  value={userToChangeRole.email}
                  className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded text-xs bg-gray-50 text-gray-700 font-mono select-none cursor-default font-medium"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {dict.userManagement.changeRoleModal.roleLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as 'Super User' | 'Normal User')}
                  className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800] cursor-pointer font-medium"
                >
                  <option value="Super User">{dict.userManagement.roles.superUser}</option>
                  <option value="Normal User">{dict.userManagement.roles.normalUser}</option>
                </select>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserToChangeRole(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer text-xs"
                >
                  {dict.userManagement.changeRoleModal.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-semibold">
                    {dict.userManagement.changeRoleModal.saveBtn}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 5. FILTER MODAL */}
      {isFilterModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 font-sans`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#F8B800]" />
                <h3 className="font-bold text-[15px] tracking-tight">
                  {dict.userManagement.filterModal.title}
                </h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="cursor-pointer p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  {dict.userManagement.filterModal.roleLabel}
                </label>
                <select
                  value={tempRoleFilter}
                  onChange={(e) =>
                    setTempRoleFilter(e.target.value as 'all' | 'Super User' | 'Normal User')
                  }
                  className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800] cursor-pointer font-medium"
                >
                  <option value="all">{dict.userManagement.filterModal.allRoles}</option>
                  <option value="Super User">{dict.userManagement.roles.superUser}</option>
                  <option value="Normal User">{dict.userManagement.roles.normalUser}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E0E0E0] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded text-xs font-semibold cursor-pointer"
                >
                  {dict.userManagement.filterModal.resetBtn}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(false)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-xs cursor-pointer"
                  >
                    {dict.userManagement.filterModal.cancelBtn}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    className="px-4 py-1.5 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded text-xs cursor-pointer shadow-xs"
                  >
                    {dict.userManagement.filterModal.applyBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 6. 2-STEP IMPORT USERS MODAL (MATCHING ARTICLE MASTER PATTERN) */}
      {isImportModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 font-sans`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#262626] text-white border-[#F8B800]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`font-semibold text-[15px] ${
                    isThemeB ? 'text-white' : 'text-[#4f4f4e]'
                  }`}
                >
                  {dict.userManagement.importModal.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setHasParsedImport(false);
                  setImportPreviews([]);
                  setSelectedFileName('');
                }}
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* STEP 1: INITIAL UPLOAD POPUP */}
              {!hasParsedImport ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      {dict.userManagement.importModal.selectPrompt}
                    </span>
                  </div>

                  {/* File Upload Drop Zone - Entire Dotted Area Clickable */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E0E0E0] bg-gray-50/70 rounded-lg p-8 text-center hover:bg-amber-50/50 hover:border-[#F8B800] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-[#F8B800] mx-auto mb-2" />
                    <p className="font-bold text-gray-800 text-sm">
                      {selectedFileName
                        ? `${dict.userManagement.importModal.selected} ${selectedFileName}`
                        : dict.userManagement.importModal.clickToSelect}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold text-xs">
                      <span>{dict.userManagement.importModal.supportedFormat}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 font-light">
                      {dict.userManagement.importModal.mandatoryNotice}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0]">
                    <button
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setHasParsedImport(false);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer"
                    >
                      {dict.userManagement.importModal.cancelBtn}
                    </button>
                    <button
                      onClick={handleParseImport}
                      className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded cursor-pointer shadow-xs"
                    >
                      <span className="text-white font-semibold">
                        {dict.userManagement.importModal.parsePreviewBtn}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* STEP 2: PREVIEW TABLE WITH ROW VALIDATION */
                <div className="space-y-4">
                  {/* Notice depicting replacement/update */}
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 text-xs">
                        {dict.userManagement.importModal.previewNotice}
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {dict.userManagement.importModal.previewSubNotice}
                      </p>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between bg-gray-50 p-2.5 rounded border border-[#E0E0E0] gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">
                        {dict.userManagement.importModal.totalParsed} {importPreviews.length}
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                        {importPreviews.filter((p) => p.isValid).length} {dict.userManagement.importModal.valid}
                      </span>
                      {importPreviews.some((p) => !p.isValid) && (
                        <span className="text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded border border-red-300">
                          {importPreviews.filter((p) => !p.isValid).length} {dict.userManagement.importModal.invalid}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-gray-500 font-mono">
                      {selectedFileName || 'User Dataset'}
                    </span>
                  </div>

                  {/* Table with validation details */}
                  <div className="max-h-64 overflow-y-auto border border-[#E0E0E0] rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead
                        className={`${
                          isThemeB
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-gray-100 text-gray-800 border-b border-gray-200'
                        } font-bold text-xs sticky top-0 z-10`}
                      >
                        <tr>
                          <th className="py-2.5 px-3 font-bold">{isDe ? 'Ergebnis' : 'Result'}</th>
                          <th className="py-2.5 px-3 font-bold">
                            {dict.userManagement.table.email} <span className="text-amber-400">*</span>
                          </th>
                          <th className="py-2.5 px-3 font-bold">
                            {dict.userManagement.table.role} <span className="text-amber-400">*</span>
                          </th>
                          <th className="py-2.5 px-3 font-bold">{isDe ? 'Validierungsdetails' : 'Validation Details'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importPreviews.map((row, idx) => (
                          <tr
                            key={idx}
                            className={row.isValid ? 'bg-white hover:bg-gray-50' : 'bg-red-50/70 hover:bg-red-50'}
                          >
                            <td className="py-2.5 px-3">
                              {row.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {row.raw.email ? (
                                <span className="font-medium text-gray-900">{row.raw.email}</span>
                              ) : (
                                <span className="text-red-600 font-normal">[Missing Email]</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-gray-700">
                              {row.normalizedRole === 'Super User' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-amber-800 bg-amber-50 border border-amber-200 font-semibold">
                                  {dict.userManagement.roles.superUser}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-gray-700 bg-gray-100 border border-gray-200 font-medium">
                                  {dict.userManagement.roles.normalUser}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {row.isValid ? (
                                <span className="text-emerald-700 text-xs font-normal">
                                  {isDe ? 'Bereit' : 'Ready'}
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  {row.errors.map((err, eIdx) => (
                                    <p key={eIdx} className="text-red-600 text-xs font-normal">
                                      {err}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Validation error notice if disabled */}
                  {importPreviews.some((p) => !p.isValid) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-semibold">
                          {dict.userManagement.importModal.saveDisabledWarning}
                        </span>
                      </div>
                      <span className="text-[11px] text-red-600 font-mono">
                        {isDe ? 'Alle Zeilen müssen gültig sein' : 'All records must be valid to import'}
                      </span>
                    </div>
                  )}

                  {/* Step 2 Footer */}
                  <div className="flex flex-wrap justify-between items-center pt-3 border-t border-[#E0E0E0] gap-3">
                    <button
                      onClick={() => setHasParsedImport(false)}
                      className="px-3.5 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{dict.userManagement.importModal.backToFileSelection}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsImportModalOpen(false);
                          setHasParsedImport(false);
                          setImportPreviews([]);
                          setSelectedFileName('');
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer"
                      >
                        {dict.userManagement.importModal.cancelBtn}
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        disabled={importPreviews.some((p) => !p.isValid) || importPreviews.length === 0}
                        title={
                          importPreviews.some((p) => !p.isValid)
                            ? 'Save button is disabled because mandatory fields are missing or duplicate records exist'
                            : 'Save and update all user records'
                        }
                        className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span className="text-white font-semibold">
                          {dict.userManagement.importModal.saveAndReplace} (
                          {importPreviews.filter((p) => p.isValid).length} {isDe ? 'Benutzer' : 'Users'})
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
