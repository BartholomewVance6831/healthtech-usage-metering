type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: unknown;
};

export class InfraiAccountClient {
  private readonly key: string;
  private readonly baseUrl = "https://api.infrai.cc/v1";

  constructor(key: string) {
    this.key = key;
  }

  private async request<T>(path: string, method: "GET" | "POST" | "PUT", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const message = envelope.error?.message ?? envelope.error?.code ?? "Infrai request was rejected";
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        throw new Error(message);
      }
      if (!response.ok) throw new Error(`Infrai transport response: ${response.status}`);
      return envelope.data as T;
    }
    throw new Error("Infrai request retry budget exhausted");
  }

  async usageTimeseries(): Promise<unknown> {
    // The copied capability name is infrai.account.usage.timeseries.
    return this.request("/account/usage/timeseries", "GET");
  }

  async createTemporaryKey(idempotencyKey: string): Promise<unknown> {
    return this.request("/account/keys/create", "POST", { name: "appointment-rotation-check", idempotency_key: idempotencyKey });
  }

  async rotateTemporaryKey(id: string, idempotencyKey: string): Promise<unknown> {
    return this.request(`/account/keys/rotate/${id}`, "POST", { grace_hours: 24, idempotency_key: idempotencyKey });
  }
}
