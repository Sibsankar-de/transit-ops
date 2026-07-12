"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { FleetStatus } from "@/enums/fleetStatus.enum";
import { TripStatus } from "@/enums/tripStatus.enum";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FleetStatusBadge } from "@/components/ui/FleetStatusBadge";
import { ArrowRight, Eye, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/components/utils";

// Mock Data representing page references
const VEHICLE_STATUS_DATA = [
  { name: "Active", value: 84, color: "#10b981" },
  { name: "Available", value: 31, color: "#3b82f6" },
  { name: "Maintenance", value: 12, color: "#f59e0b" },
  { name: "Retired", value: 5, color: "#64748b" },
];

const WEEKLY_TRIPS_DATA = [
  { name: "Mon", Completed: 50, Pending: 10 },
  { name: "Tue", Completed: 60, Pending: 12 },
  { name: "Wed", Completed: 52, Pending: 15 },
  { name: "Thu", Completed: 72, Pending: 9 },
  { name: "Fri", Completed: 65, Pending: 11 },
  { name: "Sat", Completed: 40, Pending: 8 },
  { name: "Sun", Completed: 28, Pending: 5 },
];

const FUEL_CONSUMPTION_DATA = [
  { name: "Jan", Litres: 12500 },
  { name: "Feb", Litres: 12000 },
  { name: "Mar", Litres: 13000 },
  { name: "Apr", Litres: 12700 },
  { name: "May", Litres: 14200 },
  { name: "Jun", Litres: 13800 },
  { name: "Jul", Litres: 13200 },
];

const MONTHLY_COST_DATA = [
  { name: "Jan", Fuel: 45000, Maintenance: 20000, Other: 8000 },
  { name: "Feb", Fuel: 42000, Maintenance: 15000, Other: 6000 },
  { name: "Mar", Fuel: 48000, Maintenance: 22000, Other: 9000 },
  { name: "Apr", Fuel: 46000, Maintenance: 18000, Other: 7000 },
  { name: "May", Fuel: 52000, Maintenance: 25000, Other: 10000 },
  { name: "Jun", Fuel: 49000, Maintenance: 21000, Other: 8500 },
];

interface RecentTrip {
  id: string;
  source: string;
  destination: string;
  vehicle: string;
  driver: string;
  eta: string;
  status: TripStatus;
}

const RECENT_TRIPS: RecentTrip[] = [
  {
    id: "TRP-2248",
    source: "Nairobi CBD",
    destination: "Mombasa Port",
    vehicle: "KAA 201Z",
    driver: "Felix Mutua",
    eta: "-",
    status: TripStatus.COMPLETED,
  },
  {
    id: "TRP-2249",
    source: "Kisumu Depot",
    destination: "Nakuru Hub",
    vehicle: "KBC 014K",
    driver: "Grace Wanjiku",
    eta: "2h 14m",
    status: TripStatus.DISPATCHED,
  },
  {
    id: "TRP-2250",
    source: "Eldoret",
    destination: "Nairobi ICD",
    vehicle: "KDB 552Y",
    driver: "Samuel Kiprop",
    eta: "3h 40m",
    status: TripStatus.DISPATCHED,
  },
  {
    id: "TRP-2251",
    source: "Nairobi ICD",
    destination: "Kampala",
    vehicle: "KEB 103W",
    driver: "Amina Hassan",
    eta: "12h 00m",
    status: TripStatus.DISPATCHED,
  },
  {
    id: "TRP-2252",
    source: "Thika Depot",
    destination: "Naivasha",
    vehicle: "KFA 291C",
    driver: "Peter Njoroge",
    eta: "-",
    status: TripStatus.CANCELLED,
  },
];

export default function DashboardPage() {
  const [regionFilter, setRegionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("2025-07-01");
  const [endDate, setEndDate] = useState("2025-07-12");

  const handleDateChange = (val: string, type: "start" | "end") => {
    if (type === "start") setStartDate(val);
    else setEndDate(val);
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Filters:
          </span>
          <Select
            placeholder="All Regions"
            value={regionFilter}
            options={[
              { key: "", value: "All Regions" },
              { key: "nairobi", value: "Nairobi" },
              { key: "mombasa", value: "Mombasa" },
              { key: "eldoret", value: "Eldoret" },
              { key: "nakuru", value: "Nakuru" },
            ]}
            onChange={setRegionFilter}
            className="w-35"
          />
          <Select
            placeholder="All Types"
            value={typeFilter}
            options={[
              { key: "", value: "All Types" },
              { key: "truck", value: "Truck" },
              { key: "van", value: "Van" },
              { key: "tanker", value: "Tanker" },
            ]}
            onChange={setTypeFilter}
            className="w-32.5"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <div className="w-35">
            <Input
              type="date"
              value={startDate}
              onChange={(e: any) => handleDateChange(e.target.value, "start")}
            />
          </div>
          <span className="text-muted-foreground text-sm font-medium">to</span>
          <div className="w-35">
            <Input
              type="date"
              value={endDate}
              onChange={(e: any) => handleDateChange(e.target.value, "end")}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatsCard
          title="Active Vehicles"
          value="84"
          subtext="+3 from yesterday"
          color="text-emerald-400"
        />
        <StatsCard
          title="Available"
          value="31"
          subtext="36% of fleet"
          color="text-blue-400"
        />
        <StatsCard
          title="In Maintenance"
          value="12"
          subtext="4 scheduled today"
          color="text-amber-400"
        />
        <StatsCard
          title="Active Trips"
          value="47"
          subtext="2 delayed"
          color="text-purple-400"
        />
        <StatsCard
          title="Pending Trips"
          value="18"
          subtext="Awaiting dispatch"
          color="text-secondary-foreground"
        />
        <StatsCard
          title="Drivers On Duty"
          value="61"
          subtext="5 near shift end"
          color="text-sky-400"
        />
        <StatsCard
          title="Fleet Utilization"
          value="76%"
          subtext="↑ 4% this week"
          color="text-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Vehicle Status
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
            <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={VEHICLE_STATUS_DATA}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {VEHICLE_STATUS_DATA.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono">132</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Total Fleet
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 flex-1 w-full sm:w-auto">
              {VEHICLE_STATUS_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-secondary-foreground font-semibold">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-foreground font-mono">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Trips Line Chart */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <span>Weekly Trips</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <TrendingUp size={10} />
              <span>+12% vs last week</span>
            </span>
          </h3>
          <div className="h-50 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_TRIPS_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2d45"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b27",
                    borderColor: "#1e2d45",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="Completed"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Pending"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Consumption */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Fuel Consumption (litres)
          </h3>
          <div className="h-55 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FUEL_CONSUMPTION_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2d45"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b27",
                    borderColor: "#1e2d45",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Line
                  type="monotone"
                  dataKey="Litres"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Operational Cost */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Monthly Operational Cost (KES)
          </h3>
          <div className="h-55 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_COST_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2d45"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b27",
                    borderColor: "#1e2d45",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="Fuel"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Maintenance"
                  stackId="a"
                  fill="#3b82f6"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Other"
                  stackId="a"
                  fill="#64748b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Recent Trips</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Trip ID</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RECENT_TRIPS.map((trip) => (
                <tr
                  key={trip.id}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-primary font-bold tracking-wider">
                    {trip.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{trip.source}</span>
                      <ArrowRight size={13} className="text-muted-foreground" />
                      <span>{trip.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-secondary-foreground">
                    {trip.vehicle}
                  </td>
                  <td className="px-6 py-4 text-foreground">{trip.driver}</td>
                  <td className="px-6 py-4 font-mono text-secondary-foreground">
                    {trip.eta}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        trip.status === TripStatus.COMPLETED &&
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                        trip.status === TripStatus.DISPATCHED &&
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                        trip.status === TripStatus.CANCELLED &&
                          "bg-red-500/10 text-red-400 border border-red-500/20",
                      )}
                    >
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtext,
  color,
}: {
  title: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-2">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {title}
      </p>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", color)}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground/60">{subtext}</p>
    </div>
  );
}
