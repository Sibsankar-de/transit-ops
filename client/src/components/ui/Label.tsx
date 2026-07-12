import React from "react";
import { cn } from "../utils";

export const Label = ({
  children,
  className,
  required = false,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
} & React.ComponentProps<"label">) => {
  return (
    <label
      className={cn(
        "mb-1.5 block text-md font-semibold text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};
