"use client";

import React, { useState, useMemo } from "react";
import { TripStatus } from "@/enums/tripStatus.enum";
import { CreateTripModal } from "@/components/trips/CreateTripModal";
import { TripFormValues } from "@/components/trips/TripForm";
import { Button } from "@/components/ui/Button";
import { Plus, Check, X, ArrowRight, Eye } from "lucide-react";
import { cn } from "@/components/utils";

interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle: string;
  driver: string;
  distance: number;
  eta: string;
  status: TripStatus;
}

const VEHICLES = [
  { id: "v1", registration: "KAA 201Z", make: "Isuzu", model: "FTR" },
  { id: "v2", registration: "KBC 014K", make: "Mitsubishi", model: "Fuso FJ" },
  { id: "v3", registration: "KDB 552Y", make: "Mercedes", model: "Actros" },
  { id: "v4", registration: "KEB 103W", make: "MAN", model: "TGS 26.440" },
  { id: "v5", registration: "KFA 291C", make: "Toyota", model: "Hiace" },
  { id: "v6", registration: "KHA 112P", make: "Hino", model: "500 FC" },
];

const DRIVERS = [
  { id: "d1", name: "Felix Mutua" },
  { id: "d2", name: "Grace Wanjiku" },
  { id: "d3", name: "Samuel Kiprop" },
  { id: "d4", name: "Amina Hassan" },
  { id: "d5", name: "Peter Njoroge" },
  { id: "d6", name: "Joyce Otieno" },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: "TRP-2248",
    source: "Nairobi CBD",
    destination: "Mombasa Port",
    vehicle: "KAA 201Z",
    driver: "Felix Mutua",
    distance: 492,
    eta: "-",
    status: TripStatus.COMPLETED,
  },
  {
    id: "TRP-2249",
    source: "Kisumu Depot",
    destination: "Nakuru Hub",
    vehicle: "KBC 014K",
    driver: "Grace Wanjiku",
    distance: 172,
    eta: "2h 14m",
    status: TripStatus.DISPATCHED,
  },
  {
    id: "TRP-2250",
    source: "Eldoret",
    destination: "Nairobi ICD",
    vehicle: "KDB 552Y",
    driver: "Samuel Kiprop",
    distance: 312,
    eta: "3h 40m",
    status: TripStatus.DISPATCHED,
  },
  {
    id: "TRP-2251",
    source: "Nairobi ICD",
    destination: "Kampala",
    vehicle: "KEB 103W",
    driver: "Amina Hassan",
    distance: 680,
    eta: "-",
    status: TripStatus.DRAFT,
  },
  {
    id: "TRP-2252",
    source: "Thika Depot",
    destination: "Naivasha",
    vehicle: "KFA 291C",
    driver: "Peter Njoroge",
    distance: 89,
    eta: "-",
    status: TripStatus.CANCELLED,
  },
  {
    id: "TRP-2245",
    source: "Mombasa Port",
    destination: "Nairobi ICD",
    vehicle: "KHA 112P",
    driver: "Joyce Otieno",
    distance: 492,
    eta: "-",
    status: TripStatus.COMPLETED,
  },
];

const TABS = ["All", "Dispatched", "Draft", "Completed", "Cancelled"];

const STATUS_BADGES: Record<TripStatus, string> = {
  [TripStatus.DRAFT]: "bg-secondary text-secondary-foreground border border-border",
  [TripStatus.DISPATCHED]: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  [TripStatus.COMPLETED]: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  [TripStatus.CANCELLED]: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [activeTab, setActiveTab] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  // Filtering
  const filteredTrips = useMemo(() => {
    if (activeTab === "All") return trips;
    const mappedStatus = activeTab.toUpperCase() as TripStatus;
    return trips.filter((t) => t.status === mappedStatus);
  }, [trips, activeTab]);

  const handleCreateTrip = (data: TripFormValues) => {
    const selectedVeh = VEHICLES.find((v) => v.id === data.vehicleId);
    const selectedDrv = DRIVERS.find((d) => d.id === data.driverId);

    const newTrip: Trip = {
      id: `TRP-${2250 + trips.length + 3}`,
      source: data.source,
      destination: data.destination,
      vehicle: selectedVeh ? selectedVeh.registration : "Unknown",
      driver: selectedDrv ? selectedDrv.name : "Unknown",
      distance: data.plannedDistance,
      eta: "-",
      status: TripStatus.DRAFT,
    };

    setTrips((prev) => [newTrip, ...prev]);
    setModalOpen(false);
  };

  const handleStatusChange = (id: string, nextStatus: TripStatus) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // If dispatching, calculate simulated ETA
          let eta = "-";
          if (nextStatus === TripStatus.DISPATCHED) {
            const hours = Math.floor(t.distance / 65);
            const mins = Math.round(((t.distance / 65) % 1) * 60);
            eta = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          }
          return { ...t, status: nextStatus, eta };
        }
        return t;
      })
    );
  };

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
              onClick={() => setActiveTab(tab)}
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

      {/* Grid List of Trips */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => {
          const isDraft = trip.status === TripStatus.DRAFT;
          const isDispatched = trip.status === TripStatus.DISPATCHED;
          const isCompleted = trip.status === TripStatus.COMPLETED;
          const isCancelled = trip.status === TripStatus.CANCELLED;

          return (
            <div
              key={trip.id}
              className={cn(
                "rounded-xl border bg-card p-5 flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all",
                isDispatched ? "border-blue-500/30 shadow-blue-500/5" : "border-border",
                isCompleted && "border-emerald-500/20"
              )}
            >
              {/* Left indicator accent color */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  isDraft && "bg-muted-foreground",
                  isDispatched && "bg-blue-500",
                  isCompleted && "bg-emerald-500",
                  isCancelled && "bg-red-500"
                )}
              />

              {/* Header: ID + Status */}
              <div className="flex items-center justify-between pb-4">
                <span className="font-mono text-primary font-bold text-sm tracking-wider">
                  {trip.id}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    STATUS_BADGES[trip.status]
                  )}
                >
                  {trip.status}
                </span>
              </div>

              {/* Route */}
              <div className="pb-4">
                <p className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>{trip.source}</span>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                  <span>{trip.destination}</span>
                </p>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-border/40 pt-4 pb-4">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Vehicle
                  </p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">
                    {trip.vehicle}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Driver
                  </p>
                  <p className="font-semibold text-foreground mt-0.5 truncate">
                    {trip.driver}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Distance
                  </p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">
                    {trip.distance} km
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    ETA
                  </p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">
                    {trip.eta}
                  </p>
                </div>
              </div>

              {/* Bottom section: Progress timeline OR Action buttons */}
              <div className="pt-2 border-t border-border/40 mt-auto flex flex-col justify-end min-h-[48px]">
                {isCancelled ? (
                  <div className="flex items-center gap-1.5 text-red-400/90 text-xs font-semibold">
                    <X size={14} />
                    <span>Trip was Cancelled</span>
                  </div>
                ) : isCompleted ? (
                  /* Completed Timeline (all yellow/orange active) */
                  <Timeline progress={3} />
                ) : isDispatched ? (
                  /* Dispatched actions (Complete, Cancel) */
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => handleStatusChange(trip.id, TripStatus.COMPLETED)}
                      className="flex items-center justify-center gap-1.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(trip.id, TripStatus.CANCELLED)}
                      className="flex items-center justify-center gap-1.5 border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  /* Draft actions (Dispatch Now) */
                  <button
                    onClick={() => handleStatusChange(trip.id, TripStatus.DISPATCHED)}
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

        {filteredTrips.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border">
            <p className="text-muted-foreground text-sm">No trips on board.</p>
          </div>
        )}
      </div>

      <CreateTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTrip}
        vehicles={VEHICLES}
        drivers={DRIVERS}
      />
    </div>
  );
}

function Timeline({ progress }: { progress: number }) {
  // progress: 1 = Draft, 2 = Dispatched, 3 = Completed
  return (
    <div className="flex items-center justify-between text-[10px] font-bold select-none text-muted-foreground">
      <div className="flex items-center gap-1">
        <div
          className={cn(
            "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
            progress >= 1
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border"
          )}
        >
          {progress >= 1 && <Check size={8} strokeWidth={3} />}
        </div>
        <span className={cn(progress >= 1 && "text-primary")}>Draft</span>
      </div>

      <div className={cn("flex-1 h-[2px] mx-2", progress >= 2 ? "bg-primary" : "bg-border")} />

      <div className="flex items-center gap-1">
        <div
          className={cn(
            "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
            progress >= 2
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border"
          )}
        >
          {progress >= 2 && <Check size={8} strokeWidth={3} />}
        </div>
        <span className={cn(progress >= 2 && "text-primary")}>Dispatched</span>
      </div>

      <div className={cn("flex-1 h-[2px] mx-2", progress >= 3 ? "bg-primary" : "bg-border")} />

      <div className="flex items-center gap-1">
        <div
          className={cn(
            "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
            progress >= 3
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border"
          )}
        >
          {progress >= 3 && <Check size={8} strokeWidth={3} />}
        </div>
        <span className={cn(progress >= 3 && "text-primary")}>Completed</span>
      </div>
    </div>
  );
}
