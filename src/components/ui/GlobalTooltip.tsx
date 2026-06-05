import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalTooltip: React.FC = () => {
	const [tooltip, setTooltip] = useState<{
		text: string;
		anchorRect: DOMRect | null;
		visible: boolean;
	}>({ text: '', anchorRect: null, visible: false });

	const tooltipRef = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState({ left: 0, top: 0, ready: false });

	// Auto-hide and positioning effect
	useLayoutEffect(() => {
		if (tooltip.visible && tooltipRef.current && tooltip.anchorRect) {
			const tooltipEl = tooltipRef.current;
			const anchor = tooltip.anchorRect;
			const tooltipRect = tooltipEl.getBoundingClientRect();
			
			// Calcular posição ideal (centralizado acima, gap de 12px)
			let left = anchor.left + (anchor.width / 2) - (tooltipRect.width / 2);
			let top = anchor.top - tooltipRect.height - 12;

			// Clamping Horizontal (impedir de vazar pelas laterais)
			if (left < 12) {
				left = 12;
			} else if (left + tooltipRect.width > window.innerWidth - 12) {
				left = window.innerWidth - tooltipRect.width - 12;
			}

			// Clamping Vertical (se vazar pelo topo, jogar pra baixo do ícone)
			if (top < 12) {
				top = anchor.bottom + 12;
			}

			setPos({ left, top, ready: true });
		} else {
			setPos(prev => ({ ...prev, ready: false }));
		}
	}, [tooltip.visible, tooltip.anchorRect, tooltip.text]);

	useEffect(() => {
		let hideTimer: ReturnType<typeof setTimeout>;

		if (tooltip.visible) {
			// Auto-hide after 3.5 seconds
			hideTimer = setTimeout(() => {
				setTooltip(prev => ({ ...prev, visible: false }));
			}, 3500);
		}

		return () => clearTimeout(hideTimer);
	}, [tooltip.visible, tooltip.text]);

	useEffect(() => {
		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const tooltipTarget = target.closest('[data-tooltip]') as HTMLElement;

			if (tooltipTarget) {
				const text = tooltipTarget.getAttribute('data-tooltip');
				if (text) {
					setTooltip({
						text,
						anchorRect: tooltipTarget.getBoundingClientRect(),
						visible: true,
					});
				}
			}
		};

		const handleMouseOut = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const tooltipTarget = target.closest('[data-tooltip]') as HTMLElement;
			if (tooltipTarget) {
				setTooltip((prev) => ({ ...prev, visible: false }));
			}
		};

		const handleScroll = () => {
			setTooltip((prev) => ({ ...prev, visible: false }));
		};

		document.addEventListener('mouseover', handleMouseOver);
		document.addEventListener('mouseout', handleMouseOut);
		document.addEventListener('scroll', handleScroll, true);

		return () => {
			document.removeEventListener('mouseover', handleMouseOver);
			document.removeEventListener('mouseout', handleMouseOut);
			document.removeEventListener('scroll', handleScroll, true);
		};
	}, []);

	return (
		<AnimatePresence>
			{tooltip.visible && (
				<motion.div
					ref={tooltipRef}
					initial={{ opacity: 0, y: 5, scale: 0.95 }}
					animate={{ opacity: pos.ready ? 1 : 0, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 5, scale: 0.95 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
					className="fixed z-[9999] pointer-events-none select-none px-3 py-1.5 bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-[11px] font-medium rounded-md shadow-xl"
					style={{
						left: pos.left,
						top: pos.top,
						visibility: pos.ready ? 'visible' : 'hidden'
					}}
				>
					{tooltip.text}
				</motion.div>
			)}
		</AnimatePresence>
	);
};
