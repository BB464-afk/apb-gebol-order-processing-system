import React, { useState } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { POQueueTable } from './components/POQueueTable';
import { BusinessObjectsEditor } from './components/BusinessObjectsEditor';
import { LineItemsTable } from './components/LineItemsTable';
import { ValidationPanel } from './components/ValidationPanel';
import { AuditTrailLog } from './components/AuditTrailLog';
import { CustomerMasterView } from './components/CustomerMasterView';
import { ArticleMasterView } from './components/ArticleMasterView';
import { UserManagementView } from './components/UserManagementView';
import { OrderDetailReviewWorkspace } from './components/OrderDetailReviewWorkspace';
import { POIntakeModal } from './components/POIntakeModal';
import { XmlOutputModal } from './components/XmlOutputModal';
import { ErpOutputSection } from './components/ErpOutputSection';
import { GlobalTooltip } from './components/GlobalTooltip';
import { INITIAL_SAMPLE_POS } from './data/sampleOrders';
import { PurchaseOrderRecord, BuyerObject, OrderObject, DeliveryObject, LineItem } from './types/po';
import { getUserProfile, UserRole } from './types/user';
import { ChevronRight, FileCode, Sparkles, AlertCircle, CheckCircle2, Download, Code2 } from 'lucide-react';
import { generateGebolErpXml } from './utils/xmlGenerator';
import { useToast } from './context/ToastContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const toast = useToast();
  const { isThemeB } = useTheme();
  const { dict } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('Superadmin');
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>(INITIAL_SAMPLE_POS);
  const [selectedPoId, setSelectedPoId] = useState<string>(INITIAL_SAMPLE_POS[0].id);
  const [activeNav, setActiveNav] = useState<NavItem>('orders');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Modals
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlPoTarget, setXmlPoTarget] = useState<PurchaseOrderRecord | null>(null);

  // Active PO record
  const currentPo = orders.find((o) => o.id === selectedPoId) || orders[0];
  const needsReviewCount = orders.filter((o) => o.status === 'Needs Review').length;

  // Active User Profile & Permissions
  const userProfile = getUserProfile(userEmail, userRole);
  const isNormalUser = userProfile.role === 'Normal User';

  const handleNewOrdersAdded = (newPos: PurchaseOrderRecord[]) => {
    setOrders((prev) => [...newPos, ...prev]);
    if (newPos.length > 0) {
      setSelectedPoId(newPos[0].id);
    }
    setActiveNav('orders');
    setProcessingSubView('queue');

    // Simulate background AI extraction completing for each newly added order
    newPos.forEach((newOrder, index) => {
      if (newOrder.status === 'Processing') {
        const delay = 3500 + index * 1500;
        setTimeout(() => {
          setOrders((currentOrders) =>
            currentOrders.map((o) => {
              if (o.id === newOrder.id && o.status === 'Processing') {
                return {
                  ...o,
                  status: 'Needs Review',
                  completenessScore: 88,
                  validationRules: [
                    {
                      id: `vr-${o.id}-1`,
                      code: 'VAL-01',
                      category: 'Buyer',
                      severity: 'info',
                      passed: true,
                      message: `Customer ${o.buyer.customerNumber || '148510'} verified in GEBOL Master Account (${o.buyer.companyName})`,
                    },
                    {
                      id: `vr-${o.id}-2`,
                      code: 'VAL-02',
                      category: 'LineItems',
                      severity: 'error',
                      passed: false,
                      message: 'Unmapped Customer Article "91032" (Logistikkosten) - Requires GEBOL Article No. mapping',
                      autoFixAvailable: true,
                    },
                    {
                      id: `vr-${o.id}-3`,
                      code: 'VAL-03',
                      category: 'Delivery',
                      severity: 'info',
                      passed: true,
                      message: 'Destination verified with GEBOL German warehouse route',
                    },
                    {
                      id: `vr-${o.id}-4`,
                      code: 'VAL-04',
                      category: 'Buyer',
                      severity: 'info',
                      passed: true,
                      message: `Valid Tax ID registration ${o.buyer.vatId || 'DE296746712'}`,
                    },
                  ],
                };
              }
              return o;
            })
          );
          toast.success(
            'Order Ready',
            `Order ${newOrder.id} is ready for review.`
          );
        }, delay);
      }
    });
  };

  const handleNewOrderAdded = (newPo: PurchaseOrderRecord) => {
    handleNewOrdersAdded([newPo]);
  };

  const handleUpdateBuyer = (updatedBuyer: BuyerObject) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedPoId) {
          const updated = { ...o, buyer: updatedBuyer };
          return addAuditEntry(
            updated,
            'Manual Edit',
            'Updated Buyer Company & Address details',
            'ManualEdit'
          );
        }
        return o;
      })
    );
  };

  const handleUpdateOrder = (updatedOrder: OrderObject) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedPoId) {
          const updated = { ...o, order: updatedOrder };
          return addAuditEntry(
            updated,
            'Manual Edit',
            'Updated Order Number, Terms or Incoterms',
            'ManualEdit'
          );
        }
        return o;
      })
    );
  };

  const handleUpdateDelivery = (updatedDelivery: DeliveryObject) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedPoId) {
          const updated = { ...o, delivery: updatedDelivery };
          return addAuditEntry(
            updated,
            'Manual Edit',
            'Updated Delivery Destination Address & Date',
            'ManualEdit'
          );
        }
        return o;
      })
    );
  };

  const handleUpdateLineItems = (updatedItems: LineItem[]) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedPoId) {
          const unmappedCount = updatedItems.filter((i) => !i.skuMatched).length;
          const status = unmappedCount === 0 ? 'Ready' : 'Needs Review';
          const score = Math.max(50, 100 - unmappedCount * 15);

          const updatedRules = o.validationRules.map((r) => {
            if (r.category === 'LineItems') {
              return {
                ...r,
                passed: unmappedCount === 0,
                message:
                  unmappedCount === 0
                    ? 'All Line Items resolved to GEBOL SKUs'
                    : `${unmappedCount} Line Item(s) require SKU mapping`,
              };
            }
            return r;
          });

          const updated = {
            ...o,
            lineItems: updatedItems,
            status,
            completenessScore: score,
            validationRules: updatedRules,
          };

          return addAuditEntry(
            updated,
            'Line Item Resolution',
            `Updated line items layout. Unmapped count: ${unmappedCount}`,
            'Resolution'
          );
        }
        return o;
      })
    );
  };

  const handleAutoFixRules = () => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedPoId) {
          // Auto fix unmapped SKUs and missing VAT IDs
          const fixedItems = o.lineItems.map((item) => {
            if (!item.skuMatched || item.gebolArticleNo === 'UNMAPPED-SKU') {
              return {
                ...item,
                gebolArticleNo: 'GEB-70882-M',
                description: 'GEBOL Cut Protect Level D Glove Size 9/M (HPPE Kevlar)',
                contractPrice: 7.20,
                unitPrice: 7.20,
                lineTotal: item.quantity * 7.20,
                skuMatched: true,
                priceVariance: false,
              };
            }
            return item;
          });

          const fixedBuyer = {
            ...o.buyer,
            vatId: o.buyer.vatId || 'ATU28391028',
          };

          const fixedRules = o.validationRules.map((r) => ({ ...r, passed: true }));

          const updated: PurchaseOrderRecord = {
            ...o,
            buyer: fixedBuyer,
            lineItems: fixedItems,
            status: 'Ready',
            completenessScore: 100,
            validationRules: fixedRules,
          };

          return addAuditEntry(
            updated,
            'AI Auto-Resolution',
            'Auto-resolved unmapped customer SKUs & injected default AT UID for Bauhaus/Hornbach',
            'Resolution'
          );
        }
        return o;
      })
    );
  };

  const handleMarkReady = () => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedPoId) {
          const updated: PurchaseOrderRecord = {
            ...o,
            status: 'Ready',
            completenessScore: 100,
          };
          return addAuditEntry(
            updated,
            'Manual Approval',
            'Operator manually verified all rules & approved for ERP XML export',
            'Resolution'
          );
        }
        return o;
      })
    );
  };

  const handleOpenXmlForOrder = (po: PurchaseOrderRecord) => {
    setXmlPoTarget(po);
    setIsXmlModalOpen(true);
  };

  const handleTransmissionSuccess = (poId: string, transId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === poId) {
          const updated: PurchaseOrderRecord = {
            ...o,
            status: 'Exported',
            erpTransmissionId: transId,
            exportedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          return addAuditEntry(
            updated,
            'ERP Direct Transmission',
            `Transmitted XML directly to SAP Gateway (Ref: ${transId})`,
            'Export'
          );
        }
        return o;
      })
    );
  };

  function addAuditEntry(
    po: PurchaseOrderRecord,
    action: string,
    details: string,
    category: 'Extraction' | 'RuleCheck' | 'ManualEdit' | 'Resolution' | 'Export'
  ): PurchaseOrderRecord {
    const newEntry = {
      id: `at-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Operations Supervisor (User)',
      action,
      details,
      category,
    };
    return {
      ...po,
      auditTrail: [newEntry, ...po.auditTrail],
    };
  }

  const [processingSubView, setProcessingSubView] = useState<'queue' | 'detail'>('queue');

  const handleSelectOrder = (po: PurchaseOrderRecord) => {
    setSelectedPoId(po.id);
    setProcessingSubView('detail');
    setActiveNav('orders');
  };

  const handleDeletePo = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (selectedPoId === id && orders.length > 1) {
      setSelectedPoId(orders.find((o) => o.id !== id)?.id || '');
    }
    toast.warning('Order Deleted', `Order ${id} was removed.`);
  };

  const handleLogin = (email: string, role: UserRole) => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
    setActiveNav('orders');
    setProcessingSubView('queue');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setActiveNav('orders');
    setProcessingSubView('queue');
  };

  // Get active navigation title for Header
  const navTitles: Record<NavItem, string> = {
    processing: '',
    orders: dict.nav.orders,
    'customer-master': dict.nav.customerMaster,
    'article-master': dict.nav.articleMaster,
    'user-management': dict.nav.userManagement,
  };

  const handleNavigate = (item: NavItem) => {
    if (isNormalUser && item !== 'orders') {
      return;
    }
    if (!userProfile.canAccessMasterData && (item === 'customer-master' || item === 'article-master' || item === 'user-management')) {
      toast.error('Access Restricted', 'This section is only accessible to Super User.');
      return;
    }
    if (item === 'processing') {
      setProcessingSubView('queue');
    }
    setActiveNav(item);
  };

  const handleNavigateToEntity = (
    nav: 'orders' | 'processing' | 'customer-master' | 'article-master' | 'user-management',
    poId?: string
  ) => {
    if (isNormalUser && nav !== 'orders') {
      if (poId) {
        const found = orders.find((o) => o.id === poId);
        if (found) {
          setSelectedPoId(poId);
          setProcessingSubView('detail');
          setActiveNav('orders');
        }
      }
      return;
    }
    if (nav === 'orders' || nav === 'processing') {
      if (poId) {
        const found = orders.find((o) => o.id === poId);
        if (found) {
          setSelectedPoId(poId);
          setProcessingSubView('detail');
          setActiveNav('orders');
          return;
        }
      }
      setSelectedPoId(null);
      setActiveNav(nav);
      setProcessingSubView('queue');
    } else if (nav === 'user-management') {
      if (!userProfile.canAccessMasterData) {
        toast.error('Access Restricted', 'User Management is only accessible to Super User.');
        return;
      }
      setActiveNav('user-management');
    } else {
      if (!userProfile.canAccessMasterData) {
        toast.error('Access Restricted', 'Master Data is only accessible to Super User.');
        return;
      }
      setActiveNav(nav);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <GlobalTooltip />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F5] font-sans antialiased text-[#1A1A1A] overflow-hidden">
      {/* 1. LEFT SIDEBAR NAVIGATION (FIXED / COLLAPSIBLE) - Only for Superadmin */}
      {!isNormalUser && (
        <Sidebar
          activeNav={activeNav}
          onNavigate={handleNavigate}
          needsReviewCount={needsReviewCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          canAccessMasterData={userProfile.canAccessMasterData}
        />
      )}

      {/* RIGHT MAIN AREA - Clicking anywhere in main workspace collapses the sidebar */}
      <div
        onClick={() => {
          if (!isSidebarCollapsed && !isNormalUser) {
            setIsSidebarCollapsed(true);
          }
        }}
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto cursor-default"
      >
        {/* 2. TOP HEADER (FULL WIDTH) */}
        <Header
          onNewIntake={() => setIsIntakeModalOpen(true)}
          activeNavTitle={navTitles[activeNav]}
          activeNav={activeNav}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          userEmail={userEmail}
          userRole={userRole}
          isNormalUser={isNormalUser}
          onLogout={handleLogout}
          onNavigateToEntity={handleNavigateToEntity}
        />

        {/* 3. DYNAMIC MAIN CONTENT AREA */}
        <main className="flex-1 px-4 pt-2.5 pb-4 sm:px-5 sm:pt-3 sm:pb-5 md:px-6 md:pt-3.5 md:pb-6 space-y-3 w-full">
          {activeNav === 'orders' && processingSubView === 'queue' && (
            <POQueueTable
              orders={orders}
              onSelectPo={(po) => {
                setSelectedPoId(po.id);
                setProcessingSubView('detail');
              }}
              onNewIntake={() => setIsIntakeModalOpen(true)}
              onOpenXmlModal={handleOpenXmlForOrder}
            />
          )}

          {activeNav === 'orders' && processingSubView === 'detail' && (
            <div className="space-y-3.5">
              {/* Breadcrumbs Navigation */}
              <div className="flex items-center justify-between py-0.5 min-h-[36px]">
                <nav className="flex items-center space-x-1.5 text-[13px] text-gray-500 font-medium">
                  <button
                    onClick={() => setProcessingSubView('queue')}
                    title={dict.orderDetail.backToOrders}
                    className="hover:text-[#1A1A1A] hover:underline cursor-pointer transition-colors"
                  >
                    {dict.orderDetail.breadcrumbsOrders}
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[#1A1A1A] font-bold">
                    {dict.orderDetail.breadcrumbsDetail} ({currentPo.sourceFileName || currentPo.id})
                  </span>
                </nav>
              </div>

              {/* Unified Order Detail & Review Workspace */}
              <OrderDetailReviewWorkspace
                po={currentPo}
                onUpdatePo={(updated) =>
                  setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
                }
                onOpenXmlModal={handleOpenXmlForOrder}
                onBack={() => setProcessingSubView('queue')}
                onNavigateToCustomerMaster={() => handleNavigate('customer-master')}
              />
            </div>
          )}

          {activeNav === 'customer-master' && userProfile.canAccessMasterData && <CustomerMasterView />}

          {activeNav === 'article-master' && userProfile.canAccessMasterData && <ArticleMasterView />}

          {activeNav === 'user-management' && userProfile.canAccessMasterData && <UserManagementView />}
        </main>
      </div>

      {/* Modals */}
      <POIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onOrderAdded={handleNewOrderAdded}
        onOrdersAdded={handleNewOrdersAdded}
      />

      <XmlOutputModal
        po={xmlPoTarget}
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        onTransmissionSuccess={handleTransmissionSuccess}
      />

      {/* App-wide Themed Tooltip */}
      <GlobalTooltip />
    </div>
  );
}
