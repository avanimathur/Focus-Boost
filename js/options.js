document.addEventListener('DOMContentLoaded', () => {
  loadDynamicBlockedSites();

  document.getElementById('add-website-button').addEventListener('click', () => {
    const input = document.getElementById('new-website');
    const domain = input.value.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (!domain) return;

    addNewBlockedDomain(domain);
    input.value = '';
  });
});

function loadDynamicBlockedSites() {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const textarea = document.getElementById('blocked-sites');
    const domains = rules.map(rule => rule.condition.domains?.[0] || 'Unknown');
    textarea.value = domains.join('\n');
  });
}

function addNewBlockedDomain(domain) {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const existingIds = rules.map(r => r.id);
    const newId = Math.max(100, ...existingIds) + 1; 

    const newRule = {
      id: newId,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `||${domain}^`,
        domains: [domain],
        resourceTypes: ["main_frame"]
      }
    };

    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [newRule],
      removeRuleIds: []
    }, () => {
      document.getElementById('status').textContent = `Blocked: ${domain}`;
      loadDynamicBlockedSites(); // refresh UI
    });
  });
}
