"use client";

import { Modal, ModalHeader } from "@/components/ui/Modal";
import { DriverForm, DriverFormValues } from "./DriverForm";
import { Driver } from "@/types/api";

interface EditDriverModalProps {
  open: boolean;
  onClose: () => void;
  driver: Driver | null;
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

  const driverName = driver.user?.name ?? driver.userId;

  return (
    <Modal
      openState={open}
      onClose={onClose}
      header={
        <ModalHeader
          title="Edit Driver"
          subtitle={`Update license details for ${driverName}`}
        />
      }
      className="w-[95vw] max-w-[640px]"
    >
      <DriverForm
        onSubmit={onSave}
        onCancel={onClose}
        defaultValues={{
          licenseNo: driver.licenseNumber,
          category: driver.licenseCategory,
          expiry: driver.licenseExpiryDate
            ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
            : "",
          safetyScore: driver.safetyScore,
          status: driver.status,
        }}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        showUserPicker={false}
      />
    </Modal>
  );
}
