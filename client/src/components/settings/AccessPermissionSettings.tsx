"use client";

import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Permission } from "@/enums/permission.enum";
import { User, Role, UserStatus } from "@/types/api";
import { 
  useGetRolesQuery, 
  useCreateRoleMutation, 
  useDeleteRoleMutation 
} from "@/store/slices/rolesApiSlice";
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation 
} from "@/store/slices/usersApiSlice";
import { 
  Pencil, 
  Plus, 
  Trash2, 
  Shield, 
  Users, 
  Search, 
  AlertCircle,
  Lock
} from "lucide-react";
import { cn } from "../utils";
import { useToast } from "../ui/Toast";

// Permissions grouped by category for cleaner display in the Add Role modal
const PERMISSION_GROUPS = [
  {
    title: "User Management",
    permissions: [
      { key: Permission.USER_READ, label: "View Users" },
      { key: Permission.USER_CREATE, label: "Create Users" },
      { key: Permission.USER_UPDATE, label: "Update Users" },
      { key: Permission.USER_DELETE, label: "Delete Users" },
    ]
  },
  {
    title: "Role Management",
    permissions: [
      { key: Permission.ROLE_READ, label: "View Roles" },
      { key: Permission.ROLE_CREATE, label: "Create Roles" },
      { key: Permission.ROLE_UPDATE, label: "Update Roles" },
      { key: Permission.ROLE_DELETE, label: "Delete Roles" },
    ]
  },
  {
    title: "Driver Management",
    permissions: [
      { key: Permission.DRIVER_READ, label: "View Drivers" },
      { key: Permission.DRIVER_CREATE, label: "Create Drivers" },
      { key: Permission.DRIVER_UPDATE, label: "Update Drivers" },
      { key: Permission.DRIVER_DELETE, label: "Delete Drivers" },
      { key: Permission.DRIVER_ASSIGN, label: "Assign Drivers to Trips" },
    ]
  },
  {
    title: "Vehicle Management",
    permissions: [
      { key: Permission.VEHICLE_READ, label: "View Vehicles" },
      { key: Permission.VEHICLE_CREATE, label: "Create Vehicles" },
      { key: Permission.VEHICLE_UPDATE, label: "Update Vehicles" },
      { key: Permission.VEHICLE_DELETE, label: "Delete Vehicles" },
    ]
  },
  {
    title: "Trip Management",
    permissions: [
      { key: Permission.TRIP_READ, label: "View Trips" },
      { key: Permission.TRIP_CREATE, label: "Create Trips" },
      { key: Permission.TRIP_UPDATE, label: "Update Trips" },
      { key: Permission.TRIP_DELETE, label: "Delete Trips" },
      { key: Permission.TRIP_DISPATCH, label: "Dispatch Trips" },
      { key: Permission.TRIP_CANCEL, label: "Cancel Trips" },
    ]
  },
  {
    title: "Expense Management",
    permissions: [
      { key: Permission.EXPENSE_READ, label: "View Expenses" },
      { key: Permission.EXPENSE_CREATE, label: "Create Expenses" },
      { key: Permission.EXPENSE_UPDATE, label: "Update Expenses" },
      { key: Permission.EXPENSE_DELETE, label: "Delete Expenses" },
    ]
  },
  {
    title: "Fuel Logs Management",
    permissions: [
      { key: Permission.FUEL_LOG_READ, label: "View Fuel Logs" },
      { key: Permission.FUEL_LOG_CREATE, label: "Create Fuel Logs" },
      { key: Permission.FUEL_LOG_UPDATE, label: "Update Fuel Logs" },
      { key: Permission.FUEL_LOG_DELETE, label: "Delete Fuel Logs" },
    ]
  },
  {
    title: "Maintenance Logs",
    permissions: [
      { key: Permission.MAINTENANCE_LOG_READ, label: "View Maintenance Logs" },
      { key: Permission.MAINTENANCE_LOG_CREATE, label: "Create Maintenance Logs" },
      { key: Permission.MAINTENANCE_LOG_UPDATE, label: "Update Maintenance Logs" },
      { key: Permission.MAINTENANCE_LOG_DELETE, label: "Delete Maintenance Logs" },
    ]
  },
  {
    title: "Reports & Analytics",
    permissions: [
      { key: Permission.REPORT_VIEW, label: "View Reports" },
      { key: Permission.REPORT_EXPORT, label: "Export Reports" },
    ]
  }
];

type UserFormData = {
  name: string;
  email: string;
  roleId: string;
  status: UserStatus;
};

type RoleFormData = {
  value: string; // Role Display Name
  permissions: string[];
};

export const AccessPermissionSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "roles">("users");
  const { success, error, warning } = useToast();

  // RTK Query hooks
  const { data: usersResponse, isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRolesQuery();

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  
  const [createRole] = useCreateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const users = usersResponse?.data || [];
  const roles = rolesResponse?.data || [];

  // Search & Filter
  const [userSearch, setUserSearch] = useState("");

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Forms
  const {
    control: userControl,
    register: userRegister,
    handleSubmit: handleUserSubmit,
    reset: resetUserForm,
    formState: { errors: userErrors, isSubmitting: isUserSubmitting },
  } = useForm<UserFormData>();

  const {
    register: roleRegister,
    handleSubmit: handleRoleSubmit,
    setValue: setRoleValue,
    watch: watchRole,
    reset: resetRoleForm,
    formState: { errors: roleErrors, isSubmitting: isRoleSubmitting },
  } = useForm<RoleFormData>({
    defaultValues: {
      value: "",
      permissions: [],
    }
  });

  const selectedPermissions = watchRole("permissions") || [];

  // Open Add User
  const handleOpenAddUser = () => {
    setSelectedUser(null);
    resetUserForm({
      name: "",
      email: "",
      roleId: roles.length > 0 ? roles[0].id : "",
      status: UserStatus.ACTIVE,
    });
    setUserModalOpen(true);
  };

  // Open Edit User
  const handleOpenEditUser = (user: User) => {
    setSelectedUser(user);
    resetUserForm({
      name: user.name,
      email: user.email,
      roleId: user.roleId || "",
      status: user.status,
    });
    setUserModalOpen(true);
  };

  // Save User (Add or Edit)
  const onUserSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        // Edit mode (Note: Backend only supports self-profile editing currently via PATCH /users/update)
        await updateUser({ name: data.name }).unwrap();
      } else {
        // Add mode
        await createUser({
          name: data.name,
          email: data.email,
          password: "TransitOpsPassword123!" // satisfies strength validation
        }).unwrap();
      }
      setUserModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error("Failed to save user:", err);
      error(err?.data?.message || "Failed to save user. Verify backend availability.");
    }
  };

  // Open Add Role
  const handleOpenAddRole = () => {
    resetRoleForm({
      value: "",
      permissions: [],
    });
    setRoleModalOpen(true);
  };

  // Save Role
  const onRoleSubmit = async (data: RoleFormData) => {
    try {
      await createRole({
        name: data.value,
        permissions: data.permissions,
      }).unwrap();
      setRoleModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create role:", err);
      error(err?.data?.message || "Failed to create role. Verify backend availability.");
    }
  };

  // Delete Role
  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (isDefaultRole(roleName)) {
      warning("System default roles cannot be deleted.");
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        await deleteRole(roleId).unwrap();
      } catch (err: any) {
        console.error("Failed to delete role:", err);
        error(err?.data?.message || "Failed to delete role. Verify backend availability.");
      }
    }
  };

  // Check if role is system default
  const isDefaultRole = (name: string) => {
    return ["Admin", "Fleet Manager", "Dispatcher", "Driver", "Viewer"].includes(name);
  };

  // Permissions select/deselect helpers
  const handleToggleGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every(p => selectedPermissions.includes(p));
    let nextPermissions: string[];

    if (allSelected) {
      nextPermissions = selectedPermissions.filter(p => !groupPermissions.includes(p));
    } else {
      const uniqueNew = groupPermissions.filter(p => !selectedPermissions.includes(p));
      nextPermissions = [...selectedPermissions, ...uniqueNew];
    }
    setRoleValue("permissions", nextPermissions);
  };

  const handleSelectAllPermissions = () => {
    setRoleValue("permissions", Object.values(Permission));
  };

  const handleClearAllPermissions = () => {
    setRoleValue("permissions", []);
  };

  // Table options
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleName = roles.find((r) => r.id === u.roleId)?.name || u.roleId || "No Role";
      return (
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        roleName.toLowerCase().includes(userSearch.toLowerCase())
      );
    });
  }, [users, userSearch, roles]);

  const userColumns = useMemo<ColumnDef<User>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const initials = row.original.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-primary/20 text-primary border border-primary/30 shrink-0">
                {initials}
              </div>
              <div>
                <span className="font-semibold text-foreground block">
                  {row.original.name}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {row.original.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "roleId",
        header: "Role",
        cell: ({ row }) => {
          const roleId = row.original.roleId;
          const roleObj = roles.find((r) => r.id === roleId);
          const roleName = roleObj?.name || roleId || "No Role";

          const styles: Record<string, string> = {
            admin: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
            "fleet-manager": "bg-blue-500/15 text-blue-400 border border-blue-500/30",
            dispatcher: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
            driver: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
            viewer: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
          };

          const defaultStyle = "bg-secondary text-secondary-foreground border border-border";
          const badgeStyle = styles[roleName.toLowerCase().replace(/\s+/g, "-")] || defaultStyle;

          return (
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap",
              badgeStyle
            )}>
              {roleName}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.status === UserStatus.ACTIVE;
          return (
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              )} />
              <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                {row.original.status}
              </span>
            </div>
          );
        },
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
              className="p-1.5 h-8 w-8 flex items-center justify-center border-border hover:bg-secondary"
              onClick={() => handleOpenEditUser(row.original)}
              aria-label="Edit User"
            >
              <Pencil size={14} />
            </Button>
          </div>
        ),
      },
    ];
  }, [roles]);

  const roleOptions = useMemo(() => {
    return roles.map((r) => ({
      key: r.id,
      value: r.name,
    }));
  }, [roles]);

  if (isUsersLoading || isRolesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading settings from server...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Access & Permissions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure system roles, manage users, and assign customized permissions.
          </p>
        </div>

        {/* Sub-tabs switcher */}
        <div className="flex bg-secondary p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveSubTab("users")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              activeSubTab === "users"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users size={14} />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveSubTab("roles")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              activeSubTab === "roles"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield size={14} />
            <span>Roles</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mt-6 flex-1">
        {activeSubTab === "users" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full sm:max-w-md relative flex items-center">
                <Input
                  placeholder="Search by name, email, or role..."
                  value={userSearch}
                  onChange={(e: any) => setUserSearch(e.target.value)}
                  icon={<Search size={16} />}
                  className="w-full bg-card"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleOpenAddUser}
                className="flex items-center gap-2 h-10 px-4 self-end sm:self-auto"
              >
                <Plus size={16} />
                <span>Add User</span>
              </Button>
            </div>

            <DataTable
              columns={userColumns}
              data={filteredUsers}
              emptyState={
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <p className="text-muted-foreground text-sm">No users found.</p>
                </div>
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">Available Roles</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  System default roles are locked. Custom roles can be managed and deleted.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleOpenAddRole}
                className="flex items-center gap-2 h-10 px-4"
              >
                <Plus size={16} />
                <span>Create Role</span>
              </Button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={cn(
                    "rounded-xl border border-border bg-card p-5 relative overflow-hidden transition-all duration-300",
                    "hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px] flex flex-col justify-between min-h-[180px]"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary shrink-0" />
                        <h4 className="font-bold text-foreground tracking-tight text-base">
                          {role.name}
                        </h4>
                      </div>

                      {isDefaultRole(role.name) ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/60">
                          <Lock size={10} />
                          Default
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="text-muted-foreground hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Role"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 font-medium">
                      {role.permissions.length} total permissions assigned
                    </p>

                    {/* Preview of permissions */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      {role.permissions.slice(0, 4).map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded border border-border"
                        >
                          {perm.split(":")[1]}
                        </span>
                      ))}
                      {role.permissions.length > 4 && (
                        <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5">
                          +{role.permissions.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT USER MODAL --- */}
      <Modal
        openState={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
        header={
          <ModalHeader
            title={selectedUser ? "Edit User" : "Add User"}
            subtitle={
              selectedUser
                ? "Update user profile details"
                : "Create a new user account with role access"
            }
          />
        }
        className="w-[95vw] max-w-[500px]"
      >
        <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="userName">Full Name</Label>
            <Input
              id="userName"
              placeholder="John Doe"
              {...userRegister("name", { required: "Name is required" })}
              error={userErrors.name?.message}
              className="bg-secondary/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="userEmail">Email Address</Label>
            <Input
              id="userEmail"
              type="email"
              placeholder="john.doe@transitops.com"
              disabled={!!selectedUser}
              {...userRegister("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              error={userErrors.email?.message}
              className="bg-secondary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Assigned Role</Label>
              <Controller
                name="roleId"
                control={userControl}
                rules={{ required: "Role is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    options={roleOptions}
                    placeholder="Select Role"
                    error={fieldState.error?.message}
                    className="bg-secondary/40"
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Account Status</Label>
              <Controller
                name="status"
                control={userControl}
                rules={{ required: "Status is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    options={[
                      { key: UserStatus.ACTIVE, value: "Active" },
                      { key: UserStatus.INACTIVE, value: "Inactive" },
                    ]}
                    placeholder="Select Status"
                    error={fieldState.error?.message}
                    className="bg-secondary/40"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setUserModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isUserSubmitting}>
              {selectedUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- ADD ROLE MODAL --- */}
      <Modal
        openState={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        header={
          <ModalHeader
            title="Create Custom Role"
            subtitle="Define a name and assign permissions for the new role"
          />
        }
        className="w-[95vw] max-w-[850px]"
      >
        <form onSubmit={handleRoleSubmit(onRoleSubmit)} className="space-y-6">
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="roleValue">Role Name</Label>
            <Input
              id="roleValue"
              placeholder="e.g. Operations Assistant"
              {...roleRegister("value", { required: "Role Name is required" })}
              error={roleErrors.value?.message}
              className="bg-secondary/40"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
              <div>
                <Label className="text-sm font-semibold">Permissions Setup</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select the operations this role is authorized to perform.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="text-xs py-1 px-3 h-8 border-border"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleClearAllPermissions}
                  className="text-xs py-1 px-3 h-8 border-border"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Error display if no permissions selected */}
            {roleErrors.permissions && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>At least one permission must be selected.</span>
              </div>
            )}

            {/* Grid of categorized permissions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[380px] overflow-y-auto pr-1">
              {PERMISSION_GROUPS.map((group) => {
                const groupKeys = group.permissions.map(p => p.key);
                const allSelected = groupKeys.every(p => selectedPermissions.includes(p));
                const someSelected = groupKeys.some(p => selectedPermissions.includes(p));

                return (
                  <div key={group.title} className="bg-secondary/20 rounded-xl border border-border p-4 space-y-3 transition-colors hover:border-border/80">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground">
                        {group.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleGroup(groupKeys)}
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer",
                          allSelected 
                            ? "bg-primary/20 text-primary border border-primary/30" 
                            : someSelected 
                            ? "bg-primary/10 text-primary/80 border border-primary/20"
                            : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        {allSelected ? "Clear Group" : "Select Group"}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm.key}
                          className={cn(
                            "flex items-start gap-2.5 rounded-lg border border-transparent px-3 py-2 cursor-pointer select-none transition-colors",
                            "hover:bg-secondary/40",
                            selectedPermissions.includes(perm.key) && "bg-secondary/60 border-border/30"
                          )}
                        >
                          <input
                            type="checkbox"
                            value={perm.key}
                            {...roleRegister("permissions", {
                              validate: (val) => val && val.length > 0
                            })}
                            className="mt-0.5 h-3.5 w-3.5 accent-primary shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground leading-tight">
                              {perm.label}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground leading-tight mt-0.5">
                              {perm.key}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              type="button"
              onClick={() => setRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isRoleSubmitting}>
              Create Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
