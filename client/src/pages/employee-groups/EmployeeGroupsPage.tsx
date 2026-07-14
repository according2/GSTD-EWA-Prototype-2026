/**
 * EmployeeGroupsPage — Employee Group & Category Management
 * Group-level policies, category-based fee rules, budget allocation by group
 * Design: Enterprise Fintech — Deep Navy (#100841) + Teal (#31d891)
 */
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Plus, Eye, Settings, Tag } from "lucide-react";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  ColumnDef,
  FilterDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { formatMMK } from "@/data/mockData";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

interface EmployeeGroup {
  id: string;
  code: string;
  name: string;
  description: string;
  companyId: string;
  companyName: string;
  category: string;
  employeeCount: number;
  ewaPercentage: number;
  budgetAllocation: number;
  budgetUtilized: number;
  feeTierOverride: string | null;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
}

const employeeGroups: EmployeeGroup[] = [
  { id: "EG-001", code: "MGMT", name: "Management Tier", description: "Senior management and directors", companyId: "CMP-001", companyName: "Tech Solutions Ltd", category: "Senior Management", employeeCount: 12, ewaPercentage: 50, budgetAllocation: 5000000, budgetUtilized: 2100000, feeTierOverride: "FT-002", status: "ACTIVE" },
  { id: "EG-002", code: "ENG", name: "Engineering Staff", description: "Software engineers and technical staff", companyId: "CMP-001", companyName: "Tech Solutions Ltd", category: "Engineering", employeeCount: 45, ewaPercentage: 40, budgetAllocation: 12000000, budgetUtilized: 5800000, feeTierOverride: "FT-001", status: "ACTIVE" },
  { id: "EG-003", code: "OPS", name: "Operations Staff", description: "Daily operations and support personnel", companyId: "CMP-001", companyName: "Tech Solutions Ltd", category: "Operations", employeeCount: 30, ewaPercentage: 35, budgetAllocation: 6000000, budgetUtilized: 2400000, feeTierOverride: "FT-001", status: "ACTIVE" },
  { id: "EG-004", code: "MFG-SR", name: "Manufacturing Senior", description: "Production supervisors and line leads", companyId: "CMP-002", companyName: "Manufacturing Co", category: "Manufacturing", employeeCount: 20, ewaPercentage: 35, budgetAllocation: 4000000, budgetUtilized: 1800000, feeTierOverride: "FT-001", status: "ACTIVE" },
  { id: "EG-005", code: "MFG-OP", name: "Manufacturing Operators", description: "Production line operators and workers", companyId: "CMP-002", companyName: "Manufacturing Co", category: "Manufacturing", employeeCount: 85, ewaPercentage: 30, budgetAllocation: 10000000, budgetUtilized: 4200000, feeTierOverride: "FT-001", status: "ACTIVE" },
  { id: "EG-006", code: "LOG-DRV", name: "Logistics Drivers", description: "Fleet drivers and delivery personnel", companyId: "CMP-003", companyName: "Logistics Myanmar", category: "Logistics", employeeCount: 50, ewaPercentage: 30, budgetAllocation: 7500000, budgetUtilized: 3100000, feeTierOverride: "FT-001", status: "ACTIVE" },
  { id: "EG-007", code: "RTL-STAFF", name: "Retail Staff", description: "Store employees and cashiers", companyId: "CMP-004", companyName: "Retail Chain", category: "Retail", employeeCount: 120, ewaPercentage: 25, budgetAllocation: 15000000, budgetUtilized: 6200000, feeTierOverride: "FT-001", status: "ACTIVE" },
  { id: "EG-008", code: "TRY", name: "Trial Group", description: "New company trial period group", companyId: "CMP-005", companyName: "Startup Inc", category: "Trial", employeeCount: 5, ewaPercentage: 20, budgetAllocation: 500000, budgetUtilized: 0,     feeTierOverride: "NONE", status: "DRAFT" },
];

interface CategorySummary {
  category: string;
  groups: number;
  totalEmployees: number;
  totalBudget: number;
  totalUtilized: number;
  avgEwa: number;
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export function EmployeeGroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<EmployeeGroup | null>(null);

  const groupColumns: ColumnDef<EmployeeGroup>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (g) => <span className="text-[10px] font-mono font-bold text-[#100841]">{g.id}</span>,
      searchString: (g) => g.id
    },
    {
      id: "code",
      header: "Code",
      accessor: (g) => <span className="text-[11px] font-mono font-bold text-[#4f525d]">{g.code}</span>,
      searchString: (g) => g.code
    },
    {
      id: "name",
      header: "Group Name",
      accessor: (g) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{g.name}</p>
          <p className="text-[9px] text-[#4f525d]">{g.description}</p>
        </div>
      ),
      searchString: (g) => `${g.name} ${g.description}`
    },
    {
      id: "company",
      header: "Company",
      accessor: (g) => <span className="text-[11px] text-[#4f525d] font-medium">{g.companyName}</span>
    },
    {
      id: "employees",
      header: "Emps",
      isNumeric: true,
      align: "center",
      accessor: (g) => g.employeeCount
    },
    {
      id: "category",
      header: "Category",
      accessor: (g) => <EnterpriseBadge variant="neutral">{g.category}</EnterpriseBadge>
    },
    {
      id: "ewa",
      header: "EWA %",
      isNumeric: true,
      align: "right",
      accessor: (g) => g.ewaPercentage,
      cellClassName: () => "text-blue-600 font-bold"
    },
    {
      id: "budgetAllocation",
      header: "Budget",
      isNumeric: true,
      align: "right",
      accessor: (g) => g.budgetAllocation
    },
    {
      id: "feeTierOverride",
      header: "Fee Override",
      accessor: (g) => <span className="text-[10px] font-mono text-[#4f525d]">{g.feeTierOverride || "—"}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (g) => <EnterpriseBadge variant={g.status === "ACTIVE" ? "success" : "neutral"}>{g.status}</EnterpriseBadge>
    }
  ];

  const categoryColumns: ColumnDef<CategorySummary>[] = [
    {
      id: "category",
      header: "Category",
      accessor: (cat) => <span className="text-[12px] font-bold text-[#100841]">{cat.category}</span>,
      searchString: (cat) => cat.category
    },
    {
      id: "groups",
      header: "Groups",
      isNumeric: true,
      align: "center",
      accessor: (cat) => cat.groups
    },
    {
      id: "totalEmployees",
      header: "Total Emps",
      isNumeric: true,
      align: "center",
      accessor: (cat) => cat.totalEmployees
    },
    {
      id: "totalBudget",
      header: "Total Budget",
      isNumeric: true,
      align: "right",
      accessor: (cat) => cat.totalBudget
    },
    {
      id: "totalUtilized",
      header: "Utilized",
      isNumeric: true,
      align: "right",
      accessor: (cat) => cat.totalUtilized
    },
    {
      id: "avgEwa",
      header: "Avg EWA %",
      isNumeric: true,
      align: "right",
      accessor: (cat) => cat.avgEwa,
      cellClassName: () => "text-blue-600 font-bold"
    }
  ];

  const categories = ["Senior Management", "Engineering", "Operations", "Manufacturing", "Logistics", "Retail", "Trial"];
  const categoryData: CategorySummary[] = categories.map(cat => {
    const groups = employeeGroups.filter(g => g.category === cat);
    return {
      category: cat,
      groups: groups.length,
      totalEmployees: groups.reduce((s, g) => s + g.employeeCount, 0),
      totalBudget: groups.reduce((s, g) => s + g.budgetAllocation, 0),
      totalUtilized: groups.reduce((s, g) => s + g.budgetUtilized, 0),
      avgEwa: Math.round(groups.reduce((s, g) => s + g.ewaPercentage, 0) / (groups.length || 1))
    };
  });

  const groupActions: TableAction<EmployeeGroup>[] = [
    {
      label: "View Detail",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (g) => setSelectedGroup(g)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Employee Groups & Categories</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Policy management by employee cohort</p>
          </div>
        </div>
        <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
          <Plus className="w-3.5 h-3.5" /> Add Group
        </EnterpriseButton>
      </div>

      <LedgerDivider />

      <Tabs defaultValue="groups" className="w-full">
        <TabsList>
          <TabsTrigger value="groups">Group Registry</TabsTrigger>
          <TabsTrigger value="detail">Group Detail</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="outline-none">
          <EnterpriseTable
            data={employeeGroups}
            columns={groupColumns}
            rowKey={(g) => g.id}
            actions={groupActions}
            searchPlaceholder="Search groups..."
          />
        </TabsContent>

        <TabsContent value="detail" className="outline-none space-y-4">
          {selectedGroup ? (
            <div className="space-y-4">
              <EnterpriseCard className="p-4 border-[#dfdfdf] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-[#100841] flex items-center gap-2 uppercase tracking-wide">
                    <Users className="w-4 h-4 text-[#31d891]" />
                    {selectedGroup.code} — {selectedGroup.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <EnterpriseBadge variant="neutral">{selectedGroup.category}</EnterpriseBadge>
                    <EnterpriseBadge variant={selectedGroup.status === "ACTIVE" ? "success" : "neutral"}>{selectedGroup.status}</EnterpriseBadge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <EnterpriseKpiCard label="Employees" value={selectedGroup.employeeCount} />
                  <EnterpriseKpiCard label="EWA Cap" value={`${selectedGroup.ewaPercentage}%`} />
                  <EnterpriseKpiCard label="Budget" value={formatMMK(selectedGroup.budgetAllocation)} />
                  <EnterpriseKpiCard 
                    label="Utilized" 
                    value={formatMMK(selectedGroup.budgetUtilized)} 
                    change={selectedGroup.budgetUtilized > selectedGroup.budgetAllocation * 0.8 ? "High" : "Optimal"}
                    changeDir={selectedGroup.budgetUtilized > selectedGroup.budgetAllocation * 0.8 ? "down" : "up"}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Budget Utilization</h4>
                    <div className="p-4 rounded-[3px] bg-[#efefff] border border-[#dfdfdf]">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                        <span className="text-[#4f525d]">Usage Rate</span>
                        <span className="text-[#100841]">{Math.round((selectedGroup.budgetUtilized / selectedGroup.budgetAllocation) * 100)}%</span>
                      </div>
                      <div className="w-full bg-[#dfdfdf] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (selectedGroup.budgetUtilized / selectedGroup.budgetAllocation) > 0.8 ? "bg-red-500" : "bg-[#31d891]"
                          }`} 
                          style={{ width: `${Math.round((selectedGroup.budgetUtilized / selectedGroup.budgetAllocation) * 100)}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2">
                        <span className="text-[#868c95]">Remaining: {formatMMK(selectedGroup.budgetAllocation - selectedGroup.budgetUtilized)}</span>
                        <span className="text-[#868c95]">Limit: {formatMMK(selectedGroup.budgetAllocation)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Policy Overrides</h4>
                    <div className="p-4 rounded-[3px] bg-[#efefff] border border-[#dfdfdf] h-[92px] flex flex-col justify-center">
                      <p className="text-[12px] font-mono font-bold text-[#100841] uppercase">{selectedGroup.feeTierOverride || "System Default"}</p>
                      <p className="text-[10px] text-[#4f525d] mt-1 italic">Overrides company-level fee structures for this specific cohort.</p>
                    </div>
                  </div>
                </div>
              </EnterpriseCard>

              <EnterpriseCard className="p-4 border-[#dfdfdf] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">Category Policy Settings</h3>
                  <EnterpriseButton variant="secondary" className="h-7 text-[9px] px-2"><Settings className="w-3 h-3 mr-1" /> Edit Policy</EnterpriseButton>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="space-y-1">
                      <p className="text-[9px] text-[#868c95] uppercase tracking-wider">Repayment Rule</p>
                      <p className="text-[11px] font-bold text-[#100841]">Direct Deduction</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] text-[#868c95] uppercase tracking-wider">Daily Disbursement Limit</p>
                      <p className="text-[11px] font-bold text-[#100841]">{formatMMK(Math.round(selectedGroup.budgetAllocation / selectedGroup.employeeCount * 0.1))}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] text-[#868c95] uppercase tracking-wider">Cycle Transaction Cap</p>
                      <p className="text-[11px] font-bold text-[#100841]">5 Transactions</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] text-[#868c95] uppercase tracking-wider">Cool-off Period</p>
                      <p className="text-[11px] font-bold text-[#100841]">24 Hours</p>
                   </div>
                </div>
              </EnterpriseCard>
            </div>
          ) : (
            <div className="bg-[#efefff] border border-dashed border-[#dfdfdf] rounded-[3px] py-20 flex flex-col items-center justify-center text-center">
              <Users className="w-12 h-12 text-[#dfdfdf] mb-4" />
              <h3 className="text-[14px] font-bold text-[#4f525d]">No Group Selected</h3>
              <p className="text-[11px] text-[#868c95] max-w-[250px] mt-1">Please select an employee group from the registry to view its configuration and metrics.</p>
              <EnterpriseButton variant="secondary" className="mt-6 h-8 text-[10px]" onClick={() => {
                // Focus back to groups tab logic if needed
              }}>Browse Registry</EnterpriseButton>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="outline-none">
          <EnterpriseTable
            data={categoryData}
            columns={categoryColumns}
            rowKey={(cat) => cat.category}
            searchPlaceholder="Search categories..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

