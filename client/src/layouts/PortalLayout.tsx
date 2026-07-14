/**
 * PortalLayout — Enterprise Shell
 * SAP Fiori-Inspired: Grouped Side Navigation | Structured Toolbar | Main Content Area
 * Design: Enterprise Fintech — Navy (#100841) + Teal (#31d891) | Sharp corners | Structured layout
 */
import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useView, type ViewType, type ModuleId } from "@/contexts/ViewContext";
import { MODULE_REGISTRY } from "@/contexts/ViewContext";
import {
  Grid3X3, Building2, Users, ArrowRightLeft, Repeat, ShieldCheck,
  BookOpen, Settings, Wallet, ShieldAlert, BarChart3, FileSpreadsheet,
  Bell, SlidersHorizontal, Workflow, Trash2, LayoutTemplate, AlertCircle,
  Menu, ChevronLeft, ChevronRight, Languages, Lock, ChevronDown,
  Zap, Landmark, Layers, Gauge, LogOut, UserCheck, Briefcase,
  Coins, Scale, FileText, PieChart, Percent, Sliders
} from "lucide-react";
import { generateProjectZip } from "@/utils/projectZip";
import { Package } from "lucide-react";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { TransactionsPage } from "@/pages/transactions/TransactionsPage";
import { RepaymentPage } from "@/pages/repayment/RepaymentPage";
import { SettlementPage } from "@/pages/settlement/SettlementPage";
import { CircleLedgerPage } from "@/pages/circle-ledger/CircleLedgerPage";
import { FeeBuilderPage } from "@/pages/fee-builder/FeeBuilderPage";
import { BudgetPage } from "@/pages/budget/BudgetPage";
import { RiskPage } from "@/pages/risk/RiskPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { PayrollPage } from "@/pages/payroll/PayrollPage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";
import { AdminPage } from "@/pages/admin/AdminPage";
import { WorkflowPage } from "@/pages/workflow/WorkflowPage";
import { WriteOffPage } from "@/pages/writeoff/WriteOffPage";
import { FormCreatorPage } from "@/pages/form-creator/FormCreatorPage";
import { ErrorsPage } from "@/pages/errors/ErrorsPage";
import { DisbursementPage } from "@/pages/disbursement/DisbursementPage";
import { BankIntegrationPage } from "@/pages/bank-integration/BankIntegrationPage";
import { ServiceCatalogPage } from "@/pages/service-catalog/ServiceCatalogPage";
import { FeeHierarchyPage } from "@/pages/fee-hierarchy/FeeHierarchyPage";
import { EmployeeGroupsPage } from "@/pages/employee-groups/EmployeeGroupsPage";
import { LimitationsPage } from "@/pages/limitations/LimitationsPage";
import { DocumentationPage } from "@/pages/documentation/DocumentationPage";

const ICON_MAP: Record<string, React.ElementType> = {
  "grid-3x3": Grid3X3, "building-2": Building2, "users": Users,
  "arrow-right-left": ArrowRightLeft, "repeat": Repeat, "shield-check": ShieldCheck,
  "book-open": BookOpen, "settings": Settings, "wallet": Wallet, "shield-alert": ShieldAlert,
  "bar-chart-3": BarChart3, "file-spreadsheet": FileSpreadsheet, "bell": Bell,
  "sliders-horizontal": SlidersHorizontal, "workflow": Workflow, "trash-2": Trash2,
  "layout-template": LayoutTemplate, "alert-circle": AlertCircle,
  "zap": Zap, "landmark": Landmark, "layers": Layers, "gauge": Gauge,
  "log-out": LogOut, "user-check": UserCheck, "briefcase": Briefcase,
  "coins": Coins, "scale": Scale, "file-text": FileText,
  "pie-chart": PieChart, "percent": Percent, "users-round": Users, "sliders": Sliders,
};

const MODULE_PAGES: Record<ModuleId, React.FC> = {
  "dashboard": DashboardPage, "onboarding": OnboardingPage, "employees": EmployeesPage,
  "transactions": TransactionsPage, "repayment": RepaymentPage, "settlement": SettlementPage,
  "circle-ledger": CircleLedgerPage, "fee-builder": FeeBuilderPage, "budget": BudgetPage,
  "risk": RiskPage, "reports": ReportsPage, "payroll": PayrollPage,
  "notifications": NotificationsPage, "admin": AdminPage, "workflow": WorkflowPage,
  "writeoff": WriteOffPage, "form-creator": FormCreatorPage, "errors": ErrorsPage,
  "disbursement": DisbursementPage, "bank-integration": BankIntegrationPage,
  "service-catalog": ServiceCatalogPage, "fee-hierarchy": FeeHierarchyPage,
  "employee-groups": EmployeeGroupsPage, "limitations": LimitationsPage, "documentation": DocumentationPage,
};

const VIEW_COLORS: Record<ViewType, string> = {
  "HR": "bg-[#2e7d32]", "Sales": "bg-[#1565c0]", "Operations": "bg-[#e65100]",
  "Back Office": "bg-[#546e7a]", "Finance": "bg-[#6a1b9a]", "Risk": "bg-[#c62828]",
  "Platform Admin": "bg-[#00838f]",
};

const VIEW_ICONS: Record<ViewType, React.ElementType> = {
  "HR": Users, "Sales": Wallet, "Operations": ShieldCheck,
  "Back Office": BookOpen, "Finance": FileSpreadsheet, "Risk": ShieldAlert,
  "Platform Admin": Settings,
};

// Group modules by category for SAP Fiori side navigation
const NAV_GROUPS = [
  {
    label: "Overview",
    modules: ["dashboard"],
  },
  {
    label: "Workforce",
    modules: ["onboarding", "employees", "employee-groups"],
  },
  {
    label: "Operations",
    modules: ["transactions", "disbursement", "repayment", "settlement"],
  },
  {
    label: "Finance",
    modules: ["circle-ledger", "fee-builder", "fee-hierarchy", "service-catalog", "payroll"],
  },
  {
    label: "Risk & Budget",
    modules: ["budget", "risk", "limitations", "writeoff"],
  },
  {
    label: "Integration",
    modules: ["bank-integration", "workflow"],
  },
  {
    label: "Reporting",
    modules: ["reports", "form-creator", "errors"],
  },
  {
    label: "System",
    modules: ["notifications", "documentation", "admin"],
  },
];

export function PortalLayout() {
  const { view, setView, modules, lang, setLang, hasPermission } = useView();
  const [collapsed, setCollapsed] = useState(false);
  const [, setLocation] = useLocation();
  const [, matchParams] = useRoute<{ module: string }>("/module/:module");
  const currentModuleId = (matchParams?.module as ModuleId) || "dashboard";

  // If no permission, fallback to dashboard
  const safeModuleId = hasPermission(currentModuleId) ? currentModuleId : "dashboard";
  const PageComponent = MODULE_PAGES[safeModuleId] || DashboardPage;

  // Find the module info from MODULE_REGISTRY
  const activeModule = MODULE_REGISTRY.find(m => m.id === safeModuleId) || modules[0];

  const navigateTo = (moduleId: ModuleId) => {
    setLocation(`/module/${moduleId}`);
  };

  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);

  const handleDownloadZip = async () => {
    setZipDownloading(true);
    try {
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ewa-prototype-2026.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP download failed:", err);
    } finally {
      setZipDownloading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#ffffff] overflow-hidden font-sans">
      {/* ===== SIDEBAR — SAP Fiori Side Navigation ===== */}
      <aside
        className={`flex flex-col bg-[#100841] text-white transition-all duration-200 shrink-0 border-r border-white/5 ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        {/* Logo Area */}
        <Link href="/" className={`flex items-center gap-2.5 px-3 py-4 border-b border-white/8 hover:bg-white/5 transition-colors cursor-pointer ${collapsed ? "justify-center px-0" : ""}`}>
          <div className="w-8 h-8 rounded-[3px] bg-[#31d891]/20 flex items-center justify-center shrink-0 border border-[#31d891]/30">
            <img src="https://ewa-group.com/wp-content/uploads/2020/07/EWA_Presentation.pdf-image-006-removebg-preview.png" alt="EWA" className="w-6 h-6 object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-[11px] font-bold tracking-wide leading-tight text-white/90">EWA 3.0</h1>
              <p className="text-[9px] text-white/40 tracking-wider uppercase">Enterprise Platform</p>
            </div>
          )}
        </Link>

        {/* Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group) => {
            const visibleModules = group.modules
              .map(id => modules.find(m => m.id === id))
              .filter(Boolean) as typeof modules;
            if (visibleModules.length === 0) return null;

            return (
              <div key={group.label} className="mb-1">
                {!collapsed && (
                  <div className="px-3 pt-2 pb-1">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{group.label}</p>
                  </div>
                )}
                {visibleModules.map((mod) => {
                  const Icon = ICON_MAP[mod.icon] || Grid3X3;
                  const isActive = currentModuleId === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => navigateTo(mod.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-[7px] text-[11px] transition-all duration-100 border-l-2 ${
                        isActive
                          ? "bg-[#31d891]/15 text-[#31d891] border-l-[#31d891] font-semibold"
                          : "text-white/55 hover:bg-white/[0.04] hover:text-white/80 border-l-transparent"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                      title={collapsed ? mod.label : undefined}
                    >
                      <Icon className={`w-[15px] h-[15px] shrink-0 ${isActive ? "text-[#31d891]" : "text-white/40"}`} />
                      {!collapsed && <span className="truncate">{mod.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-white/8 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-[3px] text-white/40 hover:bg-white/5 hover:text-white/70 text-[9px] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            {!collapsed && <span className="uppercase tracking-widest">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Bar — SAP Fiori Shell Header */}
        <header className="h-[44px] bg-white border-b border-[#dfdfdf] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setCollapsed(!collapsed)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#31d891]/50" />
              <div>
                <h2 className="text-[11px] font-bold text-[#100841] uppercase tracking-wide">{activeModule.label}</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Type Indicator */}
            <span className="text-[9px] text-[#4f525d] uppercase tracking-widest">View as</span>
            <div className="relative">
              <button
                onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                onBlur={() => setTimeout(() => setViewDropdownOpen(false), 150)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] font-semibold text-white shadow-sm ${VIEW_COLORS[view]}`}
              >
                {(() => {
                  const Icon = VIEW_ICONS[view];
                  return <Icon className="w-3 h-3" />;
                })()}
                <span>{view}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>
              {viewDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#dfdfdf] p-1 min-w-[180px] z-50">
                  <p className="px-2.5 py-1.5 text-[8px] font-bold text-[#868c95] uppercase tracking-widest border-b border-[#efefff] mb-0.5">Command View</p>
                  {(["HR", "Sales", "Operations", "Back Office", "Finance", "Risk", "Platform Admin"] as ViewType[]).map(v => (
                    <button
                      key={v}
                      onClick={() => { setView(v); setViewDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] text-[10px] transition-colors ${
                        view === v ? "bg-[#100841]/5 font-semibold text-[#100841]" : "hover:bg-[#efefff] text-[#4f525d]"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${VIEW_COLORS[v]}`} />
                      <span>{v}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-[#dfdfdf]" />

            {/* ZIP Download Button */}
            <button
              onClick={handleDownloadZip}
              disabled={zipDownloading}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-white bg-[#31d891] hover:bg-[#111111] disabled:opacity-50 rounded-[3px] transition-colors uppercase tracking-wider shadow-sm"
              title="Download all project files as ZIP"
            >
              <Package className="w-3 h-3" />
              {zipDownloading ? "..." : "ZIP"}
            </button>

            <div className="w-px h-5 bg-[#dfdfdf]" />

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "my" : "en")}
              className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#4f525d] hover:text-[#100841] rounded-[3px] hover:bg-[#efefff] transition-colors uppercase tracking-wider"
            >
              <Languages className="w-3 h-3" />
              {lang === "en" ? "EN" : "MM"}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-5">
            <PageComponent />
          </div>
        </main>
      </div>
    </div>
  );
}
