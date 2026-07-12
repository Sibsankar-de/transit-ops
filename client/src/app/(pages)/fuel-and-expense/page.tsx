"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { FuelLog, Expense, ExpenseType } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { cn } from "@/components/utils";
import {
  useListFuelLogsQuery,
  useCreateFuelLogMutation,
  useDeleteFuelLogMutation,
} from "@/store/slices/fuelLogsApiSlice";
import {
  useListExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/store/slices/expensesApiSlice";

const TABS = ["Fuel Logs", "Expenses"];

const DEFAULT_PAGE_SIZE = 10;

export default function FuelAndExpensePage() {
  const [activeTab, setActiveTab] = useState("Fuel Logs");
  const [vehicleFilter, setVehicleFilter] = useState("");

  // Separate pagination state per tab
  const [fuelPagination, setFuelPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [expensePagination, setExpensePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // RTK Query — Fuel Logs
  const {
    data: fuelResponse,
    isLoading: isFuelLoading,
    isFetching: isFuelFetching,
  } = useListFuelLogsQuery({
    page: fuelPagination.pageIndex + 1,
    limit: fuelPagination.pageSize,
    ...(vehicleFilter && { vehicleId: vehicleFilter }),
  });

  // RTK Query — Expenses
  const {
    data: expenseResponse,
    isLoading: isExpenseLoading,
    isFetching: isExpenseFetching,
  } = useListExpensesQuery({
    page: expensePagination.pageIndex + 1,
    limit: expensePagination.pageSize,
    ...(vehicleFilter && { vehicleId: vehicleFilter }),
  });

  const [deleteFuelLog] = useDeleteFuelLogMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const fuelLogs = fuelResponse?.data?.docs ?? [];
  const fuelPageCount = fuelResponse?.data?.totalPages ?? 0;
  const fuelTotalDocs = fuelResponse?.data?.totalDocs ?? 0;

  const expenses = expenseResponse?.data?.docs ?? [];
  const expensePageCount = expenseResponse?.data?.totalPages ?? 0;
  const expenseTotalDocs = expenseResponse?.data?.totalDocs ?? 0;

  // Aggregate stats from current pages (server would provide summary endpoints)
  const totalFuelCost = useMemo(
    () => fuelLogs.reduce((sum, l) => sum + l.cost, 0),
    [fuelLogs]
  );
  const totalExpenseAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const totalFuelLiters = useMemo(
    () => fuelLogs.reduce((sum, l) => sum + l.liters, 0),
    [fuelLogs]
  );

  // Fuel Log columns
  const fuelColumns = useMemo<ColumnDef<FuelLog>[]>(() => [
    {
      accessorKey: "id",
      header: "Log ID",
      cell: ({ row }) => (
        <span className="font-mono text-primary font-bold tracking-wider text-xs">
          {row.original.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm">
          {row.original.vehicle?.registrationNumber ?? row.original.vehicleId}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-secondary-foreground">
          {new Date(row.original.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "liters",
      header: "Litres",
      cell: ({ row }) => (
        <span className="text-secondary-foreground font-mono font-medium">
          {row.original.liters} L
        </span>
      ),
    },
    {
      accessorKey: "cost",
      header: "Cost (KES)",
      cell: ({ row }) => (
        <span className="text-secondary-foreground font-mono font-medium">
          {row.original.cost.toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={async () => {
            if (confirm("Delete this fuel log?")) {
              try { await deleteFuelLog(row.original.id).unwrap(); }
              catch (err: any) { alert(err?.data?.message ?? "Failed to delete fuel log."); }
            }
          }}
          className="text-xs text-red-400 hover:underline cursor-pointer"
        >
          Delete
        </button>
      ),
    },
  ], [deleteFuelLog]);

  // Expense columns
  const expenseColumns = useMemo<ColumnDef<Expense>[]>(() => [
    {
      accessorKey: "id",
      header: "Expense ID",
      cell: ({ row }) => (
        <span className="font-mono text-primary font-bold tracking-wider text-xs">
          {row.original.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm">
          {row.original.vehicle?.registrationNumber ?? row.original.vehicleId}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const typeStyles: Record<ExpenseType, string> = {
          [ExpenseType.FUEL]: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
          [ExpenseType.MAINTENANCE]: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
          [ExpenseType.TOLL]: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
          [ExpenseType.INSURANCE]: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
          [ExpenseType.PERMIT]: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
          [ExpenseType.OTHER]: "bg-secondary text-secondary-foreground border border-border",
        };
        return (
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize",
            typeStyles[row.original.type] ?? typeStyles[ExpenseType.OTHER]
          )}>
            {row.original.type}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-secondary-foreground">
          {new Date(row.original.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount (KES)",
      cell: ({ row }) => (
        <span className="text-secondary-foreground font-mono font-medium">
          {row.original.amount.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-secondary-foreground truncate max-w-[160px] block">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={async () => {
            if (confirm("Delete this expense?")) {
              try { await deleteExpense(row.original.id).unwrap(); }
              catch (err: any) { alert(err?.data?.message ?? "Failed to delete expense."); }
            }
          }}
          className="text-xs text-red-400 hover:underline cursor-pointer"
        >
          Delete
        </button>
      ),
    },
  ], [deleteExpense]);

  const isLoading = isFuelLoading || isExpenseLoading;
  const isFetching = isFuelFetching || isExpenseFetching;

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Fuel Cost"
          value={`KES ${totalFuelCost.toLocaleString()}`}
          subtitle={`${fuelTotalDocs} fuel entries`}
          color="text-primary"
        />
        <StatsCard
          title="Total Expenses"
          value={`KES ${totalExpenseAmount.toLocaleString()}`}
          subtitle={`${expenseTotalDocs} expense entries`}
          color="text-blue-400"
        />
        <StatsCard
          title="Total Fuel Volume"
          value={`${totalFuelLiters.toLocaleString()} L`}
          subtitle="Current page aggregate"
          color="text-purple-400"
        />
        <StatsCard
          title="Avg Cost / Litre"
          value={
            totalFuelLiters > 0
              ? `KES ${(totalFuelCost / totalFuelLiters).toFixed(2)}`
              : "—"
          }
          subtitle="Fleet average"
          color="text-emerald-400"
        />
      </div>

      {/* Tabs toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-border/40 pt-4">
        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/50 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === "Fuel Logs" ? (
        <DataTable
          columns={fuelColumns}
          data={fuelLogs}
          pageCount={fuelPageCount}
          pagination={fuelPagination}
          onPaginationChange={setFuelPagination}
          emptyState={
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground text-sm">No fuel logs found.</p>
            </div>
          }
        />
      ) : (
        <DataTable
          columns={expenseColumns}
          data={expenses}
          pageCount={expensePageCount}
          pagination={expensePagination}
          onPaginationChange={setExpensePagination}
          emptyState={
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground text-sm">No expenses found.</p>
            </div>
          }
        />
      )}

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2 shadow-lg">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          Refreshing...
        </div>
      )}
    </div>
  );
}

function StatsCard({
  title, value, subtitle, color,
}: {
  title: string; value: string; subtitle: string; color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-2">
      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{title}</p>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", color)}>{value}</p>
      <p className="text-xs text-muted-foreground/60">{subtitle}</p>
    </div>
  );
}
