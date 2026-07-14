import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  Check, 
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnterpriseBadge } from "./EnterpriseComponents";

export interface ColumnDef<T> {
  id: string;
  header: React.ReactNode;
  accessor: (row: T, index?: number) => React.ReactNode;
  // A string accessor for search filter
  searchString?: (row: T) => string;
  isNumeric?: boolean;
  align?: "left" | "right" | "center";
  cellClassName?: string | ((row: T) => string);
}

export interface FilterDef<T> {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  filterFn: (row: T, value: string) => boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "normal" | "danger" | "success";
}

export interface EnterpriseTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string | number;
  filters?: FilterDef<T>[];
  actions?: TableAction<T>[];
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (selectedKeys: Set<string | number>) => void;
  searchPlaceholder?: string;
  initialSearch?: string;
  // Numeric column summaries (e.g. sum)
  showSummaries?: boolean;
  // Optional custom text for no data
  noDataText?: string;
  summary?: {
    label: string;
    columns: Record<string, number>;
  };
}

export function EnterpriseTable<T>({
  data,
  columns,
  rowKey,
  filters = [],
  actions = [],
  selectable = false,
  selectedKeys,
  onSelectionChange,
  searchPlaceholder = "Search records...",
  initialSearch = "",
  showSummaries = true,
  noDataText = "No records found matching your criteria",
  summary
}: EnterpriseTableProps<T>) {
  // State
  const [search, setSearch] = useState(initialSearch);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState<string | number | null>(null);

  // References
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterValues]);

  // Click outside to close action menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenuRowId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (search) {
        const query = search.toLowerCase();
        const matchesSearch = columns.some((col) => {
          if (col.searchString) {
            return col.searchString(row).toLowerCase().includes(query);
          }
          // Fallback to text representations
          try {
            const cellValue = col.accessor(row);
            if (typeof cellValue === "string" || typeof cellValue === "number") {
              return String(cellValue).toLowerCase().includes(query);
            }
          } catch (e) {
            // Ignore accessor errors
          }
          return false;
        });
        if (!matchesSearch) return false;
      }

      // 2. Dropdown filters
      for (const filter of filters) {
        const selectedValue = filterValues[filter.id];
        if (selectedValue && selectedValue !== "All" && selectedValue !== "") {
          if (!filter.filterFn(row, selectedValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, columns, filters, filterValues, search]);

  // Pagination bounds
  const totalRecords = filteredData.length;
  const pageSize = 10;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage]);

  // Selected state management
  const localSelectedKeys = useMemo(() => selectedKeys || new Set<string | number>(), [selectedKeys]);

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelected = new Set<string | number>(localSelectedKeys);
    paginatedData.forEach((row) => {
      const key = rowKey(row);
      if (checked) {
        newSelected.add(key);
      } else {
        newSelected.delete(key);
      }
    });
    onSelectionChange(newSelected);
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelected = new Set<string | number>(localSelectedKeys);
    const key = rowKey(row);
    if (checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    onSelectionChange(newSelected);
  };

  const isAllPaginatedRowsSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((row) => localSelectedKeys.has(rowKey(row)));
  }, [paginatedData, localSelectedKeys, rowKey]);

  // Calculate Column Summaries (Sums for Numeric columns)
  const summaries = useMemo(() => {
    const sums: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.isNumeric) {
        let total = 0;
        filteredData.forEach((row) => {
          // Attempt to extract numeric value from string or direct number
          const cellValue = col.accessor(row);
          if (typeof cellValue === "number") {
            total += cellValue;
          } else if (typeof cellValue === "string") {
            const parsed = parseFloat(cellValue.replace(/[^0-9.-]/g, ""));
            if (!isNaN(parsed)) {
              total += parsed;
            }
          }
        });
        sums[col.id] = total;
      }
    });
    return sums;
  }, [filteredData, columns]);

  // Format summaries
  const formatValue = (colId: string, val: number) => {
    // Standard format MMK helper or currency helper
    if (colId.toLowerCase().includes("amount") || colId.toLowerCase().includes("salary") || colId.toLowerCase().includes("fee") || colId.toLowerCase().includes("cap") || colId.toLowerCase().includes("available") || colId.toLowerCase().includes("outstanding") || colId.toLowerCase().includes("total") || colId.toLowerCase().includes("principal")) {
      return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(val) + " MMK";
    }
    return new Intl.NumberFormat("en-US").format(val);
  };

  // Pagination navigation helpers
  const startRecordNum = (currentPage - 1) * pageSize + 1;
  const endRecordNum = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="space-y-3 bg-white border border-[#dfdfdf] rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* ===== 1. TABLE CONTROL TOOLBAR ===== */}
      <div className="p-3 bg-slate-50 border-b border-[#dfdfdf] flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#868c95]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-[#dfdfdf] rounded-[3px] bg-white focus:border-[#100841] focus:ring-1 focus:ring-[#100841]/20 outline-none transition-colors"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Advanced Filters Button */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-[3px] text-[11px] font-semibold transition-colors cursor-pointer",
                showAdvancedFilters 
                  ? "bg-[#100841] text-white border-[#100841]" 
                  : "bg-white text-[#100841] border-[#dfdfdf] hover:bg-[#efefff]"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Filters</span>
              {Object.values(filterValues).filter(v => v && v !== "All").length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                  {Object.values(filterValues).filter(v => v && v !== "All").length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Selected count info pill / general metadata */}
        <div className="flex items-center gap-2">
          {selectable && localSelectedKeys.size > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px] bg-[#e3f2fd] border border-[#bbdefb] text-[#1565c0] text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{localSelectedKeys.size} Selected</span>
              <button 
                onClick={() => onSelectionChange?.(new Set())}
                className="ml-1 text-[#0d47a1] hover:text-red-500 font-bold"
              >
                Clear
              </button>
            </div>
          )}
          <span className="text-[10px] text-[#4f525d] font-mono uppercase tracking-wider font-bold">
            {totalRecords > 0 ? `Showing ${startRecordNum}-${endRecordNum} of ${totalRecords} Records` : "0 Records"}
          </span>
        </div>
      </div>

      {/* ===== 2. COLLAPSIBLE ADVANCED FILTER PANEL ===== */}
      {filters.length > 0 && showAdvancedFilters && (
        <div className="p-3 bg-[#efefff] border-b border-[#dfdfdf] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-1">
              <label className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">{filter.label}</label>
              <select
                value={filterValues[filter.id] || "All"}
                onChange={(e) => {
                  setFilterValues({ ...filterValues, [filter.id]: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 text-[11px] border border-[#dfdfdf] rounded-[3px] bg-white text-[#100841] outline-none focus:border-[#100841] focus:ring-1 focus:ring-[#100841]/20"
              >
                <option value="All">All {filter.label}s</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="sm:col-span-2 md:col-span-3 flex items-center justify-end pt-1">
            <button
              onClick={() => {
                setFilterValues({});
                setSearch("");
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* ===== 3. DATA TABLE BODY ===== */}
      <div className="overflow-x-auto px-4 pb-2">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#ffffff] border-b border-[#dfdfdf]">
              {selectable && (
                <th className="w-10 text-center py-2 px-3">
                  <input
                    type="checkbox"
                    checked={isAllPaginatedRowsSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[2px] border border-[#dfdfdf] accent-[#100841] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "py-2 px-3 font-bold text-[#4f525d] uppercase tracking-wider text-left whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="w-12 text-center py-2 px-3 font-bold text-[#4f525d] uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIdx) => {
              const id = rowKey(row);
              const isSelected = localSelectedKeys.has(id);
              return (
                <tr
                  key={id}
                  className={cn(
                    "hover:bg-[#efefff] border-b border-[#efefff] transition-colors relative",
                    isSelected && "bg-[#e8f0fe] hover:bg-[#e1ecfe]"
                  )}
                >
                  {selectable && (
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(row, e.target.checked)}
                        className="w-3.5 h-3.5 rounded-[2px] border border-[#dfdfdf] accent-[#100841] cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "py-2.5 px-3 whitespace-nowrap",
                        col.align === "right" && "text-right font-mono tabular-nums",
                        col.align === "center" && "text-center",
                        typeof col.cellClassName === "function" ? col.cellClassName(row) : col.cellClassName
                      )}
                    >
                      {col.accessor(row, rowIdx)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="py-2.5 px-3 text-center relative overflow-visible">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionMenuRowId(activeActionMenuRowId === id ? null : id);
                        }}
                        className="p-1 hover:bg-slate-200/60 rounded-[3px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Show Actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Floating Actions Menu */}
                      {activeActionMenuRowId === id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-3 top-8 bg-white border border-[#dfdfdf] rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] p-1 z-50 min-w-[120px] text-left animate-in fade-in duration-100"
                        >
                          {actions.map((act) => (
                            <button
                              key={act.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                act.onClick(row);
                                setActiveActionMenuRowId(null);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[2px] text-[10px] text-left font-semibold hover:bg-[#efefff] transition-colors cursor-pointer",
                                act.variant === "danger" 
                                  ? "text-red-600 hover:bg-red-50" 
                                  : act.variant === "success" 
                                    ? "text-emerald-600 hover:bg-emerald-50" 
                                    : "text-[#100841]"
                              )}
                            >
                              {act.icon && <span className="shrink-0">{act.icon}</span>}
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Zero state */}
            {totalRecords === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="py-12 text-center text-[#868c95]"
                >
                  <AlertCircle className="w-6 h-6 text-[#dfdfdf] mx-auto mb-2" />
                  <p className="text-[11px] font-semibold">{noDataText}</p>
                </td>
              </tr>
            )}
          </tbody>

          {/* ===== 4. SUMMARY FOOTER ROW ===== */}
          {showSummaries && totalRecords > 0 && (columns.some((col) => col.isNumeric) || summary) && (
            <tfoot>
              <tr className="bg-[#ffffff] border-t-2 border-[#dfdfdf] font-bold">
                {selectable && <td className="py-2 px-3" />}
                {columns.map((col, idx) => {
                  const isFirstCell = idx === 0;
                  if (col.isNumeric) {
                    const val = summary?.columns[col.id] ?? summaries[col.id];
                    return (
                      <td
                        key={col.id}
                        className={cn(
                          "py-2 px-3 font-mono tabular-nums text-[#100841]",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {formatValue(col.id, val)}
                      </td>
                    );
                  }
                  return (
                    <td key={col.id} className="py-2 px-3 text-[#4f525d] text-[10px] uppercase tracking-wider font-bold">
                      {isFirstCell ? (summary?.label || "Total Summary") : ""}
                    </td>
                  );
                })}
                {actions.length > 0 && <td className="py-2 px-3" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ===== 5. PAGINATION CONTROLS ===== */}
      {totalPages > 1 && (
        <div className="p-3 bg-slate-50 border-t border-[#dfdfdf] flex items-center justify-between gap-4">
          <span className="text-[10px] text-[#4f525d] font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-[10px] font-semibold border border-[#dfdfdf] rounded-[2px] bg-white text-[#4f525d] hover:bg-[#efefff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-[#dfdfdf] rounded-[2px] bg-white text-[#4f525d] hover:bg-[#efefff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {/* Page number indicators */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Show window of pages around current page
              if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-bold border rounded-[2px] cursor-pointer transition-colors",
                      currentPage === pageNum
                        ? "bg-[#100841] text-white border-[#100841]"
                        : "bg-white text-[#4f525d] border-[#dfdfdf] hover:bg-[#efefff]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="px-1 text-slate-400 text-xs select-none">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-[#dfdfdf] rounded-[2px] bg-white text-[#4f525d] hover:bg-[#efefff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-[10px] font-semibold border border-[#dfdfdf] rounded-[2px] bg-white text-[#4f525d] hover:bg-[#efefff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
