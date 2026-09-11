"""
A08: Software & Data Integrity Failures — JWT Algorithm Confusion Lab
=====================================================================
Intentionally vulnerable endpoint that demonstrates the alg:none bypass.

Blueprint:  a08_jwt_bp
Prefix:     /api/a08

Data source: SQL Server database `OWASP_LAB`, table `Users`
Columns expected: id, username, password, email, role, is_active,
                  salary, account_number, account_balance
(Adjust TABLE_NAME / column names below if your schema differs.)
"""

import json
import base64
import hashlib
import hmac
from flask import Blueprint, request, jsonify

from db import get_connection  # ← shared pyodbc connection helper

a08_jwt_bp = Blueprint('a08_jwt', __name__, url_prefix='/api/a08')

# ── Signing secret (only used for HS256) ─────────────────────────────────────
JWT_SECRET = 'super_secret_key_2026'
ADMIN_FLAG = 'FLAG{jwt_n0ne_4lg_byp4ss_m4st3r_2026}'

TABLE_NAME = 'Users'  # ← change this if your table has a different name/schema


# ── Database helpers ──────────────────────────────────────────────────────────

def fetch_user(username: str):
    """Fetch a single user row by username. Returns a dict or None."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT id, username, password, email, role, is_active,
                   salary, account_number, account_balance
            FROM {TABLE_NAME}
            WHERE username = ?
            """,
            (username,)
        )
        row = cur.fetchone()
        if not row:
            return None
        cols = [c[0] for c in cur.description]
        return dict(zip(cols, row))
    finally:
        conn.close()


def fetch_all_users():
    """Fetch every user row (password excluded) — used for the admin console."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT id, username, email, role, is_active,
                   salary, account_number, account_balance
            FROM {TABLE_NAME}
            """
        )
        cols = [c[0] for c in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()


# ── JWT helpers ───────────────────────────────────────────────────────────────

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def b64url_decode(s: str) -> bytes:
    s = s.replace('-', '+').replace('_', '/')
    padding = 4 - len(s) % 4
    if padding != 4:
        s += '=' * padding
    return base64.b64decode(s)


def sign_hs256(header_b64: str, payload_b64: str) -> str:
    msg = f'{header_b64}.{payload_b64}'.encode()
    sig = hmac.new(JWT_SECRET.encode(), msg, hashlib.sha256).digest()
    return b64url_encode(sig)


def create_token(username: str, role: str) -> str:
    import time
    header  = {'typ': 'JWT', 'alg': 'HS256'}
    payload = {'username': username, 'role': role, 'exp': int(time.time()) + 3600}
    h = b64url_encode(json.dumps(header, separators=(',', ':')).encode())
    p = b64url_encode(json.dumps(payload, separators=(',', ':')).encode())
    sig = sign_hs256(h, p)
    return f'{h}.{p}.{sig}'


def parse_token(token: str):
    """
    ── INTENTIONALLY VULNERABLE ──────────────────────────────────────
    The server reads the algorithm from the token header itself.
    If alg == 'none' it skips signature verification entirely,
    allowing an attacker to forge any payload without knowing the secret.
    """
    parts = token.split('.')
    if len(parts) != 3:
        return None, 'Malformed token: expected 3 parts'

    try:
        header  = json.loads(b64url_decode(parts[0]))
        payload = json.loads(b64url_decode(parts[1]))
    except Exception:
        return None, 'Failed to decode token segments'

    alg = header.get('alg', '').lower()

    # ── VULNERABILITY: alg:none is trusted ──────────────────────────
    if alg == 'none':
        return payload, None   # No signature check — payload trusted blindly

    # HS256 path — verify signature properly
    if alg == 'hs256':
        import time
        expected = sign_hs256(parts[0], parts[1])
        if not hmac.compare_digest(expected, parts[2]):
            return None, 'Signature verification failed'
        if time.time() > payload.get('exp', 0):
            return None, 'Token has expired'
        return payload, None

    return None, f'Unsupported algorithm: {alg}'


# ── Routes ────────────────────────────────────────────────────────────────────

@a08_jwt_bp.route('/login', methods=['POST'])
def login():
    """Normal login — issues a properly signed HS256 JWT, validated against the DB."""
    data     = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    try:
        user = fetch_user(username)
    except Exception as e:
        return jsonify({'error': f'Database error: {e}'}), 500

    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid username or password'}), 401

    token = create_token(username, user['role'])
    return jsonify({
        'token': token,
        'username': username,
        'role': user['role'],
        'email': user['email'],
    })


@a08_jwt_bp.route('/profile', methods=['GET'])
def profile():
    """
    Returns profile data for the token bearer, pulled live from the DB.
    Admin accounts additionally receive the flag and full user list.
    Vulnerable to alg:none bypass.
    """
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'Missing or malformed Authorization header'}), 401

    token = auth[7:]
    payload, err = parse_token(token)
    if err:
        return jsonify({'error': err}), 401

    username = payload.get('username', '')

    try:
        user = fetch_user(username)
    except Exception as e:
        return jsonify({'error': f'Database error: {e}'}), 500

    # alg:none + admin — attacker wins even without a real account record
    if not user and username == 'admin':
        try:
            user = fetch_user('admin')
        except Exception:
            user = None

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # ── Determine whether the bypass was used ───────────────────────
    header_raw = token.split('.')[0]
    try:
        header = json.loads(b64url_decode(header_raw))
        used_none = header.get('alg', '').lower() == 'none'
    except Exception:
        used_none = False

    resp = {
        'username':        username,
        'email':           user['email'],
        'role':            user['role'],
        'salary':          user['salary'],
        'account_number':  user['account_number'],
        'account_balance': user['account_balance'],
        'vulnerability_triggered': used_none,
    }

    if user['role'] == 'admin' or username == 'admin':
        resp['flag'] = ADMIN_FLAG
        try:
            resp['users'] = fetch_all_users()
        except Exception as e:
            resp['users'] = []
            resp['users_error'] = str(e)

    return jsonify(resp)


@a08_jwt_bp.route('/verify-flag', methods=['POST'])
def verify_flag():
    """Optional: let the frontend check a submitted flag server-side."""
    data = request.get_json(silent=True) or {}
    submitted = data.get('flag', '').strip()
    if submitted == ADMIN_FLAG:
        return jsonify({'correct': True,  'message': 'Flag verified! alg:none bypass successful.'})
    return jsonify({'correct': False, 'message': 'Incorrect flag. Keep trying!'}), 400