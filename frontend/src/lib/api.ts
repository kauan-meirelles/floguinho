const BASE = "/api";

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API error ${status}`);
  }
}

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  };
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }
  return (await res.json()) as T;
}

// Métodos de requisição essenciais que faltavam exportar:
export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, data?: unknown) => request<T>("POST", path, data);
export const apiPut = <T>(path: string, data?: unknown) => request<T>("PUT", path, data);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);

// FormData (upload de arquivo): o browser define o boundary — nunca sete Content-Type à mão.
export const apiPostForm = async <T>(path: string, form: FormData): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: form });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }
  return (await res.json()) as T;
};

// Mensagem amigável a partir de um ApiError (o detail do FastAPI pode vir como string ou lista).
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (typeof d === "object" && d !== null ? String((d as { msg?: string }).msg) : String(d)))
        .join("; ");
    }
    if (err.status === 401) return "username ou senha incorretos";
  }
  return "algo deu errado, tenta de novo";
}