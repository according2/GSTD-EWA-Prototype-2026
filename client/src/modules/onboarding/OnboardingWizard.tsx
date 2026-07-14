/**
 * OnboardingWizard — Spacious Corporate Onboarding Flow
 * A 9-stage state-driven stepper that comes pre-filled with default Myanmar corporate data.
 * When submitted, it appends a new request at Stage 6 (Operation Review) so users can immediately trace advanced workflows.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Users, 
  FileCheck, 
  ShieldCheck, 
  Building2, 
  CreditCard,
  Search,
  Download,
  AlertCircle,
  Calculator,
  PlayCircle,
  Clock,
  User,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { STAGE_NAMES, OnboardingRequest, BUDGET_STAGE_NAMES, OnboardingEmployee } from "./types";
import { MOCK_FEES, MOCK_EMPLOYEES } from "./mockData";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  initialMode?: "onboarding" | "budget_request";
  onRequestClose: () => void;
  onSubmit: (request: OnboardingRequest) => void;
}

export default function OnboardingWizard({ initialMode = "onboarding", onRequestClose, onSubmit }: OnboardingWizardProps) {
  const [mode] = useState(initialMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  // Pre-filled form states for the prototype demo
  const [companyName, setCompanyName] = useState("Apex Frontier Group");
  const [registrationNumber, setRegistrationNumber] = useState("REG-2026-APX");
  const [address, setAddress] = useState("88 Merchant Road, Sule, Yangon, Myanmar");
  const [ownerName, setOwnerName] = useState("U Aung Min");
  const [ownerId, setOwnerId] = useState("12/YAKANA(N)998877");
  const [contactNumber, setContactNumber] = useState("09 987654321");
  const [budgetAmount, setBudgetAmount] = useState(5000000);
  const [employees, setEmployees] = useState<OnboardingEmployee[]>(MOCK_EMPLOYEES);

  const stages = mode === "onboarding" ? STAGE_NAMES : BUDGET_STAGE_NAMES;

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < stages.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission! Construct the request object
      const newRequest: OnboardingRequest = {
        id: `REQ-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        type: mode,
        companyId: `COM-${String(Math.floor(Math.random() * 90) + 10)}`,
        companyName,
        currentStage: 6, // Go directly to Operations review to allow immediate, interactive step tracing!
        status: "pending_review",
        submissionDate: new Date().toISOString(),
        progress: 66,
        documents: [
          { id: "DOC-01", name: "Business Registration (Form 6/26)", type: "pdf", status: "verified", uploadDate: "2026-07-14" },
          { id: "DOC-02", name: "Tax Clearance Certificate", type: "pdf", status: "verified", uploadDate: "2026-07-14" },
          { id: "DOC-03", name: "Director Identity Card / NRIC", type: "pdf", status: "verified", uploadDate: "2026-07-14" },
          { id: "DOC-04", name: "Bank Account Details (Company)", type: "pdf", status: "verified", uploadDate: "2026-07-14" }
        ],
        payrollPolicy: {
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          salaryCutoffDay: 25,
          payDay: 30,
          ewaAllowStartDay: 1,
          ewaAllowEndDay: 20,
          repaymentDay: 30,
          effectiveDate: "2026-08-01",
          gapPolicy: "Standard 3-day verification gap"
        },
        corporateInfo: {
          companyName,
          registrationNumber,
          address,
          ownerName,
          ownerId,
          contactNumber
        },
        employees,
        budgetAmount,
        selectedFees: [],
        auditTrail: [
          { id: "AUD-101", stage: 0, action: "Login Verified", actorName: "HR Manager", actorRole: "HR", timestamp: new Date().toISOString() },
          { id: "AUD-102", stage: 1, action: "Documents Uploaded", actorName: "HR Manager", actorRole: "HR", timestamp: new Date().toISOString(), comment: "Automated verification complete." },
          { id: "AUD-103", stage: 5, action: "Budget Submitted", actorName: "HR Manager", actorRole: "HR", timestamp: new Date().toISOString() }
        ]
      };
      onSubmit(newRequest);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Sidebar Progress Stepper */}
      <div className="w-60 border-r border-[#dfdfdf] bg-[#efefff] flex flex-col p-5 overflow-y-auto shrink-0">
        <div className="space-y-3.5">
          {stages.map((name, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isLocked = index > Math.max(...completedSteps, -1) + 1;

            return (
              <button
                key={name}
                disabled={isLocked}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-full flex items-center gap-3 text-left transition-all group relative py-1.5",
                  isLocked ? "opacity-40 cursor-not-allowed" : "opacity-100"
                )}
              >
                <div className={cn(
                  "step-node shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-mono font-extrabold",
                  isActive ? "bg-[#31d891] border-[#31d891] text-white" : isCompleted ? "bg-[#2e7d32] border-[#2e7d32] text-white" : "bg-white border-[#dfdfdf] text-[#4f525d]"
                )}>
                  {isCompleted ? <Check size={12} /> : index + 1}
                </div>
                <div className="min-w-0">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider block truncate",
                    isActive ? "text-[#31d891]" : isCompleted ? "text-[#2e7d32]" : "text-[#4f525d]"
                  )}>
                    {name}
                  </span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-marker" className="absolute -right-5 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#31d891] rounded-l-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Fields Panel */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-[#efefff] pb-3">
              <h2 className="text-[14px] font-bold text-[#100841] uppercase tracking-wider">
                {stages[currentStep]} Step Content
              </h2>
              <p className="text-[10px] text-[#4f525d] mt-0.5 uppercase tracking-wide">
                Provide or confirm the registered values to advance company setup.
              </p>
            </div>

            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="message-strip-info">
                  <AlertCircle size={14} className="shrink-0 text-[#0d47a1]" />
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px]">Verification Completed</p>
                    <p className="mt-0.5 opacity-80 text-[10px]">Your account is authenticated via registered SMS verification.</p>
                  </div>
                </div>
                <div className="card-enterprise p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text" 
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="input-enterprise font-mono font-bold"
                    />
                  </div>
                  <div className="status-badge-success !px-3 !py-2 w-full justify-start rounded-[3px]">
                    <CheckCircle2 size={14} />
                    <div className="text-left">
                      <p className="text-[11px] font-bold">Verified Account: {companyName}</p>
                      <p className="text-[9px] opacity-80 font-mono mt-0.5">Registration Status: Authenticated</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-[11px] text-[#4f525d]">Verify all corporate legal filings. The system automatically prefilled verified files for testing.</p>
                <div className="grid gap-2.5">
                  {[
                    "Business Registration (Form 6/26)",
                    "Tax Clearance Certificate",
                    "Director Identity Card / NRIC",
                    "Bank Account Details (Company)"
                  ].map((docName, i) => (
                    <div key={i} className="card-enterprise p-3 flex items-center justify-between hover:bg-[#efefff] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-[2px] border bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]">
                          <FileCheck size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#100841]">{docName}</p>
                          <span className="text-[8px] bg-[#e8f5e9] text-[#2e7d32] font-extrabold uppercase px-1 py-0.5 rounded-[1px] tracking-wide">verified</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#4f525d] font-mono">Attachment_V3.pdf</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Working Days</label>
                    <div className="flex flex-wrap gap-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                        <button 
                          key={day}
                          className={cn(
                            "w-8 h-8 rounded-[2px] text-[10px] font-bold border transition-all",
                            ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day) 
                              ? "bg-[#100841] text-white border-[#100841]" 
                              : "bg-white text-[#868c95] border-[#dfdfdf]"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Repayment Method</label>
                    <select className="select-enterprise w-full">
                      <option>Last Day of Month (30th/31st)</option>
                      <option>25th of Month</option>
                      <option>5th of Next Month</option>
                    </select>
                  </div>
                </div>

                <div className="card-enterprise p-4 space-y-3 border-t-2 border-t-[#31d891]">
                  <h4 className="text-[10px] font-bold text-[#31d891] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={14} />
                    Payroll Cycle Setup
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-[#4f525d] uppercase font-bold tracking-wider">Salary Cut-off Day</label>
                      <input type="number" defaultValue={25} className="input-enterprise font-bold font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-[#4f525d] uppercase font-bold tracking-wider">EWA Eligible Days Range</label>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={1} className="input-enterprise text-center font-bold" />
                        <span className="text-[#868c95] text-[10px]">to</span>
                        <input type="number" defaultValue={20} className="input-enterprise text-center font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Company Legal Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input-enterprise font-bold text-[#100841]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Registration Number</label>
                    <input 
                      type="text" 
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="input-enterprise font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Corporate Address</label>
                    <textarea 
                      rows={2} 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-enterprise resize-none font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Owner / Director Name</label>
                    <input 
                      type="text" 
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="input-enterprise font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest block">Owner NRC ID</label>
                    <input 
                      type="text" 
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      className="input-enterprise font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-[11px] text-[#4f525d]">Verified workforce to be enrolled into the EWA ledger benefits.</p>
                <div className="border border-[#dfdfdf] rounded-[3px] overflow-hidden max-h-[220px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#efefff] sticky top-0 border-b border-[#dfdfdf]">
                      <tr>
                        <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Employee</th>
                        <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Position</th>
                        <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Base Salary</th>
                        <th className="px-3 py-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefff]">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-[#efefff] transition-colors">
                          <td className="px-3 py-2">
                            <p className="text-[11px] font-bold text-[#100841]">{emp.name}</p>
                            <span className="text-[8px] font-mono text-slate-400">{emp.id}</span>
                          </td>
                          <td className="px-3 py-2 text-[10px] text-[#4f525d]">{emp.position}</td>
                          <td className="px-3 py-2 text-[10px] font-mono text-[#100841] font-bold">MMK {emp.salary.toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span className="status-badge-success !text-[8px] !px-1.5">verified</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#e3f2fd] flex items-center justify-center border border-[#bbdefb] mb-1">
                  <Calculator size={20} className="text-[#1565c0]" />
                </div>
                <div className="text-center">
                  <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">Dynamic Budget Proposal</h3>
                  <p className="text-[10px] text-[#4f525d] mt-0.5">Proposed EWA pool allocation based on verified workforce salaries.</p>
                </div>

                <div className="w-full max-w-md card-enterprise overflow-hidden border-t-2 border-t-[#100841]">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#efefff] pb-2 text-[11px]">
                      <span className="text-[#4f525d] font-medium">Aggregated Monthly Payroll</span>
                      <span className="font-mono text-[#100841] font-bold">MMK {employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#efefff] pb-2 text-[11px]">
                      <span className="text-[#4f525d] font-medium">Standard EWA Liquidity Cap</span>
                      <span className="font-mono text-[#31d891] font-bold">30% Max</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-[#100841] uppercase tracking-wider">Requested Budget Pool</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#4f525d] font-bold">MMK</span>
                        <input 
                          type="number"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(Number(e.target.value))}
                          className="input-enterprise !w-32 text-right font-mono font-bold text-[#31d891] !py-0.5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#efefff] px-3 py-2 border-t border-[#dfdfdf] flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#2e7d32]" />
                    <p className="text-[9px] text-[#4f525d] italic font-bold uppercase tracking-tight">EWA Limit pre-validated by compliance rules</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep > 5 && (
              <div className="space-y-4">
                <div className="message-strip-warning">
                  <ShieldCheck size={14} className="shrink-0 text-[#e65100]" />
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px]">Under Review Simulation</p>
                    <p className="mt-0.5 opacity-80 text-[10px]">These steps are advanced stages. To trace them dynamically, submit this corporate record to trace each flow step-by-step!</p>
                  </div>
                </div>
                <div className="card-enterprise p-5 text-center space-y-3">
                  <p className="text-[12px] font-bold text-[#100841]">Pre-fill and proceed to registration.</p>
                  <p className="text-[10px] text-[#4f525d] leading-relaxed">
                    By submitting now, this company registration is created dynamically at Stage 6 (Operation Review) allowing you to view and interact with real back-office actions instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spacious Wizard Footer */}
        <div className="border-t border-[#dfdfdf] bg-[#efefff] px-6 py-3.5 flex items-center justify-between shrink-0">
          <button 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-enterprise-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
            <span>Previous Step</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                // Instantly prefill & submit for quick prototype tracing
                setCompanyName("Apex Frontier Group");
                setRegistrationNumber("REG-2026-APX");
                setAddress("88 Merchant Road, Sule, Yangon, Myanmar");
                setOwnerName("U Aung Min");
                setOwnerId("12/YAKANA(N)998877");
                setContactNumber("09 987654321");
                setBudgetAmount(5000000);
                setCurrentStep(stages.length - 1);
              }}
              className="btn-enterprise-secondary !border-dashed text-[#31d891] hover:border-[#31d891]"
            >
              Quick Auto-Fill
            </button>
            <button 
              onClick={handleNext}
              className="btn-enterprise-primary"
            >
              <span>{currentStep === stages.length - 1 ? "Register & Trace Corporate Onboarding" : "Save & Continue"}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
