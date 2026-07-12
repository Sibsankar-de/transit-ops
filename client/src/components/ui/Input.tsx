"use client";

import React, { useState } from "react";
import { cn } from "../utils";
import { Eye, EyeOff, OctagonAlert } from "lucide-react";

export interface InputType extends Omit<
  React.ComponentProps<"input">,
  "onChange"
> {
  onChange?: (e: string) => void;
  isInvalid?: boolean;
  icon?: React.ReactElement;
}

export const Input = ({
  className,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  isInvalid = false,
  icon,
  ...props
}: InputType) => {
  const [showPassword, setShowPassword] = useState(false);
  const isTypePassword = type === "password";

  return (
    <div className="relative flex w-full items-center group">
      {icon && (
        <div
          className={cn(
            "absolute left-3 flex h-fit w-fit items-center justify-center",
            "text-muted-foreground group-focus-within:text-primary",
          )}
        >
          {icon}
        </div>
      )}

      <input
        id={id}
        type={showPassword ? "text" : type}
        placeholder={placeholder || ""}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        className={cn(
          "w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200",
          icon && "pl-10",
          isTypePassword && "pr-10",
          isInvalid && "border-red-500 focus:ring-red-500 pr-10",
          disabled &&
            "cursor-not-allowed bg-secondary text-muted-foreground opacity-70",
          className,
        )}
        {...props}
      />

      {isTypePassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}

      {isInvalid && !isTypePassword && (
        <div className="absolute right-3">
          <OctagonAlert className="h-5 w-5 text-red-500" />
        </div>
      )}
    </div>
  );
};
