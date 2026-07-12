"use client";

import { cn } from "../utils";
import { Loader } from "./Loader";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ClassValue } from "clsx";

export interface ButtonType extends React.ComponentProps<"button"> {
  children?: React.ReactNode;
  type?: "button" | "reset" | "submit";
  className?: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?:
    | "nav"
    | "primary"
    | "none"
    | "secondary"
    | "outline"
    | "danger"
    | "dark";
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  tooltip?: string;
  tooltipId?: string;
}

export const Button = ({
  children,
  className,
  id,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  loading = false,
  loadingMessage,
  tooltip,
  tooltipId = "button-tooltip",
  ...props
}: ButtonType) => {
  const variants: Record<string, ClassValue> = {
    nav: "",
    primary: "bg-primary text-primary-foreground hover:brightness-95",
    outline:
      "border border-border bg-background text-foreground hover:bg-secondary",
    danger:
      "border border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20",
    secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
    dark: "bg-card text-card-foreground hover:brightness-110",
    none: "hover:brightness-95",
  };

  // wait until mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type={type}
      className={cn(
        "flex items-center gap-2 px-3 py-2 border border-transparent rounded-lg cursor-pointer select-none relative",
        "disabled:brightness-75 disabled:cursor-not-allowed",
        "focus-visible:ring-ring focus-visible:ring-1",
        "transition-all duration-150 active:translate-y-0.5 active:brightness-90",
        variants[variant],
        loading && "bg-muted",
        className,
      )}
      id={id}
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltip}
      {...props}
    >
      {children}

      {/* Spinner for loading */}
      {loading && (
        <div
          aria-disabled={true}
          className={cn(
            "absolute inset-0 flex h-full w-full items-center justify-center gap-2",
            "bg-muted",
            "border-none! rounded-lg! transition-none! pointer-events-none!",
          )}
        >
          <Loader
            className="border-card border-t-primary"
            size={loadingMessage ? 18 : 22}
          />
          {loadingMessage && (
            <span className="text-sm text-foreground">{loadingMessage}</span>
          )}
        </div>
      )}

      {mounted &&
        createPortal(
          <Tooltip id={tooltipId} place="bottom" delayShow={800} />,
          document.body,
        )}
    </button>
  );
};
