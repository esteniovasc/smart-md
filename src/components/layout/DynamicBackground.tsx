import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const DynamicBackground = () => {
	const enabled = useSettingsStore((state) => state.enableDynamicBackground);
	const radius = useSettingsStore((state) => state.spotlightRadius);
	const requestRef = useRef<number | null>(null);

	useEffect(() => {
		if (!enabled) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (requestRef.current) return;

			requestRef.current = requestAnimationFrame(() => {
				document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
				document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
				requestRef.current = null;
			});
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
		};
	}, [enabled]);

	if (!enabled) return null;

	return (
		<div
			className="fixed inset-0 pointer-events-none z-[50] transition-opacity duration-500"
			style={{
				background: `
					radial-gradient(
						${radius}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
						rgba(59, 130, 246, 0.15),
						transparent 80%
					)
				`,
				mixBlendMode: 'screen' // Creates a light glow effect
			}}
		/>
	);
};
