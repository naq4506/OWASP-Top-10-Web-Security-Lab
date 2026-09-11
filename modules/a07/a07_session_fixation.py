# modules/a07_session_fixation.py

from flask import request

from db import get_connection

# fake session storage
SESSIONS = {}

def session_fixation_login():

    username = request.args.get("username", "")
    password = request.args.get("password", "")

    # attacker-controlled session id
    session_id = request.args.get("session_id", "")

    conn = get_connection()
    cursor = conn.cursor()

    query = f"""
    SELECT * FROM users
    WHERE username = '{username}'
    AND password = '{password}'
    """

    print(query)

    try:

        cursor.execute(query)

        user = cursor.fetchone()

        if user:

            # ====================================
            # VULNERABILITY:
            # session is NOT regenerated
            # after login
            # ====================================

            SESSIONS[session_id] = user.username

            result = f"""
            <h1>Login Success</h1>

            <p>
            Logged in as:
            {user.username}
            </p>

            <p>
            Session ID:
            {session_id}
            </p>

            <p style="color:red;">
            Session was NOT regenerated.
            </p>

            <hr>

            <a href="/a07/session/profile?session_id={session_id}">
            Open Profile
            </a>

            <hr>

            <h3>
            FLAG{{SESSION_FIXATION}}
            </h3>
            """

        else:

            result = """
            <h1>Login Failed</h1>
            """

    except Exception as e:

        result = f"""
        <h2>SQL Error</h2>

        <pre>{e}</pre>
        """

    conn.close()

    return result


def session_profile():

    session_id = request.args.get("session_id", "")

    username = SESSIONS.get(session_id)

    if username:

        return f"""
        <h1>User Profile</h1>

        <p>
        Logged in as:
        {username}
        </p>

        <p>
        Session ID:
        {session_id}
        </p>

        <hr>

        <h3>
        FLAG{{SESSION_HIJACKED}}
        </h3>
        """

    return """
    <h1>Invalid Session</h1>

    <p>
    No user bound to this session.
    </p>
    """