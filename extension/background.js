let lastExecutedUrl = '';
let executionTimeout = null;
let isMonitoring = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startMonitoring') {
        isMonitoring = true;
        sendResponse({ status: 'Monitoring started' });
    } else if (request.action === 'stopMonitoring') {
        isMonitoring = false;
        sendResponse({ status: 'Monitoring stopped' });
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!isMonitoring || changeInfo.status !== 'complete') return;

    let originalUrl = tab.url;
    let lowerCaseUrl = originalUrl.toLowerCase();

    if ((lowerCaseUrl.includes('join') || lowerCaseUrl.includes('sign') || lowerCaseUrl.includes('member') || lowerCaseUrl.includes('register')) && originalUrl !== lastExecutedUrl) {
        lastExecutedUrl = originalUrl;

        chrome.tabs.sendMessage(tabId, { action: 'showLoading' });

        clearTimeout(executionTimeout);
        executionTimeout = setTimeout(() => {
            lastExecutedUrl = '';
        }, 5000);

        fetch('http://127.0.0.1:5001/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: originalUrl })
        })
        .then(response => response.json())
        .then(data => {
            chrome.tabs.sendMessage(tabId, { action: 'hideLoading' });
            chrome.tabs.sendMessage(tabId, { action: "injectText", data: data });
        })
        .catch(error => {
            console.error('Fetch error:', error);
            chrome.tabs.sendMessage(tabId, { action: 'hideLoading' });
        });
    }
});
