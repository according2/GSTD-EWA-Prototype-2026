/**
 * FeeHierarchyPage — Fee Hierarchy & Rule Engine
 * Each tier: 2 types (percent / flat), attribute rules, logical conditions
 * Attributes: Late Day, Employee Tenure, Count per Circle, Day, Amount
 * Priority-based condition rule matching
 * Design: Enterprise Fintech — Deep Navy (#100841) + Teal (#31d891) | Sharp corners
 */
import React, { useState, useMemo } from "react";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  EnterpriseInput,
  EnterpriseSelect,
  ColumnDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pyramid,
  Plus,
  Eye,
  Settings,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatMMK(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace("MMK", "MMK ");
}

type FeeType = "PERCENT" | "FLAT";
type LogicalOp = "AND" | "OR" | "NOT";
type ConditionAttribute = "LATE_DAY" | "EMPLOYEE_TENURE" | "COUNT_PER_CIRCLE" | "DAY" | "AMOUNT" | "TENURE_MONTHS";
type ConditionOperator = "GT" | "GTE" | "LT" | "LTE" | "EQ" | "BETWEEN";

interface FeeCondition {
  id: string;
  attribute: ConditionAttribute;
  operator: ConditionOperator;
  value: string;
  logicalOp: LogicalOp;
}

interface FeeTier {
  id: string;
  name: string;
  tierLevel: number;
  feeType: FeeType;
  value: number; // For percent, e.g. 1.5, for discount -25, for flat 1500
  priority: number;
  conditions: FeeCondition[];
  applicableTo: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
}

const INITIAL_FEE_TIERS: FeeTier[] = [
  {
    id: "FT-001",
    name: "Standard Disbursement Fee",
    tierLevel: 1,
    feeType: "PERCENT",
    value: 1.5,
    priority: 1,
    conditions: [
      { id: "FC-001", attribute: "AMOUNT", operator: "GTE", value: "0", logicalOp: "AND" },
      { id: "FC-002", attribute: "AMOUNT", operator: "LT", value: "50000", logicalOp: "AND" }
    ],
    applicableTo: "Employee",
    status: "ACTIVE"
  },
  {
    id: "FT-002",
    name: "Mid-Tier Disbursement Fee",
    tierLevel: 2,
    feeType: "PERCENT",
    value: 1.0,
    priority: 2,
    conditions: [
      { id: "FC-003", attribute: "AMOUNT", operator: "GTE", value: "50000", logicalOp: "AND" },
      { id: "FC-004", attribute: "AMOUNT", operator: "LT", value: "100000", logicalOp: "AND" }
    ],
    applicableTo: "Employee",
    status: "ACTIVE"
  },
  {
    id: "FT-003",
    name: "High-Tier Disbursement Fee",
    tierLevel: 3,
    feeType: "PERCENT",
    value: 0.75,
    priority: 3,
    conditions: [
      { id: "FC-005", attribute: "AMOUNT", operator: "GTE", value: "100000", logicalOp: "AND" }
    ],
    applicableTo: "Employee",
    status: "ACTIVE"
  },
  {
    id: "FT-004",
    name: "Late Repayment Penalty",
    tierLevel: 1,
    feeType: "PERCENT",
    value: 5.0,
    priority: 10,
    conditions: [
      { id: "FC-006", attribute: "LATE_DAY", operator: "GT", value: "0", logicalOp: "AND" },
      { id: "FC-007", attribute: "LATE_DAY", operator: "LT", value: "7", logicalOp: "AND" }
    ],
    applicableTo: "Employee",
    status: "ACTIVE"
  },
  {
    id: "FT-005",
    name: "Extended Late Penalty",
    tierLevel: 2,
    feeType: "PERCENT",
    value: 10.0,
    priority: 20,
    conditions: [
      { id: "FC-008", attribute: "LATE_DAY", operator: "GTE", value: "7", logicalOp: "AND" }
    ],
    applicableTo: "Employee",
    status: "ACTIVE"
  },
  {
    id: "FT-006",
    name: "Flat Service Fee — All Tiers",
    tierLevel: 0,
    feeType: "FLAT",
    value: 1500,
    priority: 0,
    conditions: [
      { id: "FC-009", attribute: "DAY", operator: "BETWEEN", value: "1,7", logicalOp: "AND" }
    ],
    applicableTo: "All",
    status: "ACTIVE"
  },
  {
    id: "FT-007",
    name: "New Employee Discount",
    tierLevel: 0,
    feeType: "PERCENT",
    value: -50, // 50% discount on the matched disbursement fee
    priority: 50,
    conditions: [
      { id: "FC-010", attribute: "EMPLOYEE_TENURE", operator: "LT", value: "3", logicalOp: "AND" }
    ],
    applicableTo: "New Employee (< 3 months tenure)",
    status: "ACTIVE"
  },
  {
    id: "FT-008",
    name: "Loyal Employee Reduction",
    tierLevel: 0,
    feeType: "PERCENT",
    value: -25, // 25% discount on disbursement fee
    priority: 40,
    conditions: [
      { id: "FC-012", attribute: "COUNT_PER_CIRCLE", operator: "GTE", value: "10", logicalOp: "AND" },
      { id: "FC-013", attribute: "TENURE_MONTHS", operator: "GTE", value: "12", logicalOp: "AND" }
    ],
    applicableTo: "Loyal Employee (12+ months, 10+ transactions)",
    status: "ACTIVE"
  }
];

export function FeeHierarchyPage() {
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>(INITIAL_FEE_TIERS);
  const [selectedTier, setSelectedTier] = useState<FeeTier | null>(null);

  // Dynamic Rule Builder modal/inline creator states
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState<FeeTier>({
    id: "",
    name: "",
    tierLevel: 1,
    feeType: "PERCENT",
    value: 1.0,
    priority: 1,
    conditions: [
      { id: "RC-001", attribute: "AMOUNT", operator: "GTE", value: "0", logicalOp: "AND" }
    ],
    applicableTo: "Employee",
    status: "ACTIVE"
  });

  // Simulator Inputs State
  const [simAmount, setSimAmount] = useState<number>(75000);
  const [simLateDays, setSimLateDays] = useState<number>(0);
  const [simTenure, setSimTenure] = useState<number>(12);
  const [simCountPerCircle, setSimCountPerCircle] = useState<number>(15);
  const [simDay, setSimDay] = useState<number>(5);

  const tierColumns: ColumnDef<FeeTier>[] = [
    {
      id: "id",
      header: "Tier ID",
      accessor: (ft) => <span className="font-mono font-bold text-[#100841]">{ft.id}</span>,
      searchString: (ft) => ft.id
    },
    {
      id: "name",
      header: "Rule Name / Definition",
      accessor: (ft) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{ft.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-[#4f525d] uppercase tracking-wider bg-[#ffffff] px-1 rounded-[1px]">Level {ft.tierLevel}</span>
            <span className="text-[9px] text-[#4f525d] uppercase tracking-wider bg-[#ffffff] px-1 rounded-[1px]">Priority {ft.priority}</span>
          </div>
        </div>
      ),
      searchString: (ft) => ft.name
    },
    {
      id: "type",
      header: "Fee Type",
      accessor: (ft) => <EnterpriseBadge variant={ft.feeType === "PERCENT" ? "info" : "success"}>{ft.feeType}</EnterpriseBadge>
    },
    {
      id: "value",
      header: "Value Adjustment",
      isNumeric: true,
      align: "right",
      accessor: (ft) => (
        <span className={cn("font-mono font-bold text-[12px]", ft.value < 0 ? "text-[#2e7d32]" : "text-[#e65100]")}>
          {ft.feeType === "PERCENT" ? (ft.value > 0 ? "+" : "") + ft.value + "%" : formatMMK(ft.value)}
        </span>
      )
    },
    {
      id: "conditions",
      header: "Logic Depth",
      accessor: (ft) => <span className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest">{ft.conditions.length} Conditions</span>
    },
    {
      id: "status",
      header: "State",
      accessor: (ft) => <EnterpriseBadge variant={ft.status === "ACTIVE" ? "success" : "neutral"}>{ft.status}</EnterpriseBadge>
    }
  ];

  const tierActions: TableAction<FeeTier>[] = [
    {
      label: "View Logic Flow",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (ft) => setSelectedTier(ft)
    },
    {
      label: "Toggle Rule State",
      icon: <Settings className="w-3.5 h-3.5" />,
      onClick: (ft) => {
        setFeeTiers(prev =>
          prev.map(t => (t.id === ft.id ? { ...t, status: t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : t))
        );
        if (selectedTier?.id === ft.id) {
          setSelectedTier(prev => prev ? { ...prev, status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : null);
        }
      }
    }
  ];

  // ─── SIMULATION EVALUATION ENGINE ───

  const simulationEvaluation = useMemo(() => {
    const activeTiers = feeTiers.filter(t => t.status === "ACTIVE");
    const traceLogs: string[] = [];
    const matchedRules: FeeTier[] = [];

    traceLogs.push(`Starting hierarchical evaluation of active rules for: Amt=${formatMMK(simAmount)}, LateDays=${simLateDays}, Tenure=${simTenure}m, Circles=${simCountPerCircle}, Day=${simDay}.`);

    // Evaluator for conditions
    const evaluateCondition = (cond: FeeCondition): boolean => {
      let inputVal = 0;
      if (cond.attribute === "AMOUNT") inputVal = simAmount;
      else if (cond.attribute === "LATE_DAY") inputVal = simLateDays;
      else if (cond.attribute === "EMPLOYEE_TENURE" || cond.attribute === "TENURE_MONTHS") inputVal = simTenure;
      else if (cond.attribute === "COUNT_PER_CIRCLE") inputVal = simCountPerCircle;
      else if (cond.attribute === "DAY") inputVal = simDay;

      const targetVal = cond.value;

      switch (cond.operator) {
        case "GT":
          return inputVal > Number(targetVal);
        case "GTE":
          return inputVal >= Number(targetVal);
        case "LT":
          return inputVal < Number(targetVal);
        case "LTE":
          return inputVal <= Number(targetVal);
        case "EQ":
          return inputVal === Number(targetVal);
        case "BETWEEN": {
          const [min, max] = targetVal.split(",").map(Number);
          return inputVal >= min && inputVal <= max;
        }
        default:
          return false;
      }
    };

    // Filter active tiers to check which match
    activeTiers.forEach(tier => {
      // AND logic - all conditions must be true
      const conditionsMatch = tier.conditions.every(c => evaluateCondition(c));
      if (conditionsMatch) {
        matchedRules.push(tier);
        traceLogs.push(`✓ MATCHED: [${tier.id}] "${tier.name}" satisfies all conditions.`);
      } else {
        traceLogs.push(`- Skip: [${tier.id}] "${tier.name}" conditions not met.`);
      }
    });

    // 1. Determine Matched Disbursement Fee (Mutually exclusive levels 1, 2, 3)
    let matchedDisbursementRule = matchedRules
      .filter(r => r.id.startsWith("FT-00") && Number(r.id.slice(-3)) <= 3) // Brackets 1, 2, 3
      .sort((a, b) => b.tierLevel - a.tierLevel)[0] || null; // higher tier level takes precedence

    let baseDisbursementFee = 0;
    let baseFormula = "No matching bracket";
    if (matchedDisbursementRule) {
      baseDisbursementFee = (simAmount * matchedDisbursementRule.value) / 100;
      baseFormula = `${formatMMK(simAmount)} × ${matchedDisbursementRule.value}%`;
      traceLogs.push(`[Ledger Base Match] Applied primary bracket [${matchedDisbursementRule.id}] yielding base fee: ${formatMMK(baseDisbursementFee)}.`);
    } else {
      traceLogs.push(`[Ledger Base Match] Warning: No base disbursement bracket matched.`);
    }

    // 2. Late Repayment Penalty (FT-004 / FT-005)
    let latePenaltyRule = matchedRules.find(r => r.id === "FT-004" || r.id === "FT-005") || null;
    let latePenaltyFee = 0;
    let latePenaltyFormula = "No overdue status";
    if (latePenaltyRule) {
      latePenaltyFee = (simAmount * latePenaltyRule.value) / 100;
      latePenaltyFormula = `${formatMMK(simAmount)} × ${latePenaltyRule.value}%`;
      traceLogs.push(`[Overdue Penalty Match] Applied [${latePenaltyRule.id}] yielding penalty fee: ${formatMMK(latePenaltyFee)}.`);
    }

    // 3. Flat Service Fee (FT-006)
    let flatServiceRule = matchedRules.find(r => r.id === "FT-006") || null;
    let flatServiceFee = flatServiceRule ? flatServiceRule.value : 0;
    if (flatServiceRule) {
      traceLogs.push(`[Flat Fee Match] Applied flat rule [${flatServiceRule.id}] adding fee: ${formatMMK(flatServiceFee)}.`);
    }

    // 4. Discounts (FT-007 / FT-008)
    let matchedDiscountRule = matchedRules.find(r => r.id === "FT-007" || r.id === "FT-008") || null;
    let discountAmount = 0;
    let discountFormula = "No discounts applicable";
    if (matchedDiscountRule && baseDisbursementFee > 0) {
      discountAmount = (baseDisbursementFee * Math.abs(matchedDiscountRule.value)) / 100;
      discountFormula = `-${Math.abs(matchedDiscountRule.value)}% on Base (${formatMMK(discountAmount)})`;
      traceLogs.push(`[Discount Match] Applied [${matchedDiscountRule.id}] reducing base fee by ${formatMMK(discountAmount)}.`);
    }

    // Calculate final Net Fee
    const finalNetFee = Math.max(0, baseDisbursementFee - discountAmount + latePenaltyFee + flatServiceFee);
    traceLogs.push(`[SUMMATION] Net Fee = Base(${formatMMK(baseDisbursementFee)}) - Discount(${formatMMK(discountAmount)}) + Penalty(${formatMMK(latePenaltyFee)}) + Flat(${formatMMK(flatServiceFee)}) = ${formatMMK(finalNetFee)}.`);

    return {
      disbursementRule: matchedDisbursementRule,
      disbursementFee: baseDisbursementFee,
      disbursementFormula: baseFormula,
      lateRule: latePenaltyRule,
      lateFee: latePenaltyFee,
      lateFormula: latePenaltyFormula,
      flatFee: flatServiceFee,
      discountRule: matchedDiscountRule,
      discountFee: discountAmount,
      discountFormula: discountFormula,
      netFee: finalNetFee,
      logs: traceLogs
    };
  }, [feeTiers, simAmount, simLateDays, simTenure, simCountPerCircle, simDay]);

  // Handle saving new dynamic rule
  const handleSaveNewRule = () => {
    if (!newRule.id || !newRule.name) {
      alert("Please fill in Rule ID and Name.");
      return;
    }
    setFeeTiers(prev => [...prev, newRule]);
    setIsCreatingRule(false);
    alert(`Tier logic rule ${newRule.id} has been added to the registry!`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pyramid className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Fee Hierarchy & Rule Engine</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Attribute-based priority matching for dynamic fee calculation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton
            variant="primary"
            className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#100841]"
            onClick={() => {
              const nextId = `FT-${String(feeTiers.length + 1).padStart(3, "0")}`;
              setNewRule({
                id: nextId,
                name: "",
                tierLevel: 1,
                feeType: "PERCENT",
                value: 1.0,
                priority: 10,
                conditions: [{ id: "RC-001", attribute: "AMOUNT", operator: "GTE", value: "0", logicalOp: "AND" }],
                applicableTo: "Employee",
                status: "ACTIVE"
              });
              setIsCreatingRule(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Define Logic Tier
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* Dynamic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Active Fee Tiers"
          value={feeTiers.filter(t => t.status === "ACTIVE").length}
          accentColor="info"
          icon={<Pyramid className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
        <EnterpriseKpiCard
          label="Logic Conditions Registered"
          value={feeTiers.reduce((sum, t) => sum + t.conditions.length, 0)}
          accentColor="neutral"
          icon={<Settings className="w-3.5 h-3.5 text-[#4f525d]" />}
        />
        <EnterpriseKpiCard
          label="Estimated Average Margin"
          value="1.45%"
          accentColor="success"
          icon={<TrendingUp className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Rule Precision Engine"
          value="100%"
          accentColor="success"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
      </div>

      {isCreatingRule && (
        <EnterpriseCard className="border-amber-400 bg-amber-50/20 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-amber-200 pb-2">
            <h3 className="text-[12px] font-bold text-[#100841] uppercase tracking-wider flex items-center gap-1.5">
              <Settings size={14} className="text-amber-600 animate-spin" />
              Define New Dynamic Logic Tier Rule
            </h3>
            <button className="text-slate-400 hover:text-slate-600 text-[11px]" onClick={() => setIsCreatingRule(false)}>
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[#4f525d] uppercase">Rule/Tier ID</label>
              <EnterpriseInput value={newRule.id} onChange={e => setNewRule(prev => ({ ...prev, id: e.target.value.toUpperCase() }))} className="font-mono" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[8px] font-bold text-[#4f525d] uppercase">Rule Name</label>
              <EnterpriseInput value={newRule.name} onChange={e => setNewRule(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Early Settlement Rebate" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[#4f525d] uppercase">Priority Level</label>
              <EnterpriseInput type="number" value={newRule.priority} onChange={e => setNewRule(prev => ({ ...prev, priority: Number(e.target.value) }))} className="font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[#4f525d] uppercase">Fee Type</label>
              <EnterpriseSelect value={newRule.feeType} onChange={e => setNewRule(prev => ({ ...prev, feeType: e.target.value as FeeType }))}>
                <option value="PERCENT">PERCENT</option>
                <option value="FLAT">FLAT</option>
              </EnterpriseSelect>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[#4f525d] uppercase">Charge Value</label>
              <EnterpriseInput type="number" value={newRule.value} onChange={e => setNewRule(prev => ({ ...prev, value: Number(e.target.value) }))} className="font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[#4f525d] uppercase">Scope Target</label>
              <EnterpriseInput value={newRule.applicableTo} onChange={e => setNewRule(prev => ({ ...prev, applicableTo: e.target.value }))} />
            </div>
            <div className="space-y-1 flex items-end">
              <EnterpriseButton variant="primary" className="w-full h-9 bg-[#100841]" onClick={handleSaveNewRule}>
                Save Logic Rule
              </EnterpriseButton>
            </div>
          </div>
        </EnterpriseCard>
      )}

      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers">Tier Registry</TabsTrigger>
          <TabsTrigger value="conditions">Universal Rules</TabsTrigger>
          <TabsTrigger value="simulator">Fee Simulator</TabsTrigger>
        </TabsList>

        {/* TAB 1: REGISTRY */}
        <TabsContent value="tiers" className="mt-4 outline-none">
          <EnterpriseTable
            data={feeTiers}
            columns={tierColumns}
            rowKey={(ft) => ft.id}
            actions={tierActions}
            searchPlaceholder="Search tiers or definitions..."
          />
          
          {selectedTier && (
            <EnterpriseCard className="mt-6 p-6 border-[#dfdfdf] bg-[#efefff]">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <Pyramid className="w-4 h-4 text-[#100841]" />
                   <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">{selectedTier.name} — Logical Breakdown</h3>
                 </div>
                 <EnterpriseButton variant="secondary" className="h-7 text-[10px]" onClick={() => setSelectedTier(null)}>Close Analysis</EnterpriseButton>
               </div>
               
               <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Hierarchy Depth</p>
                    <p className="text-[14px] font-bold text-[#100841]">Level {selectedTier.tierLevel}</p>
                    <p className="text-[10px] text-[#4f525d]">Priority Ranking: {selectedTier.priority}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Calculated Value</p>
                    <p className={cn("text-[14px] font-mono font-bold", selectedTier.value < 0 ? "text-[#2e7d32]" : "text-[#e65100]")}>
                      {selectedTier.feeType === "PERCENT" ? (selectedTier.value > 0 ? "+" : "") + selectedTier.value + "%" : formatMMK(selectedTier.value)}
                    </p>
                    <p className="text-[10px] text-[#4f525d] uppercase">Mode: {selectedTier.feeType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Application Scope</p>
                    <p className="text-[12px] font-bold text-[#100841] uppercase">{selectedTier.applicableTo}</p>
                    <p className="text-[10px] text-[#4f525d]">Target Entity</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Registry Status</p>
                    <EnterpriseBadge variant={selectedTier.status === "ACTIVE" ? "success" : "neutral"}>{selectedTier.status}</EnterpriseBadge>
                    <p className="text-[10px] text-[#4f525d] uppercase mt-1">Live Environment</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#100841]" />
                    <p className="text-[10px] font-bold text-[#100841] uppercase tracking-widest">Rule Conditional Logic (Sequential Chain)</p>
                  </div>
                  
                  <div className="border border-[#dfdfdf] rounded-[2px] overflow-hidden bg-white">
                    <EnterpriseTable
                      data={selectedTier.conditions}
                      columns={[
                        { id: "id", header: "ID", accessor: (c) => <span className="text-[10px] font-mono text-[#4f525d]">{c.id}</span> },
                        { id: "attr", header: "Attribute", accessor: (c) => {
                          const icons: Record<string, any> = { LATE_DAY: Clock, EMPLOYEE_TENURE: Calendar, AMOUNT: TrendingUp, COUNT_PER_CIRCLE: Users };
                          const Icon = icons[c.attribute] || Settings;
                          return (
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3 h-3 text-[#4f525d]" />
                              <span className="text-[11px] font-bold text-[#100841] uppercase tracking-tight">{c.attribute.replace("_", " ")}</span>
                            </div>
                          );
                        }},
                        { id: "op", header: "Operator", accessor: (c) => <span className="text-[10px] font-bold text-[#100841] bg-[#ffffff] px-1.5 py-0.5 rounded-[2px]">{c.operator}</span> },
                        { id: "val", header: "Value", accessor: (c) => <span className="text-[11px] font-mono font-bold text-[#100841]">{c.value}</span> },
                        { id: "link", header: "Linkage", accessor: (c) => <EnterpriseBadge variant={c.logicalOp === "AND" ? "info" : "warning"}>{c.logicalOp}</EnterpriseBadge> }
                      ]}
                      rowKey={(c) => c.id}
                      showSummaries={false}
                    />
                  </div>

                  <div className="p-4 bg-[#100841]/5 border border-[#100841]/10 rounded-[2px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-3.5 h-3.5 text-[#100841]" />
                      <p className="text-[9px] font-bold text-[#100841] uppercase tracking-widest">Evaluation Pseudocode</p>
                    </div>
                    <p className="text-[11px] font-mono text-[#4f525d] leading-relaxed">
                      IF {selectedTier.conditions.map((c, i) => (
                        <span key={c.id}>
                          {i > 0 && <span className="text-[#31d891] font-bold"> {c.logicalOp} </span>}
                          ({c.attribute} {c.operator} {c.value})
                        </span>
                      ))} THEN APPLY <span className="text-[#e65100] font-bold">{selectedTier.value}{selectedTier.feeType === "PERCENT" ? "%" : " MMK"}</span>
                    </p>
                  </div>
               </div>
            </EnterpriseCard>
          )}
        </TabsContent>

        {/* TAB 2: UNIVERSAL RULES LIST */}
        <TabsContent value="conditions" className="mt-4 outline-none">
           <EnterpriseTable
              data={feeTiers.flatMap(ft => ft.conditions.map(c => ({ ...c, tierName: ft.name, tierStatus: ft.status })))}
              columns={[
                { id: "id", header: "Rule ID", accessor: (c) => <span className="text-[10px] font-mono text-[#4f525d]">{c.id}</span> },
                { id: "tier", header: "Associated Tier", accessor: (c) => <span className="text-[11px] font-bold text-[#100841]">{c.tierName}</span> },
                { id: "attr", header: "Attribute", accessor: (c) => <span className="text-[10px] font-bold text-[#4f525d] uppercase tracking-tight">{c.attribute.replace("_", " ")}</span> },
                { id: "logic", header: "Logic Statement", accessor: (c) => (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4f525d] uppercase font-bold">{c.operator}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="text-[11px] font-mono font-bold text-[#100841]">{c.value}</span>
                  </div>
                )},
                { id: "status", header: "Rule State", accessor: (c) => <EnterpriseBadge variant={c.tierStatus === "ACTIVE" ? "success" : "neutral"}>{c.tierStatus}</EnterpriseBadge> }
              ]}
              rowKey={(c) => c.id}
              searchPlaceholder="Search rule logic or tier names..."
           />
        </TabsContent>

        {/* TAB 3: SIMULATOR (DYNAMIC!) */}
        <TabsContent value="simulator" className="mt-4 outline-none">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel: Inputs */}
              <div className="lg:col-span-5 space-y-4">
                <EnterpriseCard className="p-6 border-[#dfdfdf] bg-white space-y-5">
                  <div className="flex items-center gap-2 border-b border-[#efefff] pb-2">
                    <Calculator className="w-4 h-4 text-[#100841]" />
                    <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">Fee Calculation Simulator</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Transaction Drawdown Amount (MMK)</label>
                       <EnterpriseInput
                         type="number"
                         value={simAmount}
                         onChange={e => setSimAmount(Number(e.target.value))}
                         className="font-mono font-bold text-sm text-[#100841]"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Arrears Late Period (Days)</label>
                       <EnterpriseInput
                         type="number"
                         value={simLateDays}
                         onChange={e => setSimLateDays(Number(e.target.value))}
                         className="font-mono font-bold text-sm text-[#100841]"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Employee Tenure (Months)</label>
                       <EnterpriseInput
                         type="number"
                         value={simTenure}
                         onChange={e => setSimTenure(Number(e.target.value))}
                         className="font-mono font-bold text-sm text-[#100841]"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest font-bold">Transaction Count Per Period (Circles)</label>
                       <EnterpriseInput
                         type="number"
                         value={simCountPerCircle}
                         onChange={e => setSimCountPerCircle(Number(e.target.value))}
                         className="font-mono font-bold text-sm text-[#100841]"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest font-bold">Calendar Day of Request</label>
                       <EnterpriseInput
                         type="number"
                         value={simDay}
                         onChange={e => setSimDay(Number(e.target.value))}
                         className="font-mono font-bold text-sm text-[#100841]"
                         min={1}
                         max={31}
                       />
                     </div>
                  </div>
                </EnterpriseCard>
              </div>

              {/* Right Panel: Output Tracing & Summary */}
              <div className="lg:col-span-7 space-y-4">
                {/* Mathematical Summation Banner */}
                <div className="p-5 bg-white border border-[#dfdfdf] rounded-[3px] shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center border-b border-[#efefff] pb-2">
                    <span className="text-[10px] font-bold text-[#100841] uppercase tracking-wider">Dynamic Trace Summation</span>
                    <span className="text-[9px] text-[#4f525d] font-mono">Precision Calculated</span>
                  </div>

                  <div className="space-y-2">
                    {/* Disbursement Match Row */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#4f525d] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#31d891]" />
                        Disbursement Bracket:
                        <strong className="text-slate-700">
                          {simulationEvaluation.disbursementRule?.id || "None"}
                        </strong>
                      </span>
                      <span className="font-mono text-slate-700">
                        {simulationEvaluation.disbursementRule ? (
                          <>
                            {formatMMK(simulationEvaluation.disbursementFee)}
                            <span className="text-[9px] text-slate-400 ml-1">({simulationEvaluation.disbursementRule.value}%)</span>
                          </>
                        ) : "0 MMK"}
                      </span>
                    </div>

                    {/* Discount Match Row */}
                    {simulationEvaluation.discountFee > 0 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#4f525d] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                          Discount Adjustment:
                          <strong className="text-emerald-700 font-semibold">
                            {simulationEvaluation.discountRule?.id}
                          </strong>
                        </span>
                        <span className="font-mono text-[#2e7d32] font-semibold">
                          -{formatMMK(simulationEvaluation.discountFee)}
                        </span>
                      </div>
                    )}

                    {/* Penalty Match Row */}
                    {simulationEvaluation.lateFee > 0 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#4f525d] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c62828]" />
                          Late Penalties Match:
                          <strong className="text-[#c62828]">
                            {simulationEvaluation.lateRule?.id}
                          </strong>
                        </span>
                        <span className="font-mono text-[#c62828] font-bold">
                          +{formatMMK(simulationEvaluation.lateFee)}
                        </span>
                      </div>
                    )}

                    {/* Flat Service Fee Match Row */}
                    {simulationEvaluation.flatFee > 0 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#4f525d] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Flat Service Charge (Day 1-7):
                        </span>
                        <span className="font-mono text-amber-700 font-bold">
                          +{formatMMK(simulationEvaluation.flatFee)}
                        </span>
                      </div>
                    )}

                    <LedgerDivider />

                    {/* Final Net Fee display */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[#100841] font-extrabold uppercase text-[12px] tracking-wider block">Net Computed EWA Fee:</span>
                        <span className="text-[9px] text-[#4f525d] italic block">Inclusive of matched discounts & penalty additions.</span>
                      </div>
                      <span className="font-mono text-2xl font-extrabold text-[#e65100]">
                        {formatMMK(simulationEvaluation.netFee)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Console Tracing */}
                <EnterpriseCard className="p-5 bg-white border border-[#dfdfdf]">
                  <div className="flex items-center gap-1.5 mb-3 border-b border-[#efefff] pb-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-[10px] font-bold text-[#100841] uppercase tracking-wider">Policy Calculation Trace Outputs</h4>
                  </div>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-[2px] font-mono text-[10.5px] space-y-1.5 max-h-[220px] overflow-y-auto leading-normal">
                    {simulationEvaluation.logs.map((log, idx) => {
                      let color = "text-slate-300";
                      if (log.startsWith("✓")) color = "text-[#81c784]";
                      if (log.startsWith("- Skip")) color = "text-slate-500";
                      if (log.startsWith("[Ledger Base")) color = "text-[#4fc3f7] font-semibold";
                      if (log.startsWith("[Discount")) color = "text-[#a5d6a7] font-semibold";
                      if (log.startsWith("[Overdue")) color = "text-[#ef9a9a] font-semibold";
                      if (log.startsWith("[SUMMATION]")) color = "text-[#ffb74d] font-bold";
                      return (
                        <p key={idx} className={color}>
                          {log}
                        </p>
                      );
                    })}
                  </div>
                </EnterpriseCard>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
