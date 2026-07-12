"use client";

import React, { useState, useMemo } from "react";
import { TripStatus } from "@/enums/tripStatus.enum";
import { Trip } from "@/types/api";
import { CreateTripModal } from "@/components/trips/CreateTripModal";
import { TripFormValues } from "@/components/trips/TripForm";
import { Button } from "@/components/ui/Button";
import { Plus, Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/components/utils";
import {
  useListTripsQuery,
  useCreateTripMutation,
  useDispatchTripMutation,
  useCompleteTripMutation,
  useCancelTripMutation,
} from "@/store/slices/tripsApiSlice";
import { useGetDriversQuery } from "@/store/slices/driversApiSlice";
import { useGetVehiclesQuery } from "@/store/slices/vehiclesApiSlice";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchIcon } from "@/components/ui/SearchInput";
import { useToast } from "@/components/ui/Toast";

const TABS = ["All", "Draft", "Dispatched", "Completed", "Cancelled"];

const STATUS_BADGES: Record<string, string> = {
  [TripStatus.DRAFT]: "bg-secondary text-secondary-foreground border border-border",
  [TripStatus.DISPATCHED]: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  [TripStatus.COMPLETED]: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  [TripStatus.CANCELLED]: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "plannedDistance">("createdAt");
  const { error } = useToast();

  // RTK Query
  const statusFilter = activeTab === "All" ? undefined : activeTab.toUpperCase() as TripStatus;
  const { data: response, isLoading, isFetching } = useListTripsQuery({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter }),
    search: search || undefined,
    sortBy,
    sortOrder: "desc",
  });

  const { data: vehiclesResp } = useGetVehiclesQuery({ page: 1, limit: 1000 });
  const { data: driversResp } = useGetDriversQuery({ page: 1, limit: 100 });

  const [createTrip] = useCreateTripMutation();
  const [dispatchTrip] = useDispatchTripMutation();
  const [completeTrip] = useCompleteTripMutation();
  const [cancelTrip] = useCancelTripMutation();

  const trips = response?.data?.docs ?? [];
  const totalPages = response?.data?.totalPages ?? 1;

  const vehicles = useMemo(() =>
    (vehiclesResp?.data?.docs ?? []).map((v: any) => ({
      id: v.id,
      registration: v.registrationNumber,
      make: v.type,   // using vehicle type as make
      model: v.name,  // using vehicle name as model
    })),
    [vehiclesResp]
  );

  const drivers = useMemo(() =>
    (driversResp?.data?.docs ?? []).map((d) => ({
      id: d.id,
      name: d.user?.name ?? d.userId,
    })),
    [driversResp]
  );

  const handleCreateTrip = async (data: TripFormValues) => {
    try {
      await createTrip({
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        origin: data.source,
        destination: data.destination,
        // scheduledDeparture & initialOdometer not in current TripForm — using defaults
        scheduledDeparture: new Date().toISOString(),
        initialOdometer: 0,
      }).unwrap();
      setModalOpen(false);
    } catch (err: any) {
      error(err?.data?.message ?? "Failed to create trip.");
    }
  };

  const handleDispatch = async (tripId: string) => {
    try { await dispatchTrip(tripId).unwrap(); }
    catch (err: any) { error(err?.data?.message ?? "Failed to dispatch trip."); }
  };

  const handleComplete = async (trip: Trip) => {
    const finalOdometer = Number(prompt("Enter final odometer reading (km):", String(trip.initialOdometer + 100)));
    const fuelConsumed = Number(prompt("Enter fuel consumed (liters):"));
    if (!finalOdometer || !fuelConsumed) return;
    try {
      await completeTrip({ id: trip.id, data: { finalOdometer, fuelConsumed } }).unwrap();
    } catch (err: any) {
      error(err?.data?.message ?? "Failed to complete trip.");
    }
  };

  const handleCancel = async (tripId: string) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try { await cancelTrip(tripId).unwrap(); }
    catch (err: any) { error(err?.data?.message ?? "Failed to cancel trip."); }
  };

  const getProgressStep = (status: string) => {
    if (status === TripStatus.COMPLETED) return 3;
    if (status === TripStatus.DISPATCHED) return 2;
    return 1;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-foreground">Live Operations Board</h2>
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 h-9 px-3 text-xs"
          >
            <Plus size={14} />
            <span>Create Trip</span>
          </Button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/50 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
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

      {/* Search & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 max-w-md relative flex items-center">
          <Input
            placeholder="Search trips by origin, destination..."
            value={search}
            onChange={(e: any) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<SearchIcon />}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            placeholder="Sort By"
            value={sortBy}
            options={[
              { key: "createdAt", value: "Date Created" },
              { key: "plannedDistance", value: "Planned Distance" },
            ]}
            onChange={(val: any) => {
              setSortBy(val);
              setPage(1);
            }}
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Grid List of Trips */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {trips.map((trip) => {
          const isDraft = trip.status === TripStatus.DRAFT;
          const isDispatched = trip.status === TripStatus.DISPATCHED;
          const isCompleted = trip.status === TripStatus.COMPLETED;
          const isCancelled = trip.status === TripStatus.CANCELLED;

          const vehicleName = trip.vehicle
            ? `${trip.vehicle.registrationNumber} – ${trip.vehicle.name}`
            : trip.vehicleId;
          const driverName = trip.driver?.user?.name ?? trip.driverId;

          return (
            <div
              key={trip.id}
              className={cn(
                "rounded-xl border bg-card p-5 flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all",
                isDispatched ? "border-blue-500/30 shadow-blue-500/5" : "border-border",
                isCompleted && "border-emerald-500/20"
              )}
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                isDraft && "bg-muted-foreground",
                isDispatched && "bg-blue-500",
                isCompleted && "bg-emerald-500",
                isCancelled && "bg-red-500"
              )} />

              {/* Header */}
              <div className="flex items-center justify-between pb-4">
                <span className="font-mono text-primary font-bold text-sm tracking-wider">
                  {trip.id.slice(0, 8).toUpperCase()}
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  STATUS_BADGES[trip.status]
                )}>
                  {trip.status}
                </span>
              </div>

              {/* Route */}
              <div className="pb-4">
                <p className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>{trip.origin}</span>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                  <span>{trip.destination}</span>
                </p>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-border/40 pt-4 pb-4">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Vehicle</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5 truncate">{vehicleName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Driver</p>
                  <p className="font-semibold text-foreground mt-0.5 truncate">{driverName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Departure</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5 text-xs">
                    {new Date(trip.scheduledDeparture).toLocaleDateString()}
                  </p>
                </div>
                {trip.distanceCovered != null && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Distance</p>
                    <p className="font-semibold text-foreground font-mono mt-0.5">{trip.distanceCovered} km</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border/40 mt-auto flex flex-col justify-end min-h-[48px]">
                {isCancelled ? (
                  <div className="flex items-center gap-1.5 text-red-400/90 text-xs font-semibold">
                    <X size={14} />
                    <span>Trip was Cancelled</span>
                  </div>
                ) : isCompleted ? (
                  <Timeline progress={3} />
                ) : isDispatched ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => handleComplete(trip)}
                      className="flex items-center justify-center gap-1.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleCancel(trip.id)}
                      className="flex items-center justify-center gap-1.5 border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDispatch(trip.id)}
                    className="flex items-center justify-center gap-2 border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer w-full"
                  >
                    <span>Dispatch Now</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {trips.length === 0 && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border">
            <p className="text-muted-foreground text-sm">No trips found.</p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2 shadow-lg">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          Refreshing...
        </div>
      )}

      <CreateTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTrip}
        vehicles={vehicles}
        drivers={drivers}
      />
    </div>
  );
}

function Timeline({ progress }: { progress: number }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-bold select-none text-muted-foreground">
      {[{ label: "Pending", step: 1 }, { label: "Dispatched", step: 2 }, { label: "Completed", step: 3 }].map(
        ({ label, step }, idx) => (
          <React.Fragment key={label}>
            {idx > 0 && (
              <div className={cn("flex-1 h-[2px] mx-2", progress >= step ? "bg-primary" : "bg-border")} />
            )}
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                progress >= step
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border"
              )}>
                {progress >= step && <Check size={8} strokeWidth={3} />}
              </div>
              <span className={cn(progress >= step && "text-primary")}>{label}</span>
            </div>
          </React.Fragment>
        )
      )}
    </div>
  );
}
