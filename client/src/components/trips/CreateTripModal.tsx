"use client";

import { Modal, ModalHeader } from "@/components/ui/Modal";
import { TripForm, TripFormValues } from "./TripForm";

interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: TripFormValues) => void;
  vehicles: { id: string; registration: string; make: string; model: string }[];
  drivers: { id: string; name: string }[];
  isSubmitting?: boolean;
}

export function CreateTripModal({
  open,
  onClose,
  onCreate,
  vehicles,
  drivers,
  isSubmitting = false,
}: CreateTripModalProps) {
  return (
    <Modal
      openState={open}
      onClose={onClose}
      header={
        <ModalHeader
          title="Create Trip"
          subtitle="Set up a new transport log"
        />
      }
      className="w-[95vw] max-w-[600px]"
    >
      <TripForm
        onSubmit={onCreate}
        onCancel={onClose}
        vehicles={vehicles}
        drivers={drivers}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
