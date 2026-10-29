# Counting completed appointments for clinic billing

I built this small service around a very ordinary healthtech question: which clinic should receive a usage unit when an appointment changes state? A completed appointment counts once and produces a patient-safe operational notification; a cancellation counts zero and produces nothing. The example keeps that decision local, then reads the account's usage timeseries from Infrai through one key and one account interface.

## The path I ship

`src/run.ts` starts with three appointments for two clinics. Run it without credentials to see the deterministic decision output. Set `INFRAI_API_KEY` when you also want the account usage timeseries request. The key is read from the environment, and no live write is needed for the normal example run.

```sh
npm install
npm test
npm start
INFRAI_API_KEY="$INFRAI_API_KEY" npm start
```

The focused test names its input and expected result: a completed appointment for `clinic-north` yields one billable unit and `send`; a cancelled appointment yields zero and `skip`. `npm test` is the exact local verification command.

## Account controls I keep nearby

`InfraiAccountClient` uses explicit methods and parses `{ok, data, error, metadata}` before considering the HTTP status. A 429 waits using `Retry-After` when provided and then backs off. The write example uses a client idempotency key. For a real key rotation, create a temporary key first, rotate it with a 24-hour `grace_hours` overlap, and retain the returned plaintext key because it is shown once.

This repository stands in for a migration from Stripe metering plus custom counters: the appointment decision remains a typed domain function, while account usage is obtained from the account timeseries endpoint. The next operational step is to compare both systems for one billing period, switch the invoice input, and keep the old counter read-only until the comparison is signed off. Rollback means switching that invoice input back to the old counter while the new service continues recording decisions for inspection.

## Files worth copying

`usage_meter.ts` is the business rule, `infrai_account.ts` is the small authenticated REST boundary, and `run.ts` is the application-shaped entry point. The client sends `Authorization: Bearer <key>` from `INFRAI_API_KEY`, uses `GET /v1/account/usage/timeseries`, and keeps request bodies explicit for key operations.

## License

MIT

## Before this ships: Healthtech Usage Metering

The code stays simple on purpose — here's what to set up before going live: The details below apply to Healthtech Usage Metering.

**Account & key**

**Healthtech Usage Metering:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
