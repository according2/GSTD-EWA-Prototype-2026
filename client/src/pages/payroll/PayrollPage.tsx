/**
 * PayrollPage — Payroll & Deduction
 * Design: Enterprise Fintech — Reconciliation pattern
 * Company payroll policies, EWA deduction tracking, and payroll reconciliation
 */
import { formatMMK, employees, companies, type Employee, type Company } from "@/data/mockData";
import { FileSpreadsheet, DollarSign, ArrowDownCircle, Download, CheckCircle2 } from "lucide-react";
import {
  EnterpriseBadge,
  EnterpriseKpiCard,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef,
  TableAction,
  EnterpriseButton,
  EnterpriseCard
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function PayrollPage() {
  const activeEmployees = employees.filter(e => e.status === "Active");
  const totalOutstanding = activeEmployees.reduce((s, e) => s + e.outstanding, 0);

  // Column definitions for Payroll Deduction
  const payrollColumns: ColumnDef<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      accessor: (emp) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{emp.name}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{emp.employeeId}</p>
        </div>
      ),
      searchString: (emp) => `${emp.name} ${emp.employeeId}`
    },
    {
      id: "company",
      header: "Company",
      accessor: (emp) => <span className="text-[11px] text-[#4f525d] font-medium">{emp.companyName}</span>,
      searchString: (emp) => emp.companyName
    },
    {
      id: "salary",
      header: "Salary",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.salary
    },
    {
      id: "outstanding",
      header: "EWA Due",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.outstanding
    },
    {
      id: "deduction",
      header: "Deduction",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.outstanding,
      cellClassName: (emp) => emp.outstanding > 0 ? "text-red-600 font-bold" : "text-[#4f525d]"
    },
    {
      id: "net",
      header: "Net Pay",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.salary - emp.outstanding,
      cellClassName: () => "text-[#100841] font-bold"
    },
    {
      id: "status",
      header: "Status",
      accessor: (emp) => (
        <EnterpriseBadge variant={emp.outstanding > 0 ? "warning" : "success"}>
          {emp.outstanding > 0 ? "Deduct" : "No Deduction"}
        </EnterpriseBadge>
      )
    }
  ];

  // Column definitions for Policy Summary
  const policyColumns: ColumnDef<Company>[] = [
    {
      id: "company",
      header: "Company",
      accessor: (c) => <span className="text-[12px] font-bold text-[#100841]">{c.name}</span>,
      searchString: (c) => c.name
    },
    {
      id: "payroll_day",
      header: "Payroll Day",
      accessor: () => <span className="text-[11px] text-[#4f525d] font-mono">25th of month</span>
    },
    {
      id: "deduction_pct",
      header: "Deduction %",
      accessor: () => <span className="text-[11px] text-[#4f525d] font-medium">100% of EWA</span>
    },
    {
      id: "max_cap",
      header: "Max Cap",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.perEmployeeCap
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => <EnterpriseBadge variant={c.status === "Active" ? "success" : "error"}>{c.status}</EnterpriseBadge>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Payroll & Deduction Reconciliation</h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
            July 2026 Cycle · Pay Date: July 25, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Download className="w-3.5 h-3.5" /> Export Deduction File
          </EnterpriseButton>
          <EnterpriseButton className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#100841] text-white">
            <CheckCircle2 className="w-3.5 h-3.5" /> Finalize Cycle
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <EnterpriseKpiCard 
          label="Total EWA Outstanding" 
          value={formatMMK(totalOutstanding)} 
          subValue={`${activeEmployees.length} active employees`}
          icon={<DollarSign className="w-3 h-3 text-[#31d891]" />}
        />
        <EnterpriseKpiCard 
          label="Payroll Cycle" 
          value="July 2026" 
          subValue="25th pay day"
          icon={<FileSpreadsheet className="w-3 h-3 text-emerald-500" />}
        />
        <EnterpriseKpiCard 
          label="Deductions Ready" 
          value={activeEmployees.filter(e => e.outstanding > 0).length} 
          subValue="Pending payroll sync"
          icon={<ArrowDownCircle className="w-3 h-3 text-amber-500" />}
        />
      </div>

      <Tabs defaultValue="deductions" className="w-full">
        <TabsList>
          <TabsTrigger value="deductions">Deduction Register</TabsTrigger>
          <TabsTrigger value="policies">Company Policies</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="deductions" className="space-y-4 outline-none">
          <EnterpriseTable
            data={activeEmployees}
            columns={payrollColumns}
            rowKey={(e) => e.id}
            selectable={true}
            searchPlaceholder="Search by employee name or ID..."
            summary={{
              label: "TOTAL DEDUCTION",
              columns: {
                salary: activeEmployees.reduce((s, e) => s + e.salary, 0),
                outstanding: totalOutstanding,
                deduction: totalOutstanding,
                net: activeEmployees.reduce((s, e) => s + e.salary, 0) - totalOutstanding
              }
            }}
          />
        </TabsContent>

        <TabsContent value="policies" className="space-y-4 outline-none">
          <EnterpriseTable
            data={companies}
            columns={policyColumns}
            rowKey={(c) => c.id}
            searchPlaceholder="Search by company name..."
          />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4 outline-none">
           <EnterpriseCard className="p-20 text-center bg-slate-50 border border-dashed border-[#dfdfdf]">
              <FileSpreadsheet className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">Run Reconciliation Audit to view discrepancies</p>
           </EnterpriseCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
