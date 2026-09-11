"""
modules/a02/a02_weak_hash.py
────────────────────────────
OWASP A02:2021 – Cryptographic Failures
Vulnerable e-commerce database with MD5-hashed passwords.

Reads from REAL database (SQL Server, OWASP_LAB.dbo.users).
Run sql/a02_setup.sql once to create and seed the table.

Routes:
  GET  /api/a02/users          → return all users (with hashes exposed)
  POST /api/a02/login          → login using plaintext → MD5 compare (vulnerable)
  GET  /api/a02/users/<int:id> → return single user profile
  POST /api/a02/crack          → demo: try cracking a hash against a wordlist
  GET  /api/a02/compare        → static reference table of hash algorithms
"""

import hashlib
from flask import Blueprint, jsonify, request

from db import get_connection

a02_weak_hash_bp = Blueprint("a02_weak_hash", __name__)


def md5(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


# ── Wordlist for the /crack demo endpoint ────────────────────────────
WORDLIST = [
    "admin", "password", "123456", "12345678", "12345", "iloveyou",
    "admin123", "qwerty", "abc123", "monkey", "letmein",
    "111111", "sunshine", "princess", "welcome", "shadow",
    "123123", "dragon", "master", "hello", "freedom", "superman",
    "trustno1", "batman", "access", "mustang", "michael",
    "jessica", "charlie", "donald", "password1", "qwerty123",
    # Extra common passwords to cover more realistic scenarios
    "user123", "password123", "guest", "super_secret_password_2026_##",
    "lananh123", "quandev99", "encrypted_password_abc123",
]

_SELECT_COLUMNS = "id, username, password, email, role, is_active, salary, account_number, account_balance"


# ── Data access helpers ──────────────────────────────────────────────

def _rows_to_dicts(cursor, rows):
    cols = [c[0] for c in cursor.description]
    return [dict(zip(cols, row)) for row in rows]


def _fetch_all_users():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT {_SELECT_COLUMNS} FROM dbo.users ORDER BY id")
        return _rows_to_dicts(cur, cur.fetchall())
    finally:
        conn.close()


def _fetch_user_by_id(user_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT {_SELECT_COLUMNS} FROM dbo.users WHERE id = ?", user_id)
        row = cur.fetchone()
        return _rows_to_dicts(cur, [row])[0] if row else None
    finally:
        conn.close()


def _fetch_user_by_username(username: str):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT {_SELECT_COLUMNS} FROM dbo.users WHERE username = ?", username)
        row = cur.fetchone()
        return _rows_to_dicts(cur, [row])[0] if row else None
    finally:
        conn.close()


def _safe_user(user: dict, include_sensitive: bool = True) -> dict:
    """
    Return a user dict for the API response.
    include_sensitive=True simulates the data leak:
      - exposes the raw password (stored in plaintext in this table)
      - exposes salary, account_number, account_balance
    """
    # Compute MD5 hash of the stored password for the demo
    raw_password = user.get("password", "")
    password_hash = md5(raw_password) if raw_password else ""

    out = {
        "id":         user["id"],
        "username":   user["username"],
        "email":      user["email"],
        "role":       user["role"],
        "is_active":  user["is_active"],
        "algo":       "MD5",
    }
    if include_sensitive:
        # ⚠️  VULNERABILITY: sensitive fields exposed in API response
        out["password"]         = raw_password          # plaintext leak
        out["password_hash"]    = password_hash         # MD5 of above
        out["salary"]           = user.get("salary")
        out["account_number"]   = user.get("account_number")
        out["account_balance"]  = str(user.get("account_balance", ""))
    return out


def _db_error_response(exc: Exception):
    return jsonify({
        "error":  "Database error",
        "detail": str(exc),
        "hint":   "Is SQL Server running and has sql/a02_setup.sql been executed against OWASP_LAB?",
    }), 500


# ── Routes ───────────────────────────────────────────────────────────

@a02_weak_hash_bp.route("/api/a02/users", methods=["GET"])
def get_all_users():
    """
    VULNERABILITY: returns plaintext passwords AND MD5 hashes for all users,
    plus sensitive financial data. A real API must never expose any of this.
    """
    try:
        users = _fetch_all_users()
    except Exception as exc:
        return _db_error_response(exc)

    return jsonify({
        "database": "OWASP_LAB",
        "table":    "dbo.users",
        "note":     "[LEAK] Passwords stored in plaintext; MD5 hashes computed on-the-fly. Financial data exposed.",
        "users":    [_safe_user(u) for u in users],
    })


@a02_weak_hash_bp.route("/api/a02/users/<int:user_id>", methods=["GET"])
def get_user(user_id: int):
    """Return single user profile — sensitive fields still exposed (vulnerability)."""
    try:
        user = _fetch_user_by_id(user_id)
    except Exception as exc:
        return _db_error_response(exc)

    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(_safe_user(user))


@a02_weak_hash_bp.route("/api/a02/login", methods=["POST"])
def login():
    """
    VULNERABILITY: compares MD5(input_password) against MD5(stored_plaintext).
    No salt, no cost factor — trivially reversible.
    """
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    try:
        user = _fetch_user_by_username(username)
    except Exception as exc:
        return _db_error_response(exc)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # ⚠️  Compare MD5 of input against MD5 of stored plaintext
    if md5(password) != md5(user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user":    _safe_user(user, include_sensitive=False),
        "token":   f"INSECURE_TOKEN_{user['id']}_{user['role']}",
        "warning": "Authentication uses MD5 — no salt, no cost factor.",
    })


@a02_weak_hash_bp.route("/api/a02/crack", methods=["POST"])
def crack_hash():
    """
    Educational endpoint: dictionary-attack a given MD5 hash using the built-in wordlist.
    Client supplies the hash; this endpoint does the matching.
    """
    data = request.get_json(silent=True) or {}
    target_hash = data.get("hash", "").strip().lower()

    if len(target_hash) != 32:
        return jsonify({"error": "Provide a valid 32-char MD5 hash"}), 400

    attempts = 0
    for word in WORDLIST:
        attempts += 1
        if md5(word) == target_hash:
            return jsonify({
                "cracked":       True,
                "hash":          target_hash,
                "password":      word,
                "attempts":      attempts,
                "wordlist_size": len(WORDLIST),
                "note": (
                    f"Found in {attempts} attempts. "
                    "Real tools test billions of hashes per second on GPU."
                ),
            })

    return jsonify({
        "cracked":       False,
        "hash":          target_hash,
        "attempts":      attempts,
        "wordlist_size": len(WORDLIST),
        "note": "Not in demo wordlist. Real wordlists contain 14M+ entries.",
    })


@a02_weak_hash_bp.route("/api/a02/compare", methods=["GET"])
def compare_algos():
    """Returns a comparison table of password hashing algorithms."""
    return jsonify([
        {"name": "MD5",     "year": 1992, "bits": 128, "gpu_speed": "~10B/s",  "has_salt": False, "safe": False, "note": "Broken — never use for passwords"},
        {"name": "SHA-1",   "year": 1995, "bits": 160, "gpu_speed": "~4B/s",   "has_salt": False, "safe": False, "note": "Deprecated — collision attacks exist"},
        {"name": "SHA-256", "year": 2001, "bits": 256, "gpu_speed": "~1B/s",   "has_salt": False, "safe": False, "note": "Fast = vulnerable to brute-force"},
        {"name": "bcrypt",  "year": 1999, "bits": 184, "gpu_speed": "~25K/s",  "has_salt": True,  "safe": True,  "note": "Adaptive cost factor — recommended"},
        {"name": "Argon2",  "year": 2015, "bits": 256, "gpu_speed": "~100/s",  "has_salt": True,  "safe": True,  "note": "PHC winner — best choice today"},
    ])