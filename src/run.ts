import { InfraiAccountClient } from "./infrai_account.ts";
import { aggregateUsage, recordAppointment, type Appointment } from "./usage_meter.ts";

const appointments: Appointment[] = [
  { customerId: "clinic-north", patientId: "patient-101", status: "completed" },
  { customerId: "clinic-north", patientId: "patient-102", status: "cancelled" },
  { customerId: "clinic-west", patientId: "patient-203", status: "completed" },
];

const totals = Object.fromEntries(aggregateUsage(appointments));
console.log(JSON.stringify({ decisions: appointments.map(recordAppointment), billableUnitsByCustomer: totals }, null, 2));

const key = process.env.INFRAI_API_KEY;
if (key) {
  const infrai = new InfraiAccountClient(key);
  const timeseries = await infrai.usageTimeseries();
  console.log(JSON.stringify({ accountUsageTimeseries: timeseries }, null, 2));
  console.log("A real temporary key can be rotated with the same client; keep the returned plaintext only once.");
} else {
  console.log("Set INFRAI_API_KEY to read the account usage timeseries from Infrai.");
}
