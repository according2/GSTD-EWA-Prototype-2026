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
import {
  workflowCases, workItems, workflowActivities,
  type WorkflowCase, type WorkItem, type WorkflowActivity,
} from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Clock, CheckCircle2, AlertCircle, XCircle, ArrowRight,
  UserCheck, FileText, MessageSquare,
  Play, RotateCcw, Bell, Timer, Activity,
  ShieldCheck, ShieldX, Eye, Users
} from "lucide-react";

/* ===== PRIORITY BADGE ===== */
function PriorityBadge({ priority }: { priority: string }) {
  const variantMap: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
    "Critical": "error",
    "High": "warning",
    "Medium": "info",
    "Low": "neutral",
  };
  return <EnterpriseBadge variant={variantMap[priority] || "neutral"}>{priority}</EnterpriseBadge>;
}

function CaseTypeIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ElementType; color: string }> = {
    "employee_import": { icon: Users, color: "text-teal-600" },
    "employee_verification": { icon: UserCheck, color: "text-blue-600" },
    "budget_request": { icon: AlertCircle, color: "text-amber-600" },
    "company_onboarding": { icon: ShieldCheck, color: "text-emerald-600" },
    "settlement": { icon: Clock, color: "text-indigo-600" },
    "writeoff": { icon: XCircle, color: "text-red-600" },
  };
  const { icon: Icon, color } = icons[type] || { icon: FileText, color: "text-slate-600" };
  return <Icon className={`w-4 h-4 ${color}`} />;
}

/* ===== STATE MACHINE VISUALIZATION ===== */
function StateMachine({ caseData }: { caseData: WorkflowCase }) {
  const budgetPath = ["Submitted", "HR_Review", "Risk_Review", "Finance_Review", "Approved"];
  const importPath = ["Submitted", "Checking", "Maker_Submitted", "Checker_Approved", "Completed"];
  const verificationPath = ["Submitted", "Checking", "Approved"];
  const settlementPath = ["Submitted", "Checking", "Approved"];
  const onboardingPath = ["Submitted", "HR_Review", "Risk_Review", "Finance_Review", "Approved"];

  let path: string[] = ["Submitted", "Checking", "Completed"];
  if (caseData.type === "budget_request") path = budgetPath;
  else if (caseData.type === "employee_import") path = importPath;
  else if (caseData.type === "employee_verification") path = verificationPath;
  else if (caseData.type === "settlement") path = settlementPath;
  else if (caseData.type === "company_onboarding") path = onboardingPath;

  const currentIndex = path.indexOf(caseData.status);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">State Machine Visualization</p>
      <div className="flex items-center gap-0 overflow-x-auto py-2">
        {path.map((step, i) => {
          const isActive = i === currentIndex;
          const isComplete = i < currentIndex;
          const isRejected = caseData.status === "Rejected" && i >= currentIndex;
          return (
            <div key={step} className="flex items-center">
              <div className={cn(
                "flex flex-col items-center px-3 py-1.5 rounded-[2px] border transition-colors",
                isActive ? "bg-[#100841] text-white border-[#100841]" :
                isComplete ? "bg-emerald-500 text-white border-emerald-500" :
                isRejected ? "bg-[#fce4ec] text-[#b71c1c] border-[#ef9a9a]" :
                "bg-[#efefff] text-[#4f525d] border-[#dfdfdf]"
              )}>
                <span className="text-[8px] font-bold uppercase tracking-wider whitespace-nowrap">{step.replace("_", " ")}</span>
              </div>
              {i < path.length - 1 && (
                <div className={cn("w-6 h-0.5 transition-colors", isComplete ? "bg-emerald-500" : isActive ? "bg-[#100841]" : "bg-[#dfdfdf]")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== SLA TIMER ===== */
function SLATimer({ remaining }: { remaining: string }) {
  const isOverdue = remaining === "—" || remaining.includes("—") || remaining.includes("OVERDUE");
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-mono font-bold", isOverdue ? "text-[#c62828]" : "text-[#e65100]")}>
      <Timer className="w-3 h-3" />
      {isOverdue ? "OVERDUE" : remaining}
    </span>
  );
}

/* ===== AUDIT TRAIL TIMELINE ===== */
function AuditTimeline({ activities }: { activities: WorkflowActivity[] }) {
  const typeIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    "created": { icon: Activity, color: "text-[#100841]", bg: "bg-[#e3f2fd]" },
    "submitted": { icon: Play, color: "text-[#31d891]", bg: "bg-[#e1f5fe]" },
    "approved": { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-[#e8f5e9]" },
    "rejected": { icon: XCircle, color: "text-[#c62828]", bg: "bg-[#fce4ec]" },
    "returned": { icon: RotateCcw, color: "text-[#e65100]", bg: "bg-[#fff8e1]" },
    "escalated": { icon: AlertCircle, color: "text-[#c62828]", bg: "bg-[#fce4ec]" },
    "assigned": { icon: Users, color: "text-[#0d47a1]", bg: "bg-[#efefff]" },
    "claimed": { icon: UserCheck, color: "text-[#0d47a1]", bg: "bg-[#efefff]" },
    "completed": { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-[#e8f5e9]" },
    "comment": { icon: MessageSquare, color: "text-[#4f525d]", bg: "bg-[#efefff]" },
  };
  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {activities.map((a, i) => {
        const ti = typeIcons[a.type] || typeIcons.comment;
        const Icon = ti.icon;
        return (
          <div key={a.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border border-[#dfdfdf]", ti.bg)}>
                <Icon className={cn("w-4 h-4", ti.color)} />
              </div>
              {i < activities.length - 1 && <div className="w-[1px] flex-1 bg-[#dfdfdf] my-1" />}
            </div>
            <div className="pb-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#100841]">{a.action}</span>
                <span className="text-[10px] text-[#4f525d] font-mono">{a.timestamp}</span>
              </div>
              <p className="text-[10px] text-[#4f525d] mt-0.5 font-medium">{a.actor} · <span className="uppercase tracking-wider">{a.actorRole}</span></p>
              {a.details && (
                <div className="mt-2 p-2 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                  <p className="text-[10px] text-[#4f525d] leading-relaxed">{a.details}</p>
                </div>
              )}
              {a.fromState && a.toState && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold text-[#e65100] uppercase tracking-wider bg-[#fff8e1] px-1.5 py-0.5 rounded-[2px]">{a.fromState.replace("_", " ")}</span>
                  <ArrowRight className="w-3 h-3 text-[#4f525d]" />
                  <span className="text-[9px] font-bold text-[#2e7d32] uppercase tracking-wider bg-[#e8f5e9] px-1.5 py-0.5 rounded-[2px]">{a.toState.replace("_", " ")}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== WORKFLOW CASE DETAIL PANEL ===== */
function CaseDetailPanel({ caseData, onClose }: { caseData: WorkflowCase; onClose: () => void }) {
  const caseActivities = workflowActivities.filter(a => a.caseId === caseData.id);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Audit Trail" },
    { id: "actions", label: "Actions" },
  ];

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-[550px] p-0 border-l-[#dfdfdf]">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 border-b border-[#dfdfdf] bg-[#efefff]">
            <SheetTitle className="text-[15px] font-bold text-[#100841] flex items-center gap-2 uppercase tracking-wide">
              <CaseTypeIcon type={caseData.type} />
              {caseData.id} — {caseData.title}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Case Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                 <div><p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-1">Status</p><EnterpriseBadge variant={caseData.status === "Approved" ? "success" : "info"}>{caseData.status.replace("_", " ")}</EnterpriseBadge></div>
                 <div><p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-1">Subject</p><p className="text-[12px] font-bold text-[#100841]">{caseData.subject}</p></div>
                 <div><p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-1">Priority</p><PriorityBadge priority={caseData.priority} /></div>
              </div>
              <div className="space-y-4">
                 <div><p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-1">Owner</p><p className="text-[12px] font-bold text-[#100841]">{caseData.currentOwner}</p><p className="text-[10px] text-[#4f525d] uppercase">{caseData.ownerRole}</p></div>
                 <div><p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-1">SLA</p><SLATimer remaining={caseData.slaRemaining} /></div>
                 <div><p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-1">Related ID</p><p className="text-[11px] font-mono font-bold text-[#31d891]">{caseData.relatedId || "—"}</p></div>
              </div>
            </div>

            <LedgerDivider />

            {/* State Machine */}
            <StateMachine caseData={caseData} />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-[#dfdfdf] p-0 h-auto">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#100841] data-[state=active]:bg-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#4f525d] data-[state=active]:text-[#100841]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="pt-4">
                <TabsContent value="overview" className="mt-0 outline-none space-y-4">
                  <div className="p-4 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                    <p className="text-[12px] text-[#4f525d] leading-relaxed">
                      This case is currently at the <strong>{caseData.currentStep}</strong> stage. 
                      The next action is required from <strong>{caseData.currentOwner}</strong> ({caseData.ownerRole}). 
                      SLA expires in <strong>{caseData.slaRemaining}</strong>.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 outline-none">
                  <AuditTimeline activities={caseActivities} />
                </TabsContent>

                <TabsContent value="actions" className="mt-0 outline-none space-y-3">
                  {caseActivities.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-[11px] p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="font-bold text-[#100841] uppercase tracking-wide">{a.action}</span>
                      <span className="font-mono text-[#4f525d]">{a.actor}</span>
                    </div>
                  ))}
                  {caseActivities.length === 0 && (
                    <div className="text-center py-12 opacity-40">
                      <FileText className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-[11px] font-bold uppercase tracking-widest">No activities logged yet</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="p-6 border-t border-[#dfdfdf] bg-[#efefff] flex items-center gap-3">
             {caseData.status !== "Completed" && caseData.status !== "Rejected" && caseData.status !== "Cancelled" && (
                <>
                  <EnterpriseButton variant="primary" className="flex-1 h-10 uppercase tracking-widest text-[11px] font-bold bg-[#100841]">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </EnterpriseButton>
                  <EnterpriseButton variant="secondary" className="flex-1 h-10 uppercase tracking-widest text-[11px] font-bold border-[#c62828] text-[#c62828] hover:bg-[#fce4ec]">
                    <XCircle className="w-4 h-4" /> Reject
                  </EnterpriseButton>
                </>
             )}
             <EnterpriseButton variant="secondary" className="w-12 h-10 p-0" onClick={onClose}>
                <RotateCcw className="w-4 h-4" />
             </EnterpriseButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function WorkflowPage() {
  const [selectedCase, setSelectedCase] = useState<WorkflowCase | null>(null);
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [workItemAction, setWorkItemAction] = useState<WorkItem | null>(null);

  const pendingTasks = workItems.filter(w => w.status === "Pending" || w.status === "Assigned" || w.status === "Overdue");
  const inProgressTasks = workItems.filter(w => w.status === "InProgress");
  const completedTasks = workItems.filter(w => w.status === "Completed");

  const activeCases = workflowCases.filter(c => c.status !== "Completed" && c.status !== "Rejected" && c.status !== "Cancelled");
  const historyCases = workflowCases.filter(c => c.status === "Completed" || c.status === "Rejected" || c.status === "Cancelled");

  const taskColumns: ColumnDef<WorkItem>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (item) => <span className="font-mono font-bold text-[#100841]">{item.id}</span>,
      searchString: (item) => item.id
    },
    {
      id: "case",
      header: "Case Context",
      accessor: (item) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{item.caseTitle}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <CaseTypeIcon type={item.caseType} />
            <span className="text-[9px] text-[#4f525d] uppercase font-bold tracking-tighter">{item.caseType.replace("_", " ")}</span>
          </div>
        </div>
      ),
      searchString: (item) => item.caseTitle
    },
    {
      id: "step",
      header: "Current Step",
      accessor: (item) => <span className="text-[11px] font-bold text-[#100841] uppercase tracking-wider bg-[#efefff] px-2 py-1 border border-[#dfdfdf] rounded-[2px]">{item.stepName}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (item) => {
        const variant = item.status === "Overdue" ? "error" : item.status === "InProgress" ? "info" : "warning";
        return <EnterpriseBadge variant={variant}>{item.status.replace("_", " ")}</EnterpriseBadge>;
      }
    },
    {
      id: "priority",
      header: "Priority",
      accessor: (item) => <PriorityBadge priority={item.priority} />
    },
    {
      id: "sla",
      header: "SLA Due",
      accessor: (item) => <SLATimer remaining={item.slaDueAt.replace("2026-07-12", "0h remaining").replace("2026-07-13", "1d remaining").replace("2026-07-14", "2d remaining")} />
    },
    {
      id: "escalation",
      header: "Escalation",
      accessor: (item) => item.escalationLevel > 0 ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c62828] uppercase tracking-widest">
          <AlertCircle className="w-3 h-3" /> L{item.escalationLevel}
        </span>
      ) : <span className="text-slate-200">—</span>
    }
  ];

  const taskActions: TableAction<WorkItem>[] = [
    {
      label: "View Detail",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (item) => {
        const cs = workflowCases.find(c => c.id === item.caseId);
        if (cs) { setSelectedCase(cs); setCaseDetailOpen(true); }
      }
    },
    {
      label: "Process Action",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      onClick: (item) => setWorkItemAction(item)
    }
  ];

  const caseColumns: ColumnDef<WorkflowCase>[] = [
    {
      id: "id",
      header: "Case ID",
      accessor: (c) => <span className="font-mono font-bold text-[#100841]">{c.id}</span>,
      searchString: (c) => c.id
    },
    {
      id: "title",
      header: "Request Title",
      accessor: (c) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{c.title}</p>
          <p className="text-[10px] text-[#4f525d]">{c.subject}</p>
        </div>
      ),
      searchString: (c) => c.title
    },
    {
      id: "type",
      header: "Type",
      accessor: (c) => (
        <div className="flex items-center gap-1">
          <CaseTypeIcon type={c.type} />
          <span className="text-[10px] text-[#4f525d] font-bold uppercase">{c.type.replace("_", " ")}</span>
        </div>
      )
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => <EnterpriseBadge variant={c.status === "Approved" || c.status === "Completed" ? "success" : "info"}>{c.status.replace("_", " ")}</EnterpriseBadge>
    },
    {
      id: "step",
      header: "Current Step",
      accessor: (c) => <span className="text-[11px] font-bold text-[#100841] uppercase tracking-wider">{c.currentStep}</span>
    },
    {
      id: "owner",
      header: "Current Owner",
      accessor: (c) => (
        <div>
          <p className="text-[11px] font-bold text-[#100841]">{c.currentOwner}</p>
          <p className="text-[9px] text-[#4f525d] uppercase tracking-tighter">{c.ownerRole}</p>
        </div>
      )
    },
    {
      id: "sla",
      header: "SLA",
      accessor: (c) => <SLATimer remaining={c.slaRemaining} />
    }
  ];

  const caseActions: TableAction<WorkflowCase>[] = [
    {
      label: "Full History",
      icon: <FileText className="w-3.5 h-3.5" />,
      onClick: (c) => { setSelectedCase(c); setCaseDetailOpen(true); }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Enterprise Workflow Engine</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Unified case management and audit-safe task orchestration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Bell className="w-3.5 h-3.5" /> Inbox ({pendingTasks.length})
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <EnterpriseKpiCard
          label="Pending Tasks"
          value={pendingTasks.length}
          accentColor="error"
          icon={<Clock className="w-3.5 h-3.5 text-[#c62828]" />}
        />
        <EnterpriseKpiCard
          label="In Progress"
          value={inProgressTasks.length}
          accentColor="info"
          icon={<Activity className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
        <EnterpriseKpiCard
          label="Completed"
          value={completedTasks.length}
          accentColor="success"
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Active Cases"
          value={activeCases.length}
          accentColor="amber"
          icon={<AlertCircle className="w-3.5 h-3.5 text-[#e65100]" />}
        />
        <EnterpriseKpiCard
          label="Escalated"
          value={activeCases.filter(c => c.escalationLevel > 0).length}
          accentColor="error"
          icon={<ShieldX className="w-3.5 h-3.5 text-[#c62828]" />}
        />
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">My Worklist</TabsTrigger>
          <TabsTrigger value="requests">Active Requests</TabsTrigger>
          <TabsTrigger value="history">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 outline-none">
          <EnterpriseTable
            data={pendingTasks}
            columns={taskColumns}
            rowKey={(item) => item.id}
            actions={taskActions}
            selectable={true}
            searchPlaceholder="Filter my work items..."
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-4 outline-none">
          <EnterpriseTable
            data={activeCases}
            columns={caseColumns}
            rowKey={(c) => c.id}
            actions={caseActions}
            searchPlaceholder="Filter all active cases..."
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4 outline-none space-y-6">
          <EnterpriseTable
            data={historyCases}
            columns={caseColumns}
            rowKey={(c) => c.id}
            actions={caseActions}
            searchPlaceholder="Search historical cases..."
          />
          
          <EnterpriseCard className="p-4 border-[#dfdfdf] shadow-sm">
             <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Recent Audit Stream</h3>
             <AuditTimeline activities={workflowActivities.slice(-6).reverse()} />
          </EnterpriseCard>
        </TabsContent>
      </Tabs>

      {/* Case Detail Panel */}
      {caseDetailOpen && selectedCase && (
        <CaseDetailPanel caseData={selectedCase} onClose={() => setCaseDetailOpen(false)} />
      )}

      {/* Action Modal */}
      <Dialog open={!!workItemAction} onOpenChange={() => setWorkItemAction(null)}>
        <DialogContent className="max-w-md p-0 border-none rounded-[3px] overflow-hidden">
          <div className="bg-[#100841] p-4 flex items-center justify-between">
             <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">Process Work Item</h2>
             <EnterpriseBadge variant="neutral" className="bg-white/10 text-white border-white/20">{workItemAction?.id}</EnterpriseBadge>
          </div>
          
          <div className="p-6 space-y-6">
            {workItemAction && (
              <>
                <div className="space-y-4">
                  <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px] space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Case Context</span><span className="text-[11px] font-bold text-[#100841]">{workItemAction.caseTitle}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Current Step</span><span className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">{workItemAction.stepName}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Priority</span><PriorityBadge priority={workItemAction.priority} /></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">Action Selection</label>
                    <div className="grid grid-cols-2 gap-2">
                      <EnterpriseButton variant="primary" className="bg-[#100841] uppercase tracking-widest text-[10px] h-10">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </EnterpriseButton>
                      <EnterpriseButton variant="secondary" className="border-[#c62828] text-[#c62828] hover:bg-[#fce4ec] uppercase tracking-widest text-[10px] h-10">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </EnterpriseButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">Decision Remarks</label>
                    <Textarea placeholder="Enter mandatory reason for rejection or optional comment for approval..." className="text-[12px] border-[#dfdfdf] rounded-[2px]" rows={4} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-[#efefff] border-t border-[#dfdfdf] flex justify-end gap-2">
             <EnterpriseButton variant="secondary" className="h-9 px-4 uppercase tracking-widest text-[10px] font-bold" onClick={() => setWorkItemAction(null)}>Cancel</EnterpriseButton>
             <EnterpriseButton variant="primary" className="h-9 px-6 bg-[#100841] uppercase tracking-widest text-[10px] font-bold">Confirm Transaction</EnterpriseButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

