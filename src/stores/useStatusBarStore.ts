import { create } from 'zustand';

interface StatusBarState {
	line: number;
	col: number;
	chars: number;

	setStats: (stats: Partial<{ line: number; col: number; chars: number }>) => void;
}

export const useStatusBarStore = create<StatusBarState>((set) => ({
	line: 1,
	col: 1,
	chars: 0,

	setStats: (stats) => set((state) => ({ ...state, ...stats })),
}));
