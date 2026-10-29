import assert from "node:assert/strict";
import { aggregateUsage, parseAppointmentRequest, recordAppointment, type Appointment } from "./usage_meter.ts";

const completed: Appointment = { customerId: "clinic-north", patientId: "patient-101", status: "completed" };
const cancelled: Appointment = { customerId: "clinic-north", patientId: "patient-102", status: "cancelled" };

assert.deepEqual(parseAppointmentRequest(completed), completed);

assert.deepEqual(recordAppointment(completed), { customerId: "clinic-north", billableUnits: 1, notification: "send" });
assert.deepEqual(recordAppointment(cancelled), { customerId: "clinic-north", billableUnits: 0, notification: "skip" });
assert.deepEqual(Object.fromEntries(aggregateUsage([completed, cancelled])), { "clinic-north": 1 });
console.log("appointment billing decision test passed");
