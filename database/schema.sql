CREATE TABLE IF NOT EXISTS data_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    status TEXT CHECK(status IN ('Submitted', 'Under Review', 'Accepted', 'Rejected', 'Completed')) DEFAULT 'Submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);