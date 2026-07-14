/**
 * EnterpriseDataTable — Reusable enterprise-grade data table
 * Features: Pagination, row selection (checkbox), bulk actions, summary footer, search/filter bar
 * Design: Enterprise Fintech — Sharp borders, compact density, authoritative typography
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download, Filter, ArrowUpDown, CheckSquare, Square
} from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface EnterpriseDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T | string;
  searchPlaceholder?: string;
  pageSize?: number;
  rowIdKey?: keyof T;
  onRowSelect?: (selected: T[]) => void;
  onRowClick?: (row: T) => void;
  bulkActions?: { label: string; icon?: React.ReactNode; onClick: (selected: T[]) => void; variant?: "default" | "destructive" | "outline" }[];
  title?: string;
  totalLabel?: string;
  extraControls?: React.ReactNode;
}

export function EnterpriseDataTable<T extends Record<string, any>>({
  data, columns, searchKey, searchPlaceholder = "Search...",
  pageSize = 10, rowIdKey = "id", onRowSelect, onRowClick,
  bulkActions, title, totalLabel, extraControls
}: EnterpriseDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];
    if (search && searchKey) {
      const sk = String(searchKey);
      result = result.filter(r => {
        const v = String(r[sk] ?? "").toLowerCase();
        return v.includes(search.toLowerCase());
      });
    }
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, searchKey, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === "asc" ? "desc" : "asc"); }
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleRow = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      const selected = filtered.filter(r => next.has(String(r[rowIdKey])));
      onRowSelect?.(selected);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === pageData.length) {
      setSelectedIds(new Set());
      onRowSelect?.([]);
    } else {
      const ids = new Set(pageData.map(r => String(r[rowIdKey])));
      setSelectedIds(ids);
      onRowSelect?.(filtered.filter(r => ids.has(String(r[rowIdKey]))));
    }
  };

  const selectedItems = filtered.filter(r => selectedIds.has(String(r[rowIdKey])));
  const allPageSelected = pageData.length > 0 && pageData.every(r => selectedIds.has(String(r[rowIdKey])));

  const handleBulkAction = (action: { label: string; icon?: React.ReactNode; onClick: (selected: T[]) => void; variant?: "default" | "destructive" | "outline" }) => {
    action.onClick(selectedItems);
  };

  return (
    <div className="space-y-3">
      {/* Header: Search + Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); setSelectedIds(new Set()); }}
              className="pl-8 h-8 text-xs bg-white border-slate-200"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200">
            <Filter className="w-3.5 h-3.5 mr-1.5" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
          {extraControls}
        </div>
        {title && (
          <div className="text-right shrink-0">
            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-slate-500 border-slate-200">
              {totalLabel || `${filtered.length} records`}
            </Badge>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                {onRowSelect && (
                  <th className="w-10 py-2 px-2 border-b-2 border-slate-200 bg-slate-50/80">
                    <Checkbox
                      checked={allPageSelected}
                      onCheckedChange={toggleAll}
                      className="border-slate-300"
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    className={col.className}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <button
                      onClick={() => col.sortable && toggleSort(String(col.key))}
                      className={`flex items-center gap-1.5 ${col.sortable ? "hover:text-[#100841]" : ""}`}
                    >
                      {col.header}
                      {col.sortable && sortKey === String(col.key) && (
                        <ArrowUpDown className={`w-3 h-3 ${sortDir === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-slate-400 text-xs">
                    No records match your search criteria.
                  </td>
                </tr>
              ) : (
                pageData.map(row => {
                  const id = String(row[rowIdKey]);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      className={`${isSelected ? "bg-blue-50/60" : ""} ${onRowClick ? "cursor-pointer" : ""}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {onRowSelect && (
                        <td className="py-2 px-2" onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(id)}
                            className="border-slate-300"
                          />
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={String(col.key)} className={col.className}>
                          {col.render
                            ? col.render(row[col.key as keyof T], row)
                            : <span className="text-slate-700">{row[col.key as keyof T] ?? "—"}</span>
                          }
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Summary + Pagination */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <span className="text-[10px] font-medium text-[#100841]">
                <CheckSquare className="w-3 h-3 inline mr-1" />
                {selectedItems.length} selected
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6 p-0" disabled={page <= 1} onClick={() => setPage(1)}>
              <ChevronsLeft className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <span className="text-[10px] font-mono text-slate-500 px-1">
              {page} / {totalPages}
            </span>
            <Button variant="ghost" size="icon" className="w-6 h-6 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6 p-0" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              <ChevronsRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && bulkActions && (
        <div className="bulk-action-bar animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected</span>
            {bulkActions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant || "default"}
                className="h-7 text-xs"
                onClick={() => handleBulkAction(action)}
              >
                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10" onClick={() => { setSelectedIds(new Set()); onRowSelect?.([]); }}>
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
}
