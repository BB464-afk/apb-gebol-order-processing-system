import React, { useState, useMemo, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Building2,
  X,
  Filter,
  Check,
  Upload,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Database,
  ArrowUpDown,
  RefreshCw,
  FileText,
  ArrowLeft
} from 'lucide-react';

export interface CustomerMasterRecord {
  id: string;
  gpNr: string; // Customer ID (GPNr)
  companyName: string;
  country: string;
  gln: string; // GLN (ILN)
  status?: 'Active' | 'Inactive';
  vatId?: string;
  street: string;
  postalCode: string;
  city: string;
  paymentTerms: string;
  incoterms: string;
  erpMappingId: string;
  customerType: 'Wholesale' | 'Retail' | 'DIY Store' | 'Construction' | 'Logistics' | 'General';
}

interface ImportedRowPreview {
  raw: Partial<CustomerMasterRecord>;
  isValid: boolean;
  errors: string[];
}

export const INITIAL_CUSTOMERS: CustomerMasterRecord[] = [
  { id: 'c-001', gpNr: '010259', companyName: 'Lagerhaus Mondsee', postalCode: '5310', city: 'Mondsee', street: 'Guggenbergstraße 1', country: 'AT', gln: '00001', status: 'Active', vatId: 'ATU1025901', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-AT-10259', customerType: 'DIY Store' },
  { id: 'c-002', gpNr: '010476', companyName: 'Odörfer Haustechnik KG', postalCode: '2700', city: 'Wiener Neustadt', street: 'Molkereistraße 8', country: 'AT', gln: '010476', status: 'Active', vatId: 'ATU1047601', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-AT-10476', customerType: 'Wholesale' },
  { id: 'c-003', gpNr: '044597', companyName: 'Werkstier', postalCode: '8435', city: 'Wagna', street: 'Franz-Koringer-Gasse 2', country: 'AT', gln: '044597', status: 'Active', vatId: 'ATU4459701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-AT-44597', customerType: 'Retail' },
  { id: 'c-004', gpNr: '098391', companyName: 'Cordes & Graefe Emden KG', postalCode: '26723', city: 'Emden', street: 'Stedinger Str. 19', country: 'DE', gln: '098391', status: 'Active', vatId: 'DE9839101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-98391', customerType: 'Wholesale' },
  { id: 'c-005', gpNr: '098419', companyName: 'Elting KG', postalCode: '48249', city: 'Dülmen', street: 'Wierlings Esch 1', country: 'DE', gln: '098419', status: 'Active', vatId: 'DE9841901', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-98419', customerType: 'Wholesale' },
  { id: 'c-006', gpNr: '098517', companyName: 'Steiner Haustechnik KG', postalCode: '5101', city: 'Bergheim', street: 'Gottfried-Schenker-Straße 1', country: 'DE', gln: '098517', status: 'Active', vatId: 'DE9851701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-98517', customerType: 'Wholesale' },
  { id: 'c-007', gpNr: '010405', companyName: 'Weyland Haustechnik KG', postalCode: '4782', city: 'St. Florian am Inn', street: 'Haid 26', country: 'AT', gln: '10405', status: 'Active', vatId: 'ATU1040501', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-AT-10405', customerType: 'Wholesale' },
  { id: 'c-008', gpNr: '090756', companyName: 'BAUKING Ostfalen GmbH', postalCode: '38820', city: 'Halberstadt', street: 'Quedlinburger Landstraße 10', country: 'DE', gln: '109008', status: 'Active', vatId: 'DE9075601', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90756', customerType: 'DIY Store' },
  { id: 'c-009', gpNr: '090788', companyName: 'BAUKING Westfalen GmbH', postalCode: '58093', city: 'Hagen', street: 'Tiegelstr. 5', country: 'DE', gln: '109014', status: 'Active', vatId: 'DE9078801', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90788', customerType: 'DIY Store' },
  { id: 'c-010', gpNr: '090800', companyName: 'BAUKING Berlin-Brandenburg GmbH', postalCode: '15366', city: 'Hoppegarten', street: 'Meistergasse 5', country: 'DE', gln: '109027', status: 'Active', vatId: 'DE9080001', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90800', customerType: 'DIY Store' },
  { id: 'c-011', gpNr: '090733', companyName: 'hagebaumarkt Leer GmbH & Co. KG', postalCode: '26789', city: 'Leer', street: 'Ringstr. 17', country: 'DE', gln: '109029', status: 'Active', vatId: 'DE9073301', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90733', customerType: 'Retail' },
  { id: 'c-012', gpNr: '090801', companyName: 'BAUKING Berlin-Brandenburg GmbH', postalCode: '15732', city: 'Eichwalde', street: 'Mozartstraße 24', country: 'DE', gln: '109033', status: 'Active', vatId: 'DE9080101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90801', customerType: 'DIY Store' },
  { id: 'c-013', gpNr: '090716', companyName: 'BAUKING Weser-Ems GmbH 109037', postalCode: '28719', city: 'Bremen', street: 'Bremer Heerstr. 7-9', country: 'DE', gln: '109037', status: 'Active', vatId: 'DE9071601', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90716', customerType: 'DIY Store' },
  { id: 'c-014', gpNr: '090717', companyName: 'BAUKING Weser-Ems GmbH 109055', postalCode: '31582', city: 'Nienburg', street: 'Celler Str. 24', country: 'DE', gln: '109055', status: 'Active', vatId: 'DE9071701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90717', customerType: 'DIY Store' },
  { id: 'c-015', gpNr: '090779', companyName: 'hagebaumarkt Blankenburg GmbH & Co. KG', postalCode: '38889', city: 'Blankenburg', street: 'Lerchenbreite 1', country: 'DE', gln: '109093', status: 'Active', vatId: 'DE9077901', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90779', customerType: 'Retail' },
  { id: 'c-016', gpNr: '090738', companyName: 'BVG Cementmüller Baustoffvertrieb', postalCode: '29633', city: 'Munster', street: 'Wagnerstr. 26-32', country: 'DE', gln: '122020', status: 'Active', vatId: 'DE9073801', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90738', customerType: 'Construction' },
  { id: 'c-017', gpNr: '090741', companyName: 'BVG Cementmüller Baustoffvertrieb', postalCode: '29633', city: 'Munster', street: 'Wagnerstr. 26-32', country: 'DE', gln: '122021', status: 'Active', vatId: 'DE9074101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90741', customerType: 'Construction' },
  { id: 'c-018', gpNr: '090743', companyName: 'BVG Cementmüller Baustoffvertrieb', postalCode: '29640', city: 'Schneverdingen', street: 'Südring 5-7', country: 'DE', gln: '122051', status: 'Active', vatId: 'DE9074301', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90743', customerType: 'Construction' },
  { id: 'c-019', gpNr: '090739', companyName: 'BVG Cementmüller Baustoffvertrieb', postalCode: '21255', city: 'Tostedt', street: 'Friedrich-Vorwerk-Str. 8', country: 'DE', gln: '122070', status: 'Active', vatId: 'DE9073901', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90739', customerType: 'Construction' },
  { id: 'c-020', gpNr: '090792', companyName: 'BAUKING Westfalen GmbH', postalCode: '59348', city: 'Lüdinghausen', street: 'Werkstr. 6', country: 'DE', gln: '144101', status: 'Active', vatId: 'DE9079201', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90792', customerType: 'DIY Store' },
  { id: 'c-021', gpNr: '090758', companyName: 'BAUKING Ostfalen GmbH', postalCode: '04249', city: 'Leipzig', street: 'Gerhard-Ellrodt-Str. 21', country: 'DE', gln: '144104', status: 'Active', vatId: 'DE9075801', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90758', customerType: 'DIY Store' },
  { id: 'c-022', gpNr: '090791', companyName: 'BAUKING Westfalen GmbH', postalCode: '58636', city: 'Iserlohn', street: 'Reiterweg 8', country: 'DE', gln: '144105', status: 'Active', vatId: 'DE9079101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90791', customerType: 'DIY Store' },
  { id: 'c-023', gpNr: '090786', companyName: 'BAUKING Westfalen GmbH', postalCode: '45356', city: 'Essen', street: 'Carolus Magnus-Str. 87', country: 'DE', gln: '144107', status: 'Active', vatId: 'DE9078601', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90786', customerType: 'DIY Store' },
  { id: 'c-024', gpNr: '090785', companyName: 'BAUKING Westfalen GmbH', postalCode: '44803', city: 'Bochum', street: 'Goystr. 18 a-c', country: 'DE', gln: '144108', status: 'Active', vatId: 'DE9078501', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90785', customerType: 'DIY Store' },
  { id: 'c-025', gpNr: '090790', companyName: 'BAUKING Westfalen GmbH', postalCode: '45659', city: 'Recklinghausen', street: 'Blitzkuhlenstr. 103', country: 'DE', gln: '144109', status: 'Active', vatId: 'DE9079001', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90790', customerType: 'DIY Store' },
  { id: 'c-026', gpNr: '090787', companyName: 'BAUKING Westfalen GmbH', postalCode: '42103', city: 'Wuppertal', street: 'Seilerstr. 30-40', country: 'DE', gln: '144111', status: 'Active', vatId: 'DE9078701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90787', customerType: 'DIY Store' },
  { id: 'c-027', gpNr: '090752', companyName: 'BAUKING Ostfalen GmbH', postalCode: '38518', city: 'Gifhorn', street: 'Eyßelheideweg 8', country: 'DE', gln: '148502', status: 'Active', vatId: 'DE9075201', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90752', customerType: 'DIY Store' },
  { id: 'c-028', gpNr: '090771', companyName: 'Bauking Oschersleben GmbH', postalCode: '39387', city: 'Oschersleben', street: 'Schermcker Str. 17', country: 'DE', gln: '148510', status: 'Active', vatId: 'DE9077101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90771', customerType: 'DIY Store' },
  { id: 'c-029', gpNr: '090774', companyName: 'Bauking Schönebeck GmbH & Co. KG', postalCode: '39218', city: 'Schönebeck', street: 'Am Stremsgraben 8', country: 'DE', gln: '148512', status: 'Active', vatId: 'DE9077401', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90774', customerType: 'DIY Store' },
  { id: 'c-030', gpNr: '090754', companyName: 'BAUKING Ostfalen GmbH', postalCode: '39638', city: 'Gardelegen', street: 'Holzweg 72', country: 'DE', gln: '148516', status: 'Active', vatId: 'DE9075401', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90754', customerType: 'DIY Store' },
  { id: 'c-031', gpNr: '090763', companyName: 'BAUKING Ostfalen GmbH', postalCode: '39340', city: 'Haldensleben', street: 'Friedrich-Schmelzer-Str. 4', country: 'DE', gln: '148519', status: 'Active', vatId: 'DE9076301', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90763', customerType: 'DIY Store' },
  { id: 'c-032', gpNr: '090755', companyName: 'BAUKING Ostfalen GmbH', postalCode: '29410', city: 'Salzwedel OT Brietz', street: 'Hauptstr. 2 (An der B 71)', country: 'DE', gln: '148522', status: 'Active', vatId: 'DE9075501', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90755', customerType: 'DIY Store' },
  { id: 'c-033', gpNr: '090777', companyName: 'Bauking Ostfalen GmbH', postalCode: '38644', city: 'Goslar', street: 'Bornhardtstr. 1 A', country: 'DE', gln: '148527', status: 'Active', vatId: 'DE9077701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90777', customerType: 'DIY Store' },
  { id: 'c-034', gpNr: '09081', companyName: 'AGP Bauzentrum GmbH', postalCode: '38855', city: 'Wernigerode', street: 'Dornbergsweg 26', country: 'DE', gln: '148532', status: 'Active', vatId: 'DE908101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90810', customerType: 'Construction' },
  { id: 'c-035', gpNr: '090782', companyName: 'AGP Bauzentrum GmbH', postalCode: '38122', city: 'Braunschweig', street: 'Dieselstraße 3', country: 'DE', gln: '148533', status: 'Active', vatId: 'DE9078201', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90782', customerType: 'Construction' },
  { id: 'c-036', gpNr: '090783', companyName: 'AGP Bauzentrum GmbH', postalCode: '38116', city: 'Braunschweig', street: 'Saarbrückener Straße 264', country: 'DE', gln: '148534', status: 'Active', vatId: 'DE9078301', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90783', customerType: 'Construction' },
  { id: 'c-037', gpNr: '090750', companyName: 'BAUKING Ostfalen GmbH', postalCode: '38350', city: 'Helmstedt', street: 'Magdeburger Berg 3', country: 'DE', gln: '148550', status: 'Active', vatId: 'DE9075001', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90750', customerType: 'DIY Store' },
  { id: 'c-038', gpNr: '090830', companyName: 'BAUKING Weser-Ems GmbH *', postalCode: '49152', city: 'Bad Essen', street: 'Essener Str. 18-20', country: 'DE', gln: '160500', status: 'Active', vatId: 'DE9083001', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90830', customerType: 'DIY Store' },
  { id: 'c-039', gpNr: '090706', companyName: 'BAUKING Weser-Ems GmbH', postalCode: '49152', city: 'Bad Essen', street: 'Essener Str. 18/20', country: 'DE', gln: '160501', status: 'Active', vatId: 'DE9070601', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90706', customerType: 'DIY Store' },
  { id: 'c-040', gpNr: '090708', companyName: 'BAUKING Weser-Ems GmbH 160502', postalCode: '49076', city: 'Osnabrück-Atter', street: 'Benzstr. 9 A', country: 'DE', gln: '160502', status: 'Active', vatId: 'DE9070801', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-DE-90708', customerType: 'DIY Store' },
  { id: 'c-095', gpNr: '010257', companyName: 'Lagerhaus Faistenau', postalCode: '5324', city: 'Faistenau', street: 'Hinterseestraße 62', country: 'AT', gln: '20000', status: 'Active', vatId: 'ATU1025701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-AT-10257', customerType: 'Retail' },
  { id: 'c-096', gpNr: '280511', companyName: 'Merkury Market', postalCode: '38-500', city: 'Sanok', street: 'Krakowska 194', country: 'PL', gln: '2068422554370', status: 'Active', vatId: 'PL28051101', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-PL-280511', customerType: 'Retail' },
  { id: 'c-097', gpNr: '283760', companyName: 'Merkury Market', postalCode: '33-300', city: 'Nowy Sącz', street: 'ul.Wiśniowieckiego 129', country: 'PL', gln: '2068422554394', status: 'Active', vatId: 'PL28376001', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-PL-283760', customerType: 'Retail' },
  { id: 'c-098', gpNr: '280537', companyName: 'Merkury Market', postalCode: '39-200', city: 'Dêbica', street: 'Gumniska 8', country: 'PL', gln: '2068422554400', status: 'Active', vatId: 'PL28053701', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-PL-280537', customerType: 'Retail' },
  { id: 'c-099', gpNr: '283762', companyName: 'Merkury Market', postalCode: '39-300', city: 'Mielec', street: 'ul.Wolności 44', country: 'PL', gln: '2068422554424', status: 'Active', vatId: 'PL28376201', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-PL-283762', customerType: 'Retail' },
  { id: 'c-100', gpNr: '280503', companyName: 'Merkury Market', postalCode: '37-500', city: 'Jaroslaw', street: '3 Maja 120a', country: 'PL', gln: '2068422554431', status: 'Active', vatId: 'PL28050301', paymentTerms: '30 Days Net', incoterms: 'DDP - Delivered Duty Paid', erpMappingId: 'ERP-PL-280503', customerType: 'Retail' },
];

const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria',
  DE: 'Germany',
  PL: 'Poland',
  CH: 'Switzerland',
  IT: 'Italy',
  FR: 'France',
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  HU: 'Hungary',
  SI: 'Slovenia',
};

export const CustomerMasterView: React.FC = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const { isThemeB } = useTheme();
  const [customers, setCustomers] = useState<CustomerMasterRecord[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCountries, setTempSelectedCountries] = useState<string[]>([]);
  const [tempSelectedCities, setTempSelectedCities] = useState<string[]>([]);
  const [filterCitySearch, setFilterCitySearch] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportPreviewModalOpen, setIsImportPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [inspectCustomer, setInspectCustomer] = useState<CustomerMasterRecord | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerMasterRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerMasterRecord | null>(null);

  // Import State
  const [importedRows, setImportedRows] = useState<ImportedRowPreview[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form validation errors state
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CustomerMasterRecord>>({
    gpNr: '',
    companyName: '',
    gln: '',
    country: 'AT',
    city: '',
    street: '',
    postalCode: '',
    vatId: '',
    paymentTerms: '30 Days Net',
    incoterms: 'DDP - Delivered Duty Paid',
    erpMappingId: '',
    customerType: 'Wholesale',
  });

  // Extract unique countries with counts
  const availableCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach((c) => {
      if (c.country) {
        counts[c.country] = (counts[c.country] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .sort()
      .map((code) => ({ code, name: COUNTRY_NAMES[code] || code, count: counts[code] }));
  }, [customers]);

  // Extract unique cities with counts
  const availableCities = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach((c) => {
      if (c.city) {
        counts[c.city] = (counts[c.city] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .sort()
      .map((name) => ({ name, count: counts[name] }));
  }, [customers]);

  // Filter logic: Search by Customer Name, GLN, Customer ID (GPNr), ZIP, City, Street, Country + Multiselect City & Country
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.companyName.toLowerCase().includes(term) ||
        c.gpNr.toLowerCase().includes(term) ||
        c.gln.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.postalCode.toLowerCase().includes(term) ||
        c.street.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term);

      const matchesCountry =
        selectedCountries.length === 0 || selectedCountries.includes(c.country);
      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(c.city);

      return matchesSearch && matchesCountry && matchesCity;
    });
  }, [customers, searchTerm, selectedCountries, selectedCities]);

  const activeFilterCount = selectedCountries.length + selectedCities.length;

  // Temp matching count for filter popup
  const tempMatchingCount = useMemo(() => {
    return customers.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.companyName.toLowerCase().includes(term) ||
        c.gpNr.toLowerCase().includes(term) ||
        c.gln.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.postalCode.toLowerCase().includes(term) ||
        c.street.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term);

      const matchesCountry =
        tempSelectedCountries.length === 0 || tempSelectedCountries.includes(c.country);
      const matchesCity =
        tempSelectedCities.length === 0 || tempSelectedCities.includes(c.city);

      return matchesSearch && matchesCountry && matchesCity;
    }).length;
  }, [customers, searchTerm, tempSelectedCountries, tempSelectedCities]);

  const handleOpenFilterModal = () => {
    setTempSelectedCountries(selectedCountries);
    setTempSelectedCities(selectedCities);
    setFilterCitySearch('');
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedCountries(tempSelectedCountries);
    setSelectedCities(tempSelectedCities);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempSelectedCountries([]);
    setTempSelectedCities([]);
  };

  const handleClearAllActiveFilters = () => {
    setSelectedCountries([]);
    setSelectedCities([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Paginated dataset
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Handle select all on current page
  const isAllPageSelected =
    paginatedCustomers.length > 0 &&
    paginatedCustomers.every((c) => selectedCustomerIds.includes(c.id));

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = paginatedCustomers.map((c) => c.id);
      setSelectedCustomerIds(selectedCustomerIds.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedCustomers.map((c) => c.id);
      setSelectedCustomerIds(Array.from(new Set([...selectedCustomerIds, ...pageIds])));
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Form for Adding New Customer
  const handleOpenAddModal = () => {
    setFormData({
      gpNr: '',
      companyName: '',
      gln: '',
      country: 'AT',
      city: '',
      street: '',
      postalCode: '',
      vatId: '',
      paymentTerms: '30 Days Net',
      incoterms: 'DDP - Delivered Duty Paid',
      erpMappingId: `ERP-AT-${Math.floor(10000 + Math.random() * 90000)}`,
      customerType: 'Wholesale',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Form for Editing Existing Customer
  const handleOpenEditModal = (cust: CustomerMasterRecord) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
    setFormError(null);
  };

  // Save / Validate New Customer
  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const gpNr = (formData.gpNr || '').trim();
    const gln = (formData.gln || '').trim();
    const companyName = (formData.companyName || '').trim();

    if (!gpNr || !gln || !companyName) {
      setFormError('Please fill in required fields: Customer ID (GPNr), Company Name, and GLN.');
      return;
    }

    // Validate GLN format (e.g. numeric)
    if (!/^\d+$/.test(gln)) {
      setFormError('Invalid GLN format. GLN must contain only numeric digits.');
      return;
    }

    // Validate Unique Customer ID (GPNr)
    if (customers.some((c) => c.gpNr.toLowerCase() === gpNr.toLowerCase())) {
      setFormError(`Customer ID (GPNr) "${gpNr}" already exists in the system. Customer IDs must be unique.`);
      return;
    }

    // Check duplicate GLN warning
    if (customers.some((c) => c.gln === gln)) {
      setFormError(`GLN "${gln}" is already assigned to another customer master record.`);
      return;
    }

    const created: CustomerMasterRecord = {
      id: `cust-${Date.now()}`,
      gpNr,
      companyName,
      country: (formData.country || 'AT').toUpperCase(),
      gln,
      vatId: (formData.vatId || 'N/A').trim(),
      street: (formData.street || '').trim(),
      postalCode: (formData.postalCode || '').trim(),
      city: (formData.city || '').trim(),
      paymentTerms: (formData.paymentTerms || '30 Days Net').trim(),
      incoterms: (formData.incoterms || 'DDP - Delivered Duty Paid').trim(),
      erpMappingId: formData.erpMappingId || `ERP-${formData.country}-${gpNr}`,
      customerType: formData.customerType || 'Wholesale',
    };

    setCustomers([created, ...customers]);
    setIsAddModalOpen(false);
    toast.success('Customer Created', `${companyName} added successfully.`);
  };

  // Save / Update Edited Customer
  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setFormError(null);

    const gpNr = (formData.gpNr || '').trim();
    const gln = (formData.gln || '').trim();
    const companyName = (formData.companyName || '').trim();

    if (!gpNr || !gln || !companyName) {
      setFormError('Please fill in required fields: Customer ID (GPNr), Company Name, and GLN.');
      return;
    }

    if (!/^\d+$/.test(gln)) {
      setFormError('Invalid GLN format. GLN must contain only numeric digits.');
      return;
    }

    // Check unique GPNr excluding current editing record
    if (customers.some((c) => c.id !== editingCustomer.id && c.gpNr.toLowerCase() === gpNr.toLowerCase())) {
      setFormError(`Customer ID (GPNr) "${gpNr}" belongs to another record. Unique ID required.`);
      return;
    }

    const updatedRecord: CustomerMasterRecord = {
      ...editingCustomer,
      gpNr,
      gln,
      companyName,
      country: (formData.country || 'AT').toUpperCase(),
      vatId: (formData.vatId || '').trim(),
      street: (formData.street || '').trim(),
      postalCode: (formData.postalCode || '').trim(),
      city: (formData.city || '').trim(),
      paymentTerms: (formData.paymentTerms || '30 Days Net').trim(),
      incoterms: (formData.incoterms || 'DDP - Delivered Duty Paid').trim(),
      erpMappingId: formData.erpMappingId || editingCustomer.erpMappingId,
      customerType: formData.customerType || editingCustomer.customerType,
    };

    setCustomers(customers.map((c) => (c.id === editingCustomer.id ? updatedRecord : c)));
    setEditingCustomer(null);
    toast.success('Customer Updated', `${companyName} updated successfully.`);
  };

  // Delete Record
  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    if (confirm('Are you sure you want to remove this record from Customer Master?')) {
      setCustomers(customers.filter((c) => c.id !== id));
      setSelectedCustomerIds(selectedCustomerIds.filter((item) => item !== id));
      toast.warning('Customer Deleted', 'Customer removed successfully.');
    }
  };

  // Export Customer CSV
  const handleExportData = (exportType: 'all' | 'filtered' | 'selected') => {
    let datasetToExport: CustomerMasterRecord[] = [];
    if (exportType === 'selected') {
      datasetToExport = customers.filter((c) => selectedCustomerIds.includes(c.id));
    } else if (exportType === 'filtered') {
      datasetToExport = filteredCustomers;
    } else {
      datasetToExport = customers;
    }

    if (datasetToExport.length === 0) {
      toast.error('Export Failed', 'No records available to export.');
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Customer ID (GPNr)',
      'Customer Name',
      'ZIP Code',
      'City',
      'Street',
      'Country',
      'ILN',
      'Customer Type',
      'ERP Mapping ID',
      'Payment Terms',
      'Incoterms',
    ];

    const csvRows = [headers.join(',')];
    datasetToExport.forEach((c) => {
      const row = [
        `"${c.gpNr}"`,
        `"${c.companyName.replace(/"/g, '""')}"`,
        `"${c.postalCode}"`,
        `"${c.city.replace(/"/g, '""')}"`,
        `"${c.street.replace(/"/g, '""')}"`,
        `"${c.country}"`,
        `"${c.gln}"`,
        `"${c.customerType || 'General'}"`,
        `"${c.erpMappingId || ''}"`,
        `"${c.paymentTerms}"`,
        `"${c.incoterms}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GEBOL_Customer_Master_${exportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  // Download Sample Import Template Excel (.xlsx)
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['GPNr*', 'Company Name', 'ZIP Code', 'City', 'Street', 'Country', 'ILN*', 'Customer Type', 'ERP Mapping ID'],
      ['099001', 'Musterbau Handels GmbH', '1010', 'Wien', 'Kärntner Straße 15', 'AT', '9001230009900', 'Wholesale', 'ERP-AT-99001'],
      ['099002', 'Bauwaren Direct SE', '80331', 'München', 'Marienplatz 4', 'DE', '4001230009902', 'Retail', 'ERP-DE-99002'],
      ['099003', 'Alpen Handwerk KG', '6020', 'Innsbruck', 'Maria-Theresien-Str. 8', 'AT', '9001230009903', 'Wholesale', 'ERP-AT-99003'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'GEBOL_Customer_Master_Import_Template.xlsx');
  };

  // Positive flow default dataset: all mandatory fields (GPNr, ILN) and addresses valid
  const DEFAULT_CUSTOMER_IMPORT_ROWS: any[][] = [
    ['GPNr*', 'Company Name', 'ZIP Code', 'City', 'Street', 'Country', 'ILN*', 'Customer Type', 'ERP Mapping ID'],
    ['099001', 'Musterbau Handels GmbH', '1010', 'Wien', 'Kärntner Straße 15', 'AT', '9001230009900', 'Wholesale', 'ERP-AT-99001'],
    ['099002', 'Bauwaren Direct SE', '80331', 'München', 'Marienplatz 4', 'DE', '4001230009902', 'Retail', 'ERP-DE-99002'],
    ['099003', 'Alpen Handwerk KG', '6020', 'Innsbruck', 'Maria-Theresien-Str. 8', 'AT', '9001230009903', 'Wholesale', 'ERP-AT-99003'],
    ['099004', 'Technik Express GmbH', '4020', 'Linz', 'Landstraße 10', 'AT', '9001230009904', 'Wholesale', 'ERP-AT-99004'],
    ['099005', 'Steiermark Baubedarf KG', '8010', 'Graz', 'Herrengasse 2', 'AT', '9001230009905', 'Retail', 'ERP-AT-99005'],
  ];

  // Process rows helper for both Excel and CSV
  const processRows = (rows: any[][], fileName: string) => {
    setImportFileName(fileName);
    if (!rows || rows.length <= 1) {
      alert('File is empty or contains only a header row.');
      return;
    }

    const headerCols = rows[0].map((c) => String(c || '').toLowerCase().trim());
    let gpNrIdx = headerCols.findIndex((h) => h.includes('gp') || h.includes('cust') || h.includes('id'));
    let nameIdx = headerCols.findIndex((h) => h.includes('name') || h.includes('comp'));
    let zipIdx = headerCols.findIndex((h) => h.includes('zip') || h.includes('postal') || h.includes('plz'));
    let cityIdx = headerCols.findIndex((h) => h.includes('city') || h.includes('ort'));
    let streetIdx = headerCols.findIndex((h) => h.includes('street') || h.includes('straße') || h.includes('str'));
    let countryIdx = headerCols.findIndex((h) => h.includes('country') || h.includes('land'));
    let ilnIdx = headerCols.findIndex((h) => h.includes('iln') || h.includes('gln'));

    if (gpNrIdx === -1) gpNrIdx = 0;
    if (nameIdx === -1) nameIdx = 1;
    if (zipIdx === -1) zipIdx = 2;
    if (cityIdx === -1) cityIdx = 3;
    if (streetIdx === -1) streetIdx = 4;
    if (countryIdx === -1) countryIdx = 5;
    if (ilnIdx === -1) ilnIdx = 6;

    const parsedPreviews: ImportedRowPreview[] = [];
    const seenInFileGpNrs = new Set<string>();
    const seenInFileIlns = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols || cols.every((c) => !c || String(c).trim() === '')) continue;

      const gpNr = String(cols[gpNrIdx] || '').trim();
      const companyName = String(cols[nameIdx] || '').trim();
      const postalCode = String(cols[zipIdx] || '').trim();
      const city = String(cols[cityIdx] || '').trim();
      const street = String(cols[streetIdx] || '').trim();
      const country = String(cols[countryIdx] || 'AT').trim().toUpperCase();
      const iln = String(cols[ilnIdx] || '').trim();

      const rawRecord: Partial<CustomerMasterRecord> = {
        gpNr,
        companyName,
        postalCode,
        city,
        street,
        country: country || 'AT',
        gln: iln,
        customerType: (cols[7] as any) || 'Wholesale',
        erpMappingId: cols[8] ? String(cols[8]).trim() : `ERP-${country || 'AT'}-${gpNr}`,
        paymentTerms: '30 Days Net',
        incoterms: 'DDP - Delivered Duty Paid',
      };

      const errors: string[] = [];

      // MANDATORY FIELD 1: GPNr
      if (!gpNr) {
        errors.push('Missing mandatory field: GPNr');
      } else {
        const gpKey = gpNr.toLowerCase();
        if (seenInFileGpNrs.has(gpKey)) {
          errors.push(`Duplicate within file: Duplicate GPNr "${gpNr}"`);
        } else {
          seenInFileGpNrs.add(gpKey);
        }
      }

      // MANDATORY FIELD 2: ILN
      if (!iln) {
        errors.push('Missing mandatory field: ILN');
      } else if (!/^\d+$/.test(iln)) {
        errors.push('Invalid ILN format (numeric digits only)');
      } else {
        if (seenInFileIlns.has(iln)) {
          errors.push(`Duplicate within file: Duplicate ILN "${iln}"`);
        } else {
          seenInFileIlns.add(iln);
        }
      }

      // Company Name
      if (!companyName) {
        errors.push('Missing Customer Name');
      }

      parsedPreviews.push({
        raw: rawRecord,
        isValid: errors.length === 0,
        errors,
      });
    }

    setImportedRows(parsedPreviews);
  };

  // Process File Upload for Import Preview & Validation
  const handleFileUpload = (file: File) => {
    setImportFileName(file.name);
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
          processRows(rows, file.name);
        } catch (err) {
          alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (!text) return;
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const rows = lines.map((line) => {
          return line.includes('\t')
            ? line.split('\t')
            : line.includes(';')
            ? line.split(';')
            : line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim());
        });
        processRows(rows, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleParseAndPreviewData = () => {
    if (importedRows.length === 0) {
      processRows(DEFAULT_CUSTOMER_IMPORT_ROWS, 'GEBOL_Customer_Master_Import.xlsx');
    }
    setIsImportModalOpen(false);
    setIsImportPreviewModalOpen(true);
  };

  // Commit valid imported rows (REPLACES existing data in Customer Master)
  const handleConfirmImport = () => {
    const hasErrors = importedRows.some((r) => !r.isValid);
    if (hasErrors || importedRows.length === 0) {
      alert('Cannot save: Mandatory fields are missing or validation errors exist in the imported dataset.');
      return;
    }

    const newRecords: CustomerMasterRecord[] = importedRows.map((r, idx) => ({
      id: `cust-imp-${Date.now()}-${idx}`,
      gpNr: r.raw.gpNr || '',
      companyName: r.raw.companyName || '',
      gln: r.raw.gln || '',
      country: r.raw.country || 'AT',
      postalCode: r.raw.postalCode || '',
      city: r.raw.city || '',
      street: r.raw.street || '',
      vatId: r.raw.vatId || 'N/A',
      paymentTerms: r.raw.paymentTerms || '30 Days Net',
      incoterms: r.raw.incoterms || 'DDP - Delivered Duty Paid',
      erpMappingId: r.raw.erpMappingId || `ERP-${r.raw.country || 'AT'}-${r.raw.gpNr}`,
      customerType: r.raw.customerType || 'Wholesale',
    }));

    // REPLACES all existing data in Customer Master
    setCustomers(newRecords);
    setIsImportModalOpen(false);
    setIsImportPreviewModalOpen(false);
    setImportedRows([]);
    setImportFileName('');
    toast.success('Customer Master Replaced', `All existing data replaced with ${newRecords.length} customer records.`);
    addNotification({
      scenario: 'master_data_upload',
      title: 'Master Data Upload',
      message: 'Customer Master dataset was successfully updated via Excel import.',
      severity: 'success',
      relatedEntityId: 'Customer Master',
      relatedEntityType: 'customer_master',
      actionLabel: 'View Master Data',
      actionNav: 'customer-master',
    });
  };

  return (
    <div className="space-y-3.5">
      {/* 🔹 HEADER WITH TITLE & TOP-RIGHT ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-0.5">
        <div>
          <h1 className="text-[22px] font-bold text-[#4f4f4e] tracking-tight page-header-title">Customer Master</h1>
          <p className="text-[15px] text-[#8f9494] mt-0.5 font-light">
            Manage customer master data used for purchase order processing and customer identification.
          </p>
        </div>

        {/* Top right actions: Search, Filter, Import Icon, Export Icon, Add Customer */}
        <div className="flex items-center gap-2">
          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {isSearchOpen || searchTerm ? (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-48 sm:w-60 pl-8 pr-7 py-1.5 border border-[#E0E0E0] rounded text-xs bg-white text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F8B800] transition-all shadow-2xs"
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
                title="Search customers"
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
            title="Filter by City and Country"
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

          {/* Import Customers Icon Button */}
          <button
            onClick={() => {
              processRows(DEFAULT_CUSTOMER_IMPORT_ROWS, 'GEBOL_Customer_Master_Import.xlsx');
              setIsImportModalOpen(true);
            }}
            title="Import Customers"
            className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${
              isThemeB
                ? 'bg-[#262626] border-[#383838] hover:bg-[#333333]'
                : 'bg-white border-[#E0E0E0] hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Export Customers Icon Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Export Customers"
            className={`p-2 rounded border transition-colors cursor-pointer shadow-2xs flex items-center justify-center ${
              isThemeB
                ? 'bg-[#262626] border-[#383838] hover:bg-[#333333]'
                : 'bg-white border-[#E0E0E0] hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
          </button>

          {/* Add Customer Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Add Customer</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {(selectedCountries.length > 0 || selectedCities.length > 0 || searchTerm) && (
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
          {selectedCountries.map((ct) => (
            <span
              key={ct}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[11px] font-medium"
            >
              Country: <strong>{ct}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedCountries((prev) => prev.filter((c) => c !== ct));
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove country filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedCities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-[11px] font-medium"
            >
              City: <strong>{city}</strong>
              <button
                type="button"
                onClick={() => {
                  setSelectedCities((prev) => prev.filter((c) => c !== city));
                  setCurrentPage(1);
                }}
                className="hover:text-red-700 cursor-pointer ml-0.5 p-0.5"
                title="Remove city filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAllActiveFilters}
            className="text-xs text-gray-500 hover:text-[#1A1A1A] underline font-semibold cursor-pointer ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 🔹 MAIN READ-ONLY TABLE LISTING */}
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
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>GPNr.</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>Company Name</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>ZIP Code</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>City</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>Street</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>Country</th>
                <th className={`${isThemeB ? 'py-1.5 px-3' : 'py-2 px-3'} font-bold`}>ILN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-xs">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8f9494]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold text-[#4f4f4e]">No customer master records found</p>
                      <p className="text-xs text-[#8f9494]">
                        Try adjusting your search query or reset active filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      {/* 1. GPNr */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-mono font-bold text-[#4f4f4e] text-xs`}>
                        {cust.gpNr}
                      </td>

                      {/* 2. Company Name */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-bold text-[#4f4f4e] text-xs`}>
                        {cust.companyName}
                      </td>

                      {/* 3. ZIP Code */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-mono font-medium text-[#8f9494] text-xs`}>
                        {cust.postalCode || '—'}
                      </td>

                      {/* 4. City */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-medium text-[#8f9494] text-xs`}>
                        {cust.city || '—'}
                      </td>

                      {/* 5. Street */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-medium text-[#8f9494] text-xs`}>
                        {cust.street || '—'}
                      </td>

                      {/* 6. Country */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-mono font-medium text-[#4f4f4e] text-xs`}>
                        {cust.country}
                      </td>

                      {/* 7. ILN */}
                      <td className={`${isThemeB ? 'py-1 px-3' : 'py-1.5 px-3'} font-mono font-medium text-[#4f4f4e] text-xs`}>
                        {cust.gln}
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
            <span>Previous</span>
          </button>

          <span className="font-mono font-bold text-[#1A1A1A] px-2 py-0.5 bg-gray-100 rounded-none border border-gray-200">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-2.5 py-1 bg-white border border-[#E0E0E0] rounded-none font-semibold text-xs text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🔹 CUSTOMER DETAIL SCREEN / MODAL (3 Sections: Basic Info, Address, Integration Details) */}
      {inspectCustomer && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400/40'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#F8B800]" />
                <div>
                  <h3
                    className={`font-bold text-base tracking-tight ${
                      isThemeB ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Customer Master Details
                  </h3>
                  <p
                    className={`text-[11px] font-mono ${
                      isThemeB ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    System Record ID: {inspectCustomer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectCustomer(null)}
                className={`font-bold p-1 rounded cursor-pointer transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* SECTION 1: Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-[#E0E0E0] space-y-3 font-sans">
                <div className="font-bold text-[#1A1A1A] text-sm border-b border-gray-200 pb-2 capitalize">
                  1. Basic Information
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 sm:col-span-1">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Company Name
                    </span>
                    <strong className="text-sm text-[#1A1A1A] font-semibold block">
                      {inspectCustomer.companyName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Customer ID (GPNr)
                    </span>
                    <strong className="text-xs bg-white px-2 py-1 rounded border border-gray-300 inline-block text-[#1A1A1A]">
                      {inspectCustomer.gpNr}
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      GLN (ILN)
                    </span>
                    <p className="text-xs font-semibold text-[#1A1A1A]">
                      {inspectCustomer.gln}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Address */}
              <div className="bg-gray-50 p-4 rounded-lg border border-[#E0E0E0] space-y-3 font-sans">
                <div className="font-bold text-[#1A1A1A] text-sm border-b border-gray-200 pb-2 capitalize">
                  2. Address
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Country
                    </span>
                    <p className="text-xs font-semibold text-gray-900">
                      {inspectCustomer.country}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      City
                    </span>
                    <p className="font-medium text-gray-800">{inspectCustomer.city || '—'}</p>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Zip Code
                    </span>
                    <p className="font-medium text-gray-800">{inspectCustomer.postalCode || '—'}</p>
                  </div>

                  <div className="col-span-3">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Street Address
                    </span>
                    <p className="font-medium text-gray-800 bg-white p-2 rounded border border-gray-200">
                      {inspectCustomer.street || 'Address not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Integration Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-[#E0E0E0] space-y-3 font-sans">
                <div className="font-bold text-[#1A1A1A] text-sm border-b border-gray-200 pb-2 capitalize">
                  3. Integration Details
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      ERP Mapping ID
                    </span>
                    <strong className="font-mono text-xs bg-white px-2 py-1 rounded border border-gray-300 block text-[#1A1A1A]">
                      {inspectCustomer.erpMappingId || 'ERP-AUTO'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Customer Type
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-semibold inline-block">
                      {inspectCustomer.customerType || 'Wholesale'}
                    </span>
                  </div>



                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Payment Terms
                    </span>
                    <p className="font-medium text-gray-800">{inspectCustomer.paymentTerms}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                      Incoterms
                    </span>
                    <p className="font-medium text-gray-800">{inspectCustomer.incoterms}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-3 border-t border-[#E0E0E0] flex items-center justify-between">
              <button
                onClick={() => {
                  const target = inspectCustomer;
                  setInspectCustomer(null);
                  handleOpenEditModal(target);
                }}
                className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#1A1A1A] font-bold border border-amber-300 rounded text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>

              <button
                onClick={() => setInspectCustomer(null)}
                className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-1.5 rounded font-bold text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 ADD & EDIT CONTROLLED FORM MODAL */}
      {(isAddModalOpen || editingCustomer) && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4 font-sans`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            {/* Header */}
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`font-bold text-[15px] tracking-tight font-sans ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {editingCustomer ? 'Edit Customer Master Record' : 'Add New Customer Master Record'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
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

            <form
              onSubmit={editingCustomer ? handleSaveEditCustomer : handleSaveNewCustomer}
              className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs font-sans"
            >
              {/* Validation alert banner */}
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-800 flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="font-semibold text-xs font-sans">{formError}</span>
                </div>
              )}

              {/* 1. Basic Information */}
              <div className="border border-[#E0E0E0] rounded-lg p-4 space-y-3 bg-gray-50/50">
                <div className="font-bold text-[#1A1A1A] text-xs capitalize border-b border-gray-200 pb-2 font-sans">
                  1. Basic Information
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Odörfer Haustechnik KG"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-white font-medium font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">
                      Customer ID (GPNr) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 010476"
                      value={formData.gpNr || ''}
                      onChange={(e) => setFormData({ ...formData, gpNr: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">
                      GLN (ILN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 010476"
                      value={formData.gln || ''}
                      onChange={(e) => setFormData({ ...formData, gln: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Address */}
              <div className="border border-[#E0E0E0] rounded-lg p-4 space-y-3 bg-gray-50/50">
                <div className="font-bold text-[#1A1A1A] text-xs capitalize border-b border-gray-200 pb-2 font-sans">
                  2. Address
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">Country</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      placeholder="AT, DE, PL..."
                      value={formData.country || 'AT'}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded uppercase focus:outline-none focus:border-[#F8B800] bg-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">Zip Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 2700"
                      value={formData.postalCode || ''}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Wiener Neustadt"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-white font-sans"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block font-semibold text-gray-700 mb-1 font-sans">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Molkereistraße 8"
                      value={formData.street || ''}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#F8B800] bg-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white font-sans">{editingCustomer ? 'Update Customer' : 'Save Customer Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 IMPORT CUSTOMERS MODAL */}
      {isImportModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`font-bold text-[15px] tracking-tight ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Import Customer Master Dataset
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedRows([]);
                  setImportFileName('');
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

            <div className="p-6 space-y-5 text-xs">
              <div>
                <span className="text-gray-700 font-medium">
                  Select or drag an Excel spreadsheet to parse:
                </span>
              </div>

              {/* File Upload Box - Entire Dotted Area Clickable */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E0E0E0] hover:border-[#F8B800] hover:bg-amber-50/50 rounded-lg p-8 bg-gray-50/50 text-center transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-10 h-10 text-[#F8B800] mx-auto mb-2" />
                <p className="font-bold text-sm text-[#1A1A1A]">
                  {importFileName ? `Selected: ${importFileName}` : 'Click here to select an Excel file'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold text-xs">
                  <span>Supported format: Excel (.xlsx, .xls)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Mandatory fields: <strong className="text-gray-800">ILN</strong> and <strong className="text-gray-800">GPNr</strong>.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-gray-100 px-6 py-3.5 border-t border-[#E0E0E0] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedRows([]);
                  setImportFileName('');
                }}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-bold rounded cursor-pointer text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleParseAndPreviewData}
                className="px-5 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
              >
                <span className="text-white">Parse and Preview Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 IMPORT PREVIEW MODAL */}
      {isImportPreviewModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-amber-400'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`font-bold text-[15px] ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Import Preview & Validation
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportPreviewModalOpen(false);
                  setImportedRows([]);
                  setImportFileName('');
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

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* 🔹 NOTICE DEPICTING REPLACEMENT OF ALL EXISTING DATA WITH ASTERISK */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-xs">
                    * Important Notice: Importing the following data will replace all existing data in Customer Master.
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Please review the validated records carefully before proceeding. All currently saved customer records ({customers.length}) will be completely replaced upon saving.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-[#E0E0E0]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1A1A1A]">File: {importFileName}</span>
                  <span className="text-gray-500">• {importedRows.length} total rows parsed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold font-mono text-xs">
                    {importedRows.filter((r) => r.isValid).length} Valid
                  </span>
                  {importedRows.some((r) => !r.isValid) && (
                    <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded font-bold font-mono text-xs">
                      {importedRows.filter((r) => !r.isValid).length} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-[#E0E0E0] rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead
                    className={`sticky top-0 font-bold text-sm z-10 ${
                      isThemeB ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-800 border-b border-gray-200'
                    }`}
                  >
                    <tr>
                      <th className="py-2.5 px-3 font-bold">GPNr. <span className="text-amber-400">*</span></th>
                      <th className="py-2.5 px-3 font-bold">Company Name</th>
                      <th className="py-2.5 px-3 font-bold">ZIP Code</th>
                      <th className="py-2.5 px-3 font-bold">City</th>
                      <th className="py-2.5 px-3 font-bold">Street</th>
                      <th className="py-2.5 px-3 font-bold">Country</th>
                      <th className="py-2.5 px-3 font-bold">ILN <span className="text-amber-400">*</span></th>
                      <th className="py-2.5 px-3 text-center font-bold">Validation Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {importedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'bg-white hover:bg-gray-50' : 'bg-red-50/50'}>
                        <td className="py-2.5 px-3 font-mono text-[#1A1A1A]">
                          {row.raw.gpNr ? (
                            <span className="font-medium text-gray-900">{row.raw.gpNr}</span>
                          ) : (
                            <span className="text-red-600 font-normal">
                              [Missing GPNr]
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#1A1A1A]">{row.raw.companyName || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-700">{row.raw.postalCode || '—'}</td>
                        <td className="py-2.5 px-3 text-gray-800">{row.raw.city || '—'}</td>
                        <td className="py-2.5 px-3 text-gray-800">{row.raw.street || '—'}</td>
                        <td className="py-2.5 px-3 font-mono">{row.raw.country || 'AT'}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {row.raw.gln ? (
                            <span className="text-gray-900">{row.raw.gln}</span>
                          ) : (
                            <span className="text-red-600 font-normal">
                              [Missing ILN]
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.isValid ? (
                            <span className="text-emerald-700 text-xs font-normal">
                              Ready
                            </span>
                          ) : (
                            <div className="space-y-0.5 text-left">
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
              {importedRows.some((p) => !p.isValid) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-xs text-red-800">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-semibold">
                      Save button is disabled: Mandatory field missing in record(s) and/or validation errors exist in file.
                    </span>
                  </div>
                  <span className="text-[11px] text-red-600 font-mono">
                    All records must be valid to import
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-100 px-6 py-3.5 border-t border-[#E0E0E0] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsImportPreviewModalOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsImportPreviewModalOpen(false);
                    setImportedRows([]);
                    setImportFileName('');
                  }}
                  className="px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-bold rounded cursor-pointer text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={importedRows.some((r) => !r.isValid) || importedRows.length === 0}
                  title={
                    importedRows.some((r) => !r.isValid)
                      ? 'Save button is disabled because mandatory fields are missing or validation errors exist'
                      : 'Save and replace all records in Customer Master'
                  }
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-[#f7b611] hover:bg-[#e2a508] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">
                    Save and Replace Customer Master ({importedRows.filter((r) => r.isValid).length} Records)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 EXPORT CUSTOMERS MODAL */}
      {isExportModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#262626] text-white border-[#F8B800]'
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`font-bold text-[15px] tracking-tight ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Export Customer Master
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                title="Close Export Modal"
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-gray-700 text-sm font-medium leading-relaxed">
                You are about to export all records from Customer master.
              </p>

              <div className="pt-3 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  title="Cancel export"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExportData('all')}
                  title="Export all customer records to CSV file"
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

      {/* 🔹 DELETE CUSTOMER CONFIRMATION MODAL */}
      {deletingCustomer && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`p-4 flex items-center justify-between border-b ${
                isThemeB
                  ? 'bg-[#1A1A1A] text-white border-red-500'
                  : 'bg-red-50 text-gray-900 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3
                  className={`font-bold text-base ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Delete Customer Master Record
                </h3>
              </div>
              <button
                onClick={() => setDeletingCustomer(null)}
                title="Close delete modal"
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <p className="text-gray-800 text-sm leading-relaxed font-medium">
                Are you sure you want to delete customer record for <strong className="text-[#1A1A1A]">{deletingCustomer.companyName}</strong> (GPNr / ID: <strong className="font-mono">{deletingCustomer.gpNr}</strong>)?
              </p>
              <p className="text-gray-500 text-xs">This action cannot be undone and will permanently remove the record from Customer Master.</p>
            </div>

            <div className="bg-gray-100 px-6 py-3 border-t border-[#E0E0E0] flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingCustomer(null)}
                title="Cancel deletion"
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-bold rounded text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id));
                  setSelectedCustomerIds((prev) => prev.filter((id) => id !== deletingCustomer.id));
                  setDeletingCustomer(null);
                }}
                title="Confirm deletion"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 FILTER POPUP MODAL (CITY & COUNTRY MULTISELECT) */}
      {isFilterModalOpen && (
        <div
          className={`fixed inset-0 z-50 ${
            isThemeB ? 'bg-black/60 backdrop-blur-xs' : 'bg-black/25 backdrop-blur-[2px]'
          } flex items-center justify-center p-4`}
        >
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-2xl w-full max-w-2xl overflow-visible animate-in fade-in zoom-in-95 duration-150 flex flex-col">
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
                <h3
                  className={`font-semibold text-[15px] ${
                    isThemeB ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Filter Customers
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className={`cursor-pointer p-1 rounded transition-colors ${
                  isThemeB
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Searchable MultiSelect Dropdowns with light background & dark values */}
            <div className="p-6 space-y-4 text-xs bg-white flex-1 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Country Dropdown */}
                <div>
                  <SearchableMultiSelect
                    isFullWidth
                    forceLightMode={true}
                    label="Country"
                    options={availableCountries.map((c) => ({
                      label: c.name !== c.code ? `${c.code} (${c.name})` : c.code,
                      value: c.code,
                      count: c.count,
                    }))}
                    selectedValues={tempSelectedCountries}
                    onChange={(newVal) => setTempSelectedCountries(newVal)}
                    searchPlaceholder="Search country..."
                  />
                </div>

                {/* 2. City Dropdown */}
                <div>
                  <SearchableMultiSelect
                    isFullWidth
                    forceLightMode={true}
                    label="City"
                    options={availableCities.map((c) => ({
                      label: c.name,
                      value: c.name,
                      count: c.count,
                    }))}
                    selectedValues={tempSelectedCities}
                    onChange={(newVal) => setTempSelectedCities(newVal)}
                    searchPlaceholder="Search city..."
                  />
                </div>
              </div>
            </div>

            {/* Footer with Reset and Apply Buttons */}
            <div className="bg-gray-100 px-6 py-3.5 border-t border-[#E0E0E0] flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-gray-500 hover:text-gray-800 underline font-medium cursor-pointer"
                >
                  Reset Selections
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-medium">
                  {tempMatchingCount} customer{tempMatchingCount === 1 ? '' : 's'} matching
                </span>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 font-semibold rounded cursor-pointer text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-5 py-2 bg-[#f7b611] hover:bg-[#e2a508] text-white font-semibold rounded cursor-pointer text-xs shadow-xs"
                >
                  <span className="text-white">Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
