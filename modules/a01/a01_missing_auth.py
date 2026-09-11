# modules/a01_missing_auth.py

from flask import request, session, redirect

from db import get_connection

# fake deleted users
DELETED_USERS = set()

# ====================================
# MISSING AUTHORIZATION
# ====================================

def delete_user():

    # only check login
    # NO authorization check

    if "user_id" not in session:
        return redirect("/")

    user_id = request.args.get("id", "")

    conn = get_connection()
    cursor = conn.cursor()

    query = f"""
    SELECT username
    FROM users
    WHERE id = {user_id}
    """

    print(query)

    cursor.execute(query)

    user = cursor.fetchone()

    conn.close()

    if not user:
        return "<h1>User not found</h1>"

    deleted_username = user[0]

    # fake delete
    DELETED_USERS.add(deleted_username)

    return f"""
    <h1>User Deleted</h1>

    <p>User:
    {deleted_username}</p>

    <p>Deleted by:
    {session['username']}</p>

    <p>Role:
    {session['role']}</p>

    <hr>

    <p>
    Simulated delete operation
    </p>
    """