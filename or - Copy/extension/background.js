const RAG_URL_KEY = 'rag_url';
const DEPT_KEY = 'department';

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'ask-company-ai',
		title: 'Ask Company AI',
		contexts: ['selection']
	});
});

async function getSettings() {
	return new Promise(resolve => {
		chrome.storage.sync.get([RAG_URL_KEY, DEPT_KEY], (result) => {
			resolve({
				ragUrl: result[RAG_URL_KEY] || 'http://localhost:8000/query',
				department: result[DEPT_KEY] || ''
			});
		});
	});
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId !== 'ask-company-ai' || !info.selectionText) return;
	const { ragUrl, department } = await getSettings();
	try {
		const resp = await fetch(ragUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ question: info.selectionText, department: department || undefined })
		});
		const data = await resp.json();
		const answer = data.answer || 'No answer.';
		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'icon128.png',
			title: 'Company AI',
			message: answer.substring(0, 2000)
		});
	} catch (e) {
		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'icon128.png',
			title: 'Company AI Error',
			message: String(e)
		});
	}
}); 