import React from "react";
import clsx from "clsx";

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
      className={clsx(
        "mb-1.5 block text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};