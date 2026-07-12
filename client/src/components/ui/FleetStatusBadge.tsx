import { FleetStatus } from "@/enums/fleetStatus.enum";
import { cn } from "../utils";

const STATUS_STYLES: Record<FleetStatus, string> = {
  [FleetStatus.AVAILABLE]: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  [FleetStatus.ON_TRIP]:   "bg-blue-500/15   text-blue-400   border border-blue-500/30",
  [FleetStatus.IN_SHOP]:   "bg-amber-500/15   text-amber-400  border border-amber-500/30",
  [FleetStatus.RETIRED]:   "bg-secondary      text-muted-foreground border border-border",
};

export function FleetStatusBadge({ status }: { status: FleetStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap",
        STATUS_STYLES[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
