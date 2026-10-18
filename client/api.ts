export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "study-planner",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "No se puede conectar. Comprueba tu conexión e inténtalo de nuevo.",
      0,
    );
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      data.error ?? "No se ha podido completar la operación.",
      response.status,
    );
  return data;
}
