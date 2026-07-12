"use client";

import { Modal, ModalHeader } from "@/components/ui/Modal";
import { DriverForm, DriverFormValues } from "./DriverForm";

interface EditDriverModalProps {
  open: boolean;
  onClose: () => void;
  driver: any | null;
  onSave: (data: DriverFormValues) => void;
  isSubmitting?: boolean;
}

export function EditDriverModal({
  open,
  onClose,
  driver,
  onSave,
  isSubmitting = false,
}: EditDriverModalProps) {
  if (!driver) return null;

  return (
    <Modal
      openState={open}
      onClose={onClose}
      header={
        <ModalHeader
          title="Edit Driver"
          subtitle={`Update details for ${driver.name}`}
        />
      }
      className="w-[95vw] max-w-[600px]"
    >
      <DriverForm
        onSubmit={onSave}
        onCancel={onClose}
        defaultValues={{
          name: driver.name,
          licenseNo: driver.licenseNo,
          category: driver.category,
          expiry: driver.expiry,
          contact: driver.contact,
          safetyScore: driver.safetyScore,
          status: driver.status,
        }}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
