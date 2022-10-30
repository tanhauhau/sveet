const inputElements = new Set(['input', 'textarea', 'select', 'button']);
export function isCurrentActiveElementInput() {
	return document.activeElement && inputElements.has(document.activeElement.tagName.toLowerCase());
}
