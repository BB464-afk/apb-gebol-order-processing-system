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
  Trash2,
  UserPlus,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

export interface UserRecord {
  id: string;
  email: string;
  role: 'Super User' | 'Normal User';
}

export interface UserManagementViewProps {
  currentUserEmail?: string;
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

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUserEmail = 'lucas.platzer@gebol.at',
}) => {
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

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Super User' | 'Normal User'>('Normal User');
  const [emailError, setEmailError] = useState('');

  // Delete User Modal State
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Change Role Modal State
  const [userToChangeRole, setUserToChangeRole] = useState<UserRecord | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<'Super User' | 'Normal User'>('Normal User');

  // Import Modal State (Strictly .xlsx full replacement)
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

  // 🔹 Handlers for Add User
  const handleOpenAddUserModal = () => {
    setNewEmail('');
    setNewRole('Normal User');
    setEmailError('');
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError(dict.userManagement.addUserModal.invalidEmailError);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError(dict.userManagement.addUserModal.invalidEmailError);
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setEmailError(dict.userManagement.addUserModal.duplicateError);
      return;
    }

    const newUserRecord: UserRecord = {
      id: `usr-${Date.now()}`,
      email: trimmedEmail,
      role: newRole,
    };

    setUsers((prev) => [newUserRecord, ...prev]);
    setIsAddUserModalOpen(false);
    setNewEmail('');
    setNewRole('Normal User');
    setEmailError('');

    toast.success(
      dict.userManagement.addUserModal.title,
      dict.userManagement.addUserModal.successToast
    );

    addNotification({
      scenario: 'master_data_upload',
      title: isDe ? 'Neuer Benutzer hinzugefügt' : 'New User Added',
      message: isDe
        ? `Kontoerstellungslink wurde per E-Mail an ${trimmedEmail} gesendet (${newRole}).`
        : `Account-creation invitation link has been sent to ${trimmedEmail} (${newRole}).`,
      severity: 'success',
      relatedEntityId: trimmedEmail,
      relatedEntityType: 'user_management',
      actionLabel: 'View Users',
      actionLabelDe: 'Benutzer anzeigen',
      actionNav: 'user-management',
    });
  };

  // 🔹 Handlers for Delete User
  const handleInitiateDelete = (user: UserRecord) => {
    const isSelf = user.email.toLowerCase() === (currentUserEmail || '').trim().toLowerCase();
    const superUsersCount = users.filter((u) => u.role === 'Super User').length;
    const isLastSuperUser = user.role === 'Super User' && superUsersCount <= 1;

    if (isSelf) {
      toast.error(
        dict.userManagement.deleteModal.title,
        dict.userManagement.deleteModal.selfDeleteBlocked
      );
      return;
    }

    if (isLastSuperUser) {
      toast.error(
        dict.userManagement.deleteModal.title,
        dict.userManagement.deleteModal.lastSuperUserBlocked
      );
      return;
    }

    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const email = userToDelete.email;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);

    toast.success(
      dict.userManagement.deleteModal.title,
      `${email} ${isDe ? 'wurde erfolgreich gelöscht.' : 'was deleted successfully.'}`
    );
  };

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

    // Check if downgrading the last super user
    if (
      userToChangeRole.role === 'Super User' &&
      selectedNewRole === 'Normal User' &&
      users.filter((u) => u.role === 'Super User').length <= 1
    ) {
      toast.error(
        dict.userManagement.changeRoleModal.title,
        dict.userManagement.deleteModal.lastSuperUserBlocked
      );
      return;
    }

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
      ['Email', 'Role'],
      ['lucas.platzer@gebol.at', 'Super User'],
      ['bhoomi.barot@gebol.at', 'Super User'],
      ['stefan.gruber@gebol.at', 'Normal User'],
      ['maria.huber@gebol.at', 'Normal User'],
      ['alexander.weber@gebol.at', 'Normal User'],
      ['sophie.leitner@gebol.at', 'Normal User'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'GEBOL_User_Template.xlsx');
  };

  // 🔹 Process Raw Rows for Import (Strictly Email & Role columns)
  const processImportRows = (rows: any[][], fileName: string) => {
    if (!rows || rows.length <= 1) {
      setImportPreviews([]);
      return;
    }

    // Skip header row (Header: Email / Email Address, Role)
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

    // Verify at least one Super User exists in the imported valid rows
    const validRows = previews.filter((p) => p.isValid);
    const hasSuperUser = validRows.some((p) => p.normalizedRole === 'Super User');
    if (validRows.length > 0 && !hasSuperUser) {
      previews.forEach((p) => {
        p.isValid = false;
        p.errors.push(
          isDe
            ? 'Importdatei muss mindestens einen Superuser enthalten'
            : 'Import file must contain at least one Super User'
        );
      });
    }

    setImportPreviews(previews);
    setSelectedFileName(fileName);
    setHasParsedImport(true);
  };

  // 🔹 File Upload Handler for Import (Strictly .xlsx)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Invalid File', dict.userManagement.importModal.errorOnlyXlsx);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFileName(file.name);
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
        toast.error('File Error', 'Failed to parse Excel spreadsheet (.xlsx).');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 🔹 Parse Excel Import Trigger
  const handleParseImport = () => {
    processImportRows(DEFAULT_USER_IMPORT_ROWS, selectedFileName || 'GEBOL_User_Template.xlsx');
  };

  // 🔹 Confirm and Apply Import (Full Atomic Replacement)
  const handleConfirmImport = () => {
    const hasInvalid = importPreviews.some((p) => !p.isValid);
    const hasSuperUser = importPreviews.some((p) => p.isValid && p.normalizedRole === 'Super User');

    if (hasInvalid || importPreviews.length === 0 || !hasSuperUser) {
      if (!hasSuperUser && importPreviews.length > 0) {
        toast.error('Import Failed', dict.userManagement.importModal.errorNoSuperUser);
      } else {
        toast.error('Import Failed', dict.userManagement.importModal.errorNoValidRows);
      }
      return;
    }

    const newRecords: UserRecord[] = importPreviews.map((r, idx) => ({
      id: `usr-imp-${Date.now()}-${idx}`,
      email: r.raw.email,
      role: r.normalizedRole,
    }));

    // Full replacement: replaces existing user list with imported data
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
        ? `${newRecords.length} Benutzer wurden erfolgreich über die XLSX-Vorlage importiert (Vollständiger Ersatz).`
        : `${newRecords.length} users were successfully updated via XLSX template import (Full Replacement).`,
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

        {/* Top Right Actions: Search, Filter, Import, Export, Add User */}
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

          {/* Add New User Button (Placed Last) */}
          <button
            type="button"
            onClick={handleOpenAddUserModal}
            title={dict.userManagement.addUserBtn}
            className="px-3 py-1.5 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>{dict.userManagement.addUserBtn}</span>
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
                  const isSelf = user.email.toLowerCase() === (currentUserEmail || '').trim().toLowerCase();
                  const superUsersCount = users.filter((u) => u.role === 'Super User').length;
                  const isLastSuperUser = isSuper && superUsersCount <= 1;

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

                      {/* 3. Action ("Change Role" and "Delete" buttons) */}
                      <td className={`${isThemeB ? 'py-2 px-3' : 'py-2 px-3'} text-right pr-4`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Role Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenChangeRoleModal(user)}
                            title={dict.userManagement.changeRoleBtn}
                            className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded text-xs border border-gray-300 cursor-pointer shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="w-3 h-3 text-gray-500" />
                            <span>{dict.userManagement.changeRoleBtn}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleInitiateDelete(user)}
                            title={
                              isSelf
                                ? dict.userManagement.deleteModal.selfDeleteBlocked
                                : isLastSuperUser
                                ? dict.userManagement.deleteModal.lastSuperUserBlocked
                                : dict.userManagement.deleteBtn
                            }
                            disabled={isSelf}
                            className={`p-1.5 rounded border transition-colors ${
                              isSelf
                                ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                                : isThemeB
                                ? 'border-[#383838] bg-[#262626] text-gray-300 hover:text-red-400 hover:border-red-500/50 cursor-pointer'
                                : 'border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer shadow-2xs'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* 🔹 4. ADD NEW USER MODAL */}
      {isAddUserModalOpen && (
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
                <UserPlus className="w-4 h-4 text-[#F8B800]" />
                <h3 className="font-bold text-[15px] tracking-tight">
                  {dict.userManagement.addUserModal.title}
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="cursor-pointer p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              {/* Email Address */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {dict.userManagement.addUserModal.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder={dict.userManagement.addUserModal.emailPlaceholder}
                  className={`w-full px-3 py-1.5 border rounded text-xs bg-white text-gray-900 focus:outline-none transition-colors font-medium ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-[#E0E0E0] focus:border-[#F8B800]'
                  }`}
                />
                {emailError && (
                  <p className="text-red-600 text-[11px] mt-1 font-medium">{emailError}</p>
                )}
              </div>

              {/* Role Selector */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {dict.userManagement.addUserModal.roleLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'Super User' | 'Normal User')}
                  className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800] cursor-pointer font-medium"
                >
                  <option value="Normal User">{dict.userManagement.roles.normalUser}</option>
                  <option value="Super User">{dict.userManagement.roles.superUser}</option>
                </select>
              </div>

              {/* Informational Banner */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded p-2.5 text-amber-900 text-[11.5px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F8B800] shrink-0 mt-0.5" />
                <span className="leading-snug">{dict.userManagement.addUserModal.infoNotice}</span>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer text-xs"
                >
                  {dict.userManagement.addUserModal.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-semibold">
                    {dict.userManagement.addUserModal.createBtn}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 5. DELETE USER CONFIRMATION MODAL (IN-THEME GEBOL MODAL) */}
      {userToDelete && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 font-sans`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header - Matches GEBOL Design System */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-[#F8B800]" />
                <h3 className="font-bold text-[15px] tracking-tight">
                  {dict.userManagement.deleteModal.title}
                </h3>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="cursor-pointer p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-gray-800 text-sm leading-relaxed">
                {dict.userManagement.deleteModal.confirmPrompt.replace('{email}', userToDelete.email)}
              </p>

              <div className="bg-gray-50 border border-[#E0E0E0] rounded p-3 text-xs text-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">{dict.userManagement.table.email}:</span>
                  <span className="font-mono font-bold text-gray-900">{userToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{dict.userManagement.table.role}:</span>
                  <span className="font-semibold text-gray-800">
                    {userToDelete.role === 'Super User'
                      ? dict.userManagement.roles.superUser
                      : dict.userManagement.roles.normalUser}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded p-2.5 text-amber-900 text-[11.5px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F8B800] shrink-0 mt-0.5" />
                <span className="leading-snug">{dict.userManagement.deleteModal.warningText}</span>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer text-xs"
                >
                  {dict.userManagement.deleteModal.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-semibold">
                    {dict.userManagement.deleteModal.confirmBtn}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 6. CHANGE ROLE MODAL */}
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
                  <option value="Normal User">{dict.userManagement.roles.normalUser}</option>
                  <option value="Super User">{dict.userManagement.roles.superUser}</option>
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

      {/* 🔹 7. FILTER MODAL */}
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

      {/* 🔹 8. 2-STEP IMPORT USERS MODAL (STRICTLY .XLSX FULL REPLACEMENT) */}
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
                    <button
                      type="button"
                      onClick={handleDownloadSampleTemplate}
                      className="text-xs text-[#ED6C02] hover:text-[#d49b00] underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{dict.userManagement.importModal.downloadTemplate}</span>
                    </button>
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
                      accept=".xlsx"
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
                /* STEP 2: PREVIEW TABLE WITH FULL REPLACEMENT ROW VALIDATION */
                <div className="space-y-4">
                  {/* Notice depicting replacement */}
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
                      {selectedFileName || 'User Dataset.xlsx'}
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
                                  {isDe ? 'Bereit für Ersatz' : 'Ready for replacement'}
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
                        {isDe ? 'Alle Zeilen müssen gültig sein' : 'All records must be valid to replace'}
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
                            ? 'Save button is disabled because mandatory fields are missing, invalid, or no Super User exists'
                            : 'Save and replace all user records'
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
