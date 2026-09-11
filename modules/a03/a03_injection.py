from flask import Blueprint, request, jsonify
from db import get_connection

a03_injection_bp = Blueprint('a03_injection', __name__, url_prefix='/api/a03')


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: cursor rows → list of plain dicts
# ─────────────────────────────────────────────────────────────────────────────
def fetchall_as_dict(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def serialise_row(row: dict) -> dict:
    """Convert Decimal / non-JSON types to JSON-safe values."""
    out = {}
    for k, v in row.items():
        if v is None:
            out[k] = None
        elif isinstance(v, bool):
            out[k] = v
        elif isinstance(v, (int, float)):
            out[k] = v
        elif isinstance(v, str):
            out[k] = v
        else:
            # Decimal, datetime, etc.
            try:
                out[k] = float(v)
            except Exception:
                out[k] = str(v)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/a03/products
#   ?category=Electronics  →  VULNERABLE string concat (filter bypass)
#   ?search=laptop         →  VULNERABLE string concat (UNION inject)
#   (none)                 →  safe — only visible products
# ─────────────────────────────────────────────────────────────────────────────
@a03_injection_bp.route('/products', methods=['GET'])
def get_products():
    category = request.args.get('category', '')
    search   = request.args.get('search', '')

    try:
        conn   = get_connection()
        cursor = conn.cursor()

        if category:
            # NOTE: still string-concatenated (vulnerable on purpose), but normal
            # category browsing must not leak hidden rows — only an explicit
            # boolean-bypass injection (e.g. ' OR '1'='1'-- ) should do that.
            sql = (
                "SELECT id, name, description, price, category, is_hidden "
                "FROM products "
                "WHERE category = '" + category + "' AND is_hidden = 0"
            )
        elif search:
            # NOTE: still string-concatenated (vulnerable on purpose), but a
            # plain text search must not leak hidden rows on its own — only an
            # explicit boolean-bypass / UNION injection should do that (the
            # trailing "-- " in those payloads comments out the AND clause).
            sql = (
                "SELECT id, name, description, price, category, is_hidden "
                "FROM products "
                "WHERE name LIKE '%" + search + "%' AND is_hidden = 0"
            )
        else:
            sql = (
                "SELECT id, name, description, price, category, is_hidden "
                "FROM products WHERE is_hidden = 0"
            )

        cursor.execute(sql)
        rows = [serialise_row(r) for r in fetchall_as_dict(cursor)]
        conn.close()
        return jsonify({'products': rows}), 200

    except Exception as e:
        # Intentionally verbose — supports error-based SQLi discovery
        return jsonify({'error': str(e), 'products': []}), 200


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/a03/categories  — safe endpoint for sidebar
# ─────────────────────────────────────────────────────────────────────────────
@a03_injection_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT category FROM products WHERE is_hidden = 0 ORDER BY category"
        )
        cats = [row[0] for row in cursor.fetchall()]
        conn.close()
        return jsonify({'categories': cats}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'categories': []}), 200


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/a03/login
#   Body: { "username": "...", "password": "..." }
#   VULNERABLE: raw concat — ' OR '1'='1'-- bypasses auth.
#   Uses SELECT * so it works regardless of the exact users table schema.
#   The full first row is returned intentionally so students see admin's password.
# ─────────────────────────────────────────────────────────────────────────────
@a03_injection_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json(force=True)
    username = data.get('username', '')
    password = data.get('password', '')

    try:
        conn   = get_connection()
        cursor = conn.cursor()

        # VULNERABLE — intentional for lab
        sql = (
            "SELECT * FROM users "
            "WHERE username = '" + username + "' "
            "AND password = '" + password + "'"
        )

        cursor.execute(sql)
        rows = fetchall_as_dict(cursor)
        conn.close()

        if rows:
            return jsonify({
                'success': True,
                'user': serialise_row(rows[0])   # full row, intentionally exposed
            }), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 200