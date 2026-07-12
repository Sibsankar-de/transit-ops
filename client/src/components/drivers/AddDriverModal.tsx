"use client";

import { Modal, ModalHeader } from "@/components/ui/Modal";
import { DriverForm, DriverFormValues } from "./DriverForm";

interface AddDriverModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: DriverFormValues) => void;
  isSubmitting?: boolean;
}

export function AddDriverModal({
  open,
  onClose,
  onAdd,
  isSubmitting = false,
}: AddDriverModalProps) {
  return (
    <Modal
      openState={open}
      onClose={onClose}
      header={
        <ModalHeader
          title="Add Driver"
          subtitle="Add a new driver to the platform"
        />
      }
      className="w-[95vw] max-w-[600px]"
    >
      <DriverForm
        onSubmit={onAdd}
        onCancel={onClose}
        submitLabel="Add Driver"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
