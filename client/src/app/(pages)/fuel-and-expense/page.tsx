"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { cn } from "@/components/utils";

interface FuelLog {
  id: string;
  vehicle: string;
  date: string;
  litres: number;
  cost: number;
  station: string;
  odometer: number;
  region: string;
}

const INITIAL_LOGS: FuelLog[] = [
  {
    id: "FL-1201",
    vehicle: "KBC 014K",
    date: "2025-07-11",
    litres: 280,
    cost: 42000,
    station: "Total Thika Rd",
    odometer: 152100,
    region: "Nairobi",
  },
  {
    id: "FL-1200",
    vehicle: "KDB 552Y",
    date: "2025-07-10",
    litres: 420,
    cost: 63000,
    station: "Kenol Eldoret",
    odometer: 213100,
    region: "Eldoret",
  },
  {
    id: "FL-1199",
    vehicle: "KAA 201Z",
    date: "2025-07-09",
    litres: 210,
    cost: 31500,
    station: "Total Mombasa Rd",
    odometer: 98200,
    region: "Nairobi",
  },
  {
    id: "FL-1198",
    vehicle: "KLA 002B",
    date: "2025-07-08",
    litres: 160,
    cost: 24000,
    station: "Shell Westlands",
    odometer: 61900,
    region: "Nairobi",
  },
  {
    id: "FL-1197",
    vehicle: "KJA 445R",
    date: "2025-07-07",
    litres: 580,
    cost: 87000,
    station: "Rubis Mombasa",
    odometer: 411700,
    region: "Mombasa",
  },
  {
    id: "FL-1196",
    vehicle: "KHA 112P",
    date: "2025-07-06",
    litres: 190,
    cost: 28500,
    station: "Total Nakuru",
    odometer: 77600,
    region: "Nakuru",
  },
];

const TABS = ["Fuel", "Expenses", "Cost", "Efficiency"];

export default function FuelAndExpensePage() {
  const [logs] = useState<FuelLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState("Fuel");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Unique filters lists
  const vehicleOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.vehicle)));
    return [{ key: "", value: "All Vehicles" }, ...unique.map((v) => ({ key: v, value: v }))];
  }, [logs]);

  const regionOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.region)));
    return [{ key: "", value: "All Regions" }, ...unique.map((r) => ({ key: r, value: r }))];
  }, [logs]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesVehicle = vehicleFilter === "" || l.vehicle === vehicleFilter;
      const matchesRegion = regionFilter === "" || l.region === regionFilter;
      return matchesVehicle && matchesRegion;
    });
  }, [logs, vehicleFilter, regionFilter]);

  // Sorting + Pagination
  const sortedAndPaginatedLogs = useMemo(() => {
    let result = [...filteredLogs];

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a, b) => {
        let valA = a[id as keyof FuelLog];
        let valB = b[id as keyof FuelLog];

        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        } else {
          return desc
            ? (valB as number) - (valA as number)
            : (valA as number) - (valB as number);
        }
      });
    }

    const start = pagination.pageIndex * pagination.pageSize;
    return result.slice(start, start + pagination.pageSize);
  }, [filteredLogs, sorting, pagination]);

  const pageCount = Math.ceil(filteredLogs.length / pagination.pageSize);

  const columns = useMemo<ColumnDef<FuelLog>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Log ID",
        cell: ({ row }) => (
          <span className="font-mono text-primary font-bold tracking-wider cursor-pointer hover:underline">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "vehicle",
        header: "Vehicle",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.vehicle}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">{row.original.date}</span>
        ),
      },
      {
        accessorKey: "litres",
        header: "Litres",
        cell: ({ row }) => (
          <span className="text-secondary-foreground font-mono font-medium">
            {row.original.litres} L
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
        accessorKey: "station",
        header: "Station",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">
            {row.original.station}
          </span>
        ),
      },
      {
        accessorKey: "odometer",
        header: "Odometer",
        cell: ({ row }) => (
          <span className="text-secondary-foreground font-mono">
            {row.original.odometer.toLocaleString()} km
          </span>
        ),
      },
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">
            {row.original.region}
          </span>
        ),
      },
    ];
  }, []);

  const handleExportCSV = () => {
    const headers = "Log ID,Vehicle,Date,Litres,Cost (KES),Station,Odometer,Region\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `${l.id},${l.vehicle},${l.date},${l.litres},${l.cost},${l.station},${l.odometer},${l.region}`
      )
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuel-logs-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Fuel Cost"
          value="KES 276,000"
          subtitle="This month"
          color="text-primary"
        />
        <StatsCard
          title="Maintenance Cost"
          value="KES 177,000"
          subtitle="This month"
          color="text-blue-400"
        />
        <StatsCard
          title="Other Expenses"
          value="KES 148,000"
          subtitle="This month"
          color="text-purple-400"
        />
        <StatsCard
          title="Avg Cost Per KM"
          value="KES 152"
          subtitle="Fleet average"
          color="text-emerald-400"
        />
      </div>

      {/* Tabs and filters toolbar */}
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

        <div className="flex flex-wrap items-center gap-3">
          <Select
            placeholder="All Vehicles"
            value={vehicleFilter}
            options={vehicleOptions}
            onChange={(val) => {
              setVehicleFilter(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-[140px]"
          />

          <Select
            placeholder="All Regions"
            value={regionFilter}
            options={regionOptions}
            onChange={(val) => {
              setRegionFilter(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-[140px]"
          />

          <Button
            variant="outline"
            className="flex items-center gap-2 border-border hover:bg-secondary h-10 px-4"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Main logs table */}
      <DataTable
        columns={columns}
        data={sortedAndPaginatedLogs}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground text-sm">No fuel logs found.</p>
          </div>
        }
      />
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-2">
      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
        {title}
      </p>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", color)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground/60">{subtitle}</p>
    </div>
  );
}
