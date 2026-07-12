"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../utils";

type DropDownProps = {
  children?: React.ReactNode;
  openState: boolean;
  className?: string;
  onClose?: () => void;
};

export const Dropdown = ({
  children,
  openState,
  onClose,
  className,
}: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClose, setIsClose] = useState(false);

  useEffect(() => {
    if (openState) {
      setIsOpen(true);
      setIsClose(false);
    } else {
      setIsClose(true);

      const timeout = setTimeout(() => {
        setIsOpen(false);
        setIsClose(false);
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [openState]);

  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        boxRef.current &&
        !boxRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={boxRef}
      className={cn(
        "absolute z-50 w-[20em] rounded-lg border border-border bg-card p-1 text-sm text-foreground shadow-lg dropdown-open-anim",
        isClose && "dropdown-close-anim",
        className,
      )}
    >
      {children}
    </div>
  );
};
