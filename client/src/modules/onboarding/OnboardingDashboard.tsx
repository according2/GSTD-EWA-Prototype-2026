/**
 * Company Onboarding Dashboard
 * Features: "My Requests" and "My Tasks" tabs with status badges and progress bars.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  ChevronRight, 
  Filter,
  ArrowRight,
  User,
  History,
  MessageSquare
} from "lucide-react";
import { MOCK_ONBOARDING_REQUESTS, MOCK_TASKS } from "./mockData";
import { OnboardingRequest, OnboardingTask, STAGE_NAMES } from "./types";

interface OnboardingDashboardProps {
  requests?: OnboardingRequest[];
  onNewOnboarding?: () => void;
  onViewDetails?: (request: OnboardingRequest) => void;
}

export default function OnboardingDashboard({ requests = MOCK_ONBOARDING_REQUESTS, onNewOnboarding, onViewDetails }: OnboardingDashboardProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "tasks">("requests");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingTasksCount = MOCK_TASKS.filter(t => t.status === "pending").length;
  const returnedRequestsCount = requests.filter(r => r.status === "returned").length;

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Header Section — Enterprise Toolbar Pattern */}
      <div className="enterprise-toolbar mb-4">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Company Onboarding</h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Manage corporate registrations and EWA budget requests.</p>
        </div>
        <button 
          onClick={onNewOnboarding}
          className="btn-enterprise-primary"
        >
          <Plus size={14} />
          <span>New Onboarding</span>
        </button>
      </div>

      {/* Main Container — Tab Panel Enterprise */}
      <div className="tab-panel-enterprise flex-1 flex flex-col min-h-0">
        {/* Tab Selection */}
        <div className="flex items-center gap-6 border-b border-[#dfdfdf] mb-4">
          <button 
            onClick={() => setActiveTab("requests")}
            className={`pb-2 text-[11px] font-bold uppercase tracking-wider transition-all relative ${activeTab === "requests" ? "text-[#31d891]" : "text-[#4f525d] hover:text-[#100841]"}`}
          >
            My Requests
            {returnedRequestsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-[2px] bg-[#fff3e0] text-[#e65100] text-[8px] border border-[#ffe0b2]">
                {returnedRequestsCount}
              </span>
            )}
            {activeTab === "requests" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#31d891]" />}
          </button>
          <button 
            onClick={() => setActiveTab("tasks")}
            className={`pb-2 text-[11px] font-bold uppercase tracking-wider transition-all relative ${activeTab === "tasks" ? "text-[#31d891]" : "text-[#4f525d] hover:text-[#100841]"}`}
          >
            My Tasks
            {pendingTasksCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-[2px] bg-[#e3f2fd] text-[#1565c0] text-[8px] border border-[#bbdefb]">
                {pendingTasksCount}
              </span>
            )}
            {activeTab === "tasks" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#31d891]" />}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#868c95]" size={14} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="input-enterprise pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-enterprise-secondary px-3 py-1.5">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {activeTab === "requests" ? (
              <motion.div 
                key="requests-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                {requests
                  .filter((r) => r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((request) => (
                    <RequestCard 
                      key={request.id} 
                      request={request} 
                      onClick={() => onViewDetails?.(request)}
                    />
                  ))}
              </motion.div>
            ) : (
              <motion.div 
                key="tasks-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                {MOCK_TASKS.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, onClick }: { request: OnboardingRequest; onClick: () => void }) {
  const getStatusVariant = (status: string): "neutral" | "info" | "warning" | "success" | "error" => {
    switch (status) {
      case "draft": return "neutral";
      case "pending_review": return "info";
      case "returned": return "warning";
      case "approved":
      case "completed": return "success";
      case "rejected": return "error";
      default: return "neutral";
    }
  };

  return (
    <div 
      onClick={onClick}
      className="card-enterprise p-3 hover:border-[#31d891]/50 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[2px] bg-[#efefff] border border-[#dfdfdf]">
            <FileText size={16} className="text-[#100841]" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-[#100841] group-hover:text-[#31d891] transition-colors">{request.companyName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-[#868c95] uppercase tracking-wider">{request.id}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-[#dfdfdf]" />
              <span className="text-[9px] text-[#4f525d] uppercase tracking-wider font-semibold">{request.type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <div className={`status-badge-${getStatusVariant(request.status)}`}>
          {request.status.replace('_', ' ')}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#4f525d] font-medium uppercase tracking-tight">Stage: <span className="text-[#100841] font-bold">{STAGE_NAMES[request.currentStage]}</span></span>
          <span className="text-[#31d891] font-bold font-mono">{request.progress}%</span>
        </div>
        <div className="h-1 w-full bg-[#efefff] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${request.progress}%` }}
            className="h-full bg-[#31d891]"
          />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#efefff] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-[#868c95] font-medium">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{new Date(request.submissionDate).toLocaleDateString()}</span>
          </div>
          {request.status === "returned" && (
            <div className="flex items-center gap-1 text-[#e65100]">
              <AlertCircle size={11} />
              <span className="uppercase tracking-tight">Returned</span>
            </div>
          )}
        </div>
        <button className="flex items-center gap-1 text-[10px] font-bold text-[#31d891] hover:underline uppercase tracking-wide">
          View Detail
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: OnboardingTask }) {
  const priorityStyles = {
    low: "text-[#4f525d] bg-[#efefff] border-[#dfdfdf]",
    medium: "text-[#e65100] bg-[#fff3e0] border-[#ffe0b2]",
    high: "text-[#c62828] bg-[#fce4ec] border-[#ffcdd2]",
  };

  return (
    <div className="card-enterprise p-3 hover:border-[#31d891]/50 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-[2px] bg-[#efefff] border border-[#dfdfdf]">
            <CheckCircle2 size={16} className="text-[#31d891]" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-[#100841] group-hover:text-[#31d891] transition-colors">{task.actionRequired}</h3>
            <p className="text-[10px] text-[#4f525d] mt-0.5 font-medium">{task.companyName} • {task.requestType.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold uppercase tracking-widest border ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#868c95] uppercase font-bold tracking-widest">Assignee</span>
            <div className="flex items-center gap-1 text-[10px] text-[#100841] font-semibold">
              <User size={11} className="text-[#31d891]" />
              <span>{task.assignedRole}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#868c95] uppercase font-bold tracking-widest">Due</span>
            <div className="flex items-center gap-1 text-[10px] text-[#100841] font-semibold">
              <Clock size={11} className="text-[#868c95]" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-enterprise-secondary !px-2.5 !py-1 !text-[10px]">
            Audit
          </button>
          <button className="btn-enterprise-primary !px-2.5 !py-1 !text-[10px]">
            Process
          </button>
        </div>
      </div>
    </div>
  );
}

