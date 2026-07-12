"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Button } from "./Button";
import { X } from "lucide-react";

const ModalContext = createContext<{
  open: boolean;
  onClose?: () => void;
}>({
  open: false,
  onClose: () => {},
});

export const useModalContext = () => useContext(ModalContext);

export type ModalProps = {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  openState?: boolean;
  header?: React.ReactNode;
};

export const Modal = ({
  children,
  openState = false,
  className = "",
  header,
  onClose,
}: ModalProps) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (openState) {
      setOpen(true);
      setClosing(false);
      document.body.style.overflowY = "hidden";
    } else {
      setClosing(true);
      const timeout = setTimeout(() => {
        setOpen(false);
        setClosing(false);
        document.body.style.overflowY = "auto";
      }, 300);

      return () => clearTimeout(timeout);
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [openState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <ModalContext.Provider value={{ open, onClose }}>
      <div
        className={clsx(
          "fixed inset-0 z-60 flex items-start justify-center overflow-y-auto pt-8 pb-2",
          "bg-black/60 backdrop-blur-sm fade-in",
          closing && "fade-out",
        )}
        onClick={() => onClose?.()}
      >
        <div
          className={clsx(
            "rounded-xl border border-border bg-card text-card-foreground shadow-2xl dropdown-open-anim",
            closing && "dropdown-close-anim",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {header}

          <div className={clsx("min-h-[5em] min-w-[15em] p-3", className)}>
            {children}
          </div>
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
};

export const ModalHeader = ({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: string;
}) => {
  const { onClose } = useModalContext();

  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border p-3">
      <div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>

        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <Button
        variant="outline"
        className="border-transparent p-2"
        onClick={() => onClose?.()}
      >
        <X size={18} />
      </Button>
    </div>
  );
};