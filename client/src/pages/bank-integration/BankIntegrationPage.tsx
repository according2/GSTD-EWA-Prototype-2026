/**
 * BankIntegrationPage — Pay Channel Integration, Prefund Accounts, Bank Service Fees
 * Design: Enterprise Fintech — Deep Navy (#100841) + Teal (#31d891)
 */
import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Landmark, Building2, Smartphone, Banknote, ArrowRightLeft, ShieldCheck, AlertTriangle, Plus, Eye, History, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMMK(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface PayChannel {
  id: string;
  bankName: string;
  channelType: "BANK_TRANSFER" | "MOBILE_WALLET" | "INSTANT_PAYMENT";
  accountNumber: string;
  prefundBalance: number;
  minPrefund: number;
  serviceFee: number;
  serviceFeeType: "FLAT" | "PERCENT";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  ledgerAccount: string;
  lastSync: string;
}

const payChannels: PayChannel[] = [
  { id: "CH-001", bankName: "KBZ Bank", channelType: "BANK_TRANSFER", accountNumber: "001-234567-890", prefundBalance: 15000000, minPrefund: 5000000, serviceFee: 1500, serviceFeeType: "FLAT", status: "ACTIVE", ledgerAccount: "COA-2100-KBZ", lastSync: "2026-07-10 14:30" },
  { id: "CH-002", bankName: "AYA Bank", channelType: "BANK_TRANSFER", accountNumber: "002-345678-901", prefundBalance: 10000000, minPrefund: 5000000, serviceFee: 1500, serviceFeeType: "FLAT", status: "ACTIVE", ledgerAccount: "COA-2100-AYA", lastSync: "2026-07-10 14:28" },
  { id: "CH-003", bankName: "CB Bank", channelType: "BANK_TRANSFER", accountNumber: "003-456789-012", prefundBalance: 3000000, minPrefund: 5000000, serviceFee: 1500, serviceFeeType: "FLAT", status: "ACTIVE", ledgerAccount: "COA-2100-CB", lastSync: "2026-07-10 14:15" },
  { id: "CH-004", bankName: "Wave Money", channelType: "MOBILE_WALLET", accountNumber: "WM-077-1234567", prefundBalance: 8000000, minPrefund: 2000000, serviceFee: 500, serviceFeeType: "FLAT", status: "ACTIVE", ledgerAccount: "COA-2100-WM", lastSync: "2026-07-10 14:32" },
  { id: "CH-005", bankName: "KBZ Pay", channelType: "MOBILE_WALLET", accountNumber: "KP-077-2345678", prefundBalance: 12000000, minPrefund: 2000000, serviceFee: 0.5, serviceFeeType: "PERCENT", status: "ACTIVE", ledgerAccount: "COA-2100-KP", lastSync: "2026-07-10 14:31" },
  { id: "CH-006", bankName: "Myanmar Post Bank", channelType: "INSTANT_PAYMENT", accountNumber: "MPB-567890-123", prefundBalance: 7000000, minPrefund: 3000000, serviceFee: 1000, serviceFeeType: "FLAT", status: "PENDING", ledgerAccount: "COA-2100-MPB", lastSync: "2026-07-09 16:00" },
];

interface LedgerFlow {
  id: string;
  date: string;
  channelId: string;
  channelName: string;
  type: "PREFUND_DEPOSIT" | "DISBURSEMENT_DEBIT" | "SERVICE_FEE" | "RECONCILIATION" | "REFUND";
  amount: number;
  journalRef: string;
  balance: number;
  description: string;
}

const ledgerFlows: LedgerFlow[] = [
  { id: "LF-001", date: "2026-07-10 09:00", channelId: "CH-001", channelName: "KBZ Bank", type: "PREFUND_DEPOSIT", amount: 5000000, journalRef: "JE-2026-0950", balance: 15000000, description: "Prefund top-up from bank transfer" },
  { id: "LF-002", date: "2026-07-10 09:18", channelId: "CH-001", channelName: "KBZ Bank", type: "DISBURSEMENT_DEBIT", amount: -50000, journalRef: "JE-2026-1001", balance: 14950000, description: "Disbursement to EMP-001 Aung Kyaw" },
  { id: "LF-003", date: "2026-07-10 09:18", channelId: "CH-001", channelName: "KBZ Bank", type: "SERVICE_FEE", amount: -1500, journalRef: "JE-2026-1001-FEE", balance: 14948500, description: "Bank service fee for transaction DISB-001" },
  { id: "LF-004", date: "2026-07-10 10:31", channelId: "CH-004", channelName: "Wave Money", type: "DISBURSEMENT_DEBIT", amount: -75000, journalRef: "JE-2026-1002", balance: 7925000, description: "Disbursement to EMP-003 Thet Hnin" },
  { id: "LF-005", date: "2026-07-10 10:31", channelId: "CH-004", channelName: "Wave Money", type: "SERVICE_FEE", amount: -500, journalRef: "JE-2026-1002-FEE", balance: 7924500, description: "Bank service fee for transaction DISB-002" },
  { id: "LF-006", date: "2026-07-10 11:00", channelId: "CH-001", channelName: "KBZ Bank", type: "DISBURSEMENT_DEBIT", amount: -60000, journalRef: "JE-2026-1006", balance: 14888500, description: "Disbursement to EMP-002 Nyein Chan" },
];

export function BankIntegrationPage() {
  const [selectedChannel, setSelectedChannel] = useState<PayChannel | null>(null);

  const channelColumns: ColumnDef<PayChannel>[] = [
    {
      id: "id",
      header: "Channel ID",
      accessor: (ch) => <span className="font-mono font-bold text-[#100841]">{ch.id}</span>,
      searchString: (ch) => ch.id
    },
    {
      id: "bank",
      header: "Counterparty Bank",
      accessor: (ch) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{ch.bankName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] text-[#4f525d] font-mono">{ch.accountNumber}</span>
          </div>
        </div>
      ),
      searchString: (ch) => `${ch.bankName} ${ch.accountNumber}`
    },
    {
      id: "type",
      header: "Channel Type",
      accessor: (ch) => {
        const icons = {
          "BANK_TRANSFER": Building2,
          "MOBILE_WALLET": Smartphone,
          "INSTANT_PAYMENT": Banknote
        };
        const Icon = icons[ch.channelType];
        return (
          <div className="flex items-center gap-2 text-[#4f525d]">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{ch.channelType.replace("_", " ")}</span>
          </div>
        );
      }
    },
    {
      id: "balance",
      header: "Prefund Balance",
      isNumeric: true,
      align: "right",
      accessor: (ch) => {
        const lowBalance = ch.prefundBalance < ch.minPrefund;
        return (
          <div className="flex flex-col items-end">
            <span className={cn("font-mono font-bold text-[12px]", lowBalance ? "text-[#c62828]" : "text-[#2e7d32]")}>
              {formatMMK(ch.prefundBalance)}
            </span>
            <span className="text-[8px] text-[#4f525d] uppercase">Min: {formatMMK(ch.minPrefund)}</span>
          </div>
        );
      }
    },
    {
      id: "ledger",
      header: "Ledger Map",
      accessor: (ch) => <span className="text-[10px] font-mono text-[#4f525d] bg-[#efefff] px-1.5 py-0.5 rounded-[2px] border border-[#dfdfdf]">{ch.ledgerAccount}</span>
    },
    {
      id: "status",
      header: "Channel Status",
      accessor: (ch) => <EnterpriseBadge variant={ch.status === "ACTIVE" ? "success" : "warning"}>{ch.status}</EnterpriseBadge>
    }
  ];

  const channelActions: TableAction<PayChannel>[] = [
    {
      label: "Full Specification",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (ch) => setSelectedChannel(ch)
    },
    {
      label: "Ledger History",
      icon: <History className="w-3.5 h-3.5" />,
      onClick: (ch) => console.log("History", ch.id)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Bank Integration Hub</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Pay channel orchestration, prefund accounts, and bank ledger reconciliation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#100841]">
            <Plus className="w-3.5 h-3.5" /> Integrate New Channel
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Total Prefund Assets"
          value={formatMMK(payChannels.reduce((sum, ch) => sum + ch.prefundBalance, 0))}
          accentColor="info"
          icon={<Banknote className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
        <EnterpriseKpiCard
          label="Active Pay Channels"
          value={payChannels.filter(c => c.status === "ACTIVE").length}
          accentColor="success"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Low Balance Alerts"
          value={payChannels.filter(c => c.prefundBalance < c.minPrefund).length}
          accentColor="error"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-[#c62828]" />}
        />
        <EnterpriseKpiCard
          label="Last Sync Status"
          value="HEALTHY"
          accentColor="success"
          icon={<RefreshCcw className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList>
          <TabsTrigger value="channels">Channel Registry</TabsTrigger>
          <TabsTrigger value="ledger">Unified Ledger Flow</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4 outline-none">
          <EnterpriseTable
            data={payChannels}
            columns={channelColumns}
            rowKey={(ch) => ch.id}
            actions={channelActions}
            searchPlaceholder="Search banks, accounts, or channels..."
          />
          
          {selectedChannel && (
            <EnterpriseCard className="mt-6 p-6 border-[#dfdfdf] bg-[#efefff]">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <Building2 className="w-4 h-4 text-[#100841]" />
                   <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">{selectedChannel.bankName} — Technical Specification</h3>
                 </div>
                 <EnterpriseButton variant="secondary" className="h-7 text-[10px]" onClick={() => setSelectedChannel(null)}>Close</EnterpriseButton>
               </div>
               
               <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Account Details</p>
                    <p className="text-[12px] font-mono font-bold text-[#100841]">{selectedChannel.accountNumber}</p>
                    <p className="text-[10px] text-[#4f525d]">{selectedChannel.channelType.replace("_", " ")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Prefund Liquidity</p>
                    <p className={cn("text-[14px] font-mono font-bold", selectedChannel.prefundBalance < selectedChannel.minPrefund ? "text-[#c62828]" : "text-[#2e7d32]")}>
                      {formatMMK(selectedChannel.prefundBalance)}
                    </p>
                    <p className="text-[10px] text-[#4f525d]">Min Threshold: {formatMMK(selectedChannel.minPrefund)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Service Fee Model</p>
                    <p className="text-[12px] font-bold text-[#e65100]">
                      {selectedChannel.serviceFeeType === "PERCENT" ? selectedChannel.serviceFee + "%" : formatMMK(selectedChannel.serviceFee)}
                    </p>
                    <p className="text-[10px] text-[#4f525d] uppercase">Per Transaction</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">GL Configuration</p>
                    <p className="text-[12px] font-mono font-bold text-[#100841]">{selectedChannel.ledgerAccount}</p>
                    <p className="text-[10px] text-[#4f525d] uppercase">Mapping: Assets/Bank</p>
                  </div>
               </div>

               <div className="mt-8 p-4 bg-white border border-[#dfdfdf] rounded-[2px]">
                  <p className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-4">Real-time Utilization Monitor</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#100841]">
                      <span>Prefund Depletion State</span>
                      <span className={selectedChannel.prefundBalance < selectedChannel.minPrefund ? "text-[#c62828]" : "text-[#2e7d32]"}>
                        {Math.round((selectedChannel.prefundBalance / (selectedChannel.minPrefund * 2)) * 100)}% Available
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#efefff] rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full", selectedChannel.prefundBalance < selectedChannel.minPrefund ? "bg-[#c62828]" : "bg-[#2e7d32]")}
                        style={{ width: `${Math.min(100, (selectedChannel.prefundBalance / (selectedChannel.minPrefund * 2)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <EnterpriseButton variant="primary" className="h-9 px-6 bg-[#2e7d32] uppercase tracking-widest text-[10px] font-bold">
                      <Plus className="w-3.5 h-3.5" /> Top-Up Prefund
                    </EnterpriseButton>
                    <EnterpriseButton variant="secondary" className="h-9 px-4 uppercase tracking-widest text-[10px] font-bold">
                      <RefreshCcw className="w-3.5 h-3.5" /> Force Sync
                    </EnterpriseButton>
                  </div>
               </div>
            </EnterpriseCard>
          )}
        </TabsContent>

        <TabsContent value="ledger" className="mt-4 outline-none">
          <EnterpriseTable
            data={ledgerFlows}
            columns={[
              { id: "date", header: "Timestamp", accessor: (f) => <span className="text-[10px] text-[#4f525d] font-mono">{f.date}</span> },
              { id: "channel", header: "Channel", accessor: (f) => <span className="text-[11px] font-bold text-[#100841]">{f.channelName}</span> },
              { id: "type", header: "Posting Type", accessor: (f) => {
                const variant = f.type === "PREFUND_DEPOSIT" ? "success" : f.type === "DISBURSEMENT_DEBIT" ? "info" : "warning";
                return <EnterpriseBadge variant={variant} className="uppercase">{f.type.replace("_", " ")}</EnterpriseBadge>;
              }},
              { id: "amount", header: "Amount", isNumeric: true, align: "right", accessor: (f) => (
                <span className={cn("font-mono font-bold", f.amount >= 0 ? "text-[#2e7d32]" : "text-[#c62828]")}>
                  {f.amount >= 0 ? "+" : ""}{formatMMK(f.amount)}
                </span>
              )},
              { id: "balance", header: "Running Balance", isNumeric: true, align: "right", accessor: (f) => <span className="font-mono text-[11px] text-[#4f525d]">{formatMMK(f.balance)}</span> },
              { id: "ref", header: "Journal Ref", accessor: (f) => <span className="text-[10px] font-mono text-[#100841] bg-[#ffffff] px-1 py-0.5 rounded-[2px]">{f.journalRef}</span> }
            ]}
            rowKey={(f) => f.id}
            searchPlaceholder="Search by journal ref or channel..."
          />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4 outline-none">
           <EnterpriseCard className="border-[#dfdfdf] p-6 bg-[#efefff]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">Automated Reconciliation Audit</h3>
                  <p className="text-[10px] text-[#4f525d] uppercase mt-1">Variance analysis between system ledger and bank statements</p>
                </div>
                <EnterpriseButton variant="primary" className="bg-[#100841] uppercase tracking-widest text-[10px] font-bold h-9">
                  <RefreshCcw className="w-3.5 h-3.5" /> Execute Full Recon
                </EnterpriseButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {payChannels.map(ch => {
                  const diff = ch.prefundBalance * 0.98;
                  const variance = ch.prefundBalance - diff;
                  const isHealthy = Math.abs(variance) < 10000;
                  return (
                    <div key={ch.id} className="p-4 bg-white border border-[#dfdfdf] rounded-[2px] shadow-sm">
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-[11px] font-bold text-[#100841]">{ch.bankName}</span>
                         <EnterpriseBadge variant={isHealthy ? "success" : "error"}>{isHealthy ? "MATCHED" : "VARIANCE"}</EnterpriseBadge>
                       </div>
                       <div className="space-y-2">
                         <div className="flex justify-between text-[10px] text-[#4f525d]"><span>System Ledger</span><span className="font-mono font-bold">{formatMMK(ch.prefundBalance)}</span></div>
                         <div className="flex justify-between text-[10px] text-[#4f525d]"><span>Bank Statement</span><span className="font-mono">{formatMMK(diff)}</span></div>
                         <LedgerDivider />
                         <div className="flex justify-between text-[11px] font-bold">
                           <span className="text-[#100841]">Variance</span>
                           <span className={isHealthy ? "text-[#2e7d32]" : "text-[#c62828]"}>{formatMMK(variance)}</span>
                         </div>
                       </div>
                    </div>
                  );
                })}
              </div>
           </EnterpriseCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
