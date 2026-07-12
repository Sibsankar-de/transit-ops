"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { FleetStatus } from "@/enums/fleetStatus.enum";
import { DataTable } from "@/components/ui/DataTable";
import { FleetStatusBadge } from "@/components/ui/FleetStatusBadge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/SearchInput";
import { AddVehicleModal } from "@/components/vehicles/AddVehicleModal";
import { EditVehicleModal } from "@/components/vehicles/EditVehicleModal";
import { VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { Eye, Pencil, Plus } from "lucide-react";
import { cn } from "@/components/utils";

interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  type: string;
  capacity: number;
  odometer: number;
  acqCost: number;
  status: FleetStatus;
}

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    registration: "KAA 201Z",
    make: "Isuzu",
    model: "FTR",
    type: "Truck",
    capacity: 8000,
    odometer: 98420,
    acqCost: 4500000,
    status: FleetStatus.AVAILABLE,
  },
  {
    id: "v2",
    registration: "KBC 014K",
    make: "Mitsubishi",
    model: "Fuso FJ",
    type: "Truck",
    capacity: 12000,
    odometer: 152300,
    acqCost: 6200000,
    status: FleetStatus.ON_TRIP,
  },
  {
    id: "v3",
    registration: "KDB 552Y",
    make: "Mercedes",
    model: "Actros",
    type: "Truck",
    capacity: 18000,
    odometer: 213440,
    acqCost: 9800000,
    status: FleetStatus.ON_TRIP,
  },
  {
    id: "v4",
    registration: "KEB 103W",
    make: "MAN",
    model: "TGS 26.440",
    type: "Truck",
    capacity: 20000,
    odometer: 87600,
    acqCost: 11200000,
    status: FleetStatus.IN_SHOP,
  },
  {
    id: "v5",
    registration: "KFA 291C",
    make: "Toyota",
    model: "Hiace",
    type: "Van",
    capacity: 1500,
    odometer: 44200,
    acqCost: 1800000,
    status: FleetStatus.AVAILABLE,
  },
  {
    id: "v6",
    registration: "KGA 387H",
    make: "Scania",
    model: "R560",
    type: "Truck",
    capacity: 22000,
    odometer: 334100,
    acqCost: 13500000,
    status: FleetStatus.RETIRED,
  },
  {
    id: "v7",
    registration: "KHA 112P",
    make: "Hino",
    model: "500 FC",
    type: "Truck",
    capacity: 7000,
    odometer: 77800,
    acqCost: 3900000,
    status: FleetStatus.AVAILABLE,
  },
  {
    id: "v8",
    registration: "KJA 445R",
    make: "Volvo",
    model: "FH16",
    type: "Tanker",
    capacity: 30000,
    odometer: 412000,
    acqCost: 18000000,
    status: FleetStatus.IN_SHOP,
  },
  {
    id: "v9",
    registration: "KKA 771X",
    make: "DAF",
    model: "XF 440",
    type: "Truck",
    capacity: 16000,
    odometer: 189000,
    acqCost: 8700000,
    status: FleetStatus.AVAILABLE,
  },
  {
    id: "v10",
    registration: "KLA 002B",
    make: "Isuzu",
    model: "NQR",
    type: "Truck",
    capacity: 5000,
    odometer: 62100,
    acqCost: 2900000,
    status: FleetStatus.ON_TRIP,
  },
];

const VEHICLE_TYPES = ["Truck", "Van", "Tanker"];

export default function VehicleRegistryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedStatusSummary, setSelectedStatusSummary] = useState<
    string | null
  >(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Status Summary Counts
  const counts = useMemo(() => {
    return {
      [FleetStatus.AVAILABLE]: vehicles.filter(
        (v) => v.status === FleetStatus.AVAILABLE,
      ).length,
      [FleetStatus.ON_TRIP]: vehicles.filter(
        (v) => v.status === FleetStatus.ON_TRIP,
      ).length,
      [FleetStatus.IN_SHOP]: vehicles.filter(
        (v) => v.status === FleetStatus.IN_SHOP,
      ).length,
      [FleetStatus.RETIRED]: vehicles.filter(
        (v) => v.status === FleetStatus.RETIRED,
      ).length,
    };
  }, [vehicles]);

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        search === "" ||
        v.registration.toLowerCase().includes(search.toLowerCase()) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase());

      const matchesStatusDropdown =
        statusFilter === "" || v.status === statusFilter;
      const matchesStatusSummary =
        selectedStatusSummary === null || v.status === selectedStatusSummary;
      const matchesType = typeFilter === "" || v.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatusDropdown &&
        matchesStatusSummary &&
        matchesType
      );
    });
  }, [vehicles, search, statusFilter, selectedStatusSummary, typeFilter]);

  // Sorting and Pagination Logic
  const sortedAndPaginatedVehicles = useMemo(() => {
    let result = [...filteredVehicles];

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a, b) => {
        let valA = a[id as keyof Vehicle];
        let valB = b[id as keyof Vehicle];

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
  }, [filteredVehicles, sorting, pagination]);

  const pageCount = Math.ceil(filteredVehicles.length / pagination.pageSize);

  const columns = useMemo<ColumnDef<Vehicle>[]>(() => {
    return [
      {
        accessorKey: "registration",
        header: "Registration",
        cell: ({ row }) => (
          <span className="font-mono text-primary font-bold tracking-wider">
            {row.original.registration}
          </span>
        ),
      },
      {
        id: "vehicle",
        header: "Vehicle",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.make} {row.original.model}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-secondary-foreground">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
          <span className="text-secondary-foreground font-mono">
            {row.original.capacity.toLocaleString()} kg
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
        accessorKey: "acqCost",
        header: "Acq. Cost",
        cell: ({ row }) => {
          const costInMillions = row.original.acqCost / 1000000;
          return (
            <span className="text-secondary-foreground font-mono">
              KES {costInMillions.toFixed(1)}M
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <FleetStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          className: "text-right",
        },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="p-1.5! h-10 w-10 flex items-center justify-center border-border hover:bg-secondary"
              onClick={() => {
                setSelectedVehicle(row.original);
                setEditModalOpen(true);
              }}
              aria-label="Edit Vehicle"
            >
              <Pencil size={15} />
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  const handleAddVehicle = (data: VehicleFormValues) => {
    const newVehicle: Vehicle = {
      id: `v${Date.now()}`,
      registration: data.registration,
      make: data.make,
      model: data.model,
      type: data.type,
      capacity: data.capacity,
      odometer: data.odometer,
      acqCost: data.acqCost,
      status: data.status,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    setAddModalOpen(false);
  };

  const handleEditVehicle = (data: VehicleFormValues) => {
    if (!selectedVehicle) return;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === selectedVehicle.id
          ? {
              ...v,
              registration: data.registration,
              make: data.make,
              model: data.model,
              type: data.type,
              capacity: data.capacity,
              odometer: data.odometer,
              acqCost: data.acqCost,
              status: data.status,
            }
          : v,
      ),
    );
    setEditModalOpen(false);
    setSelectedVehicle(null);
  };

  const handlePillClick = (status: FleetStatus) => {
    if (selectedStatusSummary === status) {
      setSelectedStatusSummary(null);
    } else {
      setSelectedStatusSummary(status);
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative flex items-center">
          <Input
            placeholder="Search by reg, make, model..."
            value={search}
            onChange={(e: any) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            icon={<SearchIcon />}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            placeholder="All Status"
            value={statusFilter}
            options={[
              { key: "", value: "All Status" },
              ...Object.values(FleetStatus).map((status) => ({
                key: status,
                value: status.toLowerCase().replace(/_/g, " "),
              })),
            ]}
            onChange={(val) => {
              setStatusFilter(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-37.5"
          />

          <Select
            placeholder="All Types"
            value={typeFilter}
            options={[
              { key: "", value: "All Types" },
              ...VEHICLE_TYPES.map((type) => ({ key: type, value: type })),
            ]}
            onChange={(val) => {
              setTypeFilter(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="w-35"
          />

          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 h-10 px-4"
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handlePillClick(FleetStatus.AVAILABLE)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer",
            selectedStatusSummary === FleetStatus.AVAILABLE
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
              : "bg-card border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-emerald-400 font-bold">
            {counts[FleetStatus.AVAILABLE]}
          </span>
          <span>Available</span>
        </button>

        <button
          onClick={() => handlePillClick(FleetStatus.ON_TRIP)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer",
            selectedStatusSummary === FleetStatus.ON_TRIP
              ? "bg-blue-500/20 border-blue-500 text-blue-400"
              : "bg-card border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-blue-400 font-bold">
            {counts[FleetStatus.ON_TRIP]}
          </span>
          <span>On Trip</span>
        </button>

        <button
          onClick={() => handlePillClick(FleetStatus.IN_SHOP)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer",
            selectedStatusSummary === FleetStatus.IN_SHOP
              ? "bg-amber-500/20 border-amber-500 text-amber-400"
              : "bg-card border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-amber-400 font-bold">
            {counts[FleetStatus.IN_SHOP]}
          </span>
          <span>In Shop</span>
        </button>

        <button
          onClick={() => handlePillClick(FleetStatus.RETIRED)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer",
            selectedStatusSummary === FleetStatus.RETIRED
              ? "bg-secondary border-muted-foreground text-foreground"
              : "bg-card border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-muted-foreground font-bold">
            {counts[FleetStatus.RETIRED]}
          </span>
          <span>Retired</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={sortedAndPaginatedVehicles}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground text-sm">
              No vehicles found matching filters.
            </p>
          </div>
        }
      />

      {/* Modals */}
      <AddVehicleModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddVehicle}
      />

      <EditVehicleModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onSave={handleEditVehicle}
      />
    </div>
  );
}
