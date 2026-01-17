import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'requests.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    with open(os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql'), 'r') as f:
        cursor.executescript(f.read())
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # enables dict-like access
    return conn