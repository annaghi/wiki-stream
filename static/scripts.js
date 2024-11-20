// State management
const state = {
    stats: {
        changes: 0,
        users: new Set(),
        wikis: new Set()
    }
};

// DOM Elements
const elements = {
    status: document.getElementById('status'),
    changeCount: document.getElementById('change-count'),
    userCount: document.getElementById('user-count'),
    wikiCount: document.getElementById('wiki-count'),
    changes: document.getElementById('changes')
};

// Utility functions
const utils = {
    formatTimestamp: (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    },

    updateStats: () => {
        elements.changeCount.textContent = state.stats.changes;
        elements.userCount.textContent = state.stats.users.size;
        elements.wikiCount.textContent = state.stats.wikis.size;
    },

    createChangeElement: (data) => {
        const changeDiv = document.createElement('div');
        changeDiv.className = 'p-4 hover:bg-gray-50 transition-colors';
        changeDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-medium">${data.title}</div>
                    <div class="text-sm text-gray-600">
                        Edited by ${data.user} on ${data.wiki}
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    ${utils.formatTimestamp(data.timestamp)}
                </div>
            </div>
        `;
        return changeDiv;
    },

    updateConnectionStatus: (connected) => {
        elements.status.textContent = connected ? 'Connected' : 'Disconnected';
        elements.status.className = `text-sm font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`;
    }
};

// Event handlers
const handlers = {
    onMessage: (event) => {
        const data = JSON.parse(event.data);
        
        // Update statistics
        state.stats.changes++;
        state.stats.users.add(data.user);
        state.stats.wikis.add(data.wiki);
        utils.updateStats();

        // Create and insert new change element
        const changeElement = utils.createChangeElement(data);
        elements.changes.insertBefore(changeElement, elements.changes.firstChild);

        // Prune old changes
        if (elements.changes.children.length > 100) {
            elements.changes.removeChild(elements.changes.lastChild);
        }
    },

    onError: () => {
        utils.updateConnectionStatus(false);
    },

    onOpen: () => {
        utils.updateConnectionStatus(true);
    }
};

// Initialize EventSource and attach handlers
function initializeEventSource() {
    const eventSource = new EventSource('/wiki-stream');
    eventSource.onmessage = handlers.onMessage;
    eventSource.onerror = handlers.onError;
    eventSource.onopen = handlers.onOpen;
}

// Start the application
initializeEventSource();
