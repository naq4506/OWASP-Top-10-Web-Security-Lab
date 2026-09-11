from flask import Blueprint, request, jsonify, session
from db import get_connection

a07_auth_bp = Blueprint('a07_auth', __name__, url_prefix='/api/a07')

TABLE = 'users'

def init_a07():
    """Table đã có sẵn trong DB, không cần tạo."""
    pass


# ── POST /api/a07/register ────────────────────────────────────────────────────
@a07_auth_bp.route('/register', methods=['POST'])
def register():
    data     = request.get_json(force=True)
    username = data.get('username', '')
    password = data.get('password', '')
    confirm  = data.get('confirm_password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if password != confirm:
        return jsonify({'error': 'Passwords do not match'}), 400

    conn   = get_connection()
    cursor = conn.cursor()

    # ── A07 VULNERABILITY ─────────────────────────────────────────────────────
    # COLLATE CS → "aDmin" ≠ "admin" → cho phép tạo tài khoản
    # ─────────────────────────────────────────────────────────────────────────
    cursor.execute(
        f'SELECT id FROM {TABLE} WHERE username COLLATE SQL_Latin1_General_CP1_CS_AS = ?',
        username
    )
    if cursor.fetchone():
        cursor.close(); conn.close()
        return jsonify({'error': 'Username already taken'}), 409

    try:
        cursor.execute(
            f'INSERT INTO {TABLE} (username, password, email) VALUES (?, ?, ?)',
            username, password, f'{username.strip()}@lab.local'
        )
        conn.commit()
    except Exception as e:
        cursor.close(); conn.close()
        return jsonify({'error': 'Registration failed', 'detail': str(e)}), 500

    cursor.close(); conn.close()
    return jsonify({'message': 'Account created successfully'}), 201


# ── POST /api/a07/login ───────────────────────────────────────────────────────
@a07_auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json(force=True)
    username = data.get('username', '')
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn   = get_connection()
    cursor = conn.cursor()

    # Bước 1: Xác thực đúng username + password
    cursor.execute(f"""
        SELECT id FROM {TABLE}
        WHERE  LTRIM(RTRIM(LOWER(username))) = LTRIM(RTRIM(LOWER(?)))
        AND    password = ?
    """, username, password)

    if not cursor.fetchone():
        cursor.close(); conn.close()
        return jsonify({'error': 'Invalid credentials'}), 401

    # ── A07 VULNERABILITY ─────────────────────────────────────────────────────
    # Bước 2: Resolve tài khoản thật bằng LOWER() + ORDER BY id ASC
    # LOWER("aDmin") = "admin" → lấy admin gốc (id=1) thay vì aDmin (id=1016)
    # → login response + session đều gán vào admin thật
    # ─────────────────────────────────────────────────────────────────────────
    cursor.execute(f"""
        SELECT id, username, password, email, role,
               is_active, salary, account_number, account_balance
        FROM   {TABLE}
        WHERE  LTRIM(RTRIM(LOWER(username))) = LTRIM(RTRIM(LOWER(?)))
        ORDER BY id ASC
    """, username)

    row = cursor.fetchone()   # → admin gốc (id=1)
    cursor.close(); conn.close()

    uid, uname, _, email, role, is_active, salary, acc_num, acc_balance = row

    session['a07_user_id']  = uid
    session['a07_username'] = username

    return jsonify({
        'message': 'Login successful',
        'user': {
            'id':              uid,
            'username':        uname,
            'email':           email,
            'role':            role,
            'is_active':       bool(is_active),
            'salary':          float(salary or 0),
            'account_number':  acc_num,
            'balance':         float(acc_balance or 0),
        }
    }), 200


# ── POST /api/a07/logout ──────────────────────────────────────────────────────
@a07_auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('a07_user_id',  None)
    session.pop('a07_username', None)
    return jsonify({'message': 'Logged out'}), 200


# ── GET /api/a07/me ───────────────────────────────────────────────────────────
@a07_auth_bp.route('/me', methods=['GET'])
def me():
    uname = session.get('a07_username')
    if not uname:
        return jsonify({'error': 'Not authenticated'}), 401

    conn   = get_connection()
    cursor = conn.cursor()

    # ── A07 VULNERABILITY ─────────────────────────────────────────────────────
    # LOWER("aDmin") = "admin" + ORDER BY id ASC → admin gốc (id=1)
    # ─────────────────────────────────────────────────────────────────────────
    cursor.execute(f"""
        SELECT id, username, email, role, is_active, salary, account_number, account_balance
        FROM   {TABLE}
        WHERE  LOWER(username) = LOWER(?)
        ORDER BY id ASC
    """, uname)

    row = cursor.fetchone()
    cursor.close(); conn.close()

    if not row:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id':             row[0],
        'username':       row[1],
        'email':          row[2],
        'role':           row[3],
        'is_active':      bool(row[4]),
        'salary':         float(row[5] or 0),
        'account_number': row[6],
        'balance':        float(row[7] or 0),
    }), 200