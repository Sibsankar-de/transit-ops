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
          subtitle="Link a user account to create a new driver profile"
        />
      }
      className="w-[95vw] max-w-[640px]"
    >
      <DriverForm
        onSubmit={onAdd}
        onCancel={onClose}
        submitLabel="Add Driver"
        isSubmitting={isSubmitting}
        showUserPicker={true}
      />
    </Modal>
  );
}
