// Tiện ích chung cho bản đồ
// downloadJSON: tải object dưới dạng file json
// getRandomColor: sinh màu rgba ngẫu nhiên
// copyToClipboard: copy text và trả về promise

export function downloadJSON(data, filename = 'data.json') {
	try {
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		return true;
	} catch (e) {
		console.error('downloadJSON error', e);
		return false;
	}
}

export function getRandomColor(alpha = 1) {
	const r = Math.floor(Math.random() * 255);
	const g = Math.floor(Math.random() * 255);
	const b = Math.floor(Math.random() * 255);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export async function copyToClipboard(text) {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
		// Fallback
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand('copy');
		document.body.removeChild(textarea);
		return true;
	} catch (e) {
		console.error('copyToClipboard error', e);
		return false;
	}
}

export function parseLatLngString(str) {
	if (!str) return null;
	const m = str.trim().match(/^(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
	if (!m) return null;
	const a = parseFloat(m[1]);
	const b = parseFloat(m[2]);
	if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lng: b };
	if (Math.abs(a) <= 180 && Math.abs(b) <= 90) return { lat: b, lng: a };
	return null;
}

export function formatLatLng(lat, lng, digits = 6) {
	if (typeof lat !== 'number' || typeof lng !== 'number') return '';
	return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`;
}

