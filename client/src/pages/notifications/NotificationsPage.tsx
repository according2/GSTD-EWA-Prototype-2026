/**
 * NotificationsPage — Notification Center
 * Design: Neobrutalist Fintech — Role-based notifications with channels and read status
 */
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  ColumnDef,
} from "@/components/EnterpriseComponents";
import { Mail, Bell, MessageSquare, Check, BellRing, Settings, Filter } from "lucide-react";

const notifications = [
  { id: "N-001", type: "Settlement Approved", message: "SET-2026-07-001 settlement approved by Checker", channel: "Email", recipients: "Finance, Operations", read: true, timestamp: "10:30 AM" },
  { id: "N-002", type: "Employee Verified", message: "Htet Oo Kyaw — Employment verification completed successfully", channel: "SMS", recipients: "HR, Employee", read: false, timestamp: "09:45 AM" },
  { id: "N-003", type: "Budget Alert", message: "Skyline Trading budget utilization reached 78% threshold", channel: "Email", recipients: "Finance, Risk", read: false, timestamp: "09:00 AM" },
  { id: "N-004", type: "Repayment Due", message: "REP-2026-07-003 payment due within 48 hours", channel: "SMS", recipients: "Operations, Company", read: true, timestamp: "08:30 AM" },
  { id: "N-005", type: "Risk Escalation", message: "Golden Harvest Foods credit score dropped below 60 threshold", channel: "Email", recipients: "Risk, Finance", read: false, timestamp: "08:00 AM" },
  { id: "N-006", type: "Transaction Completed", message: "TXN-2026-07-005 disbursed successfully to Aung Thu", channel: "SMS", recipients: "Employee, Operations", read: true, timestamp: "07:30 AM" },
  { id: "N-007", type: "Onboarding Complete", message: "Golden Harvest Foods onboarding completed — company now active", channel: "Email", recipients: "Sales, Operations", read: true, timestamp: "Yesterday" },
  { id: "N-008", type: "System Alert", message: "Late fee calculation engine updated — new slab rates effective", channel: "Email", recipients: "All Roles", read: false, timestamp: "Yesterday" },
];

export function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;

  const columns: ColumnDef<typeof notifications[0]>[] = [
    {
      id: "type",
      header: "Alert Type",
      accessor: (n) => (
        <div className="flex items-center gap-2">
          {!n.read && <span className="w-2 h-2 rounded-full bg-[#31d891]" />}
          <span className="text-[12px] font-bold text-[#100841] uppercase tracking-tight">{n.type}</span>
        </div>
      ),
      searchString: (n) => n.type
    },
    {
      id: "message",
      header: "Payload / Message",
      accessor: (n) => <p className="text-[11px] text-[#4f525d] font-medium leading-relaxed max-w-[400px]">{n.message}</p>,
      searchString: (n) => n.message
    },
    {
      id: "channel",
      header: "Channel",
      accessor: (n) => {
        const icons: Record<string, any> = { "Email": Mail, "SMS": MessageSquare, "Push": Bell };
        const Icon = icons[n.channel] || Mail;
        return (
          <div className="flex items-center gap-1.5 text-[#100841] bg-[#efefff] px-2 py-0.5 rounded-[2px] border border-[#dfdfdf]">
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{n.channel}</span>
          </div>
        );
      }
    },
    {
      id: "recipients",
      header: "Target Groups",
      accessor: (n) => <span className="text-[10px] text-[#4f525d] font-mono font-bold uppercase">{n.recipients}</span>
    },
    {
      id: "timestamp",
      header: "Transmission",
      accessor: (n) => <span className="text-[10px] text-[#4f525d] font-mono">{n.timestamp}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (n) => <EnterpriseBadge variant={n.read ? "neutral" : "info"}>{n.read ? "READ" : "UNREAD"}</EnterpriseBadge>
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Enterprise Notification Service</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Automated multi-channel alerts and system event broadcasts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Check className="w-3.5 h-3.5" /> Mark All as Read
          </EnterpriseButton>
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Settings className="w-3.5 h-3.5" /> Channels
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Unread Alerts"
          value={unreadCount}
          accentColor="info"
          icon={<Bell className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
        <EnterpriseKpiCard
          label="Email Dispatched"
          value={1240}
          accentColor="neutral"
          icon={<Mail className="w-3.5 h-3.5 text-[#4f525d]" />}
        />
        <EnterpriseKpiCard
          label="SMS Sent"
          value={856}
          accentColor="success"
          icon={<MessageSquare className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Delivery Success"
          value="99.8%"
          accentColor="success"
          icon={<Check className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
      </div>

      <EnterpriseCard className="border-[#dfdfdf] shadow-sm">
        <div className="p-4 bg-[#efefff] border-b border-[#dfdfdf] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#100841]" />
            <span className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">Notification Audit Log</span>
          </div>
        </div>
        <EnterpriseTable
          data={notifications}
          columns={columns}
          rowKey={(n) => n.id}
          searchPlaceholder="Search audit stream..."
        />
      </EnterpriseCard>
    </div>
  );
}
