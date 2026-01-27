/**
 * Tipos globais da aplicação Smart MD
 */

export type ThemeMode = 'dark' | 'light';
export type Language = 'pt-BR' | 'en-US';

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  createdAt: number;
  modifiedAt: number;
  isFavorite: boolean;
}

export interface EditorState {
  content: string;
  cursorPosition: number;
  scrollPosition: number;
  selections: Array<{ from: number; to: number }>;
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
