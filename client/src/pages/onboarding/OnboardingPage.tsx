/**
 * OnboardingPage — Stateful Orchestrator for Company Onboarding
 * Implements Top-Level Tabs to provide ample space instead of a tight dialog modal.
 * Connects the shared state of Onboarding Requests across the Dashboard, Wizard, and Detail modules.
 */
import { useState } from "react";
import OnboardingDashboard from "@/modules/onboarding/OnboardingDashboard";
import OnboardingWizard from "@/modules/onboarding/OnboardingWizard";
import OnboardingRequestDetail from "@/modules/onboarding/OnboardingRequestDetail";
import { OnboardingRequest } from "@/modules/onboarding/types";
import { MOCK_ONBOARDING_REQUESTS } from "@/modules/onboarding/mockData";
import { Building2, ClipboardList, PlusCircle, AlertCircle } from "lucide-react";

export function OnboardingPage() {
  const [requests, setRequests] = useState<OnboardingRequest[]>(MOCK_ONBOARDING_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "new_onboarding" | "new_budget">("dashboard");

  const handleCreateRequest = (newReq: OnboardingRequest) => {
    setRequests((prev) => [newReq, ...prev]);
    setActiveTab("dashboard");
    // Show a quick browser alert or UI notification
    alert(`Successfully registered "${newReq.companyName}" at Stage 6 (Operations Review) for dynamic flow tracing!`);
  };

  const handleUpdateRequest = (updatedReq: OnboardingRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
    setSelectedRequest(updatedReq);
  };

  if (selectedRequest) {
    // If viewing details, render the full-screen interactive view detail page
    return (
      <OnboardingRequestDetail
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        onUpdate={handleUpdateRequest}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-[#efefff] font-sans">
      {/* Spacious Top Navigation Tabs */}
      <div className="bg-white border-b border-[#dfdfdf] px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 text-[12px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "dashboard" ? "text-[#31d891]" : "text-[#4f525d] hover:text-[#100841]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ClipboardList size={14} />
              Onboarding Portal
            </span>
            {activeTab === "dashboard" && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#31d891]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("new_onboarding")}
            className={`py-2 text-[12px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "new_onboarding" ? "text-[#31d891]" : "text-[#4f525d] hover:text-[#100841]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <PlusCircle size={14} />
              New Corporate Onboarding (Spacious Tab)
            </span>
            {activeTab === "new_onboarding" && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#31d891]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("new_budget")}
            className={`py-2 text-[12px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "new_budget" ? "text-[#31d891]" : "text-[#4f525d] hover:text-[#100841]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Building2 size={14} />
              New Budget Request
            </span>
            {activeTab === "new_budget" && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#31d891]" />
            )}
          </button>
        </div>
        <div className="text-[10px] bg-[#e3f2fd] text-[#0d47a1] px-2.5 py-1 rounded-[2px] font-bold uppercase tracking-wider border border-[#bbdefb]">
          2026 EWA Prototype
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        {activeTab === "dashboard" && (
          <OnboardingDashboard
            requests={requests}
            onNewOnboarding={() => setActiveTab("new_onboarding")}
            onViewDetails={(req) => setSelectedRequest(req)}
          />
        )}

        {activeTab === "new_onboarding" && (
          <div className="bg-white border border-[#dfdfdf] rounded-[3px] h-full overflow-hidden flex flex-col">
            <div className="bg-[#100841] text-white px-5 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider">Spacious Corporate Onboarding Flow</h3>
                <p className="text-[9px] text-[#31d891] uppercase tracking-widest font-bold mt-0.5">
                  Filled with realistic default data for immediate demo trace-through
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-[10px] text-white/70 hover:text-white uppercase tracking-wider bg-white/10 px-2 py-1 rounded-[2px]"
              >
                Back to Portal
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OnboardingWizard
                initialMode="onboarding"
                onSubmit={handleCreateRequest}
                onRequestClose={() => setActiveTab("dashboard")}
              />
            </div>
          </div>
        )}

        {activeTab === "new_budget" && (
          <div className="bg-white border border-[#dfdfdf] rounded-[3px] h-full overflow-hidden flex flex-col">
            <div className="bg-[#100841] text-white px-5 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider">Spacious Budget Request Flow</h3>
                <p className="text-[9px] text-[#31d891] uppercase tracking-widest font-bold mt-0.5">
                  Request incremental EWA fund allocations for approved entities
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-[10px] text-white/70 hover:text-white uppercase tracking-wider bg-white/10 px-2 py-1 rounded-[2px]"
              >
                Back to Portal
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OnboardingWizard
                initialMode="budget_request"
                onSubmit={handleCreateRequest}
                onRequestClose={() => setActiveTab("dashboard")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
