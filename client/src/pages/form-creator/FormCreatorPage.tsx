import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  ColumnDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { Plus, Eye, Copy, Trash2, LayoutTemplate, FileText, Settings, ShieldCheck, Database } from "lucide-react";

const formTemplates = [
  { id: "FT-001", name: "Standard EWA Request", description: "Basic employee EWA request form with amount, reason, and payout method", status: "Active", fields: 6, version: "2.1" },
  { id: "FT-002", name: "Advanced EWA Request", description: "Detailed request with document upload, multi-level approval, and custom fields", status: "Active", fields: 12, version: "1.0" },
  { id: "FT-003", name: "Quick Advance", description: "Simplified form for trusted employees with auto-approval", status: "Draft", fields: 4, version: "1.0" },
];

const formFields = [
  { id: "F-01", name: "Request Amount", type: "Number", required: true, validation: "Min: 10,000 / Max: EWA Cap", order: 1 },
  { id: "F-02", name: "Reason for Advance", type: "Text", required: true, validation: "Min 10 chars", order: 2 },
  { id: "F-03", name: "Payout Method", type: "Dropdown", required: true, options: "Bank Transfer, Agent Cash-Out, E-Wallet", order: 3 },
  { id: "F-04", name: "Document Upload", type: "File", required: false, validation: "PDF, JPG (max 5MB)", order: 4 },
  { id: "F-05", name: "Emergency Flag", type: "Checkbox", required: false, validation: "—", order: 5 },
  { id: "F-06", name: "Approver Notes", type: "Textarea", required: false, validation: "Optional", order: 6 },
];

export function FormCreatorPage() {
  const templateColumns: ColumnDef<typeof formTemplates[0]>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (ft) => <span className="font-mono font-bold text-[#100841]">{ft.id}</span>,
      searchString: (ft) => ft.id
    },
    {
      id: "name",
      header: "Template Definition",
      accessor: (ft) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{ft.name}</p>
          <p className="text-[10px] text-[#4f525d] truncate max-w-[300px]">{ft.description}</p>
        </div>
      ),
      searchString: (ft) => `${ft.name} ${ft.description}`
    },
    {
      id: "fields",
      header: "Depth",
      isNumeric: true,
      align: "center",
      accessor: (ft) => <span className="text-[11px] font-bold text-[#100841] bg-[#ffffff] px-2 rounded-[1px]">{ft.fields} Fields</span>
    },
    {
      id: "version",
      header: "Revision",
      accessor: (ft) => <span className="text-[10px] font-mono font-bold text-slate-400">v{ft.version}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (ft) => <EnterpriseBadge variant={ft.status === "Active" ? "success" : "neutral"}>{ft.status}</EnterpriseBadge>
    }
  ];

  const fieldColumns: ColumnDef<typeof formFields[0]>[] = [
    {
      id: "order",
      header: "#",
      accessor: (f) => <span className="text-[10px] font-mono text-slate-400">{f.order}</span>
    },
    {
      id: "id",
      header: "Field ID",
      accessor: (f) => <span className="text-[10px] font-mono font-bold text-[#100841]">{f.id}</span>
    },
    {
      id: "name",
      header: "Label",
      accessor: (f) => <span className="text-[11px] font-bold text-[#100841]">{f.name}</span>
    },
    {
      id: "type",
      header: "Schema Type",
      accessor: (f) => <EnterpriseBadge variant="info">{f.type}</EnterpriseBadge>
    },
    {
      id: "required",
      header: "Requirement",
      accessor: (f) => <EnterpriseBadge variant={f.required ? "error" : "neutral"}>{f.required ? "Required" : "Optional"}</EnterpriseBadge>
    },
    {
      id: "validation",
      header: "Logic Rules",
      accessor: (f) => <span className="text-[10px] text-[#4f525d] font-mono">{f.validation}</span>
    }
  ];

  const templateActions: TableAction<typeof formTemplates[0]>[] = [
    {
      label: "Preview Form",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (ft) => console.log("Preview", ft.id)
    },
    {
      label: "Duplicate",
      icon: <Copy className="w-3.5 h-3.5" />,
      onClick: (ft) => console.log("Clone", ft.id)
    },
    {
      label: "Archive",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      onClick: (ft) => console.log("Delete", ft.id)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Enterprise Form Builder</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Dynamic JSON Schema generation for KYC and EWA requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#100841]">
            <Plus className="w-3.5 h-3.5" /> Create Template
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Active Templates"
          value={formTemplates.length}
          accentColor="info"
          icon={<LayoutTemplate className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
        <EnterpriseKpiCard
          label="Total Fields"
          value={formTemplates.reduce((sum, t) => sum + t.fields, 0)}
          accentColor="neutral"
          icon={<FileText className="w-3.5 h-3.5 text-[#4f525d]" />}
        />
        <EnterpriseKpiCard
          label="Schema Integrity"
          value="100%"
          accentColor="success"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="API Endpoints"
          value="12"
          accentColor="info"
          icon={<Database className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#100841]" />
            <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">Template Registry</h3>
          </div>
          <EnterpriseTable
            data={formTemplates}
            columns={templateColumns}
            rowKey={(ft) => ft.id}
            actions={templateActions}
            searchPlaceholder="Search templates by name or ID..."
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#100841]" />
            <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">Active Field Configuration — {formTemplates[0].name}</h3>
          </div>
          <EnterpriseTable
            data={formFields}
            columns={fieldColumns}
            rowKey={(f) => f.id}
            searchPlaceholder="Search fields or rules..."
          />
        </section>
      </div>
    </div>
  );
}
