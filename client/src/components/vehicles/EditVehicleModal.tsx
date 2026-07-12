"use client";

import { Modal, ModalHeader } from "@/components/ui/Modal";
import { VehicleForm, VehicleFormValues } from "./VehicleForm";

interface EditVehicleModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: any | null;
  onSave: (data: VehicleFormValues) => void;
  isSubmitting?: boolean;
}

export function EditVehicleModal({
  open,
  onClose,
  vehicle,
  onSave,
  isSubmitting = false,
}: EditVehicleModalProps) {
  if (!vehicle) return null;

  return (
    <Modal
      openState={open}
      onClose={onClose}
      header={
        <ModalHeader
          title="Edit Vehicle"
          subtitle={`Update details for ${vehicle.registration}`}
        />
      }
      className="w-[95vw] max-w-150"
    >
      <VehicleForm
        onSubmit={onSave}
        onCancel={onClose}
        defaultValues={{
          registration: vehicle.registration,
          make: vehicle.make,
          model: vehicle.model,
          type: vehicle.type,
          capacity: vehicle.capacity,
          odometer: vehicle.odometer,
          acqCost: vehicle.acqCost,
          status: vehicle.status,
        }}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
