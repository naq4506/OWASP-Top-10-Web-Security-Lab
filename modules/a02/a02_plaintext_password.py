from flask import Blueprint, request
from db import get_connection

a02_plaintext = Blueprint("a02_plaintext", __name__)


# =========================
# 1. VIEW DATABASE (DEMO LỖI)
# =========================
@a02_plaintext.route("/a02/plaintext/db")
def view_users():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT username, password FROM users")
    rows = cursor.fetchall()

    conn.close()

    result = "<h2> A02 - Plain Text Password Storage</h2>"
    result += "<p>⚠ Password are stored WITHOUT encryption</p><hr>"

    for r in rows:
        result += f"{r[0]} | {r[1]}<br>"

    return result


# =========================
# 2. LOGIN DEMO
# =========================
@a02_plaintext.route("/a02/plaintext/login", methods=["GET", "POST"])
def a02_login():
    if request.method == "GET":
        return """
        <h2>A02 Login</h2>
        <form method="POST">
            Username: <input name="username"><br>
            Password: <input name="password"><br>
            <button type="submit">Login</button>
        </form>
        """

    username = request.form.get("username")
    password = request.form.get("password")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
    )

    user = cursor.fetchone()
    conn.close()

    if user:
        return f"""
        <h3> Login Success</h3>
        <p>User: {username}</p>
        <a href="/a02/plaintext/db">View DB</a>
        """

    return "<h3> Login Failed</h3>"