# modules/a03_injection.py

from flask import request
from db import get_connection

def search_products():

    q = request.args.get("q", "")

    conn = get_connection()
    cursor = conn.cursor()

    query = f"""
    SELECT id, name, price
    FROM products
    WHERE name LIKE '%{q}%'
    """

    print(query)

    try:

        cursor.execute(query)

        rows = cursor.fetchall()

        result = "<h1>A03 UNION SQL Injection Lab</h1>"

        result += f"<p>Search: {q}</p>"

        for row in rows:

            result += f"""
            <p>ID: {row[0]}</p>
            <p>Name: {row[1]}</p>
            <p>Price: {row[2]}</p>
            <hr>
            """

    except Exception as e:

        result = f"""
        <h2>SQL Error</h2>
        <pre>{e}</pre>
        """

    conn.close()

    return result