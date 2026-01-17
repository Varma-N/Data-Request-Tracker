from flask import Flask, request, jsonify, render_template
import os
from database import init_db, get_db_connection

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(
    __name__,
    static_folder=os.path.join(PROJECT_ROOT, 'static'),   # <-- Point to root/static
    template_folder=os.path.join(PROJECT_ROOT, 'frontend') # <-- Point to root/frontend
)


# Initialize DB on first run
if not os.path.exists('../requests.db'):
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/requests', methods=['GET'])
def get_requests():
    conn = get_db_connection()
    requests = conn.execute('SELECT * FROM data_requests ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in requests])

@app.route('/api/requests', methods=['POST'])
def create_request():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    priority = data.get('priority', 'Medium')

    if not title or not description:
        return jsonify({'error': 'Title and description required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO data_requests (title, description, priority) VALUES (?, ?, ?)',
        (title, description, priority)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': new_id, 'message': 'Request submitted'}), 201

@app.route('/api/requests/<int:request_id>/status', methods=['PATCH'])
def update_request_status(request_id):
    data = request.get_json()
    new_status = data.get('status')
    
    valid_statuses = ['Submitted', 'Under Review', 'Accepted', 'Rejected', 'Completed']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400

    conn = get_db_connection()
    # Optional: add business logic (e.g., only accept from Submitted)
    conn.execute(
        'UPDATE data_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        (new_status, request_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Status updated'}), 200

if __name__ == '__main__':
    app.run(debug=True)