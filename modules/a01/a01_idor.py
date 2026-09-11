"""
A01: Broken Access Control — IDOR vulnerable endpoint.

Register this blueprint in app.py:

    from modules.a01.a01_idor import a01_idor_bp
    app.register_blueprint(a01_idor_bp)
"""

from flask import Blueprint, request, jsonify
from db import get_connection

a01_idor_bp = Blueprint("a01_idor", __name__, url_prefix="/api/a01")


@a01_idor_bp.route("/profile", methods=["GET"])
@a01_idor_bp.route("/users/<int:user_id>/profile", methods=["GET"])
def get_profile(user_id=None):
    # === VULNERABLE IDOR ENDPOINT ===
    # No authentication, no ownership check — trusts user_id from the request.
    if user_id is None:
        user_id = request.args.get("user_id", type=int)

    if user_id is None:
        return jsonify({"error": "Missing user_id parameter"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        # NOTE: Intentionally vulnerable pattern (no ownership check) to
        # demonstrate IDOR — DO NOT use in production.
        cursor.execute(
            "SELECT id, username, account_number, account_balance "
            "FROM users WHERE id = ?",
            user_id,
        )
        row = cursor.fetchone()
        conn.close()

        if row is None:
            return jsonify({"error": "User Profile Not Found"}), 404

        result = {
            "id": row[0],
            "username": row[1],
            "account_number": row[2],
            "account_balance": float(row[3]),
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500