export enum Permission {
  VEHICLE_CREATE = "vehicle:create",
  TRIP_DISPATCH = "trip:dispatch",
  REPORT_VIEW = "report:view",
}

export const permissionValues = Object.values(Permission) as [
  string,
  ...string[],
];
