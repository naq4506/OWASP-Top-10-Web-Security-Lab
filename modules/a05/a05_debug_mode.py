from flask import request
from db import get_connection

def debug_login():

    secret_flag = "FLAG{DEBUG_MODE_ENABLED}"

    username = request.args.get("username")
    password = request.args.get("password")

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT *
    FROM userss
    WHERE username=?
    AND password=?
    """

    cursor.execute(query, (username, password))

    return "OK"