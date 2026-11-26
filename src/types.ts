export type BookStatus = 'reading' | 'completed' | 'want-to-read';
export type EntryKind = 'progress' | 'review';

export interface ReadingEntry {
  id: string;
  kind: EntryKind;
  pages_read: number;
  note: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  status: BookStatus;
  tags: string[];
  entries: ReadingEntry[];
  created_at: string;
  updated_at: string;
}

export interface BookCreate {
  title: string;
  author: string;
  total_pages: number;
  tags: string[];
}

export interface EntryCreate {
  kind: EntryKind;
  pages_read: number;
  note: string;
}
