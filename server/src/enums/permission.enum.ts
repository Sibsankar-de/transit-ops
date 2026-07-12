export enum Permission {
  USER_CREATE = "user:create",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  ROLE_CREATE = "role:create",
  ROLE_READ = "role:read",
  ROLE_UPDATE = "role:update",
  ROLE_DELETE = "role:delete",

  DRIVER_CREATE = "driver:create",
  DRIVER_READ = "driver:read",
  DRIVER_UPDATE = "driver:update",
  DRIVER_DELETE = "driver:delete",
  DRIVER_ASSIGN = "driver:assign",

  VEHICLE_CREATE = "vehicle:create",
  VEHICLE_READ = "vehicle:read",
  VEHICLE_UPDATE = "vehicle:update",
  VEHICLE_DELETE = "vehicle:delete",

  TRIP_CREATE = "trip:create",
  TRIP_READ = "trip:read",
  TRIP_UPDATE = "trip:update",
  TRIP_DELETE = "trip:delete",
  TRIP_DISPATCH = "trip:dispatch",
  TRIP_CANCEL = "trip:cancel",

  EXPENSE_CREATE = "expense:create",
  EXPENSE_READ = "expense:read",
  EXPENSE_UPDATE = "expense:update",
  EXPENSE_DELETE = "expense:delete",

  FUEL_LOG_CREATE = "fuelLog:create",
  FUEL_LOG_READ = "fuelLog:read",
  FUEL_LOG_UPDATE = "fuelLog:update",
  FUEL_LOG_DELETE = "fuelLog:delete",

  MAINTENANCE_LOG_CREATE = "maintenanceLog:create",
  MAINTENANCE_LOG_READ = "maintenanceLog:read",
  MAINTENANCE_LOG_UPDATE = "maintenanceLog:update",
  MAINTENANCE_LOG_DELETE = "maintenanceLog:delete",

  REPORT_VIEW = "report:view",
  REPORT_EXPORT = "report:export",
}

export const permissionValues = Object.values(Permission) as [
  string,
  ...string[],
];
