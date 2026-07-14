/**
 * AdminPage — Platform Admin Configuration
 * Design: Neobrutalist Fintech — System configuration, role management, policies, and audit log
 */
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMMK } from "@/data/mockData";
import { Settings, Users, Lock, FileText, ShieldCheck, Key, Globe, Eye, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useView, ViewType as ViewTypeRole, ModuleId } from "@/contexts/ViewContext";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoleMetadata {
  id: ViewTypeRole;
  label: string;
  description: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  module: string;
  timestamp: string;
  details: string;
}

const roleMetadata: RoleMetadata[] = [
  { id: "HR", label: "HR", description: "Employee lifecycle, onboarding, payroll oversight" },
  { id: "Sales", label: "Sales", description: "Corporate portfolio, revenue, client health" },
  { id: "Operations", label: "Operations", description: "Daily operations, disbursements, settlements" },
  { id: "Back Office", label: "Back Office", description: "Transaction processing, verification, reconciliation" },
  { id: "Finance", label: "Finance", description: "GL ledger, accounting entries, financial health" },
  { id: "Risk", label: "Risk", description: "Credit risk, compliance, fraud detection" },
  { id: "Platform Admin", label: "Platform Admin", description: "System configuration, policies, platform health" },
];

const auditLog: AuditLog[] = [
  { id: "AUD-001", action: "Policy Updated", user: "Finance Manager", module: "Fee Builder", timestamp: "2026-07-12 10:30", details: "Late fee rate changed from 0.1% to 0.15% for Skyline Trading" },
  { id: "AUD-002", action: "Employee Verified", user: "Operations Lead", module: "Employees", timestamp: "2026-07-12 09:45", details: "Htet Oo Kyaw — Employment verified and EWA auto-approved" },
  { id: "AUD-003", action: "Budget Allocated", user: "Sales Manager", module: "Budget", timestamp: "2026-07-12 08:00", details: "Golden Harvest Foods budget increased to 15,000,000 MMK" },
  { id: "AUD-004", action: "Company Onboarded", user: "Back Office", module: "Onboarding", timestamp: "2026-07-11 16:00", details: "Golden Harvest Foods moved to ACTIVE status" },
  { id: "AUD-005", action: "Risk Assessment", user: "Risk Analyst", module: "Risk", timestamp: "2026-07-11 14:00", details: "Skyline Trading credit score recalculated to 78" },
];

export function AdminPage() {
  const { allModuleConfigs, rolePermissions, updateRolePermissions } = useView();
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedRole, setSelectedRole] = useState<ViewTypeRole>("HR");

  const viewTypeColumns: ColumnDef<RoleMetadata>[] = [
    {
      id: "label",
      header: "View Type",
      accessor: (rm) => <EnterpriseBadge variant="info" className="bg-[#100841] text-white border-[#100841] font-bold">{rm.label}</EnterpriseBadge>,
      searchString: (rm) => rm.label
    },
    {
      id: "description",
      header: "Description",
      accessor: (rm) => <span className="text-[12px] text-[#4f525d]">{rm.description}</span>,
      searchString: (rm) => rm.description
    },
    {
      id: "modules",
      header: "Accessible Modules",
      accessor: (rm) => (
        <div className="flex flex-wrap gap-1">
          {rolePermissions[rm.id].map(mId => {
            const mod = allModuleConfigs.find(config => config.id === mId);
            return (
              <span key={mId} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-[#4f525d] font-bold uppercase tracking-wider">
                {mod?.label || mId}
              </span>
            );
          })}
        </div>
      )
    }
  ];

  const roleActions: TableAction<RoleMetadata>[] = [
    {
      label: "Configure Modules",
      icon: <Settings className="w-3.5 h-3.5" />,
      onClick: (rm) => {
        setSelectedRole(rm.id);
        setActiveTab("modules");
      }
    }
  ];

  const auditColumns: ColumnDef<AuditLog>[] = [
    {
      id: "id",
      header: "Log ID",
      accessor: (a) => <span className="text-[11px] font-mono text-[#4f525d] font-bold">{a.id}</span>,
      searchString: (a) => a.id
    },
    {
      id: "action",
      header: "Action",
      accessor: (a) => <EnterpriseBadge variant="info">{a.action}</EnterpriseBadge>,
      searchString: (a) => a.action
    },
    {
      id: "user",
      header: "User",
      accessor: (a) => <span className="text-[12px] font-bold text-[#100841]">{a.user}</span>,
      searchString: (a) => a.user
    },
    {
      id: "module",
      header: "Module",
      accessor: (a) => <span className="text-[11px] font-bold text-[#4f525d] uppercase tracking-wider">{a.module}</span>
    },
    {
      id: "details",
      header: "Details",
      accessor: (a) => <span className="text-[11px] text-[#4f525d] max-w-[300px] truncate block">{a.details}</span>,
      searchString: (a) => a.details
    },
    {
      id: "timestamp",
      header: "Timestamp",
      accessor: (a) => <span className="text-[10px] font-mono text-[#868c95]">{a.timestamp}</span>
    }
  ];

  const handleToggleModule = (mId: ModuleId, enabled: boolean) => {
    const currentModules = rolePermissions[selectedRole];
    if (enabled) {
      if (!currentModules.includes(mId)) {
        updateRolePermissions(selectedRole, [...currentModules, mId]);
      }
    } else {
      updateRolePermissions(selectedRole, currentModules.filter(id => id !== mId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Platform Admin Configuration</h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">System configuration, role management, and audit log</p>
        </div>
      </div>

      <LedgerDivider />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="modules"><Settings className="w-3.5 h-3.5" /> Modules</TabsTrigger>
          <TabsTrigger value="roles"><Users className="w-3.5 h-3.5" /> View Types</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="w-3.5 h-3.5" /> Audit Log</TabsTrigger>
          <TabsTrigger value="system"><Globe className="w-3.5 h-3.5" /> System</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="outline-none space-y-4">
          <EnterpriseCard className="p-4 border-[#dfdfdf] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">Module Access Configuration</h3>
                <p className="text-[10px] text-[#4f525d] uppercase mt-1">Select a role to configure accessible modules</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#100841] uppercase">Configuring:</span>
                <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as ViewTypeRole)}>
                  <SelectTrigger className="w-[180px] h-8 text-[11px] font-bold border-[#dfdfdf]">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleMetadata.map(role => (
                      <SelectItem key={role.id} value={role.id} className="text-[11px]">
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allModuleConfigs.map(mod => (
                <div key={mod.id} className="flex items-start gap-3 p-3 rounded-[3px] bg-[#efefff] border border-[#dfdfdf] transition-colors hover:bg-white">
                  <Switch 
                    checked={rolePermissions[selectedRole].includes(mod.id)} 
                    onCheckedChange={(checked) => handleToggleModule(mod.id, checked)}
                    className="mt-1" 
                  />
                  <div>
                    <p className="text-[12px] font-bold text-[#100841]">{mod.label}</p>
                    <p className="text-[10px] text-[#4f525d] mt-0.5 leading-tight">Module ID: {mod.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </EnterpriseCard>
        </TabsContent>

        <TabsContent value="roles" className="outline-none">
          <EnterpriseTable
            data={roleMetadata}
            columns={viewTypeColumns}
            rowKey={(rm) => rm.id}
            actions={roleActions}
            searchPlaceholder="Search view types..."
          />
        </TabsContent>

        <TabsContent value="audit" className="outline-none">
          <EnterpriseTable
            data={auditLog}
            columns={auditColumns}
            rowKey={(a) => a.id}
            searchPlaceholder="Search audit log..."
          />
        </TabsContent>

        <TabsContent value="system" className="outline-none">
          <EnterpriseCard className="p-4 border-[#dfdfdf] shadow-sm space-y-3">
            <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-2">System Configuration</h3>
            <div className="flex items-center justify-between p-3 rounded-[3px] bg-[#efefff] border border-[#dfdfdf]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e3f2fd] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#31d891]" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#100841]">Maker-Checker Enforcement</p>
                  <p className="text-[10px] text-[#4f525d]">Require two-person approval for settlements and write-offs</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-[3px] bg-[#efefff] border border-[#dfdfdf]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#100841]">Auto Approval for Trusted Employees</p>
                  <p className="text-[10px] text-[#4f525d]">Skip manual review for employees with both verifications passed</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-[3px] bg-[#efefff] border border-[#dfdfdf]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fff8e1] flex items-center justify-center">
                  <Key className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#100841]">Late Fee Auto-Calculation</p>
                  <p className="text-[10px] text-[#4f525d]">Automatically calculate late fees based on configured slab rates</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-[3px] bg-[#efefff] border border-[#dfdfdf]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#efefff] flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#100841]">Currency: MMK (Myanmar Kyat)</p>
                  <p className="text-[10px] text-[#4f525d]">Platform default currency for all transactions</p>
                </div>
              </div>
              <EnterpriseBadge variant="neutral" className="text-[9px] font-bold">LOCKED</EnterpriseBadge>
            </div>
          </EnterpriseCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

