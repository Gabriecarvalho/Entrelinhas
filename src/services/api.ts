import type { Book, BookCreate, BookStatus, EntryCreate } from '../types';

const API_URL = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Não foi possível concluir a solicitação (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const bookApi = {
  list: (query: string, status: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (status !== 'all') params.set('status', status);
    const suffix = params.size ? `?${params.toString()}` : '';
    return request<Book[]>(`/books${suffix}`);
  },
  create: (book: BookCreate) =>
    request<Book>('/books', { method: 'POST', body: JSON.stringify(book) }),
  addEntry: (bookId: string, entry: EntryCreate) =>
    request<Book>(`/books/${bookId}/entries`, { method: 'POST', body: JSON.stringify(entry) }),
  updateStatus: (bookId: string, status: BookStatus) =>
    request<Book>(`/books/${bookId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (bookId: string) =>
    request<void>(`/books/${bookId}`, { method: 'DELETE' }),
};
