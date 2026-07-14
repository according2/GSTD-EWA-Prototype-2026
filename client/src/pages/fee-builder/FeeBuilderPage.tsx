/**
 * FeeBuilderPage — Fee Builder & Policy Engine
 * Design: Enterprise Precision — Navy (#100841) + Teal (#31d891) | Sharp corners | Structured layouts
 * Focus: Complete 4-layer hierarchical policy engine, editing, forking, interactive simulation, and audit logs.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Tag,
  Receipt,
  DollarSign,
  Plus,
  Play,
  History,
  Edit2,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calculator,
  User,
  Shield,
  FileText,
  Landmark,
  PlusCircle,
  HelpCircle,
  Check,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseInput,
  EnterpriseSelect,
  EnterpriseKpiCard
} from "@/components/EnterpriseComponents";

// ─── TYPES ───

export interface CriteriaRule {
  attrCode: string; // e.g. "Channel", "Transaction_Type", "Days_Overdue", "Amount"
  attrLabel: string;
  operator: "Equals" | "Not_Equals" | "Greater_Than" | "Less_Than" | "Between" | "In_List";
  value: string;
}

export interface PricingTier {
  priorityOrder: number;
  startValue: number;
  endValue: number; // 999999999 for Infinity
  calcType: "Flat" | "Percent" | "Hybrid";
  flatAmount: number;
  percentRate: number;
  minCap: number;
  maxCap: number;
}

export interface DistributionSplit {
  entityType: "Agent" | "Partner" | "Internal_System" | "External_Bank";
  entityName: string;
  percentage: number; // e.g. 40 for 40%
  debitGlCode: string;
  creditGlCode: string;
  isTaxBearing: boolean;
}

export interface FeeRule {
  id: string; // e.g., FEE-001
  name: string;
  description: string;
  status: "Draft" | "Pending_Approval" | "Active" | "Inactive" | "Archived";
  chargeParty: "Sender" | "Receiver";
  chargeSubject: "Company" | "Employee";
  priority: number; // Lower priority number evaluated first
  effectiveDate: string;
  expiredDate: string;
  refundBehavior: "Auto-Reverse" | "Non-Refundable";
  taxBehavior: "Inclusive" | "Exclusive";
  taxCode: string;
  criteria: CriteriaRule[];
  tiers: PricingTier[];
  distribution: DistributionSplit[];
}

export interface AuditLog {
  timestamp: string;
  feeId: string;
  feeName: string;
  action: "Create" | "Edit" | "Approve" | "Activate" | "Deactivate" | "Fork";
  user: string;
  details: string;
}

// ─── INITIAL MOCK DATA ───

const INITIAL_FEES: FeeRule[] = [
  {
    id: "FEE-001",
    name: "Standard EWA Disbursement Fee",
    description: "Core fee structure applied to standard EWA drawdowns across all standard payment channels.",
    status: "Active",
    chargeParty: "Receiver",
    chargeSubject: "Employee",
    priority: 1,
    effectiveDate: "2026-01-01",
    expiredDate: "2026-12-31",
    refundBehavior: "Non-Refundable",
    taxBehavior: "Exclusive",
    taxCode: "TAX-VAT-5",
    criteria: [
      { attrCode: "Transaction_Type", attrLabel: "Txn Type", operator: "Equals", value: "Disbursement" },
      { attrCode: "Channel", attrLabel: "Channel", operator: "In_List", value: "KBZ Pay, Wave, CB Pay" }
    ],
    tiers: [
      { priorityOrder: 1, startValue: 0, endValue: 50000, calcType: "Percent", flatAmount: 0, percentRate: 1.5, minCap: 500, maxCap: 1500 },
      { priorityOrder: 2, startValue: 50001, endValue: 150000, calcType: "Percent", flatAmount: 0, percentRate: 1.0, minCap: 1000, maxCap: 2500 },
      { priorityOrder: 3, startValue: 150001, endValue: 999999999, calcType: "Percent", flatAmount: 0, percentRate: 0.75, minCap: 1500, maxCap: 5000 }
    ],
    distribution: [
      { entityType: "Internal_System", entityName: "EWA Platform Core Balance", percentage: 40, debitGlCode: "1100", creditGlCode: "4000", isTaxBearing: true },
      { entityType: "Partner", entityName: "Corporate Sponsoring Bank", percentage: 30, debitGlCode: "2100", creditGlCode: "2200", isTaxBearing: false },
      { entityType: "Agent", entityName: "EWA Local Disbursement Agent", percentage: 30, debitGlCode: "5200", creditGlCode: "1100", isTaxBearing: false }
    ]
  },
  {
    id: "FEE-002",
    name: "Wave Pay Premium Routing Fee",
    description: "Special channel premium surcharge for real-time disburse via Wave Money network agents.",
    status: "Active",
    chargeParty: "Sender",
    chargeSubject: "Company",
    priority: 2,
    effectiveDate: "2026-01-01",
    expiredDate: "2026-12-31",
    refundBehavior: "Auto-Reverse",
    taxBehavior: "Inclusive",
    taxCode: "TAX-VAT-5",
    criteria: [
      { attrCode: "Channel", attrLabel: "Channel", operator: "Equals", value: "Wave" },
      { attrCode: "Transaction_Type", attrLabel: "Txn Type", operator: "Equals", value: "Disbursement" }
    ],
    tiers: [
      { priorityOrder: 1, startValue: 0, endValue: 999999999, calcType: "Flat", flatAmount: 2000, percentRate: 0, minCap: 0, maxCap: 0 }
    ],
    distribution: [
      { entityType: "External_Bank", entityName: "Wave Pay Network Partner", percentage: 100, debitGlCode: "5200", creditGlCode: "1100", isTaxBearing: true }
    ]
  },
  {
    id: "FEE-003",
    name: "High-Growth Corporate Promo Rate",
    description: "Promotional discount rate for employees drawing via KBZ Pay with lower fees.",
    status: "Draft",
    chargeParty: "Receiver",
    chargeSubject: "Employee",
    priority: 5,
    effectiveDate: "2026-06-01",
    expiredDate: "2026-09-30",
    refundBehavior: "Non-Refundable",
    taxBehavior: "Exclusive",
    taxCode: "TAX-NONE",
    criteria: [
      { attrCode: "Transaction_Type", attrLabel: "Txn Type", operator: "Equals", value: "Disbursement" },
      { attrCode: "Channel", attrLabel: "Channel", operator: "Equals", value: "KBZ Pay" }
    ],
    tiers: [
      { priorityOrder: 1, startValue: 0, endValue: 999999999, calcType: "Hybrid", flatAmount: 500, percentRate: 0.5, minCap: 1000, maxCap: 3000 }
    ],
    distribution: [
      { entityType: "Internal_System", entityName: "EWA Platform Core Balance", percentage: 50, debitGlCode: "1100", creditGlCode: "4000", isTaxBearing: true },
      { entityType: "Partner", entityName: "Corporate Sponsoring Bank", percentage: 50, debitGlCode: "2100", creditGlCode: "2200", isTaxBearing: false }
    ]
  },
  {
    id: "FEE-004",
    name: "Extended Late Repayment Penalty",
    description: "Arrears collection penalty triggered when repayments exceed the established corporate cutoff date.",
    status: "Active",
    chargeParty: "Receiver",
    chargeSubject: "Employee",
    priority: 10,
    effectiveDate: "2026-01-01",
    expiredDate: "2026-12-31",
    refundBehavior: "Non-Refundable",
    taxBehavior: "Exclusive",
    taxCode: "TAX-VAT-5",
    criteria: [
      { attrCode: "Transaction_Type", attrLabel: "Txn Type", operator: "Equals", value: "Repayment" },
      { attrCode: "Days_Overdue", attrLabel: "Overdue Days", operator: "Greater_Than", value: "5" }
    ],
    tiers: [
      { priorityOrder: 1, startValue: 0, endValue: 999999999, calcType: "Percent", flatAmount: 0, percentRate: 5.0, minCap: 2000, maxCap: 20000 }
    ],
    distribution: [
      { entityType: "Internal_System", entityName: "Arrears Recovery Pool", percentage: 100, debitGlCode: "1100", creditGlCode: "4100", isTaxBearing: true }
    ]
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  { timestamp: "2026-07-10 10:24", feeId: "FEE-001", feeName: "Standard EWA Disbursement Fee", action: "Activate", user: "platform_admin@ewa.com", details: "Activated EWA Core Policy for Q3 cycle" },
  { timestamp: "2026-07-11 14:15", feeId: "FEE-002", feeName: "Wave Pay Premium Routing Fee", action: "Activate", user: "platform_admin@ewa.com", details: "Activated Premium Routing Charge for Wave Money" },
  { timestamp: "2026-07-12 11:00", feeId: "FEE-003", feeName: "High-Growth Corporate Promo Rate", action: "Create", user: "finance_lead@ewa.com", details: "Created Draft policy for KBZ Pay promotional cycle" },
  { timestamp: "2026-07-13 09:30", feeId: "FEE-004", feeName: "Extended Late Repayment Penalty", action: "Edit", user: "risk_reviewer@ewa.com", details: "Modified Max Cap ceiling from 15,000 to 20,000 MMK" }
];

const METADATA_ATTRIBUTES = [
  { code: "Channel", label: "Payout Channel" },
  { code: "Transaction_Type", label: "Transaction Type" },
  { code: "Days_Overdue", label: "Late Days Count" },
  { code: "Amount", label: "Transaction Amount" },
  { code: "Employee_Tenure", label: "Employee Tenure (Months)" }
];

const GL_ACCOUNTS = [
  { code: "1100", name: "Cash & Bank" },
  { code: "1200", name: "Advance Receivable" },
  { code: "2100", name: "Suspense GL" },
  { code: "2200", name: "Settlement Payable" },
  { code: "4000", name: "Fee Revenue" },
  { code: "4100", name: "Late Fee Revenue" },
  { code: "5200", name: "Payment Gateway Fees" }
];

export function FeeBuilderPage() {
  // ─── STATE ───
  const [fees, setFees] = useState<FeeRule[]>(() => {
    const saved = localStorage.getItem("ewa_fees");
    return saved ? JSON.parse(saved) : INITIAL_FEES;
  });

  const [audits, setAudits] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("ewa_fee_audits");
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [activeTab, setActiveTab] = useState<"registry" | "editor" | "simulator" | "audit">("registry");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Selected fee for inspection / viewing details
  const [inspectFee, setInspectFee] = useState<FeeRule | null>(null);

  // Editor State
  const [editorFee, setEditorFee] = useState<FeeRule>({
    id: "",
    name: "",
    description: "",
    status: "Draft",
    chargeParty: "Receiver",
    chargeSubject: "Employee",
    priority: 1,
    effectiveDate: "2026-07-01",
    expiredDate: "2026-12-31",
    refundBehavior: "Non-Refundable",
    taxBehavior: "Exclusive",
    taxCode: "TAX-VAT-5",
    criteria: [{ attrCode: "Transaction_Type", attrLabel: "Txn Type", operator: "Equals", value: "Disbursement" }],
    tiers: [{ priorityOrder: 1, startValue: 0, endValue: 999999999, calcType: "Flat", flatAmount: 1000, percentRate: 0, minCap: 0, maxCap: 0 }],
    distribution: [{ entityType: "Internal_System", entityName: "EWA Platform Core Balance", percentage: 100, debitGlCode: "1100", creditGlCode: "4000", isTaxBearing: true }]
  });
  const [isNewRule, setIsNewRule] = useState(true);

  // Simulation Engine State
  const [simSelectedFeeId, setSimSelectedFeeId] = useState("");
  const [simAmount, setSimAmount] = useState<number>(75000);
  const [simChannel, setSimChannel] = useState<string>("KBZ Pay");
  const [simDaysLate, setSimDaysLate] = useState<number>(0);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Persist State
  useEffect(() => {
    localStorage.setItem("ewa_fees", JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem("ewa_fee_audits", JSON.stringify(audits));
  }, [audits]);

  // Set Default Sim Fee once fees load
  useEffect(() => {
    const activeFees = fees.filter(f => f.status === "Active");
    if (activeFees.length > 0 && !simSelectedFeeId) {
      setSimSelectedFeeId(activeFees[0].id);
    }
  }, [fees, simSelectedFeeId]);

  // ─── HELPER FUNCTIONS ───

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amt).replace("MMK", "MMK ");
  };

  const getStatusBadge = (status: FeeRule["status"]) => {
    switch (status) {
      case "Active":
        return <EnterpriseBadge variant="success">ACTIVE</EnterpriseBadge>;
      case "Draft":
        return <EnterpriseBadge variant="neutral">DRAFT</EnterpriseBadge>;
      case "Pending_Approval":
        return <EnterpriseBadge variant="warning">PENDING APPROVAL</EnterpriseBadge>;
      case "Inactive":
        return <EnterpriseBadge variant="error">INACTIVE</EnterpriseBadge>;
      case "Archived":
        return <EnterpriseBadge variant="neutral">ARCHIVED</EnterpriseBadge>;
    }
  };

  const addAuditLog = (feeId: string, feeName: string, action: AuditLog["action"], details: string) => {
    const newLog: AuditLog = {
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      feeId,
      feeName,
      action,
      user: "platform_admin@ewa.com",
      details
    };
    setAudits(prev => [newLog, ...prev]);
  };

  // ─── ACTION HANDLERS ───

  const handleCreateNewClick = () => {
    const newId = `FEE-${String(fees.length + 1).padStart(3, "0")}`;
    setEditorFee({
      id: newId,
      name: "",
      description: "",
      status: "Draft",
      chargeParty: "Receiver",
      chargeSubject: "Employee",
      priority: 1,
      effectiveDate: "2026-07-01",
      expiredDate: "2026-12-31",
      refundBehavior: "Non-Refundable",
      taxBehavior: "Exclusive",
      taxCode: "TAX-VAT-5",
      criteria: [{ attrCode: "Transaction_Type", attrLabel: "Txn Type", operator: "Equals", value: "Disbursement" }],
      tiers: [{ priorityOrder: 1, startValue: 0, endValue: 999999999, calcType: "Flat", flatAmount: 1000, percentRate: 0, minCap: 0, maxCap: 0 }],
      distribution: [{ entityType: "Internal_System", entityName: "EWA Platform Core Balance", percentage: 100, debitGlCode: "1100", creditGlCode: "4000", isTaxBearing: true }]
    });
    setIsNewRule(true);
    setActiveTab("editor");
  };

  const handleEditClick = (fee: FeeRule) => {
    setEditorFee(JSON.parse(JSON.stringify(fee))); // Deep clone
    setIsNewRule(false);
    setActiveTab("editor");
  };

  const handleForkClick = (fee: FeeRule) => {
    const forkCount = fees.filter(f => f.id.startsWith(fee.id)).length;
    const forkedId = `${fee.id}-V${forkCount + 1}`;
    const forkedRule: FeeRule = {
      ...JSON.parse(JSON.stringify(fee)),
      id: forkedId,
      name: `${fee.name} (Forked v${forkCount + 1})`,
      status: "Draft"
    };
    setEditorFee(forkedRule);
    setIsNewRule(true);
    setActiveTab("editor");
    addAuditLog(fee.id, fee.name, "Fork", `Forked configuration into new draft ${forkedId}`);
  };

  const handleToggleStatus = (fee: FeeRule) => {
    const nextStatusMap: Record<FeeRule["status"], FeeRule["status"]> = {
      Active: "Inactive",
      Inactive: "Active",
      Draft: "Pending_Approval",
      Pending_Approval: "Active",
      Archived: "Draft"
    };

    const nextStatus = nextStatusMap[fee.status];
    setFees(prev =>
      prev.map(f => (f.id === fee.id ? { ...f, status: nextStatus } : f))
    );

    let actionLabel: AuditLog["action"] = "Edit";
    if (nextStatus === "Active") actionLabel = "Activate";
    if (nextStatus === "Inactive") actionLabel = "Deactivate";
    if (nextStatus === "Pending_Approval") actionLabel = "Approve"; // triggered request

    addAuditLog(fee.id, fee.name, actionLabel, `Status changed from ${fee.status} to ${nextStatus}`);
    
    // update inspection if open
    if (inspectFee?.id === fee.id) {
      setInspectFee(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleDeleteRule = (id: string, name: string) => {
    setFees(prev => prev.filter(f => f.id !== id));
    if (inspectFee?.id === id) setInspectFee(null);
    addAuditLog(id, name, "Deactivate", `Deleted draft/inactive fee definition`);
  };

  // ─── EDITOR SUB-FORM BUILDERS ───

  const handleSaveEditorRule = (targetStatus: FeeRule["status"]) => {
    // Validate Distribution sums to 100
    const totalDist = editorFee.distribution.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
    if (totalDist !== 100) {
      alert(`Distribution allocation totals ${totalDist}%. It must sum to exactly 100% before saving.`);
      return;
    }

    const savedRule = { ...editorFee, status: targetStatus };

    setFees(prev => {
      const exists = prev.some(f => f.id === savedRule.id);
      if (exists) {
        return prev.map(f => (f.id === savedRule.id ? savedRule : f));
      } else {
        return [...prev, savedRule];
      }
    });

    addAuditLog(
      savedRule.id,
      savedRule.name,
      isNewRule ? "Create" : "Edit",
      `${isNewRule ? "Created new" : "Updated existing"} fee rule with status ${targetStatus}`
    );

    setActiveTab("registry");
  };

  const updateL1Field = (key: keyof FeeRule, val: any) => {
    setEditorFee(prev => ({ ...prev, [key]: val }));
  };

  // Criteria Rows (L2)
  const addCriteriaRow = () => {
    setEditorFee(prev => ({
      ...prev,
      criteria: [...prev.criteria, { attrCode: "Channel", attrLabel: "Channel", operator: "Equals", value: "" }]
    }));
  };

  const removeCriteriaRow = (index: number) => {
    setEditorFee(prev => {
      const clone = [...prev.criteria];
      clone.splice(index, 1);
      return { ...prev, criteria: clone };
    });
  };

  const updateCriteriaRow = (index: number, field: keyof CriteriaRule, val: any) => {
    setEditorFee(prev => {
      const clone = [...prev.criteria];
      clone[index] = { ...clone[index], [field]: val };
      if (field === "attrCode") {
        const meta = METADATA_ATTRIBUTES.find(m => m.code === val);
        clone[index].attrLabel = meta ? meta.label : val;
      }
      return { ...prev, criteria: clone };
    });
  };

  // Pricing Tiers Rows (L3)
  const addTierRow = () => {
    const nextPriority = editorFee.tiers.length + 1;
    setEditorFee(prev => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        { priorityOrder: nextPriority, startValue: 0, endValue: 999999999, calcType: "Flat", flatAmount: 1000, percentRate: 0, minCap: 0, maxCap: 0 }
      ]
    }));
  };

  const removeTierRow = (index: number) => {
    setEditorFee(prev => {
      const clone = [...prev.tiers];
      clone.splice(index, 1);
      return { ...prev, tiers: clone };
    });
  };

  const updateTierRow = (index: number, field: keyof PricingTier, val: any) => {
    setEditorFee(prev => {
      const clone = [...prev.tiers];
      clone[index] = { ...clone[index], [field]: val };
      return { ...prev, tiers: clone };
    });
  };

  // Distribution Rows (L4)
  const addDistributionRow = () => {
    setEditorFee(prev => ({
      ...prev,
      distribution: [
        ...prev.distribution,
        { entityType: "Partner", entityName: "", percentage: 0, debitGlCode: "1100", creditGlCode: "4000", isTaxBearing: false }
      ]
    }));
  };

  const removeDistributionRow = (index: number) => {
    setEditorFee(prev => {
      const clone = [...prev.distribution];
      clone.splice(index, 1);
      return { ...prev, distribution: clone };
    });
  };

  const updateDistributionRow = (index: number, field: keyof DistributionSplit, val: any) => {
    setEditorFee(prev => {
      const clone = [...prev.distribution];
      clone[index] = { ...clone[index], [field]: val };
      return { ...prev, distribution: clone };
    });
  };

  const editorDistributionSum = useMemo(() => {
    return editorFee.distribution.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
  }, [editorFee.distribution]);

  // ─── SIMULATION COMPUTATION ENGINE ───

  const handleRunSimulation = () => {
    const targetFee = fees.find(f => f.id === simSelectedFeeId);
    if (!targetFee) return;

    // Simulate Layer 2 Criteria validation
    const traceLogs: string[] = [];
    let criteriaMatched = true;

    traceLogs.push(`[L2 INITIATED] Evaluating ${targetFee.criteria.length} matching rules for transaction amount ${formatCurrency(simAmount)}...`);

    targetFee.criteria.forEach(crit => {
      let isCritOk = false;
      let actualValue = "";

      if (crit.attrCode === "Transaction_Type") {
        actualValue = "Disbursement"; // Simulated as Disbursement transaction
        if (crit.operator === "Equals" && crit.value.toLowerCase() === "disbursement") isCritOk = true;
        if (crit.operator === "Equals" && crit.value.toLowerCase() === "repayment") {
          actualValue = simDaysLate > 0 ? "Repayment" : "Disbursement";
          isCritOk = actualValue.toLowerCase() === crit.value.toLowerCase();
        }
      } else if (crit.attrCode === "Channel") {
        actualValue = simChannel;
        if (crit.operator === "Equals" && simChannel.toLowerCase() === crit.value.toLowerCase()) isCritOk = true;
        if (crit.operator === "In_List") {
          const list = crit.value.split(",").map(s => s.trim().toLowerCase());
          if (list.includes(simChannel.toLowerCase())) isCritOk = true;
        }
      } else if (crit.attrCode === "Days_Overdue") {
        actualValue = String(simDaysLate);
        const limit = Number(crit.value);
        if (crit.operator === "Greater_Than" && simDaysLate > limit) isCritOk = true;
        if (crit.operator === "Less_Than" && simDaysLate < limit) isCritOk = true;
        if (crit.operator === "Equals" && simDaysLate === limit) isCritOk = true;
      } else {
        // Fallback for demo
        isCritOk = true;
        actualValue = crit.value;
      }

      if (isCritOk) {
        traceLogs.push(`✓ MATCH: Attribute [${crit.attrLabel}] evaluated as "${actualValue}" matches condition: ${crit.operator} "${crit.value}".`);
      } else {
        traceLogs.push(`❌ MISMATCH: Attribute [${crit.attrLabel}] evaluated as "${actualValue}" does NOT match: ${crit.operator} "${crit.value}".`);
        criteriaMatched = false;
      }
    });

    if (!criteriaMatched) {
      setSimResult({
        success: false,
        logs: traceLogs,
        message: "This fee policy criteria does not match the transaction parameters. Fee is not applicable.",
        finalFee: 0
      });
      return;
    }

    traceLogs.push(`[L2 SUCCESS] Transaction satisfies all entry criteria. Evaluating calculation tiers...`);

    // Simulate Layer 3 pricing bracket calculation
    let matchingTier: PricingTier | null = null;
    traceLogs.push(`[L3 BRACKET SELECTION] Evaluating ${targetFee.tiers.length} pricing ranges...`);

    // Sort tiers by priorityOrder
    const sortedTiers = [...targetFee.tiers].sort((a, b) => a.priorityOrder - b.priorityOrder);
    
    for (const tier of sortedTiers) {
      if (simAmount >= tier.startValue && simAmount <= tier.endValue) {
        matchingTier = tier;
        traceLogs.push(`🎯 BRACKET MATCH: Transaction amount falls within range ${formatCurrency(tier.startValue)} ↔ ${tier.endValue === 999999999 ? "Infinity" : formatCurrency(tier.endValue)}. Applying Tier priority #${tier.priorityOrder}.`);
        break;
      } else {
        traceLogs.push(`- Skip Tier #${tier.priorityOrder}: amount is outside range ${formatCurrency(tier.startValue)} ↔ ${tier.endValue === 999999999 ? "Infinity" : formatCurrency(tier.endValue)}.`);
      }
    }

    if (!matchingTier) {
      traceLogs.push(`❌ NO BRACKET MATCH: Amount did not fall into any pricing tier. Falling back to default.`);
      matchingTier = sortedTiers[0];
    }

    let calculatedFee = 0;
    let baseCalculationFormula = "";

    if (matchingTier.calcType === "Flat") {
      calculatedFee = matchingTier.flatAmount;
      baseCalculationFormula = `${formatCurrency(matchingTier.flatAmount)} (Flat Amount)`;
      traceLogs.push(`[L3 MATH] Flat calculation applied: Fee is directly ${formatCurrency(matchingTier.flatAmount)}.`);
    } else if (matchingTier.calcType === "Percent") {
      calculatedFee = (simAmount * matchingTier.percentRate) / 100;
      baseCalculationFormula = `${formatCurrency(simAmount)} × ${matchingTier.percentRate}%`;
      traceLogs.push(`[L3 MATH] Percent calculation applied: ${baseCalculationFormula} = ${formatCurrency(calculatedFee)}.`);
    } else if (matchingTier.calcType === "Hybrid") {
      calculatedFee = matchingTier.flatAmount + (simAmount * matchingTier.percentRate) / 100;
      baseCalculationFormula = `${formatCurrency(matchingTier.flatAmount)} + (${formatCurrency(simAmount)} × ${matchingTier.percentRate}%)`;
      traceLogs.push(`[L3 MATH] Hybrid calculation applied: ${baseCalculationFormula} = ${formatCurrency(calculatedFee)}.`);
    }

    // Apply caps if applicable (primarily for Percent/Hybrid)
    let finalFeeAfterCap = calculatedFee;
    if (matchingTier.calcType !== "Flat") {
      if (matchingTier.minCap > 0 && calculatedFee < matchingTier.minCap) {
        finalFeeAfterCap = matchingTier.minCap;
        traceLogs.push(`⚠️ MIN CAP TRIGGERED: Calculated fee ${formatCurrency(calculatedFee)} is below minimum cap floor. Enforced: ${formatCurrency(matchingTier.minCap)}.`);
      } else if (matchingTier.maxCap > 0 && calculatedFee > matchingTier.maxCap) {
        finalFeeAfterCap = matchingTier.maxCap;
        traceLogs.push(`⚠️ MAX CAP TRIGGERED: Calculated fee ${formatCurrency(calculatedFee)} exceeds maximum cap ceiling. Enforced: ${formatCurrency(matchingTier.maxCap)}.`);
      } else {
        traceLogs.push(`✓ CAP CHECK: Calculated fee of ${formatCurrency(calculatedFee)} is within normal bounds.`);
      }
    }

    // Calculate Distribution splits
    traceLogs.push(`[L4 DISTRIBUTION] Distributing collected fee of ${formatCurrency(finalFeeAfterCap)} to internal and external partners...`);
    const distributionsBreakdown = targetFee.distribution.map(dist => {
      const allocatedAmount = (finalFeeAfterCap * dist.percentage) / 100;
      traceLogs.push(`➜ Split: ${dist.entityName} (${dist.percentage}%) gets ${formatCurrency(allocatedAmount)} (Debit GL ${dist.debitGlCode} | Credit GL ${dist.creditGlCode}).`);
      return {
        ...dist,
        amount: allocatedAmount
      };
    });

    setSimResult({
      success: true,
      logs: traceLogs,
      message: "Simulation completed successfully.",
      formula: baseCalculationFormula,
      rawFee: calculatedFee,
      finalFee: finalFeeAfterCap,
      splits: distributionsBreakdown,
      taxDetails: targetFee.taxBehavior === "Exclusive" 
        ? `VAT Exclusive: Calculated fee excludes taxes. Tax code ${targetFee.taxCode} applied at accounting ledger.`
        : `VAT Inclusive: Calculated fee contains tax liabilities.`
    });
  };

  // Run initial simulation on selection change
  useEffect(() => {
    if (activeTab === "simulator" && simSelectedFeeId) {
      handleRunSimulation();
    }
  }, [activeTab, simSelectedFeeId]);

  // ─── FILTERED DATA ───

  const filteredFees = useMemo(() => {
    return fees.filter(fee => {
      const matchSearch =
        fee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || fee.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fees, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Fee Builder & Policy Config</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Define multi-layer rule hierarchies and distribution models</p>
          </div>
        </div>
        <div className="flex gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1.5 text-[10px]" onClick={() => setActiveTab("simulator")}>
            <Calculator className="w-3.5 h-3.5" /> Policy Simulator
          </EnterpriseButton>
          <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1.5 text-[10px]" onClick={handleCreateNewClick}>
            <Plus className="w-3.5 h-3.5" /> Create Fee Rule
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* KPI DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Total Fee Rules"
          value={fees.length}
          subValue="Active & draft definitions"
          accentColor="neutral"
          icon={<Layers className="w-4 h-4 text-[#100841]" />}
        />
        <EnterpriseKpiCard
          label="Active Policies"
          value={fees.filter(f => f.status === "Active").length}
          subValue="Live on transactional engine"
          accentColor="success"
          icon={<CheckCircle className="w-4 h-4 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Sponsoring Bank Ledger Mapped"
          value="100%"
          subValue="Double-entry validation"
          accentColor="info"
          icon={<Landmark className="w-4 h-4 text-[#1565c0]" />}
        />
        <EnterpriseKpiCard
          label="Simulation Coverage"
          value="99.8%"
          subValue="94 validation passes"
          accentColor="success"
          icon={<Calculator className="w-4 h-4 text-[#31d891]" />}
        />
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-[#dfdfdf] flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("registry"); setInspectFee(null); }}
            className={cn(
              "px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all",
              activeTab === "registry"
                ? "border-[#31d891] text-[#100841] bg-[#31d891]/5"
                : "border-transparent text-[#4f525d] hover:text-[#100841]"
            )}
          >
            Fee Registry ({fees.length})
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={cn(
              "px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all",
              activeTab === "editor"
                ? "border-[#31d891] text-[#100841] bg-[#31d891]/5"
                : "border-transparent text-[#4f525d] hover:text-[#100841]"
            )}
          >
            {isNewRule ? "Create Fee Rule" : `Editor: ${editorFee.id}`}
          </button>
          <button
            onClick={() => { setActiveTab("simulator"); handleRunSimulation(); }}
            className={cn(
              "px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all",
              activeTab === "simulator"
                ? "border-[#31d891] text-[#100841] bg-[#31d891]/5"
                : "border-transparent text-[#4f525d] hover:text-[#100841]"
            )}
          >
            Engine Simulator
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={cn(
              "px-4 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all",
              activeTab === "audit"
                ? "border-[#31d891] text-[#100841] bg-[#31d891]/5"
                : "border-transparent text-[#4f525d] hover:text-[#100841]"
            )}
          >
            System Audit Log
          </button>
        </div>

        {/* Dynamic Warning Indicator for Editor */}
        {activeTab === "editor" && editorDistributionSum !== 100 && (
          <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-[3px] font-semibold animate-pulse">
            <AlertCircle size={12} />
            Distribution: {editorDistributionSum}% (Needs 100%)
          </div>
        )}
      </div>

      {/* ─── TAB 1: REGISTRY VIEW ─── */}
      {activeTab === "registry" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Registry Table Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2 items-center bg-white p-3 rounded-[3px] border border-[#dfdfdf]">
              <div className="flex-1">
                <EnterpriseInput
                  placeholder="Search fee registry by code, name, description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full !text-[11px]"
                />
              </div>
              <div className="w-44">
                <EnterpriseSelect
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="!py-1.5 !text-[11px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Draft">Drafts Only</option>
                  <option value="Pending_Approval">Pending Approval</option>
                  <option value="Inactive">Inactive</option>
                </EnterpriseSelect>
              </div>
            </div>

            <div className="border border-[#dfdfdf] rounded-[3px] overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#efefff] border-b border-[#dfdfdf]">
                    <th className="px-4 py-2.5 text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">ID / PRI</th>
                    <th className="px-4 py-2.5 text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Fee Rule Definition</th>
                    <th className="px-4 py-2.5 text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Subject</th>
                    <th className="px-4 py-2.5 text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Pricing Tiers</th>
                    <th className="px-4 py-2.5 text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Status</th>
                    <th className="px-4 py-2.5 text-right text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efefff]">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[11px] text-[#4f525d] italic">
                        No policy rules found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map(fee => (
                      <tr
                        key={fee.id}
                        className={cn(
                          "hover:bg-[#efefff] transition-colors cursor-pointer",
                          inspectFee?.id === fee.id && "bg-[#31d891]/5"
                        )}
                        onClick={() => setInspectFee(fee)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-mono font-bold text-[#100841] text-[11px]">{fee.id}</p>
                          <p className="text-[9px] text-[#868c95] font-mono mt-0.5">PRI: {fee.priority}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[240px]">
                          <p className="font-bold text-[#100841] text-[12px] truncate">{fee.name}</p>
                          <p className="text-[10px] text-[#4f525d] truncate mt-0.5">{fee.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[11px] font-semibold text-[#100841]">{fee.chargeSubject}</p>
                          <p className="text-[9px] text-[#868c95] uppercase tracking-tight">{fee.chargeParty} Pays</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            {fee.tiers.map((t, i) => (
                              <span key={i} className="text-[10px] font-mono text-[#4f525d]">
                                {t.startValue === 0 && t.endValue === 999999999
                                  ? "All amounts"
                                  : `${t.startValue / 1000}k-${t.endValue === 999999999 ? "∞" : t.endValue / 1000 + "k"}`}
                                <strong className="text-[#31d891] ml-1">
                                  {t.calcType === "Flat" ? `${t.flatAmount} MMK` : `${t.percentRate}%`}
                                </strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(fee.status)}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleForkClick(fee)}
                              className="p-1 text-slate-400 hover:text-[#31d891] transition-colors hover:bg-[#ffffff] rounded-[2px]"
                              title="Fork / Version Copy"
                            >
                              <Copy size={13} />
                            </button>
                            {(fee.status === "Draft" || fee.status === "Inactive") && (
                              <button
                                onClick={() => handleEditClick(fee)}
                                className="p-1 text-slate-400 hover:text-amber-600 transition-colors hover:bg-[#ffffff] rounded-[2px]"
                                title="Edit Definition"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(fee)}
                              className={cn(
                                "p-1 rounded-[2px] transition-colors text-slate-400 hover:bg-[#ffffff]",
                                fee.status === "Active" ? "hover:text-red-500" : "hover:text-[#2e7d32]"
                              )}
                              title={fee.status === "Active" ? "Deactivate policy" : "Activate policy"}
                            >
                              <CheckCircle size={13} />
                            </button>
                            {(fee.status === "Draft" || fee.status === "Inactive") && (
                              <button
                                onClick={() => handleDeleteRule(fee.id, fee.name)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors hover:bg-[#ffffff] rounded-[2px]"
                                title="Delete Rule"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Audit & Inspect Drawer Side panel */}
          <div className="lg:col-span-1 space-y-4">
            {inspectFee ? (
              <EnterpriseCard className="border-[#dfdfdf] overflow-hidden bg-white shadow-sm flex flex-col h-full">
                {/* Panel Header */}
                <div className="bg-[#100841] text-white p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] bg-[#31d891]/20 text-[#31d891] border border-[#31d891]/30 px-1.5 py-0.5 rounded-[1px] tracking-widest font-bold">
                      {inspectFee.id}
                    </span>
                    <h3 className="text-[12px] font-bold uppercase tracking-wider mt-1">{inspectFee.name}</h3>
                  </div>
                  <button onClick={() => setInspectFee(null)} className="text-white/60 hover:text-white text-[11px] font-mono">
                    Close
                  </button>
                </div>

                {/* Panel Content Scroll Area */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[500px]">
                  {/* L1 Summary */}
                  <div>
                    <h4 className="text-[9px] font-bold text-[#868c95] uppercase tracking-widest border-b border-[#efefff] pb-1 mb-2">Layer 1: Header Context</h4>
                    <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                      <div>
                        <span className="text-[#4f525d] block">Charge Party:</span>
                        <strong className="text-[#100841]">{inspectFee.chargeParty}</strong>
                      </div>
                      <div>
                        <span className="text-[#4f525d] block">Subject:</span>
                        <strong className="text-[#100841]">{inspectFee.chargeSubject}</strong>
                      </div>
                      <div>
                        <span className="text-[#4f525d] block">Priority:</span>
                        <strong className="text-[#100841] font-mono">Level {inspectFee.priority}</strong>
                      </div>
                      <div>
                        <span className="text-[#4f525d] block">Validity:</span>
                        <strong className="text-[#100841] font-mono text-[10px]">{inspectFee.effectiveDate} ↔ {inspectFee.expiredDate}</strong>
                      </div>
                      <div>
                        <span className="text-[#4f525d] block">Refund Engine:</span>
                        <strong className="text-[#100841]">{inspectFee.refundBehavior}</strong>
                      </div>
                      <div>
                        <span className="text-[#4f525d] block">Tax Behavior:</span>
                        <strong className="text-[#100841]">{inspectFee.taxBehavior} ({inspectFee.taxCode})</strong>
                      </div>
                    </div>
                  </div>

                  {/* L2 Criteria Summary */}
                  <div>
                    <h4 className="text-[9px] font-bold text-[#868c95] uppercase tracking-widest border-b border-[#efefff] pb-1 mb-2">Layer 2: Match Rules (AND Logic)</h4>
                    <div className="space-y-1.5">
                      {inspectFee.criteria.map((crit, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#efefff] border border-[#dfdfdf] p-1.5 rounded-[2px] text-[10px]">
                          <span className="font-bold text-[#100841]">{crit.attrLabel}</span>
                          <span className="text-slate-400 font-mono text-[9px]">{crit.operator.toUpperCase()}</span>
                          <strong className="text-[#31d891] font-mono">{crit.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* L3 Tiers Summary */}
                  <div>
                    <h4 className="text-[9px] font-bold text-[#868c95] uppercase tracking-widest border-b border-[#efefff] pb-1 mb-2">Layer 3: Pricing Tiers & Caps</h4>
                    <div className="space-y-2">
                      {inspectFee.tiers.map((t, i) => (
                        <div key={i} className="border border-[#dfdfdf] p-2 bg-[#fffcf5] border-l-2 border-l-amber-500 text-[11px] space-y-1 rounded-[2px]">
                          <div className="flex justify-between font-bold">
                            <span className="text-[#100841]">Priority {t.priorityOrder} Bracket</span>
                            <span className="text-[#e65100] font-mono">
                              {t.calcType === "Flat" 
                                ? formatCurrency(t.flatAmount) 
                                : t.calcType === "Percent" 
                                  ? `${t.percentRate}%` 
                                  : `${formatCurrency(t.flatAmount)} + ${t.percentRate}%`}
                            </span>
                          </div>
                          <div className="flex justify-between text-[9px] text-[#4f525d] font-mono">
                            <span>Range: {formatCurrency(t.startValue)} ↔ {t.endValue === 999999999 ? "∞" : formatCurrency(t.endValue)}</span>
                          </div>
                          {t.calcType !== "Flat" && (t.minCap > 0 || t.maxCap > 0) && (
                            <div className="flex justify-between text-[9px] text-amber-700 bg-amber-50 px-1 rounded-[1px] font-mono">
                              <span>Min Cap: {formatCurrency(t.minCap)}</span>
                              <span>Max Cap: {formatCurrency(t.maxCap)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* L4 Distribution Summary */}
                  <div>
                    <h4 className="text-[9px] font-bold text-[#868c95] uppercase tracking-widest border-b border-[#efefff] pb-1 mb-2">Layer 4: Settlement Splits</h4>
                    <div className="space-y-1.5">
                      {inspectFee.distribution.map((dist, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] p-1.5 border border-[#dfdfdf] rounded-[2px] bg-white">
                          <div className="min-w-0">
                            <p className="font-bold text-[#100841] truncate">{dist.entityName}</p>
                            <p className="text-[9px] text-[#4f525d] font-mono">GL D:{dist.debitGlCode} | C:{dist.creditGlCode}</p>
                          </div>
                          <span className="font-mono text-[11px] text-[#31d891] bg-[#31d891]/5 px-1.5 py-0.5 font-bold rounded-[1px] shrink-0">
                            {dist.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto p-3 bg-[#efefff] border-t border-[#dfdfdf] flex gap-2">
                  <EnterpriseButton
                    variant="primary"
                    className="flex-1 text-[10px] h-8 flex items-center justify-center gap-1 bg-[#100841]"
                    onClick={() => {
                      setSimSelectedFeeId(inspectFee.id);
                      setActiveTab("simulator");
                    }}
                  >
                    <Calculator size={12} /> Simulate Rule
                  </EnterpriseButton>
                  {(inspectFee.status === "Draft" || inspectFee.status === "Inactive") && (
                    <EnterpriseButton
                      variant="secondary"
                      className="text-[10px] h-8"
                      onClick={() => handleEditClick(inspectFee)}
                    >
                      Edit
                    </EnterpriseButton>
                  )}
                </div>
              </EnterpriseCard>
            ) : (
              <div className="border border-dashed border-[#dfdfdf] rounded-[3px] p-8 text-center bg-white text-slate-400 space-y-3 flex flex-col justify-center items-center h-[420px]">
                <Layers className="w-8 h-8 text-slate-300" />
                <div>
                  <p className="font-bold text-[#100841] text-[12px] uppercase">Inspection Ledger Pane</p>
                  <p className="text-[10px] mt-1 max-w-[180px] mx-auto text-[#4f525d]">Select any fee rule from the registry to inspect its 4-layer pricing hierarchy & distribution keys.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: RULE EDITOR ─── */}
      {activeTab === "editor" && (
        <EnterpriseCard className="border-[#dfdfdf] bg-white p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[#dfdfdf] pb-3">
            <div>
              <h2 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">
                {isNewRule ? "Create Brand New Policy Rule" : `Modify Fee Rule Definitions: ${editorFee.id}`}
              </h2>
              <p className="text-[10px] text-[#4f525d] mt-0.5">Draft version will undergo automated QA checks before administrative activation.</p>
            </div>
            <div className="flex gap-2">
              <EnterpriseButton variant="secondary" className="h-8 text-[10px]" onClick={() => setActiveTab("registry")}>
                Cancel
              </EnterpriseButton>
              <EnterpriseButton variant="primary" className="h-8 text-[10px] bg-emerald-700 hover:bg-emerald-800" onClick={() => handleSaveEditorRule("Draft")}>
                Save as Draft
              </EnterpriseButton>
              <EnterpriseButton variant="primary" className="h-8 text-[10px] bg-[#100841]" onClick={() => handleSaveEditorRule("Active")}>
                Save & Make Active
              </EnterpriseButton>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Side: L1 & L2 (Header and Criteria) */}
            <div className="space-y-6">
              {/* L1 HEADER FORM */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-[#efefff] pb-1">
                  <FileText size={14} className="text-[#31d891]" />
                  Layer 1: Fee Header Metadata
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Fee Policy ID</label>
                    <EnterpriseInput
                      value={editorFee.id}
                      onChange={e => updateL1Field("id", e.target.value.toUpperCase())}
                      disabled={!isNewRule}
                      className="font-mono font-bold uppercase"
                      placeholder="e.g. FEE-005"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Descriptive Name</label>
                    <EnterpriseInput
                      value={editorFee.name}
                      onChange={e => updateL1Field("name", e.target.value)}
                      placeholder="e.g. Wave CashOut Base Charge"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Context Description</label>
                    <textarea
                      value={editorFee.description}
                      onChange={e => updateL1Field("description", e.target.value)}
                      className="input-enterprise w-full min-h-[50px] resize-none !text-[11px]"
                      placeholder="Describe the business scenario, target user group, or specific corporate context..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Charge Bearer Party</label>
                    <EnterpriseSelect
                      value={editorFee.chargeParty}
                      onChange={e => updateL1Field("chargeParty", e.target.value)}
                    >
                      <option value="Receiver">Receiver Pays (Deducted from drawdown)</option>
                      <option value="Sender">Sender Pays (Invoiced to Sponsoring Co)</option>
                    </EnterpriseSelect>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Charge Subject Account</label>
                    <EnterpriseSelect
                      value={editorFee.chargeSubject}
                      onChange={e => updateL1Field("chargeSubject", e.target.value)}
                    >
                      <option value="Employee">Employee Wallet</option>
                      <option value="Company">Corporate Settlement Account</option>
                    </EnterpriseSelect>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Evaluation Priority</label>
                    <EnterpriseInput
                      type="number"
                      value={editorFee.priority}
                      onChange={e => updateL1Field("priority", Number(e.target.value))}
                      className="font-mono"
                      min={1}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">VAT Behavior</label>
                    <EnterpriseSelect
                      value={editorFee.taxBehavior}
                      onChange={e => updateL1Field("taxBehavior", e.target.value)}
                    >
                      <option value="Exclusive">Tax Exclusive (+5% VAT calculated post-fee)</option>
                      <option value="Inclusive">Tax Inclusive (VAT calculated inside fee)</option>
                    </EnterpriseSelect>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Effective Date</label>
                    <EnterpriseInput
                      type="date"
                      value={editorFee.effectiveDate}
                      onChange={e => updateL1Field("effectiveDate", e.target.value)}
                      className="font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Expiry Date</label>
                    <EnterpriseInput
                      type="date"
                      value={editorFee.expiredDate}
                      onChange={e => updateL1Field("expiredDate", e.target.value)}
                      className="font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* L2 CRITERIA BUILDER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#efefff] pb-1">
                  <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Tag size={14} className="text-[#31d891]" />
                    Layer 2: Dynamic Criteria Filters (AND logic)
                  </h3>
                  <button
                    onClick={addCriteriaRow}
                    className="text-[#31d891] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    <PlusCircle size={12} /> Add Condition
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {editorFee.criteria.length === 0 ? (
                    <div className="p-3 text-center text-[#4f525d] border border-dashed border-[#dfdfdf] italic text-[10px] rounded-[2px]">
                      No triggering criteria specified. Rule will execute universally for all transactions.
                    </div>
                  ) : (
                    editorFee.criteria.map((crit, i) => (
                      <div key={i} className="flex gap-2 items-center bg-[#efefff] p-2 border border-[#dfdfdf] rounded-[2px]">
                        <div className="w-1/3">
                          <EnterpriseSelect
                            value={crit.attrCode}
                            onChange={e => updateCriteriaRow(i, "attrCode", e.target.value)}
                            className="!py-1 !text-[11px]"
                          >
                            {METADATA_ATTRIBUTES.map(m => (
                              <option key={m.code} value={m.code}>{m.label}</option>
                            ))}
                          </EnterpriseSelect>
                        </div>
                        <div className="w-1/4">
                          <EnterpriseSelect
                            value={crit.operator}
                            onChange={e => updateCriteriaRow(i, "operator", e.target.value)}
                            className="!py-1 !text-[11px]"
                          >
                            <option value="Equals">Equals</option>
                            <option value="Not_Equals">Not Equals</option>
                            <option value="Greater_Than">Greater Than</option>
                            <option value="Less_Than">Less Than</option>
                            <option value="Between">Between</option>
                            <option value="In_List">In List</option>
                          </EnterpriseSelect>
                        </div>
                        <div className="flex-1">
                          <EnterpriseInput
                            value={crit.value}
                            onChange={e => updateCriteriaRow(i, "value", e.target.value)}
                            placeholder={crit.operator === "In_List" ? "Val1, Val2, Val3" : "e.g. Wave Money"}
                            className="!py-1 !text-[11px]"
                          />
                        </div>
                        {editorFee.criteria.length > 1 && (
                          <button
                            onClick={() => removeCriteriaRow(i)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-[2px]"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: L3 & L4 (Tiers and Distribution) */}
            <div className="space-y-6">
              {/* L3 PRICING TIERS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#efefff] pb-1">
                  <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Layers size={14} className="text-[#31d891]" />
                    Layer 3: Pricing Tiers calculation brackets
                  </h3>
                  <button
                    onClick={addTierRow}
                    className="text-[#31d891] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    <PlusCircle size={12} /> Add Tier Bracket
                  </button>
                </div>

                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {editorFee.tiers.map((t, i) => (
                    <div key={i} className="bg-[#fffcf7] p-2.5 border border-[#ffecb3] border-l-3 border-l-amber-500 rounded-[2px] text-[11px] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#100841] uppercase text-[10px]">Tier Bracket #{i + 1} (Priority Order)</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[#4f525d]">Calculation Mode:</span>
                          <EnterpriseSelect
                            value={t.calcType}
                            onChange={e => updateTierRow(i, "calcType", e.target.value)}
                            className="!py-0.5 !px-1.5 !text-[10px] font-bold !bg-white border-[#ffecb3]"
                          >
                            <option value="Flat">Flat Fee Only</option>
                            <option value="Percent">Percentage Only</option>
                            <option value="Hybrid">Hybrid Combo</option>
                          </EnterpriseSelect>
                          {editorFee.tiers.length > 1 && (
                            <button
                              onClick={() => removeTierRow(i)}
                              className="text-red-600 hover:text-red-800 p-0.5 hover:bg-red-50 rounded-[2px] ml-1.5"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Range Inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <label className="text-[8px] uppercase tracking-wider text-slate-400">Min Trx Value (MMK)</label>
                          <EnterpriseInput
                            type="number"
                            value={t.startValue}
                            onChange={e => updateTierRow(i, "startValue", Number(e.target.value))}
                            className="!py-1 !px-2 font-mono"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[8px] uppercase tracking-wider text-slate-400">Max Trx Value (MMK)</label>
                          <EnterpriseInput
                            type="number"
                            value={t.endValue}
                            onChange={e => updateTierRow(i, "endValue", Number(e.target.value))}
                            className="!py-1 !px-2 font-mono"
                          />
                        </div>
                      </div>

                      {/* Calc Type Specific Values */}
                      <div className="grid grid-cols-4 gap-2 items-center">
                        {t.calcType !== "Percent" && (
                          <div className="col-span-2 space-y-0.5">
                            <label className="text-[8px] uppercase tracking-wider text-[#100841] font-bold">Flat Charge (MMK)</label>
                            <EnterpriseInput
                              type="number"
                              value={t.flatAmount}
                              onChange={e => updateTierRow(i, "flatAmount", Number(e.target.value))}
                              className="!py-1 !px-2 font-mono !bg-[#31d891]/5 font-bold"
                            />
                          </div>
                        )}
                        {t.calcType !== "Flat" && (
                          <div className="col-span-2 space-y-0.5">
                            <label className="text-[8px] uppercase tracking-wider text-[#100841] font-bold">Percentage Rate (%)</label>
                            <EnterpriseInput
                              type="number"
                              value={t.percentRate}
                              onChange={e => updateTierRow(i, "percentRate", Number(e.target.value))}
                              className="!py-1 !px-2 font-mono !bg-[#31d891]/5 font-bold"
                              step="0.1"
                            />
                          </div>
                        )}
                        {t.calcType !== "Flat" && (
                          <div className="space-y-0.5">
                            <label className="text-[8px] uppercase tracking-wider text-slate-400">Min Cap Floor</label>
                            <EnterpriseInput
                              type="number"
                              value={t.minCap}
                              onChange={e => updateTierRow(i, "minCap", Number(e.target.value))}
                              className="!py-1 !px-1.5 font-mono"
                            />
                          </div>
                        )}
                        {t.calcType !== "Flat" && (
                          <div className="space-y-0.5">
                            <label className="text-[8px] uppercase tracking-wider text-slate-400">Max Cap Ceiling</label>
                            <EnterpriseInput
                              type="number"
                              value={t.maxCap}
                              onChange={e => updateTierRow(i, "maxCap", Number(e.target.value))}
                              className="!py-1 !px-1.5 font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {/* Dynamic Formula Display for User */}
                      <div className="bg-white/70 border border-[#ffecb3] p-1 px-2.5 rounded-[2px] font-mono text-[9px] text-[#e65100] flex justify-between">
                        <span>Formula structure:</span>
                        <strong>
                          {t.calcType === "Flat" && `[Flat Amount = ${t.flatAmount} MMK]`}
                          {t.calcType === "Percent" && `[Amt] × ${t.percentRate}% (Caps: Min ${t.minCap} ↔ Max ${t.maxCap})`}
                          {t.calcType === "Hybrid" && `[${t.flatAmount} MMK] + ([Amt] × ${t.percentRate}%)`}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* L4 SETTLEMENT DISTRIBUTION SPLITS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#efefff] pb-1">
                  <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Landmark size={14} className="text-[#31d891]" />
                    Layer 4: Settlement Allocation Splits (Sum to 100%)
                  </h3>
                  <button
                    onClick={addDistributionRow}
                    className="text-[#31d891] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    <PlusCircle size={12} /> Add Recipient Entity
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {editorFee.distribution.map((dist, i) => (
                    <div key={i} className="grid grid-cols-12 gap-1.5 items-center bg-[#efefff] p-2 border border-[#dfdfdf] rounded-[2px]">
                      <div className="col-span-3">
                        <EnterpriseSelect
                          value={dist.entityType}
                          onChange={e => updateDistributionRow(i, "entityType", e.target.value)}
                          className="!py-0.5 !px-1.5 !text-[10px]"
                        >
                          <option value="Internal_System">Core Platform</option>
                          <option value="Partner">Corporate Bank</option>
                          <option value="Agent">Retail Agent</option>
                          <option value="External_Bank">Mobile Money</option>
                        </EnterpriseSelect>
                      </div>
                      <div className="col-span-3">
                        <EnterpriseInput
                          value={dist.entityName}
                          onChange={e => updateDistributionRow(i, "entityName", e.target.value)}
                          placeholder="Entity Name"
                          className="!py-0.5 !px-1.5 !text-[10px]"
                        />
                      </div>
                      <div className="col-span-1.5">
                        <EnterpriseInput
                          type="number"
                          value={dist.percentage}
                          onChange={e => updateDistributionRow(i, "percentage", Number(e.target.value))}
                          placeholder="%"
                          className="!py-0.5 !px-1 font-mono text-center !bg-[#31d891]/5 font-bold !text-[#31d891] !text-[10px]"
                          max={100}
                        />
                      </div>
                      <div className="col-span-2">
                        <EnterpriseSelect
                          value={dist.creditGlCode}
                          onChange={e => updateDistributionRow(i, "creditGlCode", e.target.value)}
                          className="!py-0.5 !px-1 !text-[9px] font-mono"
                          title="Credit Revenue Ledger Code"
                        >
                          {GL_ACCOUNTS.map(g => (
                            <option key={g.code} value={g.code}>CR {g.code}</option>
                          ))}
                        </EnterpriseSelect>
                      </div>
                      <div className="col-span-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={dist.isTaxBearing}
                          onChange={e => updateDistributionRow(i, "isTaxBearing", e.target.checked)}
                          className="rounded-[1px] border-[#dfdfdf]"
                          title="Is Entity Absorbing Tax?"
                        />
                        <span className="text-[8px] text-slate-400 block">TAX</span>
                      </div>
                      <div className="col-span-1 text-right">
                        {editorFee.distribution.length > 1 && (
                          <button
                            onClick={() => removeDistributionRow(i)}
                            className="text-red-600 hover:text-red-800 p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={cn(
                  "p-3 border rounded-[2px] flex items-center justify-between",
                  editorDistributionSum === 100 
                    ? "bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32]" 
                    : "bg-red-50 border-red-200 text-red-700"
                )}>
                  <div className="flex items-center gap-1.5">
                    {editorDistributionSum === 100 ? (
                      <CheckCircle size={14} />
                    ) : (
                      <AlertCircle size={14} className="animate-pulse" />
                    )}
                    <span className="text-[11px] font-bold">
                      {editorDistributionSum === 100 
                        ? "BALANCED: Allocation totals exactly 100%." 
                        : `IMBALANCED: Split total is ${editorDistributionSum}%. All values must equal 100%.`}
                    </span>
                  </div>
                  <strong className="font-mono text-xs">{editorDistributionSum}%</strong>
                </div>
              </div>
            </div>
          </div>
        </EnterpriseCard>
      )}

      {/* ─── TAB 3: SIMULATOR VIEW ─── */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <EnterpriseCard className="border-[#dfdfdf] bg-white p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#efefff] pb-2">
                <Calculator className="text-[#100841] w-4.5 h-4.5" />
                <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">Engine Simulation Controls</h3>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Select Target Policy Rule</label>
                  <EnterpriseSelect
                    value={simSelectedFeeId}
                    onChange={e => setSimSelectedFeeId(e.target.value)}
                    className="!text-[11px]"
                  >
                    <optgroup label="Active Policies">
                      {fees.filter(f => f.status === "Active").map(f => (
                        <option key={f.id} value={f.id}>[{f.id}] {f.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Draft / Inactive Policies">
                      {fees.filter(f => f.status !== "Active").map(f => (
                        <option key={f.id} value={f.id}>[{f.id}] {f.name} ({f.status})</option>
                      ))}
                    </optgroup>
                  </EnterpriseSelect>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Transaction Drawdown Amount</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-[12px] font-bold text-[#4f525d] font-mono">MMK</span>
                    <input
                      type="number"
                      value={simAmount}
                      onChange={e => setSimAmount(Number(e.target.value))}
                      className="input-enterprise w-full pl-12 font-mono font-bold text-[#100841] text-sm outline-none"
                      placeholder="Enter amount..."
                    />
                  </div>
                  <p className="text-[9px] text-[#868c95] italic">Adjust transactional values to test cap ceilings and tiered ranges.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Disbursement Payout Channel</label>
                  <EnterpriseSelect
                    value={simChannel}
                    onChange={e => setSimChannel(e.target.value)}
                    className="!text-[11px]"
                  >
                    <option value="KBZ Pay">KBZ Pay (Mobile Wallet)</option>
                    <option value="Wave">Wave Money (Agent Agent)</option>
                    <option value="CB Pay">CB Bank Wallet</option>
                    <option value="QR Manual">QR Instant Transfer</option>
                    <option value="OTC Cash Code">Over the Counter Cash Code</option>
                  </EnterpriseSelect>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Arrears Late Period (Days)</label>
                  <EnterpriseInput
                    type="number"
                    value={simDaysLate}
                    onChange={e => setSimDaysLate(Number(e.target.value))}
                    className="font-mono font-bold"
                    min={0}
                  />
                  <p className="text-[9px] text-[#868c95] italic">Non-zero integers trigger overdue penalty logic.</p>
                </div>

                <EnterpriseButton
                  variant="primary"
                  className="w-full bg-[#100841] uppercase tracking-wider text-[11px] font-bold h-10 mt-2 flex items-center justify-center gap-2"
                  onClick={handleRunSimulation}
                >
                  <Play size={14} /> Calculate Fee Metrics
                </EnterpriseButton>
              </div>
            </EnterpriseCard>

            {/* Quick Context Card */}
            <div className="p-4 bg-[#ffffff] border border-[#dfdfdf] rounded-[3px] text-[11px] text-[#4f525d] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#100841] uppercase text-[10px]">
                <Info size={12} className="text-[#31d891]" />
                Fintech Engine Logic Info
              </div>
              <p className="leading-relaxed">
                Fees are matched on AND criteria in <strong>Layer 2</strong>. If matched, we step into <strong>Layer 3</strong> where amount ranges evaluate sequentially.
              </p>
              <p className="leading-relaxed font-semibold text-[#100841]">
                Remember: The system stops searching on the FIRST matching bracket. No summing of preceding tiers takes place.
              </p>
            </div>
          </div>

          {/* Results Display Panel (Right) */}
          <div className="lg:col-span-7 space-y-4">
            {simResult ? (
              <div className="space-y-4">
                {/* Result KPI Card */}
                <div className={cn(
                  "p-5 rounded-[3px] border shadow-sm flex items-center justify-between",
                  simResult.success 
                    ? "bg-[#e8f5e9]/50 border-[#c8e6c9]" 
                    : "bg-red-50 border-red-200"
                )}>
                  <div>
                    <span className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest block">Simulated Final Charge</span>
                    {simResult.success ? (
                      <p className="text-3xl font-extrabold font-mono text-[#2e7d32] mt-1 tracking-tight">
                        {formatCurrency(simResult.finalFee)}
                      </p>
                    ) : (
                      <p className="text-2xl font-extrabold text-red-700 mt-1 uppercase tracking-tight">
                        Engine Bypass
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 font-medium block mt-1.5 italic">
                      {simResult.taxDetails || simResult.message}
                    </span>
                  </div>
                  {simResult.success && (
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest block">Basic Math Formula</span>
                      <p className="font-mono text-[11px] font-bold text-[#100841] bg-[#100841]/5 px-2 py-1 rounded-[1px] mt-1 border border-[#100841]/10">
                        {simResult.formula}
                      </p>
                      {simResult.rawFee !== simResult.finalFee && (
                        <span className="text-[9px] text-amber-600 block mt-1 font-semibold">
                          Cap Enforced (Raw: {formatCurrency(simResult.rawFee)})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Audit Run Logs (Tracing) */}
                <EnterpriseCard className="border-[#dfdfdf] bg-white p-5 space-y-3">
                  <h4 className="text-[10px] font-bold text-[#100841] uppercase tracking-[0.2em] border-b border-[#efefff] pb-1.5 flex items-center gap-1.5">
                    <History size={14} className="text-[#31d891]" />
                    Sequential Policy Evaluation Logs
                  </h4>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-[2px] font-mono text-[11px] space-y-1.5 max-h-[220px] overflow-y-auto leading-normal">
                    {simResult.logs.map((log: string, i: number) => {
                      let color = "text-slate-300";
                      if (log.startsWith("✓") || log.includes("🎯") || log.startsWith("[L2 SUCCESS]")) color = "text-[#81c784]";
                      if (log.startsWith("❌")) color = "text-[#e57373]";
                      if (log.startsWith("⚠️")) color = "text-[#ffd54f]";
                      if (log.startsWith("[L2 INITIATED]") || log.startsWith("[L3 BRACKET") || log.startsWith("[L4 DISTRIBUTION]")) color = "text-[#4fc3f7] font-semibold";
                      return (
                        <p key={i} className={color}>
                          {log}
                        </p>
                      );
                    })}
                  </div>
                </EnterpriseCard>

                {/* Distribution allocation card splits */}
                {simResult.success && (
                  <EnterpriseCard className="border-[#dfdfdf] bg-white p-5 space-y-3">
                    <h4 className="text-[10px] font-bold text-[#100841] uppercase tracking-[0.2em] border-b border-[#efefff] pb-1.5 flex items-center gap-1.5">
                      <Landmark size={14} className="text-[#31d891]" />
                      Layer 4: Real-time Double Entry Allocation Splits
                    </h4>
                    <div className="border border-[#dfdfdf] rounded-[2px] overflow-hidden">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="bg-[#efefff] border-b border-[#dfdfdf]">
                            <th className="p-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Entity Name / Role</th>
                            <th className="p-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">GL Debit</th>
                            <th className="p-2 text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">GL Credit</th>
                            <th className="p-2 text-center text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Share</th>
                            <th className="p-2 text-right text-[9px] font-bold text-[#4f525d] uppercase tracking-wider">Computed Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#efefff]">
                          {simResult.splits.map((split: any, idx: number) => (
                            <tr key={idx} className="hover:bg-[#efefff]">
                              <td className="p-2">
                                <span className="font-bold text-[#100841]">{split.entityName}</span>
                                <span className="text-[9px] bg-slate-100 text-[#4f525d] px-1 rounded-[1px] ml-1.5 uppercase font-semibold">
                                  {split.entityType}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-[#4f525d] font-bold">{split.debitGlCode}</td>
                              <td className="p-2 font-mono text-[#4f525d] font-bold">{split.creditGlCode}</td>
                              <td className="p-2 font-mono text-center text-[#31d891] font-bold">{split.percentage}%</td>
                              <td className="p-2 font-mono text-right font-bold text-[#100841]">{formatCurrency(split.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </EnterpriseCard>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-[#dfdfdf] rounded-[3px] p-12 text-center bg-white text-slate-400 space-y-4 h-[440px] flex flex-col justify-center items-center">
                <Calculator className="w-10 h-10 text-slate-300 animate-pulse" />
                <div>
                  <p className="font-bold text-[#100841] text-sm uppercase">Awakening policy engine simulator</p>
                  <p className="text-[11px] mt-1.5 max-w-sm mx-auto text-[#4f525d]">Configure drawdown parameters on the left and click "Calculate Fee Metrics" to generate sequential, layer-by-layer ledger tracing logs and automated split allocations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: AUDIT HISTORY VIEW ─── */}
      {activeTab === "audit" && (
        <EnterpriseCard className="border-[#dfdfdf] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#efefff] pb-2">
            <div className="flex items-center gap-1.5">
              <History className="text-[#100841] w-4.5 h-4.5" />
              <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">Chronological System Audit Trail</h3>
            </div>
            <span className="text-[9px] text-[#4f525d] uppercase tracking-widest font-bold">QA Integrity Verified</span>
          </div>

          <div className="space-y-3">
            {audits.map((log, i) => (
              <div key={i} className="flex gap-4 p-3 border border-[#dfdfdf] rounded-[2px] bg-[#efefff] text-[11px]">
                <div className="w-32 shrink-0">
                  <span className="text-[10px] font-mono text-[#4f525d] block">{log.timestamp}</span>
                  <span className="text-[9px] text-slate-400 font-medium block truncate mt-0.5" title={log.user}>{log.user}</span>
                </div>
                <div className="w-24 shrink-0">
                  <span className={cn(
                    "status-badge-neutral uppercase font-bold text-[8px] tracking-widest px-1.5 py-0.5",
                    log.action === "Activate" && "status-badge-success",
                    log.action === "Deactivate" && "status-badge-error",
                    log.action === "Fork" && "status-badge-info",
                    log.action === "Approve" && "status-badge-warning"
                  )}>
                    {log.action}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#100841]">
                    Rule: <span className="font-mono bg-white border border-[#dfdfdf] px-1 py-0.5 text-[9px] rounded-[1px] font-semibold">{log.feeId}</span> {log.feeName}
                  </p>
                  <p className="text-[#4f525d] mt-1 text-[11px] leading-relaxed italic">
                    "{log.details}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </EnterpriseCard>
      )}
    </div>
  );
}
