/**
 * MakerCheckerModal — Approval/Rejection dialog for settlement verification
 * Maker: Verifies bank reference, amount, screenshot → Approve/Reject with reason
 * Checker: Reviews Maker's verification → Approve/Reject with notes
 * Design: Enterprise Fintech — Modal with identity cards, reason textarea, and workflow context
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, XCircle, CheckCircle2, FileText, Banknote,
  Image, AlertTriangle, Info
} from "lucide-react";
import type { Settlement } from "@/data/mockData";

function formatMMK(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface MakerCheckerModalProps {
  settlement: Settlement;
  role: "MAKER" | "CHECKER";
  mode: "APPROVE" | "REJECT";
  onSubmit: (note: string, confirmed: boolean) => void;
  onClose: () => void;
}

export function MakerCheckerModal({ settlement, role, mode, onSubmit, onClose }: MakerCheckerModalProps) {
  const [note, setNote] = useState("");
  const [bankVerified, setBankVerified] = useState(false);
  const [amountVerified, setAmountVerified] = useState(false);
  const [screenshotVerified, setScreenshotVerified] = useState(false);

  const isApprove = mode === "APPROVE";
  const roleTitle = role === "MAKER" ? "Maker Verification" : "Checker Approval";
  const actionTitle = isApprove
    ? (role === "MAKER" ? "Verify Settlement" : "Approve Settlement")
    : "Reject Settlement";

  const headerBg = isApprove ? "border-emerald-400 bg-emerald-50/50" : "border-red-400 bg-red-50/50";
  const headerIconColor = isApprove ? (role === "MAKER" ? "text-blue-500" : "text-emerald-600") : "text-red-500";
  const badgeClass = isApprove
    ? "text-emerald-600 border-emerald-300 bg-emerald-50"
    : "text-red-600 border-red-300 bg-red-50";
  const confirmBtnClass = isApprove
    ? "bg-emerald-600 hover:bg-emerald-700"
    : "bg-[#100841] hover:bg-[#1a3250]";

  const verificationChecks = [
    { label: "Bank Reference Match", verified: bankVerified, set: setBankVerified, icon: Banknote },
    { label: "Amount Reconciliation", verified: amountVerified, set: setAmountVerified, icon: FileText },
    { label: "Payment Screenshot", verified: screenshotVerified, set: setScreenshotVerified, icon: Image },
  ];

  const allVerified = verificationChecks.every(v => v.verified);
  const canApprove = isApprove && role === "MAKER" ? allVerified : true;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-sm shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={"px-5 py-4 border-b-2 " + headerBg}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isApprove ? (
                <ShieldCheck className={"w-5 h-5 " + headerIconColor} />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <h3 className="text-sm font-bold text-[#100841]">
                  {roleTitle} — {actionTitle}
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{settlement.id} · {settlement.companyName}</p>
              </div>
            </div>
            <Badge variant="outline" className={"text-[9px] font-bold uppercase " + badgeClass}>
              {actionTitle}
            </Badge>
          </div>
        </div>

        {/* Settlement Summary */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-slate-50 rounded-sm border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-base font-bold font-mono text-[#100841]">{formatMMK(settlement.totalAmount)}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-sm border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Bank Reference</p>
              <p className="text-xs font-mono text-slate-600">{settlement.bankReference || "N/A"}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-sm border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Submitted By</p>
              <p className="text-xs text-slate-600">{settlement.submittedBy}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
            <Info className="w-3 h-3" />
            <span>Submitted: {settlement.submittedAt}</span>
            {settlement.makerVerifiedAt && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-blue-500">Maker Verified: {settlement.makerVerifiedAt}</span>
              </>
            )}
          </div>
        </div>

        {/* Maker Verification Checks */}
        {role === "MAKER" && isApprove && (
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Verification Checklist</p>
            <div className="space-y-2">
              {verificationChecks.map((check, i) => {
                const Icon = check.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-sm border border-slate-100 bg-slate-50/50">
                    <input
                      type="checkbox"
                      checked={check.verified}
                      onChange={() => check.set(!check.verified)}
                      className="w-4 h-4 rounded border-slate-300 accent-emerald-500"
                    />
                    <Icon className={"w-4 h-4 " + (check.verified ? "text-emerald-500" : "text-slate-300")} />
                    <span className={"text-xs " + (check.verified ? "text-slate-700 font-medium" : "text-slate-400")}>
                      {check.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Checker Review Summary */}
        {role === "CHECKER" && (
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Maker's Verification</p>
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-sm">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">All checks verified by Maker</span>
              </div>
              <p className="text-[10px] text-blue-400 mt-1">
                Bank reference, amount, and screenshot confirmed. Ready for Checker review.
              </p>
            </div>
          </div>
        )}

        {/* Notes / Reason Textarea */}
        <div className="px-5 py-4 border-b border-slate-100">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
            {isApprove ? "Approval Notes (Optional)" : "Rejection Reason (Required)"}
          </Label>
          <Textarea
            placeholder={isApprove
              ? "Add any notes about this settlement approval..."
              : "Enter the reason for rejecting this settlement..."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[80px] text-xs border-slate-200 resize-none"
          />
          {!isApprove && note.length < 5 && (
            <p className="text-[10px] text-red-400 mt-1">Minimum 5 characters required for rejection.</p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-slate-200"
              style={{ color: isApprove ? undefined : "#dc2626", borderColor: isApprove ? undefined : "#fca5a5" }}
              disabled={!isApprove && note.length < 5}
              onClick={() => onSubmit(note, false)}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Reject
            </Button>
            <Button
              size="sm"
              className={"h-8 text-xs " + confirmBtnClass}
              disabled={isApprove && role === "MAKER" && !allVerified}
              onClick={() => onSubmit(note, true)}
            >
              {isApprove ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  {role === "MAKER" ? "Verify" : "Approve"}
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Confirm Reject
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
