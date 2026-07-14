/**
 * DocumentationPage — Knowledge Base & Platform Guide
 * SAP Fiori-Inspired: Structured documentation with searchable module guides
 * Design: Enterprise Fintech — Navy (#100841) + Teal (#31d891) | Sharp corners | Structured layout
 */
import { useState, useMemo } from "react";
import {
  BookOpen, Search, ChevronRight, FileText, Zap, Shield,
  Users, Repeat, BarChart3, Settings, Wallet, ShieldAlert,
  ArrowRightLeft, Landmark, Layers, Gauge, LayoutTemplate,
  AlertCircle, Trash2, FileSpreadsheet, Bell, Workflow, UserCheck,
  CheckCircle2, Circle, Clock, AlertTriangle, Info,
  ChevronLeft, Download, ExternalLink, Copy, Menu
} from "lucide-react";
import {
  EnterpriseCard,
  EnterpriseKpiCard,
  EnterpriseBadge,
  EnterpriseButton,
  EnterpriseMessageStrip,
  LedgerDivider
} from "@/components/EnterpriseComponents";

/* ─── Types ─── */
type DocCategory = "overview" | "architecture" | "workflows" | "modules" | "api" | "roles" | "design";
type ModuleGuideId =
  | "dashboard" | "onboarding" | "employees" | "transactions" | "repayment"
  | "settlement" | "circle-ledger" | "fee-builder" | "budget" | "risk"
  | "reports" | "payroll" | "notifications" | "admin" | "workflow"
  | "writeoff" | "form-creator" | "errors" | "disbursement"
  | "bank-integration" | "service-catalog" | "fee-hierarchy"
  | "employee-groups" | "limitations";

interface ModuleGuide {
  id: ModuleGuideId;
  title: string;
  category: string;
  portal: string;
  actors: string[];
  description: string;
  features: { feature: string; actor: string; outcome: string }[];
  steps: { step: number; title: string; description: string; tip?: string }[];
  workflows?: { name: string; states: string[] }[];
  integrations?: string[];
}

interface DocSection {
  id: DocCategory;
  title: string;
  icon: React.ReactNode;
  description: string;
}

/* ─── Documentation Sections ─── */
const DOC_SECTIONS: DocSection[] = [
  { id: "overview", title: "Platform Overview", icon: <BookOpen className="w-4 h-4" />, description: "EWA 3.0 Standalone — Full Earned Wage Access Platform" },
  { id: "architecture", title: "System Architecture", icon: <Zap className="w-4 h-4" />, description: "Component model, microservices, and engine layer" },
  { id: "workflows", title: "End-to-End Workflows", icon: <Workflow className="w-4 h-4" />, description: "8-phase EWA lifecycle with state machines" },
  { id: "roles", title: "Roles & Permissions", icon: <Shield className="w-4 h-4" />, description: "7 portal roles with RBAC matrix" },
  { id: "design", title: "Design System", icon: <LayoutTemplate className="w-4 h-4" />, description: "SAP Fiori-inspired visual design and enterprise components" },
  { id: "modules", title: "Module Guides", icon: <FileText className="w-4 h-4" />, description: "Step-by-step guides for all 18 enterprise modules" },
  { id: "api", title: "API Reference", icon: <ExternalLink className="w-4 h-4" />, description: "Partner API endpoints and integration guide" },
];

/* ─── Module Guide Data ─── */
const MODULE_GUIDES: ModuleGuide[] = [
  // 1. Dashboard
  {
    id: "dashboard", title: "Command Dashboard", category: "Overview", portal: "All Portals",
    actors: ["All Roles"],
    description: "The Command Dashboard is the landing page for every portal. It provides a real-time operational overview with KPI cards, charts, and role-aware alerts. Metrics include active companies, employee count, budget utilization, disbursement volume, repayment rate, outstanding balances, pending verifications, and risk scores.",
    features: [
      { feature: "KPI Overview Cards", actor: "All Roles", outcome: "Instant health check of core metrics" },
      { feature: "Budget Utilization Chart", actor: "HR / Finance / Risk", outcome: "Visual budget consumption by company" },
      { feature: "Transaction Status Distribution", actor: "Operations", outcome: "Repay/Active/Overdue/Pending breakdown" },
      { feature: "Monthly Financial Trend", actor: "Finance / Risk", outcome: "Disbursement vs repayment trend line" },
      { feature: "Role-Aware Message Strips", actor: "All Roles", outcome: "Targeted alerts (overdue, budget overflow, verification pending)" },
    ],
    steps: [
      { step: 1, title: "Access the Dashboard", description: "Click 'Dashboard' in the sidebar Overview group. The page loads automatically with your role-scoped KPIs." },
      { step: 2, title: "Review KPI Cards", description: "8 metric cards show Active Companies, Active Employees, Total Budget, Total Disbursed, Repayment Rate, Outstanding, Pending Verification, and Risk Score Avg." },
      { step: 3, title: "Analyze Charts", description: "Budget Utilization by Company (bar chart) and Transaction Status Distribution (donut chart) provide visual insights." },
      { step: 4, title: "Check Alerts", description: "Message strips at the top show urgent items requiring attention — overdue transactions, budget overflow, pending verifications." },
    ],
  },

  // 2. Employee Onboarding
  {
    id: "onboarding", title: "Employee Onboarding", category: "Workforce", portal: "Corporate Portal",
    actors: ["HR Admin", "Operations", "Platform Admin"],
    description: "The Employee Onboarding module manages the full employee lifecycle from initial import to active EWA eligibility. It supports three input methods: single employee creation form, bulk Excel import with a 6-step wizard, and the Tasks/Requests/History object page pattern. The module auto-calculates EWA caps, detects budget overflow, and triggers automatic budget requests when needed.",
    features: [
      { feature: "Single Employee Add Form", actor: "HR Admin", outcome: "Employee created with auto-calculated EWA cap and budget check" },
      { feature: "6-Step Import Wizard", actor: "HR Admin (Maker)", outcome: "Bulk employees imported with column mapping, preview, and validation trace" },
      { feature: "Correct/Incorrect Trace", actor: "HR Admin", outcome: "Row-level validation feedback showing correct, incorrect, and missing data" },
      { feature: "Maker-Checker Approval", actor: "HR Admin (Maker + Checker)", outcome: "Dual-approval workflow for import batches" },
      { feature: "Budget Overflow Detection", actor: "System / HR Admin", outcome: "Auto-creates budget request when onboarding exceeds allocated budget" },
    ],
    steps: [
      { step: 1, title: "Add Single Employee", description: "Click 'Add Employee' on the Tasks tab. Fill in personal details (name, NRC, department, salary). The system auto-calculates EWA cap (Salary × Available EWA%) and checks budget availability." },
      { step: 2, title: "Bulk Import via Wizard", description: "Click 'Import' → Upload Excel/CSV file → Map columns to system fields → Preview data → System validates each row → Review Correct/Incorrect trace → Maker submits → Checker approves." },
      { step: 3, title: "Review Import Batch", description: "The Requests tab shows active import batches with row-level categorization (New/Modified/Missing). Each row shows the employee data with validation status." },
      { step: 4, title: "Handle Budget Overflow", description: "If an employee's EWA cap exceeds the remaining department budget, the system auto-creates a Budget Request. The employee stays in Approved state until the budget request is approved." },
      { step: 5, title: "View History", description: "The History tab shows completed/rejected import batches with checker details, timestamps, and action records." },
    ],
    workflows: [
      { name: "Employee Onboarding Lifecycle", states: ["Draft", "Pending Validation", "Approved", "Active", "Rejected", "Inactive"] },
      { name: "Import Batch Workflow", states: ["Uploaded", "Mapped", "Previewed", "Validated", "Maker Submitted", "Checker Approved", "Completed"] },
    ],
  },

  // 3. Employee Management
  {
    id: "employees", title: "Employee Management", category: "Workforce", portal: "Corporate + Admin Portal",
    actors: ["HR Admin", "Operations", "Finance", "Risk"],
    description: "The Employee Management module is the central directory for all registered employees across all companies. It provides a comprehensive 9-tab Object Page for each employee, including Personal, Employment, Payroll, Budget, Policies, Bank, Documents, History, and Transactions. The module supports search, filtering, bulk actions, and status management.",
    features: [
      { feature: "9-Tab Employee Detail Panel", actor: "HR Admin / Operations", outcome: "Complete 360-degree view of each employee" },
      { feature: "Status Management", actor: "HR Admin", outcome: "Toggle between Active, Frozen, Suspended, Terminated" },
      { feature: "Search & Filter", actor: "All Roles", outcome: "Find employees by name, NRC, company, branch, or status" },
      { feature: "EWA Eligibility Indicator", actor: "HR Admin", outcome: "Visual indicator of trusted employee status" },
    ],
    steps: [
      { step: 1, title: "Search Employees", description: "Use the search bar to find employees by name, NRC, or company. Filter by status (Active, Pending, Frozen) and branch." },
      { step: 2, title: "Open Employee Detail", description: "Click any employee row to open the 9-tab slide-over panel showing Personal, Employment, Payroll, Budget, Policies, Bank, Documents, History, and Transactions." },
      { step: 3, title: "Manage Status", description: "Use the status dropdown to freeze, suspend, or terminate an employee. Frozen employees cannot request advances." },
    ],
  },

  // 4. Transaction Monitor
  {
    id: "transactions", title: "Transaction Monitor", category: "Operations", portal: "All Portals (read)",
    actors: ["Operations", "HR", "Finance", "Risk"],
    description: "The Transaction Monitor provides a live feed of all EWA transactions across the platform. Transactions are tracked through their complete lifecycle from request to disbursement to repayment. The module supports real-time status updates, retry actions for failed transactions, and export to CSV/Excel.",
    features: [
      { feature: "Live Transaction Feed", actor: "Operations", outcome: "Real-time view of all transactions" },
      { feature: "Status Filters", actor: "All Roles", outcome: "Filter by Pending, Approved, Disbursing, Completed, Failed" },
      { feature: "Retry Failed Transactions", actor: "Operations", outcome: "Re-trigger failed disbursement attempts" },
      { feature: "Transaction Detail Panel", actor: "All Roles", outcome: "Full transaction breakdown with amount, fees, channels, and timeline" },
    ],
    steps: [
      { step: 1, title: "View Transaction Feed", description: "The main table shows all transactions with ID, employee, company, amount, status, and timestamp. Use the status filter tabs to narrow the view." },
      { step: 2, title: "Click Transaction Detail", description: "Click any row to open the detail panel showing the full transaction breakdown: requested amount, fees, payout method, disbursement channel, and status timeline." },
      { step: 3, title: "Retry Failed Transactions", description: "For FAILED status transactions, click the Retry button to re-trigger the disbursement. The system will attempt up to 3 retries with exponential backoff." },
    ],
  },

  // 5. Repayment & Settlement
  {
    id: "repayment", title: "Repayment & Settlement", category: "Operations", portal: "Corporate + Ops Portal",
    actors: ["HR Admin", "Finance", "Operations"],
    description: "The Repayment & Settlement module manages the complete repayment lifecycle. It tracks repayment due dates, processes payroll auto-repayment, handles manual corporate portal repayment with bank reference and proof upload, and supports partial repayment management. Late fees are auto-calculated based on the configured slab schedule.",
    features: [
      { feature: "Repayment Tracking", actor: "HR Admin", outcome: "Monitor upcoming and overdue repayments" },
      { feature: "Payroll Auto-Repayment", actor: "Finance", outcome: "Auto-deduct from salary with reconciliation" },
      { feature: "Manual Settlement Submission", actor: "HR Admin / Finance", outcome: "Submit repayment with bank reference and proof upload" },
      { feature: "Late Fee Calculation", actor: "System", outcome: "Auto-calculate late fees based on configured slab schedule" },
    ],
    steps: [
      { step: 1, title: "View Repayment Schedule", description: "The table shows all active advances with their repayment due dates, amounts, and current status. Overdue items are highlighted in red." },
      { step: 2, title: "Submit Settlement", description: "Click 'Submit Settlement' → Select employee(s) → Enter repayment amount (full or partial) → Enter bank reference number → Upload proof document → Submit." },
      { step: 3, title: "Verify Settlement", description: "Operations verifies the bank receipt proof → Maker-Checker approval → Circle Ledger entries updated → Balance reset." },
    ],
  },

  // 6. Settlement Verification
  {
    id: "settlement", title: "Settlement Verification", category: "Operations", portal: "Ops + Finance Portal",
    actors: ["Operations", "Finance"],
    description: "The Settlement Verification module implements the Maker-Checker workflow for approving settlement submissions. Incoming settlements enter a verification queue where the Maker (Operations) reviews the bank receipt proof and the Checker (Finance) provides final approval. The module supports rejection with mandatory reason logging.",
    features: [
      { feature: "Verification Queue", actor: "Operations", outcome: "Incoming settlements awaiting review" },
      { feature: "Maker Review", actor: "Operations (Maker)", outcome: "Verify bank receipt proof and approve/reject" },
      { feature: "Checker Approval", actor: "Finance (Checker)", outcome: "Final approval for large settlements above threshold" },
      { feature: "Rejection with Reason", actor: "Operations / Finance", outcome: "Mandatory reason logged for all rejections" },
    ],
    steps: [
      { step: 1, title: "Review Queue", description: "View the settlement verification queue showing Pending, Maker Verified, and Checker Approved statuses." },
      { step: 2, title: "Maker Verify", description: "Click a settlement row → Open detail panel → Review bank receipt proof → Click Verify (Maker) or Reject with reason." },
      { step: 3, title: "Checker Approve", description: "After Maker verification, Finance Checker reviews the settlement → Approves or Rejects with comment." },
    ],
  },

  // 7. Circle Ledger (GL)
  {
    id: "circle-ledger", title: "Circle Ledger (GL)", category: "Finance", portal: "Finance + Admin Portal",
    actors: ["Finance", "Platform Admin"],
    description: "The Circle Ledger implements immutable double-entry accounting for the EWA platform. Every transaction creates a closed loop of debits and credits that must balance to zero. The ledger supports journal entry viewing, balance verification, trial balance generation, and 7-year regulatory retention. All entries are timestamped and tamper-proof.",
    features: [
      { feature: "Journal Entry View", actor: "Finance", outcome: "View all double-entry journal postings" },
      { feature: "Debit/Credit Balance Check", actor: "Finance", outcome: "Verify that debits equal credits for each circle" },
      { feature: "Trial Balance", actor: "Finance", outcome: "Generate trial balance report across all accounts" },
      { feature: "GL Account Drill-Down", actor: "Finance", outcome: "Navigate from account to transactions to source documents" },
    ],
    steps: [
      { step: 1, title: "View Ledger Entries", description: "The main table shows all journal entries with Entry ID, Date, Account, Debit, Credit, and Circle Reference. Green indicates debit, red indicates credit." },
      { step: 2, title: "Verify Circle Balance", description: "Each transaction creates a 'circle' — a closed loop of entries. The total of each circle must be zero. The system automatically validates this." },
      { step: 3, title: "Generate Trial Balance", description: "Use the Trial Balance action to generate a snapshot of all account balances at a point in time. Export to PDF or Excel." },
    ],
  },

  // 8. Fee Builder & Policy
  {
    id: "fee-builder", title: "Fee Builder & Policy", category: "Finance", portal: "Admin Portal",
    actors: ["Platform Admin"],
    description: "The Fee Builder & Policy module allows Platform Admins to configure the GoRule-based fee engine. It supports multiple fee types (transaction fee, late fee, convenience fee), tiered fee structures based on amount ranges, and company-specific overrides. Fee policies are evaluated in sub-milliseconds at the time of each advance request.",
    features: [
      { feature: "Fee Type Configuration", actor: "Platform Admin", outcome: "Define transaction, late, convenience fee types" },
      { feature: "Tiered Fee Structures", actor: "Platform Admin", outcome: "Set fee percentages by amount range brackets" },
      { feature: "Company Overrides", actor: "Platform Admin", outcome: "Apply company-specific fee adjustments" },
      { feature: "Fee Preview Simulator", actor: "Platform Admin", outcome: "Test fee calculations before deploying" },
    ],
    steps: [
      { step: 1, title: "Create Fee Policy", description: "Click 'New Policy' → Select fee type → Set amount range brackets → Define percentage or flat fee for each tier → Save." },
      { step: 2, title: "Apply Company Override", description: "Select a company from the dropdown → Override the base fee rate for specific tiers → Save the override." },
      { step: 3, title: "Simulate Fee", description: "Use the Simulator tab to test fee calculations with sample amounts and verify the policy works correctly before deploying." },
    ],
  },

  // 9. Budget Management
  {
    id: "budget", title: "Budget Management", category: "Risk & Budget", portal: "Corporate + Risk + Finance Portal",
    actors: ["HR Admin", "Risk Manager", "Finance Officer"],
    description: "The Budget Management module handles the complete budget lifecycle including allocation, utilization tracking, overflow detection, and the 3-tier approval workflow (HR → Risk → Finance). Budgets are allocated per company, department, business unit, or employee group. The module supports budget increase requests, reductions, transfers, and reserves.",
    features: [
      { feature: "Budget Allocation View", actor: "HR Admin", outcome: "View allocated vs utilized vs remaining budget" },
      { feature: "Budget Increase Request", actor: "HR Admin", outcome: "Submit overflow request with justification" },
      { feature: "3-Tier Approval Workflow", actor: "HR → Risk → Finance", outcome: "Multi-level approval with SLA timers" },
      { feature: "Budget Analytics", actor: "Risk Manager", outcome: "Trend, forecast, utilization, and comparison charts" },
    ],
    steps: [
      { step: 1, title: "View Budget Dashboard", description: "KPIs show Total Budget, Used, Remaining, Pending, Utilization %, and Overflow Cases. Bar charts show allocation by company and department." },
      { step: 2, title: "Submit Budget Request", description: "When onboarding exceeds budget, the system auto-creates a request. Or manually create one: select entity → enter amount → add justification → submit." },
      { step: 3, title: "Approval Workflow", description: "Request flows through HR Review (48h SLA) → Risk Review (24h SLA) → Finance Review (24h SLA) → Approved/Rejected. SLA timers and escalation are tracked." },
    ],
  },

  // 10. Risk & Backoffice
  {
    id: "risk", title: "Risk & Backoffice", category: "Risk & Budget", portal: "Risk + Ops Portal",
    actors: ["Risk Manager", "Operations"],
    description: "The Risk & Backoffice module is the command center for risk management. It provides company risk scoring (5-tier A-E), overdue monitoring with drill-down, disbursement control (freeze/unfreeze), ghost employee detection, treasury dashboard, and compliance reporting. Risk scores are auto-recalculated nightly based on transaction history and repayment behavior.",
    features: [
      { feature: "Risk Scoring Dashboard", actor: "Risk Manager", outcome: "Company scores with tier distribution A-E" },
      { feature: "Overdue Monitoring", actor: "Risk Manager", outcome: "Breakdown by 3/7/30 days with alerts" },
      { feature: "Disbursement Control", actor: "Risk Manager", outcome: "Freeze/unfreeze company or branch" },
      { feature: "Ghost Employee Detection", actor: "Risk Manager", outcome: "Alerts for missing employees with outstanding balance" },
      { feature: "Treasury Dashboard", actor: "Risk Manager", outcome: "Total disbursed, outstanding, cash flow forecast" },
    ],
    steps: [
      { step: 1, title: "Review Risk Scores", description: "The dashboard shows company risk scores, tier distribution, and auto-recalculation status. Scores are updated nightly." },
      { step: 2, title: "Monitor Overdues", description: "View the overdue breakdown by days (3/7/30+). Click any row to drill down to company or employee level." },
      { step: 3, title: "Control Disbursement", description: "Freeze a company or branch to halt new advances. View real-time utilization. Unfreeze when conditions improve." },
    ],
  },

  // 11. Reports Center
  {
    id: "reports", title: "Reports Center", category: "Reporting", portal: "All Portals",
    actors: ["All Roles (scoped)"],
    description: "The Reports Center provides role-scoped access to all platform reports including employee summaries, advance summaries, deduction reports, branch comparisons, budget utilization, repayment history, audit trails, and compliance reports. Reports can be filtered by date range, company, branch, and status, then exported to CSV, Excel, or PDF.",
    features: [
      { feature: "Report Type Selector", actor: "All Roles", outcome: "Choose from 10+ report types" },
      { feature: "Date Range & Filters", actor: "All Roles", outcome: "Filter by period, company, branch, status" },
      { feature: "Export Options", actor: "All Roles", outcome: "CSV, Excel, PDF export with formatting" },
      { feature: "Scheduled Reports", actor: "Platform Admin", outcome: "Auto-generate and deliver reports on schedule" },
    ],
    steps: [
      { step: 1, title: "Select Report Type", description: "Choose from Employee Summary, Advance Summary, Deduction Report, Branch Comparison, Budget Utilization, Repayment History, Audit Trail, etc." },
      { step: 2, title: "Set Filters", description: "Configure date range, company, branch, and status filters to narrow the report scope." },
      { step: 3, title: "Export", description: "Click Export to download the report in CSV, Excel, or PDF format." },
    ],
  },

  // 12. Payroll & Deduction
  {
    id: "payroll", title: "Payroll & Deduction", category: "Finance", portal: "Corporate Portal",
    actors: ["HR Admin", "Finance"],
    description: "The Payroll & Deduction module manages the payroll reconciliation process and deduction file export. HR downloads deduction files in multiple formats (CSV, Excel, SAP, Oracle) containing all EWA advance deductions to be processed by the company payroll system. The module tracks reconciliation status between expected and actual deductions.",
    features: [
      { feature: "Period Selector", actor: "HR Admin", outcome: "Select payroll period for deduction generation" },
      { feature: "Deduction Table", actor: "HR Admin / Finance", outcome: "View all deductions per employee for the period" },
      { feature: "Multi-Format Export", actor: "HR Admin / Finance", outcome: "CSV, Excel, SAP, Oracle format download" },
      { feature: "Reconciliation Status", actor: "Finance", outcome: "Track expected vs actual deduction matching" },
    ],
    steps: [
      { step: 1, title: "Select Payroll Period", description: "Choose the payroll period (month) for which to generate the deduction file." },
      { step: 2, title: "Review Deductions", description: "The table shows all employees with active advances and their deduction amounts for the selected period." },
      { step: 3, title: "Export Deduction File", description: "Click 'Export' → Select format (CSV/Excel/SAP/Oracle) → Download the file → Upload to the company payroll system." },
    ],
  },

  // 13. Notification Center
  {
    id: "notifications", title: "Notification Center", category: "Reporting", portal: "All Portals",
    actors: ["HR Admin", "Operations", "Finance", "Platform Admin"],
    description: "The Notification Center aggregates all system notifications across the platform. It includes KYC approval notifications, advance disbursement confirmations, repayment reminders, budget overflow alerts, settlement verification requests, and system maintenance announcements. Notifications are channel-agnostic (in-app, email, SMS) and support read/unread tracking.",
    features: [
      { feature: "Notification Feed", actor: "All Roles", outcome: "Unified view of all notifications" },
      { feature: "Channel Badges", actor: "All Roles", outcome: "Visual indicators for Email, SMS, In-App channels" },
      { feature: "Mark All Read", actor: "All Roles", outcome: "Clear all unread notifications at once" },
      { feature: "Filter by Type", actor: "All Roles", outcome: "Filter by notification category (KYC, Advance, Repayment, System)" },
    ],
    steps: [
      { step: 1, title: "View Notifications", description: "The feed shows all notifications with timestamp, type badge, channel icon, and read/unread status. Unread items are highlighted." },
      { step: 2, title: "Filter Notifications", description: "Use the filter dropdown to narrow by notification type: KYC, Advance, Repayment, Settlement, Budget, System." },
      { step: 3, title: "Mark Read", description: "Click individual notifications to mark as read, or use 'Mark All Read' to clear all." },
    ],
  },

  // 14. Admin & Configuration
  {
    id: "admin", title: "Admin & Configuration", category: "System", portal: "Admin Portal",
    actors: ["Platform Admin"],
    description: "The Admin & Configuration module is the central control panel for Platform Admins. It provides module enable/disable toggles, role/permission matrix management, audit log viewer, system configuration (rate limits, timeouts, feature flags), integration health monitoring, and maintenance mode controls.",
    features: [
      { feature: "Module Toggles", actor: "Platform Admin", outcome: "Enable/disable modules per role" },
      { feature: "Role Permission Matrix", actor: "Platform Admin", outcome: "Configure which roles see which modules" },
      { feature: "Audit Log Viewer", actor: "Platform Admin", outcome: "Searchable audit trail across all entities" },
      { feature: "System Configuration", actor: "Platform Admin", outcome: "Rate limits, timeouts, feature flags, maintenance mode" },
    ],
    steps: [
      { step: 1, title: "Configure Modules", description: "Use the module toggles to enable or disable specific modules for each role type. Changes take effect immediately." },
      { step: 2, title: "Manage Permissions", description: "The role/permission matrix shows which modules each role (HR, Sales, Operations, Finance, Risk, Admin) can access." },
      { step: 3, title: "View Audit Logs", description: "Search and filter the audit log to track all actions across the platform — who did what, when, and to which entity." },
    ],
  },

  // 15. Workflow & Case Management
  {
    id: "workflow", title: "Workflow & Case Management", category: "Integration", portal: "All Portals",
    actors: ["HR", "Finance", "Operations", "Risk"],
    description: "The Workflow & Case Management module provides a unified view of all workflow cases across the platform. It spans employee imports, budget requests, employee verification, company onboarding, settlements, and disbursements. Each case includes state machine visualization, SLA countdown timers, escalation level tracking, and a clickable case detail panel with Approve/Reject/Comment actions. The History tab provides a full audit trail timeline.",
    features: [
      { feature: "My Tasks View", actor: "All Roles", outcome: "See work items assigned to your role" },
      { feature: "All Requests View", actor: "All Roles", outcome: "View all workflow cases across the platform" },
      { feature: "State Machine Visualization", actor: "All Roles", outcome: "Visual flow showing current state and next steps" },
      { feature: "SLA Countdown Timers", actor: "All Roles", outcome: "Track time remaining before escalation" },
      { feature: "Audit Trail Timeline", actor: "All Roles", outcome: "Complete history of who did what and when" },
    ],
    steps: [
      { step: 1, title: "View My Tasks", description: "The My Tasks tab shows work items assigned to your role with priority badges, SLA timers, and escalation indicators." },
      { step: 2, title: "Open Case Detail", description: "Click any case row to open the detail panel showing the state machine flow, case data, SLA timers, and action buttons." },
      { step: 3, title: "Take Action", description: "Use the Approve/Reject/Comment buttons to process the case. Rejections require a mandatory reason. Comments are logged to the audit trail." },
      { step: 4, title: "Review History", description: "The History tab shows the complete audit trail — every state transition, who performed it, when, and what action was taken." },
    ],
    workflows: [
      { name: "Budget Overflow Approval", states: ["Draft", "Submitted", "HR Review", "Risk Review", "Finance Review", "Approved", "Rejected", "Escalated"] },
      { name: "Employee Onboarding", states: ["Draft", "Pending Validation", "Approved", "Active", "Rejected"] },
      { name: "Settlement Verification", states: ["Submitted", "Maker Verified", "Checker Approved", "Posted"] },
    ],
  },

  // 16. Write-Off Management
  {
    id: "writeoff", title: "Write-Off Management", category: "Finance", portal: "Finance + Risk Portal",
    actors: ["Finance Officer", "Risk Manager"],
    description: "The Write-Off Management module handles bad debt write-off processing. When an advance cannot be recovered after extended overdue periods, Finance can initiate a write-off request. The module tracks write-off history, maintains the write-off register, and integrates with the Circle Ledger for GL postings.",
    features: [
      { feature: "Write-Off Register", actor: "Finance", outcome: "Track all write-offs with status and approval" },
      { feature: "Write-Off Request", actor: "Finance", outcome: "Initiate write-off with justification" },
      { feature: "GL Posting", actor: "Finance", outcome: "Auto-create Circle Ledger entries for write-offs" },
    ],
    steps: [
      { step: 1, title: "Identify Write-Off Candidates", description: "Review the overdue register to identify advances that are unlikely to be recovered." },
      { step: 2, title: "Submit Write-Off Request", description: "Select the advance → Enter write-off reason → Submit for approval." },
      { step: 3, title: "Approval & GL Posting", description: "Risk Manager reviews → Finance approves → Circle Ledger entries created → Balance adjusted." },
    ],
  },

  // 17. Form Creator
  {
    id: "form-creator", title: "Form Creator", category: "System", portal: "Admin Portal",
    actors: ["Platform Admin"],
    description: "The Form Creator is a dynamic form builder that allows Platform Admins to create custom KYC forms for companies and employees without code changes. Forms are built using a drag-and-drop field builder with support for text fields, date pickers, file uploads, dropdowns, and conditional logic. Forms can be assigned to specific companies or tenants.",
    features: [
      { feature: "Form Template Builder", actor: "Platform Admin", outcome: "Create custom KYC forms with drag-and-drop" },
      { feature: "Field Types", actor: "Platform Admin", outcome: "Text, date, file upload, dropdown, checkbox, conditional" },
      { feature: "JSON Schema Output", actor: "Platform Admin", outcome: "Forms generate JSON schema for the backend" },
      { feature: "Company Assignment", actor: "Platform Admin", outcome: "Assign forms to specific companies or tenants" },
    ],
    steps: [
      { step: 1, title: "Create Form Template", description: "Click 'New Template' → Name the form → Add fields using the field builder → Configure field types and validation rules." },
      { step: 2, title: "Configure Fields", description: "For each field, set the type (text/date/file/dropdown), label, required status, validation rules, and conditional visibility." },
      { step: 3, title: "Assign to Company", description: "Select the target company or tenant → Assign the form → The form becomes active for KYC collection." },
    ],
  },

  // 18. Error Messages
  {
    id: "errors", title: "Error Messages", category: "System", portal: "Admin Portal",
    actors: ["Platform Admin"],
    description: "The Error Messages module provides a centralized view of all system errors and exceptions. It includes error categorization (validation, integration, system), frequency tracking, resolution status, and error code management. Platform Admins can view error trends, mark errors as resolved, and configure error notifications.",
    features: [
      { feature: "Error Log Table", actor: "Platform Admin", outcome: "View all system errors with categorization" },
      { feature: "Error Frequency Tracking", actor: "Platform Admin", outcome: "Identify recurring errors by type and source" },
      { feature: "Resolution Tracking", actor: "Platform Admin", outcome: "Mark errors as resolved with notes" },
    ],
    steps: [
      { step: 1, title: "Review Error Log", description: "The table shows all errors with code, category, source, timestamp, and status (Open, In Progress, Resolved)." },
      { step: 2, title: "Filter by Category", description: "Filter errors by type: Validation, Integration, System, Payment, or All." },
      { step: 3, title: "Resolve Errors", description: "Click an error → Mark as In Progress or Resolved → Add resolution notes." },
    ],
  },

  // 19. Disbursement Engine
  {
    id: "disbursement", title: "Disbursement Engine", category: "Integration", portal: "Ops + Finance Portal",
    actors: ["Operations", "Finance", "Platform Admin"],
    description: "The Disbursement Engine orchestrates multi-channel payout processing. It supports real-time disbursement (KBZ Pay, Wave, CB Pay via N8N + Temporal), QR manual transfer, MoPayment gateway, and OTC cash code generation. The engine implements 3 retry attempts with exponential backoff, 60-second hard timeouts, and automatic fallback to QR manual on failure.",
    features: [
      { feature: "Disbursement Queue", actor: "Operations", outcome: "View all pending disbursements" },
      { feature: "Channel Status", actor: "Operations", outcome: "Real-time status per disbursement channel" },
      { feature: "Retry Logic", actor: "Operations", outcome: "Auto-retry failed disbursements (3 attempts)" },
      { feature: "Fallback Processing", actor: "Operations", outcome: "Automatic fallback to QR manual on failure" },
    ],
    steps: [
      { step: 1, title: "Monitor Disbursement Queue", description: "View all disbursements with their current state: Requested → Validating → Disbursing → Completed/Failed." },
      { step: 2, title: "Handle Failed Disbursements", description: "For FAILED status, the system automatically retries up to 3 times. After max retries, it falls back to QR manual transfer." },
      { step: 3, title: "Review Channel Performance", description: "The channel status panel shows success rates, average processing time, and failure reasons per payment channel." },
    ],
  },

  // 20. Bank Integration
  {
    id: "bank-integration", title: "Bank Integration", category: "Integration", portal: "Finance + Ops Portal",
    actors: ["Finance", "Operations", "Platform Admin"],
    description: "The Bank Integration module manages connections to payment providers and financial institutions. It supports KBZ Pay, Wave Money, CB Pay, MoPayment Gateway, and direct bank API connections. The module provides integration health monitoring, test connectivity, transaction status sync, and reconciliation with external payment systems.",
    features: [
      { feature: "Integration Health Monitor", actor: "Finance", outcome: "Real-time status of all payment integrations" },
      { feature: "Test Connectivity", actor: "Platform Admin", outcome: "Verify integration endpoints are operational" },
      { feature: "Transaction Sync", actor: "Operations", outcome: "Sync transaction status with external providers" },
      { feature: "Reconciliation", actor: "Finance", outcome: "Match internal ledger with external payment records" },
    ],
    steps: [
      { step: 1, title: "Check Integration Health", description: "The dashboard shows all integrations with their current status (Connected, Degraded, Offline) and last sync time." },
      { step: 2, title: "Test Connectivity", description: "Click 'Test' on any integration to verify the endpoint is responding correctly. Results show response time and status." },
      { step: 3, title: "Sync Transactions", description: "Trigger a manual sync to pull the latest transaction statuses from external payment providers." },
    ],
  },

  // 21. Service Catalog
  {
    id: "service-catalog", title: "Service Catalog", category: "System", portal: "Admin + Ops Portal",
    actors: ["Platform Admin", "Operations"],
    description: "The Service Catalog registers and manages all platform services, microservices, and external integrations. It provides service registry management, fee mapping per service, entity role definitions, and service health monitoring. The catalog is the central source of truth for what services are available and how they are configured.",
    features: [
      { feature: "Service Registry", actor: "Platform Admin", outcome: "Register and manage all platform services" },
      { feature: "Service Detail View", actor: "Platform Admin", outcome: "View configuration, endpoints, and status per service" },
      { feature: "Fee Mapping", actor: "Platform Admin", outcome: "Map fees to specific services and transactions" },
      { feature: "Entity Roles", actor: "Platform Admin", outcome: "Define roles and permissions per service" },
    ],
    steps: [
      { step: 1, title: "View Service Registry", description: "The Service Registry tab shows all registered services with name, version, status, and endpoint URL." },
      { step: 2, title: "Manage Service Details", description: "Click a service to view its configuration, API endpoints, fee mappings, and entity role definitions." },
      { step: 3, title: "Monitor Service Health", description: "The health status column shows real-time availability and response times for each service." },
    ],
  },

  // 22. Fee Hierarchy Engine
  {
    id: "fee-hierarchy", title: "Fee Hierarchy Engine", category: "Finance", portal: "Admin + Finance Portal",
    actors: ["Platform Admin", "Finance"],
    description: "The Fee Hierarchy Engine manages the tiered fee structure that determines how fees are calculated based on amount ranges, company type, and risk tier. It provides a visual hierarchy of fee rules, override management, and effective rate calculation. The engine works in conjunction with the Fee Builder for dynamic fee policy creation.",
    features: [
      { feature: "Fee Hierarchy View", actor: "Platform Admin", outcome: "Visual tree of fee rules from global to company level" },
      { feature: "Override Management", actor: "Platform Admin", outcome: "Apply company-specific fee overrides" },
      { feature: "Effective Rate Calculator", actor: "Finance", outcome: "Calculate the effective fee rate for any transaction" },
    ],
    steps: [
      { step: 1, title: "View Fee Hierarchy", description: "The hierarchy shows fee rules from global (platform-level) down to company-specific overrides." },
      { step: 2, title: "Apply Override", description: "Select a company → Override specific fee tiers → The override takes effect immediately for all future transactions." },
      { step: 3, title: "Calculate Effective Rate", description: "Enter a transaction amount → Select company and risk tier → The calculator shows the effective fee rate after all hierarchy rules are applied." },
    ],
  },

  // 23. Employee Groups
  {
    id: "employee-groups", title: "Employee Groups", category: "Workforce", portal: "Corporate Portal",
    actors: ["HR Admin", "Operations", "Platform Admin"],
    description: "The Employee Groups module allows HR Admins to organize employees into logical groups for bulk operations, policy assignment, and reporting. Groups can be based on department, location, salary band, or custom criteria. The module supports group-based EWA limits, policy overrides, and group-level reporting.",
    features: [
      { feature: "Group Creation", actor: "HR Admin", outcome: "Create employee groups with custom criteria" },
      { feature: "Group-Based Limits", actor: "HR Admin", outcome: "Set EWA limits per employee group" },
      { feature: "Policy Assignment", actor: "HR Admin", outcome: "Assign policies to entire groups" },
      { feature: "Group Reporting", actor: "HR Admin", outcome: "Generate reports per employee group" },
    ],
    steps: [
      { step: 1, title: "Create Group", description: "Click 'New Group' → Name the group → Select criteria (department, location, salary band) → Add employees." },
      { step: 2, title: "Set Group Limits", description: "Select a group → Configure EWA limits (max per cycle, daily limit, single withdrawal cap) that override individual employee limits." },
      { step: 3, title: "Assign Policies", description: "Assign fee policies, withdrawal policies, or repayment policies to the entire group at once." },
    ],
  },

  // 24. Transaction Limits
  {
    id: "limitations", title: "Transaction Limits", category: "System", portal: "Admin + Risk Portal",
    actors: ["Platform Admin", "Risk Manager", "Operations"],
    description: "The Transaction Limits module configures the velocity controls and transaction limits that govern EWA advance requests. Limits include per-employee daily limits, per-company cycle limits, velocity controls (max N advances per day), and global platform caps. The module supports time-window based limits and exception handling.",
    features: [
      { feature: "Per-Employee Limits", actor: "Platform Admin", outcome: "Set daily and cycle limits per employee" },
      { feature: "Per-Company Limits", actor: "Risk Manager", outcome: "Set cycle limits and velocity controls per company" },
      { feature: "Platform Caps", actor: "Platform Admin", outcome: "Set global maximum limits for the entire platform" },
      { feature: "Time-Window Controls", actor: "Platform Admin", outcome: "Configure advance request windows (e.g., 15 days before payday)" },
    ],
    steps: [
      { step: 1, title: "Configure Limits", description: "Set per-employee daily limits, per-company cycle limits, and velocity controls (max advances per day)." },
      { step: 2, title: "Set Time Windows", description: "Configure the advance request window — e.g., employees can request advances only within 15 days of their payday." },
      { step: 3, title: "Review Exceptions", description: "View the exception log showing limit override requests and their approval status." },
    ],
  },
];

/* ─── Platform Overview Content ─── */
function PlatformOverview() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-[#100841] rounded-[3px] p-8 text-white">
        <div className="flex items-start gap-4">
          <BookOpen className="w-8 h-8 text-[#31d891] shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-2">EWA 3.0 2026 — Standalone Earned Wage Access Platform</h2>
            <p className="text-[#868c95] text-[11px] leading-relaxed max-w-3xl">
              EWA 3.0 replaces 8 legacy systems with a unified, SaaS-ready platform enabling corporate employees to access earned wages
              before payday. The platform features multi-channel disbursement, automated risk assessment, circle-based ledger accounting,
              and integrated Maker-Checker workflows across 5 unified portals.
            </p>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Platform Benefits</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Full DW Independence", desc: "Eliminate dependency on 8 legacy systems", icon: <Zap className="w-4 h-4 text-[#31d891]" /> },
            { title: "Unified Platform", desc: "Replace 6 portals with 3 unified portals + Mobile App", icon: <Users className="w-4 h-4 text-[#31d891]" /> },
            { title: "Multi-Channel Disbursement", desc: "Real-time via KBZ Pay/Wave/CB Pay, QR, OTC", icon: <Repeat className="w-4 h-4 text-[#31d891]" /> },
            { title: "Risk-Based Credit Engine", desc: "Automated company risk scoring (5 tiers A-E)", icon: <Shield className="w-4 h-4 text-[#31d891]" /> },
            { title: "Circle Based Ledger", desc: "Immutable double-entry accounting with audit trail", icon: <BookOpen className="w-4 h-4 text-[#31d891]" /> },
            { title: "Maker-Checker Everywhere", desc: "Dual-approval for KYC, repayment, upload, budget", icon: <CheckCircle2 className="w-4 h-4 text-[#31d891]" /> },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[3px] bg-[#efefff] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#100841] mb-1">{item.title}</p>
                  <p className="text-[9px] text-[#4f525d]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Overview */}
      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">System Components</h3>
        <div className="bg-white rounded-[3px] border border-[#dfdfdf]">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-[#efefff] border-b border-[#dfdfdf]">
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">#</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Component</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Technology</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["C-01", "Customer Mobile App", "React Native", "Employee-facing: registration, KYC, advance request, transaction history"],
                ["C-02", "Corporate Portal", "React.js (Next.js)", "HR-facing: employee management, roster sync, settlement, budget request"],
                ["C-03", "Admin Portal", "React.js (Next.js)", "Platform admin: tenant mgmt, GoRule config, Form Creator"],
                ["C-04", "Ops Portal", "React.js (Next.js)", "Operations: transaction monitoring, settlement verification, repayment mgmt"],
                ["C-05", "Risk & Backoffice", "React.js (Next.js)", "Risk: company scoring, budget mgmt, ghost detection, treasury"],
                ["C-06", "Finance Portal", "React.js (Next.js)", "Finance: settlement approval, GL reconciliation, financial reports"],
                ["C-07", "Partner API", "NestJS REST", "External integration: balance inquiry, advance request, status tracking"],
                ["C-08", "EWA Backend (Core)", "NestJS", "Business logic: auth, employee mgmt, advance requests, ledger operations"],
                ["C-09", "Workflow Engine", "Temporal 1.24.x", "Orchestration: disbursement, onboarding workflow, retry, SAGA"],
                ["C-10", "Decision Engine", "GoRule (zen-engine)", "Rules: eligibility, fees, limits, risk scoring — sub-millisecond"],
                ["C-11", "Integration Middleware", "N8N 1.x", "Connectors: KBZ Pay, Wave, CB Pay, MoPayment, SMS, Email"],
                ["C-12", "Form Creator Engine", "JSON Schema + React", "Dynamic KYC forms — configurable per tenant without code"],
                ["C-13", "Circle Ledger Engine", "PostgreSQL + Custom GL", "Double-entry accounting: journal entries, balance verification"],
              ].map(([id, name, tech, purpose], i) => (
                <tr key={i} className="border-b border-[#efefff] hover:bg-[#ffffff]">
                  <td className="px-4 py-2 text-[#4f525d] font-mono">{id}</td>
                  <td className="px-4 py-2 font-semibold text-[#100841]">{name}</td>
                  <td className="px-4 py-2 text-[#4f525d]">{tech}</td>
                  <td className="px-4 py-2 text-[#4f525d]">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Architecture Content ─── */
function ArchitectureContent() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">System Architecture Layers</h3>
        <div className="space-y-4">
          {[
            { layer: "Portal Layer", color: "bg-[#100841]", items: "Corporate Portal, Admin Portal, Ops Portal, Risk Portal, Finance Portal, Mobile App" },
            { layer: "API Gateway", color: "bg-[#31d891]", items: "Auth, RBAC, Rate Limiting, RLS Context, Audit Logging" },
            { layer: "Microservices", color: "bg-[#31d891]/70", items: "Auth Service, Employee Service, Advance Service, Ledger Service, Form Creator Service" },
            { layer: "Engine & Infrastructure", color: "bg-[#10b981]", items: "Temporal Workflow, GoRule Decision Engine, N8N Integration, Circle Ledger, Redis Cache" },
            { layer: "Data Layer", color: "bg-[#f59e0b]", items: "PostgreSQL 15 with Row-Level Security (operator_id + company_id), Audit logs on ALL tables" },
            { layer: "External Systems", color: "bg-[#100841]", items: "KBZ Pay, Wave Money, CB Pay, MoPayment Gateway, SMS/Email Gateway, DICA Registry" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-32 h-10 rounded-[3px] ${item.color} flex items-center justify-center shrink-0`}>
                <span className="text-[9px] font-bold text-white">{item.layer}</span>
              </div>
              <div className="flex-1 bg-white rounded-[3px] border border-[#dfdfdf] px-4 py-2">
                <p className="text-[9px] text-[#4f525d]">{item.items}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Entity Hierarchy</h3>
        <div className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
          <pre className="text-[9px] text-[#4f525d] leading-relaxed font-mono">
{`Platform (EWA Standalone)
└── Operator (Country Tenant — Myanmar, Thailand, Vietnam)
    └── Company (DICA registered entity)
        ├── Company Profile (KYC, DICA reg., license docs, financial docs)
        ├── Company Settlement Account
        ├── Company Type: CORPORATE | SME
        ├── Risk Profile (Score, Tier A-E, Credit Pool, Budget)
        ├── Configuration (GoRule: fees, limits, windows, cycles)
        ├── Users (HR Admins — scope-based)
        │   ├── Admin HR Company (Owner — full access)
        │   ├── Branch HR (branch-scoped)
        │   ├── HR Viewer (read-only)
        │   └── Finance (repayment + export)
        ├── Branches
        │   ├── Default: "Head Office" (auto-created)
        │   └── Branch A, Branch B (created by Admin HR)
        └── Employees
            ├── Assigned to one Branch
            ├── Status: UNVERIFIED → ACTIVE → FROZEN/SUSPENDED/TERMINATED
            ├── Trusted Employee (Whitelisted for EWA)
            └── Request → Disburse → Repay cycle`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Corporate vs SME Comparison</h3>
        <div className="bg-white rounded-[3px] border border-[#dfdfdf]">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-[#efefff] border-b border-[#dfdfdf]">
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Dimension</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Corporate</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">SME</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Employees", "Unlimited (max 10,000)", "Max 50"],
                ["Branches", "Multiple supported", "Single 'Head Office' only"],
                ["HR Users", "Multiple roles (Admin, Branch, Viewer, Finance)", "Single Admin HR (owner)"],
                ["Budget Model", "Accumulated or Separate (per branch)", "Accumulated only"],
                ["Maker-Checker", "Required for upload, repayment, budget", "Auto-disabled (single user)"],
                ["Risk Assessment", "Full: financial docs, bank statements", "Simplified: basic KYC + company info"],
                ["Upload Workflow", "Diff preview → Maker → Checker", "Direct upload → immediate apply"],
                ["Reports", "All reports with branch drill-down", "Core reports, no branch dimension"],
              ].map(([dim, corp, sme], i) => (
                <tr key={i} className="border-b border-[#efefff] hover:bg-[#ffffff]">
                  <td className="px-4 py-2 font-semibold text-[#100841]">{dim}</td>
                  <td className="px-4 py-2 text-[#4f525d]">{corp}</td>
                  <td className="px-4 py-2 text-[#4f525d]">{sme}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Workflows Content ─── */
function WorkflowsContent() {
  const lifecyclePhases = [
    { phase: 0, title: "Company Onboarding & Risk Assessment", desc: "Ops/Self-Register → KYC Review → Financial Docs → Credit Assessment → Budget Approval → Integration → ACTIVE", color: "bg-[#100841]" },
    { phase: 1, title: "HR Setup & Employee Import", desc: "HR Login → Upload Roster → Diff Engine Preview → Maker-Checker Approval", color: "bg-[#31d891]" },
    { phase: 2, title: "Employee Registration & KYC", desc: "Employee Downloads App → Self-Registration → KYC Upload (NRC + Selfie + OCR)", color: "bg-[#31d891]" },
    { phase: 3, title: "Employee Verification & Trusted Status", desc: "Employee Submits Employment Info → 3-Scenario Verification Engine", color: "bg-[#31d891]" },
    { phase: 4, title: "Credit Assessment & Budget Allocation", desc: "Corporate Uploads Financial Docs → Risk Officer Review → Finance Approval", color: "bg-[#10b981]" },
    { phase: 5, title: "Wage Advance Request", desc: "Employee Opens App → 4-Step Advance Flow (Amount → Payout → Review → Confirm)", color: "bg-[#10b981]" },
    { phase: 6, title: "Disbursement", desc: "Multi-Channel Payout: Real-Time / QR Manual / MoPayment / OTC Cash Code", color: "bg-[#f59e0b]" },
    { phase: 7, title: "Repayment & Settlement", desc: "Repayment Due → Payroll Auto / Manual Portal / Auto-Deduct → Maker-Checker", color: "bg-[#f59e0b]" },
    { phase: 8, title: "Circle Ledger Closure & Reporting", desc: "End of Cycle → Reconciliation → Trial Balance → P&L → Risk Recalc → 7-Year Archive", color: "bg-[#100841]" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">EWA Lifecycle — 8 Phases</h3>
        <div className="space-y-3">
          {lifecyclePhases.map((phase) => (
            <div key={phase.phase} className="flex items-start gap-3">
              <div className={`w-16 h-8 rounded-[3px] ${phase.color} flex items-center justify-center shrink-0`}>
                <span className="text-[8px] font-bold text-white">Phase {phase.phase}</span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#100841]">{phase.title}</p>
                <p className="text-[9px] text-[#4f525d] mt-0.5">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Key Workflow State Machines</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Employee Onboarding State Machine */}
          <div className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
            <h4 className="text-[10px] font-bold text-[#100841] mb-3">Employee Onboarding</h4>
            <div className="space-y-2">
              {[
                { state: "Draft", next: "Pending Validation", trigger: "Submit" },
                { state: "Pending Validation", next: "Approved / Rejected", trigger: "Validation Pass / Fail" },
                { state: "Approved", next: "Active", trigger: "Activate" },
                { state: "Active", next: "Inactive", trigger: "Deactivate" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[8px]">
                  <span className="bg-[#efefff] text-[#100841] px-2 py-0.5 rounded-[2px] font-mono">{item.state}</span>
                  <ChevronRight className="w-3 h-3 text-[#31d891]" />
                  <span className="text-[#4f525d]">{item.next}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Overflow State Machine */}
          <div className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
            <h4 className="text-[10px] font-bold text-[#100841] mb-3">Budget Overflow Approval</h4>
            <div className="space-y-2">
              {[
                { state: "Draft", next: "Submitted", trigger: "Submit Request" },
                { state: "Submitted", next: "HR Review", trigger: "HR Accept" },
                { state: "HR Review", next: "Risk Review", trigger: "Risk Accept" },
                { state: "Risk Review", next: "Finance Review", trigger: "Finance Accept" },
                { state: "Finance Review", next: "Approved / Rejected", trigger: "Approve / Reject" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[8px]">
                  <span className="bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-[2px] font-mono">{item.state}</span>
                  <ChevronRight className="w-3 h-3 text-[#31d891]" />
                  <span className="text-[#4f525d]">{item.next}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement State Machine */}
          <div className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
            <h4 className="text-[10px] font-bold text-[#100841] mb-3">Settlement Verification</h4>
            <div className="space-y-2">
              {[
                { state: "Submitted", next: "Maker Verified", trigger: "Ops Verify" },
                { state: "Maker Verified", next: "Checker Approved", trigger: "Finance Approve" },
                { state: "Checker Approved", next: "Posted", trigger: "GL Posted" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[8px]">
                  <span className="bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded-[2px] font-mono">{item.state}</span>
                  <ChevronRight className="w-3 h-3 text-[#31d891]" />
                  <span className="text-[#4f525d]">{item.next}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disbursement State Machine */}
          <div className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
            <h4 className="text-[10px] font-bold text-[#100841] mb-3">Disbursement Engine</h4>
            <div className="space-y-2">
              {[
                { state: "Requested", next: "Validating", trigger: "7-Point Check" },
                { state: "Validating", next: "Disbursing", trigger: "All Checks Pass" },
                { state: "Disbursing", next: "Completed", trigger: "Channel Success" },
                { state: "Disbursing", next: "Failed", trigger: "Channel Failure" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[8px]">
                  <span className="bg-[#f0fdf4] text-[#166534] px-2 py-0.5 rounded-[2px] font-mono">{item.state}</span>
                  <ChevronRight className="w-3 h-3 text-[#31d891]" />
                  <span className="text-[#4f525d]">{item.next}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Roles & Permissions Content ─── */
function RolesContent() {
  const roles = [
    { role: "HR", icon: <Users className="w-4 h-4" />, color: "bg-[#31d891]", desc: "Employee onboarding, roster management, verification, payroll, budget requests", modules: "Onboarding, Employees, Groups, Budget, Reports, Payroll" },
    { role: "Sales", icon: <Users className="w-4 h-4" />, color: "bg-[#10b981]", desc: "Customer engagement metrics, employee adoption tracking, reports", modules: "Dashboard, Reports" },
    { role: "Operations", icon: <Zap className="w-4 h-4" />, color: "bg-[#f59e0b]", desc: "Transaction monitoring, settlement verification, disbursement control, QR processing", modules: "Transactions, Repayment, Settlement, Risk, Disbursement, Workflow" },
    { role: "Back Office", icon: <FileText className="w-4 h-4" />, color: "bg-[#100841]", desc: "Payroll reconciliation, employee data management, reports", modules: "Employees, Payroll, Reports, Transactions" },
    { role: "Finance", icon: <Wallet className="w-4 h-4" />, color: "bg-[#8b5cf6]", desc: "Settlement approval, GL reconciliation, budget approval, financial reports", modules: "Circle Ledger, Budget, Settlement, Payroll, Reports, Disbursement" },
    { role: "Risk", icon: <ShieldAlert className="w-4 h-4" />, color: "bg-[#ef4444]", desc: "Company risk scoring, budget management, overdue monitoring, ghost detection", modules: "Risk, Budget, Employees, Reports, Write-Off, Workflow" },
    { role: "Platform Admin", icon: <Settings className="w-4 h-4" />, color: "bg-[#100841]", desc: "Full platform control: module config, GoRule, integrations, Form Creator, audit", modules: "All 24 modules" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Portal Roles & Scope</h3>
        <div className="space-y-3">
          {roles.map((role, i) => (
            <div key={i} className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-[3px] ${role.color} flex items-center justify-center shrink-0 text-white`}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[10px] font-bold text-[#100841]">{role.role}</h4>
                    <span className="text-[8px] text-[#4f525d]">Portal</span>
                  </div>
                  <p className="text-[9px] text-[#4f525d] mb-2">{role.desc}</p>
                  <p className="text-[8px] text-[#31d891] font-mono">{role.modules}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Role-Based View Switching</h3>
        <div className="bg-[#efefff] rounded-[3px] border border-[#31d891]/20 p-4">
          <p className="text-[9px] text-[#100841] leading-relaxed">
            The platform includes a <strong>View As</strong> dropdown in the top-right header that allows instant switching
            between all 7 roles. Each role sees a different set of modules in the sidebar navigation. This enables
            comprehensive testing and demonstration of the platform from any role's perspective without needing separate accounts.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── API Reference Content ─── */
function APIContent() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Partner API Endpoints</h3>
        <div className="bg-white rounded-[3px] border border-[#dfdfdf]">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-[#efefff] border-b border-[#dfdfdf]">
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Endpoint</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Method</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Description</th>
                <th className="text-left px-4 py-2 font-semibold text-[#100841]">Auth</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["/api/v1/employees/{id}/balance", "GET", "Real-time employee balance inquiry", "OAuth 2.0"],
                ["/api/v1/employees/{id}/eligibility", "GET", "Employee EWA eligibility check", "OAuth 2.0"],
                ["/api/v1/advances", "POST", "Create wage advance request", "OAuth 2.0 + HMAC"],
                ["/api/v1/advances/{txId}/status", "GET", "Track advance disbursement status", "OAuth 2.0"],
                ["/api/v1/employees/{id}/transactions", "GET", "Paginated transaction history", "OAuth 2.0"],
                ["/api/v1/fee-schedule", "GET", "Current fee structure and rates", "OAuth 2.0"],
                ["/api/v1/disbursement/destinations", "GET", "Supported payout channels", "OAuth 2.0"],
                ["/webhooks/{partnerId}", "POST", "Real-time event notifications", "HMAC-SHA256"],
              ].map(([ep, method, desc, auth], i) => (
                <tr key={i} className="border-b border-[#efefff] hover:bg-[#ffffff]">
                  <td className="px-4 py-2 font-mono text-[#31d891]">{ep}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] ${
                      method === "GET" ? "bg-[#efefff] text-[#31d891]" : "bg-[#dcfce7] text-[#166534]"
                    }`}>{method}</span>
                  </td>
                  <td className="px-4 py-2 text-[#4f525d]">{desc}</td>
                  <td className="px-4 py-2 text-[#4f525d]">{auth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Integration Architecture</h3>
        <div className="space-y-3">
          {[
            { name: "KBZ Pay", type: "Real-Time Payment", protocol: "N8N Connector", status: "Active" },
            { name: "Wave Money", type: "Real-Time Payment", protocol: "N8N Connector", status: "Active" },
            { name: "CB Pay", type: "Real-Time Payment", protocol: "N8N Connector", status: "Active" },
            { name: "MoPayment", type: "Payment Gateway", protocol: "REST API", status: "Active" },
            { name: "SMS Gateway", type: "Notification", protocol: "REST API", status: "Active" },
            { name: "Email Gateway", type: "Notification", protocol: "SMTP / REST", status: "Active" },
            { name: "DICA Registry", type: "Company Verification", protocol: "External API", status: "Planned" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-[3px] border border-[#dfdfdf] px-4 py-2 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10b981] shrink-0" />
              <span className="text-[9px] font-bold text-[#100841] w-28">{item.name}</span>
              <span className="text-[9px] text-[#4f525d] w-32">{item.type}</span>
              <span className="text-[8px] font-mono text-[#31d891] bg-[#efefff] px-1.5 py-0.5 rounded-[2px]">{item.protocol}</span>
              <span className="text-[8px] text-[#166534] bg-[#dcfce7] px-1.5 py-0.5 rounded-[2px] ml-auto">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Module Guide Component ─── */
function ModuleGuideDetail({ guide }: { guide: ModuleGuide }) {
  const [showSteps, setShowSteps] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-[#100841] rounded-[3px] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-[3px] bg-[#31d891]/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#31d891]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold">{guide.title}</h2>
              <span className="text-[9px] bg-[#31d891]/30 text-[#67e8f9] px-2 py-0.5 rounded-[2px] font-mono">
                {guide.category}
              </span>
            </div>
            <p className="text-[10px] text-[#868c95]">{guide.portal}</p>
            <p className="text-[10px] text-[#868c95] mt-1">Actors: {guide.actors.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
        <p className="text-[10px] text-[#4f525d] leading-relaxed">{guide.description}</p>
      </div>

      {/* Features */}
      <div>
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-2 text-[10px] font-bold text-[#100841] uppercase tracking-widest mb-3 hover:text-[#31d891] transition-colors"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${showFeatures ? "rotate-90" : ""}`} />
          Features ({guide.features.length})
        </button>
        {showFeatures && (
          <div className="bg-white rounded-[3px] border border-[#dfdfdf]">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="bg-[#efefff] border-b border-[#dfdfdf]">
                  <th className="text-left px-4 py-2 font-semibold text-[#100841]">Feature</th>
                  <th className="text-left px-4 py-2 font-semibold text-[#100841]">Actor</th>
                  <th className="text-left px-4 py-2 font-semibold text-[#100841]">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {guide.features.map((f, i) => (
                  <tr key={i} className="border-b border-[#efefff] hover:bg-[#ffffff]">
                    <td className="px-4 py-2 font-semibold text-[#100841]">{f.feature}</td>
                    <td className="px-4 py-2 text-[#4f525d]">{f.actor}</td>
                    <td className="px-4 py-2 text-[#4f525d]">{f.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step-by-Step Guide */}
      <div>
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="flex items-center gap-2 text-[10px] font-bold text-[#100841] uppercase tracking-widest mb-3 hover:text-[#31d891] transition-colors"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${showSteps ? "rotate-90" : ""}`} />
          Step-by-Step Guide ({guide.steps.length} steps)
        </button>
        {showSteps && (
          <div className="space-y-3">
            {guide.steps.map((step) => (
              <div key={step.step} className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-[3px] bg-[#100841] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{step.step}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-[#100841] mb-1">{step.title}</h4>
                    <p className="text-[9px] text-[#4f525d] leading-relaxed">{step.description}</p>
                    {step.tip && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <Info className="w-3 h-3 text-[#31d891] shrink-0 mt-0.5" />
                        <p className="text-[8px] text-[#31d891] bg-[#efefff] px-2 py-1 rounded-[2px]">{step.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflows */}
      {guide.workflows && guide.workflows.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-[#100841] uppercase tracking-widest mb-3">State Machines</h4>
          <div className="space-y-3">
            {guide.workflows.map((wf, i) => (
              <div key={i} className="bg-white rounded-[3px] border border-[#dfdfdf] p-4">
                <h5 className="text-[9px] font-bold text-[#100841] mb-2">{wf.name}</h5>
                <div className="flex items-center gap-1 flex-wrap">
                  {wf.states.map((state, j) => (
                    <div key={j} className="flex items-center gap-1">
                      <span className="text-[8px] font-mono bg-[#efefff] text-[#100841] px-2 py-0.5 rounded-[2px] border border-[#31d891]/20">
                        {state}
                      </span>
                      {j < wf.states.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-[#31d891]" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations */}
      {guide.integrations && guide.integrations.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-[#100841] uppercase tracking-widest mb-3">Integrations</h4>
          <div className="flex flex-wrap gap-2">
            {guide.integrations.map((int, i) => (
              <span key={i} className="text-[8px] bg-[#efefff] text-[#4f525d] px-2 py-1 rounded-[2px] border border-[#dfdfdf] font-mono">
                {int}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Integrations */}
      {guide.integrations && guide.integrations.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-[#100841] uppercase tracking-widest mb-3">Integrations</h4>
          <div className="flex flex-wrap gap-2">
            {guide.integrations.map((int, i) => (
              <span key={i} className="text-[8px] bg-[#efefff] text-[#4f525d] px-2 py-1 rounded-[2px] border border-[#dfdfdf] font-mono">
                {int}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Design System Interactive Showcase ─── */
function DesignSystemContent() {
  const [btnClicks, setBtnClicks] = useState(0);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-[#100841] text-white p-5 rounded-[3px] border border-[#31d891]/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-base font-bold uppercase tracking-wider mb-1">EWA 3.0 Enterprise Design System</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            The visual language of EWA 3.0 is a SAP Fiori-inspired neobrutalist fintech console.
            It utilizes sharp corners, monospace number treatments, authoritative typography, and a single source of truth structure for code maintainability.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-[#31d891]/10 to-transparent pointer-events-none" />
      </div>

      {/* Grid of Design Tokens */}
      <div className="grid grid-cols-2 gap-4">
        {/* Colors */}
        <EnterpriseCard className="p-4">
          <h3 className="text-xs font-bold text-[#100841] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">1. Visual Theme Swatches</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-slate-100 rounded-[2px] flex items-center gap-2 bg-white">
              <span className="w-4 h-4 bg-[#100841] border border-slate-200 shrink-0 block" />
              <div>
                <p className="text-[9px] font-bold text-[#100841] leading-none">EWA NAVY</p>
                <p className="text-[8px] text-slate-400 font-mono">#100841</p>
              </div>
            </div>
            <div className="p-2 border border-slate-100 rounded-[2px] flex items-center gap-2 bg-white">
              <span className="w-4 h-4 bg-[#31d891] border border-slate-200 shrink-0 block" />
              <div>
                <p className="text-[9px] font-bold text-[#100841] leading-none">EWA TEAL</p>
                <p className="text-[8px] text-slate-400 font-mono">#31d891</p>
              </div>
            </div>
            <div className="p-2 border border-slate-100 rounded-[2px] flex items-center gap-2 bg-white">
              <span className="w-4 h-4 bg-[#2e7d32] border border-slate-200 shrink-0 block" />
              <div>
                <p className="text-[9px] font-bold text-[#100841] leading-none">SUCCESS</p>
                <p className="text-[8px] text-slate-400 font-mono">#2e7d32</p>
              </div>
            </div>
            <div className="p-2 border border-slate-100 rounded-[2px] flex items-center gap-2 bg-white">
              <span className="w-4 h-4 bg-[#e65100] border border-slate-200 shrink-0 block" />
              <div>
                <p className="text-[9px] font-bold text-[#100841] leading-none">PENDING</p>
                <p className="text-[8px] text-slate-400 font-mono">#e65100</p>
              </div>
            </div>
          </div>
        </EnterpriseCard>

        {/* Typography */}
        <EnterpriseCard className="p-4">
          <h3 className="text-xs font-bold text-[#100841] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">2. Typography Pairings</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest leading-none mb-1">Display Headings</p>
              <p className="text-sm font-bold text-[#100841] font-sans tracking-tight">Inter Sans-Serif (Bold & Tight)</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest leading-none mb-1">Quantitative Ledger</p>
              <p className="text-sm font-mono font-bold text-slate-700 tracking-tight">JetBrains Mono 1,500,200.00 MMK</p>
            </div>
          </div>
        </EnterpriseCard>
      </div>

      {/* KPI Cards Showcase */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#100841] uppercase tracking-wider">3. Enterprise KPI Cards</h3>
        <div className="grid grid-cols-5 gap-2">
          <EnterpriseKpiCard label="Platform Total" value="84,102" accentColor="navy" />
          <EnterpriseKpiCard label="Active Caps" value="1.25%" accentColor="teal" />
          <EnterpriseKpiCard label="Disbursed" value="12,450,000 MMK" accentColor="emerald" />
          <EnterpriseKpiCard label="Pending Checker" value="4 Batches" accentColor="amber" />
          <EnterpriseKpiCard label="System Overdue" value="142,000 MMK" accentColor="red" />
        </div>
      </div>

      {/* Badges and Buttons Showcase */}
      <div className="grid grid-cols-2 gap-4">
        {/* Badges */}
        <EnterpriseCard className="p-4">
          <h3 className="text-xs font-bold text-[#100841] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">4. SAP Fiori Status Badges</h3>
          <div className="flex flex-wrap gap-2">
            <EnterpriseBadge variant="success">Completed</EnterpriseBadge>
            <EnterpriseBadge variant="warning">Pending Approval</EnterpriseBadge>
            <EnterpriseBadge variant="error">Settlement Overdue</EnterpriseBadge>
            <EnterpriseBadge variant="info">Active EWA Cap</EnterpriseBadge>
            <EnterpriseBadge variant="neutral">Draft Group</EnterpriseBadge>
          </div>
        </EnterpriseCard>

        {/* Buttons */}
        <EnterpriseCard className="p-4">
          <h3 className="text-xs font-bold text-[#100841] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">5. Console Action Buttons</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <EnterpriseButton variant="primary" onClick={() => setBtnClicks(c => c + 1)}>
              Primary Action ({btnClicks})
            </EnterpriseButton>
            <EnterpriseButton variant="secondary">
              Secondary Button
            </EnterpriseButton>
            <EnterpriseButton variant="danger">
              Destructive Action
            </EnterpriseButton>
          </div>
        </EnterpriseCard>
      </div>

      {/* Alerts and Dividers */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#100841] uppercase tracking-wider">6. Interactive Message Strips & Signature Motif</h3>
        <div className="space-y-2">
          <EnterpriseMessageStrip variant="info" message="Information Strip: System configuration rules are active and binding." />
          <EnterpriseMessageStrip variant="warning" message="Warning Strip: Maker batch has pending checker review (exceeds standard risk tolerance)." />
          <EnterpriseMessageStrip variant="error" message="Error Strip: Failed connection on Myanmar Payment Network integration. Retrying in 12s." />
          <EnterpriseMessageStrip variant="success" message="Success Strip: Payroll reconciliation matching is 100% complete." />
        </div>

        <div className="pt-2">
          <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Signature Ledger Flow Divider Motif</p>
          <LedgerDivider />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page Component ─── */
export function DocumentationPage() {
  const [activeSection, setActiveSection] = useState<DocCategory>("overview");
  const [selectedModule, setSelectedModule] = useState<ModuleGuideId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModuleList, setShowModuleList] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredModules = useMemo(() => {
    if (!searchQuery) return MODULE_GUIDES;
    const q = searchQuery.toLowerCase();
    return MODULE_GUIDES.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.features.some(f => f.feature.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const selectedGuide = useMemo(() =>
    selectedModule ? MODULE_GUIDES.find(m => m.id === selectedModule) : null,
    [selectedModule]
  );

  const selectedSectionContent = () => {
    switch (activeSection) {
      case "overview": return <PlatformOverview />;
      case "architecture": return <ArchitectureContent />;
      case "workflows": return <WorkflowsContent />;
      case "roles": return <RolesContent />;
      case "api": return <APIContent />;
      case "design": return <DesignSystemContent />;
      default: return <PlatformOverview />;
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Left Sidebar — Documentation Navigation */}
      <div className={`w-64 shrink-0 bg-white border-r border-[#dfdfdf] flex flex-col ${sidebarOpen ? "block" : "hidden"} transition-all`}>
        {/* Search */}
        <div className="p-3 border-b border-[#dfdfdf]">
          <div className="relative">
            <Search className="w-3 h-3 text-[#868c95] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveSection("modules"); }}
              className="w-full pl-7 pr-2 py-1.5 text-[9px] bg-[#efefff] border border-[#dfdfdf] rounded-[3px] text-[#100841] placeholder:text-[#868c95] focus:outline-none focus:border-[#31d891]"
            />
          </div>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-auto py-2">
          {DOC_SECTIONS.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => { setActiveSection(section.id); setSelectedModule(null); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[9px] transition-colors ${
                  activeSection === section.id && !selectedModule
                    ? "bg-[#100841]/5 text-[#100841] font-semibold border-r-2 border-[#31d891]"
                    : "text-[#4f525d] hover:bg-[#efefff]"
                }`}
              >
                <span className={activeSection === section.id ? "text-[#31d891]" : "text-[#868c95]"}>{section.icon}</span>
                <span>{section.title}</span>
              </button>
            </div>
          ))}

          {/* Module Guides Sub-Navigation */}
          {(activeSection === "modules" || searchQuery) && (
            <div className="mt-2 pt-2 border-t border-[#efefff]">
              <p className="px-3 py-1 text-[8px] font-bold text-[#868c95] uppercase tracking-widest">
                Module Guides ({filteredModules.length})
              </p>
              {filteredModules.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => { setSelectedModule(guide.id); }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[9px] transition-colors ${
                    selectedModule === guide.id
                      ? "bg-[#efefff] text-[#31d891] font-semibold"
                      : "text-[#4f525d] hover:bg-[#efefff]"
                  }`}
                >
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{guide.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-[22px] z-10 w-4 h-4 bg-white border border-[#dfdfdf] rounded-r-[2px] flex items-center justify-center text-[#868c95] hover:text-[#100841]"
      >
        {sidebarOpen ? <ChevronLeft className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
      </button>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#ffffff] p-6">
        {/* Breadcrumb / Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[9px] text-[#868c95] mb-2">
            <BookOpen className="w-3 h-3" />
            <span>Documentation</span>
            <ChevronRight className="w-2.5 h-2.5" />
            {selectedModule ? (
              <>
                <span className="text-[#31d891]">{selectedGuide?.title}</span>
              </>
            ) : (
              <span className="text-[#100841] font-semibold">
                {DOC_SECTIONS.find(s => s.id === activeSection)?.title}
              </span>
            )}
          </div>
          {selectedModule && selectedGuide && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#100841]">{selectedGuide.title}</h1>
              <span className="text-[9px] bg-[#efefff] text-[#31d891] px-2 py-0.5 rounded-[2px] font-mono">
                {selectedGuide.category}
              </span>
              <span className="text-[9px] text-[#4f525d]">{selectedGuide.portal}</span>
            </div>
          )}
          {!selectedModule && (
            <h1 className="text-lg font-bold text-[#100841]">
              {DOC_SECTIONS.find(s => s.id === activeSection)?.title}
            </h1>
          )}
        </div>

        {/* Content */}
        {selectedModule && selectedGuide ? (
          <ModuleGuideDetail guide={selectedGuide} />
        ) : (
          selectedSectionContent()
        )}
      </div>
    </div>
  );
}
