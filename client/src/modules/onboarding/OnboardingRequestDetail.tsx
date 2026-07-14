/**
 * OnboardingRequestDetail — Advanced Step-by-Step Corporate Onboarding Audit & Workflow Portal
 * Features:
 * - Left Panel: Timeline of all 9 stages (Stage 0 to Stage 8) that are fully clickable.
 * - Left Panel Bottom: Audit Log comment submission which appends to the timeline in real time.
 * - Right Panel top: Expandable Corporate Info with attachments.
 * - Right Panel main: Stage-specific interactive content corresponding to the selected Audit Log step.
 * - Stage 6: Service Fee Setup & Repayment Fee Mapping with a fully interactive Pop-up Fee Simulator!
 * - Stage 7: Risk Caps configuration (Editable allowable EWA limits, Max employee caps, Max corporate caps).
 * - Stage 8: Finance Double-Entry Ledger validation & final sync activation.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  User, 
  Clock, 
  MessageSquare, 
  FileText, 
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Coins,
  Settings,
  Scale,
  Percent,
  PlayCircle,
  X,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Download,
  Plus
} from "lucide-react";
import { OnboardingRequest, STAGE_NAMES, OnboardingEmployee, FeeDefinition } from "./types";
import { MOCK_FEES } from "./mockData";
import { cn } from "@/lib/utils";

interface OnboardingRequestDetailProps {
  request: OnboardingRequest;
  onBack: () => void;
  onUpdate: (updatedRequest: OnboardingRequest) => void;
}

export default function OnboardingRequestDetail({ request, onBack, onUpdate }: OnboardingRequestDetailProps) {
  // Navigation / Click tracking for the Audit Steps
  const [selectedStep, setSelectedStep] = useState<number>(request.currentStage);
  const [isCorporateInfoExpanded, setIsCorporateInfoExpanded] = useState<boolean>(false);
  const [auditComment, setAuditComment] = useState("");

  // Stage 6 (Operations Review) states
  const [selectedServiceFeeId, setSelectedServiceFeeId] = useState<string>("FEE-001");
  const [selectedRepaymentFeeId, setSelectedRepaymentFeeId] = useState<string>("FEE-002");
  
  // Simulation pop-up dialog states
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simAmount, setSimAmount] = useState<number>(150000);
  const [simLateDays, setSimLateDays] = useState<number>(0);
  const [simTenure, setSimTenure] = useState<number>(12);
  const [simDay, setSimDay] = useState<number>(5);

  // Stage 7 (Risk Review) states
  const [allowableAmountLimit, setAllowableAmountLimit] = useState<number>(500000);
  const [maxCapEmployee, setMaxCapEmployee] = useState<number>(500000);
  const [maxCapCorporate, setMaxCapCorporate] = useState<number>(15000000);

  // Helper formatting
  const formatMMK = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace("MMK", "MMK ");
  };

  // ─── STAGE 6 SIMULATION CALCULATOR ENGINE ───
  const selectedServiceFee = MOCK_FEES.find(f => f.id === selectedServiceFeeId) || MOCK_FEES[0];
  const selectedRepaymentFee = MOCK_FEES.find(f => f.id === selectedRepaymentFeeId) || MOCK_FEES[1];

  const simulatedFeeResult = useMemo(() => {
    const logs: string[] = [];
    logs.push(`Initiating EWA drawdown policy evaluation engine for drawdown draw amount: ${formatMMK(simAmount)}.`);
    
    // Compute service fee
    let sFee = 0;
    if (selectedServiceFee.calculationType === 'fixed') {
      sFee = selectedServiceFee.value * 2500; // Translate virtual USD rate to MMK scale for Myanmar demonstration
      logs.push(`[Service Fee Map] Applied ${selectedServiceFee.name}: fixed base of ${formatMMK(sFee)}.`);
    } else if (selectedServiceFee.calculationType === 'percentage') {
      sFee = (simAmount * selectedServiceFee.value) / 100;
      logs.push(`[Service Fee Map] Applied ${selectedServiceFee.name}: ${selectedServiceFee.value}% of drawdown yielding ${formatMMK(sFee)}.`);
    } else {
      // Tiered
      if (simAmount <= 100000) sFee = 3500;
      else if (simAmount <= 300000) sFee = 7000;
      else sFee = 12000;
      logs.push(`[Service Fee Map] Applied Tiered Service Fee yielding ${formatMMK(sFee)} based on draw size.`);
    }

    // Compute repayment fee
    let rFee = 0;
    if (selectedRepaymentFee.calculationType === 'percentage') {
      rFee = (simAmount * selectedRepaymentFee.value) / 100;
      logs.push(`[Repayment Fee Map] Applied ${selectedRepaymentFee.name}: ${selectedRepaymentFee.value}% yield resulting in ${formatMMK(rFee)}.`);
    }

    // Check Late Period penalties
    let latePenalty = 0;
    if (simLateDays > 0) {
      latePenalty = (simAmount * 0.05); // 5% late rate
      logs.push(`[Arrears Penalty] Late period of ${simLateDays} days detected! Applying 5.0% arrears penalty: +${formatMMK(latePenalty)}.`);
    }

    const netComputedFee = sFee + rFee + latePenalty;
    logs.push(`[SUMMATION] Net Estimated Drawdown Cost: Service(${formatMMK(sFee)}) + Repayment(${formatMMK(rFee)}) + Penalty(${formatMMK(latePenalty)}) = ${formatMMK(netComputedFee)}.`);

    return {
      serviceFee: sFee,
      repaymentFee: rFee,
      latePenalty,
      netComputedFee,
      logs
    };
  }, [selectedServiceFeeId, selectedRepaymentFeeId, simAmount, simLateDays, simTenure, simDay]);

  // Handle comment submit
  const handleCommentSubmit = () => {
    if (!auditComment.trim()) return;
    const newAuditEntry = {
      id: `AUD-${Date.now()}`,
      stage: request.currentStage,
      action: "Review Commentary Registered",
      actorName: "Backoffice Reviewer",
      actorRole: "Compliance Auditor",
      timestamp: new Date().toISOString(),
      comment: auditComment
    };

    const updated = {
      ...request,
      auditTrail: [newAuditEntry, ...request.auditTrail]
    };
    onUpdate(updated);
    setAuditComment("");
  };

  // Handle workflow stage advancements
  const handleAdvanceStage = (nextStage: number, stageName: string) => {
    const actionName = `Approved & Sent to ${stageName}`;
    const comment = `Onboarding request progressed by compliance audit action.`;
    
    const newAuditEntry = {
      id: `AUD-${Date.now()}`,
      stage: request.currentStage,
      action: actionName,
      actorName: "Backoffice Lead",
      actorRole: request.currentStage === 6 ? "Operations" : request.currentStage === 7 ? "Risk" : "Finance",
      timestamp: new Date().toISOString(),
      comment
    };

    const isLast = nextStage > 8;
    const updated: OnboardingRequest = {
      ...request,
      currentStage: isLast ? 8 : nextStage,
      status: isLast ? "completed" : "pending_review",
      progress: isLast ? 100 : Math.round((nextStage / 8) * 100),
      auditTrail: [newAuditEntry, ...request.auditTrail]
    };

    onUpdate(updated);
    setSelectedStep(isLast ? 8 : nextStage);
    alert(`Stage advanced to Step ${isLast ? 8 : nextStage} [${STAGE_NAMES[isLast ? 8 : nextStage]}]!`);
  };

  return (
    <div className="flex flex-col h-full bg-[#efefff] text-[#100841] font-sans">
      
      {/* Dynamic Navigation Header */}
      <div className="px-6 py-3.5 border-b border-[#dfdfdf] bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-1.5 hover:bg-[#efefff] rounded-[3px] text-[#4f525d] hover:text-[#100841] transition-all border border-transparent hover:border-[#dfdfdf]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-bold text-[#100841] tracking-tight uppercase">{request.companyName}</h2>
              <span className={cn(
                "px-2 py-0.5 rounded-[2px] font-mono font-bold text-[8px] uppercase tracking-wider border",
                request.status === 'completed' ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]" : "bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]"
              )}>
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[9px] text-[#4f525d] uppercase tracking-widest font-bold mt-0.5">
              Request ID: {request.id} • Type: {request.type.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[10px] font-mono text-[#4f525d] bg-[#efefff] px-2.5 py-1 rounded-[1px] border border-[#dfdfdf]">
            Current Stage: <span className="text-[#100841] font-bold uppercase">{STAGE_NAMES[request.currentStage]}</span>
          </div>
          <button 
            onClick={onBack}
            className="btn-enterprise-secondary !py-1 !px-3 !text-[10px]"
          >
            Close Detail
          </button>
        </div>
      </div>

      {/* Main Container: Split Left (Timeline) & Right (Selected Step Details) */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        
        {/* Left Sidebar Panel: Sequential Clickable Stage Timeline */}
        <div className="w-80 border-r border-[#dfdfdf] bg-white flex flex-col shrink-0 min-h-0">
          
          <div className="p-4 border-b border-[#efefff] bg-[#efefff]">
            <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest flex items-center gap-2">
              <History size={15} className="text-[#31d891]" />
              Onboarding Audit Steps
            </h3>
            <p className="text-[9px] text-[#4f525d] mt-0.5 uppercase tracking-wide">
              Click any step below to review historical data and submit review logs.
            </p>
          </div>

          {/* Sequential Timeline Steps */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {STAGE_NAMES.map((name, i) => {
              const isCurrent = i === request.currentStage;
              const isCompleted = i < request.currentStage;
              const isSelected = selectedStep === i;

              // Find audit comment for this stage if any exists
              const stageComments = request.auditTrail.filter(entry => entry.stage === i);

              return (
                <button
                  key={name}
                  onClick={() => setSelectedStep(i)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-[3px] border transition-all flex items-start gap-3 relative group",
                    isSelected 
                      ? "bg-[#efefff] border-[#31d891] ring-1 ring-[#31d891]/15" 
                      : isCurrent 
                        ? "bg-amber-50/20 border-amber-300 hover:bg-[#efefff]"
                        : "bg-white border-[#dfdfdf] hover:bg-[#efefff]"
                  )}
                >
                  {/* Timeline Badge Indicators */}
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono shrink-0 border transition-all mt-0.5",
                    isCompleted 
                      ? "bg-[#e8f5e9] border-[#2e7d32] text-[#2e7d32]" 
                      : isCurrent 
                        ? "bg-[#fff3e0] border-[#e65100] text-[#e65100]" 
                        : "bg-white border-[#dfdfdf] text-[#868c95]"
                  )}>
                    {isCompleted ? <CheckCircle2 size={11} /> : i + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wide truncate",
                      isSelected ? "text-[#31d891]" : isCompleted ? "text-[#2e7d32]" : "text-[#100841]"
                    )}>
                      {name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-[#868c95] font-semibold uppercase">
                        {isCompleted ? "Verified Step" : isCurrent ? "Active Attention" : "Sequential Queue"}
                      </span>
                      {stageComments.length > 0 && (
                        <span className="text-[7.5px] bg-[#e3f2fd] text-[#0d47a1] px-1 py-0.5 rounded-[1px] font-mono font-bold">
                          {stageComments.length} LOGS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tiny indicator if this stage holds active attention */}
                  {isCurrent && (
                    <span className="absolute right-2.5 top-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Panel Bottom: Submit Audit Log comment */}
          <div className="p-4 border-t border-[#dfdfdf] bg-[#efefff]">
            <div className="relative">
              <MessageSquare className="absolute left-3 top-2.5 text-[#868c95]" size={12} />
              <textarea 
                placeholder="Type internal review comment for selected step..."
                value={auditComment}
                onChange={(e) => setAuditComment(e.target.value)}
                className="input-enterprise min-h-[60px] !pl-8 !py-2 !text-[11px] resize-none"
              ></textarea>
            </div>
            <button 
              onClick={handleCommentSubmit}
              disabled={!auditComment.trim()}
              className="btn-enterprise-primary w-full mt-2 !py-1.5 !text-[9.5px] uppercase tracking-wider font-bold disabled:opacity-40"
            >
              Submit Audit Comment
            </button>
          </div>
        </div>

        {/* Right Content Panel: Dynamic Selected Step Details & Corporate Header */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#efefff] min-h-0">
          
          {/* Corporate Info Card (Expandable to see detail with attachments) */}
          <section className="card-enterprise bg-white border-[#dfdfdf] overflow-hidden">
            <div 
              onClick={() => setIsCorporateInfoExpanded(!isCorporateInfoExpanded)}
              className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#efefff] transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ffffff] rounded-[2px] border border-[#dfdfdf]">
                  <Building2 size={16} className="text-[#100841]" />
                </div>
                <div>
                  <span className="text-[8px] text-[#4f525d] font-bold uppercase tracking-widest block">Corporate Profile</span>
                  <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-tight">{request.companyName}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">Tax ID</span>
                  <span className="text-[10px] font-mono font-bold text-[#100841]">{request.corporateInfo?.registrationNumber || "N/A"}</span>
                </div>
                <div className="p-1 text-[#868c95] group-hover:text-[#100841]">
                  <ChevronDown size={18} className={cn("transition-transform duration-300", isCorporateInfoExpanded && "rotate-180")} />
                </div>
              </div>
            </div>

            {/* Expandable detailed profile panel */}
            <AnimatePresence>
              {isCorporateInfoExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[#efefff] bg-[#fafbfc]"
                >
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Legal Registration No.</span>
                      <p className="text-[11px] font-mono font-bold text-[#100841]">{request.corporateInfo?.registrationNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Owner / Representative</span>
                      <p className="text-[11px] font-bold text-[#100841]">{request.corporateInfo?.ownerName || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Owner NRIC Card ID</span>
                      <p className="text-[11px] font-mono font-bold text-[#100841]">{request.corporateInfo?.ownerId || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Corporate Contacts</span>
                      <p className="text-[11px] font-bold text-[#100841]">{request.corporateInfo?.contactNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Registered Corporate Headquarters</span>
                      <p className="text-[11px] font-bold text-[#100841]">{request.corporateInfo?.address || "N/A"}</p>
                    </div>
                  </div>

                  {/* Document Attachments inside Expandable Area */}
                  <div className="px-5 pb-5 border-t border-[#efefff] pt-4">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider mb-2">Verified Compliance Documents ({request.documents.length})</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {request.documents.map(doc => (
                        <div key={doc.id} className="p-2 bg-white border border-[#dfdfdf] rounded-[2px] flex items-center justify-between hover:bg-[#efefff] transition-colors">
                          <div className="flex items-center gap-2">
                            <FileText size={13} className="text-[#31d891]" />
                            <div>
                              <p className="text-[10px] font-bold text-[#100841] leading-tight">{doc.name}</p>
                              <span className="text-[7px] text-[#2e7d32] font-mono font-bold uppercase">certified verified</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => alert(`Opening document viewer for: ${doc.name}`)}
                            className="text-[9px] font-bold text-[#31d891] hover:underline uppercase tracking-wide flex items-center gap-1"
                          >
                            <Download size={10} />
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Current Selected Stage Content Block */}
          <div className="card-enterprise bg-white border-[#dfdfdf]">
            
            {/* Header of selected stage content */}
            <div className="px-5 py-3 border-b border-[#efefff] bg-[#efefff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-[#31d891]" />
                <h4 className="text-[11px] font-bold text-[#100841] uppercase tracking-wider">
                  Stage Details: Step {selectedStep + 1} — {STAGE_NAMES[selectedStep]}
                </h4>
              </div>
              <span className="text-[9px] bg-[#e3f2fd] text-[#0d47a1] px-2 py-0.5 rounded-[1px] font-bold font-mono uppercase">
                {selectedStep === request.currentStage ? "Requires Attention" : "Archive Record"}
              </span>
            </div>

            {/* Stage Body */}
            <div className="p-5">
              
              {/* STAGE 0: LOGIN VERIFICATION */}
              {selectedStep === 0 && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#4f525d]">This step verified that the company administrator possesses the designated mobile phone account associated with the enterprise.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Mobile Authenticator</span>
                      <span className="text-[11px] font-mono font-bold text-[#100841]">{request.corporateInfo?.contactNumber || "N/A"}</span>
                    </div>
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Verification Timestamp</span>
                      <span className="text-[11px] font-mono font-bold text-[#100841]">{new Date(request.submissionDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 1: DOCUMENT UPLOAD */}
              {selectedStep === 1 && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#4f525d]">Upload and checksum check of statutory corporate certifications.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {request.documents.map(doc => (
                      <div key={doc.id} className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileCheck size={14} className="text-[#2e7d32]" />
                          <div>
                            <p className="text-[11px] font-bold text-[#100841]">{doc.name}</p>
                            <span className="text-[8px] text-slate-400 block font-mono">MD5: a98df...210ff</span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-[#e8f5e9] text-[#2e7d32] px-1.5 py-0.5 rounded-[1px] font-mono font-bold uppercase">Verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 2: PAYROLL POLICY */}
              {selectedStep === 2 && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#4f525d]">Registered corporate calendar rules for matching paydays, monthly EWA availability ranges, and cutoffs.</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Salary Cutoff Day</span>
                      <span className="text-[12px] font-mono font-bold text-[#100841]">{request.payrollPolicy?.salaryCutoffDay || "25"}th of month</span>
                    </div>
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">EWA Request Window</span>
                      <span className="text-[12px] font-mono font-bold text-[#100841]">Day {request.payrollPolicy?.ewaAllowStartDay || "1"} to {request.payrollPolicy?.ewaAllowEndDay || "20"}</span>
                    </div>
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Monthly Settlement Payday</span>
                      <span className="text-[12px] font-mono font-bold text-[#100841]">Day {request.payrollPolicy?.repaymentDay || "30"}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-[#dfdfdf] rounded-[2px]">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Standard Workdays Structure</span>
                    <div className="flex gap-1.5">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                        const active = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
                        return (
                          <span 
                            key={day} 
                            className={cn(
                              "px-2.5 py-1 text-[9px] font-bold border rounded-[1px]",
                              active ? "bg-[#100841] text-white border-[#100841]" : "bg-white text-slate-400 border-slate-200"
                            )}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: CORPORATE INFO */}
              {selectedStep === 3 && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#4f525d]">Verified statutory corporate entities, owners, and tax IDs.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-[#4f525d] uppercase font-bold">Corporate Entity Name</span>
                      <span className="text-[11px] font-bold text-[#100841] block mt-1">{request.corporateInfo?.companyName}</span>
                    </div>
                    <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                      <span className="text-[8px] text-[#4f525d] uppercase font-bold">Registration Number</span>
                      <span className="text-[11px] font-mono font-bold text-[#100841] block mt-1">{request.corporateInfo?.registrationNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 4: EMPLOYEE DATA */}
              {selectedStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-[#4f525d]">A total of <strong className="text-[#100841]">{request.employees.length}</strong> corporate employees are enrolled in the EWA benefits roster.</p>
                    <span className="text-[9px] text-[#2e7d32] font-bold uppercase bg-[#e8f5e9] px-2 py-0.5 border border-[#c8e6c9]">All verified</span>
                  </div>
                  <div className="border border-[#dfdfdf] rounded-[2px] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#efefff] border-b border-[#dfdfdf]">
                        <tr>
                          <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Employee Name / ID</th>
                          <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">NRC Passport ID</th>
                          <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Department</th>
                          <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Monthly Base Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#efefff] text-[11px]">
                        {request.employees.map(emp => (
                          <tr key={emp.id} className="hover:bg-[#efefff] transition-colors">
                            <td className="px-3 py-2 font-bold text-[#100841]">
                              {emp.name}
                              <span className="block text-[8px] text-slate-400 font-mono">{emp.id}</span>
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-500">{emp.nrc}</td>
                            <td className="px-3 py-2 text-[#4f525d]">{emp.department}</td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-700">{formatMMK(emp.salary)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STAGE 5: BUDGET REQUEST */}
              {selectedStep === 5 && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#4f525d]">Proposed EWA monthly pool capital allocation requested from external disbursement lines.</p>
                  <div className="p-5 bg-[#efefff] border border-[#dfdfdf] rounded-[3px] flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-[#4f525d] font-bold uppercase block tracking-wider">Approved EWA Liquidity Capital Pool</span>
                      <span className="text-[20px] font-mono font-extrabold text-[#31d891] tracking-tight">{formatMMK(request.budgetAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-[#4f525d] font-bold uppercase block tracking-wider">Max Cap Limit (30% payroll)</span>
                      <span className="text-[12px] font-mono font-bold text-slate-500">{formatMMK(request.employees.reduce((sum, e) => sum + e.salary, 0) * 0.3)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 6: OPERATION REVIEW — SETUP SERVICE & MAP FEES */}
              {selectedStep === 6 && (
                <div className="space-y-5">
                  <div className="message-strip-info">
                    <ShieldCheck size={14} className="shrink-0 text-[#0d47a1]" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px]">Operations Action Required</p>
                      <p className="mt-0.5 opacity-80 text-[10px]">Set up the service tier fees and map correct pricing profiles for corporate settlement.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Choose Service Fee */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Select Service Fee Profile</label>
                      <select 
                        value={selectedServiceFeeId}
                        onChange={(e) => setSelectedServiceFeeId(e.target.value)}
                        className="select-enterprise w-full"
                      >
                        <option value="FEE-001">Standard Service Fee (Fixed MMK 12,500)</option>
                        <option value="FEE-003">Premium Service Fee (Tiered Range)</option>
                      </select>
                      <p className="text-[9px] text-[#4f525d] italic mt-1">
                        Applied per single EWA transaction draw down.
                      </p>
                    </div>

                    {/* Choose Repayment Fee */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Select Repayment Fee Profile</label>
                      <select 
                        value={selectedRepaymentFeeId}
                        onChange={(e) => setSelectedRepaymentFeeId(e.target.value)}
                        className="select-enterprise w-full"
                      >
                        <option value="FEE-002">Standard Repayment Fee (2.5% of Amount)</option>
                      </select>
                      <p className="text-[9px] text-[#4f525d] italic mt-1">
                        Calculated dynamically at salary repayment day.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Pricing Outputs */}
                  <div className="p-4 bg-slate-50 border border-[#dfdfdf] rounded-[2px] grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Mapped Service Charge</span>
                      <p className="font-bold text-[#100841] mt-0.5">{selectedServiceFee.name}</p>
                      <p className="text-[#31d891] font-mono font-bold mt-1 text-[12px]">
                        {selectedServiceFee.calculationType === 'fixed' ? "MMK 12,500 Fixed" : "Tiered Calculation"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Mapped Repayment Charge</span>
                      <p className="font-bold text-[#100841] mt-0.5">{selectedRepaymentFee.name}</p>
                      <p className="text-[#31d891] font-mono font-bold mt-1 text-[12px]">
                        {selectedRepaymentFee.value}% of total repayment
                      </p>
                    </div>
                  </div>

                  {/* Simulator pop up button and main stage advance buttons */}
                  <div className="pt-4 border-t border-[#efefff] flex flex-wrap gap-2.5 items-center justify-between">
                    <button 
                      onClick={() => setIsSimulatorOpen(true)}
                      className="btn-enterprise-secondary text-[#31d891] border-[#31d891]/50 hover:bg-[#31d891]/5 flex items-center gap-1.5 !px-4 !py-1.5 !text-[11px] font-bold"
                    >
                      <PlayCircle size={14} />
                      Run Dynamic Drawdown Simulator
                    </button>

                    {request.currentStage === 6 && (
                      <button 
                        onClick={() => handleAdvanceStage(7, "Risk Review")}
                        className="btn-enterprise-primary !py-1.5 !px-5 !text-[11px] font-bold uppercase"
                      >
                        Approve Operations & Pass to Risk
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 7: RISK REVIEW — EDITABLE POLICY LIMITS & CAPS */}
              {selectedStep === 7 && (
                <div className="space-y-5">
                  <div className="message-strip-warning">
                    <ShieldCheck size={14} className="shrink-0 text-[#e65100]" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px]">Risk Audit Active</p>
                      <p className="mt-0.5 opacity-80 text-[10px]">Verify payroll schedules and define allowable EWA disbursement risk thresholds.</p>
                    </div>
                  </div>

                  {/* Non-editable payroll schedule for risk context */}
                  <div className="p-4 bg-[#efefff] border border-[#dfdfdf] rounded-[2px] space-y-2">
                    <h5 className="text-[10px] font-bold text-[#100841] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#31d891]" />
                      Active Payroll Schedule Context
                    </h5>
                    <div className="grid grid-cols-3 gap-2.5 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-medium">Cutoff:</span>
                        <span className="font-mono font-bold text-[#100841] block">{request.payrollPolicy?.salaryCutoffDay || "25"}th of month</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Pay Day:</span>
                        <span className="font-mono font-bold text-[#100841] block">Day {request.payrollPolicy?.payDay || "30"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Request Gap:</span>
                        <span className="font-mono font-bold text-[#100841] block">{request.payrollPolicy?.gapPolicy || "3 Days"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Editable limits */}
                  <div className="space-y-4 pt-2">
                    <h5 className="text-[10px] font-bold text-[#100841] uppercase tracking-wider">Configure Risk Threshold Caps</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Allowable EWA Amount limit per transaction */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Allowable EWA Limit</label>
                        <input 
                          type="number"
                          value={allowableAmountLimit}
                          onChange={(e) => setAllowableAmountLimit(Number(e.target.value))}
                          className="input-enterprise font-mono font-bold text-[#100841]"
                        />
                        <p className="text-[8px] text-[#868c95] italic">Max per drawdown request</p>
                      </div>

                      {/* Max Cap per Employee */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Max Cap Per Employee</label>
                        <input 
                          type="number"
                          value={maxCapEmployee}
                          onChange={(e) => setMaxCapEmployee(Number(e.target.value))}
                          className="input-enterprise font-mono font-bold text-[#100841]"
                        />
                        <p className="text-[8px] text-[#868c95] italic">Aggregate monthly limit</p>
                      </div>

                      {/* Max Cap per Corporate */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Max Cap Per Corporate Pool</label>
                        <input 
                          type="number"
                          value={maxCapCorporate}
                          onChange={(e) => setMaxCapCorporate(Number(e.target.value))}
                          className="input-enterprise font-mono font-bold text-[#100841]"
                        />
                        <p className="text-[8px] text-[#868c95] italic">Hard limit pool cap (MMK)</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.currentStage === 7 && (
                    <div className="pt-4 border-t border-[#efefff] flex justify-end">
                      <button 
                        onClick={() => handleAdvanceStage(8, "Finance Action")}
                        className="btn-enterprise-primary !py-1.5 !px-5 !text-[11px] font-bold uppercase bg-[#100841] hover:bg-[#31d891]"
                      >
                        Approve Risk & Send to Finance
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 8: FINANCE ACTION — LEDGER BALANCING */}
              {selectedStep === 8 && (
                <div className="space-y-5">
                  <div className="message-strip-success">
                    <Coins size={14} className="shrink-0 text-[#2e7d32]" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px]">Finance Ledger Ready for Activation</p>
                      <p className="mt-0.5 opacity-80 text-[10px]">Validate dynamic Double-Entry balancing and sync with the Circle General Ledger.</p>
                    </div>
                  </div>

                  {/* Double Entry Ledger Table */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-[#100841] uppercase tracking-wider flex items-center gap-1">
                      <Scale size={13} className="text-[#31d891]" />
                      Double-Entry Circle Ledger Projection
                    </h5>
                    
                    <div className="border border-[#dfdfdf] rounded-[2px] overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10.5px]">
                        <thead className="bg-[#efefff] border-b border-[#dfdfdf]">
                          <tr>
                            <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase">Account Title</th>
                            <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase">Type</th>
                            <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase text-right">Debit (MMK)</th>
                            <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase text-right">Credit (MMK)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#efefff]">
                          <tr>
                            <td className="px-3 py-2 font-bold text-[#100841]">Disbursement Pool (Asset)</td>
                            <td className="px-3 py-2 text-slate-500">Asset Account</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">{formatMMK(request.budgetAmount)}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">0 MMK</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-[#100841]">Apex Corporate Payable Account</td>
                            <td className="px-3 py-2 text-slate-500">Liability Account</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">0 MMK</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-amber-700">{formatMMK(request.budgetAmount)}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-[#100841]">Mapped Operations Revenue Account</td>
                            <td className="px-3 py-2 text-slate-500">Equity/Revenue</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">12,500 MMK</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">0 MMK</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-[#100841]">Repayment Receivables (Apex Staff)</td>
                            <td className="px-3 py-2 text-slate-500">Receivables</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">0 MMK</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-amber-700">12,500 MMK</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-[#efefff] font-bold border-t border-[#dfdfdf]">
                          <tr>
                            <td className="px-3 py-2 col-span-2">LEDGER BALANCE PROJECTION:</td>
                            <td className="px-3 py-2"></td>
                            <td className="px-3 py-2 text-right font-mono text-[#2e7d32]">{formatMMK(request.budgetAmount + 12500)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[#2e7d32]">{formatMMK(request.budgetAmount + 12500)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Balance Check Box */}
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-[2px] flex items-center justify-between text-[#2e7d32] text-[11px]">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Zero-Balance Verification Passed
                    </span>
                    <span className="font-mono font-bold">Total Debits = Total Credits</span>
                  </div>

                  {/* Actions */}
                  {request.status !== "completed" && (
                    <div className="pt-4 border-t border-[#efefff] flex justify-end">
                      <button 
                        onClick={() => handleAdvanceStage(9, "Completed")}
                        className="btn-enterprise-primary !py-1.5 !px-5 !text-[11px] font-bold uppercase bg-[#2e7d32] hover:bg-[#1b5e20]"
                      >
                        Complete Onboarding & Sync Ledger
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ─── STAGE 6: DRAWDOWN & FEE SIMULATION POP-UP DIALOG ─── */}
      <AnimatePresence>
        {isSimulatorOpen && (
          <div className="fixed inset-0 bg-[#100841]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#dfdfdf] rounded-[3px] shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              
              {/* Simulator Header */}
              <div className="bg-[#100841] text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlayCircle className="text-[#31d891]" size={18} />
                  <div>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider">Dynamic Drawdown & Fee Simulation</h3>
                    <p className="text-[9px] text-[#31d891] uppercase tracking-widest font-semibold">Verify policy output under mapped pricing fees in real-time</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSimulatorOpen(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Simulator Content Area: Split Input & Logs */}
              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5 min-h-0">
                
                {/* Inputs Column */}
                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-4 card-enterprise p-4 bg-[#efefff]">
                    <h4 className="text-[11px] font-bold text-[#100841] uppercase tracking-wider border-b pb-1">Drawdown Parameters</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f525d] uppercase block">EWA Request Size (MMK)</label>
                      <input 
                        type="number" 
                        value={simAmount}
                        onChange={(e) => setSimAmount(Number(e.target.value))}
                        className="input-enterprise font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f525d] uppercase block">Late Overdue Days (Arrears Check)</label>
                      <input 
                        type="number" 
                        value={simLateDays}
                        onChange={(e) => setSimLateDays(Number(e.target.value))}
                        className="input-enterprise font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f525d] uppercase block">Staff Member Tenure (Months)</label>
                      <input 
                        type="number" 
                        value={simTenure}
                        onChange={(e) => setSimTenure(Number(e.target.value))}
                        className="input-enterprise font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f525d] uppercase block">Calendar Request Day</label>
                      <input 
                        type="number" 
                        value={simDay}
                        onChange={(e) => setSimDay(Number(e.target.value))}
                        className="input-enterprise font-mono font-bold"
                        min={1}
                        max={31}
                      />
                    </div>
                  </div>
                </div>

                {/* Mathematical Summation and Trace Outputs */}
                <div className="md:col-span-7 space-y-4 flex flex-col">
                  
                  {/* Math Summation Summary */}
                  <div className="p-4 bg-white border border-[#dfdfdf] rounded-[2px] space-y-2.5">
                    <span className="text-[9px] font-bold text-[#100841] uppercase block tracking-wider border-b pb-1">Trace Mathematical Summation</span>
                    <div className="space-y-1.5 text-[11px]">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Selected Service Fee ({selectedServiceFee.id}):</span>
                        <span className="font-mono font-bold text-[#100841]">{formatMMK(simulatedFeeResult.serviceFee)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Selected Repayment Fee ({selectedRepaymentFee.id}):</span>
                        <span className="font-mono font-bold text-[#100841]">{formatMMK(simulatedFeeResult.repaymentFee)}</span>
                      </div>

                      {simulatedFeeResult.latePenalty > 0 && (
                        <div className="flex justify-between items-center text-red-600">
                          <span>Arrears Overdue Penalty (5.0%):</span>
                          <span className="font-mono font-bold">+{formatMMK(simulatedFeeResult.latePenalty)}</span>
                        </div>
                      )}

                      <div className="h-[1px] bg-[#efefff] my-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#100841] uppercase">Net Computed Drawdown Fee:</span>
                        <span className="text-[16px] font-mono font-extrabold text-[#e65100]">{formatMMK(simulatedFeeResult.netComputedFee)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Engine Logs Terminal */}
                  <div className="flex-1 flex flex-col min-h-[160px]">
                    <div className="bg-slate-900 rounded-[2px] p-3 text-[10px] font-mono text-emerald-400 flex-1 overflow-y-auto leading-relaxed space-y-1">
                      {simulatedFeeResult.logs.map((log, i) => (
                        <p key={i} className={cn(
                          log.startsWith("✓") ? "text-emerald-300" :
                          log.startsWith("[SUMMATION]") ? "text-amber-300 font-bold" : "text-slate-300"
                        )}>
                          {log}
                        </p>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Pop up Footer */}
              <div className="border-t border-[#dfdfdf] bg-[#efefff] px-5 py-3 flex justify-end">
                <button 
                  onClick={() => setIsSimulatorOpen(false)}
                  className="btn-enterprise-primary !py-1 !px-4 !text-[11px]"
                >
                  Apply & Exit Simulation
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
