import React, { useState, useMemo, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Upload,
  Download,
  Filter,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowLeft,
  Eye,
  Layers,
} from 'lucide-react';

export interface ArticleMasterRecord {
  id: string;
  articleId: string; // Art.Nr.
  description: string; // Description
  ean: string; // EAN
  status?: 'Active' | 'Discontinued' | 'Out of Stock';
}

// 🔹 EXACT INITIAL DATASET PROVIDED IN USER PROMPT (50 articles)
export const INITIAL_ARTICLES_DATASET: ArticleMasterRecord[] = [
  { id: 'art-001', articleId: '004649', description: '°Gebol Verpackungsband 75mm x 500lfm bedruckt', ean: '9002701041949' },
  { id: 'art-002', articleId: '004652', description: '°Füllmaterial Verpackung 90g pro m³ , 0,350m x 350,000m bedruckt', ean: '9002701041932' },
  { id: 'art-003', articleId: '009552', description: 'Gebol Tragetasche Papier grau 23x34x10cm', ean: '9002701018491' },
  { id: 'art-004', articleId: '009553', description: 'Gebol Tragetasche Papier weiß, Magnetverschluss 30 x 34cm', ean: '9002701018507' },
  { id: 'art-005', articleId: '009598', description: 'Gebol Katalog "Work Safety" 2022', ean: '9002701000694' },
  { id: 'art-006', articleId: '009599', description: 'Musterkoffer Vertrieb „GEBOL Work Safety“ (nur Handschuhe)', ean: '9002701033036' },
  { id: 'art-007', articleId: '009599PSA', description: 'Musterkoffer Vertrieb „GEBOL PSA“', ean: '9002701033340' },
  { id: 'art-008', articleId: '009599PSA_HS', description: 'Musterkoffer Vertrieb „GEBOL PSA & Handschuhe“', ean: '9002701033357' },
  { id: 'art-009', articleId: '009600', description: 'Broschüre A6 Conel Handschuhe', ean: '9002701020944' },
  { id: 'art-010', articleId: '019027', description: '°Safety Shoe "EMS" grey EN 345 SI Gr. 41', ean: '4025888003680' },
  { id: 'art-011', articleId: '019028', description: '°Safety Shoe "EMS" grey EN 345 SI Gr. 42', ean: '4025888003697' },
  { id: 'art-012', articleId: '019029', description: '°Safety Shoe "EMS" grey EN 345 SI Gr. 43', ean: '4025888003703' },
  { id: 'art-013', articleId: '019030', description: '°Safety Shoe "EMS" grey EN 345 SI Gr. 44', ean: '4025888003710' },
  { id: 'art-014', articleId: '019031', description: '°Safety Shoe "EMS" grey EN 345 SI Gr. 45', ean: '4025888003727' },
  { id: 'art-015', articleId: '019033', description: '°Safety Shoe "Stralsund" ISO 20345 SI Gr. 41', ean: '4025888145175' },
  { id: 'art-016', articleId: '019034', description: '°Safety Shoe "Stralsund" ISO 20345 SI Gr. 42', ean: '4025888145182' },
  { id: 'art-017', articleId: '019035', description: '°Safety Shoe "Stralsund" ISO 20345 SI Gr. 43', ean: '4025888145199' },
  { id: 'art-018', articleId: '019036', description: '°Safety Shoe "Stralsund" ISO 20345 SI Gr. 44', ean: '4025888145205' },
  { id: 'art-019', articleId: '019037', description: '°Safety Shoe "Stralsund" ISO 20345 SI Gr. 45', ean: '4025888145212' },
  { id: 'art-020', articleId: '100315', description: 'Sprühkleber 400 ml', ean: '9002701100332' },
  { id: 'art-021', articleId: '120100', description: 'x Noverox 750 ml', ean: '7610363025584' },
  { id: 'art-022', articleId: '1242 5369-97_M', description: 'Fleece-Sweatjacke, anthrazit Gr. M', ean: '9002701020265' },
  { id: 'art-023', articleId: '160010125', description: 'Sonderpreis Garten Aufsteller', ean: '2001600101256' },
  { id: 'art-024', articleId: '2850 5231-97_66', description: '°Stretchhose activiq standard, anthrazit Gr. 66', ean: '9002701020340' },
  { id: 'art-025', articleId: '306003', description: '° Malerset Eco 10-teilig', ean: '9002701306031' },
  { id: 'art-026', articleId: '3068025', description: '°Schwarzstahl Handschuh Leder, Gr. 9 / L', ean: '9002701037485' },
  { id: 'art-027', articleId: '3068026', description: '°Schwarzstahl Handschuh Leder, Gr. 10 / XL', ean: '9002701037492' },
  { id: 'art-028', articleId: '3068027', description: '°Schwarzstahl Handschuh Leder, Gr. 11 / XXL', ean: '9002701037508' },
  { id: 'art-029', articleId: '3E_709275', description: 'oHandschuh "Multi Flex" Gr. 7, Let´s do it', ean: '9002701000717' },
  { id: 'art-030', articleId: '3E_709276', description: 'oHandschuh "Multi Flex" Gr. 8, Let´s do it', ean: '9002701000724' },
  { id: 'art-031', articleId: '3E_709277', description: 'oHandschuh "Multi Flex" Gr. 9, Let´s do it', ean: '9002701000731' },
  { id: 'art-032', articleId: '3E_709278', description: 'oHandschuh "Multi Flex" Gr. 10, Let´s do it', ean: '9002701000748' },
  { id: 'art-033', articleId: '3E_709279', description: 'oHandschuh "Multi Flex" Gr. 11, Let´s do it', ean: '900270100755' },
  { id: 'art-034', articleId: '3E0002HR', description: '3e Kopfblende Handschuhe 2.000 x 200 mm', ean: '9002701025499' },
  { id: 'art-035', articleId: '3E0003HR', description: '3e Kopfblende PSA 1.000 x 200 mm', ean: '9002701025505' },
  { id: 'art-036', articleId: '3E0004_RO', description: '3E Kopfblende rumänisch HS 3.000 x 200 mm (3-teilig)', ean: '9002701029114' },
  { id: 'art-037', articleId: '3E0004_SRB', description: 'Infotafel 3e HS 3.000 x 200 mm', ean: '9002701023051' },
  { id: 'art-038', articleId: '3E0005_HU', description: '3e Handschuh Infotafel 3000 x 200 mm', ean: '9002701023068' },
  { id: 'art-039', articleId: '3E0006_HU', description: '3e Handschuh Infotafel 2.000 x 200 mm', ean: '9002701025673' },
  { id: 'art-040', articleId: '3E0006_SRB', description: 'Infotafel 3e HS 2.000 x 200 mm', ean: '9002701025192' },
  { id: 'art-041', articleId: '3E0007_SRB', description: 'Kopfblende 3e Handschuh PSA 1.000 x 200 mm', ean: '9002701025208' },
  { id: 'art-042', articleId: '400499', description: '°Pinselset "Professional Acryl" 3tlg.', ean: '9002701004999' },
  { id: 'art-043', articleId: '400599', description: '°Pinselset "Professional Universal" 3tlg.', ean: '9002701005996' },
  { id: 'art-044', articleId: '402501', description: 'xFlachpinsel Simplex Natur VI 15 mm', ean: '9002701225011' },
  { id: 'art-045', articleId: '403099', description: 'Pinselset "Profi" 5tlg.', ean: '9002701403099' },
  { id: 'art-046', articleId: '404699', description: '°Holzschutzstreicher Set "Eco" 3tlg.', ean: '9002701404690' },
  { id: 'art-047', articleId: '440000', description: 'Display MultiFlex Limited Edition Hero & Moto', ean: '9002701038567' },
  { id: 'art-048', articleId: '440001ADE', description: 'Thekendisplay Winterhandschuhe Profi', ean: '9002701038628' },
  { id: 'art-049', articleId: '440002ADE', description: 'Stripleiste LED Hauben', ean: '9002701038635' },
  { id: 'art-050', articleId: '440003ADE', description: 'Thekendisplay Winterhandschuhe Basic', ean: '9002701038642' },
];

interface ImportRowPreview {
  rawLine: string;
  articleId: string;
  description: string;
  ean: string;
  errors: string[];
  isValid: boolean;
}

export const ArticleMasterView: React.FC = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const { isThemeB } = useTheme();
  const { language, dict } = useLanguage();
  const isDe = language === 'de';
  const [articles, setArticles] = useState<ArticleMasterRecord[]>(INITIAL_ARTICLES_DATASET);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Filter Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterArtNr, setFilterArtNr] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterEanPrefix, setFilterEanPrefix] = useState('');
  const [tempFilterArtNr, setTempFilterArtNr] = useState('');
  const [tempFilterKeyword, setTempFilterKeyword] = useState('');
  const [tempFilterEanPrefix, setTempFilterEanPrefix] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleMasterRecord | null>(null);
  const [inspectArticle, setInspectArticle] = useState<ArticleMasterRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Add / Edit Form State
  const [formArtNr, setFormArtNr] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEan, setFormEan] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Import State
  const [importText, setImportText] = useState('');
  const [importPreviews, setImportPreviews] = useState<ImportRowPreview[]>([]);
  const [hasParsedImport, setHasParsedImport] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search & Filter Articles
  const filteredArticles = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const artTerm = filterArtNr.toLowerCase().trim();
    const keyTerm = filterKeyword.toLowerCase().trim();
    const eanTerm = filterEanPrefix.toLowerCase().trim();

    return articles.filter((a) => {
      const matchesSearch =
        !term ||
        a.articleId.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.ean.toLowerCase().includes(term);

      const matchesArtNr = !artTerm || a.articleId.toLowerCase().includes(artTerm);
      const matchesKeyword = !keyTerm || a.description.toLowerCase().includes(keyTerm);
      const matchesEan = !eanTerm || a.ean.toLowerCase().includes(eanTerm);

      return matchesSearch && matchesArtNr && matchesKeyword && matchesEan;
    });
  }, [articles, searchTerm, filterArtNr, filterKeyword, filterEanPrefix]);

  const activeFilterCount =
    (filterArtNr ? 1 : 0) + (filterKeyword ? 1 : 0) + (filterEanPrefix ? 1 : 0);

  const handleOpenFilterModal = () => {
    setTempFilterArtNr(filterArtNr);
    setTempFilterKeyword(filterKeyword);
    setTempFilterEanPrefix(filterEanPrefix);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setFilterArtNr(tempFilterArtNr);
    setFilterKeyword(tempFilterKeyword);
    setFilterEanPrefix(tempFilterEanPrefix);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilterArtNr('');
    setTempFilterKeyword('');
    setTempFilterEanPrefix('');
  };

  const handleClearAllActiveFilters = () => {
    setFilterArtNr('');
    setFilterKeyword('');
    setFilterEanPrefix('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredArticles.length / rowsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedArticles = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return filteredArticles.slice(start, start + rowsPerPage);
  }, [filteredArticles, safeCurrentPage, rowsPerPage]);

  // Handle Selection
  const isAllPageSelected =
    paginatedArticles.length > 0 &&
    paginatedArticles.every((a) => selectedIds.has(a.id));

  const handleToggleSelectAllPage = () => {
    const next = new Set(selectedIds);
    if (isAllPageSelected) {
      paginatedArticles.forEach((a) => next.delete(a.id));
    } else {
      paginatedArticles.forEach((a) => next.add(a.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (confirm(`Are you sure you want to delete ${count} selected articles?`)) {
      setArticles((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      toast.warning('Articles Deleted', `${count} article record(s) removed successfully.`);
    }
  };

  // Generate 1000+ Sample Dataset
  const handleGenerateLargeDataset = () => {
    const largeList: ArticleMasterRecord[] = [...INITIAL_ARTICLES_DATASET];
    const categories = ['Precision Glove', 'Safety Footwear', 'Thermal Gear', 'Chemical Protection', 'Assembly Glove'];
    
    for (let i = 51; i <= 1050; i++) {
      const artNum = `GEB-${10000 + i}`;
      const eanNum = `90027010${10000 + i}`;
      const cat = categories[i % categories.length];
      largeList.push({
        id: `art-large-${i}`,
        articleId: artNum,
        description: `GEBOL ${cat} Series Pro Model #${i}`,
        ean: eanNum,
        status: 'Active',
      });
    }
    setArticles(largeList);
    setCurrentPage(1);
    toast.success('Catalog Loaded', '1,050 articles loaded successfully.');
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setFormArtNr('');
    setFormDescription('');
    setFormEan('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (record: ArticleMasterRecord) => {
    setEditingArticle(record);
    setFormArtNr(record.articleId);
    setFormDescription(record.description);
    setFormEan(record.ean);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Delete single item
  const handleDeleteItem = (id: string, artNr: string) => {
    if (confirm(`Are you sure you want to delete article "${artNr}"?`)) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      toast.warning('Article Deleted', `Article ${artNr} removed successfully.`);
    }
  };

  // Save Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const artNr = formArtNr.trim();
    const desc = formDescription.trim();
    const ean = formEan.trim();

    if (!artNr) {
      setFormError('Art.Nr. is required.');
      return;
    }
    if (!desc) {
      setFormError('Description is required.');
      return;
    }
    if (!ean) {
      setFormError('EAN is required.');
      return;
    }

    // Validate EAN numeric
    if (!/^\d+$/.test(ean)) {
      setFormError('EAN must contain numeric digits only.');
      return;
    }

    // Check unique Art.Nr.
    const duplicate = articles.find(
      (a) => a.articleId.toLowerCase() === artNr.toLowerCase() && a.id !== editingArticle?.id
    );
    if (duplicate) {
      setFormError(`Art.Nr. "${artNr}" already exists in Article Master.`);
      return;
    }

    if (editingArticle) {
      // Update
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id
            ? { ...a, articleId: artNr, description: desc, ean }
            : a
        )
      );
      toast.success('Article Updated', `Article ${artNr} updated successfully.`);
    } else {
      // Add new
      const newRec: ArticleMasterRecord = {
        id: `art-${Date.now()}`,
        articleId: artNr,
        description: desc,
        ean,
        status: 'Active',
      };
      setArticles([newRec, ...articles]);
      toast.success('Article Created', `Article ${artNr} added successfully.`);
    }

    setIsAddModalOpen(false);
  };

  // Process rows from Excel or CSV
  const processImportRows = (rows: any[][], fileName?: string) => {
    if (!rows || rows.length === 0) {
      alert('File is empty or contains no readable rows.');
      return;
    }

    if (fileName) setSelectedFileName(fileName);

    let startIndex = 0;
    let artNrCol = 0;
    let descCol = 1;
    let eanCol = 2;

    const firstRowStr = rows[0].map((c) => String(c || '').toLowerCase()).join(' ');
    if (firstRowStr.includes('art') || firstRowStr.includes('ean') || firstRowStr.includes('desc')) {
      startIndex = 1;
      const headers = rows[0].map((c) => String(c || '').toLowerCase());
      const fArt = headers.findIndex((h) => h.includes('art'));
      const fDesc = headers.findIndex((h) => h.includes('desc'));
      const fEan = headers.findIndex((h) => h.includes('ean') || h.includes('barcode') || h.includes('gtin'));
      if (fArt !== -1) artNrCol = fArt;
      if (fDesc !== -1) descCol = fDesc;
      if (fEan !== -1) eanCol = fEan;
    }

    const seenInFileArtNrs = new Set<string>();
    const seenInFileEans = new Set<string>();
    const previews: ImportRowPreview[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => !c || String(c).trim() === '')) continue;

      const artNr = String(row[artNrCol] || '').trim();
      const description = String(row[descCol] || '').trim();
      const ean = String(row[eanCol] || '').trim();

      const errors: string[] = [];

      // Mandatory Field 1: Art.Nr.
      if (!artNr) {
        errors.push('Missing mandatory field: Art.Nr.');
      } else {
        const artKey = artNr.toLowerCase();
        if (seenInFileArtNrs.has(artKey)) {
          errors.push(`Duplicate within file: Duplicate Art.Nr. "${artNr}"`);
        } else {
          seenInFileArtNrs.add(artKey);
        }
      }

      // Mandatory Field 2: EAN
      if (!ean) {
        errors.push('Missing mandatory field: EAN');
      } else if (!/^\d+$/.test(ean)) {
        errors.push('Invalid EAN: Must contain numeric digits only');
      } else {
        if (seenInFileEans.has(ean)) {
          errors.push(`Duplicate within file: Duplicate EAN "${ean}"`);
        } else {
          seenInFileEans.add(ean);
        }
      }

      // Description
      if (!description) {
        errors.push('Missing Description');
      }

      previews.push({
        rawLine: row.join(' | '),
        articleId: artNr,
        description,
        ean,
        errors,
        isValid: errors.length === 0,
      });
    }

    setImportPreviews(previews);
    setHasParsedImport(true);
  };

  // Default negative scenario data: missing mandatory Art.Nr. and duplicate in file
  const DEFAULT_ARTICLE_IMPORT_ROWS: any[][] = [
    ['Art.Nr.*', 'Description', 'EAN*'],
    ['709217', 'Gebol Eco Grip Size 9', '9002701709217'],
    ['', 'Gebol Multi Flex Pro Size 10', '9002701709224'],
    ['709219', 'Gebol Master Cut Spezial Size 11', '9002701709231'],
    ['709220', 'Gebol Thermo Grip Winter Size 10', '9002701709248'],
    ['709220', 'Gebol Thermo Grip Winter Size 10', '9002701709248'],
  ];

  // Parse CSV / Text / Excel Import
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
      processImportRows(DEFAULT_ARTICLE_IMPORT_ROWS, selectedFileName || 'Gebol_Article_Master_Import.xlsx');
    }
  };

  // Confirm and Replace Article Master
  const handleConfirmImport = () => {
    const hasInvalid = importPreviews.some((p) => !p.isValid);
    if (hasInvalid || importPreviews.length === 0) {
      alert('Cannot save: Mandatory fields are missing or validation errors exist in the imported dataset.');
      return;
    }

    const newRecords: ArticleMasterRecord[] = importPreviews.map((r, idx) => ({
      id: `art-imp-${Date.now()}-${idx}`,
      articleId: r.articleId,
      description: r.description,
      ean: r.ean,
      status: 'Active',
    }));

    // REPLACES all existing data in Article Master
    setArticles(newRecords);
    setIsImportModalOpen(false);
    setImportText('');
    setImportPreviews([]);
    setHasParsedImport(false);
    setSelectedFileName('');
    toast.success('Article Master Replaced', `All existing data replaced with ${newRecords.length} articles.`);
    addNotification({
      scenario: 'master_data_upload',
      title: 'Master Data Upload',
      message: 'Article Master dataset was successfully updated via Excel import.',
      severity: 'success',
      relatedEntityId: 'Article Master',
      relatedEntityType: 'article_master',
      actionLabel: 'View Master Data',
      actionNav: 'article-master',
    });
  };

  // File Upload handler supporting .xlsx, .xls, and .csv
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
          alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
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

  // Download Sample Excel Template (.xlsx)
  const handleDownloadSampleExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Art.Nr.*', 'Description', 'EAN*'],
      ['709217', 'Gebol Eco Grip Size 9', '9002701709217'],
      ['709218', 'Gebol Multi Flex Pro Size 10', '9002701709224'],
      ['709219', 'Gebol Master Cut Spezial Size 11', '9002701709231'],
      ['709220', 'Gebol Thermo Grip Winter Size 10', '9002701709248'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Articles');
    XLSX.writeFile(wb, 'Gebol_Article_Master_Import_Sample.xlsx');
  };

  // Export Data Logic
  const handleExportData = (type: 'all' | 'filtered' | 'selected') => {
    let dataToExport: ArticleMasterRecord[] = [];
    let filename = 'Gebol_Article_Master_All.csv';

    if (type === 'selected') {
      dataToExport = articles.filter((a) => selectedIds.has(a.id));
      filename = `Gebol_Article_Master_Selected_${selectedIds.size}.csv`;
    } else if (type === 'filtered') {
      dataToExport = filteredArticles;
      filename = 'Gebol_Article_Master_Filtered.csv';
    } else {
      dataToExport = articles;
      filename = 'Gebol_Article_Master_Export.csv';
    }

    if (dataToExport.length === 0) {
      alert('No data available to export.');
      return;
    }

    const csvRows = ['Art.Nr.\tDescription\tEAN'];
    dataToExport.forEach((a) => {
      // Escape tabs or linebreaks
      const safeDesc = a.description.replace(/[\t\r\n]/g, ' ');
      csvRows.push(`${a.articleId}\t${safeDesc}\t${a.ean}`);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* 🔹 HEADER WITH PRIMARY ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-0.5">
        <div>
          <h1 className="text-[22px] font-bold text-[#4f4f4e] tracking-tight page-header-title">{dict.articleMaster.title}</h1>
          <p className="text-[15px] text-[#8f9494] mt-0.5 font-light">
            {dict.articleMaster.subtitle}
          </p>
        </div>

        {/* TOP RIGHT PRIMARY ACTIONS: Search, Filter, Import Icon, Export Icon */}
        <div className="flex items-center gap-2">
          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {isSearchOpen || searchTerm ? (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder={dict.articleMaster.searchPlaceholder}
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
                title="Search articles"
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
            title="Filter Articles"
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

          {/* Import Articles Icon Button */}
          <button
            onClick={() => {
              setSelectedFileName('GEBOL_Article_Master_Import.xlsx');
              setImportPreviews([]);
              setHasParsedImport(false);
              setIsImportModalOpen(true);
            }}
            title="Import Articles"
            className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${
              isThemeB
                ? 'bg-[#262626] border-[#383838] hover:bg-[#333333]'
                : 'bg-white border-[#E0E0E0] hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Export Articles Icon Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Export Articles"
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

      {/* Active Filter Chips Bar */}
      {(filterArtNr || filterKeyword || filterEanPrefix || searchTerm) && (
        <div className="flex items-center flex-wrap gap-1.5 py-1 text-xs">
          <span className="text-gray-400 text-[11px] font-medium mr-1">Active filters:</span>
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
          {filterArtNr && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[11px] font-medium">
              Art.Nr: <strong>{filterArtNr}</strong>
              <button
                type="button"
                onClick={() => {
                  setFilterArtNr('');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove Art.Nr filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterKeyword && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-[11px] font-medium">
              Description: <strong>{filterKeyword}</strong>
              <button
                type="button"
                onClick={() => {
                  setFilterKeyword('');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove keyword filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterEanPrefix && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-[11px] font-medium">
              EAN: <strong>{filterEanPrefix}</strong>
              <button
                type="button"
                onClick={() => {
                  setFilterEanPrefix('');
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove EAN filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAllActiveFilters}
            className="text-xs text-gray-500 hover:text-[#1A1A1A] underline font-semibold cursor-pointer ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 🔹 MAIN CONTENT TABLE */}
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
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} w-44 font-bold`}>{isDe ? 'GEBOL-Art.-Nr.' : 'Art.Nr.'}</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>{isDe ? 'Bezeichnung' : 'Description'}</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} w-48 font-bold`}>{isDe ? 'EAN / Barcode' : 'EAN'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-xs">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#8f9494]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-[#4f4f4e]">No articles found matching &quot;{searchTerm}&quot;</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-xs text-[#ED6C02] hover:underline font-bold cursor-pointer"
                      >
                        Clear search
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((art) => {
                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      {/* Art.Nr. */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-mono font-bold text-[#4f4f4e] text-xs`}>
                        {art.articleId}
                      </td>

                      {/* Description */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-medium text-[#4f4f4e] text-xs`}>
                        {art.description}
                      </td>

                      {/* EAN */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-mono font-medium text-[#4f4f4e] text-xs`}>
                        {art.ean}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 PAGINATION CONTROLS */}
        <div className="bg-[#FAFAFA] border-t border-[#E0E0E0] px-4 py-3 flex items-center justify-end gap-2 text-xs text-gray-600">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] text-gray-700 rounded-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="font-mono font-bold text-[#1A1A1A] px-2 py-0.5 bg-gray-100 rounded-none border border-gray-200">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safeCurrentPage >= totalPages}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] text-gray-700 rounded-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🔹 INSPECT ARTICLE DETAILS MODAL */}
      {inspectArticle && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#262626] text-white border-[#F8B800]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#F8B800]" />
                <div>
                  <h3
                    className={`font-bold text-base tracking-tight ${
                      isThemeB ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Article Details: {inspectArticle.articleId}
                  </h3>
                  <p
                    className={`text-[11px] font-light ${
                      isThemeB ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Master product catalog record and barcode mapping.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectArticle(null)}
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-gray-50 border border-[#E0E0E0] rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">Description</span>
                  <p className="font-semibold text-gray-900 text-sm">{inspectArticle.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">Art.Nr.</span>
                    <span className="font-mono font-bold text-gray-900 bg-white border border-gray-300 px-2 py-0.5 rounded text-xs inline-block">
                      {inspectArticle.articleId}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">EAN Barcode</span>
                    <p className="font-mono font-semibold text-xs text-gray-900">
                      {inspectArticle.ean}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">Status</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded font-semibold text-[11px] inline-block">
                      {inspectArticle.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">Record ID</span>
                    <span className="font-mono text-gray-500 text-[11px]">{inspectArticle.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-3 border-t border-[#E0E0E0] flex items-center justify-end">
              <button
                onClick={() => setInspectArticle(null)}
                className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-1.5 rounded font-bold text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/50' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#262626] text-white border-[#F8B800]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#F8B800]" />
                <h3
                  className={`font-bold text-sm ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {editingArticle ? 'Edit Article Master Record' : 'Add New Article'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-2.5 rounded flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-light text-[#262626] mb-1">
                  Art.Nr. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GEB-50129-L or 004649"
                  value={formArtNr}
                  onChange={(e) => {
                    setFormArtNr(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded font-mono focus:outline-none focus:border-[#F8B800]"
                />
                <p className="text-[10px] text-gray-500 mt-0.5 font-light">Must be unique across Article Master dataset.</p>
              </div>

              <div>
                <label className="block font-light text-[#262626] mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. °Gebol Verpackungsband 75mm x 500lfm bedruckt"
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800]"
                />
              </div>

              <div>
                <label className="block font-light text-[#262626] mb-1">
                  EAN Barcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9002701041949"
                  value={formEan}
                  onChange={(e) => {
                    setFormEan(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded font-mono focus:outline-none focus:border-[#F8B800]"
                />
                <p className="text-[10px] text-gray-500 mt-0.5 font-light">Numeric digits only (e.g. 13-digit EAN-13).</p>
              </div>

              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">{editingArticle ? 'Update Article' : 'Save Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 IMPORT MODAL WITH LIVE PREVIEW & ROW VALIDATION */}
      {isImportModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                  Import Article Master Dataset
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
              {!hasParsedImport ? (
                <>
                  <div>
                    <span className="text-gray-700 font-medium">
                      Select or drag an Excel spreadsheet to parse:
                    </span>
                  </div>

                  {/* File Upload Drop Zone - Entire Dotted Area Clickable */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E0E0E0] bg-gray-50/70 rounded-lg p-8 text-center hover:bg-amber-50/50 hover:border-[#F8B800] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-[#F8B800] mx-auto mb-2" />
                    <p className="font-bold text-gray-800 text-sm">
                      {selectedFileName ? `Selected: ${selectedFileName}` : 'Click here to select an Excel file'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold text-xs">
                      <span>Supported format: Excel (.xlsx, .xls)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 font-light">
                      Mandatory fields: <strong className="text-gray-800">Art.Nr.</strong> and <strong className="text-gray-800">EAN</strong>.
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
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleParseImport}
                      className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded cursor-pointer shadow-xs"
                    >
                      <span className="text-white">Parse & Preview Data</span>
                    </button>
                  </div>
                </>
              ) : (
                /* PREVIEW TABLE WITH ROW VALIDATION */
                <div className="space-y-4">
                  {/* 🔹 NOTICE DEPICTING REPLACEMENT OF ALL EXISTING DATA WITH ASTERISK */}
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 text-xs">
                        * Important Notice: Importing the following data will replace all existing data in Article Master.
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Please review the validated records carefully before proceeding. All currently saved article records ({articles.length}) will be completely replaced upon saving.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between bg-gray-50 p-2.5 rounded border border-[#E0E0E0] gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">
                        Total Parsed: {importPreviews.length}
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                        {importPreviews.filter((p) => p.isValid).length} Valid
                      </span>
                      {importPreviews.some((p) => !p.isValid) && (
                        <span className="text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded border border-red-300">
                          {importPreviews.filter((p) => !p.isValid).length} Invalid
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-gray-500 font-mono">
                      {selectedFileName || 'Excel Dataset'}
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-[#E0E0E0] rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className={`${isThemeB ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-800 border-b border-gray-200'} font-bold text-sm sticky top-0 z-10`}>
                        <tr>
                          <th className="py-2.5 px-3 font-bold">Result</th>
                          <th className="py-2.5 px-3 font-bold">Art.Nr. <span className="text-amber-400">*</span></th>
                          <th className="py-2.5 px-3 font-bold">Description</th>
                          <th className="py-2.5 px-3 font-bold">EAN <span className="text-amber-400">*</span></th>
                          <th className="py-2.5 px-3 font-bold">Validation Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importPreviews.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? 'bg-white hover:bg-gray-50' : 'bg-red-50/70 hover:bg-red-50'}>
                            <td className="py-2.5 px-3">
                              {row.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {row.articleId ? (
                                <span className="font-medium text-gray-900">{row.articleId}</span>
                              ) : (
                                <span className="text-red-600 font-normal">
                                  [Missing Art.Nr.]
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700">{row.description || '—'}</td>
                            <td className="py-2.5 px-3 font-mono">
                              {row.ean ? (
                                <span className="text-gray-900">{row.ean}</span>
                              ) : (
                                <span className="text-red-600 font-normal">
                                  [Missing EAN]
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {row.isValid ? (
                                <span className="text-emerald-700 text-xs font-normal">
                                  Ready
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  {row.errors.map((err, eIdx) => (
                                    <p
                                      key={eIdx}
                                      className="text-red-600 text-xs font-normal"
                                    >
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

                  {/* Validation Error Feedback when Save is disabled */}
                  {importPreviews.some((p) => !p.isValid) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-semibold">
                          Save button is disabled: Mandatory field missing in record(s) and/or duplicate records found in file.
                        </span>
                      </div>
                      <span className="text-[11px] text-red-600 font-mono">
                        All records must be valid to import
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-between items-center pt-3 border-t border-[#E0E0E0] gap-3">
                    <button
                      onClick={() => {
                        setHasParsedImport(false);
                      }}
                      className="px-3.5 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to File Selection</span>
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
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        disabled={importPreviews.some((p) => !p.isValid) || importPreviews.length === 0}
                        title={
                          importPreviews.some((p) => !p.isValid)
                            ? 'Save button is disabled because mandatory fields are missing or duplicate records exist'
                            : 'Save and replace all records in Article Master'
                        }
                        className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span className="text-white">
                          Save and Replace Article Master ({importPreviews.filter((p) => p.isValid).length} Records)
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

      {/* 🔹 EXPORT MODAL */}
      {isExportModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/50' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#262626] text-white border-[#F8B800]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#F8B800]" />
                <h3
                  className={`font-bold text-sm ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Export Article Master Data
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-gray-700 text-sm font-medium leading-relaxed">
                You are about to export all records from Article master.
              </p>

              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExportData('all')}
                  className="px-4 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span className="text-white">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🔹 FILTER POPUP MODAL */}
      {isFilterModalOpen && (
        <div
          onClick={() => setIsFilterModalOpen(false)}
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-none border border-[#E0E0E0] shadow-2xl w-full max-w-lg bg-white text-gray-900 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-3.5 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#161922] text-white border-[#383838]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <h3 className="font-semibold text-[15px]">Filter Articles</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="cursor-pointer p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs bg-white">
              {/* 1. Article Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Article Number (Art.Nr.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 004649, 709217..."
                  value={tempFilterArtNr}
                  onChange={(e) => setTempFilterArtNr(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800]"
                />
              </div>

              {/* 2. Description / Keyword */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Description / Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. Multi Flex, Eco Grip, Safety Shoe..."
                  value={tempFilterKeyword}
                  onChange={(e) => setTempFilterKeyword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800]"
                />
              </div>

              {/* 3. EAN Barcode */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  EAN Barcode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9002701..."
                  value={tempFilterEanPrefix}
                  onChange={(e) => setTempFilterEanPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#F8B800]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-200 bg-gray-50 text-gray-900">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-800 underline cursor-pointer"
              >
                Reset All
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-none border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-5 py-1.5 bg-[#f7b611] hover:bg-[#e2a508] text-black font-bold rounded-none text-xs cursor-pointer shadow-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
