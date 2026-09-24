export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

// Alias para corresponder ao que o Settings.tsx chama
export function endSession(): void {
  removeToken();
}

// Torna o token opcional para evitar o erro do argumento em falta
export function beginSession(token?: string): void {
  if (token) {
    setToken(token);
  }
}