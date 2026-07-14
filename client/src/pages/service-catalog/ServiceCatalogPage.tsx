/**
 * ServiceCatalogPage — Transaction Types, Service Classification (txn/non-txn/cos), Fee/Discount Mapping
 * Design: Enterprise Fintech — Service Registry pattern
 */
import { useState } from "react";
import { Layers, Plus, Eye, Download, Info, ArrowRightLeft } from "lucide-react";
import {
  EnterpriseCard,
  EnterpriseKpiCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  TableAction,
  EnterpriseKpiCard as KpiCard
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

type ServiceType = "TXN" | "NON_TXN" | "COS";
type FeeMappingType = "PERCENT" | "FLAT" | "TIERED";
type EntityRole = "SENDER" | "RECEIVER" | "AGGREGATOR" | "DEPOSITOR" | "BENEFICIARY";

interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  glPosting: boolean;
  category: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  feeMappings: FeeMapping[];
  applicableTo: EntityRole[];
}

interface FeeMapping {
  id: string;
  feeName: string;
  feeCode: string;
  feeType: FeeMappingType;
  value: number;
  discountId: string | null;
  aggregator: string | null;
}

const services: Service[] = [
  { id: "SVC-001", code: "EWA_DISBURSE", name: "EWA Disbursement", description: "Employee wage advance disbursement to bank/wallet", serviceType: "TXN", glPosting: true, category: "Disbursement", status: "ACTIVE", feeMappings: [
    { id: "FM-001", feeName: "Service Fee", feeCode: "FEE-SVC-001", feeType: "PERCENT", value: 1.5, discountId: "DISC-001", aggregator: "AGG-KBZ" },
    { id: "FM-002", feeName: "Bank Charge", feeCode: "FEE-BANK-001", feeType: "FLAT", value: 1500, discountId: null, aggregator: null },
  ], applicableTo: ["SENDER", "RECEIVER", "DEPOSITOR", "BENEFICIARY"] },
  { id: "SVC-002", code: "EWA_REPAYMENT", name: "EWA Repayment", description: "Payroll deduction repayment processing", serviceType: "TXN", glPosting: true, category: "Repayment", status: "ACTIVE", feeMappings: [
    { id: "FM-003", feeName: "Processing Fee", feeCode: "FEE-SVC-002", feeType: "PERCENT", value: 0.5, discountId: null, aggregator: null },
  ], applicableTo: ["SENDER", "RECEIVER"] },
  { id: "SVC-003", code: "CORP_ONBOARD", name: "Corporate Onboarding", description: "Company registration and KYC process", serviceType: "NON_TXN", glPosting: false, category: "Onboarding", status: "ACTIVE", feeMappings: [
    { id: "FM-004", feeName: "Setup Fee", feeCode: "FEE-SETUP-001", feeType: "FLAT", value: 50000, discountId: "DISC-002", aggregator: null },
  ], applicableTo: ["SENDER"] },
  { id: "SVC-004", code: "EMP_ONBOARD", name: "Employee Onboarding", description: "Employee registration, verification, and budget allocation", serviceType: "NON_TXN", glPosting: false, category: "Onboarding", status: "ACTIVE", feeMappings: [], applicableTo: ["RECEIVER"] },
  { id: "SVC-005", code: "CASHOUT_OTC", name: "OTC Cash Out", description: "Agent-based cash withdrawal at authorized locations", serviceType: "TXN", glPosting: true, category: "Cash Out", status: "ACTIVE", feeMappings: [
    { id: "FM-005", feeName: "Agent Commission", feeCode: "FEE-AGT-001", feeType: "PERCENT", value: 2.0, discountId: null, aggregator: "AGG-OTC" },
  ], applicableTo: ["SENDER", "RECEIVER", "AGGREGATOR"] },
  { id: "SVC-006", code: "BUDGET_ALLOC", name: "Budget Allocation", description: "Company budget creation and allocation to departments/groups", serviceType: "COS", glPosting: false, category: "Budget", status: "ACTIVE", feeMappings: [], applicableTo: ["SENDER"] },
  { id: "SVC-007", code: "SETTLEMENT_VERIFY", name: "Settlement Verification", description: "Maker-checker verification of settlement batches", serviceType: "TXN", glPosting: true, category: "Settlement", status: "ACTIVE", feeMappings: [
    { id: "FM-006", feeName: "Verification Fee", feeCode: "FEE-VER-001", feeType: "FLAT", value: 500, discountId: null, aggregator: null },
  ], applicableTo: ["SENDER", "RECEIVER"] },
  { id: "SVC-008", code: "WRITE_OFF", name: "Write-Off Processing", description: "Loss provisioning and write-off approval workflow", serviceType: "TXN", glPosting: true, category: "Write-Off", status: "ACTIVE", feeMappings: [], applicableTo: ["SENDER"] },
];

const formatMMK = (amount: number) => {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(amount) + " MMK";
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export function ServiceCatalogPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const columns: ColumnDef<Service>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (s) => <span className="font-mono font-bold text-[#100841]">{s.id}</span>,
      searchString: (s) => s.id
    },
    {
      id: "code",
      header: "Code",
      accessor: (s) => <span className="text-[11px] font-mono font-bold text-slate-400">{s.code}</span>,
      searchString: (s) => s.code
    },
    {
      id: "name",
      header: "Service Name",
      accessor: (s) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{s.name}</p>
          <p className="text-[9px] text-[#4f525d] line-clamp-1">{s.description}</p>
        </div>
      ),
      searchString: (s) => `${s.name} ${s.description}`
    },
    {
      id: "type",
      header: "Type",
      accessor: (s) => (
        <EnterpriseBadge variant={s.serviceType === "TXN" ? "info" : s.serviceType === "NON_TXN" ? "warning" : "neutral"}>
          {s.serviceType}
        </EnterpriseBadge>
      )
    },
    {
      id: "gl",
      header: "GL Post",
      accessor: (s) => <EnterpriseBadge variant={s.glPosting ? "success" : "neutral"}>{s.glPosting ? "YES" : "NO"}</EnterpriseBadge>
    },
    {
      id: "category",
      header: "Category",
      accessor: (s) => <span className="text-[11px] text-[#4f525d] font-medium">{s.category}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (s) => <EnterpriseBadge variant={s.status === "ACTIVE" ? "success" : "error"}>{s.status}</EnterpriseBadge>
    }
  ];

  const tableActions: TableAction<Service>[] = [
    { label: "View Details", icon: <Eye className="w-3.5 h-3.5" />, onClick: (s) => setSelectedService(s) },
    { label: "Edit Service", icon: <Info className="w-3.5 h-3.5" />, onClick: (s) => console.log("Edit", s.id) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Service Registry</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
              Service classification, fee mapping & entity role assignment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#100841] text-white">
            <Plus className="w-3.5 h-3.5" /> Define Service
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-5 gap-2">
        <EnterpriseKpiCard label="Total Services" value={services.length} icon={<Layers className="w-3 h-3 text-slate-400" />} />
        <EnterpriseKpiCard label="Transaction (TXN)" value={services.filter(s => s.serviceType === "TXN").length} icon={<ArrowRightLeft className="w-3 h-3 text-blue-500" />} />
        <EnterpriseKpiCard label="Non-TXN" value={services.filter(s => s.serviceType === "NON_TXN").length} icon={<Info className="w-3 h-3 text-amber-500" />} />
        <EnterpriseKpiCard label="Config (COS)" value={services.filter(s => s.serviceType === "COS").length} icon={<Layers className="w-3 h-3 text-purple-500" />} />
        <EnterpriseKpiCard label="Active" value={services.filter(s => s.status === "ACTIVE").length} icon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />} />
      </div>

      <Tabs defaultValue="registry" className="w-full">
        <TabsList>
          <TabsTrigger value="registry">Service Registry</TabsTrigger>
          <TabsTrigger value="detail">Service Detail</TabsTrigger>
          <TabsTrigger value="fees">Fee Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-4 outline-none">
          <EnterpriseTable
            data={services}
            columns={columns}
            rowKey={(s) => s.id}
            actions={tableActions}
            selectable={true}
            searchPlaceholder="Search by code or service name..."
          />
        </TabsContent>

        <TabsContent value="detail" className="mt-4 outline-none">
          {selectedService ? (
            <EnterpriseCard className="p-4 shadow-sm border-t-2 border-t-[#100841]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[3px] bg-[#ffffff] flex items-center justify-center border border-[#dfdfdf]">
                    <Layers className="w-5 h-5 text-[#100841]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#100841]">{selectedService.code} — {selectedService.name}</h3>
                    <p className="text-[10px] text-[#4f525d] font-mono">{selectedService.category}</p>
                  </div>
                </div>
                <EnterpriseBadge variant={selectedService.status === "ACTIVE" ? "success" : "error"}>{selectedService.status}</EnterpriseBadge>
              </div>

              <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px] mb-6">
                <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-bold mb-1">Service Description</p>
                <p className="text-xs text-[#100841] font-medium leading-relaxed">{selectedService.description}</p>
              </div>

              <div className="mb-6">
                 <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">Fee & Discount Mapping</p>
                 {selectedService.feeMappings.length > 0 ? (
                    <EnterpriseTable
                      data={selectedService.feeMappings}
                      columns={[
                        { id: "code", header: "Fee Code", accessor: (fm) => <span className="font-mono text-[10px]">{fm.feeCode}</span> },
                        { id: "name", header: "Name", accessor: (fm) => fm.feeName },
                        { id: "type", header: "Type", accessor: (fm) => <EnterpriseBadge variant={fm.feeType === "PERCENT" ? "info" : "success"}>{fm.feeType}</EnterpriseBadge> },
                        { id: "value", header: "Value", isNumeric: true, align: "right", accessor: (fm) => fm.feeType === "PERCENT" ? fm.value + "%" : formatMMK(fm.value) }
                      ]}
                      rowKey={(fm) => fm.id}
                    />
                 ) : (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-[#dfdfdf] rounded-[3px]">
                       <p className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">No fee mappings configured</p>
                    </div>
                 )}
              </div>

              <div>
                <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">Applicable Entity Roles</p>
                <div className="flex items-center gap-2">
                  {selectedService.applicableTo.map(role => (
                    <EnterpriseBadge key={role} variant="neutral" className="bg-white border-[#dfdfdf] text-[#100841]">{role}</EnterpriseBadge>
                  ))}
                </div>
              </div>
            </EnterpriseCard>
          ) : (
            <div className="text-center py-20 bg-slate-50 border border-dashed border-[#dfdfdf] rounded-[3px]">
              <Layers className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">Select a service to view technical specifications</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}
