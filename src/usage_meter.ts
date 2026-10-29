import { z } from "zod";

const appointmentSchema = z.object({
  customerId: z.string().min(1),
  patientId: z.string().min(1),
  status: z.enum(["booked", "completed", "cancelled"]),
});

export type Appointment = {
  customerId: string;
  patientId: string;
  status: "booked" | "completed" | "cancelled";
};

export function parseAppointmentRequest(input: unknown): Appointment {
  return appointmentSchema.parse(input);
}

export type UsageDecision = {
  customerId: string;
  billableUnits: number;
  notification: "send" | "skip";
};

export function recordAppointment(appointment: Appointment): UsageDecision {
  const billableUnits = appointment.status === "completed" ? 1 : 0;
  return {
    customerId: appointment.customerId,
    billableUnits,
    notification: appointment.status === "completed" ? "send" : "skip",
  };
}

export function aggregateUsage(appointments: Appointment[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const appointment of appointments) {
    const decision = recordAppointment(appointment);
    totals.set(decision.customerId, (totals.get(decision.customerId) ?? 0) + decision.billableUnits);
  }
  return totals;
}
