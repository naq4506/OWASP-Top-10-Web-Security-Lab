# modules/a01_admin_bypass.py

from flask import request, session, redirect

from db import get_connection

# ====================================
# LOGIN
# ====================================

def admin_login():

    username = request.args.get("username", "")

    conn = get_connection()
    cursor = conn.cursor()

    query = f"""
    SELECT id, username, role
    FROM users
    WHERE username = '{username}'
    """

    cursor.execute(query)

    user = cursor.fetchone()

    conn.close()

    if not user:
        return "<h1>Login Failed</h1>"

    # fake session
    session["user_id"] = user[0]
    session["username"] = user[1]
    session["role"] = user[2]

    return f"""
    <h1>Login Success</h1>

    <p>Logged in as:
    {user[1]}</p>

    <p>Real session role:
    {user[2]}</p>

    <hr>

    <a href="/admin_panel/user">
        Go To Admin Panel
    </a>
    """

# ====================================
# ADMIN PANEL
# ====================================

def admin_panel(role):

    # must login first
    if "user_id" not in session:
        return redirect("/")

    # VULNERABLE:
    # trust role from URL
    if role == "admin":

        return f"""
        <h1>Admin Panel</h1>

        <p>Logged in user:
        {session['username']}</p>

        <p>Session role:
        {session['role']}</p>

        <p>Role from URL:
        {role}</p>

        <hr>

        <h2>Admin Actions</h2>

        <ul>

            <li>
                <a href="/delete_user?id=1">
                    Delete Admin
                </a>
            </li>

            <li>
                <a href="/delete_user?id=2">
                    Delete User
                </a>
            </li>

        </ul>
        """

    return f"""
    <h1>Access Denied</h1>

    <p>Logged in user:
    {session['username']}</p>

    <p>Session role:
    {session['role']}</p>

    <p>Role from URL:
    {role}</p>

    <hr>

    <p>You are not admin</p>

    <p>
    Try changing URL:
    /admin_panel/admin
    </p>
    """