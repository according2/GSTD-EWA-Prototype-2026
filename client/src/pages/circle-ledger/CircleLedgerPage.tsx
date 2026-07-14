/**
 * CircleLedgerPage — Circle Ledger & GL Accounting
 * Design: Institutional Fintech Command Center
 * Double-entry accounting, journal entries, GL balances, trial balance
 * Signature motif: ledger flow line, debit/credit precision
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMMK, journalEntries, glBalances, chartOfAccounts, type JournalEntry, type GLBalance } from "@/data/mockData";
import { BookOpen, FileText, Scale, Lock } from "lucide-react";
import {
  EnterpriseCard,
  EnterpriseBadge,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef
} from "@/components/EnterpriseComponents";

export function CircleLedgerPage() {
  const uniqueJournals = Array.from(new Set(journalEntries.map(j => j.journalId)));

  const journalColumns: ColumnDef<JournalEntry>[] = [
    {
      id: "journalId",
      header: "Journal ID",
      accessor: (jl) => <span className="text-[11px] font-mono font-bold text-[#4f525d]">{jl.journalId}</span>,
      searchString: (jl) => jl.journalId
    },
    {
      id: "date",
      header: "Date",
      accessor: (jl) => <span className="text-[11px] text-[#4f525d] font-mono">{jl.date}</span>
    },
    {
      id: "description",
      header: "Description",
      accessor: (jl) => <span className="text-[12px] text-[#100841] font-bold">{jl.description}</span>,
      searchString: (jl) => jl.description
    },
    {
      id: "accountCode",
      header: "GL Code",
      accessor: (jl) => <span className="text-[11px] font-mono font-bold text-[#100841]">{jl.accountCode}</span>,
      searchString: (jl) => jl.accountCode
    },
    {
      id: "accountName",
      header: "Account",
      accessor: (jl) => <span className="text-[11px] text-[#4f525d] font-semibold">{jl.accountName}</span>,
      searchString: (jl) => jl.accountName
    },
    {
      id: "debit",
      header: "Debit",
      isNumeric: true,
      align: "right",
      accessor: (jl) => jl.debit > 0 ? jl.debit : 0,
      cellClassName: (jl) => jl.debit > 0 ? "text-[#2e7d32] font-bold" : "text-[#c4c9ce]"
    },
    {
      id: "credit",
      header: "Credit",
      isNumeric: true,
      align: "right",
      accessor: (jl) => jl.credit > 0 ? jl.credit : 0,
      cellClassName: (jl) => jl.credit > 0 ? "text-[#c62828] font-bold" : "text-[#c4c9ce]"
    },
    {
      id: "referenceId",
      header: "Reference",
      accessor: (jl) => <span className="text-[10px] font-mono text-slate-400 font-semibold">{jl.referenceId}</span>,
      searchString: (jl) => jl.referenceId
    },
    {
      id: "companyId",
      header: "Company",
      accessor: (jl) => <span className="text-[11px] text-[#4f525d] font-semibold">{jl.companyId}</span>
    },
    {
      id: "postedBy",
      header: "Posted By",
      accessor: (jl) => <span className="text-[11px] text-slate-400 font-medium">{jl.postedBy}</span>
    }
  ];

  const journalFilters: FilterDef<JournalEntry>[] = [
    {
      id: "journal",
      label: "Journal",
      options: uniqueJournals.map(j => ({ label: j, value: j })),
      filterFn: (jl, val) => jl.journalId === val
    }
  ];

  const glColumns: ColumnDef<GLBalance>[] = [
    {
      id: "accountCode",
      header: "GL Code",
      accessor: (gl) => <span className="text-[11px] font-mono font-bold text-[#100841]">{gl.accountCode}</span>,
      searchString: (gl) => gl.accountCode
    },
    {
      id: "accountName",
      header: "Account Name",
      accessor: (gl) => <span className="text-[12px] font-bold text-[#100841]">{gl.accountName}</span>,
      searchString: (gl) => gl.accountName
    },
    {
      id: "type",
      header: "Type",
      accessor: (gl) => {
        const badgeVariant =
          gl.type === "Asset" ? "info" :
          gl.type === "Liability" ? "warning" :
          gl.type === "Income" ? "success" : "error";
        return <EnterpriseBadge variant={badgeVariant}>{gl.type}</EnterpriseBadge>;
      }
    },
    {
      id: "openingBalance",
      header: "Opening",
      isNumeric: true,
      align: "right",
      accessor: (gl) => gl.openingBalance
    },
    {
      id: "periodDebit",
      header: "Debit",
      isNumeric: true,
      align: "right",
      accessor: (gl) => gl.periodDebit,
      cellClassName: (gl) => gl.periodDebit > 0 ? "text-[#2e7d32] font-bold" : "text-[#c4c9ce]"
    },
    {
      id: "periodCredit",
      header: "Credit",
      isNumeric: true,
      align: "right",
      accessor: (gl) => gl.periodCredit,
      cellClassName: (gl) => gl.periodCredit > 0 ? "text-[#c62828] font-bold" : "text-[#c4c9ce]"
    },
    {
      id: "closingBalance",
      header: "Closing",
      isNumeric: true,
      align: "right",
      accessor: (gl) => gl.closingBalance,
      cellClassName: () => "font-bold text-[#100841]"
    }
  ];

  const trialColumns: ColumnDef<GLBalance>[] = [
    {
      id: "accountCode",
      header: "GL Code",
      accessor: (gl) => <span className="text-[11px] font-mono font-semibold text-[#4f525d]">{gl.accountCode}</span>,
      searchString: (gl) => gl.accountCode
    },
    {
      id: "accountName",
      header: "Account",
      accessor: (gl) => <span className="text-[12px] font-bold text-[#100841]">{gl.accountName}</span>,
      searchString: (gl) => gl.accountName
    },
    {
      id: "type",
      header: "Type",
      accessor: (gl) => <span className="text-[11px] text-[#4f525d] font-semibold">{gl.type}</span>
    },
    {
      id: "debit",
      header: "Debit",
      isNumeric: true,
      align: "right",
      accessor: (gl) => gl.closingBalance > 0 ? gl.closingBalance : 0,
      cellClassName: (gl) => gl.closingBalance > 0 ? "text-[#2e7d32] font-bold" : "text-[#c4c9ce]"
    },
    {
      id: "credit",
      header: "Credit",
      isNumeric: true,
      align: "right",
      accessor: (gl) => gl.closingBalance < 0 ? Math.abs(gl.closingBalance) : 0,
      cellClassName: (gl) => gl.closingBalance < 0 ? "text-[#c62828] font-bold" : "text-[#c4c9ce]"
    }
  ];

  return (
    <div className="space-y-4">
      {/* ===== Page Header ===== */}
      <div>
        <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#100841]/40" />
          Circle Ledger (GL Accounting)
        </h1>
        <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
          Double-entry accounting · Journal entries · GL balances · Trial balance
        </p>
      </div>

      <LedgerDivider />

      <Tabs defaultValue="journals" className="w-full">
        <TabsList>
          <TabsTrigger value="journals">
            <BookOpen className="w-3 h-3" /> Journal Entries
          </TabsTrigger>
          <TabsTrigger value="gl">
            <FileText className="w-3 h-3" /> GL Balances
          </TabsTrigger>
          <TabsTrigger value="trial">
            <Scale className="w-3 h-3" /> Trial Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journals" className="outline-none">
          <EnterpriseTable
            data={journalEntries}
            columns={journalColumns}
            rowKey={(jl) => jl.id}
            filters={journalFilters}
            searchPlaceholder="Search journal entries..."
          />
        </TabsContent>

        <TabsContent value="gl" className="outline-none">
          <EnterpriseTable
            data={glBalances}
            columns={glColumns}
            rowKey={(gl) => gl.accountCode}
            searchPlaceholder="Search GL accounts..."
            summary={{
              label: "TOTAL LEDGER",
              columns: {
                openingBalance: glBalances.reduce((s, g) => s + g.openingBalance, 0),
                periodDebit: glBalances.reduce((s, g) => s + g.periodDebit, 0),
                periodCredit: glBalances.reduce((s, g) => s + g.periodCredit, 0),
                closingBalance: glBalances.reduce((s, g) => s + g.closingBalance, 0)
              }
            }}
          />
        </TabsContent>

        <TabsContent value="trial" className="outline-none">
          <EnterpriseTable
            data={glBalances}
            columns={trialColumns}
            rowKey={(gl) => gl.accountCode}
            searchPlaceholder="Search accounts..."
            summary={{
              label: "TOTAL TRIAL BALANCE",
              columns: {
                debit: glBalances.reduce((s, g) => (g.closingBalance > 0 ? s + g.closingBalance : s), 0),
                credit: glBalances.reduce((s, g) => (g.closingBalance < 0 ? s + Math.abs(g.closingBalance) : s), 0)
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Chart of Accounts */}
      <EnterpriseCard className="p-4 shadow-sm border-[#dfdfdf]">
        <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">Chart of Accounts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {chartOfAccounts.map(acct => {
            const badgeVariant =
              acct.type === "Asset" ? "info" :
              acct.type === "Liability" ? "warning" :
              acct.type === "Income" ? "success" : "error";
            return (
              <div key={acct.code} className="flex items-center gap-2.5 p-2 rounded-[3px] border border-[#dfdfdf] bg-[#efefff] transition-colors hover:bg-white">
                <span className="text-[11px] font-mono font-bold text-[#100841]">{acct.code}</span>
                <span className="text-[11px] text-[#100841] font-bold">{acct.name}</span>
                <div className="ml-auto">
                  <EnterpriseBadge variant={badgeVariant}>{acct.type}</EnterpriseBadge>
                </div>
              </div>
            );
          })}
        </div>
      </EnterpriseCard>
    </div>
  );
}

