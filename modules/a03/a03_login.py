from flask import request

from db import get_connection

# import fake deleted users
from modules.a01.a01_missing_auth import DELETED_USERS

def do_login():

    username = request.args.get("username", "")
    password = request.args.get("password", "")

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

            # fake deleted check
            if user.username in DELETED_USERS:

                result = f"""
                <h1>Login Failed</h1>

                <p>
                User '{user.username}' was deleted
                </p>
                """

            else:

                result = f"""
                <h1>Login Success</h1>

                <p>Username: {user.username}</p>
                <p>Role: {user.role}</p>
                <p>Email: {user.email}</p>
                """

        else:

            result = "<h1>Login Failed</h1>"

    except Exception as e:

        result = f"""
        <h2>SQL Error:</h2>

        <pre>{e}</pre>
        """

    conn.close()

    return result