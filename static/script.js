let currentFilter = 'open';

document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;

    const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority })
    });

    if (res.ok) {
        alert('Request submitted!');
        document.getElementById('requestForm').reset();
        loadRequests();
    } else {
        alert('Error submitting request');
    }
});

async function updateStatus(id, status) {
    const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (res.ok) loadRequests();
}

function filterRequests(filter) {
    currentFilter = filter;
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active-tab'));
    if (filter === 'open') {
        document.getElementById('tab-open').classList.add('active-tab');
    } else {
        document.getElementById('tab-closed').classList.add('active-tab');
    }
    loadRequests();
}

function isRequestOpen(status) {
    return ['Submitted', 'Under Review', 'Accepted'].includes(status);
}

async function loadRequests() {
    const res = await fetch('/api/requests');
    const requests = await res.json();

    const filtered = requests.filter(req =>
        currentFilter === 'open' ? isRequestOpen(req.status) : !isRequestOpen(req.status)
    );

    const listDiv = document.getElementById('requestsList');
    if (filtered.length === 0) {
        listDiv.innerHTML = `<p>No ${currentFilter} requests.</p>`;
        return;
    }

    listDiv.innerHTML = filtered.map(req => {
        // Priority badge
        let priorityClass = '';
        if (req.priority === 'High') priorityClass = 'priority-high';
        else if (req.priority === 'Medium') priorityClass = 'priority-medium';
        else priorityClass = 'priority-low';

        let actions = '';
        if (req.status === 'Submitted') {
            actions = `
            <button onclick="updateStatus(${req.id}, 'Accepted')">Accept</button>
            <button onclick="updateStatus(${req.id}, 'Rejected')">Reject</button>
        `;
        } else if (req.status === 'Accepted') {
            actions = `<button onclick="updateStatus(${req.id}, 'Completed')">Mark Complete</button>`;
        }

        return `
        <article class="request-card">
            <header class="card-header">
                <div class="header-main">
                    <h3 class="card-title">${req.title}</h3>
                    <div class="card-badges">
                        <span class="priority-badge ${priorityClass}">${req.priority}</span>
                        <span class="status-badge status-${req.status.toLowerCase().replace(' ', '-')}">${req.status}</span>
                    </div>
                </div>
            </header>
            
            <div class="card-body">
                <div class="description-section">
                    <span class="meta-label">Description</span>
                    <p class="description-text">${req.description}</p>
                </div>
            </div>
            
            <footer class="card-footer">
                <div class="meta-info">
                    <span class="timestamp">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${new Date(req.created_at).toLocaleString()}
                    </span>
                </div>
                ${actions ? `<div class="action-buttons">${actions}</div>` : ''}
            </footer>
        </article>
    `;
    }).join('');
}

// Initial load
loadRequests();