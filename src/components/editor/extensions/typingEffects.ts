import { EditorView } from '@codemirror/view';

const colors = [
	'#60a5fa', // Blue
	'#a78bfa', // Purple
	'#f472b6', // Pink
	'#34d399', // Emerald
	'#fbbf24', // Amber
	'#38bdf8', // Light Blue
];

function spawnParticle(effect: 'fade' | 'impact' | 'sparks' | 'stamp', char: string, x: number, y: number) {
	const el = document.createElement('div');
	el.className = `typing-effect-particle effect-${effect}`;
	
	const color = colors[Math.floor(Math.random() * colors.length)];
	
	if (effect === 'sparks') {
		// Create 2-3 sparks per keystroke
		const numSparks = Math.floor(Math.random() * 2) + 2;
		for (let i = 0; i < numSparks; i++) {
			createSpark(x, y, color);
		}
		return; // Sparks handled separately
	} else {
		el.textContent = char;
		el.style.color = color;
	}
	
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;
	
	if (effect === 'impact') {
		// Random fall direction
		const angle = (Math.random() * 60 - 30) * (Math.PI / 180); // -30 to 30 degrees
		const distanceX = Math.sin(angle) * 30;
		const distanceY = 40 + Math.random() * 30; // Fall down
		const rot = Math.random() * 90 - 45;
		
		el.style.setProperty('--tx', `${distanceX}px`);
		el.style.setProperty('--ty', `${distanceY}px`);
		el.style.setProperty('--rot', `${rot}deg`);
	}

	document.body.appendChild(el);

	// Remove after animation (matches CSS duration)
	setTimeout(() => {
		el.remove();
	}, 600);
}

function createSpark(x: number, y: number, color: string) {
	const el = document.createElement('div');
	el.className = `typing-effect-particle effect-sparks`;
	el.style.backgroundColor = color;
	el.style.left = `${x}px`;
	el.style.top = `${y + 10}px`; // Offset slightly lower

	// Explosion physics
	const angle = Math.random() * Math.PI * 2;
	const velocity = Math.random() * 40 + 20;
	const tx = Math.cos(angle) * velocity;
	const ty = Math.sin(angle) * velocity - 20; // Slight upward bias
	
	el.style.setProperty('--tx', `${tx}px`);
	el.style.setProperty('--ty', `${ty}px`);

	document.body.appendChild(el);

	setTimeout(() => {
		el.remove();
	}, 500);
}

function spawnDeleteParticle(x: number, y: number) {
	const numShards = Math.floor(Math.random() * 3) + 4; // 4 to 6 shards
	
	for (let i = 0; i < numShards; i++) {
		const el = document.createElement('div');
		el.className = `typing-effect-particle effect-delete`;
		
		// Grayscale/reddish shards
		const isRed = Math.random() > 0.7;
		el.style.backgroundColor = isRed ? '#ef4444' : '#94a3b8'; // Red or Slate
		
		el.style.left = `${x}px`;
		el.style.top = `${y + 10}px`;

		// Explosion physics
		const angle = Math.random() * Math.PI * 2;
		const velocity = Math.random() * 40 + 15; // increased velocity
		const tx = Math.cos(angle) * velocity;
		const ty = Math.sin(angle) * velocity + (Math.random() * 20); // Fall down mostly
		
		el.style.setProperty('--tx', `${tx}px`);
		el.style.setProperty('--ty', `${ty}px`);
		el.style.setProperty('--rot', `${Math.random() * 360}deg`);

		document.body.appendChild(el);

		setTimeout(() => {
			el.remove();
		}, 400);
	}
}

export const createTypingEffectExtension = (
	effect: 'none' | 'fade' | 'impact' | 'sparks' | 'stamp',
	enableDeleteEffect: boolean
) => {
	if (effect === 'none' && !enableDeleteEffect) return [];

	return EditorView.updateListener.of((update) => {
		if (!update.docChanged) return;
		
		// 1. Handle Deletion
		if (enableDeleteEffect) {
			const isDelete = update.transactions.some(tr => tr.isUserEvent('delete'));
			if (isDelete) {
				// Cursor is at the position of the deleted text
				const head = update.state.selection.main.head;
				const coords = update.view.coordsAtPos(head);
				if (coords) {
					spawnDeleteParticle(coords.left, coords.top);
				}
				// If we only deleted, we might not want to spawn a typing particle
				if (update.transactions.every(tr => tr.isUserEvent('delete'))) return;
			}
		}

		// 2. Handle Insertion
		if (effect !== 'none') {
			const isInput = update.transactions.some(tr => tr.isUserEvent('input'));
			if (!isInput) return;

			let typedText = '';
			update.transactions.forEach(tr => {
				if (tr.isUserEvent('input')) {
					tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
						typedText += inserted.toString();
					});
				}
			});

			if (!typedText) return;
			
			const charToRender = typedText.slice(-1);
			
			if (charToRender.trim() === '' && effect !== 'sparks') return;

			const head = update.state.selection.main.head;
			const coords = update.view.coordsAtPos(Math.max(0, head - 1));
			
			if (!coords) return;

			spawnParticle(effect, charToRender, coords.left, coords.top);
		}
	});
};
