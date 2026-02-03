/**
 * Faz o parse seguro de Hex (6 ou 8 digitos) para RGBA [0-255, 0-255, 0-255, 0-1]
 */
export function parseHex(hex: string): { r: number, g: number, b: number, a: number } | null {
	if (!hex || !/^#?[0-9A-F]{6}([0-9A-F]{2})?$/i.test(hex)) return null;

	const clean = hex.replace('#', '');

	const r = parseInt(clean.substring(0, 2), 16);
	const g = parseInt(clean.substring(2, 4), 16);
	const b = parseInt(clean.substring(4, 6), 16);

	let a = 1;
	if (clean.length === 8) {
		a = parseInt(clean.substring(6, 8), 16) / 255;
	}

	return { r, g, b, a };
}

/**
 * Calcula luminância efetiva considerando a opacidade sobre um fundo (Preto ou Branco)
 */
export function getEffectiveLuminance(hex: string, onDarkBackground: boolean): number {
	const rgba = parseHex(hex);
	if (!rgba) return onDarkBackground ? 255 : 0; // Fallback seguro

	const bg = onDarkBackground ? 0 : 255; // Fundo preto ou branco

	// Blending Alpha: Result = FG * A + BG * (1 - A)
	const rEff = rgba.r * rgba.a + bg * (1 - rgba.a);
	const gEff = rgba.g * rgba.a + bg * (1 - rgba.a);
	const bEff = rgba.b * rgba.a + bg * (1 - rgba.a);

	return 0.2126 * rEff + 0.7152 * gEff + 0.0722 * bEff;
}

/**
 * Ajusta componentes RGB mantendo o Alpha
 */
export function shiftColor(hex: string, amount: number): string {
	const rgba = parseHex(hex);
	if (!rgba) return hex;

	let { r, g, b } = rgba;

	r = Math.min(255, Math.max(0, r + amount));
	g = Math.min(255, Math.max(0, g + amount));
	b = Math.min(255, Math.max(0, b + amount));

	const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();

	let newHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

	// Preserva alpha original se existia
	if (hex.replace('#', '').length === 8) {
		const alphaHex = Math.round(rgba.a * 255).toString(16).padStart(2, '0').toUpperCase();
		newHex += alphaHex;
	}

	return newHex;
}

/**
 * Retorna uma cor sugerida (segura) baseada na cor atual e no tema.
 * Tenta preservar o Hue clareando/escurecendo ou aumentando a OPACIDADE.
 */
export function getSuggestedColor(color: string, isDark: boolean): string {
	const rgba = parseHex(color);
	if (!rgba) return color;

	// 1. Verifica Contraste Atual
	const currentEffectiveLuma = getEffectiveLuminance(color, isDark);
	const minContrast = 60;
	const maxContrast = 195;

	const isBadCurrently = isDark
		? currentEffectiveLuma < minContrast
		: currentEffectiveLuma > maxContrast;

	if (!isBadCurrently) return color;

	// 2. Tenta Corrigir AUMENTANDO A OPACIDADE primeiro (Preserva o tom/Hue)
	// Simula alpha 100%
	const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();
	const baseHex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;

	const lumaAt100 = getEffectiveLuminance(baseHex, isDark); // Alpha 1 implicito

	// Verifica se ficaria bom com 100% opacidade
	const wouldBeGoodAt100 = isDark
		? lumaAt100 >= minContrast
		: lumaAt100 <= maxContrast;

	if (wouldBeGoodAt100) {
		// Se 100% resolve, vamos tentar achar um alpha intermediário seguro (ex: 80% ou o próprio 100%)
		// Para simplificar, sugerimos aumentar para 80% ou 100%
		// Vamos retornar 90% para garantir visibilidade com "transparência safe"
		return `${baseHex}E6`; // E6 = 90%
	}

	// 3. Se nem 100% resolve (a cor base é ruim), temos que MUDAR A COR (Shift RGB)
	// E forçamos Alpha alto para garantir que o shift funcione

	if (isDark) {
		// Fundo Escuro: deve ser claro
		if (color.substring(0, 7).toUpperCase() === '#000000') return '#FFFFFF';
		return shiftColor(baseHex, 150); // Shift na base (sem alpha)
	} else {
		// Fundo Claro: deve ser escuro
		if (color.substring(0, 7).toUpperCase() === '#FFFFFF') return '#000000';
		return shiftColor(baseHex, -150);
	}
}
