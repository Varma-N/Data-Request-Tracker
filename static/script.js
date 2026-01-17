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
    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active-tab'));
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
        <div class="request-card">
            <span class="request-title">${req.title}</span>
            <span class="status-badge status-${req.status.toLowerCase().replace(' ', '-')}"> ${req.status} </span>
            <span class="priority-badge ${priorityClass}">${req.priority}</span>
            
            <span class="request-description-label">Description:</span>
            <div class="request-description">${req.description}</div>
            
            <em>${new Date(req.created_at).toLocaleString()}</em>
            
            ${actions ? `<div class="action-buttons">${actions}</div>` : ''}
        </div>
    `;
    }).join('');
}

// Initial load
loadRequests();