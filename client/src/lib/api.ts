// API utility functions for common requests

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  return response;
}

// Helper function to get JSON data from API responses
export async function apiGet<T>(url: string): Promise<T> {
  const response = await apiRequest("GET", url);
  return response.json();
}

// Helper function to post data to API
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiRequest("POST", url, data);
  return response.json();
}

// Helper function to put data to API
export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiRequest("PUT", url, data);
  return response.json();
}

// Helper function to delete from API
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiRequest("DELETE", url);
  return response.json();
}
