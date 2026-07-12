"use client";

import { Modal, ModalHeader } from "@/components/ui/Modal";
import { VehicleForm, VehicleFormValues } from "./VehicleForm";

interface AddVehicleModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: VehicleFormValues) => void;
  isSubmitting?: boolean;
}

export function AddVehicleModal({
  open,
  onClose,
  onAdd,
  isSubmitting = false,
}: AddVehicleModalProps) {
  return (
    <Modal
      openState={open}
      onClose={onClose}
      header={
        <ModalHeader
          title="Add Vehicle"
          subtitle="Register a new vehicle to the fleet"
        />
      }
      className="w-[95vw] max-w-150"
    >
      <VehicleForm
        onSubmit={onAdd}
        onCancel={onClose}
        submitLabel="Add Vehicle"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
